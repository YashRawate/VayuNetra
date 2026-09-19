import React from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Map, 
  Wind, 
  FileText, 
  Activity, 
  ChevronDown, 
  Thermometer, 
  Droplets,
  Sun,
  Moon
} from 'lucide-react';

export default function TopHeaderBar({
  syncData = {
    stationsSynced: "38/38",
    syncTime: "06:00 IST",
    meshLatency: "24ms",
    wind: "NW 6 km/h",
    temp: "14°C",
    humidity: "78%",
    selectedZone: "Anand Vihar (East)",
    grapStage: "Stage IV Active"
  },
  activeTab = "Live GIS Surveillance",
  onTabChange = () => {},
  onZoneChange = () => {},
  theme = "light",
  onToggleTheme = () => {}
}) {
  const navTabs = [
    { id: "Live GIS Surveillance", label: "Live GIS Surveillance", icon: Map },
    { id: "Trajectory & Plumes", label: "Trajectory & Plumes", icon: Wind },
    { id: "GRAP Enforcement", label: "GRAP Enforcement", icon: ShieldAlert },
    { id: "Telemetry Logs", label: "Telemetry Logs", icon: FileText }
  ];

  return (
    <header className="w-full h-14 min-h-[56px] bg-[var(--bg-surface)] border-b border-[var(--border)] px-4 flex items-center justify-between gap-4 text-[var(--text-primary)] select-none z-30 transition-colors">
      {/* Left: Brand + Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[var(--bg-navy)] flex items-center justify-center text-[var(--bg-surface)] font-bold text-xs">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-extrabold text-sm tracking-wider uppercase text-[var(--text-primary)]">VAYU CONTROL</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-secondary)] font-medium tracking-tight">
                CAQM · CPCB
              </span>
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] font-normal leading-tight">
              Delhi NCR Air Quality Command Center
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-[var(--border)] mx-1" />

        {/* Station Sync Status */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--aqi-good)]"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold leading-none text-[var(--text-primary)]">
              {syncData.stationsSynced} Stations Synced
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono-telemetry leading-tight mt-0.5">
              {syncData.syncTime} ({syncData.meshLatency} mesh)
            </span>
          </div>
        </div>
      </div>

      {/* Center: Navigation Tabs */}
      <nav className="hidden xl:flex items-center gap-1 h-full">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`h-full px-3 text-xs font-medium flex items-center gap-1.5 transition-all border-b-2 ${
                isActive
                  ? 'border-[var(--bg-navy)] text-[var(--text-primary)] font-semibold bg-[var(--bg-page)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--bg-navy)]' : 'text-[var(--text-secondary)]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Weather + Zone Selector + GRAP Stage Badge + Theme Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Compact Live Weather Strip */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[var(--bg-page)] rounded border border-[var(--border)] text-xs font-mono-telemetry text-[var(--text-primary)]">
          <div className="flex items-center gap-1" title="Wind Vector">
            <Wind className="w-3 h-3 text-[var(--text-secondary)]" />
            <span>{syncData.wind}</span>
          </div>
          <span className="text-[var(--text-secondary)]">•</span>
          <div className="flex items-center gap-1" title="Temperature">
            <Thermometer className="w-3 h-3 text-[var(--text-secondary)]" />
            <span>{syncData.temp}</span>
          </div>
          <span className="text-[var(--text-secondary)]">•</span>
          <div className="flex items-center gap-1" title="Humidity">
            <Droplets className="w-3 h-3 text-[var(--text-secondary)]" />
            <span>Hum {syncData.humidity}</span>
          </div>
        </div>

        {/* Zone Selector Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded text-xs font-medium text-[var(--text-primary)] hover:border-gray-400 transition-colors"
            title="Select Sector/Zone"
          >
            <Radio className="w-3 h-3 text-amber-600" />
            <span>{syncData.selectedZone}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* GRAP Stage Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--alert-bg)] text-[var(--alert-text)] rounded font-bold text-xs tracking-wide uppercase shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span>{syncData.grapStage}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className="p-1.5 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
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
