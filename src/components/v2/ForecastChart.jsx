import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';

export default function ForecastChart({
  theme = "light",
  data = [
    { hour: "Now", aqi: 387 },
    { hour: "+12h", aqi: 428 },
    { hour: "+24h", aqi: 395 },
    { hour: "+36h", aqi: 330 },
    { hour: "+48h", aqi: 290 },
    { hour: "+60h", aqi: 250 },
    { hour: "+72h", aqi: 210 }
  ]
}) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9C9A90' : '#6B6960';
  const strokeColor = isDark ? '#F2F1EC' : '#1A1A17';
  const gridColor = isDark ? '#33322C' : '#E7E5DF';

  return (
    <section className="w-full flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">
          72-Hour Air Quality Outlook
        </h3>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          WRF-Chem Model
        </span>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4451C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C4451C" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              tick={{ fill: textColor, fontSize: 12, fontFamily: 'monospace' }}
            />
            <YAxis
              domain={[100, 500]}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              tick={{ fill: textColor, fontSize: 12, fontFamily: 'monospace' }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value;
                  return (
                    <div className="bg-[var(--surface)] border border-[var(--border)] p-2 rounded-lg shadow-md text-xs">
                      <div className="text-[var(--text-muted)] font-mono">
                        {payload[0].payload.hour}
                      </div>
                      <div className="text-sm font-extrabold text-[#C4451C]">
                        {val} AQI
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Severe Threshold Highlighted Line at 400 AQI */}
            <ReferenceLine
              y={400}
              stroke="#8A2418"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Severe threshold (400)",
                position: "insideTopRight",
                fontSize: 11,
                fill: textColor,
                fontStyle: "italic"
              }}
            />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#C4451C"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#aqiFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
