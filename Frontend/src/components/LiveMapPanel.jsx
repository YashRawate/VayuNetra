import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Maximize2 } from 'lucide-react';

export default function LiveMapPanel({
  selectedZone = "Delhi NCR (all)",
  layers = { heatmap: true, plume: true, stations: true },
  stations = [],
  onSelectStationByName,
  theme = 'light',
  onExpand
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  const layerGroupsRef = useRef({
    heatmap: null,
    plume: null,
    stations: null
  });

  const [timeframe, setTimeframe] = useState('Now');

  // CartoDB Voyager for light, Dark Matter for dark
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const fireSources = [
    { location: "Sangrur, Punjab", lat: 30.24, lng: 75.84, intensity: 0.9 },
    { location: "Karnal, Haryana", lat: 29.68, lng: 76.98, intensity: 0.6 }
  ];

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Good': return '#10B981'; // emerald-500
      case 'Satisfactory': return '#10B981';
      case 'Moderate': return '#EAB308'; // yellow-500
      case 'Poor': return '#F97316'; // orange-500
      case 'Very Poor': return '#EF4444'; // red-500
      case 'Severe': return '#B91C1C'; // red-700
      default: return '#94A3B8'; // slate-400
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.64, 77.20],
        zoom: 10,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true
      });

      tileLayerRef.current = L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: 'abcd'
      }).addTo(map);

      layerGroupsRef.current.heatmap = L.layerGroup().addTo(map);
      layerGroupsRef.current.plume = L.layerGroup().addTo(map);
      layerGroupsRef.current.stations = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, []);

  // Update Tile Layer when theme changes
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [theme, tileUrl]);

  // Update Plume Layer
  useEffect(() => {
    const group = layerGroupsRef.current.plume;
    if (!group) return;
    group.clearLayers();

    if (layers.plume) {
      const plumeCoords = [
        [30.4, 75.5],
        [29.8, 75.2],
        [28.4, 77.0],
        [28.4, 77.5],
        [28.9, 77.5],
        [30.1, 76.5]
      ];

      L.polygon(plumeCoords, {
        color: '#EF4444',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#EF4444',
        fillOpacity: theme === 'dark' ? 0.16 : 0.12,
        dashArray: '4, 4'
      }).addTo(group);

      fireSources.forEach(src => {
        L.circleMarker([src.lat, src.lng], {
          radius: 8,
          fillColor: '#EF4444',
          color: '#FFFFFF',
          weight: 2,
          fillOpacity: 0.95
        }).addTo(group);
      });
    }
  }, [layers.plume, theme]);

  // Update Interactive Sensor Markers Layer with Pulsing Animation
  useEffect(() => {
    const group = layerGroupsRef.current.stations;
    const map = mapInstanceRef.current;
    if (!group || !map) return;

    group.clearLayers();

    if (layers.stations) {
      if (!map.hasLayer(group)) {
        group.addTo(map);
      }

      stations.forEach(st => {
        const color = getCategoryColor(st.category);
        const isSevere = st.category === 'Severe' || st.category === 'Very Poor';
        
        // Tailwind `animate-ping` for pulse effect if severe
        const pingClass = isSevere ? 'animate-ping' : '';

        const pulsingIcon = L.divIcon({
          className: 'custom-sensor-marker',
          html: `
            <div class="relative flex items-center justify-center w-5 h-5">
              <div class="absolute w-full h-full rounded-full opacity-50 ${pingClass}" style="background-color: ${color}"></div>
              <div class="relative w-3 h-3 rounded-full border-2 border-white shadow-sm" style="background-color: ${color}"></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([st.lat, st.lng], { icon: pulsingIcon }).addTo(group);

        const popupContent = `
          <div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 min-w-[200px] overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span class="font-bold text-sm">${st.station}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-bold" style="background-color: ${color}22; color: ${color};">
                AQI ${st.aqi}
              </span>
            </div>
            <div class="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live</span>
              <span>Just now</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { 
          minWidth: 200,
          className: 'custom-popup' // Will style in css to remove default padding
        });

        marker.on('click', () => {
          if (onSelectStationByName) {
            onSelectStationByName(st.station);
          }
        });
      });
    } else {
      if (map.hasLayer(group)) {
        map.removeLayer(group);
      }
    }
  }, [layers.stations, stations, theme]);

  // Pan to zone when selectedZone changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedZone === "Delhi NCR (all)") {
      map.setView([28.64, 77.20], 10, { animate: true });
    }
  }, [selectedZone]);

  return (
    <section className="relative w-full h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Compass size={16} className="text-blue-500" />
          Live Spatial Monitoring
        </span>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {['Now', '+24h', '+72h'].map(tf => (
              <button
                key={tf}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
          {onExpand && (
            <button onClick={onExpand} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
              <Maximize2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 w-full h-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 flex gap-3 px-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Good</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Mod</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Poor</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-600"></span> Sev</span>
        </div>
      </div>
    </section>
  );
}
