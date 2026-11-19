/**
 * Verifikasi model AI benar-benar termuat di browser.
 * =================================================
 * Memastikan:
 *  - model TFJS (MoveNet MultiPose + BlazeFace) dapat diunduh & dijalankan
 *  - status engine berubah loading → ready (atau error yang jelas)
 *  - tidak ada runtime error walau model gagal (fallback tetap aman)
 *
 * Catatan: butuh akses internet untuk mengunduh bobot model dari TF Hub.
 * Kalau offline, test akan melaporkan status error secara eksplisit —
 * itu juga perilaku yang benar (permintaan 27).
 *
 * Jalankan: node scripts/e2e-pose-model.cjs
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

  console.log("Verifikasi pemuatan model AI\n");
  await page.goto(BASE, { waitUntil: "networkidle" });

  await enterBooth(page);
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).click();
  await page.getByText(/Kamera aktif/i).waitFor({ timeout: 15000 });

  // Nyalakan coach → memicu download + inisialisasi model.
  await page.getByRole("button", { name: /Butuh ide pose/i }).click();

  // Tunggu status "Aktif" (ready) atau "Model gagal" (error).
  let status = "timeout";
  try {
    await page.waitForFunction(
      () => {
        const t = document.body.innerText;
        if (/Model gagal/.test(t)) return "error";
        if (/Mode Lite/.test(t)) return "lite";
        // Badge "Aktif" menandakan engine siap.
        return /Aktif/.test(t) ? "ready" : false;
      },
      { timeout: 90000 },
    );
    status = await page.evaluate(() => {
      const t = document.body.innerText;
      if (/Model gagal/.test(t)) return "error";
      if (/Mode Lite/.test(t)) return "lite";
      return "ready";
    });
  } catch {
    status = "timeout";
  }

  console.log(`  status engine: ${status}`);
  ok(
    "model termuat & engine siap (ready/lite)",
    status === "ready" || status === "lite",
    `(dapat "${status}")`,
  );

  // Kalau ready, cek halaman tetap tanpa error dan kamera masih jalan.
  ok("tidak ada runtime error", errors.length === 0,
    errors.length ? `(${errors.slice(0, 2).join("; ")})` : "");
  ok("kamera tetap aktif setelah model dimuat",
    /Kamera aktif/.test(await page.locator("body").innerText()));

  await browser.close();
  console.log(fail === 0 ? "\nMODEL CHECK PASSED ✅" : `\n${fail} FAILED ❌`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((err) => {
  console.error("\nFATAL:", err);
  process.exit(1);
});
