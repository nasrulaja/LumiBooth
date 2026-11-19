// Verify template data: 12+ templates, each >=3 color variants, 3 layouts,
// and every variant has required color fields.
// Run: node --experimental-strip-types scripts/test-templates.mts
import { TEMPLATES, LAYOUTS } from "../src/lib/templates.ts";

let fail = 0;
const ok = (name: string, cond: boolean, detail = "") => {
  console.log(`  ${cond ? "✓" : "✗"} ${name}${cond ? "" : " " + detail}`);
  if (!cond) fail++;
};

console.log("TAHAP 3 — template data tests\n");
ok("minimal 12 template", TEMPLATES.length >= 12, `(ada ${TEMPLATES.length})`);

const categories = new Set(TEMPLATES.map((t) => t.category));
for (const c of ["Minimal", "Retro", "Y2K", "Street", "Elegant", "Playful", "Couple", "Squad"]) {
  ok(`kategori ${c} ada`, categories.has(c as never));
}

for (const t of TEMPLATES) {
  ok(`${t.name}: >=3 varian`, t.variants.length >= 3, `(ada ${t.variants.length})`);
  const ids = new Set(t.variants.map((v) => v.id));
  ok(`${t.name}: id varian unik`, ids.size === t.variants.length);
  for (const v of t.variants) {
    ok(
      `${t.name}/${v.name}: warna lengkap`,
      Boolean(v.bg && v.accent && v.text),
    );
  }
}

ok("3 layout", LAYOUTS.length === 3);
ok(
  "layout strip/grid/single",
  ["strip", "grid", "single"].every((id) => LAYOUTS.some((l) => l.id === id)),
);

console.log(fail === 0 ? "\nALL PASSED ✅" : `\n${fail} FAILED ❌`);
process.exit(fail === 0 ? 0 : 1);
