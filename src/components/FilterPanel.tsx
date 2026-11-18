"use client";

import { FILTERS } from "@/lib/filters";
import type { Recommendation } from "@/lib/recommendations";
import { Badge, Card } from "./ui";

/**
 * Panel daftar filter dengan preview CSS + badge "✨ Recommended"
 * yang mengikuti rekomendasi pencahayaan secara real-time.
 */
export function FilterPanel({
  value,
  onChange,
  recommendations,
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
  recommendations: Recommendation[];
  disabled?: boolean;
}) {
  const recIds = new Set(recommendations.map((r) => r.filterId));

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Filter</h2>
        <span className="text-xs text-muted">
          {recommendations.length > 0
            ? `${recommendations.length} rekomendasi`
            : "Pilih gaya"}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Filter foto"
        className="grid grid-cols-3 gap-2"
      >
        {FILTERS.map((f) => {
          const active = value === f.id;
          const rec = recIds.has(f.id);
          return (
            <button
              key={f.id}
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(f.id)}
              title={f.desc}
              className={`group relative rounded-xl border p-1.5 text-left transition-all disabled:opacity-50 ${
                active
                  ? "border-transparent ring-2 ring-[color:var(--brand)]"
                  : "hover:border-[color:var(--brand)]/40"
              }`}
            >
              <span
                className="block h-12 w-full rounded-lg"
                style={{
                  backgroundImage: f.swatch,
                  filter: f.css === "none" ? undefined : f.css,
                }}
                aria-hidden
              />
              <span className="mt-1 block text-[0.7rem] font-semibold leading-tight">
                {f.name}
              </span>
              {rec && (
                <span className="absolute -top-1.5 -right-1.5">
                  <Badge tone="brand" className="!px-1.5 !py-0 text-[0.55rem] shadow">
                    ✨
                  </Badge>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Penjelasan rekomendasi aktif */}
      {recommendations.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {recommendations.map((r) => {
            const f = FILTERS.find((x) => x.id === r.filterId);
            return (
              <li
                key={r.filterId}
                className="flex items-start gap-1.5 text-[0.68rem] text-muted leading-snug"
              >
                <span className="text-[color:var(--brand)]">✨</span>
                <span>
                  <strong className="text-foreground">{f?.name}</strong> —{" "}
                  {r.reason}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
