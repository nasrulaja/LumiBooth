/**
 * LUMIBOOTH — Auto-shutter logic (TAHAP 5.5)
 * =========================================
 * LOGIKA AUTO-SHUTTER
 * -------------------
 * Syarat tembak otomatis (permintaan 13):
 *   1. User MENYALAKAN toggle auto-shutter. Default OFF. Kalau OFF, fungsi
 *      ini tidak pernah mengembalikan "fire" — tombol manual selalu jalan.
 *   2. Ada pose target aktif.
 *   3. Skor SEMUA orang ≥ 85 (POSE_THRESHOLDS.autoShutterScore).
 *   4. Syarat #3 bertahan terus-menerus selama 1.5 detik
 *      (POSE_THRESHOLDS.autoShutterHoldMs).
 *
 * Cara kerja timer:
 *   - Saat kondisi mulai terpenuhi, catat `stableSince = now`.
 *   - Selama kondisi tetap terpenuhi, jangan reset timer → biarkan menumpuk.
 *   - Begitu satu frame gagal (skor turun / orang hilang), reset ke 0.
 *   - Ketika (now - stableSince) ≥ holdMs → fire SEKALI, lalu reset supaya
 *     tidak menembak berkali-kali dalam satu pose.
 *
 * Ini state machine kecil yang dipakai sebagai objek mutable di dalam hook
 * supaya tidak memicu re-render setiap frame.
 */
import { POSE_THRESHOLDS } from "./pose-coach-config";

export interface AutoShutterState {
  /** Timestamp kondisi mulai stabil; null = belum stabil. */
  stableSince: number | null;
  /** Apakah sudah menembak untuk pose stabil saat ini. */
  fired: boolean;
}

export function createAutoShutterState(): AutoShutterState {
  return { stableSince: null, fired: false };
}

export interface AutoShutterInput {
  /** User menyalakan toggle? Kalau false → langsung tidak menembak. */
  enabled: boolean;
  /** Ada pose target yang dipilih? */
  hasTarget: boolean;
  /** Skor per orang (0..100). */
  scores: number[];
  /** Berapa orang yang seharusnya ada. */
  expectedPeople: number;
  /** performance.now() frame ini. */
  now: number;
}

/**
 * Update state machine. Return true HANYA pada frame di mana shutter
 * harus menembak.
 */
export function stepAutoShutter(
  state: AutoShutterState,
  input: AutoShutterInput,
): boolean {
  const { enabled, hasTarget, scores, expectedPeople, now } = input;

  // Gerbang utama: default OFF dan tanpa target tidak pernah menembak.
  if (!enabled || !hasTarget) {
    reset(state);
    return false;
  }

  // Semua orang yang diharapkan harus terdeteksi & semuanya di atas ambang.
  const allAbove =
    scores.length > 0 &&
    scores.length >= expectedPeople &&
    scores.every((s) => s >= POSE_THRESHOLDS.autoShutterScore);

  if (!allAbove) {
    reset(state);
    return false;
  }

  if (state.stableSince === null) {
    state.stableSince = now;
    state.fired = false;
    return false;
  }

  const held = now - state.stableSince;
  if (held >= POSE_THRESHOLDS.autoShutterHoldMs && !state.fired) {
    state.fired = true;
    return true;
  }
  return false;
}

/** Kembalikan state ke kondisi awal. */
export function reset(state: AutoShutterState) {
  state.stableSince = null;
  state.fired = false;
}

/**
 * Progres tahan (0..1) untuk ditampilkan sebagai ring di UI.
 * 0 = baru mulai, 1 = siap menembak.
 */
export function holdProgress(state: AutoShutterState, now: number): number {
  if (state.stableSince === null) return 0;
  const held = now - state.stableSince;
  return Math.min(1, held / POSE_THRESHOLDS.autoShutterHoldMs);
}
