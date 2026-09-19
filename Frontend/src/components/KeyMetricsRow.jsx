import React from 'react';
import { Gauge, Layers, Flame, CloudFog } from 'lucide-react';

export default function KeyMetricsRow({
  aqi = 387,
  aqiCategory = "Severe",
  inversionStrength = "Strong",
  pblHeight = 180,
  plumeRisk = "High",
  windSummary = "NW 8 km/h",
  dominantPollutant = "PM2.5",
  pollutantValue = 312,
  pollutantUnit = "µg/m³"
}) {
  return (
    <section aria-labelledby="key-metrics-heading">
      <h2 id="key-metrics-heading" className="console-section-header">Current Conditions</h2>

      <div className="hero-metrics-grid">
        {/* Card 1: Current AQI */}
        <div className="hero-metric-card">
          <div className="card-top-row">
            <span className="card-label">Current AQI</span>
            <Gauge size={16} className="card-icon" />
          </div>
          <div className="big-number alert">{aqi}</div>
          <div className="card-subtext">{aqiCategory}</div>
        </div>

        {/* Card 2: Inversion Strength */}
        <div className="hero-metric-card">
          <div className="card-top-row">
            <span className="card-label">Inversion Strength</span>
            <Layers size={16} className="card-icon" />
          </div>
          <div className="big-number alert">{inversionStrength}</div>
          <div className="card-subtext">PBL {pblHeight}m</div>
        </div>

        {/* Card 3: Plume Risk */}
        <div className="hero-metric-card">
          <div className="card-top-row">
            <span className="card-label">Plume Risk</span>
            <Flame size={16} className="card-icon" />
          </div>
          <div className="big-number alert">{plumeRisk}</div>
          <div className="card-subtext">{windSummary}</div>
        </div>

        {/* Card 4: Dominant Pollutant */}
        <div className="hero-metric-card">
          <div className="card-top-row">
            <span className="card-label">Dominant Pollutant</span>
            <CloudFog size={16} className="card-icon" />
          </div>
          <div className="big-number">{dominantPollutant}</div>
          <div className="card-subtext">{pollutantValue} {pollutantUnit}</div>
        </div>
      </div>
    </section>
  );
}
