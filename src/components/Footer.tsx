"use client";

import { useEffect, useState } from "react";
import { AUTHOR_HANDLE, AUTHOR_URL, APP_NAME } from "@/lib/config";

/** Footer global: credit wajib di semua halaman. */
export function Footer() {
  // Tahun dihitung di client agar tidak memblokir prerender.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);

  return (
    <footer className="border-t mt-auto">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
        <p className="text-center sm:text-left">
          Made with{" "}
          <span aria-label="love" role="img">❤️</span> by{" "}
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:underline underline-offset-4"
          >
            {AUTHOR_HANDLE}
          </a>
        </p>
        <p className="text-xs">
          © {year ?? ""} {APP_NAME}. Foto diproses 100% di browser.
        </p>
      </div>
    </footer>
  );
}
