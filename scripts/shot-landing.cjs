/**
 * Screenshot landing page + booth (verifikasi visual).
 * Jalankan: node scripts/shot-landing.cjs
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = path.join(process.cwd(), "docs");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    channel: "chromium",
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });
  const ctx = await browser.newContext({
    permissions: ["camera"],
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  // 1. Hero
  await page.screenshot({
    path: path.join(OUT, "07-landing-hero.png"),
    clip: { x: 0, y: 0, width: 1280, height: 900 },
  });
  console.log("ok hero");

  // 2. Marquee + fitur
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, "08-landing-features.png") });

  // 3. Untuk Siapa
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, "09-landing-audience.png") });

  // 4. Booth setelah klik Mulai
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: /^Mulai Gratis$/i }).first().click();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).click();
  await page.getByText(/Kamera aktif/i).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1800);
  // Buka panel Info Kamera supaya ikut terlihat di screenshot.
  await page.getByRole("button", { name: /Info Kamera/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "10-booth-camera-info.png") });
  console.log("ok booth");

  await browser.close();
  console.log("\nScreenshot tersimpan di docs/");
})();
