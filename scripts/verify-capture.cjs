/**
 * Verifikasi kualitas hasil: capture → PNG → ukur resolusi & ketajaman.
 *
 * Membandingkan rasio hasil PNG dengan rasio kotak preview (harus sama =
 * WYSIWYG) dan memastikan PNG tidak di-upscale melebihi frame kamera.
 *
 * Jalankan: node scripts/verify-capture.cjs
 */
const { chromium } = require("playwright");
const { enterBooth } = require("./e2e-helpers.cjs");

const BASE = process.env.BASE || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({
    channel: "chromium",
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });
  const ctx = await browser.newContext({
    permissions: ["camera"],
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(BASE, { waitUntil: "networkidle" });
  await enterBooth(page);
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).click();
  await page.getByText(/Kamera aktif/i).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);

  // Ambil 1 foto lewat jalur capture asli.
  await page.evaluate(() => {
    const v = document.querySelector("video");
    const box = document.querySelector('[data-testid="preview-box"]');
    v.__boxAspect = box.getBoundingClientRect().width / box.getBoundingClientRect().height;
  });
  await page.getByRole("button", { name: /Ambil foto 1|Retake foto 1/i })
    .click()
    .catch(async () => {
      // Fallback: tombol shutter utama.
      await page.getByRole("button", { name: /Mulai 4 Foto/i }).click();
    });
  await page.waitForTimeout(5000);

  const res = await page.evaluate(async () => {
    const img = Array.from(document.querySelectorAll("img")).find((i) =>
      i.src.startsWith("data:image/png"),
    );
    if (!img) return { error: "tidak ada PNG" };
    const v = document.querySelector("video");
    const box = document.querySelector('[data-testid="preview-box"]');
    const boxAspect = box.getBoundingClientRect().width / box.getBoundingClientRect().height;
    await img.decode().catch(() => {});
    return {
      pngW: img.naturalWidth,
      pngH: img.naturalHeight,
      pngAspect: +(img.naturalWidth / img.naturalHeight).toFixed(3),
      boxAspect: +boxAspect.toFixed(3),
      camW: v.videoWidth,
      camH: v.videoHeight,
      camAspect: +(v.videoWidth / v.videoHeight).toFixed(3),
      upscaled: img.naturalWidth > v.videoWidth,
      kb: Math.round(img.src.length / 1024),
    };
  });

  console.log("HASIL CAPTURE:", JSON.stringify(res, null, 2));

  let fail = 0;
  const ok = (m, c) => {
    console.log(`  ${c ? "✔" : "✘"} ${m}`);
    if (!c) fail += 1;
  };
  ok("PNG memakai lebar frame asli (tidak di-upscale)", !res.upscaled);
  ok("PNG minimal 1280px lebar (tajam untuk dibagikan)", res.pngW >= 1280);
  ok(
    `rasio PNG ≈ rasio preview (WYSIWYG) [${res.pngAspect} vs ${res.boxAspect}]`,
    Math.abs(res.pngAspect - res.boxAspect) < 0.02,
  );
  ok("tidak ada runtime error", errors.length === 0);

  console.log(fail === 0 ? "\nCAPTURE VERIFIED ✅" : `\n${fail} GAGAL ❌`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})();
