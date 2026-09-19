import React from 'react';
import { MapPin } from 'lucide-react';

export default function SpatialSectorsPanel({
  sectors = [
    { zone: "Delhi NCR Composite", aqi: 387, tag: "Severe", isComposite: true },
    { zone: "Anand Vihar & East", aqi: 452, tag: "Haz" },
    { zone: "Jahangirpuri & North", aqi: 410, tag: "Sev+" },
    { zone: "ITO & Central Corridor", aqi: 387, tag: "Sev" },
    { zone: "Sector 62, Noida", aqi: 378, tag: "Sev" },
    { zone: "Faridabad Belt", aqi: 395, tag: "Sev" },
    { zone: "Cyber City, Gurugram", aqi: 362, tag: "V.Poor" }
  ],
  selectedZone = "Anand Vihar & East",
  onSelectZone = () => {}
}) {
  const getSeverityColor = (aqi) => {
    if (aqi <= 50) return '#3FA75E';
    if (aqi <= 100) return '#D9A62E';
    if (aqi <= 200) return '#E8862B';
    if (aqi <= 300) return '#D6432E';
    if (aqi <= 400) return '#B8281E';
    return '#7A1712';
  };

  const getTagBgClass = (aqi) => {
    if (aqi <= 50) return 'bg-[#3FA75E] text-white';
    if (aqi <= 100) return 'bg-[#D9A62E] text-white';
    if (aqi <= 200) return 'bg-[#E8862B] text-white';
    if (aqi <= 300) return 'bg-[#D6432E] text-white';
    if (aqi <= 400) return 'bg-[#B8281E] text-white';
    return 'bg-[#7A1712] text-white';
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[var(--bg-navy)]" />
          <h2 className="text-[13px] font-semibold tracking-wider text-[var(--text-primary)] uppercase">
            SPATIAL SECTORS
          </h2>
        </div>
        <span className="text-[11px] px-2 py-0.5 bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-secondary)] rounded font-medium">
          {sectors.length} Monitoring Zones
        </span>
      </div>

      {/* Sector Rows */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        {sectors.map((item, idx) => {
          const isSelected = selectedZone === item.zone;
          const isComposite = item.isComposite;

          if (isComposite) {
            // Anchor row with Dark Navy Pill Background
            return (
              <div
                key={idx}
                onClick={() => onSelectZone(item.zone)}
                className="w-full bg-[var(--bg-navy)] text-white rounded-md p-2.5 flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#21262d] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getSeverityColor(item.aqi) }}
                  />
                  <span className="text-[13px] font-semibold tracking-wide">
                    {item.zone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-telemetry font-bold text-sm text-white">
                    {item.aqi}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                    {item.tag}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              onClick={() => onSelectZone(item.zone)}
              className={`w-full rounded-md px-2.5 py-1.5 flex items-center justify-between border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[var(--bg-page)] border-[var(--bg-navy)]'
                  : 'bg-white border-transparent hover:bg-gray-50 hover:border-[var(--border)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getSeverityColor(item.aqi) }}
                />
                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                  {item.zone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono-telemetry text-[13px] font-semibold text-[var(--text-primary)]">
                  {item.aqi}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getTagBgClass(item.aqi)}`}>
                  {item.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
