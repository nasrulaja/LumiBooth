"use client";

/**
 * LUMIBOOTH — usePoseCoach (TAHAP 5)
 * =================================
 * Hook inti Pose Coach. Mengatur:
 *  - load model lazy (hanya saat user menyalakan coach)
 *  - loop deteksi dengan target fps agar tidak membebani CPU
 *  - hitung skor kemiripan + coaching text
 *  - pantau fps → auto-degrade ke mode Lite (permintaan 26)
 *  - state machine auto-shutter (permintaan 13)
 *
 * PRINSIP: hook ini TIDAK PERNAH memblokir foto. Semua hasilnya bersifat
 * informasi; keputusan menembak tetap di pemanggil (Photobooth).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { DETECTION_CONFIG, POSE_THRESHOLDS } from "@/lib/pose-coach-config";
import {
  createAutoShutterState,
  stepAutoShutter,
  type AutoShutterState,
} from "@/lib/pose-autoshutter";
import { buildCoaching, shouldRefreshCoaching } from "@/lib/pose-coaching";
import {
  loadDetectors,
  normalizePoses,
  type DetectorBundle,
  type EngineStatus,
} from "@/lib/pose-detector";
import { scorePersonAgainstPose } from "@/lib/pose-matching";
import type { DetectedPose, PoseDefinition, PoseFrame } from "@/lib/pose-types";

export interface UsePoseCoachOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Tracking hanya jalan kalau kamera siap DAN coach ON. */
  enabled: boolean;
  /** Pose target yang dipilih user; null = free style. */
  targetPose: PoseDefinition | null;
  /** Jumlah orang yang diharapkan (BlazeFace atau dropdown manual). */
  expectedPeople: number;
  /** User menyalakan auto-shutter? Default OFF. */
  autoShutterEnabled: boolean;
  /** Callback saat auto-shutter memutuskan menembak. */
  onAutoShutter?: () => void;
}

export interface UsePoseCoachResult {
  status: EngineStatus;
  /** Pesan error kalau model gagal dimuat total. */
  error: string | null;
  /** Frame terakhir (null sebelum ada hasil). */
  frame: PoseFrame | null;
  /** Skor gabungan 0..100. */
  score: number;
  /** Coaching text (null = tidak ada instruksi). */
  coaching: string | null;
  /** true bila perangkat lemah & sudah degrade. */
  isLite: boolean;
  /** Progres auto-shutter 0..1 untuk ring UI. */
  autoShutterProgress: number;
  /** Deteksi orang terakhir, dipakai overlay. */
  lastPoses: DetectedPose[];
  /** Muat ulang model setelah error. */
  retry: () => void;
}

export function usePoseCoach({
  videoRef,
  enabled,
  targetPose,
  expectedPeople,
  autoShutterEnabled,
  onAutoShutter,
}: UsePoseCoachOptions): UsePoseCoachResult {
  const [status, setStatus] = useState<EngineStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [frame, setFrame] = useState<PoseFrame | null>(null);
  const [coaching, setCoaching] = useState<string | null>(null);
  const [isLite, setIsLite] = useState(false);
  const [autoShutterProgress, setAutoShutterProgress] = useState(0);

  // Refs supaya loop deteksi tidak perlu di-restart tiap prop berubah.
  const bundleRef = useRef<DetectorBundle | null>(null);
  const lastRunRef = useRef(0);
  const shutterStateRef = useRef<AutoShutterState>(createAutoShutterState());
  const lastCoachingRef = useRef<string | null>(null);
  const lastScoreRef = useRef(0);
  const lastCoachingAtRef = useRef(0);
  const slowSinceRef = useRef<number | null>(null);
  const fpsSamplesRef = useRef<number[]>([]);

  // Nilai terbaru disalurkan lewat ref agar loop deteksi membaca versi
  // terkini tanpa perlu dibongkar-pasang setiap render. Ref disinkronkan di
  // dalam effect (bukan saat render) supaya tidak melanggar aturan React.
  const targetPoseRef = useRef(targetPose);
  const expectedPeopleRef = useRef(expectedPeople);
  const autoShutterRef = useRef(autoShutterEnabled);
  const onAutoShutterRef = useRef(onAutoShutter);
  const isLiteRef = useRef(isLite);

  useEffect(() => {
    targetPoseRef.current = targetPose;
    expectedPeopleRef.current = expectedPeople;
    autoShutterRef.current = autoShutterEnabled;
    onAutoShutterRef.current = onAutoShutter;
    isLiteRef.current = isLite;
  }, [targetPose, expectedPeople, autoShutterEnabled, onAutoShutter, isLite]);

  /* ---------------- load model (lazy) ---------------- */
  useEffect(() => {
    // Semua perubahan state dilakukan secara asynchronous (di dalam promise)
    // sehingga tidak ada setState sinkron di dalam effect.
    let cancelled = false;

    if (!enabled) {
      Promise.resolve().then(() => {
        if (!cancelled) setStatus("idle");
      });
      return () => {
        cancelled = true;
      };
    }

    if (bundleRef.current) {
      const readyStatus = isLiteRef.current ? "lite" : "ready";
      Promise.resolve().then(() => {
        if (!cancelled) setStatus(readyStatus);
      });
      return () => {
        cancelled = true;
      };
    }

    Promise.resolve()
      .then(() => {
        if (cancelled) return null;
        setStatus("loading");
        setError(null);
        return loadDetectors();
      })
      .then((bundle) => {
        if (!bundle) return;
        if (cancelled) {
          bundle.dispose();
          return;
        }
        bundleRef.current = bundle;
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("[pose-coach] gagal load model:", err);
        setStatus("error");
        setError(
          "Model AI gagal dimuat. Kamera tetap bisa dipakai untuk foto biasa.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  /** Hitung & set coaching text sesuai aturan anti-spam (5.3). */
  const updateCoaching = useCallback((
    target: PoseDefinition | null,
    poses: DetectedPose[],
    scores: number[],
    now: number,
  ) => {
    // Tanpa pose target tidak ada instruksi sama sekali (free style).
    if (!target || !poses.length) {
      if (lastCoachingRef.current !== null) {
        lastCoachingRef.current = null;
        setCoaching(null);
      }
      return;
    }

    // Batasi frekuensi update (~500ms, permintaan 9).
    if (now - lastCoachingAtRef.current < POSE_THRESHOLDS.coachingIntervalMs) {
      return;
    }
    lastCoachingAtRef.current = now;

    // Orang dengan skor terendah = yang paling butuh koreksi.
    let worstIdx = 0;
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] < scores[worstIdx]) worstIdx = i;
    }
    const worstScore = scores[worstIdx] ?? 0;
    const skeleton = target.skeletons[worstIdx] ?? target.skeletons[0] ?? null;
    const next = skeleton
      ? buildCoaching(
          skeleton,
          poses[worstIdx],
          worstScore,
          DETECTION_CONFIG.minKeypointScore,
        )
      : null;

    // Anti-spam: jangan ganti teks kalau sama & skor tidak berubah banyak.
    const refresh = shouldRefreshCoaching(
      lastCoachingRef.current,
      next,
      lastScoreRef.current,
      worstScore,
      POSE_THRESHOLDS.coachingScoreEpsilon,
    );
    if (refresh) {
      lastCoachingRef.current = next;
      lastScoreRef.current = worstScore;
      setCoaching(next);
    }
  }, []);

  /** Jalankan state machine auto-shutter lalu update ring progres. */
  const runAutoShutter = useCallback((
    target: PoseDefinition | null,
    scores: number[],
    now: number,
  ) => {
    const state = shutterStateRef.current;
    const fire = stepAutoShutter(state, {
      enabled: autoShutterRef.current,
      hasTarget: !!target,
      scores,
      expectedPeople: Math.max(1, expectedPeopleRef.current),
      now,
    });

    // Ring progres hanya relevan kalau toggle ON.
    let progress = 0;
    if (autoShutterRef.current && state.stableSince !== null) {
      progress = Math.min(
        1,
        (now - state.stableSince) / POSE_THRESHOLDS.autoShutterHoldMs,
      );
    }
    setAutoShutterProgress(progress);

    if (fire) onAutoShutterRef.current?.();
  }, []);

  /** Pantau fps; degrade permanen ke Lite kalau terlalu lambat (5.10). */
  const monitorFps = useCallback((now: number) => {
    if (isLiteRef.current) return;
    const samples = fpsSamplesRef.current;
    if (samples.length < 8) return;

    const span = samples[samples.length - 1] - samples[0];
    if (span <= 0) return;
    const fps = ((samples.length - 1) / span) * 1000;

    if (fps >= DETECTION_CONFIG.liteThresholdFps) {
      slowSinceRef.current = null;
      return;
    }
    if (slowSinceRef.current === null) {
      slowSinceRef.current = now;
      return;
    }
    if (now - slowSinceRef.current >= DETECTION_CONFIG.liteSustainMs) {
      slowSinceRef.current = null;
      isLiteRef.current = true;
      setIsLite(true);
      setStatus("lite");
    }
  }, []);

  /* ---------------- loop deteksi ---------------- */
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const minInterval = 1000 / DETECTION_CONFIG.targetFps;
    let rafId: number | null = null;

    const tick = async () => {
      if (cancelled) return;
      rafId = requestAnimationFrame(() => void tick());

      const bundle = bundleRef.current;
      const video = videoRef.current;
      if (!bundle || !video || video.readyState < 2) return;

      const now = performance.now();
      if (now - lastRunRef.current < minInterval) return;
      lastRunRef.current = now;

      // Kumpulkan sampel waktu untuk mengukur fps nyata.
      const samples = fpsSamplesRef.current;
      samples.push(now);
      if (samples.length > 20) samples.shift();

      try {
        const [rawPoses, rawFaces] = await Promise.all([
          bundle.estimatePoses(video),
          bundle.estimateFaces(video),
        ]);
        if (cancelled) return;

        const poses = normalizePoses(
          rawPoses,
          video.videoWidth,
          video.videoHeight,
        );

        /* ---- skor kemiripan per orang ---- */
        const target = targetPoseRef.current;
        const scores: number[] = target
          ? poses.map((p, i) =>
              scorePersonAgainstPose(
                target,
                i,
                poses.length,
                p,
                DETECTION_CONFIG.minKeypointScore,
              ),
            )
          : [];
        const overall = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;

        setFrame({
          poses,
          faceCount: rawFaces.length,
          scores,
          overall,
          at: now,
        });

        updateCoaching(target, poses, scores, now);
        runAutoShutter(target, scores, now);
        monitorFps(now);
      } catch (err) {
        // Satu frame gagal tidak fatal — coba lagi di frame berikutnya.
        console.warn("[pose-coach] inference gagal:", err);
      }
    };

    rafId = requestAnimationFrame(() => void tick());
    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [enabled, videoRef, updateCoaching, runAutoShutter, monitorFps]);

  /* Reset coaching & timer saat pose target berganti.
   * Ref direset langsung; state UI direset lewat microtask agar tidak ada
   * setState sinkron di dalam effect. */
  useEffect(() => {
    lastCoachingRef.current = null;
    lastScoreRef.current = 0;
    lastCoachingAtRef.current = 0;
    shutterStateRef.current = createAutoShutterState();
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setCoaching(null);
      setAutoShutterProgress(0);
    });
    return () => {
      cancelled = true;
    };
  }, [targetPose?.id]);

  /* Bersihkan model saat unmount. */
  useEffect(() => {
    return () => {
      bundleRef.current?.dispose();
      bundleRef.current = null;
    };
  }, []);

  /** Muat ulang model setelah error. */
  const retry = useCallback(() => {
    bundleRef.current?.dispose();
    bundleRef.current = null;
    isLiteRef.current = false;
    setIsLite(false);
    setError(null);
    setStatus("loading");
    loadDetectors()
      .then((bundle) => {
        bundleRef.current = bundle;
        setStatus("ready");
      })
      .catch(() => {
        setStatus("error");
        setError("Model AI gagal dimuat ulang.");
      });
  }, []);

  return {
    status,
    error,
    frame,
    score: frame?.overall ?? 0,
    coaching,
    isLite,
    autoShutterProgress,
    lastPoses: frame?.poses ?? [],
    retry,
  };
}

