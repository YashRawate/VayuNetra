import React from 'react';
import { Activity, Clock, MapPin, Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { useSensorStore } from '../store/sensorStore';

export default function CommandHeader({
  lastUpdated = 'Live',
  stations = [],
  selectedStationIndex = 0,
  onSelectStation,
  theme = 'light',
  onToggleTheme
}) {
  const { isConnected, soundAlertsEnabled, setSoundAlertsEnabled } = useSensorStore();

  return (
    <header className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
      {/* Left: Brand Icon & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Activity size={20} />
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            AeroPulse
          </span>
        </div>
        
        {/* Live Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span className="relative flex h-2 w-2">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            )}
          </span>
          <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-6">
        
        {/* Audio Alerts Toggle */}
        <button
          onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            soundAlertsEnabled 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title={soundAlertsEnabled ? 'Disable Audio Alerts' : 'Enable Audio Alerts (Opt-in)'}
        >
          {soundAlertsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="hidden sm:inline">Alerts</span>
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
          <Clock size={14} />
          <span>{lastUpdated}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-slate-500 dark:text-slate-400" />
          <select
            className="bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white cursor-pointer focus:ring-0 appearance-none pr-4"
            value={selectedStationIndex}
            onChange={(e) => onSelectStation(Number(e.target.value))}
            aria-label="Select monitoring station"
          >
            {stations.map((st, idx) => (
              <option key={st.id || idx} value={idx} className="text-slate-900">
                {st.station}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
