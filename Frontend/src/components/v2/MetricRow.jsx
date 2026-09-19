import React from 'react';

export default function MetricRow({
  metrics = [
    { label: "PM2.5", value: 312, unit: "µg/m³" },
    { label: "PM10", value: 410, unit: "µg/m³" },
    { label: "NO2", value: 64, unit: "ppb" },
    { label: "O3", value: 28, unit: "ppb" }
  ]
}) {
  return (
    <section className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
      {metrics.map((m, idx) => (
        <div key={idx} className="flex flex-col items-start">
          <span className="text-xs font-medium text-[var(--text-muted)] tracking-wider uppercase">
            {m.label}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
              {m.value}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {m.unit}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
