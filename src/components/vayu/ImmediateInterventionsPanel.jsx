import React from 'react';
import { AlertCircle, Zap } from 'lucide-react';

export default function ImmediateInterventionsPanel({
  interventions = [
    { n: 1, location: "Anand Vihar ISBT", aqi: 452, status: "Hazardous", action: "Smog Gun", actionStyle: "filled" },
    { n: 2, location: "Patparganj Depot", aqi: 445, status: "Hazardous", action: "Reroute", actionStyle: "outline" },
    { n: 3, location: "Jahangirpuri North", aqi: 410, status: "Severe+", action: "Squad Audit", actionStyle: "outline" },
    { n: 4, location: "Bawana Industrial", aqi: 402, status: "Severe+", action: "Fuel Check", actionStyle: "outline" }
  ],
  onTriggerAction = () => {}
}) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[var(--bg-navy)]" />
          <h2 className="text-[13px] font-semibold tracking-wider text-[var(--text-primary)] uppercase">
            IMMEDIATE INTERVENTIONS
          </h2>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-[#B8281E] border border-red-200 rounded uppercase">
          {interventions.length} Flagged
        </span>
      </div>

      {/* Interventions List */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        {interventions.map((item) => {
          const isFilled = item.actionStyle === 'filled';
          return (
            <div
              key={item.n}
              className="flex items-center justify-between p-2 rounded-md bg-[var(--bg-page)] border border-[var(--border)] transition-all hover:bg-gray-100"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--bg-navy)] text-white flex items-center justify-center font-mono-telemetry text-[11px] font-bold shrink-0">
                  {item.n}
                </span>
                <div>
                  <div className="text-[12px] font-bold text-[var(--text-primary)] leading-tight">
                    {item.location}
                  </div>
                  <div className="text-[10px] font-mono-telemetry text-[#B8281E] font-semibold">
                    {item.aqi} AQI · {item.status}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onTriggerAction(item)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 ${
                  isFilled
                    ? 'bg-[#B8281E] text-white hover:bg-[#991F18]'
                    : 'bg-white text-[var(--text-primary)] border border-[var(--border)] hover:bg-gray-50'
                }`}
              >
                <span>{item.action}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
