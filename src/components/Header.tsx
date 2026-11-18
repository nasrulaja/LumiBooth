"use client";

import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { ThemeToggle } from "./ThemeToggle";

/** Logo LumiBooth: aperture sederhana + wordmark. */
function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 group">
      <span
        className="grid place-items-center h-9 w-9 rounded-xl text-brand-contrast shadow-sm transition-transform group-hover:rotate-6"
        style={{
          background: "linear-gradient(135deg, var(--brand), var(--brand-2))",
        }}
        aria-hidden
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="3.2" fill="currentColor" />
          <path
            d="M12 3.5v4M20.5 12h-4M12 20.5v-4M3.5 12h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-[1.05rem] font-bold tracking-tight">
          {APP_NAME}
        </span>
        <span className="hidden sm:block text-[0.7rem] text-muted -mt-0.5">
          {APP_TAGLINE}
        </span>
      </span>
    </a>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/ruelzexe"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
            </svg>
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
