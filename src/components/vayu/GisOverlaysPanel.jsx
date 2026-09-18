import React from 'react';
import { Layers } from 'lucide-react';

export default function GisOverlaysPanel({
  layers = [
    { id: "heatmap", layer: "Interpolated AQI Heatmap", color: "#E8862B", active: true },
    { id: "biomass", layer: "Crop Biomass Plume Polygons", color: "#D6432E", active: true },
    { id: "wind", layer: "Northwest Wind Streamlines", color: "#2563EB", active: true },
    { id: "pins", layer: "Station CAQM Pins", color: "var(--bg-navy)", active: true },
    { id: "traffic", layer: "Urban Congestion Corridors", color: "var(--text-secondary)", active: false }
  ],
  onToggleLayer = () => {}
}) {
  const activeCount = layers.filter(l => l.active).length;

  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[var(--bg-navy)]" />
          <h2 className="text-[13px] font-semibold tracking-wider text-[var(--text-primary)] uppercase">
            GIS OVERLAYS
          </h2>
        </div>
        <span className="text-[11px] px-2 py-0.5 bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-secondary)] rounded font-medium">
          {activeCount} Active
        </span>
      </div>

      {/* Layer Options List */}
      <div className="flex flex-col gap-1 mt-0.5">
        {layers.map(item => (
          <label
            key={item.id}
            className="flex items-center justify-between p-2 rounded hover:bg-[var(--bg-page)] cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[13px] font-medium text-[var(--text-primary)]">
                {item.layer}
              </span>
            </div>
            <input
              type="checkbox"
              checked={item.active}
              onChange={() => onToggleLayer(item.id)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--bg-navy)] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[var(--bg-navy)]"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
