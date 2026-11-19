"use client";

/**
 * LUMIBOOTH — Panel Pose Coach (TAHAP 5.9)
 * ======================================
 * Semua kontrol user ada di sini:
 *  - toggle global Pose Coach (default OFF)
 *  - pilih jumlah orang (BlazeFace otomatis / dropdown manual)
 *  - pilih pose target dari library (atau "Surprize Me")
 *  - toggle overlay skeleton & auto-shutter (dua-duanya default OFF)
 *
 * Nada UI: SUGGESTIF. Tidak ada kata "harus"/"wajib". Tagline wajib
 * ditampilkan apa adanya (permintaan 24).
 */
import { useMemo, useState } from "react";
import { POSE_COACH_CTA, POSE_COACH_TAGLINE } from "@/lib/pose-coach-config";
import { categoryForCount, posesByCategory } from "@/lib/pose-library";
import type { PoseCategory, PoseDefinition } from "@/lib/pose-types";
import { Badge, Card, GhostButton } from "./ui";
import { ToggleRow } from "./PoseCoachToggleRow";

/** Label kategori yang ramah dibaca. */
const CATEGORY_LABEL: Record<PoseCategory, string> = {
  solo: "Solo",
  couple: "Berdua",
  trio: "Bertiga",
  squad: "Squad",
};

/** Pilihan jumlah orang (fallback manual, permintaan 2 & 27). */
const PEOPLE_OPTIONS = [1, 2, 3, 4];

export interface PoseCoachPanelProps {
  /** Toggle global. */
  enabled: boolean;
  onToggleEnabled: () => void;
  /** Pose target aktif (null = free style). */
  targetPose: PoseDefinition | null;
  onSelectPose: (pose: PoseDefinition | null) => void;
  /** Jumlah orang manual. */
  peopleCount: number;
  onPeopleCountChange: (n: number) => void;
  /** Jumlah wajah hasil BlazeFace (null = belum ada / gagal). */
  detectedFaceCount: number | null;
  /** Overlay skeleton. */
  overlayOn: boolean;
  onToggleOverlay: () => void;
  /** Auto-shutter (default OFF). */
  autoShutterOn: boolean;
  onToggleAutoShutter: () => void;
  /** Status engine untuk pesan fallback. */
  status: string;
  /** Kategori template aktif untuk rekomendasi (permintaan 18). */
  templateCategory?: string;
  /** Callback Surprize Me. */
  onSurprise: () => void;
  /** Nonaktifkan library saat model belum siap. */
  disabled?: boolean;
}

export function PoseCoachPanel(props: PoseCoachPanelProps) {
  const {
    enabled,
    onToggleEnabled,
    targetPose,
    onSelectPose,
    peopleCount,
    onPeopleCountChange,
    detectedFaceCount,
    overlayOn,
    onToggleOverlay,
    autoShutterOn,
    onToggleAutoShutter,
    status,
    templateCategory,
    onSurprise,
    disabled,
  } = props;

  const [expanded, setExpanded] = useState(false);

  // Daftar pose sesuai kategori jumlah orang.
  const category = categoryForCount(peopleCount);
  const poses = useMemo(() => posesByCategory(category), [category]);

  /* ---------- Kondisi: coach OFF → cukup tampilkan ajakan ---------- */
  if (!enabled) {
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <span aria-hidden>✨</span> Pose Coach
            </h2>
            <p className="mt-1 text-[0.72rem] leading-relaxed text-muted">
              {POSE_COACH_TAGLINE}
            </p>
          </div>
          <Badge tone="neutral" className="shrink-0">OFF</Badge>
        </div>
        <GhostButton onClick={onToggleEnabled} className="mt-3 w-full">
          {POSE_COACH_CTA}
        </GhostButton>
        <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
          Semua deteksi jalan di perangkatmu. Tidak ada video yang dikirim ke server.
        </p>
      </Card>
    );
  }

  /* ---------- Coach ON ---------- */
  const faceInfo =
    detectedFaceCount && detectedFaceCount > 0
      ? `${detectedFaceCount} wajah terdeteksi`
      : "deteksi wajah belum tersedia";

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold flex items-center gap-1.5">
            <span aria-hidden>✨</span> Pose Coach
          </h2>
          <p className="mt-1 text-[0.72rem] leading-relaxed text-muted">
            {POSE_COACH_TAGLINE}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleEnabled}
          aria-pressed={enabled}
          className="shrink-0 inline-flex h-6 w-11 items-center rounded-full px-0.5"
          style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-2))" }}
          title="Matikan Pose Coach"
        >
          <span className="h-5 w-5 rounded-full bg-white shadow ml-auto" />
        </button>
      </div>

      {/* Status engine + fallback (5.10) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {status === "loading" && <Badge tone="warn">Memuat model…</Badge>}
        {status === "ready" && <Badge tone="success">Aktif</Badge>}
        {status === "lite" && <Badge tone="warn">Mode Lite</Badge>}
        {status === "error" && <Badge tone="warn">Model gagal</Badge>}
        <Badge tone="neutral">{faceInfo}</Badge>
      </div>

      {/* Jumlah orang (dropdown manual, permintaan 2) */}
      <div>
        <label className="text-[0.7rem] font-semibold text-muted">Jumlah orang</label>
        <div className="mt-1 inline-flex p-1 rounded-xl bg-surface-2 gap-1">
          {PEOPLE_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onPeopleCountChange(n)}
              aria-pressed={peopleCount === n}
              className={`px-3 h-7 rounded-lg text-xs font-semibold transition-colors ${
                peopleCount === n
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {n === 4 ? "4+" : n}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle overlay & auto-shutter */}
      <div className="space-y-1.5">
        <ToggleRow
          label="Overlay panduan"
          hint="Siluet pose target di atas preview"
          on={overlayOn}
          onToggle={onToggleOverlay}
        />
        <ToggleRow
          label="Auto-shutter"
          hint="Foto otomatis saat pose match 85% stabil 1.5 detik"
          on={autoShutterOn}
          onToggle={onToggleAutoShutter}
        />
      </div>


      {/* Pose target */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[0.7rem] font-semibold text-muted">
            Pose target ({CATEGORY_LABEL[category]})
          </label>
          {targetPose && (
            <button
              type="button"
              onClick={() => onSelectPose(null)}
              className="text-[0.68rem] font-semibold text-muted hover:text-foreground"
            >
              Bebas gaya
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          <GhostButton onClick={onSurprise} className="h-9 flex-1 text-xs">
            🎲 Surprize Me
          </GhostButton>
          <GhostButton
            onClick={() => setExpanded((v) => !v)}
            className="h-9 flex-1 text-xs"
            disabled={disabled}
          >
            {expanded ? "Tutup" : "Pilih pose"}
          </GhostButton>
        </div>

        {targetPose && (
          <div className="rounded-xl border bg-surface-2 p-2.5">
            <p className="text-xs font-bold">{targetPose.title}</p>
            <p className="mt-0.5 text-[0.7rem] leading-relaxed text-muted">
              {targetPose.description}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Badge tone={targetPose.difficulty === "Easy" ? "success" : "warn"}>
                {targetPose.difficulty}
              </Badge>
              {targetPose.tags.map((t) => (
                <Badge key={t} tone="neutral">{t}</Badge>
              ))}
            </div>
          </div>
        )}

        {expanded && (
          <ul className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {poses.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPose(p);
                    setExpanded(false);
                  }}
                  className={`w-full text-left rounded-lg px-2.5 py-1.5 transition-colors ${
                    targetPose?.id === p.id
                      ? "bg-surface-2 ring-1 ring-border"
                      : "hover:bg-surface-2"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{p.title}</span>
                    <span className="text-[0.6rem] text-muted">{p.difficulty}</span>
                  </span>
                  <span className="block text-[0.65rem] text-muted truncate">
                    {p.description}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {templateCategory && (
        <p className="text-[0.62rem] leading-relaxed text-muted">
          Saran disesuaikan dengan template aktif.
        </p>
      )}
    </Card>
  );
}

