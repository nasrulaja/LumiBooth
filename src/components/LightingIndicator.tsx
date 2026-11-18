"use client";

import { LIGHTING_THRESHOLDS, type LightingAnalysis } from "@/lib/lighting";
import { Badge, Card } from "./ui";

/** Bar meter kecil 0..255. */
function Meter({
  label,
  value,
  max,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[0.65rem] mb-0.5">
        <span className="text-muted">{label}</span>
        <span className="font-mono font-semibold">
          {Math.round(value)}
          {hint && <span className="text-muted font-normal"> {hint}</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--brand), var(--brand-2))",
          }}
        />
      </div>
    </div>
  );
}

/** Kartu metrik pencahayaan real-time. */
export function LightingIndicator({
  analysis,
  active,
}: {
  analysis: LightingAnalysis | null;
  active: boolean;
}) {
  const t = LIGHTING_THRESHOLDS;

  // Tone badge berdasarkan kondisi.
  const tone =
    !analysis
      ? "neutral"
      : analysis.brightness < t.dark
        ? "warn"
        : analysis.brightness > t.bright
          ? "success"
          : "brand";

  // Posisi penanda colorTemp pada skala -1..+1.
  const ctPct = analysis
    ? Math.round(((analysis.colorTemp + 1) / 2) * 100)
    : 50;

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Deteksi Cahaya</h2>
        {active && analysis ? (
          <Badge tone={tone as "warn" | "success" | "brand"}>
            {analysis.label}
          </Badge>
        ) : (
          <Badge>menunggu kamera…</Badge>
        )}
      </div>

      {analysis ? (
        <div className="space-y-2.5">
          <Meter label="Brightness" value={analysis.brightness} max={255} />
          <Meter
            label="Contrast"
            value={analysis.contrast}
            max={90}
          />
          <Meter
            label="Colorfulness"
            value={analysis.colorfulness}
            max={100}
          />

          {/* Color temperature slider dengan penanda */}
          <div>
            <div className="flex items-center justify-between text-[0.65rem] mb-1">
              <span className="text-muted">Color Temperature</span>
              <span className="font-mono font-semibold">
                {analysis.colorTemp > 0 ? "+" : ""}
                {analysis.colorTemp.toFixed(2)}
              </span>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden"
              style={{
                background:
                  "linear-gradient(90deg,#7db7ff,#9aa6bd 50%,#ffcf7d)",
              }}
            >
              <span
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-white border-2 border-foreground/40 shadow transition-all duration-500"
                style={{ left: `${ctPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[0.55rem] text-muted mt-0.5">
              <span>Cool</span>
              <span>Warm</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted">
          Nyalakan kamera untuk mulai menganalisis cahaya secara real-time.
        </p>
      )}
    </Card>
  );
}
