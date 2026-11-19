/**
 * Marquee teks berjalan tanpa henti (permintaan B.2).
 *
 * Teknis: dua salinan daftar yang sama diletakkan berdampingan lalu digeser
 * -50% secara linear. Karena isinya identik, titik sambungnya tidak terlihat
 * → tampak loop tanpa henti. Hormati `prefers-reduced-motion` (lihat CSS).
 */
export function Marquee({ items }: { items: string[] }) {
  const row = (key: string) => (
    <ul
      key={key}
      className="flex shrink-0 items-center gap-0"
      aria-hidden={key === "dup"}
    >
      {items.map((text, i) => (
        <li key={`${key}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="px-5 text-[0.7rem] sm:text-xs font-bold uppercase tracking-[0.16em]">
            {text}
          </span>
          <span aria-hidden className="text-brand text-[0.8rem]">
            ●
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      data-testid="marquee"
      className="relative overflow-hidden border-y bg-surface-2/60 py-2.5 text-muted select-none"
    >
      <div className="flex w-max animate-marquee">
        {row("a")}
        {row("dup")}
      </div>
    </div>
  );
}
