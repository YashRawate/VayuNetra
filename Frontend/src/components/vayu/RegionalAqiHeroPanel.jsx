import React from 'react';
import { Activity, AlertTriangle, HeartPulse } from 'lucide-react';

export default function RegionalAqiHeroPanel({
  data = {
    aqi: 387,
    category: "Severe",
    peakStation: { name: "Anand Vihar", aqi: 452 },
    advisory: "Severe respiratory risk. Outdoor strenuous activities suspended; N95 filtering grade mask advised."
  }
}) {
  const markerPercent = Math.min(Math.max((data.aqi / 500) * 100, 0), 100);

  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[var(--bg-navy)]" />
          <h2 className="text-[13px] font-semibold tracking-wider text-[var(--text-primary)] uppercase">
            REGIONAL WEIGHTED AQI
          </h2>
        </div>
        <span className="text-[11px] px-2 py-0.5 bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-secondary)] rounded font-medium">
          24h Continuous
        </span>
      </div>

      {/* Hero AQI Readout */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono-telemetry text-4xl font-extrabold text-[#B8281E]">
            {data.aqi}
          </span>
          <span className="text-xs px-2.5 py-1 rounded bg-[#B8281E] text-white font-bold uppercase tracking-wider">
            {data.category}
          </span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--text-secondary)] font-medium">Peak Station</div>
          <div className="text-xs font-semibold text-[var(--text-primary)] font-mono-telemetry">
            {data.peakStation.name} ({data.peakStation.aqi})
          </div>
        </div>
      </div>

      {/* Gradient Scale Bar */}
      <div className="flex flex-col gap-1 my-0.5">
        <div className="relative w-full h-3 rounded-full overflow-hidden bg-gradient-to-r from-[#3FA75E] via-[#E8862B] via-[#D6432E] to-[#7A1712]">
          {/* Marker pin */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-white border border-black shadow-md transform -translate-x-1/2"
            style={{ left: `${markerPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono-telemetry">
          <span>0 (Good)</span>
          <span>250</span>
          <span>500 (Hazardous)</span>
        </div>
      </div>

      {/* Health Advisory Box */}
      <div className="bg-[#FDECEA] border border-[#B8281E]/20 rounded-md p-2.5 flex items-start gap-2.5 text-[#B8281E]">
        <HeartPulse className="w-4 h-4 text-[#B8281E] shrink-0 mt-0.5" />
        <div className="text-xs leading-snug">
          <span className="font-bold mr-1">High Health Advisory:</span>
          <span className="text-[var(--text-primary)]">{data.advisory}</span>
        </div>
      </div>
    </div>
  );
}
