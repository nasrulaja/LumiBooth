"use client";

/**
 * LUMIBOOTH — HUD Pose Coach di atas preview (TAHAP 5.2, 5.3, 5.6, 5.10)
 * ====================================================================
 * Semua elemen di sini bersifat INFORMASI:
 *  - progress bar skor (merah → kuning → hijau)
 *  - coaching text (hanya saat target dipilih & skor < 70%)
 *  - notif kecil "ada yang belum senyum" (hilang sendiri)
 *  - notif mode Lite
 *  - ring progres auto-shutter (hanya saat toggle ON)
 *
 * Tidak ada elemen di sini yang menghalangi tombol shutter.
 */
import { POSE_THRESHOLDS } from "@/lib/pose-coach-config";

export interface PoseCoachHudProps {
  /** Coach sedang ON? */
  enabled: boolean;
  /** Skor gabungan 0..100. */
  score: number;
  /** Ada pose target terpilih? */
  hasTarget: boolean;
  /** Coaching text dari hook. */
  coaching: string | null;
  /** true saat mode Lite. */
  isLite: boolean;
  /** Progres auto-shutter 0..1. */
  autoShutterProgress: number;
  /** Auto-shutter toggle ON? */
  autoShutterOn: boolean;
  /** Notif senyum; null = tidak tampil. */
  smileNotice: string | null;
  /** Jumlah orang terdeteksi (untuk indikator kecil). */
  peopleDetected: number;
}

/** Warna Tailwind sesuai ambang skor. */
function scoreTone(score: number): string {
  if (score >= POSE_THRESHOLDS.good) return "bg-emerald-400";
  if (score >= POSE_THRESHOLDS.fair) return "bg-yellow-400";
  return "bg-red-400";
}

export function PoseCoachHud({
  enabled,
  score,
  hasTarget,
  coaching,
  isLite,
  autoShutterProgress,
  autoShutterOn,
  smileNotice,
  peopleDetected,
}: PoseCoachHudProps) {
  if (!enabled) return null;

  const rounded = Math.round(score);

  return (
    <>
      {/* ---- Kiri atas: skor (hanya bila ada target) ---- */}
      {hasTarget && peopleDetected > 0 && (
        <div className="absolute top-3 left-3 w-40 sm:w-48 pointer-events-none">
          <div className="rounded-xl bg-black/55 backdrop-blur px-2.5 py-2">
            <div className="flex items-center justify-between text-[0.62rem] font-semibold text-white/80">
              <span>Kemiripan pose</span>
              <span className="tabular-nums">{rounded}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${scoreTone(score)}`}
                style={{ width: `${Math.max(2, Math.min(100, rounded))}%` }}
              />
            </div>
            {/* Coaching text: spesifik, singkat, tidak spam */}
            {coaching && (
              <p className="mt-1.5 text-[0.7rem] font-semibold leading-snug text-white">
                {coaching}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---- Kanan atas: ring auto-shutter ---- */}
      {autoShutterOn && hasTarget && (
        <div className="absolute top-3 right-3 pointer-events-none">
          <AutoShutterRing progress={autoShutterProgress} />
        </div>
      )}

      {/* ---- Bawah tengah: notif kecil ---- */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
        {smileNotice && (
          <div className="rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[0.68rem] font-semibold text-white animate-fade-in">
            {smileNotice}
          </div>
        )}
        {isLite && (
          <div className="rounded-full bg-amber-500/85 px-3 py-1 text-[0.65rem] font-bold text-black">
            Mode Lite — perangkat agak lambat
          </div>
        )}
      </div>
    </>
  );
}

/** Ring melingkar kecil untuk progres tahan auto-shutter. */
function AutoShutterRing({ progress }: { progress: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, Math.max(0, progress)));
  const ready = progress >= 1;
  return (
    <div className="relative h-11 w-11 grid place-items-center">
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={ready ? "#34d399" : "#fbbf24"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-100"
        />
      </svg>
      <span className="absolute text-[0.55rem] font-bold text-white">AUTO</span>
    </div>
  );
}

/** Notif ringan anti-kaku / saran pose (permintaan 19). */
export function PoseSuggestionToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border bg-surface-2 p-2.5">
      <span aria-hidden className="text-sm">💡</span>
      <p className="flex-1 text-[0.7rem] leading-relaxed text-muted">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-[0.68rem] font-semibold text-muted hover:text-foreground"
      >
        Oke
      </button>
    </div>
  );
}
