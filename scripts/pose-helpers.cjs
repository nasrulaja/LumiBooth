/**
 * Helper pembentuk pose target untuk scripts/gen-poses.cjs
 * =======================================================
 * Koordinat dinormalisasi 0..1 terhadap bounding box orang:
 *   y=0 kepala atas, y=1 telapak kaki
 *   x=0 sisi kiri orang, x=1 sisi kanan orang
 * (kiri/kanan dari sudut pandang ORANG yang difoto)
 */

const round = (n) => Math.round(n * 1000) / 1000;

/**
 * Berdiri tegak, tangan di samping. Basis semua pose.
 * `cx` = titik tengah horizontal, `scale` = tinggi badan (0..1 dari frame).
 */
function baseBody(cx = 0.5, scale = 1) {
  const s = scale;
  return {
    nose: { x: cx, y: 0.09 * s },
    left_eye: { x: cx - 0.025, y: 0.075 * s },
    right_eye: { x: cx + 0.025, y: 0.075 * s },
    left_ear: { x: cx - 0.055, y: 0.085 * s },
    right_ear: { x: cx + 0.055, y: 0.085 * s },
    left_shoulder: { x: cx - 0.11, y: 0.2 * s },
    right_shoulder: { x: cx + 0.11, y: 0.2 * s },
    left_elbow: { x: cx - 0.14, y: 0.34 * s },
    right_elbow: { x: cx + 0.14, y: 0.34 * s },
    left_wrist: { x: cx - 0.15, y: 0.47 * s },
    right_wrist: { x: cx + 0.15, y: 0.47 * s },
    left_hip: { x: cx - 0.075, y: 0.5 * s },
    right_hip: { x: cx + 0.075, y: 0.5 * s },
    left_knee: { x: cx - 0.07, y: 0.74 * s },
    right_knee: { x: cx + 0.07, y: 0.74 * s },
    left_ankle: { x: cx - 0.065, y: 0.98 * s },
    right_ankle: { x: cx + 0.065, y: 0.98 * s },
  };
}

/** Salin body lalu timpa keypoint tertentu. */
function body(cx, scale, overrides) {
  return { ...baseBody(cx, scale), ...overrides };
}

/** Bulatkan koordinat + tambahkan score 1 (target pose ideal). */
function withScore(skeleton) {
  const out = {};
  for (const [k, v] of Object.entries(skeleton)) {
    out[k] = { x: round(v.x), y: round(v.y), score: 1 };
  }
  return out;
}

module.exports = { baseBody, body, withScore, round };
