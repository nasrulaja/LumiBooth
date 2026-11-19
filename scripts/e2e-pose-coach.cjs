/**
 * E2E khusus Pose Coach (TAHAP 5)
 * ==============================
 * Memverifikasi perilaku SUGGESTIF & default OFF di browser nyata dengan
 * kamera palsu Chromium:
 *  - default OFF: tombol "Butuh ide pose? ✨" tampil, tidak ada tracking
 *  - menyalakan coach: panel kontrol muncul (pose, overlay, auto-shutter)
 *  - tagline wajib tampil
 *  - auto-shutter default OFF dan bisa dinyalakan
 *  - pilih pose target dari library
 *  - tombol shutter manual SELALU ada dan berfungsi
 *  - tidak ada runtime error
 *
 * Jalankan: node scripts/e2e-pose-coach.cjs
 * (butuh dev server di BASE, default http://localhost:3000)
 */
const { chromium } = require("playwright");
const { enterBooth } = require("./e2e-helpers.cjs");

const BASE = process.env.BASE || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({
    channel: "chromium",
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  });
  const context = await browser.newContext({
    permissions: ["camera"],
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  let fail = 0;
  const ok = (n, c, d = "") => {
    console.log(`  ${c ? "✓" : "✗"} ${n}${c ? "" : " " + d}`);
    if (!c) fail += 1;
  };

  console.log("E2E Pose Coach\n");
  await page.goto(BASE, { waitUntil: "networkidle" });

  /* ---- 1. Default OFF ---- */
  // Masuk ke booth dulu: sejak ada landing page, elemen Pose Coach baru
  // dirender setelah user klik "Mulai".
  await enterBooth(page);

  const cta = page.getByRole("button", { name: /Butuh ide pose/i });
  ok("default OFF: tombol 'Butuh ide pose?' tampil", await cta.isVisible());

  const tagline = page.getByText(/Bebas gaya apa pun/i);
  ok("tagline wajib tampil", (await tagline.count()) > 0);

  const overlayToggleBefore = page.getByText(/Auto-shutter/i);
  ok("toggle auto-shutter tidak tampil saat coach OFF",
    (await overlayToggleBefore.count()) === 0);

  /* ---- 2. Nyalakan kamera dulu ---- */
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).click();
  await page.getByText(/Kamera aktif/i).waitFor({ timeout: 15000 });

  /* ---- 3. Aktifkan Pose Coach ---- */
  await cta.click();

  const poseHeading = page.getByRole("heading", { name: /Pose Coach/i });
  ok("coach ON: panel Pose Coach tampil", await poseHeading.first().isVisible());

  // Toggle overlay & auto-shutter muncul.
  ok("toggle 'Overlay panduan' tampil",
    (await page.getByText(/Overlay panduan/i).count()) > 0);
  ok("toggle 'Auto-shutter' tampil",
    (await page.getByText(/Auto-shutter/i).count()) > 0);

  // Auto-shutter default OFF (aria-pressed=false).
  const autoBtn = page
    .locator("button", { hasText: /Auto-shutter/i })
    .first();
  const autoPressed = await autoBtn.getAttribute("aria-pressed");
  ok("auto-shutter default OFF", autoPressed === "false", `(aria-pressed=${autoPressed})`);

  /* ---- 4. Pilih jumlah orang 3 ---- */
  const people3 = page.getByRole("button", { name: "3", exact: true });
  if ((await people3.count()) > 0) {
    await people3.first().click();
    ok("pilih 3 orang → label kategori Bertiga", 
      (await page.getByText(/Pose target \(Bertiga\)/i).count()) > 0);
  } else {
    ok("tombol jumlah orang 3 tersedia", false);
  }

  /* ---- 5. Buka library & pilih pose target ---- */
  const pickBtn = page.getByRole("button", { name: /^Pilih pose$/i });
  await pickBtn.click();
  const firstPose = page.locator("li button").first();
  const poseTitle = (await firstPose.innerText()).split("\n")[0].trim();
  await firstPose.click();
  ok(`pilih pose target "${poseTitle}"`, 
    (await page.getByText(new RegExp(poseTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")).count()) > 0);

  /* ---- 6. Kosongkan target ("Bebas gaya") ---- */
  const freeBtn = page.getByRole("button", { name: /Bebas gaya/i });
  ok("tombol 'Bebas gaya' tersedia saat ada target", await freeBtn.isVisible());

  /* ---- 7. Surprize Me ---- */
  const surprise = page.getByRole("button", { name: /Surprize Me/i });
  ok("tombol 'Surprize Me' tersedia", await surprise.isVisible());
  await surprise.click();
  // Brief muncul sebentar (3 detik).
  await page.waitForTimeout(400);
  const briefVisible = (await page.getByText(/Pose pilihan untukmu/i).count()) > 0;
  ok("Surprize Me menampilkan brief pose", briefVisible);

  /* ---- 8. Nyalakan auto-shutter ---- */
  await autoBtn.click();
  const autoAfter = await autoBtn.getAttribute("aria-pressed");
  ok("auto-shutter bisa dinyalakan (ON)", autoAfter === "true", `(aria-pressed=${autoAfter})`);

  /* ---- 9. Matikan coach → target & auto-shutter ikut mati ---- */
  const coachToggle = page
    .locator('button[title="Matikan Pose Coach"]');
  await coachToggle.click();
  await page.waitForTimeout(200);
  ok("coach OFF: kembali ke tombol 'Butuh ide pose?'",
    await cta.isVisible());

  /* ---- 10. Tombol shutter manual tetap ada & berfungsi ---- */
  const startBtn = page.getByRole("button", { name: /Mulai 4 Foto/i });
  ok("tombol shutter manual selalu tersedia (coach OFF)", await startBtn.isVisible());

  await startBtn.click();
  // Tunggu sampai minimal 1 foto terambil (countdown 3s).
  await page.waitForFunction(
    () => /[1-4]\/4 foto diambil/.test(document.body.innerText) ||
          /Hasil Foto/i.test(document.body.innerText),
    { timeout: 30000 },
  );
  ok("foto manual berhasil diambil", true);

  /* ---- 11. Tidak ada runtime error ---- */
  ok("tidak ada runtime error", errors.length === 0,
    errors.length ? `(${errors.slice(0, 2).join("; ")})` : "");

  await browser.close();
  console.log(fail === 0 ? "\nE2E POSE COACH PASSED ✅" : `\n${fail} FAILED ❌`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((err) => {
  console.error("\nFATAL:", err);
  process.exit(1);
});
