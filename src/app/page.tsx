"use client";

import { useState } from "react";
import { Landing } from "@/components/Landing";
import { Photobooth } from "@/components/Photobooth";

/**
 * Root halaman: dua tahap (permintaan B.6).
 *
 * 1. LANDING — hero, marquee, fitur, "Untuk Siapa?", footer.
 * 2. BOOTH — flow photobooth lama (kamera → countdown → filter/template →
 *    download), dibuka hanya setelah user klik "Mulai".
 *
 * Kamera sengaja TIDAK diminta di landing, jadi tidak ada prompt izin
 * sebelum user benar-benar berniat memakai booth.
 */
export default function Home() {
  const [stage, setStage] = useState<"landing" | "booth">("landing");

  if (stage === "landing") {
    return <Landing onStart={() => setStage("booth")} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
      {/* Tombol kembali ke landing (permintaan B.7). */}
      <button
        type="button"
        onClick={() => setStage("landing")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground transition-colors"
      >
        <span aria-hidden>←</span> Kembali
      </button>

      <section className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Photo booth pintar di browser
        </h1>
        <p className="mt-1.5 text-sm text-muted max-w-2xl">
          Ambil 4 foto otomatis dengan countdown, resolusi kamera terbaik yang
          didukung perangkatmu. Tanpa upload — semua diproses lokal.
        </p>
      </section>
      <Photobooth />
    </div>
  );
}

