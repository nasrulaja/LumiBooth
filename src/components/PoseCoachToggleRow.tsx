"use client";

/** Baris toggle kecil dengan judul + hint (dipakai panel Pose Coach). */
export function ToggleRow({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="w-full flex items-center justify-between gap-3 rounded-lg px-1 py-1 hover:bg-surface-2 transition-colors text-left"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold">{label}</span>
        <span className="block text-[0.62rem] text-muted leading-snug">{hint}</span>
      </span>
      <span
        className={`shrink-0 inline-flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${
          on ? "bg-emerald-500" : "bg-border"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
