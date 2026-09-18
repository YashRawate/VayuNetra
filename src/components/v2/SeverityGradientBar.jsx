import React from 'react';

export default function SeverityGradientBar({ aqi = 387 }) {
  const percentage = Math.min(Math.max((aqi / 500) * 100, 0), 100);

  return (
    <div className="w-full max-w-lg mt-3">
      {/* Gradient Bar Container */}
      <div
        className="relative h-2.5 rounded-full w-full"
        style={{
          background:
            'linear-gradient(to right, var(--good), var(--moderate), var(--poor), var(--severe), var(--hazardous))'
        }}
      >
        {/* Sliding Notch Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[var(--text)] shadow-md transition-all duration-500 ease-out"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>

      {/* Axis Scale Labels */}
      <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono mt-1.5 px-0.5">
        <span>0 (Good)</span>
        <span>250</span>
        <span>500 (Hazardous)</span>
      </div>
    </div>
  );
}
