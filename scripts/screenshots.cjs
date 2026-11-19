// Capture screenshots of the running app for the README.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = path.join(__dirname, "..", "docs");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    channel: "chromium",
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });
  const ctx = await browser.newContext({
    permissions: ["camera"],
    viewport: { width: 1440, height: 980 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });

  // 1) Idle state.
  await page.screenshot({ path: path.join(OUT, "01-idle.png") });

  // 2) Camera on + analyse light.
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).click();
  await page.getByText(/Kamera aktif/i).waitFor({ timeout: 20000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, "02-camera.png") });

  // 3) Capture session -> final result.
  await page.getByTitle(/Retro Film/i).first().click();
  await page.getByRole("button", { name: /Mulai 4 Foto/i }).click();
  await page.waitForFunction(
    () => document.querySelectorAll("img[alt^='Foto']").length >= 4,
    { timeout: 45000 },
  );
  await page.waitForSelector("img[alt='Hasil akhir LumiBooth']", { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, "03-result.png") });
  await page.screenshot({ path: path.join(OUT, "03-result-full.png"), fullPage: true });

  // 4) Save the final composite PNG itself.
  const dataUrl = await page.evaluate(() => {
    const img = document.querySelector("img[alt='Hasil akhir LumiBooth']");
    return img ? img.src : null;
  });
  if (dataUrl) {
    fs.writeFileSync(
      path.join(OUT, "sample-result.png"),
      Buffer.from(dataUrl.split(",")[1], "base64"),
    );
  }

  // 5) Dark mode.
  await page.getByRole("button", { name: /tema|theme|gelap/i }).first().click().catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, "04-dark.png") });

  await browser.close();
  console.log("screenshots saved to docs/");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
