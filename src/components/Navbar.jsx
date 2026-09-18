import React from 'react';
import { Activity, Clock, Sun, Moon, Volume2, VolumeX, Database } from 'lucide-react';
import { useSensorStore } from '../store/sensorStore';

export default function Navbar({
  theme = 'light',
  onToggleTheme,
  onOpenInsights
}) {
  const { isConnected, soundAlertsEnabled, setSoundAlertsEnabled, stations } = useSensorStore();

  const heroAqi = stations.length ? Math.max(...stations.map(s => s.aqi)) : 0;
  const getCategoryColorText = (aqi) => {
    if (aqi > 400) return 'text-red-600 dark:text-red-400';
    if (aqi > 300) return 'text-red-500 dark:text-red-400';
    if (aqi > 200) return 'text-orange-500 dark:text-orange-400';
    if (aqi > 100) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-emerald-500 dark:text-emerald-400';
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-[60px] shrink-0">
      {/* Left: Brand Icon & Title & Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Activity size={20} />
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            AeroPulse
          </span>
        </div>
        
        {/* Live Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
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

      {/* Center: Hero AQI (Max across network) */}
      {stations.length > 0 && (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Network Max</span>
          <span className={`text-xl font-black leading-none ${getCategoryColorText(heroAqi)}`}>{heroAqi}</span>
        </div>
      )}

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        
        {/* Insights Button */}
        <button
          onClick={onOpenInsights}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 dark:border-blue-500/30"
        >
          <Database size={15} />
          Insights
        </button>

        {/* Audio Alerts Toggle */}
        <button
          onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            soundAlertsEnabled 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' 
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
          title={soundAlertsEnabled ? 'Disable Audio Alerts' : 'Enable Audio Alerts (Opt-in)'}
        >
          {soundAlertsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>

        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
          <Clock size={13} />
          <span>Live Sync</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
