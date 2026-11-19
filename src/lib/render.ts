/**
 * LUMIBOOTH — Renderer canvas final
 * ---------------------------------
 * Menggabungkan: foto + filter (sudah diterapkan saat capture) + template
 * frame + watermark menjadi 1 PNG resolusi tinggi.
 *
 * Semua koordinat dihitung dari ukuran output, jadi layout rapi di semua
 * resolusi. Watermark dicek brightness di area-nya: jika area terang, teks
 * otomatis jadi hitam 60% agar tetap terbaca.
 */
import {
  WATERMARK_FONT_SIZE,
  WATERMARK_OPACITY,
  WATERMARK_TEXT,
} from "./config";
import type { ColorVariant, Decoration, LayoutId } from "./templates";

interface RenderInput {
  /** Data URL foto (min. `needed` pertama dipakai). */
  photos: string[];
  layout: LayoutId;
  variant: ColorVariant;
  decoration: Decoration;
  /** Label kecil di bawah (mis. nama template) — opsional. */
  caption?: string;
}

/** Muat data URL menjadi HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Gambar image "cover" ke area tertentu (crop tengah). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ir = img.width / img.height;
  const rr = w / h;
  let sw = img.width;
  let sh = img.height;
  let sx = 0;
  let sy = 0;
  if (ir > rr) {
    sw = img.height * rr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / rr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/** Bulatkan path persegi. */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}


/** Gambar dekorasi sesuai template di seluruh area frame. */
function drawDecoration(
  ctx: CanvasRenderingContext2D,
  d: Decoration,
  w: number,
  h: number,
  accent: string,
) {
  ctx.save();
  switch (d) {
    case "corners": {
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(2, w * 0.006);
      const len = w * 0.06;
      const pad = w * 0.022;
      const corners: [number, number, number, number][] = [
        [pad, pad, 1, 1],
        [w - pad, pad, -1, 1],
        [pad, h - pad, 1, -1],
        [w - pad, h - pad, -1, -1],
      ];
      for (const [x, y, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(x + dx * len, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + dy * len);
        ctx.stroke();
      }
      break;
    }
    case "dots": {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.5;
      const r = w * 0.008;
      const gap = w * 0.05;
      for (let x = gap; x < w; x += gap) {
        for (let y = gap / 2; y < h; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "stripes": {
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = w * 0.012;
      const step = w * 0.055;
      for (let i = -h; i < w; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
        ctx.stroke();
      }
      break;
    }
    case "film": {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.85;
      const bw = w * 0.018;
      const bh = w * 0.026;
      const gap = bh * 2.2;
      for (let y = gap; y < h - bh; y += gap) {
        ctx.fillRect(w * 0.01, y, bw, bh);
        ctx.fillRect(w - w * 0.01 - bw, y, bw, bh);
      }
      break;
    }
    case "confetti": {
      const colors = [accent, "#f472b6", "#60a5fa", "#facc15", "#34d399"];
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < 40; i++) {
        const rx = ((i * 97) % 100) / 100;
        const ry = ((i * 53) % 100) / 100;
        ctx.fillStyle = colors[i % colors.length];
        ctx.save();
        ctx.translate(rx * w, ry * h);
        ctx.rotate((i * 1.7) % Math.PI);
        ctx.fillRect(0, 0, w * 0.012, w * 0.02);
        ctx.restore();
      }
      break;
    }
    case "grid": {
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = Math.max(1, w * 0.0022);
      const step = w * 0.035;
      for (let x = 0; x <= w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      break;
    }
    case "tape": {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.9;
      const tw = w * 0.2;
      const th = h * 0.03;
      const drawTape = (x: number, y: number, rot: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillRect(-tw / 2, -th / 2, tw, th);
        ctx.restore();
      };
      drawTape(w * 0.16, h * 0.035, -0.35);
      drawTape(w * 0.84, h * 0.035, 0.35);
      break;
    }
    case "none":
    default:
      break;
  }
  ctx.restore();
}

/**
 * Watermark pojok kanan bawah.
 * Cek rata-rata brightness area watermark; jika terang (>140) pakai hitam
 * 60%, selain itu putih 60% — sesuai spesifikasi.
 */
function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const pad = w * 0.018;
  const fontSize = WATERMARK_FONT_SIZE;
  ctx.save();
  ctx.font = `500 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";

  const metrics = ctx.measureText(WATERMARK_TEXT);
  const textW = metrics.width;
  const textH = fontSize * 1.4;

  const bx = Math.max(0, Math.floor(w - pad - textW - 4));
  const by = Math.max(0, Math.floor(h - pad - textH - 4));
  const bw = Math.min(Math.ceil(textW + 8), w - bx);
  const bh = Math.min(Math.ceil(textH + 8), h - by);

  let bright = 160;
  try {
    const data = ctx.getImageData(bx, by, bw, bh).data;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 16) {
      const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += l;
      count++;
    }
    if (count > 0) bright = sum / count;
  } catch {
    /* getImageData bisa gagal (tainted) — pakai default */
  }

  const color = bright > 140 ? "0,0,0" : "255,255,255";
  ctx.fillStyle = `rgba(${color},${WATERMARK_OPACITY})`;
  ctx.shadowColor =
    bright > 140 ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 2;
  ctx.fillText(WATERMARK_TEXT, w - pad, h - pad);
  ctx.restore();
}


/**
 * Hitung & gambar. Mengembalikan canvas siap di-export.
 *
 * Layout:
 *  - strip : 4 foto vertikal (rasio foto 4:5), frame di luar.
 *  - grid  : 2×2 foto.
 *  - single: 1 foto besar.
 */
export async function renderComposite(
  input: RenderInput,
): Promise<HTMLCanvasElement> {
  const { layout, variant, decoration, caption } = input;
  const imgs = await Promise.all(input.photos.map(loadImage));
  if (imgs.length === 0) throw new Error("Tidak ada foto untuk dirender");

  const PAD = 46;
  const GAP = 14;
  const photoW = 900;
  const photoH = Math.round(photoW * 1.25);
  const footerH = caption ? 70 : 40;
  const slots: { x: number; y: number; w: number; h: number }[] = [];

  let W: number;
  let H: number;

  if (layout === "strip") {
    const count = Math.min(imgs.length, 4);
    W = PAD * 2 + photoW;
    H = PAD * 2 + footerH + count * photoH + (count - 1) * GAP;
    let y = PAD;
    for (let i = 0; i < count; i++) {
      slots.push({ x: PAD, y, w: photoW, h: photoH });
      y += photoH + GAP;
    }
  } else if (layout === "grid") {
    const count = Math.min(imgs.length, 4);
    const cols = 2;
    const rows = Math.ceil(count / cols);
    W = PAD * 2 + photoW * 2 + GAP;
    H = PAD * 2 + footerH + rows * photoH + (rows - 1) * GAP;
    for (let i = 0; i < count; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      slots.push({
        x: PAD + c * (photoW + GAP),
        y: PAD + r * (photoH + GAP),
        w: photoW,
        h: photoH,
      });
    }
  } else {
    const bigW = 1000;
    const bigH = Math.round(bigW * 1.25);
    W = PAD * 2 + bigW;
    H = PAD * 2 + footerH + bigH;
    slots.push({ x: PAD, y: PAD, w: bigW, h: bigH });
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia");

  // 1) Background frame.
  ctx.fillStyle = variant.bg;
  ctx.fillRect(0, 0, W, H);

  // 2) Dekorasi (di belakang foto).
  drawDecoration(ctx, decoration, W, H, variant.accent);

  // 3) Foto (cover-crop ke tiap slot).
  const needed = layout === "single" ? 1 : Math.min(4, imgs.length);
  for (let i = 0; i < slots.length && i < needed; i++) {
    const s = slots[i];
    ctx.save();
    roundRect(ctx, s.x, s.y, s.w, s.h, 18);
    ctx.clip();
    drawCover(ctx, imgs[i], s.x, s.y, s.w, s.h);
    ctx.restore();
    ctx.save();
    roundRect(ctx, s.x, s.y, s.w, s.h, 18);
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // 4) Caption (opsional).
  if (caption) {
    ctx.save();
    ctx.fillStyle = variant.text;
    ctx.font = `700 26px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(caption, W / 2, H - footerH / 2 - 6);
    ctx.restore();
  }

  // 5) Watermark di pojok kanan bawah.
  drawWatermark(ctx, W, H);

  return canvas;
}

/** Ekspor canvas ke data URL PNG kualitas tinggi. */
export function canvasToPng(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}
