import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function TrajectoryOutlookPanel({
  modelTag = "WRF-Chem v4",
  checkpoints = [
    { hour: "Now", aqi: 387, color: "#B8281E", label: "Sev" },
    { hour: "+12h", aqi: 405, color: "#7A1712", label: "Haz" },
    { hour: "+24h", aqi: 365, color: "#B8281E", label: "Sev" },
    { hour: "+36h", aqi: 290, color: "#D6432E", label: "V.Poor" },
    { hour: "+48h", aqi: 240, color: "#D6432E", label: "V.Poor" },
    { hour: "+72h", aqi: 210, color: "#E8862B", label: "Poor" }
  ],
  caption = "Surface inversion breaks Friday midday as incoming Western Disturbance raises boundary layer wind to 18 km/h."
}) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[var(--bg-navy)]" />
          <h2 className="text-[13px] font-semibold tracking-wider text-[var(--text-primary)] uppercase">
            72H TRAJECTORY OUTLOOK
          </h2>
        </div>
        <span className="text-[10px] font-mono-telemetry font-bold px-2 py-0.5 bg-[var(--bg-navy)] text-white rounded">
          {modelTag}
        </span>
      </div>

      {/* 6 Vertical Colored Blocks */}
      <div className="grid grid-cols-6 gap-1.5 mt-0.5">
        {checkpoints.map((cp, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-between p-1.5 rounded-md border border-[var(--border)] text-center transition-all hover:scale-105"
            style={{ backgroundColor: `${cp.color}15` }}
          >
            <span className="font-mono-telemetry text-[10px] text-[var(--text-secondary)] font-bold">
              {cp.hour}
            </span>
            <div
              className="font-mono-telemetry font-bold text-xs my-1"
              style={{ color: cp.color }}
            >
              {cp.aqi}
            </div>
            <span
              className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded text-white w-full truncate"
              style={{ backgroundColor: cp.color }}
            >
              {cp.label}
            </span>
          </div>
        ))}
      </div>

      {/* Caption line */}
      <p className="text-[11px] text-[var(--text-secondary)] leading-snug border-t border-[var(--border)] pt-2 italic">
        "{caption}"
      </p>
    </div>
  );
}
