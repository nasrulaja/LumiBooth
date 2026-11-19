"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AUTO_HD_CHAIN,
  DEFAULT_FACING_MODE,
  RESOLUTION_PRESETS,
  type ResolutionPreset,
} from "@/lib/config";
import type { ActiveResolution, CameraInfo, ResolutionMode } from "@/lib/types";


export type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "error"
  | "unsupported";

/** Bentuk nilai balik useCamera — diekspor agar bisa dipakai komponen lain. */
export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  error: string | null;
  resolution: ActiveResolution | null;
  mode: ResolutionMode;
  /** Resolusi ideal yang dilaporkan kamera (track settings). */
  supportedCaps: { width: number; height: number } | null;
  /** Info kamera aktual (resolusi, fps, label, facingMode) untuk panel debug. */
  info: CameraInfo | null;
  setMode: (mode: ResolutionMode) => void;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Baca info kamera aktual dari elemen <video> + track settings.
 * Dipakai untuk panel "Info Kamera" dan untuk menyamakan framing capture.
 */
function readCameraInfo(
  video: HTMLVideoElement | null,
  stream: MediaStream,
  facingMode: "user" | "environment",
  appliedPreset: string,
): CameraInfo {
  const track = stream.getVideoTracks()[0];
  const settings = track?.getSettings() ?? {};
  // Prioritaskan ukuran frame ASLI dari elemen video; fallback ke settings.
  const videoWidth = video?.videoWidth || settings.width || 0;
  const videoHeight = video?.videoHeight || settings.height || 0;
  return {
    videoWidth,
    videoHeight,
    trackWidth: settings.width ?? null,
    trackHeight: settings.height ?? null,
    frameRate:
      typeof settings.frameRate === "number"
        ? Math.round(settings.frameRate)
        : null,
    deviceLabel: track?.label || null,
    facingMode,
    aspectRatio: videoHeight ? videoWidth / videoHeight : 0,
    appliedPreset,
  };
}

/**
 * Coba `getUserMedia` dengan preset tertentu.
 * Return stream + resolusi yang benar-benar diberikan kamera.
 * Bila kamera tidak mendukung persis, browser akan memilih resolusi
 * terdekat — jadi kita baca hasil sebenarnya dari track settings.
 */
async function requestStream(
  preset: ResolutionPreset | null,
  facingMode: "user" | "environment",
) {
  // Preset null = upaya terakhir tanpa constraint (paling permisif).
  const video: MediaTrackConstraints = preset
    ? {
        width: { ideal: preset.width },
        height: { ideal: preset.height },
        facingMode,
      }
    : { facingMode };

  const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video });
  const track = stream.getVideoTracks()[0];
  const settings = track?.getSettings() ?? {};
  return {
    stream,
    width: settings.width ?? preset?.width ?? 0,
    height: settings.height ?? preset?.height ?? 0,
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
  const [info, setInfo] = useState<CameraInfo | null>(null);
  const [mode, setModeState] = useState<ResolutionMode>("auto");
  /** Kamera depan (default) atau belakang — hanya berubah bila user minta. */
  const facingModeRef = useRef<"user" | "environment">(DEFAULT_FACING_MODE);

  /** Lepas semua track kamera. */
  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setResolution(null);
    setInfo(null);
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

    const presets: (ResolutionPreset | null)[] =
      mode === "auto"
        ? [...AUTO_HD_CHAIN, null]
        : [RESOLUTION_PRESETS.find((p) => p.id === mode) ?? RESOLUTION_PRESETS[1]];

    let lastErr: unknown = null;
    for (let i = 0; i < presets.length; i++) {
      const preset = presets[i];
      try {
        const { stream, width, height } = await requestStream(
          preset,
          facingModeRef.current,
        );
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
        // Baca ulang setelah video punya metadata → ukuran frame ASLI.
        setInfo(
          readCameraInfo(
            videoRef.current,
            stream,
            facingModeRef.current,
            preset ? `${preset.width}×${preset.height}` : "tanpa constraint",
          ),
        );
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
  // `isActiveRef` disinkronkan di effect (bukan saat render) supaya tidak
  // melanggar aturan React: render harus bebas efek samping.
  const isActiveRef = useRef(false);
  useEffect(() => {
    isActiveRef.current = status === "ready" || status === "requesting";
  }, [status]);

  // Lewati restart pada mount pertama; hanya bereaksi saat mode BERUBAH.
  const firstModeRun = useRef(true);
  useEffect(() => {
    if (firstModeRun.current) {
      firstModeRun.current = false;
      return;
    }
    if (!isActiveRef.current) return;
    void start();
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
    info,
    setMode,
    start,
    stop,
  };
}
