"use client";

import { Card, GhostButton, PrimaryButton } from "@/components/ui";
import { Marquee } from "./Marquee";

/**
 * Marquee fitur. Sengaja menyebut nilai jual utama LumiBooth (pintar/cerdas),
 * bukan sekadar "frame lucu" seperti kompetitor.
 */
const MARQUEE_ITEMS = [
  "FOTO EDIT BAGIKAN",
  "TANPA APLIKASI",
  "UNDUH INSTAN",
  "DETEKSI CAHAYA OTOMATIS",
  "AI POSE COACH",
];

/** Fitur utama — 4 kartu (permintaan B.3). */
const FEATURES = [
  {
    icon: "camera",
    title: "Live Webcam HD",
    desc: "Kamera depan resolusi tinggi otomatis. Full HD bila perangkat mendukung, turun bertingkat bila tidak.",
  },
  {
    icon: "sun",
    title: "Filter Cerdas Deteksi Cahaya",
    desc: "LumiBooth membaca pencahayaan ruangan lalu merekomendasikan filter yang paling pas — bukan sekadar tempelan.",
  },
  {
    icon: "frame",
    title: "13+ Template Frame",
    desc: "Strip, grid, dan single. Setiap template punya varian warna & layout yang bisa diganti kapan saja.",
  },
  {
    icon: "sparkle",
    title: "AI Pose Coach",
    desc: "Panduan pose real-time di perangkatmu. Saran gaya, skor pose, dan auto-shutter opsional.",
  },
];

/** Segmen pengguna (permintaan B.4). */
const AUDIENCES = [
  {
    title: "Event Organizer",
    desc: "Booth instan untuk wedding, gathering, dan pameran. Tanpa instalasi, tanpa antre panjang.",
  },
  {
    title: "Content Creator",
    desc: "Hasil siap posting dengan framing rapi dan filter yang sudah disesuaikan cahaya.",
  },
  {
    title: "Bisnis & Brand",
    desc: "Watermark otomatis di setiap foto — branding ikut terbawa saat hasil dibagikan.",
  },
  {
    title: "Penggunaan Pribadi",
    desc: "Foto keluarga, pasangan, atau squad. Semua diproses lokal, tidak ada yang diunggah.",
  },
];

/** Ikon sederhana per fitur (inline SVG, tanpa dependency). */
function FeatureIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "camera") {
    return (
      <svg {...common}>
        <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7l1.1-1.6h5.4L14.8 6h1.7A2.5 2.5 0 0 1 19 8.5v9A2.5 2.5 0 0 1 16.5 20h-11A2.5 2.5 0 0 1 3 17.5Z" />
        <circle cx="11" cy="13" r="3.2" />
      </svg>
    );
  }
  if (name === "sun") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </svg>
    );
  }
  if (name === "frame") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="7" height="7" rx="1.5" />
        <rect x="14" y="4" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7Z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" />
    </svg>
  );
}


/**
 * Landing page (permintaan B) — tampil SEBELUM kamera.
 *
 * Posisi produk (permintaan C): LumiBooth bukan sekadar penjual frame unik
 * seperti funcam, tapi "Next-Gen Photobooth" yang unggul di kecerdasan:
 * deteksi cahaya + rekomendasi filter + AI Pose Coach.
 */
export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        {/* Glow dekoratif di belakang hero. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--brand) 22%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-14 sm:pt-20 pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-surface/70 px-3 py-1 text-[0.7rem] font-semibold text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Next-Gen Photobooth · 100% In-Browser, Privat
          </span>

          <h1 className="mt-5 text-[2.1rem] leading-[1.08] sm:text-6xl font-black tracking-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, var(--brand), var(--brand-2))",
              }}
            >
              LumiBooth
            </span>
            <span className="block mt-1 text-[1.35rem] sm:text-4xl">
              Photo booth pintar di browser
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted">
            Photobooth online gratis langsung dari browser — tanpa aplikasi.
            LumiBooth membaca cahaya ruangan, merekomendasikan filter, dan
            memandu pose dengan AI. Semua foto diproses di perangkatmu.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <PrimaryButton
              onClick={onStart}
              className="h-12 px-7 text-base w-full sm:w-auto"
            >
              Mulai Gratis
              <span aria-hidden>→</span>
            </PrimaryButton>
            <GhostButton
              onClick={onStart}
              className="h-12 px-6 w-full sm:w-auto"
            >
              Klik Mulai
            </GhostButton>
          </div>

          <p className="mt-3 text-[0.72rem] text-muted">
            Tanpa daftar · Tanpa upload · Hasil PNG siap unduh
          </p>
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <Marquee items={MARQUEE_ITEMS} />


      {/* ---------- FITUR ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-14">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Kenapa LumiBooth lebih cerdas?
          </h2>
          <p className="mt-1.5 text-sm text-muted max-w-xl mx-auto">
            Bukan cuma bingkai lucu — mesinnya ikut membantu hasil fotomu bagus.
          </p>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-5 flex flex-col gap-3">
              <span
                className="grid place-items-center h-10 w-10 rounded-xl text-brand-contrast"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand), var(--brand-2))",
                }}
                aria-hidden
              >
                <FeatureIcon name={f.icon} />
              </span>
              <h3 className="font-bold text-sm leading-snug">{f.title}</h3>
              <p className="text-xs leading-relaxed text-muted">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------- UNTUK SIAPA ---------- */}
      <section className="border-t bg-surface-2/40">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-14">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Untuk Siapa?
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Dipakai dari acara besar sampai foto bareng di kamar.
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a, i) => (
              <Card key={a.title} className="p-5">
                <span className="text-[0.7rem] font-black text-brand tabular-nums">
                  0{i + 1}
                </span>
                <h3 className="mt-1 font-bold text-sm">{a.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {a.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA PENUTUP ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-14 text-center">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Siap ambil foto?
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Empat foto, satu klik. Selesai dalam hitungan detik.
        </p>
        <PrimaryButton onClick={onStart} className="mt-5 h-12 px-7 text-base">
          Mulai Gratis
          <span aria-hidden>→</span>
        </PrimaryButton>
      </section>
    </div>
  );
}
