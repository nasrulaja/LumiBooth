/**
 * LUMIBOOTH — Detector engine (TAHAP 5.1, 5.6, 5.10)
 * ================================================
 * Membungkus TensorFlow.js MoveNet (MultiPose) + BlazeFace.
 *
 * PRIVASI: semua inference jalan di perangkat. Yang diunduh dari internet
 * hanyalah BOBOT MODEL (sekali, lalu di-cache browser). Tidak ada frame
 * video, gambar, atau keypoint yang pernah dikirim ke server mana pun.
 *
 * Modul ini sengaja "plain" (bukan React) supaya bisa dipakai lintas hook
 * dan tidak memicu re-render.
 */
import {
  DETECTION_CONFIG,
  SCORED_KEYPOINTS,
  type PoseKeypointName,
} from "./pose-coach-config";
import type { DetectedKeypoint, DetectedPose } from "./pose-types";

/* Tipe minimal untuk hasil model TFJS — kita tidak meng-import type internal
 * supaya bundle tetap ringan (dynamic import dipakai di loadDetectors). */

interface RawKeypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

interface RawPose {
  keypoints: RawKeypoint[];
  score?: number;
  box?: { xMin: number; yMin: number; xMax: number; yMax: number };
}

interface RawFace {
  box: { xMin: number; yMin: number; xMax: number; yMax: number };
  score?: number;
}

export type EngineStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error"
  | "lite";

export interface DetectorBundle {
  /** MoveNet detector (pose). */
  estimatePoses: (input: HTMLVideoElement) => Promise<RawPose[]>;
  /** BlazeFace detector (jumlah wajah). */
  estimateFaces: (input: HTMLVideoElement) => Promise<RawFace[]>;
  /** Lepas model dari memori. */
  dispose: () => void;
}

/**
 * Muat kedua model secara lazy.
 * Kalau MoveNet gagal, kita tetap bisa jalan dalam mode Lite (BlazeFace
 * saja) — jadi kegagalan pose tidak mematikan fitur sepenuhnya.
 */
export async function loadDetectors(): Promise<DetectorBundle> {
  // `@tensorflow/tfjs` diimpor sebagai efek samping agar backend WebGL/CPU
  // terdaftar sebelum model dimuat. Tanpa ini createDetector bisa gagal.
  const [, poseDetection, faceDetection] = await Promise.all([
    import("@tensorflow/tfjs"),
    import("@tensorflow-models/pose-detection"),
    import("@tensorflow-models/face-detection"),
  ]);

  let poseDetector: {
    estimatePoses: (i: HTMLVideoElement) => Promise<RawPose[]>;
    dispose?: () => void;
  } | null = null;
  let faceDetector: {
    estimateFaces: (i: HTMLVideoElement) => Promise<RawFace[]>;
    dispose?: () => void;
  } | null = null;

  // --- MoveNet MultiPose -------------------------------------------------
  try {
    poseDetector = (await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: DETECTION_CONFIG.modelType,
        enableSmoothing: true,
        multiPoseMaxDimension: DETECTION_CONFIG.multiPoseMaxDimension,
        minPoseScore: 0.2,
      },
    )) as unknown as typeof poseDetector;
  } catch (err) {
    console.warn("[pose-coach] MoveNet gagal dimuat, lanjut tanpa pose:", err);
  }

  // --- BlazeFace ---------------------------------------------------------
  try {
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    faceDetector = (await faceDetection.createDetector(model, {
      runtime: "tfjs",
      maxFaces: 8,
    })) as unknown as typeof faceDetector;
  } catch (err) {
    console.warn("[pose-coach] BlazeFace gagal dimuat:", err);
  }

  return {
    estimatePoses: async (input) =>
      poseDetector ? await poseDetector.estimatePoses(input) : [],
    estimateFaces: async (input) =>
      faceDetector ? await faceDetector.estimateFaces(input) : [],
    dispose: () => {
      poseDetector?.dispose?.();
      faceDetector?.dispose?.();
      poseDetector = null;
      faceDetector = null;
    },
  };
}

/**
 * Normalisasi hasil MoveNet jadi `DetectedPose[]`.
 *
 * MoveNet mengembalikan keypoint dengan `name` (string COCO). Kita petakan
 * ke tipe yang aman dan hitung bounding box + skor rata-rata.
 */
export function normalizePoses(
  raw: RawPose[],
  videoWidth: number,
  videoHeight: number,
): DetectedPose[] {
  const out: DetectedPose[] = [];
  const w = videoWidth || 1;
  const h = videoHeight || 1;

  for (const p of raw) {
    const keypoints: Partial<Record<PoseKeypointName, DetectedKeypoint>> = {};
    let count = 0;
    let xMin = 1;
    let yMin = 1;
    let xMax = 0;
    let yMax = 0;

    for (const kp of p.keypoints) {
      const name = kp.name as PoseKeypointName | undefined;
      if (!name) continue;
      const score = kp.score ?? 0;
      // Normalisasi ke 0..1 supaya UI tidak bergantung resolusi.
      const nx = kp.x / w;
      const ny = kp.y / h;
      keypoints[name] = { x: nx, y: ny, score };
      if (score < DETECTION_CONFIG.minKeypointScore) continue;
      count += 1;
      if (nx < xMin) xMin = nx;
      if (ny < yMin) yMin = ny;
      if (nx > xMax) xMax = nx;
      if (ny > yMax) yMax = ny;
    }

    if (!count) continue;
    // Skor rata-rata hanya dari keypoint yang dipakai untuk matching.
    const usedScores = SCORED_KEYPOINTS.map((n) => keypoints[n]?.score ?? 0);
    const avg =
      usedScores.reduce((a, b) => a + b, 0) / (usedScores.length || 1);

    out.push({
      score: avg,
      keypoints,
      box: { xMin, yMin, xMax, yMax },
    });
  }

  // Urutkan kiri→kanan supaya index konsisten dengan skeleton di library.
  return out.sort((a, b) => a.box.xMin - b.box.xMin);
}
