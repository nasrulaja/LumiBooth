"use client";

import { useEffect, useRef, useState } from "react";
import { analyzeFrame, type LightingAnalysis } from "@/lib/lighting";

/**
 * Sampling frame video secara berkala lalu analisis pencahayaan.
 *
 * Kenapa canvas kecil? Kita hanya butuh statistik rata-rata, bukan detail.
 * Dengan 64×48 (≈3072 piksel) analisis jadi sangat ringan (±beberapa ms),
 * sehingga bisa jalan tiap 1 detik tanpa mengganggu performa preview.
 */
export function useLighting(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean,
  intervalMs = 1000,
) {
  const [analysis, setAnalysis] = useState<LightingAnalysis | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 64;
      canvasRef.current.height = 48;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let stopped = false;

    const sample = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) return;
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const result = analyzeFrame(ctx, canvas.width, canvas.height);
        setAnalysis(result);
      } catch {
        // drawImage bisa gagal sesaat saat stream restart — abaikan.
      }
    };

    sample(); // langsung sekali
    const timer = setInterval(() => {
      if (!stopped) sample();
    }, intervalMs);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [active, intervalMs, videoRef]);

  return analysis;
}
