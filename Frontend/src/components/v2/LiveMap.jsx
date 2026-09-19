import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({
  theme = "light",
  selectedZone = "Anand Vihar",
  onSelectStation = () => {}
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const polygonRef = useRef(null);

  const stations = [
    { id: "anand-vihar", name: "Anand Vihar", aqi: 452, pm25: 350, updated: "2 mins ago", lat: 28.6469, lng: 77.3160 },
    { id: "jahangirpuri", name: "Jahangirpuri", aqi: 410, pm25: 310, updated: "5 mins ago", lat: 28.7325, lng: 77.1706 },
    { id: "ito", name: "ITO Central", aqi: 387, pm25: 295, updated: "1 min ago", lat: 28.6317, lng: 77.2410 },
    { id: "noida", name: "Sector 62, Noida", aqi: 378, pm25: 280, updated: "4 mins ago", lat: 28.6245, lng: 77.3649 },
    { id: "gurugram", name: "Cyber City, Gurugram", aqi: 362, pm25: 260, updated: "3 mins ago", lat: 28.4952, lng: 77.0895 },
    { id: "faridabad", name: "Faridabad Belt", aqi: 395, pm25: 300, updated: "6 mins ago", lat: 28.4089, lng: 77.3178 }
  ];

  const getSeverityColor = (aqi) => {
    if (aqi <= 50) return '#3FA75E';
    if (aqi <= 150) return '#D9A62E';
    if (aqi <= 250) return '#E8862B';
    if (aqi <= 400) return '#C4451C';
    return '#8A2418';
  };

  const getTileUrl = (currentTheme) => {
    return currentTheme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.61, 77.23],
        zoom: 10,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      tileLayerRef.current = L.tileLayer(getTileUrl(theme), {
        maxZoom: 18,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;
    } else if (tileLayerRef.current) {
      // Swap tile URL on theme change
      tileLayerRef.current.setUrl(getTileUrl(theme));
    }

    const map = mapInstanceRef.current;

    // Clear previous markers & polygon
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polygonRef.current) {
      polygonRef.current.remove();
    }

    // Render soft translucent smoke plume overlay
    const plumePolygon = L.polygon([
      [29.80, 76.10],
      [29.30, 76.70],
      [28.75, 77.35],
      [28.35, 77.45],
      [28.30, 77.05],
      [28.85, 76.45]
    ], {
      color: theme === 'dark' ? '#C4451C' : '#C4451C',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#C4451C',
      fillOpacity: theme === 'dark' ? 0.25 : 0.15
    }).addTo(map);

    polygonRef.current = plumePolygon;

    // Render Pulsing Markers
    stations.forEach(st => {
      const color = getSeverityColor(st.aqi);

      const markerHtml = `
        <div style="position: relative; width: 16px; height: 16px;">
          <div class="pulsing-marker-ring" style="border: 2px solid ${color};"></div>
          <div class="pulsing-marker-pin" style="background-color: ${color};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-pulsing-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const popupContent = `
        <div style="font-family: inherit; min-width: 140px;">
          <div style="font-weight: 700; font-size: 13px; color: var(--text); mb-1;">${st.name}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span style="font-size: 11px; color: var(--text-muted);">AQI</span>
            <span style="font-weight: 800; font-size: 13px; color: ${color};">${st.aqi}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
            <span style="font-size: 11px; color: var(--text-muted);">PM2.5</span>
            <span style="font-weight: 600; font-size: 11px; color: var(--text);">${st.pm25} µg/m³</span>
          </div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 6px; border-top: 1px solid var(--border); pt-1;">
            Updated ${st.updated}
          </div>
        </div>
      `;

      const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(popupContent, { offset: [0, -6] });

      marker.on('click', () => {
        onSelectStation(st.name);
      });

      markersRef.current.push(marker);
    });

  }, [theme, onSelectStation]);

  return (
    <div className="w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-[var(--border)] relative shadow-sm transition-colors">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Subtle map legend/tag overlay */}
      <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-medium text-[var(--text)] shadow-sm backdrop-blur">
        <span>Active Biomass Plume Stream</span>
      </div>
    </div>
  );
}
