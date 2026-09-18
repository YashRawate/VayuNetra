import React from 'react';
import { Sun, Moon, ChevronDown } from 'lucide-react';

export default function Header({
  theme = "light",
  onToggleTheme = () => {},
  selectedZone = "Anand Vihar",
  onZoneChange = () => {}
}) {
  const zones = ["Anand Vihar", "ITO Central", "Sector 62, Noida", "Cyber City, Gurugram"];

  return (
    <header className="w-full flex items-center justify-between py-2 border-b border-[var(--border)]">
      {/* Title + Live Indicator */}
      <div className="flex items-center gap-2.5">
        <h1 className="text-base font-bold text-[var(--text)] tracking-tight">
          Delhi NCR Air Quality
        </h1>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Controls: Zone Selector + Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Zone Selector */}
        <div className="relative">
          <select
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className="appearance-none bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] text-xs font-medium px-3 py-1.5 pr-7 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--text-muted)]"
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
}
