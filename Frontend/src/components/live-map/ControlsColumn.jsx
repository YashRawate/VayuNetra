import React from 'react';
import { Layers, ShieldAlert, Check } from 'lucide-react';

export default function ControlsColumn({
  zones = ["Delhi NCR (all)", "North Delhi", "East Delhi", "Gurugram", "Noida"],
  selectedZone = "Delhi NCR (all)",
  onSelectZone,
  layers = {
    heatmap: true,
    plume: true,
    stations: true
  },
  onToggleLayer,
  grapStage = "Stage IV",
  grapTrigger = "Auto-triggered by forecast"
}) {
  return (
    <aside className="flex flex-col gap-4" aria-label="Map and Layer Controls">
      {/* Zone Control */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Zone Focus</span>
          <span className="text-xs text-slate-400">{zones.length} zones</span>
        </div>
        <div className="flex flex-col gap-1">
          {zones.map((z) => {
            const isActive = selectedZone === z;
            return (
              <button
                key={z}
                className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
                onClick={() => onSelectZone(z)}
              >
                <span>{z}</span>
                {isActive && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Layers */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
            <Layers size={14} />
            Map Layers
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-col gap-1">
          {[
            { id: 'heatmap', label: 'AQI heatmap' },
            { id: 'plume', label: 'Plume overlay' },
            { id: 'stations', label: 'Station markers' }
          ].map(layer => (
            <div
              key={layer.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
              onClick={() => onToggleLayer(layer.id)}
              role="switch"
              aria-checked={layers[layer.id]}
              tabIndex={0}
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{layer.label}</span>
              <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${layers[layer.id] ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${layers[layer.id] ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GRAP Status Card (Emergency Action Level) */}
      <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-4 border border-red-100 dark:border-red-500/20">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm mb-1">
          <ShieldAlert size={16} />
          <span>GRAP {grapStage}</span>
        </div>
        <div className="text-xs text-red-500 dark:text-red-400/80">
          {grapTrigger}
        </div>
      </div>
    </aside>
  );
}
