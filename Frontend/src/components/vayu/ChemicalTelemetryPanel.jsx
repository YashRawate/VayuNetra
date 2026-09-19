import React from 'react';
import { FlaskConical } from 'lucide-react';

export default function ChemicalTelemetryPanel({
  mainPollutants = [
    { pollutant: "PM2.5 (Fine Particulate)", value: 312, limit: 60, unit: "µg/m³", barPct: 95, color: "#7A1712" },
    { pollutant: "PM10 (Inhalable Dust)", value: 410, limit: 100, unit: "µg/m³", barPct: 90, color: "#B8281E" },
    { pollutant: "NO2 (Vehicular Oxides)", value: 68, limit: 80, unit: "ppb", note: "Elevated", barPct: 55, color: "#E8862B" }
  ],
  subPollutants = [
    { pollutant: "O3 (Ozone)", value: "28 ppb", status: "Good" },
    { pollutant: "CO (Monoxide)", value: "2.8 mg/m³", status: null }
  ]
}) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-[var(--bg-navy)]" />
          <h2 className="text-[13px] font-semibold tracking-wider text-[var(--text-primary)] uppercase">
            CHEMICAL TELEMETRY
          </h2>
        </div>
        <span className="text-[11px] px-2 py-0.5 bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-secondary)] font-mono-telemetry rounded">
          µg/m³
        </span>
      </div>

      {/* Main Pollutant Progress Bars */}
      <div className="flex flex-col gap-2 mt-0.5">
        {mainPollutants.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-medium text-[var(--text-primary)] text-[12px]">
                {item.pollutant}
              </span>
              <div className="flex items-center gap-1 font-mono-telemetry">
                <span className="font-bold text-[var(--text-primary)]">{item.value}</span>
                <span className="text-[var(--text-secondary)] text-[10px]">
                  / {item.limit} {item.unit || "µg/m³"}
                </span>
              </div>
            </div>
            {/* Progress Bar Container */}
            <div className="w-full bg-[var(--bg-page)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.barPct}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Compact 2-column Readout for lower priority gases */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)] mt-1">
        {subPollutants.map((item, idx) => (
          <div
            key={idx}
            className="bg-[var(--bg-page)] border border-[var(--border)] rounded p-2 flex items-center justify-between"
          >
            <div>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium">{item.pollutant}</div>
              <div className="font-mono-telemetry text-xs font-bold text-[var(--text-primary)]">
                {item.value}
              </div>
            </div>
            {item.status && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                {item.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
