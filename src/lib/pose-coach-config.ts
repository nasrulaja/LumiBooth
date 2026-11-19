/**
 * LUMIBOOTH — Konfigurasi Pose Coach (TAHAP 5)
 * ============================================
 * Semua angka yang mungkin ingin di-tweak ada di sini, terpisah dari logic.
 * Ubah nilai di sini tanpa menyentuh komponen/hook mana pun.
 */

/* ------------------------------------------------------------------ */
/* Keypoint                                                            */
/* ------------------------------------------------------------------ */

/**
 * Urutan keypoint COCO yang dipakai MoveNet (17 titik).
 *
 *  0 nose            6 right_shoulder   12 right_hip
 *  1 left_eye        7 left_elbow       13 left_knee
 *  2 right_eye       8 right_elbow      14 right_knee
 *  3 left_ear        9 left_wrist       15 left_ankle
 *  4 right_ear      10 right_wrist      16 right_ankle
 *  5 left_shoulder  11 left_hip
 *
 * Catatan: "left"/"right" adalah kiri/kanan DARI SUDUT PANDANG ORANG yang
 * difoto, bukan dari sudut pandang kita yang melihat layar. Karena preview
 * di-mirror, sisi visualnya jadi terbalik — lihat CATATAN MIRROR di bawah.
 */
export const POSE_KEYPOINTS = [
  "nose",
  "left_eye",
  "right_eye",
  "left_ear",
  "right_ear",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
] as const;

export type PoseKeypointName = (typeof POSE_KEYPOINTS)[number];

/**
 * Subset keypoint yang dipakai untuk scoring & overlay.
 * Persyaratan TAHAP 5.1: bahu, siku, pergelangan tangan, pinggul, lutut.
 * Nose ikut disertakan karena membantu kestabilan skor & arah kepala.
 */
export const SCORED_KEYPOINTS: PoseKeypointName[] = [
  "nose",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
];

/** Pasangan keypoint untuk menggambar garis skeleton pada overlay. */
export const POSE_SKELETON_PAIRS: [PoseKeypointName, PoseKeypointName][] = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["right_hip", "right_knee"],
];

/* ------------------------------------------------------------------ */
/* Deteksi                                                             */
/* ------------------------------------------------------------------ */

export const DETECTION_CONFIG = {
  /** Model MoveNet yang dipakai: multipose agar bisa >1 orang. */
  modelType: "MultiPoseLightning",
  /** Jalankan inference maksimal sekian kali per detik (hemat CPU). */
  targetFps: 12,
  /** Confidence minimum sebuah keypoint dianggap valid. */
  minKeypointScore: 0.3,
  /**
   * Di bawah fps ini selama beberapa detik → auto-degrade ke mode Lite
   * (permintaan 26).
   */
  liteThresholdFps: 15,
  /** Butuh sekian detik berturut-turut lambat sebelum benar-benar degrade. */
  liteSustainMs: 4000,
  /** Resolusi input MoveNet multipose; lebih kecil = lebih cepat. */
  multiPoseMaxDimension: 256,
} as const;

/* ------------------------------------------------------------------ */
/* Skor & coaching                                                     */
/* ------------------------------------------------------------------ */

export const POSE_THRESHOLDS = {
  /** Skor di bawah ini memicu coaching text (permintaan 9). */
  coachingBelow: 70,
  /** Skor dianggap "match bagus" (warna hijau). */
  good: 85,
  /** Batas skor untuk warna kuning; di bawahnya merah. */
  fair: 60,
  /**
   * Auto-shutter menunggu skor minimal ini (permintaan 13).
   * Default OFF — angka ini hanya berlaku kalau user menyalakannya.
   */
  autoShutterScore: 85,
  /** Berapa lama pose harus stabil sebelum auto-shutter menembak. */
  autoShutterHoldMs: 1500,
  /** Interval update coaching text (permintaan 9). */
  coachingIntervalMs: 500,
  /**
   * Kalau skor berubah kurang dari ini, coaching tidak dianggap "baru" —
   * dipakai agar teks tidak berkedip-kedip.
   */
  coachingScoreEpsilon: 4,
} as const;

/* ------------------------------------------------------------------ */
/* Anti-kaku (permintaan 19)                                           */
/* ------------------------------------------------------------------ */

export const STIFF_POSE_CONFIG = {
  /** Setelah sekian foto beruntun memakai pose "jempol/peace" ... */
  threshold: 2,
  /**
   * ... tampilkan saran SEKALI saja. Disimpan di state supaya tidak
   * muncul lagi di sesi yang sama.
   */
  maxHints: 1,
} as const;

/* ------------------------------------------------------------------ */
/* Surprize Me (permintaan 20)                                         */
/* ------------------------------------------------------------------ */

export const SURPRISE_CONFIG = {
  /** Lama brief pose ditampilkan sebelum coaching mulai. */
  briefMs: 3000,
} as const;

/* ------------------------------------------------------------------ */
/* Teks UI                                                             */
/* ------------------------------------------------------------------ */

/**
 * Tagline wajib (permintaan 24). Ditaruh di config supaya konsisten di
 * semua tempat dan mudah diubah.
 */
export const POSE_COACH_TAGLINE =
  "Bebas gaya apa pun — LumiBooth cuma kasih saran kalau kamu butuh.";

/** Label tombol pembuka (permintaan 23). */
export const POSE_COACH_CTA = "Butuh ide pose? ✨";

/**
 * CATATAN MIRROR
 * --------------
 * Preview kamera di-mirror (CSS scaleX(-1)) supaya terasa seperti cermin.
 * MoveNet menerima frame video APA ADANYA (tidak mirror), jadi koordinat
 * keypoint ada di ruang "non-mirror".
 *
 * Untuk menggambar overlay di atas preview yang mirror, kita cukup menggambar
 * di kanvas dengan lebar sama lalu CSS `scaleX(-1)` pada kanvas overlay.
 * Dengan begitu keypoint "tangan kiri orang" akan tampak di sisi yang benar
 * secara visual, tanpa perlu membalik koordinat secara manual.
 */
export const MIRROR_OVERLAY_WITH_PREVIEW = true;

