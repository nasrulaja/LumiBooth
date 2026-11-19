/**
 * Generator pose library → src/data/poses.json
 * ============================================
 * Jalankan: node scripts/gen-poses.cjs
 *
 * Pose target butuh ~11 keypoint per orang; menulis JSON manual rawan typo.
 * Generator ini memakai template tubuh "netral" lalu menimpa lengan/kaki
 * tertentu, sehingga menambah pose baru cukup tambah satu entri di
 * scripts/pose-*.cjs lalu regenerate.
 */
const fs = require("fs");
const path = require("path");
const { withScore, round } = require("./pose-helpers.cjs");

const solo = require("./pose-solo.cjs");
const couple = require("./pose-couple.cjs");
const trio = require("./pose-trio.cjs");
const squad = require("./pose-squad.cjs");

/** Ubah entri mentah → PoseDefinition final.
 *  Pose solo memakai `skeleton` tunggal; multi-orang memakai `skeletons`. */
function build(raw, category) {
  const rawSkeletons = raw.skeletons ?? (raw.skeleton ? [raw.skeleton] : []);
  if (!rawSkeletons.length) throw new Error(`Pose tanpa skeleton: ${raw.id}`);
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category,
    difficulty: raw.difficulty,
    tags: raw.tags,
    skeletons: rawSkeletons.map((s) => withScore(s)),
  };
}

const poses = [
  ...solo.map((p) => build(p, "solo")),
  ...couple.map((p) => build(p, "couple")),
  ...trio.map((p) => build(p, "trio")),
  ...squad.map((p) => build(p, "squad")),
];

/* ---- Validasi: id unik & jumlah minimum per kategori (permintaan 17) ---- */
const ids = new Set();
for (const p of poses) {
  if (ids.has(p.id)) throw new Error(`ID duplikat: ${p.id}`);
  ids.add(p.id);
}
const MIN_PER_CATEGORY = 15;
const counts = {};
for (const p of poses) counts[p.category] = (counts[p.category] || 0) + 1;
for (const cat of ["solo", "couple", "trio", "squad"]) {
  if ((counts[cat] || 0) < MIN_PER_CATEGORY) {
    throw new Error(`Kategori ${cat} cuma ${counts[cat] || 0} pose (min ${MIN_PER_CATEGORY})`);
  }
}

const out = {
  $comment:
    "Dihasilkan oleh scripts/gen-poses.cjs — jangan edit manual. Koordinat dinormalisasi 0..1 terhadap bounding box orang (x=0 sisi kiri orang, y=0 kepala atas).",
  version: 1,
  poses,
};

const target = path.join(__dirname, "..", "src", "data", "poses.json");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(out, null, 2) + "\n", "utf8");

console.log(`✓ ${poses.length} pose ditulis ke ${path.relative(process.cwd(), target)}`);
for (const cat of ["solo", "couple", "trio", "squad"]) {
  console.log(`  ${cat.padEnd(7)} ${counts[cat]} pose`);
}
