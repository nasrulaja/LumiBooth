// E2E browser test for LumiBooth using a fake webcam.
// Requires chromium installed via: npx playwright install chromium
// Run against a running dev/preview server at BASE (default http://localhost:3000).
const { chromium } = require("playwright");
const { enterBooth } = require("./e2e-helpers.cjs");

const BASE = process.env.BASE || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({
    // Gunakan build chromium penuh (bukan headless-shell) agar fake device
    // media stream berfungsi; headless-shell tidak punya dukungan kamera.
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
    if (!c) fail++;
  };

  console.log("E2E browser tests\n");
  await page.goto(BASE, { waitUntil: "networkidle" });

  ok("branding LumiBooth tampil", await page.getByText("LumiBooth").first().isEnabled());
  ok("footer credit ada", (await page.locator("footer").innerText()).includes("@ruelzexe"));

  // Nyalakan kamera.
  await enterBooth(page);
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).click();
  await page.waitForSelector("video", { timeout: 15000 });

  // Tunggu kamera ready (indikator "Kamera aktif").
  await page.getByText(/Kamera aktif/i).waitFor({ timeout: 15000 });
  const resBadge = await page.locator("text=/\\d+×\\d+/").first().innerText();
  ok("indikator resolusi muncul", /\d+×\d+/.test(resBadge), resBadge);

  // Tunggu analisis cahaya muncul (badge bukan "menunggu kamera").
  await page.waitForTimeout(2000);
  const lightingCard = page.locator("text=Deteksi Cahaya").locator("..");
  ok("metrik brightness terhitung", (await page.getByText("Brightness").count()) > 0);

  // Pilih filter B&W dan template berbeda untuk memastikan UI reaktif.
  await page.getByRole("radio", { name: /B&W/i }).click();
  await page.getByTitle(/Retro Film/i).first().click();

  // Mulai sesi 4 foto. Countdown 3 detik x 4 + gaps.
  await page.getByRole("button", { name: /Mulai 4 Foto/i }).click();

  // Tunggu hingga semua 4 slot terisi (muncul tombol Retake minimal 4).
  await page.waitForFunction(
    () => document.querySelectorAll("img[alt^='Foto']").length >= 4,
    { timeout: 40000 },
  );
  const shots = await page.locator("img[alt^='Foto']").count();
  ok("4 foto terambil", shots >= 4, `(${shots})`);

  // Hasil akhir + watermark harus ter-render.
  await page.waitForSelector("img[alt='Hasil akhir LumiBooth']", { timeout: 20000 });
  const resultInfo = await page.evaluate(async () => {
    const img = document.querySelector("img[alt='Hasil akhir LumiBooth']");
    if (!img) return null;
    return { w: img.naturalWidth, h: img.naturalHeight, src: img.src.slice(0, 30) };
  });
  ok("hasil akhir PNG ter-render", resultInfo && resultInfo.w > 0 && resultInfo.h > 0,
     JSON.stringify(resultInfo));
  ok("hasil berupa data URL png", resultInfo && resultInfo.src.startsWith("data:image/png"));

  // Verifikasi watermark: cek piksel di area kanan-bawah tidak seragam (ada teks).
  const wm = await page.evaluate(async () => {
    const img = document.querySelector("img[alt='Hasil akhir LumiBooth']");
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    // area pojok kanan bawah
    const box = 160;
    const d = ctx.getImageData(c.width - box, c.height - box, box, box).data;
    const set = new Set();
    for (let i = 0; i < d.length; i += 4) set.add(`${d[i]},${d[i+1]},${d[i+2]}`);
    return { distinctColors: set.size };
  });
  ok("ada variasi warna di area watermark (teks terbaca)", wm.distinctColors > 3,
     `(${wm.distinctColors} warna)`);

  // Test download path menghasilkan data URL valid via tombol.
  const canDownload = await page.getByRole("button", { name: /Download PNG/i }).isEnabled();
  ok("tombol download aktif", canDownload);

  // Test layout switch: grid & single memicu re-render tanpa error.
  await page.getByRole("radio", { name: /Grid 2×2/i }).click();
  await page.waitForTimeout(1500);
  ok("ganti layout grid oke", (await page.locator("img[alt='Hasil akhir LumiBooth']").count()) === 1);

  ok("tidak ada runtime error", errors.length === 0, errors.join(" | "));

  console.log(fail === 0 ? "\nE2E PASSED ✅" : `\n${fail} E2E FAILED ❌`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
