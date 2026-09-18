import React from 'react';
import { BarChart2, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PollutantSummaryPanel({ onOpenInsights }) {
  const pollutants = [
    { id: 'pm25', name: 'PM2.5', val: 312, unit: 'µg/m³', limit: 60, status: 'Severe', color: 'text-red-500' },
    { id: 'pm10', name: 'PM10', val: 410, unit: 'µg/m³', limit: 100, status: 'Severe', color: 'text-orange-500' },
    { id: 'no2', name: 'NO2', val: 64, unit: 'ppb', limit: 40, status: 'Poor', color: 'text-yellow-500' },
    { id: 'o3', name: 'O3', val: 28, unit: 'ppb', limit: 50, status: 'Good', color: 'text-emerald-500' }
  ];

  const miniBars = [92, 96, 88, 78, 65, 45]; // mock heights for +72h

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors group relative"
      onClick={onOpenInsights}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
        <Maximize2 size={16} />
      </div>

      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 shrink-0">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Key Pollutants & 72h Trend</h2>
        <p className="text-xs text-slate-400 mt-0.5">Click for deep insights</p>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 justify-between">
        {/* Pollutant Grid */}
        <div className="grid grid-cols-2 gap-3">
          {pollutants.map(p => (
            <div key={p.id} className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{p.name}</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-black ${p.color}`}>{p.val}</span>
                <span className="text-[10px] text-slate-400 font-medium">{p.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mini 72h Trend */}
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3 border border-slate-100 dark:border-slate-700 h-24 flex flex-col justify-end">
          <div className="flex justify-between items-end h-full gap-2 px-2 pb-1">
            {miniBars.map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`w-full rounded-t-sm ${h > 80 ? 'bg-red-500/80' : h > 60 ? 'bg-orange-500/80' : 'bg-emerald-500/80'}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-1 border-t border-slate-200 dark:border-slate-600">
            <span>Now</span>
            <span>+72h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
