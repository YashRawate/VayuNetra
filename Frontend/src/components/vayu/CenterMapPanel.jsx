import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Flame, AlertCircle, RefreshCw } from 'lucide-react';

export default function CenterMapPanel({
  timeframe = "Live",
  onTimeframeChange = () => {},
  selectedZone = "Anand Vihar & East",
  onSelectStation = () => {},
  theme = "light",
  gisLayers = {
    heatmap: true,
    biomass: true,
    wind: true,
    pins: true,
    traffic: false
  }
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    markers: [],
    polygons: [],
    heatmaps: []
  });

  const [activeStation, setActiveStation] = useState("Anand Vihar");

  const stationsData = [
    { name: "Anand Vihar", label: "Anand Vihar", aqi: 452, tag: "Hazardous", lat: 28.6469, lng: 77.3160, isExpanded: true },
    { name: "Jahangirpuri", label: "Jahangirpuri", aqi: 410, tag: "Severe+", lat: 28.7325, lng: 77.1706 },
    { name: "ITO Central", label: "ITO Central", aqi: 387, tag: "Severe", lat: 28.6317, lng: 77.2410 },
    { name: "Sector 62, Noida", label: "Noida Sec 62", aqi: 378, tag: "Severe", lat: 28.6245, lng: 77.3649 },
    { name: "Cyber City, Gurugram", label: "Cyber City", aqi: 362, tag: "Very Poor", lat: 28.4952, lng: 77.0895 },
    { name: "Karnal Axis", label: "Karnal Axis", aqi: 298, tag: "Poor", lat: 29.6857, lng: 76.9905 },
    { name: "Faridabad Belt", label: "Faridabad", aqi: 395, tag: "Severe", lat: 28.4089, lng: 77.3178 },
    { name: "Alipur Axis", label: "Alipur", aqi: 340, tag: "Severe", lat: 28.8153, lng: 77.1331 }
  ];

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'var(--aqi-good)';
    if (aqi <= 100) return 'var(--aqi-moderate)';
    if (aqi <= 200) return 'var(--aqi-poor)';
    if (aqi <= 300) return 'var(--aqi-vpoor)';
    if (aqi <= 400) return 'var(--aqi-severe)';
    return 'var(--aqi-hazardous)';
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.65, 77.18],
        zoom: 9.5,
        zoomControl: false,
        attributionControl: false
      });

      // Standard OSM Tile Layer to avoid API Key issues
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      // Custom zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous layers
    layersRef.current.markers.forEach(m => m.remove());
    layersRef.current.polygons.forEach(p => p.remove());
    layersRef.current.markers = [];
    layersRef.current.polygons = [];

    // Render Biomass Plume / Dispersion Corridor Polygon
    if (gisLayers.biomass) {
      const plumePolygon = L.polygon([
        [30.20, 75.60],
        [29.70, 76.30],
        [29.10, 76.80],
        [28.75, 77.40],
        [28.35, 77.55],
        [28.30, 77.10],
        [28.85, 76.50],
        [29.50, 75.90]
      ], {
        color: 'var(--aqi-vpoor)',
        weight: 2,
        dashArray: '6, 6',
        fillColor: 'var(--aqi-poor)',
        fillOpacity: 0.18
      }).addTo(map);

      plumePolygon.bindTooltip("Northwest Biomass Dispersion Corridor (NW Stream Axis)", {
        sticky: true,
        className: 'bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-semibold px-2 py-1 rounded shadow border border-[var(--border)]'
      });

      layersRef.current.polygons.push(plumePolygon);
    }

    // Render Station Markers
    if (gisLayers.pins) {
      stationsData.forEach(st => {
        const isHighlighted = st.name.toLowerCase().includes(activeStation.toLowerCase()) || 
                            activeStation.toLowerCase().includes(st.name.toLowerCase());
        const color = getAQIColor(st.aqi);

        let iconHtml = ``;
        if (isHighlighted) {
          iconHtml = `
            <div class="station-pill-marker expanded">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
              <span>${st.name} — ${st.aqi} AQI · ${st.tag}</span>
            </div>
          `;
        } else {
          iconHtml = `
            <div class="station-pill-marker">
              <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
              <span>${st.label} ${st.aqi}</span>
            </div>
          `;
        }

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-div-icon',
          iconSize: isHighlighted ? [240, 32] : [110, 24],
          iconAnchor: isHighlighted ? [120, 16] : [55, 12]
        });

        const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setActiveStation(st.name);
          onSelectStation(st.name);
        });

        layersRef.current.markers.push(marker);
      });
    }

  }, [gisLayers, activeStation, onSelectStation]);

  const legendItems = [
    { range: "0-50", label: "Good", color: "var(--aqi-good)" },
    { range: "51-100", label: "Mod", color: "var(--aqi-moderate)" },
    { range: "101-200", label: "Poor", color: "var(--aqi-poor)" },
    { range: "201-300", label: "V.Poor", color: "var(--aqi-vpoor)" },
    { range: "301-400", label: "Severe", color: "var(--aqi-severe)" },
    { range: "401+", label: "Haz", color: "var(--aqi-hazardous)" }
  ];

  const statCards = [
    {
      title: "Diurnal Trapping Window",
      status: "Peak Phase",
      statusBg: "bg-red-100/10 text-red-600 border-[var(--aqi-vpoor)] border",
      value: "04:00 - 08:30 AM",
      note: "Stagnant ground inversion layer restricts vertical exhaust venting."
    },
    {
      title: "Plume Migration Rate",
      status: "En Route",
      statusBg: "bg-amber-100/10 text-amber-600 border-[var(--aqi-moderate)] border",
      value: "2.1 km/hr",
      note: "Transiting Sonepat-Bawana axis with approx. 4.5h regional delay."
    },
    {
      title: "Telemetry Grid Health",
      status: "Nominal",
      statusBg: "bg-emerald-100/10 text-emerald-600 border-[var(--aqi-good)] border",
      value: "97.4% (37/38)",
      note: "1 station (Alipur) performing beta-attenuation filter reset."
    }
  ];

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden transition-colors duration-300">
      {/* Center Map Card Container */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 flex flex-col flex-1 relative overflow-hidden shadow-sm">
        {/* Header inside Map Panel */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[var(--border)] pb-2 mb-2 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-[var(--text-primary)] uppercase">
                Transboundary Dispersion Corridor
              </h1>
              <span className="text-[10px] font-mono-telemetry font-bold px-2 py-0.5 bg-[var(--bg-navy)] text-white rounded">
                NW Stream Axis
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Punjab · Haryana · Delhi NCR Integrated Airshed Simulation
            </p>
          </div>

          {/* Timeframe Tabs */}
          <div className="flex items-center bg-[var(--bg-page)] p-1 rounded border border-[var(--border)] text-xs font-mono-telemetry">
            {["Live", "+12h", "+24h", "+48h"].map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-0.5 rounded font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Map Container Area */}
        <div className="relative flex-1 w-full min-h-[360px] rounded border border-[var(--border)] overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Plume Influx Callout Overlay (top-left) */}
          <div className="absolute top-3 left-3 z-20 bg-[var(--bg-surface)]/95 backdrop-blur border border-[var(--border)] rounded-md px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
            <Flame className="w-4 h-4 text-orange-600 animate-pulse shrink-0" />
            <div>
              <span className="text-[var(--text-secondary)] font-normal mr-1">Crop Burning Plume Influx:</span>
              <span className="font-mono-telemetry font-bold text-red-600">~28.4% Composite Load</span>
            </div>
          </div>
        </div>

        {/* AQI Scale Legend Strip at bottom of map */}
        <div className="w-full mt-2 grid grid-cols-6 gap-1 pt-1 border-t border-[var(--border)]">
          {legendItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-1 rounded text-center text-white"
              style={{ backgroundColor: item.color }}
            >
              <span className="font-mono-telemetry text-[11px] font-bold leading-tight">
                {item.range}
              </span>
              <span className="text-[9px] font-medium leading-none opacity-90">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Below-Map Stat Row (3 Equal Width Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 flex flex-col justify-between transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                {card.title}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${card.statusBg}`}>
                {card.status}
              </span>
            </div>

            <div className="font-mono-telemetry text-base font-bold text-[var(--text-primary)] my-1">
              {card.value}
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
              {card.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
