/**
 * LUMIBOOTH — Deteksi gestur sederhana (TAHAP 5.7 anti-kaku)
 * =========================================================
 * MoveNet TIDAK memberikan keypoint jari, jadi kita tidak bisa benar-benar
 * mengenali "jempol" atau "peace". Yang bisa kita lakukan adalah heuristik
 * dari posisi pergelangan tangan relatif ke wajah/bahu:
 *
 *   - Tangan di dekat wajah (tinggi ~ kepala) + jarak horizontal kecil
 *     → sangat khas gestur peace di pipi / jempol di depan muka.
 *   - Kedua tangan naik ke area dada–kepala → juga pola gestur "gaya" klasik.
 *
 * Heuristik ini sengaja longgar dan HANYA dipakai untuk menghitung berapa
 * kali user memakai pose serupa. Tidak pernah memblokir apa pun — hanya
 * memicu satu saran ringan yang bisa di-dismiss (permintaan 19).
 */
import type { DetectedPose } from "./pose-types";

export type GestureKind = "peace-or-thumb" | "none";

/**
 * Klasifikasikan gestur dominan dari satu pose terdeteksi.
 * Return "peace-or-thumb" bila salah satu pergelangan tangan berada
 * dekat kepala (khas peace/jempol di depan wajah).
 */
export function classifyGesture(pose: DetectedPose): GestureKind {
  const nose = pose.keypoints.nose;
  const lw = pose.keypoints.left_wrist;
  const rw = pose.keypoints.right_wrist;
  if (!nose) return "none";

  const nearHead = (w?: { x: number; y: number; score: number }) => {
    if (!w || w.score < 0.35) return false;
    // Pergelangan selevel/lebih tinggi dari dagu dan dekat secara horizontal.
    const dyUp = nose.y - w.y; // positif = tangan di atas hidung
    const dx = Math.abs(w.x - nose.x);
    return dyUp > -0.12 && dyUp < 0.16 && dx < 0.22;
  };

  if (nearHead(lw) || nearHead(rw)) return "peace-or-thumb";
  return "none";
}

/**
 * Cek apakah frame saat ini menunjukkan gestur "peace/jempol".
 * Dipakai Photobooth saat menyimpan foto untuk menghitung streak.
 */
export function isPeaceOrThumbFrame(poses: DetectedPose[]): boolean {
  if (!poses.length) return false;
  // Cukup satu orang yang gesturnya jelas → dianggap foto gaya peace/jempol.
  return poses.some((p) => classifyGesture(p) === "peace-or-thumb");
}
