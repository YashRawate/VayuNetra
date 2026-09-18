import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { CheckCircle2 } from 'lucide-react';

export default function AccuracyTrackerSection({ theme = 'light' }) {
  const accuracyData = [
    { day: "Mon", forecast: 340, actual: 355 },
    { day: "Tue", forecast: 298, actual: 285 },
    { day: "Wed", forecast: 410, actual: 420 },
    { day: "Thu", forecast: 375, actual: 360 },
    { day: "Fri", forecast: 320, actual: 330 },
    { day: "Sat", forecast: 290, actual: 275 },
    { day: "Sun", forecast: 387, actual: null }
  ];

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF';
  const tooltipBorder = isDark ? '#334155' : '#E2E8F0';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
        }} className="rounded-lg p-3 text-xs shadow-lg text-slate-900 dark:text-slate-100 min-w-[180px]">
          <div className="font-bold text-slate-500 dark:text-slate-400 mb-2">{data.day} Validation</div>
          <div className="text-blue-600 dark:text-blue-400 font-medium mb-1 flex justify-between">
            <span>Forecast:</span>
            <span>{data.forecast}</span>
          </div>
          {data.actual !== null ? (
            <div className="text-emerald-600 dark:text-emerald-400 font-bold flex justify-between">
              <span>Actual CPCB:</span>
              <span>{data.actual}</span>
            </div>
          ) : (
            <div className="text-slate-400 italic mt-1 pt-1 border-t border-slate-200 dark:border-slate-700">Pending 24h cycle</div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Model Accuracy</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            7-day CPCB benchmark validation
          </p>
        </div>

        {/* Headline score */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="font-bold text-emerald-700 dark:text-emerald-400">91.2%</span>
        </div>
      </div>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" stroke={textColor} tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: gridColor }} />
            <YAxis domain={[200, 500]} ticks={[200, 350, 500]} stroke={textColor} tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={{ stroke: gridColor }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#334155' : '#F1F5F9' }} />
            <Bar dataKey="forecast" name="Forecast" fill={isDark ? '#38BDF8' : '#0284C7'} radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="actual" name="Actual CPCB" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-600 dark:text-slate-400 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-sky-400" />
          Forecast
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500" />
          Actual CPCB
        </div>
      </div>
    </div>
  );
}
