/** Tipe bersama untuk LumiBooth. */

export type ResolutionMode = "auto" | ResolutionPresetId;
export type ResolutionPresetId = "fullhd" | "hd" | "sd";

export interface ActiveResolution {
  width: number;
  height: number;
  label: string;
  /** true bila resolusi didapat dari fallback (bukan target ideal). */
  isFallback: boolean;
}

/** Satu jepretan foto yang sudah disimpan sebagai data URL. */
export interface Shot {
  id: string;
  dataUrl: string;
  /** true bila slot ini diambil ulang manual oleh user. */
  retaken: boolean;
}

/**
 * Info kamera aktual untuk panel debug "Info Kamera" dan untuk menyamakan
 * framing preview dengan hasil capture (WYSIWYG).
 */
export interface CameraInfo {
  /** Ukuran frame asli yang dilaporkan <video> (bukan ukuran CSS). */
  videoWidth: number;
  videoHeight: number;
  /** Resolusi + fps dari track settings (yang benar-benar diberikan kamera). */
  trackWidth: number | null;
  trackHeight: number | null;
  frameRate: number | null;
  /** Label perangkat, mis. "FaceTime HD Camera" atau "fake_device_0". */
  deviceLabel: string | null;
  /** facingMode yang dipakai: "user" (depan) atau "environment" (belakang). */
  facingMode: "user" | "environment";
  /** Rasio aspek asli (width / height). */
  aspectRatio: number;
  /** Preset/chain yang berhasil, mis. "1920×1080". */
  appliedPreset: string;
}

