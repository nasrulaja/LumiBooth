/**
 * LUMIBOOTH — Mesin rekomendasi filter
 * ====================================
 * Menerjemahkan hasil `LightingAnalysis` menjadi daftar id filter yang
 * disarankan. Setiap aturan punya alasan (reason) supaya UI bisa menjelaskan
 * kenapa sebuah filter direkomendasikan.
 *
 * Aturan (prioritas bawah → atas, semua bisa aktif bersamaan):
 *  - brightness < 80  → "warm"  (Warm & Brightening)  → tujuan: menaikkan cahaya
 *  - brightness > 180 → "soft"  (Soft & Vivid)        → redam kecerahan berlebih
 *  - colorTemp warm   → "cool"  (Cool Tone)           → menyeimbangkan lampu kuning
 *  - kontras tinggi / warna ramai → "clean" (Clean & Minimal)
 */
import type { LightingAnalysis } from "./lighting";
import { LIGHTING_THRESHOLDS } from "./lighting";

export interface Recommendation {
  filterId: string;
  reason: string;
}

export function recommendFilters(a: LightingAnalysis): Recommendation[] {
  const t = LIGHTING_THRESHOLDS;
  const out: Recommendation[] = [];

  // RULE 1 — Gelap: prioritaskan filter yang menaikkan kecerahan & kehangatan.
  if (a.brightness < t.dark) {
    out.push({
      filterId: "warm",
      reason: `Cahaya redup (${Math.round(a.brightness)}). Warm & Brightening menaikkan exposure.`,
    });
  }

  // RULE 2 — Terang/siang: hindari blown-out, pilih soft-vivid.
  if (a.brightness > t.bright) {
    out.push({
      filterId: "soft",
      reason: `Cahaya sangat terang (${Math.round(a.brightness)}). Soft & Vivid meredam highlight.`,
    });
  }

  // RULE 3 — Warm (indoor/lampu kuning): imbangi dengan tone dingin.
  if (a.colorTemp > t.warm) {
    out.push({
      filterId: "cool",
      reason: "Dominan kuning/warm. Cool Tone menyeimbangkan white balance.",
    });
  }

  // RULE 4 — Kontras tinggi atau warna ramai: sederhanakan look.
  if (a.contrast > t.highContrast || a.colorfulness > t.busy) {
    out.push({
      filterId: "clean",
      reason: "Kontras tinggi / background ramai. Clean & Minimal bikin fokus.",
    });
  }

  // Dedup sambil jaga urutan & alasan pertama.
  const seen = new Set<string>();
  const unique = out.filter((r) => {
    if (seen.has(r.filterId)) return false;
    seen.add(r.filterId);
    return true;
  });

  return unique;
}

/** Cek cepat apakah sebuah filter sedang direkomendasikan. */
export function isRecommended(recs: Recommendation[], id: string): boolean {
  return recs.some((r) => r.filterId === id);
}
