/**
 * LUMIBOOTH — Tipe data Pose Coach (TAHAP 5)
 * ==========================================
 * Semua bentuk data untuk pose library, skor, dan state coach.
 */
import type { PoseKeypointName } from "./pose-coach-config";

/** Kategori jumlah orang. */
export type PoseCategory = "solo" | "couple" | "trio" | "squad";

/** Tingkat kesulitan pose (permintaan 17). */
export type PoseDifficulty = "Easy" | "Medium";

/** Tag vibe untuk filter rekomendasi (permintaan 17). */
export type PoseVibe = "elegan" | "playful" | "street" | "y2k";

/**
 * Satu keypoint di sebuah pose target.
 * Koordinat dinormalisasi 0..1 terhadap bounding box tubuh orang tsb,
 * sehingga tidak bergantung pada resolusi kamera atau posisi di frame.
 */
export interface PoseKeypoint {
  x: number;
  y: number;
  /** 0..1. Keypoint dengan score rendah dilewati saat scoring. */
  score?: number;
}

/** Target pose untuk satu orang. */
export type PoseSkeleton = Partial<Record<PoseKeypointName, PoseKeypoint>>;

/** Satu pose di library. */
export interface PoseDefinition {
  id: string;
  title: string;
  /** Deskripsi singkat 1 kalimat. */
  description: string;
  category: PoseCategory;
  difficulty: PoseDifficulty;
  tags: PoseVibe[];
  /**
   * Target keypoint. Untuk pose multi-orang berisi beberapa skeleton,
   * diurutkan kiri→kanan supaya bisa dicocokkan ke deteksi.
   */
  skeletons: PoseSkeleton[];
}

/** Keypoint hasil deteksi MoveNet di satu frame. */
export interface DetectedKeypoint {
  x: number;
  y: number;
  score: number;
}

/** Satu orang yang terdeteksi. */
export interface DetectedPose {
  /** Skor rata-rata keypoint yang terlihat. */
  score: number;
  keypoints: Partial<Record<PoseKeypointName, DetectedKeypoint>>;
  /** Bounding box normalisasi untuk menggeser overlay. */
  box: { xMin: number; yMin: number; xMax: number; yMax: number };
}

/** Hasil lengkap satu frame analisis. */
export interface PoseFrame {
  poses: DetectedPose[];
  /** Jumlah wajah dari BlazeFace (bisa beda dengan poses). */
  faceCount: number;
  /** Skor kemiripan 0..100 per orang terhadap pose target. */
  scores: number[];
  /** Skor gabungan (rata-rata) — yang ditampilkan di UI. */
  overall: number;
  /** Timestamp performance.now() saat frame dianalisis. */
  at: number;
}
