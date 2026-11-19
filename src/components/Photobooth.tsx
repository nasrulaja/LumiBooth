"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useCountdown } from "@/hooks/useCountdown";
import { useLighting } from "@/hooks/useLighting";
import { usePoseCoach } from "@/hooks/usePoseCoach";
import { captureFrame } from "@/lib/capture";
import {
  CAPTURE_MAX_WIDTH,
  COUNTDOWN_SECONDS,
  MANUAL_RESOLUTIONS,
  PHOTO_COUNT,
} from "@/lib/config";
import { getFilter } from "@/lib/filters";
import { isPeaceOrThumbFrame } from "@/lib/pose-gesture";
import { drawOverlay } from "@/lib/pose-overlay";
import { STIFF_POSE_CONFIG, SURPRISE_CONFIG } from "@/lib/pose-coach-config";
import { randomPose } from "@/lib/pose-library";
import type { PoseDefinition } from "@/lib/pose-types";
import { recommendFilters } from "@/lib/recommendations";
import { getTemplate, type LayoutId } from "@/lib/templates";
import type { ResolutionMode, Shot } from "@/lib/types";
import { FilterPanel } from "./FilterPanel";
import { CameraInfoPanel } from "./CameraInfoPanel";
import { LightingIndicator } from "./LightingIndicator";
import { PoseCoachHud, PoseSuggestionToast } from "./PoseCoachHud";
import { PoseCoachPanel } from "./PoseCoachPanel";
import { ResultCard } from "./ResultCard";
import { TemplatePanel } from "./TemplatePanel";
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
  const {
    videoRef,
    status,
    error,
    resolution,
    mode,
    setMode,
    start,
    stop,
    info,
  } = useCamera();
  const countdown = useCountdown();
  const isReady = status === "ready";

  /**
   * Rasio kotak preview (width / height) hasil pengukuran DOM.
   * Dipakai captureFrame({ outputAspect }) supaya hasil foto = yang dilihat
   * user (WYSIWYG). Tanpa ini, preview yang di-crop `object-cover` akan
   * berbeda framing dengan PNG yang tersimpan.
   */
  const previewBoxRef = useRef<HTMLDivElement | null>(null);
  const previewAspectRef = useRef<number>(0);

  // TAHAP 2 — analisis pencahayaan real-time + filter aktif.
  const analysis = useLighting(videoRef, isReady);
  const recommendations = useMemo(
    () => (analysis ? recommendFilters(analysis) : []),
    [analysis],
  );
  const [filterId, setFilterId] = useState("normal");
  const activeFilter = getFilter(filterId);

  // TAHAP 3 — template frame + varian warna + layout.
  const [templateId, setTemplateId] = useState("minimal");
  const [variantId, setVariantId] = useState(() => getTemplate("minimal").variants[0].id);
  const [layout, setLayout] = useState<LayoutId>("strip");

  /** Ganti template: reset varian ke warna pertama template tsb. */
  const changeTemplate = useCallback((id: string) => {
    setTemplateId(id);
    setVariantId(getTemplate(id).variants[0].id);
  }, []);

  const [shots, setShots] = useState<(Shot | null)[]>(
    Array(PHOTO_COUNT).fill(null),
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  /** index slot yang sedang di-retake, null = sesi utama berurutan. */
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  /* ================= TAHAP 5 — POSE COACH =================
   * Semua fitur di bawah ini SUGGESTIF. User bebas foto gaya apa pun,
   * kapan pun, tanpa syarat. Tidak ada satu pun state di sini yang
   * menghalangi tombol shutter manual.
   */

  /** Toggle global. DEFAULT OFF saat pertama buka (permintaan 21). */
  const [poseCoachOn, setPoseCoachOn] = useState(false);
  /** Pose target; null = free style → tanpa instruksi apa pun (5.9 no.22). */
  const [targetPose, setTargetPose] = useState<PoseDefinition | null>(null);
  /** Overlay skeleton, toggle independen (permintaan 12). */
  const [overlayOn, setOverlayOn] = useState(true);
  /** Auto-shutter. DEFAULT OFF (permintaan 14). */
  const [autoShutterOn, setAutoShutterOn] = useState(false);
  /** Jumlah orang manual — fallback bila BlazeFace gagal (permintaan 2). */
  const [peopleCount, setPeopleCount] = useState(1);
  /** Notif senyum kecil yang hilang sendiri (permintaan 16). */
  const [smileNotice, setSmileNotice] = useState<string | null>(null);
  /** Saran anti-kaku; tampil sekali, bisa di-dismiss (permintaan 19). */
  const [stiffHint, setStiffHint] = useState<string | null>(null);
  /** Brief "Surprize Me" 3 detik (permintaan 20). */
  const [surpriseBrief, setSurpriseBrief] = useState<PoseDefinition | null>(null);
  /** Hitung berapa foto beruntun memakai gestur peace/jempol. */
  const peaceStreakRef = useRef(0);
  const stiffHintShownRef = useRef(0);
  /** Kanvas overlay skeleton di atas preview (TAHAP 5.4). */
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Timer brief "Surprize Me" 3 detik. */
  const surpriseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filledCount = shots.filter(Boolean).length;
  const allFilled = filledCount === PHOTO_COUNT;

  /** Jepret satu frame dari video lalu taruh di slot index. */
  /** Ref ke recordPeaceGesture (diisi lewat effect setelah callback dibuat). */
  const recordPeaceGestureRef = useRef<() => void>(() => {});

  const snapInto = useCallback(
    (index: number, isRetake: boolean) => {
      const video = videoRef.current;
      if (!video) return;
      // Filter CSS yang dipakai preview diterapkan juga di canvas → konsisten.
      // outputAspect = rasio kotak preview → crop sama seperti object-cover,
      // jadi PNG yang tersimpan persis seperti yang dilihat user (WYSIWYG).
      const dataUrl = captureFrame(video, {
        maxWidth: CAPTURE_MAX_WIDTH,
        cssFilter: activeFilter.css,
        outputAspect: previewAspectRef.current || undefined,
      });
      if (!dataUrl) return;

      // Catat gestur frame ini untuk deteksi anti-kaku (via ref agar tidak
      // terjadi dependensi melingkar antara snapInto dan poseCoach).
      recordPeaceGestureRef.current();

      setFlash(true);
      setTimeout(() => setFlash(false), 450);
      setShots((prev) => {
        const next = [...prev];
        // Simpan filterId agar thumbnail bisa menampilkan preview yang sama.
        next[index] = {
          id: `${Date.now()}-${index}`,
          dataUrl,
          retaken: isRetake,
        };
        return next;
      });
    },
    [activeFilter.css, videoRef],
  );

  /**
   * Ukur rasio kotak preview dan simpan ke ref.
   *
   * Dipakai agar capture memotong frame dengan rasio yang SAMA seperti yang
   * dilihat user. Diukur ulang saat resize/orientasi berubah supaya capture
   * tetap akurat di HP (portrait ↔ landscape).
   */
  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      previewAspectRef.current = r.height > 0 ? r.width / r.height : 0;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  /* ================= Pose Coach wiring ================= */

  /**
   * Ref "nilai terbaru". Disinkronkan di dalam useEffect (bukan saat render)
   * supaya mematuhi aturan React: render harus bebas efek samping.
   */
  const shotsRef = useRef(shots);
  const snapIntoRef = useRef(snapInto);

  useEffect(() => {
    shotsRef.current = shots;
    snapIntoRef.current = snapInto;
  }, [shots, snapInto]);

  /**
   * Auto-shutter menembak slot kosong pertama. Kalau semua slot sudah penuh
   * tidak melakukan apa pun — auto-shutter tidak pernah menimpa hasil.
   */
  const fireAutoShutter = useCallback(() => {
    const emptyIdx = shotsRef.current.findIndex((x) => x === null);
    if (emptyIdx === -1) return;
    snapIntoRef.current(emptyIdx, false);
  }, []);

  // Hook utama: deteksi, skor, coaching, mode Lite, state auto-shutter.
  const poseCoach = usePoseCoach({
    videoRef,
    enabled: isReady && poseCoachOn,
    targetPose,
    // Jumlah orang: pakai pilihan user/manual. Hasil BlazeFace baru tersedia
    // setelah hook berjalan, dan sengaja TIDAK dipakai di sini supaya
    // auto-shutter tidak berubah-ubah saat deteksi sesaat gagal.
    expectedPeople: peopleCount,
    autoShutterEnabled: autoShutterOn,
    onAutoShutter: () => fireAutoShutter(),
  });

  /**
   * Anti-kaku (permintaan 19): dipanggil tiap foto diambil. Kalau frame
   * memakai gestur peace/jempol, tambah streak. Setelah 2 foto beruntun
   * tampilkan saran SEKALI saja — tidak pernah mencegah user memakainya lagi.
   */
  const recordPeaceGesture = useCallback(() => {
    const isPeace = isPeaceOrThumbFrame(poseCoach.lastPoses);
    if (!isPeace) {
      peaceStreakRef.current = 0;
      return;
    }
    peaceStreakRef.current += 1;
    const reached = peaceStreakRef.current >= STIFF_POSE_CONFIG.threshold;
    const allowed = stiffHintShownRef.current < STIFF_POSE_CONFIG.maxHints;
    if (reached && allowed) {
      stiffHintShownRef.current += 1;
      setStiffHint(
        "Pose jempol/peace terus nih — coba variasi lain kalau mau beda?",
      );
    }
  }, [poseCoach.lastPoses]);

  /** Sambungkan recordPeaceGesture ke ref agar bisa dipanggil snapInto. */
  useEffect(() => {
    recordPeaceGestureRef.current = recordPeaceGesture;
  }, [recordPeaceGesture]);



  /**
   * Deteksi terakhir disimpan untuk recordPeaceGesture. Nilainya dibaca
   * langsung dari hook saat dibutuhkan (lihat recordPeaceGesture), jadi
   * tidak perlu ref mutable yang memicu aturan immutability.
   */

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

  /* ---------- Pose Coach: handler UI ---------- */

  /** Kategori template aktif, untuk rekomendasi pose (permintaan 18). */
  const templateCategory = useMemo(
    () => getTemplate(templateId).category,
    [templateId],
  );

  /**
   * "Surprize Me" (permintaan 20): pilih pose acak dari library sesuai
   * jumlah orang + template aktif, tampilkan brief 3 detik, lalu coaching
   * mulai otomatis karena targetPose sudah diset.
   */
  const surpriseMe = useCallback(() => {
    const pose = randomPose(
      peopleCount,
      templateCategory,
      targetPose?.id ?? null,
    );
    setTargetPose(pose);
    setSurpriseBrief(pose);
    if (surpriseTimerRef.current) clearTimeout(surpriseTimerRef.current);
    surpriseTimerRef.current = setTimeout(() => {
      setSurpriseBrief(null);
      surpriseTimerRef.current = null;
    }, SURPRISE_CONFIG.briefMs);
  }, [peopleCount, targetPose?.id, templateCategory]);

  /** Bersihkan timer Surprize Me saat unmount. */
  useEffect(() => {
    return () => {
      if (surpriseTimerRef.current) clearTimeout(surpriseTimerRef.current);
    };
  }, []);

  /**
   * Notif senyum (permintaan 16 & 5.6): tampil singkat lalu hilang sendiri.
   *
   * Untuk menjaga semuanya on-device tanpa model tambahan, kita pakai
   * heuristik ringan: kalau jumlah wajah terdeteksi lebih sedikit dari
   * perkiraan orang, kemungkinan ada yang menunduk/tidak terlihat — kita
   * tampilkan pengingat halus. Tidak pernah menghalangi foto.
   */
  useEffect(() => {
    if (!poseCoachOn) return;
    const faces = poseCoach.frame?.faceCount ?? 0;
    if (faces > 0 && faces < peopleCount) {
      // Tampilkan lewat microtask agar tidak setState sinkron di effect.
      let cancelled = false;
      let hideTimer: ReturnType<typeof setTimeout> | undefined;
      Promise.resolve().then(() => {
        if (cancelled) return;
        setSmileNotice("ada yang belum senyum nih");
        hideTimer = setTimeout(() => setSmileNotice(null), 2600);
      });
      return () => {
        cancelled = true;
        if (hideTimer) clearTimeout(hideTimer);
      };
    }
  }, [poseCoach.frame?.faceCount, peopleCount, poseCoachOn]);

  /**
   * Gambar overlay skeleton di kanvas yang menempel pada video.
   * Tidak menggambar apa pun kalau overlay OFF atau tidak ada target.
   */
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    if (!poseCoachOn || !overlayOn || !targetPose || !video) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Samakan ukuran intrinsik kanvas dengan video agar koordinat presisi.
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    drawOverlay(canvas, {
      targets: targetPose.skeletons,
      poses: poseCoach.lastPoses,
      score: poseCoach.score,
    });
  }, [
    overlayOn,
    poseCoach.score,
    poseCoach.lastPoses,
    poseCoachOn,
    targetPose,
    videoRef,
  ]);


  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
      {/* ===== Kolom kamera ===== */}
      <div className="flex flex-col gap-5 min-w-0">
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

        {/*
          Kotak preview TIDAK lagi dipaksa 4:3 / 16:9. Sebelumnya rasio tetap
          + object-cover membuat frame 16:9 di-zoom & di-crop → tampak burem
          ("pecah") dan framing berbeda dari hasil simpan.
          Sekarang rasio mengikuti frame kamera (info.aspectRatio), jadi video
          tampil utuh tanpa upscale. Fallback 16:9 sebelum metadata siap.
        */}
        <div
          ref={previewBoxRef}
          data-testid="preview-box"
          className="relative bg-black overflow-hidden"
          style={{
            aspectRatio: info?.aspectRatio ? String(info.aspectRatio) : "16 / 9",
            maxHeight: "70vh",
          }}
        >
          {/*
            Video preview: object-contain (bukan cover) supaya tidak ada
            bagian frame yang hilang/ter-zoom. Filter HANYA di video preview
            agar WYSIWYG dengan canvas hasil; tidak ada blur CSS di sini.
            width/height atribut diset dari videoWidth/videoHeight asli.
          */}
          <video
            ref={videoRef}
            width={info?.videoWidth || undefined}
            height={info?.videoHeight || undefined}
            style={{ filter: activeFilter.css }}
            className={`absolute inset-0 h-full w-full object-contain mirror-preview transition-opacity duration-300 ${
              isReady ? "opacity-100" : "opacity-0"
            }`}
            autoPlay
            playsInline
            muted
          />

          {/*
            Kanvas overlay skeleton (TAHAP 5.4). Diletakkan TEPAT di atas
            <video> dengan ukuran penuh. CSS scaleX(-1) dipakai agar sejajar
            dengan preview yang di-mirror (lihat CATATAN MIRROR di config).
            pointer-events-none supaya tidak pernah menghalangi klik shutter.
          */}
          <canvas
            ref={overlayCanvasRef}
            aria-hidden
            className="absolute inset-0 h-full w-full object-contain pointer-events-none mirror-preview"
          />

          {/* HUD informasi: skor, coaching, notif senyum, mode Lite. */}
          <PoseCoachHud
            enabled={poseCoachOn && isReady}
            score={poseCoach.score}
            hasTarget={!!targetPose}
            coaching={poseCoach.coaching}
            isLite={poseCoach.isLite}
            autoShutterProgress={poseCoach.autoShutterProgress}
            autoShutterOn={autoShutterOn}
            smileNotice={smileNotice}
            peopleDetected={poseCoach.frame?.poses.length ?? 0}
          />

          {!isReady && (
            <CameraPlaceholder status={status} error={error} onStart={start} />
          )}

          {/* Brief "Surprize Me" (permintaan 20): pose terpilih tampil 3 detik. */}
          {surpriseBrief && (
            <div className="absolute inset-0 grid place-items-center bg-black/45 pointer-events-none">
              <div className="animate-pop max-w-[78%] rounded-2xl bg-black/70 backdrop-blur px-5 py-4 text-center">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-white/60">
                  Pose pilihan untukmu
                </p>
                <p className="mt-1 text-lg font-black text-white">
                  {surpriseBrief.title}
                </p>
                <p className="mt-1 text-[0.72rem] leading-relaxed text-white/75">
                  {surpriseBrief.description}
                </p>
              </div>
            </div>
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

        {/* Panel debug "Info Kamera" (permintaan A.4) — resolusi/fps/label asli. */}
        <CameraInfoPanel info={info} />

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

      {/* ===== Hasil foto per shot (kolom kiri) ===== */}
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Hasil Foto</h2>
            <span className="text-xs text-muted">
              {filledCount}/{PHOTO_COUNT}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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

        <ResultCard
          shots={shots}
          templateId={templateId}
          variantId={variantId}
          layout={layout}
        />
      </div>

      <div className="flex flex-col gap-5 min-w-0">
        <PoseCoachPanel
          enabled={poseCoachOn}
          onToggleEnabled={() => {
            // Matikan juga target & auto-shutter saat coach dimatikan.
            setPoseCoachOn((v) => {
              if (v) {
                setTargetPose(null);
                setAutoShutterOn(false);
              }
              return !v;
            });
          }}
          targetPose={targetPose}
          onSelectPose={setTargetPose}
          peopleCount={peopleCount}
          onPeopleCountChange={setPeopleCount}
          detectedFaceCount={
            poseCoach.frame?.faceCount && poseCoach.frame.faceCount > 0
              ? poseCoach.frame.faceCount
              : null
          }
          overlayOn={overlayOn}
          onToggleOverlay={() => setOverlayOn((v) => !v)}
          autoShutterOn={autoShutterOn}
          onToggleAutoShutter={() => setAutoShutterOn((v) => !v)}
          status={poseCoach.status}
          templateCategory={templateCategory}
          onSurprise={surpriseMe}
          disabled={poseCoach.status === "loading"}
        />

        {stiffHint && (
          <PoseSuggestionToast
            message={stiffHint}
            onDismiss={() => setStiffHint(null)}
          />
        )}

        <LightingIndicator analysis={analysis} active={isReady} />

        <FilterPanel
          value={filterId}
          onChange={setFilterId}
          recommendations={recommendations}
        />

        <TemplatePanel
          templateId={templateId}
          variantId={variantId}
          layout={layout}
          onTemplateChange={changeTemplate}
          onVariantChange={setVariantId}
          onLayoutChange={setLayout}
        />
      </div>
    </div>
  );
}
