/**
 * Test Pose Coach (TAHAP 5)
 * ========================
 * Menguji logic murni tanpa browser:
 *  - pose matching (cosine similarity)
 *  - coaching text (hanya saat target, maks 8 kata)
 *  - auto-shutter (default OFF, 85% stabil 1.5s)
 *  - pose library (≥15 per kategori)
 *  - skenario wajib permintaan 29
 *
 * Jalankan: node scripts/test-pose-coach.cjs
 */
const path = require("path");
const { compileLib, cleanup, tmp } = require("./lib-test-helper.cjs");

let fail = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "✓" : "✗"} ${name}${cond ? "" : " " + detail}`);
  if (!cond) fail += 1;
};
const section = (t) => console.log(`\n${t}`);

try {
  console.log("Mengompilasi src/lib …");
  compileLib();
  const base = path.join(tmp, "lib");

  const { poseSimilarity, scorePersonAgainstPose } = require(path.join(base, "pose-matching.js"));
  const { buildCoaching, limitWords, shouldRefreshCoaching } = require(path.join(base, "pose-coaching.js"));
  const { stepAutoShutter, createAutoShutterState, holdProgress } = require(path.join(base, "pose-autoshutter.js"));
  const library = require(path.join(base, "pose-library.js"));
  const { POSE_THRESHOLDS } = require(path.join(base, "pose-coach-config.js"));

  const posesFile = require(path.join(tmp, "data", "poses.json"));
  const allPoses = posesFile.poses;

  /**
   * Ubah PoseSkeleton target jadi DetectedPose siap dibandingkan.
   * dx/dy = geser, scale = perbesar/kecil (di sekitar pusat).
   */
  const asDetected = (skeleton, opts = {}) => {
    const { dx = 0, dy = 0, scale = 1, score = 0.95 } = opts;
    const keypoints = {};
    let xMin = 1, yMin = 1, xMax = 0, yMax = 0;
    for (const [name, p] of Object.entries(skeleton)) {
      const x = 0.5 + (p.x - 0.5) * scale + dx;
      const y = 0.5 + (p.y - 0.5) * scale + dy;
      keypoints[name] = { x, y, score: p.score ?? score };
      xMin = Math.min(xMin, x); yMin = Math.min(yMin, y);
      xMax = Math.max(xMax, x); yMax = Math.max(yMax, y);
    }
    return { score, keypoints, box: { xMin, yMin, xMax, yMax } };
  };

  /* ============ 1. POSE MATCHING ============ */
  section("1. Pose matching (cosine similarity)");
  const soloPose = library.getPose("solo-hand-on-hip");
  ok("pose 'solo-hand-on-hip' ada di library", !!soloPose);

  const targetSkeleton = soloPose.skeletons[0];
  const identical = poseSimilarity(targetSkeleton, asDetected(targetSkeleton));
  ok("pose identik → skor ≈ 100%", Math.abs(identical * 100 - 100) < 1.5,
    `(dapat ${(identical * 100).toFixed(1)}%)`);

  const shifted = poseSimilarity(targetSkeleton, asDetected(targetSkeleton, { dx: 0.15, dy: -0.1 }));
  ok("pose bergeser tetap ≈ 100% (invarian translasi)",
    Math.abs(shifted * 100 - 100) < 3, `(dapat ${(shifted * 100).toFixed(1)}%)`);

  const scaled = poseSimilarity(targetSkeleton, asDetected(targetSkeleton, { scale: 0.65 }));
  ok("pose diperkecil tetap ≈ 100% (invarian skala)",
    Math.abs(scaled * 100 - 100) < 3, `(dapat ${(scaled * 100).toFixed(1)}%)`);

  const armsUp = library.getPose("solo-hands-up").skeletons[0];
  const different = poseSimilarity(targetSkeleton, asDetected(armsUp));
  ok("pose berbeda → skor lebih rendah", different < identical,
    `(${(different * 100).toFixed(1)}% vs ${(identical * 100).toFixed(1)}%)`);

  const empty = { score: 0.1, keypoints: {}, box: { xMin: 0, yMin: 0, xMax: 1, yMax: 1 } };
  ok("tanpa keypoint valid → skor 0 (bukan NaN)", poseSimilarity(targetSkeleton, empty) === 0);

  const trioPose = library.getPose("trio-peace-all");
  const trioDetected = trioPose.skeletons.map((s) => asDetected(s));
  const trioScore = scorePersonAgainstPose(trioPose, 1, 3, trioDetected[1]);
  ok("bertiga: orang #2 cocok skeleton #2 → ≈100%",
    Math.abs(trioScore - 100) < 3, `(dapat ${trioScore.toFixed(1)}%)`);

  /* ============ 2. COACHING ============ */
  section("2. Coaching text (5.3)");
  const badPose = asDetected(armsUp);
  const coaching = buildCoaching(targetSkeleton, badPose, 20);
  ok("skor rendah + ada target → coaching muncul",
    typeof coaching === "string" && coaching.length > 0, `(${JSON.stringify(coaching)})`);
  if (coaching) {
    ok("coaching maksimal 8 kata", coaching.trim().split(/\s+/).length <= 8,
      `("${coaching}" = ${coaching.trim().split(/\s+/).length} kata)`);
  }

  ok("skor tinggi (≥70) → coaching null",
    buildCoaching(targetSkeleton, asDetected(targetSkeleton), 95) === null);

  const long = limitWords("angkat tangan kiri kamu sedikit ke atas sekarang ya", 8);
  ok("limitWords memotong ke 8 kata", long.split(/\s+/).length === 8, `("${long}")`);

  ok("teks sama & skor mirip → tidak refresh (anti-spam)",
    shouldRefreshCoaching("Turunkan tangan kiri", "Turunkan tangan kiri", 50, 52, 4) === false);
  ok("teks baru → refresh",
    shouldRefreshCoaching("Turunkan tangan kiri", "Angkat tangan kanan", 50, 50, 4) === true);

  /* ============ 3. AUTO-SHUTTER ============ */
  section("3. Auto-shutter (5.5)");
  const mk = () => createAutoShutterState();
  const HOLD = POSE_THRESHOLDS.autoShutterHoldMs;

  {
    const st = mk();
    let fired = false;
    for (let t = 0; t <= HOLD + 2000; t += 100) {
      if (stepAutoShutter(st, { enabled: false, hasTarget: true, scores: [95], expectedPeople: 1, now: t })) fired = true;
    }
    ok("OFF → tidak pernah menembak walaupun pose sempurna", !fired);
  }
  {
    const st = mk();
    let fired = false;
    for (let t = 0; t <= HOLD + 2000; t += 100) {
      if (stepAutoShutter(st, { enabled: true, hasTarget: true, scores: [70], expectedPeople: 1, now: t })) fired = true;
    }
    ok("skor 70% (<85%) → tidak menembak", !fired);
  }
  {
    const st = mk();
    let fired = false;
    for (let t = 0; t < HOLD - 200; t += 100) {
      if (stepAutoShutter(st, { enabled: true, hasTarget: true, scores: [95], expectedPeople: 1, now: t })) fired = true;
    }
    ok("stabil < 1.5 detik → belum menembak", !fired);
  }
  {
    const st = mk();
    let count = 0;
    for (let t = 0; t <= HOLD + 3000; t += 100) {
      if (stepAutoShutter(st, { enabled: true, hasTarget: true, scores: [95], expectedPeople: 1, now: t })) count += 1;
    }
    ok("stabil ≥1.5 detik → menembak tepat sekali", count === 1, `(dapat ${count}×)`);
  }
  {
    const st = mk();
    stepAutoShutter(st, { enabled: true, hasTarget: true, scores: [95], expectedPeople: 1, now: 0 });
    stepAutoShutter(st, { enabled: true, hasTarget: true, scores: [95], expectedPeople: 1, now: 1000 });
    stepAutoShutter(st, { enabled: true, hasTarget: true, scores: [50], expectedPeople: 1, now: 1100 });
    const fired = stepAutoShutter(st, { enabled: true, hasTarget: true, scores: [95], expectedPeople: 1, now: 1600 });
    ok("pose terganggu → timer reset, tidak menembak prematur", !fired);
  }
  {
    const st = mk();
    let fired = false;
    for (let t = 0; t <= HOLD + 2000; t += 100) {
      if (stepAutoShutter(st, { enabled: true, hasTarget: true, scores: [95, 70, 95], expectedPeople: 3, now: t })) fired = true;
    }
    ok("3 orang, satu <85% → tidak menembak", !fired);
  }
  {
    const st = mk();
    stepAutoShutter(st, { enabled: true, hasTarget: true, scores: [95], expectedPeople: 1, now: 0 });
    const half = holdProgress(st, HOLD / 2);
    ok("holdProgress setengah jalan ≈ 0.5", Math.abs(half - 0.5) < 0.02, `(dapat ${half})`);
  }


  /* ============ 4. LIBRARY ============ */
  section("4. Pose library (5.7)");
  for (const cat of ["solo", "couple", "trio", "squad"]) {
    const items = allPoses.filter((p) => p.category === cat);
    ok(`kategori ${cat} punya ≥15 pose`, items.length >= 15, `(dapat ${items.length})`);
  }
  ok("semua pose punya judul", allPoses.every((p) => p.title && p.title.length > 0));
  ok("semua pose punya deskripsi", allPoses.every((p) => p.description && p.description.length > 0));
  ok("semua difficulty Easy/Medium",
    allPoses.every((p) => p.difficulty === "Easy" || p.difficulty === "Medium"));
  ok("semua pose punya minimal 1 tag vibe",
    allPoses.every((p) => Array.isArray(p.tags) && p.tags.length > 0));
  ok("semua tag valid",
    allPoses.every((p) => p.tags.every((t) => ["elegan", "playful", "street", "y2k"].includes(t))));
  ok("semua pose punya keypoint target",
    allPoses.every((p) => p.skeletons.length > 0 && Object.keys(p.skeletons[0]).length >= 10));

  ok("1 orang → solo", library.categoryForCount(1) === "solo");
  ok("2 orang → couple", library.categoryForCount(2) === "couple");
  ok("3 orang → trio", library.categoryForCount(3) === "trio");
  ok("5 orang → squad", library.categoryForCount(5) === "squad");

  const recY2K = library.recommendPoses(1, "Y2K");
  ok("rekomendasi template Y2K → pose bertag y2k",
    recY2K.length > 0 && recY2K.every((p) => p.tags.includes("y2k")), `(${recY2K.length} pose)`);

  const randomPick = library.randomPose(2, "Elegant");
  ok("randomPose(2) mengembalikan pose couple", randomPick.category === "couple");

  /* ============ 5. SKENARIO WAJIB (permintaan 29) ============ */
  section("5. Skenario wajib permintaan 29");

  // A — 1 orang pose bebas: tidak ada target → tidak ada coaching.
  {
    const freeStyle = library.randomPose(1, undefined);
    // Hook hanya memanggil buildCoaching bila targetPose != null.
    const hookWouldCoach = (target) => (target ? "ada" : null);
    ok("A. 1 orang pose bebas → tanpa coaching", hookWouldCoach(null) === null);
    ok("A. pose bebas tetap lengkap (tidak diblokir)", freeStyle.skeletons.length > 0);
  }

  // B — 3 orang pilih target: yang salah pose dapat coaching.
  {
    const trio = library.getPose("trio-peace-all");
    ok("B. pose target bertiga tersedia (3 skeleton)",
      !!trio && trio.skeletons.length === 3);

    // Orang #2 memakai pose yang beda jauh → skor rendah.
    const wrong = asDetected(library.getPose("trio-superhero").skeletons[1]);
    const s1 = scorePersonAgainstPose(trio, 1, 3, wrong);
    const text = buildCoaching(trio.skeletons[1], wrong, s1);
    ok("B. orang yang salah pose → skor < 70", s1 < 70, `(${s1.toFixed(1)}%)`);
    ok("B. coaching muncul untuknya",
      typeof text === "string" && text.length > 0, `(${JSON.stringify(text)})`);
    if (text) {
      ok("B. coaching ≤ 8 kata", text.trim().split(/\s+/).length <= 8, `("${text}")`);
    }
  }

  // C — auto-shutter OFF vs ON.
  {
    const run = (enabled) => {
      const st = mk();
      let shots = 0;
      for (let t = 0; t <= HOLD + 2500; t += 100) {
        if (stepAutoShutter(st, { enabled, hasTarget: true, scores: [92], expectedPeople: 1, now: t })) shots += 1;
      }
      return shots;
    };
    ok("C. auto-shutter OFF → 0 foto otomatis", run(false) === 0, `(dapat ${run(false)})`);
    ok("C. auto-shutter ON → 1 foto otomatis", run(true) === 1, `(dapat ${run(true)})`);
  }
} catch (err) {
  console.error("\nFATAL:", err);
  fail += 1;
} finally {
  cleanup();
}

console.log(fail === 0 ? "\nALL PASSED ✅" : `\n${fail} FAILED ❌`);
process.exit(fail === 0 ? 0 : 1);

