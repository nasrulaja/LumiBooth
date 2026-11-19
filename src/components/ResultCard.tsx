"use client";

import { useCallback, useEffect, useState } from "react";
import { canvasToPng, renderComposite } from "@/lib/render";
import { getTemplate, type LayoutId } from "@/lib/templates";
import type { Shot } from "@/lib/types";
import { Card, GhostButton, PrimaryButton } from "./ui";

/**
 * Menampilkan preview hasil akhir (foto + filter + frame + watermark) dan
 * tombol download PNG kualitas tinggi.
 */
export function ResultCard({
  shots,
  templateId,
  variantId,
  layout,
}: {
  shots: (Shot | null)[];
  templateId: string;
  variantId: string;
  layout: LayoutId;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filled = shots.filter((s): s is Shot => Boolean(s));
  const ready = filled.length > 0;

  const activeTemplate = getTemplate(templateId);
  const variant =
    activeTemplate.variants.find((v) => v.id === variantId) ??
    activeTemplate.variants[0];

  /** Render ulang preview setiap kali input berubah. */
  const render = useCallback(async () => {
    if (!ready) {
      setPreview(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const canvas = await renderComposite({
        photos: filled.map((s) => s.dataUrl),
        layout,
        variant,
        decoration: activeTemplate.decoration,
        caption: `${activeTemplate.name}`,
      });
      setPreview(canvasToPng(canvas));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat hasil");
    } finally {
      setBusy(false);
    }
  }, [activeTemplate, filled, layout, ready, variant]);

  useEffect(() => {
    void render();
  }, [render]);

  /** Download PNG. */
  const download = useCallback(() => {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = `lumibooth-${layout}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [layout, preview]);

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Hasil Akhir</h2>
        <span className="text-xs text-muted">PNG · watermark</span>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-surface-2 border grid place-items-center min-h-[160px] max-h-[60vh]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Hasil akhir LumiBooth"
            className="w-full h-auto block"
          />
        ) : (
          <p className="p-6 text-center text-xs text-muted">
            {busy
              ? "Menyiapkan hasil…"
              : "Ambil foto dulu untuk melihat hasil lengkap dengan frame & watermark."}
          </p>
        )}
        {busy && preview && (
          <div className="absolute inset-0 bg-black/20 grid place-items-center">
            <span className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <div className="mt-3 flex items-center gap-2">
        <PrimaryButton onClick={download} disabled={!preview || busy} className="flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download PNG
        </PrimaryButton>
        <GhostButton onClick={render} disabled={!ready || busy}>
          Refresh
        </GhostButton>
      </div>
    </Card>
  );
}
