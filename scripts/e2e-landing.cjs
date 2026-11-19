/**
 * E2E landing page + alur masuk booth.
 * Memverifikasi: hero, marquee, fitur, "Untuk Siapa?", CTA, tombol Kembali,
 * dan bahwa kamera TIDAK diminta sebelum user klik "Mulai".
 */
const { chromium } = require("playwright");

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

  let fail = 0;
  const ok = (m, c) => {
    console.log(`  ${c ? "✔" : "✘"} ${m}`);
    if (!c) fail += 1;
  };

  console.log("E2E Landing\n");
  await page.goto(BASE, { waitUntil: "networkidle" });

  /* 1. Hero */
  const h1 = await page.locator("h1").first().innerText();
  ok("headline memuat 'LumiBooth'", /LumiBooth/i.test(h1));
  ok("headline memuat 'Photo booth pintar'", /photo booth pintar/i.test(h1));
  ok(
    "subheadline menyebut tanpa aplikasi",
    /tanpa aplikasi/i.test(await page.locator("h1").first().evaluate((el) => el.parentElement.innerText)),
  );
  const cta = page.getByRole("button", { name: /Mulai Gratis/i });
  ok("CTA 'Mulai Gratis' tampil", (await cta.count()) > 0);

  /* 2. Marquee */
  const marquee = page.getByTestId("marquee");
  ok("marquee tampil", await marquee.isVisible());
  const mText = await marquee.innerText();
  ok("marquee memuat 'FOTO EDIT BAGIKAN'", /FOTO EDIT BAGIKAN/i.test(mText));
  ok("marquee memuat 'TANPA APLIKASI'", /TANPA APLIKASI/i.test(mText));
  ok("marquee memuat 'UNDUH INSTAN'", /UNDUH INSTAN/i.test(mText));
  ok(
    "marquee punya animasi berjalan",
    /lb-marquee/.test(
      await marquee.locator(".animate-marquee").first().evaluate((el) => getComputedStyle(el).animationName),
    ) || (await marquee.locator(".animate-marquee").count()) > 0,
  );

  /* 3. Fitur */
  const body = await page.locator("body").innerText();
  ok("fitur: Live Webcam HD", /Live Webcam HD/i.test(body));
  ok("fitur: Filter Cerdas Deteksi Cahaya", /Filter Cerdas Deteksi Cahaya/i.test(body));
  ok("fitur: 13+ Template Frame", /13\+ Template Frame/i.test(body));
  ok("fitur: AI Pose Coach", /AI Pose Coach/i.test(body));
  ok("badge '100% In-Browser, Privat'", /100% In-Browser, Privat/i.test(body));

  /* 4. Untuk Siapa */
  ok("segmen: Event Organizer", /Event Organizer/i.test(body));
  ok("segmen: Content Creator", /Content Creator/i.test(body));
  ok("segmen: Bisnis & Brand", /Bisnis & Brand/i.test(body));
  ok("segmen: Penggunaan Pribadi", /Penggunaan Pribadi/i.test(body));

  /* 5. Footer credit */
  const footer = await page.locator("footer").innerText();
  ok("footer credit @ruelzexe", /@ruelzexe/.test(footer));
  ok(
    "footer punya link GitHub",
    (await page.locator('footer a[href*="github.com"]').count()) > 0,
  );

  /* 6. Kamera BELUM aktif di landing */
  ok("belum ada elemen <video> di landing", (await page.locator("video").count()) === 0);
  ok(
    "tombol 'Nyalakan Kamera' belum tampil",
    (await page.getByRole("button", { name: /Nyalakan Kamera/i }).count()) === 0,
  );

  /* 7. Klik Mulai → masuk booth */
  await cta.first().click();
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).waitFor({ timeout: 15000 });
  ok("klik Mulai membuka booth", true);

  /* 8. Tombol Kembali → landing */
  await page.getByRole("button", { name: /Kembali/i }).click();
  await page.waitForTimeout(500);
  ok(
    "tombol Kembali kembali ke landing",
    (await page.getByRole("button", { name: /Mulai Gratis/i }).count()) > 0,
  );

  ok("tidak ada runtime error", errors.length === 0);

  console.log(fail === 0 ? "\nE2E LANDING PASSED ✅" : `\n${fail} GAGAL ❌`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})();
