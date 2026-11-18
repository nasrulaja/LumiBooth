/**
 * LUMIBOOTH — Deteksi pencahayaan & rekomendasi filter
 * ====================================================
 *
 * Konsep singkat:
 * 1. Setiap ~1 detik kita sampel frame video ke canvas kecil (mis. 64×48).
 * 2. Dari piksel-piksel itu kita hitung 4 metrik:
 *    - avgBrightness : rata-rata luminance (0–255)
 *    - colorTemp     : kecenderungan warm vs cool (dari selisih R vs B)
 *    - contrast      : standar deviasi luminance (0–sekitar 128)
 *    - colorfulness  : seberapa "warna-warni"/ramai sebuah frame
 * 3. Metrik dipetakan ke aturan rekomendasi (lihat RECOMMENDATION_RULES).
 * 4. UI menampilkan badge "✨ Recommended" pada filter yang cocok.
 */

export interface LightingAnalysis {
  /** 0–255. Rata-rata kecerahan (luminance Rec.601). */
  brightness: number;
  /** -1 (sangat cool/biru) .. +1 (sangat warm/kuning). */
  colorTemp: number;
  /** 0..~128. Standar deviasi luminance. */
  contrast: number;
  /** 0..~100. Estimasi tingkat "ramai" warna. */
  colorfulness: number;
  /** Label ringkas untuk UI, mis. "Gelap", "Netral". */
  label: string;
}

/** Ambang batas yang dipakai aturan rekomendasi. Ubah di sini bila perlu. */
export const LIGHTING_THRESHOLDS = {
  /** < 80 dianggap gelap. */
  dark: 80,
  /** > 180 dianggap terang/siang. */
  bright: 180,
  /** colorTemp > 0.08 dianggap warm (indoor / lampu kuning). */
  warm: 0.08,
  /** colorTemp < -0.08 dianggap cool. */
  cool: -0.08,
  /** contrast > 62 dianggap kontras tinggi. */
  highContrast: 62,
  /** colorfulness > 42 dianggap background ramai / warna-warni. */
  busy: 42,
} as const;

/**
 * Hitung nilai luminance tengah-sampel dari pixel canvas.
 * Memakai skip-sampling (tiap N pixel) supaya cepat di perangkat low-end.
 */
export function analyzeFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): LightingAnalysis {
  const { data } = ctx.getImageData(0, 0, width, height);
  const total = width * height;

  let sumL = 0;
  let sumL2 = 0;
  let sumR = 0;
  let sumB = 0;
  let sumRG = 0; // untuk colorfulness (rg = R - G)
  let sumYB = 0; // yb = 0.5*(R+G) - B

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Luminance Rec.601 — sesuai persepsi mata manusia.
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    sumL += l;
    sumL2 += l * l;
    sumR += r;
    sumB += b;
    sumRG += r - g;
    sumYB += 0.5 * (r + g) - b;
  }

  const brightness = sumL / total;
  const variance = Math.max(0, sumL2 / total - brightness * brightness);
  const contrast = Math.sqrt(variance);

  // Color temperature: normalisasi selisih rata-rata R & B ke -1..+1.
  // Jika R > B → gambar condong warm → nilai positif.
  const avgR = sumR / total;
  const avgB = sumB / total;
  const colorTemp = Math.max(-1, Math.min(1, (avgR - avgB) / 128));

  // Colorfulness: rata-rata magnitudo dua sumbu warna (Hasler & Süsstrunk).
  const meanRG = sumRG / total;
  const meanYB = sumYB / total;
  const colorfulness = Math.min(100, Math.sqrt(meanRG * meanRG + meanYB * meanYB));

  return {
    brightness,
    colorTemp,
    contrast,
    colorfulness,
    label: describeLighting(brightness, colorTemp),
  };
}

/** Label manusiawi untuk indikator UI. */
export function describeLighting(brightness: number, colorTemp: number): string {
  const t = LIGHTING_THRESHOLDS;
  if (brightness < t.dark) return "Gelap";
  if (brightness > t.bright) return "Sangat terang";
  if (colorTemp > t.warm) return "Warm (indoor)";
  if (colorTemp < t.cool) return "Cool / dingin";
  return "Netral";
}
