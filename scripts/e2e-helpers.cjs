/**
 * Helper kecil untuk e2e: masuk ke flow photobooth.
 *
 * Sejak landing page ditambahkan, halaman root menampilkan hero dulu dan
 * kamera BELUM diaktifkan. Test harus klik "Mulai" dulu sebelum menemukan
 * tombol "Nyalakan Kamera".
 */
async function enterBooth(page) {
  const mulai = page.getByRole("button", { name: /^Mulai Gratis$/i }).first();
  if (await mulai.count()) {
    await mulai.click();
  }
  // Tunggu panel booth benar-benar muncul.
  await page.getByRole("button", { name: /Nyalakan Kamera/i }).waitFor({
    timeout: 15000,
  });
}

module.exports = { enterBooth };
