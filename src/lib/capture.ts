/**
 * Utility capture: mengambil frame dari <video> ke canvas lalu export
 * sebagai data URL.
 *
 * Penting: preview di layar di-mirror (CSS scaleX(-1)) supaya terasa seperti
 * kaca, TETAPI hasil capture TIDAK di-mirror — kita menggambar frame apa
 * adanya dari video, sehingga foto tersimpan sesuai orientasi asli.
 */
export interface CaptureOptions {
  /** Kosongkan crop otomatis supaya rasio hasil = rasio video. */
  maxWidth?: number;
  mimeType?: string;
  quality?: number;
}

export function captureFrame(
  video: HTMLVideoElement,
  opts: CaptureOptions = {},
): string | null {
  if (!video || !video.videoWidth || !video.videoHeight) return null;

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const scale = opts.maxWidth && vw > opts.maxWidth ? opts.maxWidth / vw : 1;
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Gambar frame apa adanya (tanpa mirror).
  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL(opts.mimeType ?? "image/png", opts.quality);
}
