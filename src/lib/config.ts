/**
 * LumiBooth — Central configuration
 * ----------------------------------
 * Semua konstanta yang sering diubah (watermark, resolusi, countdown, dst.)
 * dikumpulkan di sini supaya gampang dikembangkan tanpa menyentuh logic UI.
 */

/** Teks watermark yang dicetak di pojok kanan bawah setiap hasil foto. */
export const WATERMARK_TEXT = "by @ruelzexe";

/** Ukuran & style watermark (px, opacity 0-1). */
export const WATERMARK_FONT_SIZE = 13;
export const WATERMARK_OPACITY = 0.6;

/** Jumlah foto yang diambil otomatis dalam satu sesi. */
export const PHOTO_COUNT = 4;

/** Durasi countdown (detik) sebelum tiap foto diambil. */
export const COUNTDOWN_SECONDS = 3;

/**
 * Kandidat resolusi kamera, diurutkan dari paling tinggi.
 * Auto mode mencoba dari atas ke bawah dan memakai yang pertama didukung
 * (fallback bertingkat: 1080p → 720p → 480p).
 */
export interface ResolutionPreset {
  id: "fullhd" | "hd" | "sd" | "low";
  label: string;
  width: number;
  height: number;
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { id: "fullhd", label: "Full HD", width: 1920, height: 1080 },
  { id: "hd", label: "HD", width: 1280, height: 720 },
  { id: "sd", label: "SD", width: 854, height: 480 },
  { id: "low", label: "Low", width: 640, height: 480 },
];

/**
 * Urutan fallback yang dipakai mode auto-HD.
 * 1920×1080 → 1280×720 → 854×480 → 640×480.
 */
export const AUTO_HD_CHAIN: ResolutionPreset[] = RESOLUTION_PRESETS;

/** Resolusi default bila semua constraint gagal (getUserMedia tanpa preset). */
export const FALLBACK_CONSTRAINT_FREE = { width: 640, height: 480 };

/** facingMode default: kamera depan untuk selfie/HP. */
export const DEFAULT_FACING_MODE: "user" | "environment" = "user";

/**
 * Batas resolusi capture. 1920 cukup untuk cetak/berbagi dan menjaga memori
 * aman di HP; frame asli yang lebih kecil tidak pernah di-upscale.
 */
export const CAPTURE_MAX_WIDTH = 1920;


/** Toggle manual yang ditampilkan di UI (HD / Full HD). */
export const MANUAL_RESOLUTIONS = RESOLUTION_PRESETS.filter(
  (r) => r.id === "hd" || r.id === "fullhd",
);

/** Branding. */
export const APP_NAME = "LumiBooth";
export const APP_TAGLINE = "Smart photobooth in your browser";

/** Credit footer. */
export const AUTHOR_HANDLE = "@ruelzexe";
export const AUTHOR_URL = "https://github.com/ruelzexe";

