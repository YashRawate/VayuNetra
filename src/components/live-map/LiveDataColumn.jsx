import React from 'react';
import { TrendingUp, AlertCircle, BarChart2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveDataColumn({
  aqi = 387,
  category = "Severe",
  station = "ITO, Delhi",
  onSelectHotspot
}) {
  const pollutants = [
    { pollutant: "PM2.5", value: "312 µg/m³", bar_pct: 92, color: "bg-red-500" },
    { pollutant: "PM10", value: "410 µg/m³", bar_pct: 75, color: "bg-orange-500" },
    { pollutant: "NO2", value: "64 ppb", bar_pct: 45, color: "bg-yellow-500" },
    { pollutant: "CO", value: "2.1 ppm", bar_pct: 28, color: "bg-emerald-500" },
    { pollutant: "O3", value: "28 ppb", bar_pct: 20, color: "bg-emerald-500" }
  ];

  const miniForecastBars = [
    { hour: "Now", val: 92, aqi: 387 },
    { hour: "+12h", val: 96, aqi: 428 },
    { hour: "+24h", val: 88, aqi: 395 },
    { hour: "+36h", val: 78, aqi: 360 },
    { hour: "+48h", val: 65, aqi: 330 },
    { hour: "+72h", val: 45, aqi: 285 }
  ];

  const hotspots = [
    { zone: "East Delhi (Anand Vihar)", aqi: 445, delta: "+32" },
    { zone: "North Delhi", aqi: 410, delta: "+18" },
    { zone: "Central Delhi", aqi: 387, delta: "+14" }
  ];

  const getCategoryColorText = () => {
    if (category === 'Severe' || category === 'Very Poor') return 'text-red-600 dark:text-red-400';
    if (category === 'Poor') return 'text-orange-500 dark:text-orange-400';
    if (category === 'Moderate') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  return (
    <aside className="flex flex-col gap-4" aria-label="Real-time environmental telemetry">
      {/* 1. Live AQI Hero Card */}
      <motion.div 
        key={aqi} // Animate on change
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Index Telemetry</span>
          <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
            <TrendingUp size={12} />
            +14 in 3h
          </span>
        </div>

        <div className="flex items-end gap-3 mb-4">
          <span className={`text-5xl font-black leading-none tracking-tighter ${getCategoryColorText()}`}>{aqi}</span>
          <span className="px-2.5 py-1 text-sm font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase">
            {category}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <span>📍</span>
          <span>{station}</span>
        </div>
      </motion.div>

      {/* 2. Pollutant Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Key Pollutants</span>
          <span className="text-xs text-slate-400">Real-time</span>
        </div>
        <div className="space-y-3">
          {pollutants.map((p) => (
            <div key={p.pollutant}>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-600 dark:text-slate-300">{p.pollutant}</span>
                <span className="text-slate-900 dark:text-slate-100">{p.value}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.bar_pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${p.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Hotspot Zones */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
            <Flame size={14} className="text-red-500" />
            Critical Hotspots
          </span>
          <span className="text-xs text-slate-400">Top 3</span>
        </div>
        <div className="space-y-2">
          {hotspots.map((h) => (
            <div
              key={h.zone}
              className="flex justify-between items-center p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              onClick={() => onSelectHotspot && onSelectHotspot(h.zone)}
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{h.zone}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{h.delta}</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{h.aqi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
