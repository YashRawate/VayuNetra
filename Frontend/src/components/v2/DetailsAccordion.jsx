import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, PieChart, CheckCircle2, Wind } from 'lucide-react';

export default function DetailsAccordion() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full flex flex-col items-start gap-4 py-2 border-t border-[var(--border)] mt-2">
      {/* Toggle Link Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text)] hover:text-[var(--text-muted)] transition-colors py-1 cursor-pointer"
      >
        <span>{expanded ? '[ – Hide Details ]' : '[ + Details ]'}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded Accordion Body */}
      {expanded && (
        <div className="w-full flex flex-col gap-6 pt-2 pb-4 text-xs sm:text-sm animate-in fade-in duration-300">
          
          {/* 1. GRAP Emergency Mandate */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>GRAP Phase IV Emergency Restrictions Active</span>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Diesel heavy transport halted at borders · 50% staggered remote shifts across public offices · Anti-smog gun saturation deployed across primary hot spots.
            </p>
          </div>

          {/* 2. Source Attribution Horizontal Stacked Bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between font-semibold text-[var(--text)]">
              <div className="flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Source Attribution Breakdown</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-mono">100% Total Load</span>
            </div>

            {/* Stacked bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--surface-2)] border border-[var(--border)]">
              <div style={{ width: '40%' }} className="bg-amber-500" title="Inversion & Trapping (40%)" />
              <div style={{ width: '32%' }} className="bg-red-500" title="Local Vehicular (32%)" />
              <div style={{ width: '28%' }} className="bg-orange-600" title="Stubble Biomass Smoke (28%)" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-[var(--text-muted)] pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Inversion (40%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Vehicular (32%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-600" />
                <span>Biomass (28%)</span>
              </div>
            </div>
          </div>

          {/* 3. 7-Day Accuracy Tracker */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between font-semibold text-[var(--text)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>7-Day Model Accuracy</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                94.2% Verified
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] h-8 rounded flex items-end p-0.5">
                    <div
                      className="w-full bg-emerald-500 rounded-sm"
                      style={{ height: `${85 + (i * 2) % 15}%` }}
                    />
                  </div>
                  <span className="text-[var(--text-muted)]">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Station Sensor Grid (Plain Text Rows) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
              <Wind className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Boundary Layer Meteorology</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[var(--text-muted)]">Wind Vector</div>
                <div className="font-mono font-bold text-[var(--text)]">NW 6.2 km/h</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">Mixing Depth</div>
                <div className="font-mono font-bold text-[var(--text)]">320 meters</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">Surface Temp</div>
                <div className="font-mono font-bold text-[var(--text)]">14.2 °C</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">Rel. Humidity</div>
                <div className="font-mono font-bold text-[var(--text)]">84% Fog/Smog</div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
