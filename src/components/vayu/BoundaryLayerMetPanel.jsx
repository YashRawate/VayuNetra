import React from 'react';
import { CloudSun } from 'lucide-react';

export default function BoundaryLayerMetPanel({
  status = "Surface Inversion",
  stats = [
    { label: "Wind Vector", value: "NW 6.2 km/h", note: "Calm / Stagnant" },
    { label: "Mixing Depth", value: "320 m", note: "Severe Trapping" },
    { label: "Surface Temp", value: "14.2 °C", note: "Dew point 11°C" },
    { label: "Relative Humidity", value: "84 %", note: "Heavy Fog / Smog" }
  ]
}) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-1.5">
          <CloudSun className="w-3.5 h-3.5 text-[var(--bg-navy)]" />
          <h2 className="text-[13px] font-semibold tracking-wider text-[var(--text-primary)] uppercase">
            BOUNDARY LAYER MET
          </h2>
        </div>
        <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-bold rounded uppercase">
          {status}
        </span>
      </div>

      {/* 2x2 Grid of Stat Cards */}
      <div className="grid grid-cols-2 gap-2 mt-0.5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-[var(--bg-page)] border border-[var(--border)] rounded-md p-2 flex flex-col justify-between"
          >
            <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
              {stat.label}
            </span>
            <div className="font-mono-telemetry text-sm font-bold text-[var(--text-primary)] my-0.5">
              {stat.value}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] truncate">
              {stat.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
