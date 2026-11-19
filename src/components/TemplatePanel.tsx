"use client";

import { useMemo } from "react";
import {
  LAYOUTS,
  TEMPLATES,
  type ColorVariant,
  type LayoutId,
} from "@/lib/templates";
import { Card } from "./ui";

/**
 * Panel pemilihan template frame (dengan >=3 varian warna) dan layout hasil.
 */
export function TemplatePanel({
  templateId,
  variantId,
  layout,
  onTemplateChange,
  onVariantChange,
  onLayoutChange,
}: {
  templateId: string;
  variantId: string;
  layout: LayoutId;
  onTemplateChange: (id: string) => void;
  onVariantChange: (id: string) => void;
  onLayoutChange: (id: LayoutId) => void;
}) {
  const activeTemplate = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const variants: ColorVariant[] = useMemo(
    () => activeTemplate.variants,
    [activeTemplate],
  );

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Template & Layout</h2>
        <span className="text-xs text-muted">
          {TEMPLATES.length} template
        </span>
      </div>

      {/* Layout */}
      <div className="mb-3">
        <p className="text-[0.7rem] font-semibold text-muted mb-1.5">Layout hasil</p>
        <div role="radiogroup" aria-label="Layout" className="grid grid-cols-3 gap-2">
          {LAYOUTS.map((l) => {
            const active = layout === l.id;
            return (
              <button
                key={l.id}
                role="radio"
                aria-checked={active}
                onClick={() => onLayoutChange(l.id)}
                className={`rounded-xl border p-2 text-left transition-all ${
                  active
                    ? "ring-2 ring-[color:var(--brand)] border-transparent"
                    : "hover:border-[color:var(--brand)]/40"
                }`}
              >
                <LayoutIcon id={l.id} active={active} />
                <span className="mt-1 block text-[0.7rem] font-semibold">{l.name}</span>
                <span className="block text-[0.6rem] text-muted leading-tight">
                  {l.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid template */}
      <p className="text-[0.7rem] font-semibold text-muted mb-1.5">Template frame</p>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-52 overflow-y-auto pr-1">
        {TEMPLATES.map((t) => {
          const active = t.id === templateId;
          const v = t.variants[0];
          return (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              title={`${t.name} · ${t.category}`}
              className={`rounded-lg border p-1 transition-all ${
                active
                  ? "ring-2 ring-[color:var(--brand)] border-transparent"
                  : "hover:border-[color:var(--brand)]/40"
              }`}
            >
              <span
                className="block h-8 w-full rounded"
                style={{
                  background: `linear-gradient(135deg, ${v.bg}, ${v.accent})`,
                }}
                aria-hidden
              />
              <span className="mt-0.5 block text-[0.55rem] font-semibold truncate">
                {t.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Varian warna template aktif */}
      <div className="mt-3">
        <p className="text-[0.7rem] font-semibold text-muted mb-1.5">
          Varian warna — {activeTemplate.name}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {variants.map((v) => {
            const active = variantId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onVariantChange(v.id)}
                title={v.name}
                aria-label={`Warna ${v.name}`}
                aria-pressed={active}
                className={`relative h-8 w-8 rounded-full border-2 transition-transform ${
                  active
                    ? "scale-110 border-[color:var(--brand)]"
                    : "border-border hover:scale-105"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${v.bg}, ${v.accent})`,
                }}
              >
                {active && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="h-2 w-2 rounded-full bg-white shadow" />
                  </span>
                )}
              </button>
            );
          })}
          <span className="text-[0.65rem] text-muted ml-1">
            {variants.find((v) => v.id === variantId)?.name}
          </span>
        </div>
      </div>
    </Card>
  );
}

/** Ikon kecil untuk tiap layout. */
function LayoutIcon({ id, active }: { id: LayoutId; active: boolean }) {
  const c = active ? "var(--brand)" : "var(--muted)";
  const box = (x: number, y: number, w: number, h: number) => (
    <rect x={x} y={y} width={w} height={h} rx="1" fill={c} opacity="0.75" />
  );
  return (
    <svg width="100%" height="22" viewBox="0 0 40 22" preserveAspectRatio="xMidYMid meet">
      {id === "strip" && (
        <>
          {box(14, 1, 12, 4)}
          {box(14, 6, 12, 4)}
          {box(14, 11, 12, 4)}
          {box(14, 16, 12, 4)}
        </>
      )}
      {id === "grid" && (
        <>
          {box(5, 2, 14, 8)}
          {box(21, 2, 14, 8)}
          {box(5, 12, 14, 8)}
          {box(21, 12, 14, 8)}
        </>
      )}
      {id === "single" && box(8, 2, 24, 18)}
    </svg>
  );
}
