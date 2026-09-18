import React from 'react';
import SeverityGradientBar from './SeverityGradientBar';

export default function HeroSection({
  data = {
    aqi: 387,
    category: "Severe",
    message: "Trapped smoke from crop burning is pushing air quality to severe levels tonight. Avoid outdoor activity."
  }
}) {
  const getCategoryColorVar = (aqi) => {
    if (aqi <= 50) return 'var(--good)';
    if (aqi <= 150) return 'var(--moderate)';
    if (aqi <= 250) return 'var(--poor)';
    if (aqi <= 400) return 'var(--severe)';
    return 'var(--hazardous)';
  };

  const categoryColor = getCategoryColorVar(data.aqi);

  return (
    <section className="flex flex-col items-start gap-1 py-2">
      {/* Hero AQI Number + Category */}
      <div className="flex items-baseline gap-3">
        <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-[var(--text)]">
          {data.aqi}
        </span>
        <span
          className="text-base sm:text-lg font-semibold px-3 py-1 rounded-full text-white uppercase tracking-wider"
          style={{ backgroundColor: categoryColor }}
        >
          {data.category}
        </span>
      </div>

      {/* Advisory Message Paragraph */}
      <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-[520px] leading-relaxed mt-1">
        {data.message}
      </p>

      {/* Severity Gradient Bar with live marker */}
      <SeverityGradientBar aqi={data.aqi} />
    </section>
  );
}
