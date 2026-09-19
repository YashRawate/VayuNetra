import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useSensorStore } from '../store/sensorStore';
import { motion } from 'framer-motion';

export default function LiveFeedPanel() {
  const { stations } = useSensorStore();

  const getCategoryColorText = (aqi) => {
    if (aqi > 400) return 'text-red-600 dark:text-red-400';
    if (aqi > 300) return 'text-red-500 dark:text-red-400';
    if (aqi > 200) return 'text-orange-500 dark:text-orange-400';
    if (aqi > 100) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-emerald-500 dark:text-emerald-400';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700/50 shrink-0">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Station Feed</h2>
        <span className="text-xs font-medium text-slate-400">{stations.length} Active</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {stations.map(st => (
          <motion.div
            key={st.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
          >
            <div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{st.station}</div>
              <div className="text-xs font-medium text-slate-400 mt-0.5">{st.category}</div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mock trend based on last digit of AQI just for visual flair in the feed */}
              {st.aqi % 3 === 0 ? <TrendingDown size={14} className="text-emerald-500" /> : st.aqi % 2 === 0 ? <TrendingUp size={14} className="text-red-500" /> : <Minus size={14} className="text-slate-400" />}
              <span className={`text-lg font-black ${getCategoryColorText(st.aqi)}`}>{st.aqi}</span>
            </div>
          </motion.div>
        ))}
        {stations.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            Waiting for telemetry...
          </div>
        )}
      </div>
    </div>
  );
}
