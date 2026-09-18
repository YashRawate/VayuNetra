import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';

export default function ForecastSection({ theme = 'light' }) {
  const [modelMode, setModelMode] = useState('coupled'); // 'coupled' | 'baseline'

  const forecastData = [
    { hour: "Now", aqi: 387, aqi_low: 360, aqi_high: 410, pm25: 312, baseline_aqi: 340 },
    { hour: "+12h", aqi: 428, aqi_low: 395, aqi_high: 455, pm25: 350, baseline_aqi: 350 },
    { hour: "+24h", aqi: 395, aqi_low: 360, aqi_high: 430, pm25: 320, baseline_aqi: 310 },
    { hour: "+48h", aqi: 330, aqi_low: 290, aqi_high: 370, pm25: 265, baseline_aqi: 280 },
    { hour: "+72h", aqi: 285, aqi_low: 245, aqi_high: 325, pm25: 230, baseline_aqi: 260 }
  ];

  const chartData = forecastData.map(d => ({
    ...d,
    confidenceRange: [d.aqi_low, d.aqi_high]
  }));

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
        }} className="rounded-xl p-3 text-xs shadow-xl text-slate-900 dark:text-slate-100 min-w-[200px]">
          <div className="font-bold mb-2 text-slate-500 dark:text-slate-400">
            Forecast {data.hour}
          </div>
          <div className="flex justify-between items-center gap-4 text-red-600 dark:text-red-400 font-bold mb-1">
            <span>Coupled AQI:</span>
            <span>{data.aqi} <span className="font-normal text-[10px] opacity-80">(Range: {data.aqi_low}–{data.aqi_high})</span></span>
          </div>
          <div className="flex justify-between items-center gap-4 text-blue-600 dark:text-blue-400 font-medium">
            <span>PM2.5:</span>
            <span>{data.pm25} µg/m³</span>
          </div>
          {modelMode === 'baseline' && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
              <span>One-Way Baseline:</span>
              <span>{data.baseline_aqi}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-[3px] rounded-full bg-red-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">Coupled AQI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-3 bg-blue-500/20 dark:bg-blue-400/20 border border-blue-500/30 rounded-sm" />
            <span className="font-medium text-slate-600 dark:text-slate-400">±Uncertainty Band</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-[2px] rounded-full bg-blue-500" />
            <span className="font-medium text-slate-600 dark:text-slate-400">PM2.5</span>
          </div>
          {modelMode === 'baseline' && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-[2px] border-t-2 border-dashed border-slate-400" />
              <span className="font-medium text-slate-500 dark:text-slate-400">Baseline</span>
            </div>
          )}
        </div>

        {/* Model Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
          <button
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              modelMode === 'coupled' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            onClick={() => setModelMode('coupled')}
          >
            Coupled Model
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              modelMode === 'baseline' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            onClick={() => setModelMode('baseline')}
          >
            One-Way Baseline
          </button>
        </div>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="hour"
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />

            <YAxis
              domain={[200, 500]}
              ticks={[200, 300, 400, 500]}
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1, strokeDasharray: '4 4' }} />

            {/* Severe threshold line */}
            <ReferenceLine
              y={400}
              stroke="#EF4444"
              strokeDasharray="4 4"
              label={{
                value: 'Severe (400)',
                position: 'insideTopLeft',
                fill: '#EF4444',
                fontSize: 10,
                fontWeight: 700,
                offset: 10
              }}
            />

            {/* Shaded Uncertainty Range Area */}
            <Area
              type="monotone"
              dataKey="confidenceRange"
              stroke="none"
              fill={isDark ? '#38BDF8' : '#0284C7'}
              fillOpacity={isDark ? 0.12 : 0.08}
            />

            {/* Primary AQI Line */}
            <Line
              type="monotone"
              dataKey="aqi"
              name="Coupled AQI"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ r: 4, fill: '#EF4444', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2, fill: '#FFFFFF' }}
            />

            {/* Secondary PM2.5 Line */}
            <Line
              type="monotone"
              dataKey="pm25"
              name="PM2.5"
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }}
            />

            {/* Baseline Comparison Line */}
            {modelMode === 'baseline' && (
              <Line
                type="monotone"
                dataKey="baseline_aqi"
                name="One-Way Baseline"
                stroke="#94A3B8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#94A3B8', strokeWidth: 0 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
