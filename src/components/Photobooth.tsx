"use client";

import { useCallback, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useCountdown } from "@/hooks/useCountdown";
import { captureFrame } from "@/lib/capture";
import {
  COUNTDOWN_SECONDS,
  MANUAL_RESOLUTIONS,
  PHOTO_COUNT,
} from "@/lib/config";
import type { ResolutionMode, Shot } from "@/lib/types";
import { Badge, Card, GhostButton, PrimaryButton } from "./ui";

/** Kontrol pemilihan resolusi: Auto-HD, HD, Full HD. */
function ResolutionControl({
  mode,
  onChange,
  disabled,
}: {
  mode: ResolutionMode;
  onChange: (m: ResolutionMode) => void;
  disabled?: boolean;
}) {
  const items: { id: ResolutionMode; label: string }[] = [
    { id: "auto", label: "Auto HD" },
    ...MANUAL_RESOLUTIONS.map((r) => ({
      id: r.id as ResolutionMode,
      label: r.label,
    })),
  ];
  return (
    <div
      role="tablist"
      aria-label="Resolusi kamera"
      className="inline-flex p-1 rounded-xl bg-surface-2 gap-1"
    >
      {items.map((it) => {
        const active = mode === it.id;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(it.id)}
            className={`px-3 h-8 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
              active
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/** Overlay layar saat kamera belum siap. */
function CameraPlaceholder({
  status,
  error,
  onStart,
}: {
  status: string;
  error: string | null;
  onStart: () => void;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center p-6 text-center">
      <div className="max-w-sm">
        {status === "idle" && (
          <>
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-white/10 grid place-items-center text-white">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M15 10l4.5-2.6v9.2L15 14M4 7h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-white font-semibold">Aktifkan kamera untuk mulai</p>
            <p className="mt-1 text-sm text-white/60">
              Kami tidak menyimpan video. Semua diproses di perangkatmu.
            </p>
            <PrimaryButton onClick={onStart} className="mt-4">
              Nyalakan Kamera
            </PrimaryButton>
          </>
        )}
        {status === "requesting" && (
          <p className="text-white/80 text-sm">Meminta izin kamera…</p>
        )}
        {(status === "denied" ||
          status === "error" ||
          status === "unsupported") && (
          <>
            <p className="text-white font-semibold">Kamera tidak bisa diakses</p>
            <p className="mt-1 text-sm text-white/60">{error}</p>
            {status !== "unsupported" && (
              <PrimaryButton onClick={onStart} className="mt-4">
                Coba Lagi
              </PrimaryButton>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Satu slot thumbnail hasil. */
function ShotSlot({
  shot,
  index,
  disabled,
  onRetake,
}: {
  shot: Shot | null;
  index: number;
  disabled: boolean;
  onRetake: (i: number) => void;
}) {
  return (
    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border">
      {shot ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shot.dataUrl}
          alt={`Foto ${index + 1}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full grid place-items-center text-muted">
          <span className="text-xs font-semibold">{index + 1}</span>
        </div>
      )}
      {shot && !disabled && (
        <button
          onClick={() => onRetake(index)}
          className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur px-2 py-1 text-[0.7rem] font-semibold text-white hover:bg-black/75 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retake
        </button>
      )}
      {shot?.retaken && (
        <span className="absolute top-1.5 left-1.5 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[0.6rem] font-bold text-black">
          RETAKE
        </span>
      )}
    </div>
  );
}

export function Photobooth() {
  const { videoRef, status, error, resolution, mode, setMode, start, stop } =
    useCamera();
  const countdown = useCountdown();

  const [shots, setShots] = useState<(Shot | null)[]>(
    Array(PHOTO_COUNT).fill(null),
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  /** index slot yang sedang di-retake, null = sesi utama berurutan. */
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  const isReady = status === "ready";
  const filledCount = shots.filter(Boolean).length;
  const allFilled = filledCount === PHOTO_COUNT;

  /** Jepret satu frame dari video lalu taruh di slot index. */
  const snapInto = useCallback(
    (index: number, isRetake: boolean) => {
      const video = videoRef.current;
      if (!video) return;
      const dataUrl = captureFrame(video, { maxWidth: 1920 });
      if (!dataUrl) return;
      setFlash(true);
      setTimeout(() => setFlash(false), 450);
      setShots((prev) => {
        const next = [...prev];
        next[index] = { id: `${Date.now()}-${index}`, dataUrl, retaken: isRetake };
        return next;
      });
    },
    [videoRef],
  );

  /** Mulai sesi 4 foto: countdown berurutan di tiap slot. */
  const startSession = useCallback(() => {
    if (!isReady || isCapturing) return;
    setIsCapturing(true);
    setRetakeIndex(null);
    setShots(Array(PHOTO_COUNT).fill(null));

    let index = 0;
    const captureNext = () => {
      if (index >= PHOTO_COUNT) {
        setIsCapturing(false);
        return;
      }
      const current = index;
      countdown.start(COUNTDOWN_SECONDS, () => {
        snapInto(current, false);
        index += 1;
        // jeda kecil antar foto supaya user bisa ganti pose
        setTimeout(captureNext, 650);
      });
    };
    captureNext();
  }, [countdown, isCapturing, isReady, snapInto]);

  /** Retake satu slot tertentu. */
  const retake = useCallback(
    (index: number) => {
      if (!isReady || isCapturing) return;
      setRetakeIndex(index);
      setIsCapturing(true);
      countdown.start(COUNTDOWN_SECONDS, () => {
        snapInto(index, true);
        setIsCapturing(false);
        setRetakeIndex(null);
      });
    },
    [countdown, isCapturing, isReady, snapInto],
  );

  const cancelCapture = useCallback(() => {
    countdown.cancel();
    setIsCapturing(false);
    setRetakeIndex(null);
  }, [countdown]);

  const reset = useCallback(() => {
    cancelCapture();
    setShots(Array(PHOTO_COUNT).fill(null));
  }, [cancelCapture]);


  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* ===== Kolom kamera ===== */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                isReady ? "bg-emerald-500" : "bg-amber-500"
              }`}
              aria-hidden
            />
            <span className="text-xs font-medium text-muted truncate">
              {isReady
                ? "Kamera aktif"
                : status === "requesting"
                  ? "Menyalakan kamera…"
                  : "Kamera nonaktif"}
            </span>
            {resolution && (
              <Badge tone="brand" className="ml-1 shrink-0">
                {resolution.label}
                {resolution.isFallback ? " · fallback" : ""}
              </Badge>
            )}
          </div>
          <ResolutionControl
            mode={mode}
            onChange={setMode}
            disabled={status === "requesting" || isCapturing}
          />
        </div>

        <div className="relative bg-black aspect-[4/3] sm:aspect-video">
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover mirror-preview transition-opacity duration-300 ${
              isReady ? "opacity-100" : "opacity-0"
            }`}
            autoPlay
            playsInline
            muted
          />

          {!isReady && (
            <CameraPlaceholder status={status} error={error} onStart={start} />
          )}

          {countdown.value !== null && countdown.value > 0 && (
            <div className="absolute inset-0 grid place-items-center bg-black/30">
              <span
                key={countdown.value}
                className="animate-pop text-white font-black text-[22vw] sm:text-[9rem] leading-none drop-shadow-2xl"
              >
                {countdown.value}
              </span>
            </div>
          )}

          {flash && (
            <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
          )}

          {isCapturing && retakeIndex !== null && (
            <div className="absolute top-3 left-3">
              <Badge tone="warn">Retake foto {retakeIndex + 1}</Badge>
            </div>
          )}
        </div>

        <div className="px-3 sm:px-4 py-3 flex flex-wrap items-center gap-2 justify-between">
          <p className="text-xs text-muted">
            {filledCount}/{PHOTO_COUNT} foto diambil
            {resolution?.isFallback && " · resolusi diturunkan otomatis"}
          </p>
          <div className="flex items-center gap-2">
            {isCapturing ? (
              <GhostButton onClick={cancelCapture}>Batal</GhostButton>
            ) : (
              <PrimaryButton onClick={startSession} disabled={!isReady}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="3.2" />
                </svg>
                {allFilled ? "Foto Ulang Semua" : `Mulai ${PHOTO_COUNT} Foto`}
              </PrimaryButton>
            )}
            {filledCount > 0 && !isCapturing && (
              <GhostButton onClick={reset}>Reset</GhostButton>
            )}
            {isReady && (
              <GhostButton onClick={stop} className="hidden sm:inline-flex">
                Matikan
              </GhostButton>
            )}
          </div>
        </div>
      </Card>

      {/* ===== Kolom hasil 4 slot ===== */}
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">Hasil Foto</h2>
          <span className="text-xs text-muted">
            {filledCount}/{PHOTO_COUNT}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {shots.map((shot, i) => (
            <ShotSlot
              key={i}
              shot={shot}
              index={i}
              disabled={isCapturing || !isReady}
              onRetake={retake}
            />
          ))}
        </div>
        <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">
          Preview di-mirror seperti kaca. Hasil foto yang diunduh tidak mirror.
        </p>
      </Card>
    </div>
  );
}
