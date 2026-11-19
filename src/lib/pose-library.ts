/**
 * LUMIBOOTH — Pose library accessor (TAHAP 5)
 * ==========================================
 * Membaca src/data/poses.json dan menyediakan helper pencarian/filter.
 * poses.json di-generate oleh scripts/gen-poses.cjs — jangan edit manual.
 */
import raw from "@/data/poses.json";
import type {
  PoseCategory,
  PoseDefinition,
  PoseVibe,
} from "./pose-types";

interface RawPosesFile {
  version: number;
  poses: PoseDefinition[];
}

const file = raw as unknown as RawPosesFile;

/** Semua pose di library. */
export const POSE_LIBRARY: PoseDefinition[] = file.poses;

/** Ambil pose berdasarkan id (undefined kalau tidak ada). */
export function getPose(id: string | null | undefined): PoseDefinition | undefined {
  if (!id) return undefined;
  return POSE_LIBRARY.find((p) => p.id === id);
}

/**
 * Petakan jumlah orang → kategori.
 * 1 → solo, 2 → couple, 3 → trio, 4+ → squad (permintaan 17).
 */
export function categoryForCount(count: number): PoseCategory {
  if (count <= 1) return "solo";
  if (count === 2) return "couple";
  if (count === 3) return "trio";
  return "squad";
}

/** Semua pose dalam satu kategori. */
export function posesByCategory(category: PoseCategory): PoseDefinition[] {
  return POSE_LIBRARY.filter((p) => p.category === category);
}

/**
 * Rekomendasi pose berdasarkan jumlah orang + template aktif (permintaan 18).
 *
 * Template LumiBooth punya `category` sendiri (Mis. "Y2K", "Couple", "Squad").
 * Kita petakan ke vibe pose supaya saran terasa nyambung dengan frame yang
 * dipilih user. Kalau tidak ada yang cocok, kembalikan semua pose kategori
 * tersebut (jangan pernah kosong — user butuh saran).
 */
export function recommendPoses(
  count: number,
  templateCategory?: string,
): PoseDefinition[] {
  const category = categoryForCount(count);
  const pool = posesByCategory(category);
  if (!pool.length) return POSE_LIBRARY;

  const vibe = templateVibe(templateCategory);
  if (!vibe) return pool;

  const matching = pool.filter((p) => p.tags.includes(vibe));
  return matching.length ? matching : pool;
}

/** Petakan kategori template → tag vibe pose. */
function templateVibe(templateCategory?: string): PoseVibe | null {
  switch (templateCategory) {
    case "Y2K":
      return "y2k";
    case "Street":
      return "street";
    case "Elegant":
      return "elegan";
    case "Playful":
      return "playful";
    // "Couple"/"Squad" adalah kategori jumlah orang, bukan vibe — pakai semua.
    default:
      return null;
  }
}

/**
 * Pilih pose acak untuk "Surprize Me" (permintaan 20).
 * `excludeId` menghindari pose yang sama terpilih dua kali beruntun.
 */
export function randomPose(
  count: number,
  templateCategory?: string,
  excludeId?: string | null,
): PoseDefinition {
  let pool = recommendPoses(count, templateCategory);
  if (pool.length > 1 && excludeId) {
    const filtered = pool.filter((p) => p.id !== excludeId);
    if (filtered.length) pool = filtered;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
