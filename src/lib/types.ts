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
