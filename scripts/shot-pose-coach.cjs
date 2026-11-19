/**
 * Screenshot UI Pose Coach untuk dokumentasi.
 * Jalankan: node scripts/shot-pose-coach.cjs
 */
const { chromium } = require("playwright");

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = "docs";

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
    viewport: { width: 1400, height: 1000 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });

  // 1. State awal (coach OFF).
  await page.screenshot({ path: `${OUT}/05-pose-coach-off.png` });

  // 2. Kamera aktif + coach ON + pose target + overlay.
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).click();
  await page.getByText(/Kamera aktif/i).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: /Butuh ide pose/i }).click();

  // Pilih 3 orang & pose target supaya overlay + skor tampil.
  await page.getByRole("button", { name: "3", exact: true }).first().click();
  await page.getByRole("button", { name: /^Pilih pose$/i }).click();
  await page.locator("li button").first().click();

  // Beri waktu model memuat & overlay menggambar.
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/06-pose-coach-on.png` });

  await browser.close();
  console.log("Screenshot tersimpan di docs/05-pose-coach-off.png dan docs/06-pose-coach-on.png");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
