/**
 * LUMIBOOTH — Daftar filter
 * -------------------------
 * `css` adalah string CSS filter yang dipakai untuk preview real-time
 * (langsung ditempel via `style={{ filter }}`).
 * Nilai yang sama juga dipakai saat render final di canvas lewat
 * `ctx.filter = css` — sehingga preview == hasil akhir.
 */
export interface FilterDef {
  id: string;
  name: string;
  /** CSS filter string — dipakai untuk preview & render canvas. */
  css: string;
  /** Warna swatch preview di UI. */
  swatch: string;
  /** Deskripsi singkat. */
  desc: string;
}

export const FILTERS: FilterDef[] = [
  {
    id: "normal",
    name: "Normal",
    css: "none",
    swatch: "linear-gradient(135deg,#cfd6e4,#9aa6bd)",
    desc: "Tanpa perubahan",
  },
  {
    id: "bright",
    name: "Bright",
    css: "brightness(1.14) contrast(1.03) saturate(1.05)",
    swatch: "linear-gradient(135deg,#fff6d8,#ffe08a)",
    desc: "Mencerahkan & menyegarkan",
  },
  {
    id: "warm",
    name: "Warm",
    css: "sepia(0.18) saturate(1.18) brightness(1.06) contrast(1.02)",
    swatch: "linear-gradient(135deg,#ffd9b0,#ff9e58)",
    desc: "Hangat & brightening",
  },
  {
    id: "cool",
    name: "Cool",
    css: "hue-rotate(-8deg) saturate(1.05) brightness(1.02) contrast(1.03) sepia(0.05)",
    swatch: "linear-gradient(135deg,#bfe4ff,#5aa9e6)",
    desc: "Ton dingin menyeimbangkan warm",
  },
  {
    id: "vintage",
    name: "Vintage",
    css: "sepia(0.42) contrast(1.06) brightness(0.98) saturate(0.85)",
    swatch: "linear-gradient(135deg,#e8d3a8,#a67c52)",
    desc: "Nuansa retro",
  },
  {
    id: "bw",
    name: "B&W",
    css: "grayscale(1) contrast(1.12) brightness(1.03)",
    swatch: "linear-gradient(135deg,#e6e6e6,#4a4a4a)",
    desc: "Monokrom klasik",
  },
  {
    id: "film",
    name: "Film",
    css: "contrast(1.12) saturate(0.9) sepia(0.14) brightness(1.02)",
    swatch: "linear-gradient(135deg,#c7d4b8,#6f7d5c)",
    desc: "Grain-ish look kamera analog",
  },
  {
    id: "soft",
    name: "Soft & Vivid",
    css: "brightness(1.05) contrast(0.94) saturate(1.22)",
    swatch: "linear-gradient(135deg,#ffd6ec,#a9c7ff)",
    desc: "Terang, lembut, warna vivid",
  },
  {
    id: "clean",
    name: "Clean & Minimal",
    css: "brightness(1.06) contrast(1.02) saturate(0.98) hue-rotate(2deg)",
    swatch: "linear-gradient(135deg,#f3f5f8,#c8d2de)",
    desc: "Rapi & netral",
  },
];

export const getFilter = (id: string): FilterDef =>
  FILTERS.find((f) => f.id === id) ?? FILTERS[0];
