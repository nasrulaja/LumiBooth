/**
 * LUMIBOOTH — Pose matching (TAHAP 5.2)
 * ====================================
 * Menghitung kemiripan pose user vs pose target memakai COSINE SIMILARITY.
 *
 * ---------------------------------------------------------------
 * CARA KERJA COSINE SIMILARITY UNTUK POSE
 * ---------------------------------------------------------------
 * Tiap pose direpresentasikan sebagai satu vektor angka panjang:
 *
 *   v = [ nose.x, nose.y, lShoulder.x, lShoulder.y, ..., rKnee.x, rKnee.y ]
 *
 * Jadi untuk 11 keypoint yang di-score → vektor 22 dimensi.
 *
 * Cosine similarity mengukur SUDUT antara dua vektor, bukan jaraknya:
 *
 *   cos(θ) = (A · B) / (‖A‖ · ‖B‖)
 *
 * Nilainya -1..1, lalu dipetakan ke 0..100%.
 *
 * Kenapa cosine dan bukan jarak Euclidean biasa?
 *  - Cosine tahan terhadap skala: orang yang lebih tinggi/pendek, atau kamera
 *    lebih jauh, tidak otomatis dapat skor jelek — yang dinilai adalah BENTUK
 *    pose (arah & proporsi relatif), bukan ukuran.
 *  - Karena itu sebelum dihitung, tiap vektor DIPUSATKAN & DINORMALISASI:
 *      1. Kurangi rata-rata tiap sumbu  → vektor jadi relatif thd titik pusat
 *      2. Bagi dengan magnitude rata-rata → skala seragam
 *    Langkah ini membuat "lebih tinggi 20%" tidak mengubah skor.
 *
 * CATATAN KETERBATASAN (jujur, ini hiburan bukan penjurian):
 *  - Keypoint yang tidak terlihat (score rendah) dilewati. Kalau sebagian
 *    besar hilang, skor dikembalikan 0 dan UI tidak menampilkan apa-apa.
 *  - Pose cermin (tangan kiri diangkat vs tangan kanan) akan dapat skor
 *    rendah — ini memang kein, karena kita menilai per keypoint.
 */
import { SCORED_KEYPOINTS, type PoseKeypointName } from "./pose-coach-config";
import type {
  DetectedPose,
  PoseDefinition,
  PoseSkeleton,
} from "./pose-types";

/** Satu pasangan keypoint target + deteksi yang sama-sama valid. */
interface KeypointPair {
  name: PoseKeypointName;
  target: { x: number; y: number };
  detected: { x: number; y: number };
}

/**
 * Kumpulkan pasangan keypoint yang ada di KEDUA sisi (target & deteksi)
 * dan confidence deteksinya cukup tinggi.
 */
function collectPairs(
  target: PoseSkeleton,
  detected: DetectedPose,
  minScore: number,
): KeypointPair[] {
  const pairs: KeypointPair[] = [];
  for (const name of SCORED_KEYPOINTS) {
    const t = target[name];
    const d = detected.keypoints[name];
    if (!t || !d) continue;
    if (d.score < minScore) continue;
    pairs.push({ name, target: t, detected: d });
  }
  return pairs;
}

/**
 * Ubah pasangan keypoint jadi satu vektor datar [x0,y0,x1,y1,...]
 * untuk satu sisi (target atau deteksi).
 */
function toVector(pairs: KeypointPair[], side: "target" | "detected"): number[] {
  const v: number[] = [];
  for (const p of pairs) {
    const pt = p[side];
    v.push(pt.x, pt.y);
  }
  return v;
}

/**
 * Pusatkan (mean-center) lalu normalisasi skala sebuah vektor.
 *
 * Pusatkan: kurangi rata-rata SUMBU X dan SUMBU Y secara terpisah, supaya
 * pose yang bergeser di frame tetap dianggap sama.
 *
 * Normalisasi: bagi dengan magnitude rata-rata sehingga pose besar/kecil
 * menghasilkan vektor sebanding.
 */
function centerAndNormalize(vec: number[]): number[] {
  if (vec.length < 4) return vec;
  const n = vec.length / 2;
  let meanX = 0;
  let meanY = 0;
  for (let i = 0; i < vec.length; i += 2) {
    meanX += vec[i];
    meanY += vec[i + 1];
  }
  meanX /= n;
  meanY /= n;

  const centered = new Array<number>(vec.length);
  let magnitude = 0;
  for (let i = 0; i < vec.length; i += 2) {
    const x = vec[i] - meanX;
    const y = vec[i + 1] - meanY;
    centered[i] = x;
    centered[i + 1] = y;
    magnitude += Math.hypot(x, y);
  }
  magnitude /= n;
  if (magnitude < 1e-6) return centered;

  for (let i = 0; i < centered.length; i++) centered[i] /= magnitude;
  return centered;
}

/** Dot product dua vektor yang panjangnya sama. */
function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/** Panjang (L2 norm) sebuah vektor. */
function norm(a: number[]): number {
  return Math.sqrt(dot(a, a));
}

/**
 * Cosine similarity 0..1 antara pose target & pose terdeteksi.
 *
 * PERHATIAN soal sensitivitas
 * ---------------------------
 * Cosine murni sangat toleran: pose "peace di pipi" vs "tangan di pinggang"
 * bisa tetap ~0.94 karena bentuk global tubuh mirip. Untuk pose matching kita
 * butuh metrik yang lebih tegas, jadi skor akhir =
 *
 *     skor = cosine_dinormalisasi × kesesuaian_per_keypoint
 *
 * - `cosine_dinormalisasi` = (cos + 1) / 2 → mengukur kemiripan BENTUK global.
 * - `kesesuaian_per_keypoint` = rata-rata (1 - jarak/0.5) per keypoint,
 *   dihitung pada koordinat yang sudah dipusatkan & diskalakan. Ini yang
 *   membuat "tangan naik vs tangan di pinggang" benar-benar berbeda.
 *
 * Hasilnya tetap 0..100% dan pose identik tetap ~100%.
 */
export function poseSimilarity(
  target: PoseSkeleton,
  detected: DetectedPose,
  minScore = 0.3,
): number {
  const pairs = collectPairs(target, detected, minScore);
  // Butuh minimal 4 keypoint (= 8 angka) agar skor ada artinya.
  if (pairs.length < 4) return 0;

  const a = centerAndNormalize(toVector(pairs, "target"));
  const b = centerAndNormalize(toVector(pairs, "detected"));

  const na = norm(a);
  const nb = norm(b);
  if (na < 1e-9 || nb < 1e-9) return 0;

  const cos = dot(a, b) / (na * nb);
  // Petakan [-1,1] → [0,1], lalu clamp untuk keamanan floating point.
  const cosine01 = Math.min(1, Math.max(0, (cos + 1) / 2));

  /*
   * Kesesuaian per keypoint: jarak Euclidean antara posisi target dan
   * posisi user SETELAH dipusatkan & diskalakan. Jarak 0 → cocok sempurna,
   * jarak ≥ 0.5 → dianggap tidak cocok (0).
   */
  let closeness = 0;
  const n = a.length / 2;
  for (let i = 0; i < a.length; i += 2) {
    const d = Math.hypot(a[i] - b[i], a[i + 1] - b[i + 1]);
    closeness += Math.max(0, 1 - d / 0.5);
  }
  closeness /= n || 1;

  // Gabungkan: bentuk global × ketepatan tiap anggota tubuh.
  const combined = cosine01 * closeness;
  return Math.min(1, Math.max(0, combined));
}

/**
 * Skor kemiripan untuk SATU orang terhadap pose target multi-skeleton.
 *
 * Untuk pose berisi beberapa orang, orang ke-i dicocokkan dengan skeleton
 * ke-i (library sudah diurutkan kiri→kanan), tapi kalau jumlahnya tidak
 * sama kita pakai pencocokan terbaik (greedy) supaya tetap adil.
 */
export function scorePersonAgainstPose(
  pose: PoseDefinition,
  personIndex: number,
  personCount: number,
  detected: DetectedPose,
  minScore = 0.3,
): number {
  const skeletons = pose.skeletons;
  if (!skeletons.length) return 0;

  // Jumlah orang cocok → pasangan langsung by index.
  if (skeletons.length === personCount) {
    return poseSimilarity(skeletons[personIndex], detected, minScore) * 100;
  }

  // Jumlah tidak cocok → ambil kemiripan tertinggi terhadap skeleton mana pun.
  let best = 0;
  for (const sk of skeletons) {
    const s = poseSimilarity(sk, detected, minScore);
    if (s > best) best = s;
  }
  return best * 100;
}
