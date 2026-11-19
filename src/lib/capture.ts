/**
 * Utility capture: mengambil frame dari <video> ke canvas lalu export
 * sebagai data URL.
 *
 * Penting: preview di layar di-mirror (CSS scaleX(-1)) supaya terasa seperti
 * kaca, TETAPI hasil capture TIDAK di-mirror — kita menggambar frame apa
 * adanya dari video, sehingga foto tersimpan sesuai orientasi asli.
 *
 * WYSIWYG (penting untuk kasus "hasil burem / framing beda"):
 * Preview memakai `object-fit: cover`, jadi sebagian frame terpotong. Kalau
 * kita menggambar frame PENUH ke canvas, hasilnya bukan yang dilihat user —
 * user merasa "zoom-nya beda". Karena itu capture menerima `outputAspect`
 * (rasio kotak preview) dan memotong frame asli dengan aturan crop yang
 * SAMA seperti `object-fit: cover`, sehingga hasil = yang dilihat di layar.
 *
 * Resolusi: kita selalu memakai `video.videoWidth/videoHeight` (ukuran frame
 * asli), tidak pernah ukuran elemen di layar. Frame kecil tidak di-upscale.
 */
export interface CaptureOptions {
  /**
   * Batas lebar output. Kalau frame asli lebih kecil, TIDAK di-upscale.
   * `undefined` = pakai lebar asli.
   */
  maxWidth?: number;
  mimeType?: string;
  quality?: number;
  /**
   * CSS filter string (dari FILTERS[].css). Diterapkan via ctx.filter
   * agar hasil akhir persis sama dengan preview di layar.
   */
  cssFilter?: string;
  /**
   * Rasio kotak preview (width / height). Bila diisi, frame di-crop dengan
   * aturan `object-fit: cover` yang sama seperti preview → WYSIWYG.
   * Bila kosong, seluruh frame dipakai (rasio hasil = rasio kamera).
   */
  outputAspect?: number;
}

/** Hitung area sumber (crop) agar rasio `targetAspect` terpenuhi, ala cover. */
export function computeCoverCrop(
  srcW: number,
  srcH: number,
  targetAspect: number,
): { sx: number; sy: number; sw: number; sh: number } {
  if (!srcW || !srcH || !targetAspect || targetAspect <= 0) {
    return { sx: 0, sy: 0, sw: srcW, sh: srcH };
  }
  const srcAspect = srcW / srcH;
  if (srcAspect > targetAspect) {
    // Sumber lebih lebar → potong kiri/kanan.
    const sw = srcH * targetAspect;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh: srcH };
  }
  // Sumber lebih tinggi → potong atas/bawah.
  const sh = srcW / targetAspect;
  return { sx: 0, sy: (srcH - sh) / 2, sw: srcW, sh };
}

export function captureFrame(
  video: HTMLVideoElement,
  opts: CaptureOptions = {},
): string | null {
  if (!video || !video.videoWidth || !video.videoHeight) return null;

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  // 1) Tentukan area sumber (crop ala object-cover bila outputAspect diisi).
  const crop = opts.outputAspect
    ? computeCoverCrop(vw, vh, opts.outputAspect)
    : { sx: 0, sy: 0, sw: vw, sh: vh };

  // 2) Tentukan ukuran output. Jangan pernah upscale melebihi area sumber.
  const capW = opts.maxWidth && crop.sw > opts.maxWidth ? opts.maxWidth : crop.sw;
  const scale = capW / crop.sw;
  const w = Math.max(1, Math.round(crop.sw * scale));
  const h = Math.max(1, Math.round(crop.sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Terapkan filter CSS ke canvas (didukung browser modern).
  if (opts.cssFilter && opts.cssFilter !== "none") {
    try {
      ctx.filter = opts.cssFilter;
    } catch {
      /* fallback: tanpa filter */
    }
  }

  // 3) Gambar area crop apa adanya (tanpa mirror), diskalakan ke ukuran output.
  ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
  return canvas.toDataURL(opts.mimeType ?? "image/png", opts.quality);
}

