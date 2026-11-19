// Verifikasi build statis GitHub Pages (folder out/ yang disajikan di
// http://localhost:4174/LumiBooth/). Menjalankan alur photobooth sungguhan
// dengan fake webcam untuk memastikan base path & aset benar.
const { chromium } = require("playwright");
const { enterBooth } = require("./e2e-helpers.cjs");

const URL = process.env.PAGES_URL || "http://localhost:4174/LumiBooth/";

(async () => {
  const browser = await chromium.launch({
    channel: "chromium",
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  });
  const ctx = await browser.newContext({
    permissions: ["camera"],
    viewport: { width: 1400, height: 1000 },
  });
  const page = await ctx.newPage();

  let fail = 0;
  const ok = (n, c, d = "") => {
    console.log(`  ${c ? "✓" : "✗"} ${n}${c ? "" : " " + d}`);
    if (!c) fail++;
  };

  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const failed = [];
  page.on("requestfailed", (r) => failed.push(`${r.url()} — ${r.failure()?.errorText}`));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });

  console.log("Pages export smoke test\n");
  await page.goto(URL, { waitUntil: "networkidle" });

  ok("halaman termuat", (await page.title()).includes("LumiBooth"));
  ok("heading tampil", await page.locator("h1").first().isVisible());
  ok(
    "tidak ada aset 404",
    failed.length === 0,
    `\n      ${failed.slice(0, 5).join("\n      ")}`,
  );

  // Kamera
  await enterBooth(page);
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).click();
  await page.waitForSelector("video", { timeout: 15000 });
  await page.getByText(/Kamera aktif/i).waitFor({ timeout: 15000 });
  await page.waitForTimeout(2000);
  const live = await page.locator("video").first().evaluate((v) => v.videoWidth > 0);
  ok("video kamera berjalan", live);

  // Ambil 4 foto
  await page.getByRole("button", { name: /Mulai 4 Foto/i }).click();
  await page.waitForSelector("img[alt='Hasil akhir LumiBooth']", { timeout: 40000 });
  const result = page.locator("img[alt='Hasil akhir LumiBooth']").first();
  const src = await result.getAttribute("src");
  ok("hasil akhir ter-render", !!src && src.startsWith("data:image/png"));
  ok("tidak ada runtime error", errors.length === 0, `\n      ${errors.slice(0, 5).join("\n      ")}`);

  await page.screenshot({ path: "docs/pages-export.png", fullPage: false });
  await browser.close();

  console.log(fail === 0 ? "\nPAGES EXPORT PASSED ✅" : `\n${fail} FAILED ❌`);
  process.exit(fail === 0 ? 0 : 1);
})();
