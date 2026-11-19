/**
 * LUMIBOOTH — Template frame & layout
 * -----------------------------------
 * Setiap template gender-neutral dan punya >= 3 variasi warna.
 *
 * Model frame sederhana & data-driven: template hanya mendeskripsikan
 * warna border/aksen + gaya dekorasi. Renderer canvas (lib/render.ts)
 * yang menggambar, sehingga menambah template baru cukup tambah entri di sini.
 */

export interface ColorVariant {
  id: string;
  name: string;
  /** Warna latar/border utama frame. */
  bg: string;
  /** Warna aksen (garis, shape, teks). */
  accent: string;
  /** Warna teks yang kontras di atas bg. */
  text: string;
}

export type Decoration =
  | "none"
  | "corners"
  | "dots"
  | "stripes"
  | "film"
  | "confetti"
  | "grid"
  | "tape";

export interface FrameTemplate {
  id: string;
  name: string;
  category:
    | "Minimal"
    | "Retro"
    | "Y2K"
    | "Street"
    | "Elegant"
    | "Playful"
    | "Couple"
    | "Squad";
  decoration: Decoration;
  variants: ColorVariant[];
}

/** Helper: buat 3 varian warna dari base id + definisi tiap varian. */
const trio = (
  base: string,
  a: Omit<ColorVariant, "id">,
  b: Omit<ColorVariant, "id">,
  c: Omit<ColorVariant, "id">,
): ColorVariant[] => [
  { ...a, id: `${base}-1` },
  { ...b, id: `${base}-2` },
  { ...c, id: `${base}-3` },
];

export const TEMPLATES: FrameTemplate[] = [
  {
    id: "minimal",
    name: "Minimal",
    category: "Minimal",
    decoration: "none",
    variants: trio(
      "minimal",
      { name: "Putih", bg: "#ffffff", accent: "#111827", text: "#111827" },
      { name: "Charcoal", bg: "#1f2329", accent: "#e5e7eb", text: "#f9fafb" },
      { name: "Sand", bg: "#f3ecdd", accent: "#8a7a5c", text: "#4b4436" },
    ),
  },
  {
    id: "line",
    name: "Line Border",
    category: "Minimal",
    decoration: "corners",
    variants: trio(
      "line",
      { name: "Ink", bg: "#fafafa", accent: "#111827", text: "#111827" },
      { name: "Slate", bg: "#eef2f6", accent: "#475569", text: "#334155" },
      { name: "Olive", bg: "#f1f3ea", accent: "#5b6b3a", text: "#3f4a29" },
    ),
  },
  {
    id: "softcard",
    name: "Soft Card",
    category: "Minimal",
    decoration: "dots",
    variants: trio(
      "softcard",
      { name: "Mist", bg: "#e8edf5", accent: "#6b7a90", text: "#374151" },
      { name: "Blush", bg: "#f5e8e4", accent: "#a06b5c", text: "#5c3f38" },
      { name: "Sage", bg: "#e6efe6", accent: "#5c7a5c", text: "#365036" },
    ),
  },
  {
    id: "retro",
    name: "Retro Film",
    category: "Retro",
    decoration: "film",
    variants: trio(
      "retro",
      { name: "Cream", bg: "#f4ead5", accent: "#7a3b2e", text: "#5a2a20" },
      { name: "Faded Blue", bg: "#dfe7ec", accent: "#37505c", text: "#22333b" },
      { name: "Mustard", bg: "#f0d38b", accent: "#6b4a12", text: "#4a330c" },
    ),
  },
  {
    id: "tape",
    name: "Tape Shot",
    category: "Retro",
    decoration: "tape",
    variants: trio(
      "tape",
      { name: "Paper", bg: "#ffffff", accent: "#d9d2c2", text: "#4b4436" },
      { name: "Kraft", bg: "#d8c3a0", accent: "#7a5c32", text: "#4a3a1f" },
      { name: "Night", bg: "#2b2f36", accent: "#9aa6bd", text: "#e5e7eb" },
    ),
  },
  {
    id: "y2k",
    name: "Y2K Chrome",
    category: "Y2K",
    decoration: "grid",
    variants: trio(
      "y2k",
      { name: "Silver", bg: "#dfe6f0", accent: "#7c5cff", text: "#1e1b4b" },
      { name: "Cyan", bg: "#d6f4ff", accent: "#0aa6c9", text: "#083344" },
      { name: "Lilac", bg: "#ece4ff", accent: "#7c3aed", text: "#3b0764" },
    ),
  },
  {
    id: "bubble",
    name: "Bubble Pop",
    category: "Y2K",
    decoration: "dots",
    variants: trio(
      "bubble",
      { name: "Sky", bg: "#dbeeff", accent: "#3b82f6", text: "#1e3a8a" },
      { name: "Peach", bg: "#ffe6d5", accent: "#f97316", text: "#7c2d12" },
      { name: "Mint", bg: "#d8f6ea", accent: "#10b981", text: "#064e3b" },
    ),
  },
  {
    id: "street",
    name: "Street Bold",
    category: "Street",
    decoration: "stripes",
    variants: trio(
      "street",
      { name: "Black", bg: "#111111", accent: "#facc15", text: "#fafafa" },
      { name: "Concrete", bg: "#3b3f45", accent: "#f97316", text: "#f4f4f5" },
      { name: "Off-White", bg: "#ececec", accent: "#ef4444", text: "#111111" },
    ),
  },
  {
    id: "urban",
    name: "Urban Grid",
    category: "Street",
    decoration: "grid",
    variants: trio(
      "urban",
      { name: "Asphalt", bg: "#22262c", accent: "#38bdf8", text: "#e5e7eb" },
      { name: "Sand", bg: "#e7ddca", accent: "#b45309", text: "#3f3428" },
      { name: "Forest", bg: "#1f2d24", accent: "#4ade80", text: "#dcfce7" },
    ),
  },
  {
    id: "elegant",
    name: "Elegant Line",
    category: "Elegant",
    decoration: "corners",
    variants: trio(
      "elegant",
      { name: "Ivory", bg: "#faf7f0", accent: "#b08d57", text: "#4a3f2a" },
      { name: "Onyx", bg: "#16181d", accent: "#d4af37", text: "#f4ecd8" },
      { name: "Slate", bg: "#eef0f4", accent: "#7c8598", text: "#2b3140" },
    ),
  },
  {
    id: "playful",
    name: "Confetti",
    category: "Playful",
    decoration: "confetti",
    variants: trio(
      "playful",
      { name: "Candy", bg: "#fff0f6", accent: "#ec4899", text: "#831843" },
      { name: "Lemon", bg: "#fef9c3", accent: "#eab308", text: "#713f12" },
      { name: "Ocean", bg: "#e0f2fe", accent: "#0ea5e9", text: "#0c4a6e" },
    ),
  },
  {
    id: "couple",
    name: "Duo Frame",
    category: "Couple",
    decoration: "corners",
    variants: trio(
      "couple",
      { name: "Rose", bg: "#fbe9ec", accent: "#be5869", text: "#5a2230" },
      { name: "Navy", bg: "#e4e9f5", accent: "#3a4d7a", text: "#1f2a44" },
      { name: "Sage", bg: "#e8f0e4", accent: "#5f7d4f", text: "#2f4227" },
    ),
  },
  {
    id: "squad",
    name: "Squad Strip",
    category: "Squad",
    decoration: "stripes",
    variants: trio(
      "squad",
      { name: "Volt", bg: "#14161a", accent: "#a3e635", text: "#f4f4f5" },
      { name: "Berry", bg: "#f3e8ff", accent: "#9333ea", text: "#4c1d95" },
      { name: "Ice", bg: "#e0f7fa", accent: "#0891b2", text: "#164e63" },
    ),
  },
];

export const getTemplate = (id: string): FrameTemplate =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

/** Layout hasil foto. */
export type LayoutId = "strip" | "grid" | "single";

export interface LayoutDef {
  id: LayoutId;
  name: string;
  desc: string;
}

export const LAYOUTS: LayoutDef[] = [
  { id: "strip", name: "Strip 4", desc: "4 foto vertikal klasik" },
  { id: "grid", name: "Grid 2×2", desc: "Empat foto dalam kotak" },
  { id: "single", name: "Single", desc: "Satu foto besar" },
];
