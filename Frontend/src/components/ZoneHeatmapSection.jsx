import React from 'react';

export default function ZoneHeatmapSection() {
  const zones = [
    { zone: "North Delhi", aqi: 410, category: "severe" },
    { zone: "Central Delhi", aqi: 387, category: "severe" },
    { zone: "South Delhi", aqi: 340, category: "very_poor" },
    { zone: "East Delhi (Anand Vihar)", aqi: 445, category: "severe" },
    { zone: "Gurugram", aqi: 310, category: "very_poor" },
    { zone: "Noida", aqi: 360, category: "very_poor" }
  ];

  return (
    <section aria-labelledby="zones-section-title">
      <div className="console-section-header">
        <span id="zones-section-title">Spatial AQI Zones (High-Resolution Heatmap)</span>
      </div>

      <div className="zones-grid">
        {zones.map((z) => {
          const isSevere = z.category === 'severe';
          return (
            <div
              key={z.zone}
              className={`zone-tile ${z.category}`}
              title={`${z.zone}: AQI ${z.aqi} (${isSevere ? 'Severe' : 'Very Poor'})`}
            >
              <span className="zone-name">{z.zone}</span>
              <div className="zone-aqi-row">
                <span className={`zone-aqi ${isSevere ? 'alert' : 'warning'}`}>
                  {z.aqi}
                </span>
                <span className={`zone-badge ${isSevere ? 'alert' : 'warning'}`}>
                  {isSevere ? 'Severe' : 'Very Poor'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
