/** Kumpulan komponen UI kecil yang dipakai berulang. */
import type { ReactNode } from "react";

/** Badge kecil dengan varian warna. */
export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warn";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-2 text-muted",
    brand: "text-brand-contrast",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    warn: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  };
  const style =
    tone === "brand"
      ? { background: "linear-gradient(135deg, var(--brand), var(--brand-2))" }
      : undefined;
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Tombol utama dengan gradient brand. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-2))" }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 h-11 text-sm font-semibold text-brand-contrast shadow-sm transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

/** Tombol sekunder (outline). */
export function GhostButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11 text-sm font-semibold bg-surface-2 hover:bg-border transition-colors disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

/** Kartu permukaan standar. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-surface shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
