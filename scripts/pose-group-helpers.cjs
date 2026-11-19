/** Pose kategori TRIO (3 orang, 15 pose). */
const { body } = require("./pose-helpers.cjs");

/**
 * Sebar `n` orang merata secara horizontal lalu terapkan override pada
 * tubuh ke-i (0-indexed, kiri→kanan). overrides[i] boleh undefined.
 */
function lineUp(n, overrides, scale = 0.9) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const cx = (i + 0.5) / n;
    out.push(body(cx, scale, overrides[i] || {}));
  }
  return out;
}

/** Kedua tangan terangkat (selebrasi) pada posisi cx. */
const upArms = (cx) => ({
  left_elbow: { x: cx - 0.13, y: 0.15 },
  left_wrist: { x: cx - 0.15, y: 0.01 },
  right_elbow: { x: cx + 0.13, y: 0.15 },
  right_wrist: { x: cx + 0.15, y: 0.01 },
});

/** Peace sign tangan kanan. */
const peaceRight = (cx) => ({
  right_elbow: { x: cx + 0.13, y: 0.3 },
  right_wrist: { x: cx + 0.06, y: 0.13 },
});

/** Tangan di pinggang dua sisi. */
const handsOnHips = (cx) => ({
  left_elbow: { x: cx - 0.15, y: 0.33 },
  right_elbow: { x: cx + 0.15, y: 0.33 },
  left_wrist: { x: cx - 0.06, y: 0.48 },
  right_wrist: { x: cx + 0.06, y: 0.48 },
});

module.exports = { lineUp, upArms, peaceRight, handsOnHips, body };
