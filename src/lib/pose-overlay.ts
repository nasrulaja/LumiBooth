/**
 * LUMIBOOTH — Overlay skeleton (TAHAP 5.4)
 * =======================================
 * Menggambar siluet/garis skeleton pose target di atas preview kamera.
 *
 * ADAPTIF: posisi target tidak dipaku di tengah layar. Untuk tiap orang kita
 * ambil bounding box TUBUH USER yang terdeteksi lalu menggambar skeleton
 * target di dalam box itu — jadi overlay ikut meregang dan bergeser mengikuti
 * posisi & ukuran badan user, bukan melayang di tempat.
 *
 * Kanvas overlay memakai ukuran intrinsik = ukuran video asli, dan CSS
 * `scaleX(-1)` dipasang agar sejajar dengan preview yang di-mirror.
 */
import { POSE_SKELETON_PAIRS } from "./pose-coach-config";
import type { DetectedPose, PoseSkeleton } from "./pose-types";

export interface OverlayDrawOptions {
  /**
   * Pose target. Boleh berisi satu skeleton (solo) atau beberapa (group).
   * Skeleton ke-i dipasangkan dengan orang ke-i (urut kiri→kanan).
   */
  targets: PoseSkeleton[];
  /** Orang yang terdeteksi (untuk menempelkan overlay ke posisi user). */
  poses: DetectedPose[];
  /** Skor 0..100 untuk memilih warna. */
  score: number;
}

/**
 * Skala 0..1 → warna merah → kuning → hijau (permintaan 6).
 * Warna dipakai baik untuk progress bar maupun garis overlay.
 */
export function scoreColor(score: number, alpha = 1): string {
  if (score >= 85) return `rgba(52, 211, 153, ${alpha})`; // emerald-400
  if (score >= 60) return `rgba(250, 204, 21, ${alpha})`; // yellow-400
  return `rgba(248, 113, 113, ${alpha})`; // red-400
}

/**
 * Gambar ulang overlay di kanvas.
 *
 * @param canvas kanvas overlay (width/height harus = ukuran video intrinsik)
 * @param opts   target pose + deteksi user
 */
export function drawOverlay(
  canvas: HTMLCanvasElement,
  opts: OverlayDrawOptions,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const { targets, poses, score } = opts;
  if (!targets.length) return;

  /*
   * Tentukan bounding box per skeleton:
   *  - Ada orang terdeteksi → pakai box orang tsb (overlay adaptive).
   *  - Tidak ada (mode Lite/fallback) → box tengah sebagai panduan statis.
   */
  const fallbackBoxes = targets.map((_, i) => {
    const n = targets.length;
    const slot = 1 / n;
    return { xMin: slot * i + 0.06, yMin: 0.12, xMax: slot * (i + 1) - 0.06, yMax: 0.94 };
  });

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = scoreColor(score, 0.85);
  ctx.fillStyle = scoreColor(score, 0.95);
  ctx.lineWidth = Math.max(2, W * 0.004);
  const dotRadius = Math.max(2, W * 0.0035);

  targets.forEach((skeleton, i) => {
    const box = poses[i]?.box ?? fallbackBoxes[i] ?? fallbackBoxes[0];

    /** Normalisasi (0..1) → piksel kanvas, di dalam box orang ini. */
    const toPixel = (p: { x: number; y: number }) => ({
      x: (box.xMin + p.x * (box.xMax - box.xMin)) * W,
      y: (box.yMin + p.y * (box.yMax - box.yMin)) * H,
    });

    // Garis skeleton.
    for (const [a, b] of POSE_SKELETON_PAIRS) {
      const pa = skeleton[a];
      const pb = skeleton[b];
      if (!pa || !pb) continue;
      const A = toPixel(pa);
      const B = toPixel(pb);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }

    // Titik keypoint.
    for (const [, name] of POSE_SKELETON_PAIRS) {
      const p = skeleton[name];
      if (!p) continue;
      const { x, y } = toPixel(p);
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

