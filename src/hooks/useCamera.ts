"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AUTO_HD_CHAIN,
  RESOLUTION_PRESETS,
  type ResolutionPreset,
} from "@/lib/config";
import type { ActiveResolution, ResolutionMode } from "@/lib/types";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "error"
  | "unsupported";

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  error: string | null;
  resolution: ActiveResolution | null;
  mode: ResolutionMode;
  /** Resolusi ideal yang dilaporkan kamera (track settings). */
  supportedCaps: { width: number; height: number } | null;
  setMode: (mode: ResolutionMode) => void;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Coba `getUserMedia` dengan preset tertentu.
 * Return stream + resolusi yang benar-benar diberikan kamera.
 * Bila kamera tidak mendukung persis, browser akan memilih resolusi
 * terdekat — jadi kita baca hasil sebenarnya dari track settings.
 */
async function requestStream(preset: ResolutionPreset) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: { ideal: preset.width },
      height: { ideal: preset.height },
      facingMode: "user",
    },
  });
  const track = stream.getVideoTracks()[0];
  const settings = track?.getSettings() ?? {};
  return {
    stream,
    width: settings.width ?? preset.width,
    height: settings.height ?? preset.height,
  };
}

/**
 * Hook utama kamera.
 *
 * Auto-HD: coba 1080p dulu, kalau gagal / resolusi terlalu kecil turun ke
 * 720p lalu 480p. Yang dipakai adalah stream pertama yang berhasil dengan
 * resolusi memadai untuk preset tersebut.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<ActiveResolution | null>(null);
  const [supportedCaps, setSupportedCaps] =
    useState<{ width: number; height: number } | null>(null);
  const [mode, setModeState] = useState<ResolutionMode>("auto");

  /** Lepas semua track kamera. */
  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setResolution(null);
  }, []);

  /** Pasang stream ke elemen video lalu tunggu metadata siap. */
  const attach = useCallback(async (stream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await new Promise<void>((resolve) => {
      if (video.readyState >= 1) return resolve();
      video.onloadedmetadata = () => resolve();
    });
    await video.play().catch(() => undefined);
  }, []);

  /**
   * Mulai kamera sesuai mode.
   * - "auto": coba chain 1080p → 720p → 480p.
   * - preset id: hanya minta preset itu (dengan ideal constraint).
   */
  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      setError("Browser ini tidak mendukung akses kamera (getUserMedia).");
      return;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStatus("requesting");
    setError(null);

    const presets: ResolutionPreset[] =
      mode === "auto"
        ? AUTO_HD_CHAIN
        : [RESOLUTION_PRESETS.find((p) => p.id === mode) ?? RESOLUTION_PRESETS[1]];

    let lastErr: unknown = null;
    for (let i = 0; i < presets.length; i++) {
      const preset = presets[i];
      try {
        const { stream, width, height } = await requestStream(preset);
        streamRef.current = stream;
        setSupportedCaps({ width, height });
        await attach(stream);
        const label = `${width}×${height}`;
        setResolution({
          width,
          height,
          label,
          isFallback: mode === "auto" && i > 0,
        });
        setStatus("ready");
        return;
      } catch (err) {
        lastErr = err;
        // Kode error permission → tidak perlu lanjut fallback.
        const name = (err as { name?: string })?.name;
        if (name === "NotAllowedError" || name === "SecurityError") break;
      }
    }

    const name = (lastErr as { name?: string })?.name;
    if (name === "NotAllowedError" || name === "SecurityError") {
      setStatus("denied");
      setError("Izin kamera ditolak. Aktifkan akses kamera di browser lalu coba lagi.");
    } else if (name === "NotFoundError" || name === "OverconstrainedError") {
      setStatus("error");
      setError("Kamera tidak ditemukan atau resolusi tidak didukung.");
    } else {
      setStatus("error");
      setError("Gagal mengakses kamera. Pastikan perangkat punya webcam.");
    }
  }, [attach, mode]);

  /** Ganti mode resolusi. Stream akan di-restart oleh efek di bawah. */
  const setMode = useCallback((next: ResolutionMode) => {
    setModeState(next);
  }, []);

  // Restart stream saat mode berubah, hanya bila kamera sudah pernah aktif.
  const isActive = useRef(false);
  isActive.current = status === "ready" || status === "requesting";
  useEffect(() => {
    if (isActive.current) void start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Bersihkan kamera saat unmount.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    videoRef,
    status,
    error,
    resolution,
    mode,
    supportedCaps,
    setMode,
    start,
    stop,
  };
}
