/**
 * Test klasifikasi cahaya → rekomendasi filter.
 * Jalankan: node scripts/test-lighting.cjs
 *
 * Kompilasi src/lib ditangani scripts/lib-test-helper.cjs (alias @/* + JSON).
 */
const fs = require("fs");
const path = require("path");
const { compileLib, cleanup, tmp } = require("./lib-test-helper.cjs");


let fail = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "✓" : "✗"} ${name}${cond ? "" : " " + detail}`);
  if (!cond) fail++;
};

try {
  console.log("Mengompilasi src/lib …");
  compileLib();

  // Hasil compile bersarang: .tmp-test/lib/*.js
  const base = path.join(tmp, "lib");
  const { describeLighting, LIGHTING_THRESHOLDS } = require(path.join(base, "lighting.js"));
  const { recommendFilters } = require(path.join(base, "recommendations.js"));

  console.log("\nTAHAP 2 — lighting & recommendation tests\n");
  console.log("Thresholds:", JSON.stringify(LIGHTING_THRESHOLDS), "\n");

  /** Bangun LightingAnalysis dari metrik mentah. */
  const makeAnalysis = (m) => ({
    ...m,
    label: describeLighting(m.brightness, m.colorTemp),
  });

  const cases = [
    {
      name: "gelap",
      m: { brightness: 40, contrast: 30, colorTemp: 0, colorfulness: 20 },
      label: "Gelap",
      filter: "warm",
    },
    {
      name: "terang",
      m: { brightness: 220, contrast: 40, colorTemp: 0, colorfulness: 30 },
      label: "Sangat terang",
      filter: "soft",
    },
    {
      name: "hangat",
      m: { brightness: 130, contrast: 40, colorTemp: 0.5, colorfulness: 30 },
      label: "Warm (indoor)",
      filter: "cool",
    },
    {
      name: "dingin",
      // Belum ada aturan khusus untuk tone dingin — tidak ada rekomendasi.
      m: { brightness: 130, contrast: 40, colorTemp: -0.5, colorfulness: 30 },
      label: "Cool / dingin",
      filter: null,
    },
    {
      name: "ramai",
      // Label hanya bergantung pada brightness & colorTemp → Netral.
      // Rekomendasi "clean" tetap muncul karena colorfulness tinggi.
      m: { brightness: 130, contrast: 40, colorTemp: 0, colorfulness: 90 },
      label: "Netral",
      filter: "clean",
    },
    {
      name: "kontras tinggi",
      m: { brightness: 130, contrast: 80, colorTemp: 0, colorfulness: 30 },
      label: "Netral",
      filter: "clean",
    },
    {
      name: "netral",
      m: { brightness: 130, contrast: 35, colorTemp: 0.01, colorfulness: 30 },
      label: "Netral",
      filter: null, // tidak ada masalah → tanpa rekomendasi khusus
    },
  ];

  for (const c of cases) {
    const a = makeAnalysis(c.m);
    ok(`${c.name}: label "${c.label}"`, a.label === c.label, `(dapat "${a.label}")`);

    const recs = recommendFilters(a);
    if (c.filter) {
      ok(
        `${c.name}: rekomendasi memuat "${c.filter}"`,
        recs.some((r) => r.filterId === c.filter),
        `(${recs.map((r) => r.filterId).join(", ") || "kosong"})`,
      );
    } else {
      ok(
        `${c.name}: tanpa rekomendasi khusus`,
        recs.length === 0,
        `(${recs.map((r) => r.filterId).join(", ")})`,
      );
    }
    ok(`${c.name}: ada alasan`, recs.every((r) => r.reason.length > 0));
  }
} finally {
  cleanup();
}

console.log(fail === 0 ? "\nALL PASSED ✅" : `\n${fail} FAILED ❌`);
process.exit(fail === 0 ? 0 : 1);
