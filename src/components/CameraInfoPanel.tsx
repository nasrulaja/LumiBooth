"use client";

import { useState } from "react";
import type { CameraInfo } from "@/lib/types";

/**
 * Panel debug "Info Kamera" (permintaan A.4).
 *
 * Menampilkan resolusi AKTUAL yang diberikan kamera, fps, dan label
 * perangkat. Tujuannya untuk verifikasi bahwa kamera benar-benar memberi
 * frame HD dan capture memakai frame asli (bukan ukuran elemen di layar).
 *
 * Sengaja dibuat ringkas & bisa dilipat supaya tidak mengganggu UI utama.
 */
export function CameraInfoPanel({ info }: { info: CameraInfo | null }) {
  const [open, setOpen] = useState(false);
  if (!info || !info.videoWidth) return null;

  const fps = info.frameRate ? `${info.frameRate} fps` : "—";
  const facing = info.facingMode === "user" ? "Depan (selfie)" : "Belakang";
  const aspect = info.aspectRatio ? info.aspectRatio.toFixed(3) : "—";

  return (
    <div className="border-t text-[0.7rem]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 sm:px-4 py-1.5 text-muted hover:text-foreground transition-colors"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Info Kamera
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="tabular-nums">
            {info.videoWidth}×{info.videoHeight} · {fps}
          </span>
          <span aria-hidden className="text-[0.6rem]">
            {open ? "▲" : "▼"}
          </span>
        </span>
      </button>

      {open && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 px-3 sm:px-4 pb-2.5 pt-0.5 text-muted">
          <dt className="font-medium">Frame asli</dt>
          <dd data-testid="cam-frame" className="tabular-nums text-foreground">
            {info.videoWidth}×{info.videoHeight}
          </dd>
          <dt className="font-medium">Track</dt>
          <dd className="tabular-nums">
            {info.trackWidth && info.trackHeight
              ? `${info.trackWidth}×${info.trackHeight}`
              : "—"}
          </dd>
          <dt className="font-medium">FPS</dt>
          <dd data-testid="cam-fps" className="tabular-nums">
            {fps}
          </dd>
          <dt className="font-medium">Kamera</dt>
          <dd data-testid="cam-label" className="break-all">
            {info.deviceLabel || "—"}
          </dd>
          <dt className="font-medium">Posisi</dt>
          <dd>{facing}</dd>
          <dt className="font-medium">Rasio</dt>
          <dd className="tabular-nums">{aspect}</dd>
          <dt className="font-medium">Preset</dt>
          <dd className="tabular-nums">{info.appliedPreset}</dd>
        </dl>
      )}
    </div>
  );
}
