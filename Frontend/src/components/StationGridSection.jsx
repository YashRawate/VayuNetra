import React from 'react';
import { Wind, Droplets, Thermometer, Sun, Gauge, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StationGridSection({ stationName = "ITO, Delhi" }) {
  const metrics = [
    { metric: "Surface Wind", value: "6.2 km/h", icon: Wind, trend: "+0.4", status: "Moderate", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { metric: "Relative Humidity", value: "58%", icon: Droplets, trend: "-2%", status: "High", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
    { metric: "Ambient Temp", value: "14.1°C", icon: Thermometer, trend: "-1.2°", status: "Cool", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { metric: "Solar Radiation", value: "Low", icon: Sun, trend: "Stable", status: "Overcast", color: "text-slate-400", bg: "bg-slate-50 dark:bg-slate-500/10" },
    { metric: "Ventilation Index", value: "Poor", icon: Gauge, trend: "Low", status: "Trapping", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" }
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Continuous Telemetry — {stationName}
        </h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Sensor Online
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={m.metric} 
              className="flex flex-col justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-[70%]">{m.metric}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.bg} ${m.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1 tracking-tight">{m.value}</div>
                <div className="flex justify-between items-center text-[11px] font-medium mt-2">
                  <span className="text-slate-600 dark:text-slate-300">{m.status}</span>
                  <span className="text-slate-400">{m.trend}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
