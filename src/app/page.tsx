import type { Metadata } from "next";
import { Photobooth } from "@/components/Photobooth";

export const metadata: Metadata = {
  title: "LumiBooth — Ambil foto",
};

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
      <section className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Photo booth pintar di browser
        </h1>
        <p className="mt-1.5 text-sm text-muted max-w-2xl">
          Ambil {`4`} foto otomatis dengan countdown, resolusi kamera terbaik
          yang didukung perangkatmu. Tanpa upload — semua diproses lokal.
        </p>
      </section>
      <Photobooth />
    </div>
  );
}
