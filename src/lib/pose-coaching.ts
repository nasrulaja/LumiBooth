/**
 * LUMIBOOTH — Coaching text (TAHAP 5.3)
 * ====================================
 * Aturan main:
 *  - Coaching HANYA muncul kalau user memilih pose target (permintaan 8).
 *  - Maksimal 6–8 kata per instruksi (permintaan 9).
 *  - Instruksi spesifik berdasarkan keypoint yang paling meleset.
 *  - Kalau user diam/abaikan (skor tidak berubah), coaching tidak diulang
 *    terus — itu tugas state, tapi di sini kita sediakan pembanding
 *    `shouldRefreshCoaching()`.
 */
import { SCORED_KEYPOINTS, type PoseKeypointName } from "./pose-coach-config";
import type { DetectedPose, PoseSkeleton } from "./pose-types";

/** Arah koreksi untuk satu anggota tubuh. */
type Correction = { text: string; weight: number };

/** Label bahasa Indonesia untuk bagian tubuh. */
const BODY_LABEL: Partial<Record<PoseKeypointName, string>> = {
  nose: "kepala",
  left_shoulder: "bahu kiri",
  right_shoulder: "bahu kanan",
  left_elbow: "siku kiri",
  right_elbow: "siku kanan",
  left_wrist: "tangan kiri",
  right_wrist: "tangan kanan",
  left_hip: "pinggang kiri",
  right_hip: "pinggang kanan",
  left_knee: "lutut kiri",
  right_knee: "lutut kanan",
};

/**
 * Terjemahkan selisih posisi (dx, dy) jadi kata arah yang manusiawi.
 * `dx` positif = keypoint user ada di kanan posisi target.
 */
function directionWord(dx: number, dy: number): string {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax > ay * 1.6) return dx > 0 ? "geser kiri" : "geser kanan";
  if (ay > ax * 1.6) return dy > 0 ? "angkat" : "turunkan";
  if (dx > 0 && dy > 0) return "angkat ke kiri";
  if (dx > 0 && dy < 0) return "turunkan ke kiri";
  if (dx < 0 && dy > 0) return "angkat ke kanan";
  return "turunkan ke kanan";
}

/**
 * Buat satu instruksi singkat dari keypoint yang paling meleset.
 * Return null kalau pose sudah cukup mirip atau data kurang.
 */
export function buildCoaching(
  target: PoseSkeleton,
  detected: DetectedPose,
  score: number,
  minScore = 0.3,
): string | null {
  // Kalau skor sudah bagus, tidak perlu instruksi.
  if (score >= 70) return null;

  const corrections: Correction[] = [];

  for (const name of SCORED_KEYPOINTS) {
    const t = target[name];
    const d = detected.keypoints[name];
    if (!t || !d || d.score < minScore) continue;

    const dx = d.x - t.x;
    const dy = d.y - t.y;
    const dist = Math.hypot(dx, dy);
    // Abaikan selisih kecil — bikin coaching berisik.
    if (dist < 0.06) continue;

    const label = BODY_LABEL[name];
    if (!label) continue;

    corrections.push({
      text: `${capitalize(directionWord(dx, dy))} ${label}`,
      weight: dist,
    });
  }

  if (!corrections.length) return null;

  // Ambil kesalahan paling besar — satu instruksi saja, jangan menjejalkan.
  corrections.sort((a, b) => b.weight - a.weight);
  return limitWords(corrections[0].text, 8);
}

/** Kapitalkan huruf pertama. */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Potong kalimat jadi maksimal `max` kata (permintaan 9). */
export function limitWords(text: string, max = 8): string {
  const words = text.trim().split(/\s+/);
  return words.length <= max ? words.join(" ") : words.slice(0, max).join(" ");
}

/**
 * Tentukan apakah coaching perlu di-update.
 *
 * Aturan anti-spam (permintaan 10): teks baru hanya dipakai kalau
 * BERBEDA dari teks sebelumnya, atau skor berubah cukup banyak. Kalau user
 * diam dan pose tidak berubah, coaching tetap tenang.
 */
export function shouldRefreshCoaching(
  previous: string | null,
  next: string | null,
  prevScore: number,
  nextScore: number,
  epsilon: number,
): boolean {
  if (next === null) return previous !== null; // sembunyikan
  if (previous === null) return true; // munculkan
  if (next !== previous) return true; // instruksi baru
  return Math.abs(nextScore - prevScore) >= epsilon;
}
