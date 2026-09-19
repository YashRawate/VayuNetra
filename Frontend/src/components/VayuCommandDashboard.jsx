import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Activity,
  Wind,
  Flame,
  ShieldAlert,
  Layers,
  MapPin,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertOctagon,
  Compass,
  Sun,
  Clock,
  ArrowUpRight,
  Printer,
  Download,
  Check,
  Sparkles,
  X,
  Search,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function VayuCommandDashboard() {
  const [activeTab, setActiveTab] = useState('gis');
  const [selectedHotspot, setSelectedHotspot] = useState('Anand Vihar');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState('Standard');
  const [timeHorizon, setTimeHorizon] = useState('Live');
  const [actionsTriggered, setActionsTriggered] = useState({});
  const [actionLog, setActionLog] = useState([]);
  const [downloadNotice, setDownloadNotice] = useState(false);
  const [isStationsPanelOpen, setIsStationsPanelOpen] = useState(true);

  const toggleStationsPanel = () => {
    setIsStationsPanelOpen(prev => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
  };

  // Layer Toggles
  const [gisLayers, setGisLayers] = useState({
    heatmap: true,
    wind: true,
    pins: true,
    fires: true
  });

  const toggleLayer = (layerKey) => {
    setGisLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Monitoring Hotspots Data
  const hotspots = [
    { id: 1, name: "Anand Vihar & East Delhi", label: "Anand Vihar", location: "ISBT Transit Corridor", aqi: 452, pm25: 284, tag: "HAZARDOUS", color: "#9333ea", lat: 28.6469, lng: 77.3160 },
    { id: 2, name: "Jahangirpuri & North Delhi", label: "Jahangirpuri", location: "GT Karnal Road", aqi: 410, pm25: 245, tag: "SEVERE+", color: "#e11d48", lat: 28.7325, lng: 77.1706 },
    { id: 3, name: "ITO & Central Core", label: "ITO", location: "Central Intersection", aqi: 387, pm25: 215, tag: "VERY POOR", color: "#f43f5e", lat: 28.6317, lng: 77.2410 },
    { id: 4, name: "Sector 62, Noida", label: "Noida 62", location: "Gautam Buddha Nagar", aqi: 378, pm25: 205, tag: "VERY POOR", color: "#ea580c", lat: 28.6245, lng: 77.3649 },
    { id: 5, name: "Cyber City, Gurugram", label: "Gurugram Hub", location: "NH-48 Corridor", aqi: 362, pm25: 192, tag: "VERY POOR", color: "#d97706", lat: 28.4952, lng: 77.0895 },
    { id: 6, name: "Karnal Upwind Gateway", label: "Karnal Entry", location: "Agricultural Inflow Axis", aqi: 298, pm25: 142, tag: "POOR", color: "#ca8a04", lat: 29.6857, lng: 76.9905 }
  ];

  // Satellite Active Stubble Fires Data (VIIRS)
  const satelliteFires = [
    { id: "FIRE-101", lat: 29.82, lng: 75.88, frp: 210, biomass: "18.6 Tonnes", pm25_rate: "0.80 kg/s", time: "10:30 IST", dist: "142 km NW (Punjab)" },
    { id: "FIRE-102", lat: 29.54, lng: 76.12, frp: 125, biomass: "11.2 Tonnes", pm25_rate: "0.45 kg/s", time: "10:45 IST", dist: "115 km NW (Haryana)" },
    { id: "FIRE-103", lat: 29.35, lng: 76.48, frp: 88, biomass: "7.8 Tonnes", pm25_rate: "0.32 kg/s", time: "11:10 IST", dist: "88 km NW (Panipat)" },
    { id: "FIRE-104", lat: 29.12, lng: 76.82, frp: 62, biomass: "5.5 Tonnes", pm25_rate: "0.21 kg/s", time: "11:25 IST", dist: "54 km NW (Sonipat)" },
  ];

  // Filtered Hotspots based on search query
  const filteredHotspots = hotspots.filter(st =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 72-Hour Forecast Data
  const forecastTrend = Array.from({ length: 24 }, (_, i) => {
    const hour = i * 3;
    const basePm = 160 + 35 * Math.sin((i / 4) * Math.PI) + (i > 8 ? i * 2.5 : 0);
    return {
      time: `+${hour}h`,
      PM25: Math.round(basePm),
      PM10: Math.round(basePm * 1.55),
      NO2: Math.round(42 + 12 * Math.sin(i / 2)),
      O3: Math.round(25 + 30 * Math.max(0, Math.sin(i / 3))),
      PBLH: Math.round(350 + 950 * Math.max(0, Math.sin((i - 2) / 3))),
      Radiation: Math.round(700 * Math.max(0, Math.sin((i - 2) / 3))),
    };
  });

  // Action Items Handler
  const handleAction = (id, name, stage) => {
    setActionsTriggered(prev => ({ ...prev, [id]: true }));
    const logItem = `[${new Date().toLocaleTimeString('en-IN')}] Triggered ${stage}: ${name}`;
    setActionLog(prev => [logItem, ...prev]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3500);
  };

  // Leaflet Map Setup (OpenStreetMap free tiles + persistent lifecycle)
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupRef = useRef(null);

  const getTileUrl = (style) => {
    if (style === 'Topo') {
      return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Persistent single-instance Leaflet map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.65, 77.18],
        zoom: 9,
        zoomControl: true,
        attributionControl: true
      });

      const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // When activeTab switches to 'gis', invalidateSize so map never gets stuck or gray
  useEffect(() => {
    if (activeTab === 'gis' && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Handle Map Tile Style Change
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(mapStyle));
    }
  }, [mapStyle]);

  // Smoothly Fly & Center map on selected station
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspot) return;
    const target = hotspots.find(h =>
      h.name.toLowerCase().includes(selectedHotspot.toLowerCase()) ||
      h.label.toLowerCase().includes(selectedHotspot.toLowerCase())
    );
    if (target) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 11.5, {
        animate: true,
        duration: 1.0
      });
    }
  }, [selectedHotspot]);

  // Reset Map View to default center
  const handleResetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.65, 77.18], 9, { animate: true, duration: 0.8 });
      mapInstanceRef.current.invalidateSize();
    }
  };

  // Render Map Layers & Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Heatmap circles
    if (gisLayers.heatmap) {
      L.circle([29.20, 76.95], {
        radius: 38000,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.25,
        stroke: false
      }).addTo(layerGroup);

      L.circle([28.64, 77.25], {
        radius: 28000,
        color: '#9333ea',
        fillColor: '#a855f7',
        fillOpacity: 0.3,
        stroke: false
      }).addTo(layerGroup);
    }

    // 2. Station Pins
    if (gisLayers.pins) {
      hotspots.forEach(st => {
        const isSelected = selectedHotspot.includes(st.label);
        const markerHtml = `
          <div style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <div style="background:${isSelected ? '#0f172a' : '#ffffff'}; border:2px solid ${st.color}; border-radius:8px; padding:3px 8px; color:${isSelected ? '#ffffff' : '#0f172a'}; font-size:11px; font-weight:700; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.2); transform:${isSelected ? 'scale(1.1)' : 'scale(1)'}; transition:all 0.2s;">
              <span>${st.label}</span>
              <span style="margin-left:5px; background:${st.color}; color:#ffffff; padding:1px 6px; border-radius:4px; font-weight:900;">${st.aqi}</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [120, 32],
          iconAnchor: [12, 16]
        });

        const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(layerGroup);
        marker.on('click', () => setSelectedHotspot(st.name));
      });
    }

    // 3. Satellite Fire Pins
    if (gisLayers.fires) {
      satelliteFires.forEach(fire => {
        const fireHtml = `
          <div style="background:#fff7ed; border:1.5px solid #ea580c; color:#c2410c; border-radius:6px; padding:2px 6px; font-size:10px; font-weight:800; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
            🔥 ${fire.frp} MW
          </div>
        `;
        const fireIcon = L.divIcon({
          html: fireHtml,
          className: '',
          iconSize: [80, 22],
          iconAnchor: [5, 11]
        });
        L.marker([fire.lat, fire.lng], { icon: fireIcon }).addTo(layerGroup);
      });
    }
  }, [gisLayers, mapStyle, selectedHotspot]);

  return (
    <div className="h-screen w-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans overflow-hidden">
      
      {/* TOP BRAND HEADER - CLEAN LIGHT MODE */}
      <header className="flex-none bg-white border-b border-slate-200 px-5 py-2.5 shadow-xs z-50">
        <div className="max-w-[1750px] mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs">
              <Wind className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Vital Air
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Delhi-NCR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Atmospheric Pollution Forecasting & Decision Support</p>
            </div>
          </div>

          {/* Controls & Stream Info */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>WRF-Chem Live Stream</span>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {['Live', '+24h', '+48h', '+72h'].map(horizon => (
                <button
                  key={horizon}
                  onClick={() => setTimeHorizon(horizon)}
                  className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                    timeHorizon === horizon
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {horizon}
                </button>
              ))}
            </div>

            <select
              value={selectedHotspot}
              onChange={(e) => setSelectedHotspot(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold text-slate-800 px-2.5 py-1 rounded-lg cursor-pointer focus:outline-none focus:border-emerald-600 shadow-xs"
            >
              {hotspots.map(h => (
                <option key={h.id} value={h.name} className="bg-white text-slate-800">
                  📍 {h.name} (AQI {h.aqi})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2.5">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="btn-emerald px-3 py-1 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS - CLEAN LIGHT LAYOUT */}
        <div className="max-w-[1750px] mx-auto flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-200 overflow-x-auto">
          {[
            { id: 'gis', label: '1. Live Air Map & Stations', icon: Compass },
            { id: 'telemetry', label: '2. 72h Pollution Forecast', icon: BarChart2 },
            { id: 'stubble', label: '3. Stubble Burning & Fire Impact', icon: Flame },
            { id: 'grap', label: '4. Clean Air Actions & Directives', icon: ShieldAlert },
            { id: 'feedback', label: '5. Aerosol Coupling Research', icon: RefreshCw },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs border border-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* CSV Notice */}
      {downloadNotice && (
        <div className="flex-none bg-emerald-600 text-white px-5 py-1.5 text-xs font-bold flex items-center justify-between shadow-sm z-40">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white" />
            <span>Air quality dataset exported successfully as CSV.</span>
          </div>
          <button onClick={() => setDownloadNotice(false)} className="text-white hover:text-slate-100 underline">Dismiss</button>
        </div>
      )}

      {/* MAIN CONTENT CANVAS - ALL PANELS STAY MOUNTED FOR INSTANT SWITCHING */}
      <main className="flex-1 min-h-0 w-full max-w-[1750px] mx-auto p-3.5 flex flex-col gap-3.5 overflow-hidden relative">

        {/* TAB 1: LIVE AIR MAP & STATIONS (PERSISTENT DOM) */}
        <div className={`flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden transition-all duration-300 ${activeTab === 'gis' ? '' : 'hidden'}`}>
          
          {/* GIS Map Panel */}
          <div className={`${isStationsPanelOpen ? 'lg:col-span-9' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full min-h-0 overflow-hidden shadow-xs transition-all duration-300`}>
            
            {/* Map Toolbar Header */}
            <div className="flex-none flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">Delhi NCR Airshed Interactive GIS Map</h3>
              </div>

              {/* Toolbar Actions & Search Box */}
              <div className="flex items-center flex-wrap gap-2">
                
                {/* Search Bar */}
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search station..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-2 py-0.5 bg-slate-50 border border-slate-200 text-[11px] rounded-lg font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-36"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-1.5 text-slate-400 hover:text-slate-600 text-xs">
                      ×
                    </button>
                  )}
                </div>

                {/* Reset Map View */}
                <button
                  onClick={handleResetMapView}
                  title="Reset map center & zoom"
                  className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {!isStationsPanelOpen && (
                  <button
                    onClick={toggleStationsPanel}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Show Stations ({hotspots.length})</span>
                  </button>
                )}

                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 px-2 py-0.5 rounded cursor-pointer"
                >
                  <option value="Standard">OpenStreetMap</option>
                  <option value="Topo">OpenTopoMap</option>
                </select>

                {[
                  { key: 'heatmap', label: 'Plume', color: 'bg-red-500' },
                  { key: 'pins', label: 'Stations', color: 'bg-purple-600' },
                  { key: 'fires', label: 'Fires', color: 'bg-orange-500' },
                ].map(layer => (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                      gisLayers[layer.key]
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${layer.color}`}></span>
                    <span>{layer.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Leaflet Map Canvas Container */}
            <div className="flex-1 w-full h-full min-h-[350px] rounded-xl border border-slate-200 overflow-hidden relative">
              <div ref={mapContainerRef} className="w-full h-full z-10" />

              {/* Map Legend Overlay */}
              <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 shadow-md">
                <div className="font-bold text-slate-900 mb-0.5">AQI Scale</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-600"></span><span className="text-slate-700">Hazardous (&gt;450)</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-600"></span><span className="text-slate-700">Severe+ (401-450)</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-600"></span><span className="text-slate-700">Very Poor (301-400)</span></div>
              </div>
            </div>
          </div>

          {/* Station Leaderboard - Collapsible & Search Filtered */}
          {isStationsPanelOpen && (
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full min-h-0 overflow-hidden shadow-xs transition-all duration-300">
              <div className="flex-none flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <h3 className="text-xs font-bold text-slate-900">Monitoring Stations</h3>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px] text-slate-400 font-semibold px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200">Live Feed</span>
                  <button
                    onClick={toggleStationsPanel}
                    title="Close stations panel"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 mt-2 pr-0.5">
                {filteredHotspots.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    No stations match "{searchQuery}"
                  </div>
                ) : (
                  filteredHotspots.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => setSelectedHotspot(st.name)}
                      className={`p-2 rounded-lg cursor-pointer transition-all border ${
                        selectedHotspot === st.name
                          ? 'bg-emerald-50/60 border-emerald-400 shadow-2xs'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-[11px] truncate leading-tight">{st.name}</div>
                          <div className="text-[9.5px] text-slate-400 truncate mt-0.5">{st.location}</div>
                        </div>
                        <div className="text-right flex-none">
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 rounded inline-block"
                            style={{ backgroundColor: st.color + '15', color: st.color, border: `1px solid ${st.color}40` }}
                          >
                            AQI {st.aqi}
                          </span>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5 font-semibold">PM2.5: {st.pm25}</div>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (st.aqi / 500) * 100)}%`, backgroundColor: st.color }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* TAB 2: 72-HOUR POLLUTION FORECAST */}
        <div className={`flex-1 min-h-0 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-xs ${activeTab === 'telemetry' ? '' : 'hidden'}`}>
          <div className="flex-none flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                WRF-Chem 72-Hour Regional Pollutant Forecast Outlook
              </h3>
              <p className="text-[11px] text-slate-500">Integrated chemical transport prediction for Delhi NCR</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-600"></span><span>PM2.5</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-600"></span><span>PM10</span></div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastTrend}>
                <defs>
                  <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPM10" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="PM25" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPM25)" name="PM2.5 (ug/m3)" />
                <Area type="monotone" dataKey="PM10" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#colorPM10)" name="PM10 (ug/m3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TAB 3: STUBBLE BURNING & FIRE IMPACT */}
        <div className={`flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden ${activeTab === 'stubble' ? '' : 'hidden'}`}>
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full min-h-0 overflow-hidden shadow-xs">
            <div className="flex-none flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-slate-900">Satellite Active Fire Detections (VIIRS)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                Punjab/Haryana Axis
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                    <th className="pb-1.5">Cluster ID</th>
                    <th className="pb-1.5">FRP (MW)</th>
                    <th className="pb-1.5">Biomass</th>
                    <th className="pb-1.5">PM2.5 Emission</th>
                    <th className="pb-1.5">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {satelliteFires.map((fire) => (
                    <tr key={fire.id} className="hover:bg-slate-50">
                      <td className="py-2 font-bold text-orange-600">{fire.id}</td>
                      <td className="py-2 font-black text-slate-900">{fire.frp} MW</td>
                      <td className="py-2 text-slate-700">{fire.biomass}</td>
                      <td className="py-2 text-rose-600 font-mono font-bold">{fire.pm25_rate}</td>
                      <td className="py-2 text-slate-500">{fire.dist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full min-h-0 overflow-hidden shadow-xs">
            <h3 className="flex-none text-xs font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Compass className="w-4 h-4 text-emerald-600" />
              Sectoral Attribution Share
            </h3>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 mt-2">
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-center">
                <div className="text-2xl font-black text-orange-600">42.8%</div>
                <div className="text-[11px] text-slate-700 font-semibold">Stubble Burning Contribution to PM₂.₅</div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-700 font-semibold text-[11px]"><span>Vehicular Traffic</span><span>28.5%</span></div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200 mt-1"><div className="bg-blue-600 h-full w-[28.5%]" /></div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-semibold text-[11px]"><span>Industrial Stacks</span><span>18.2%</span></div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200 mt-1"><div className="bg-purple-600 h-full w-[18.2%]" /></div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-semibold text-[11px]"><span>Dust & Construction</span><span>10.5%</span></div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200 mt-1"><div className="bg-amber-600 h-full w-[10.5%]" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 4: CLEAN AIR ACTIONS & DIRECTIVES */}
        <div className={`flex-1 min-h-0 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-xs ${activeTab === 'grap' ? '' : 'hidden'}`}>
          <div className="flex-none flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Clean Air Actions & Statutory Emergency Directives (GRAP)
              </h3>
              <p className="text-[11px] text-slate-500">Statutory emergency air pollution mitigation controls</p>
            </div>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              STAGE IV ACTIVE
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 mt-3 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'act-1', name: 'Ban Non-Essential Truck Entry', stage: 'Stage IV', desc: 'Restrict heavy diesel truck entry into Delhi except essential commodities.' },
                { id: 'act-2', name: 'Anti-Smog Water Sprinkling', stage: 'Stage III', desc: 'Deploy high-pressure mist cannons along 13 designated hotspots.' },
                { id: 'act-3', name: 'Halt Construction Work', stage: 'Stage III', desc: 'Stop linear public works, earth digging, and brick kilns.' },
                { id: 'act-4', name: 'Enforce Odd-Even Traffic', stage: 'Stage IV', desc: 'Restrict passenger car movements based on registration numbers.' },
              ].map((act) => {
                const isDone = actionsTriggered[act.id];
                return (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                        {act.stage}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{act.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{act.desc}</p>
                    </div>

                    <button
                      onClick={() => handleAction(act.id, act.name, act.stage)}
                      disabled={isDone}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'btn-emerald'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Action Enforced</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Enforce Action</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {actionLog.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900 text-white space-y-1 shadow-xs">
                <h4 className="text-[11px] font-bold text-slate-300">Enforcement Audit Log:</h4>
                <div className="space-y-0.5 font-mono text-[10px] text-emerald-400 max-h-24 overflow-y-auto">
                  {actionLog.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TAB 5: AEROSOL COUPLING RESEARCH */}
        <div className={`flex-1 min-h-0 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-xs ${activeTab === 'feedback' ? '' : 'hidden'}`}>
          <div className="flex-none pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              Two-Way Aerosol-Meteorology Coupling Experiment Response
            </h3>
            <p className="text-[11px] text-slate-500">Comparing CONTROL vs FEEDBACK WRF-Chem model runs</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 mt-3 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[11px] text-slate-500 font-semibold">Shortwave Dimming</div>
                <div className="text-xl font-black text-blue-600">-4.43 W/m²</div>
                <div className="text-[10px] text-slate-500">Peak attenuation: -67.39 W/m²</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[11px] text-slate-500 font-semibold">Surface Cooling (T2 Drop)</div>
                <div className="text-xl font-black text-indigo-600">-0.076 K</div>
                <div className="text-[10px] text-slate-500">Peak cooling: -1.16 K</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[11px] text-slate-500 font-semibold">PBL Suppression</div>
                <div className="text-xl font-black text-amber-600">-9.50 meters</div>
                <div className="text-[10px] text-slate-500">Peak decay: -144.4 meters</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[11px] text-slate-500 font-semibold">PM2.5 Trapping</div>
                <div className="text-xl font-black text-rose-600">+1.50 µg/m³</div>
                <div className="text-[10px] text-slate-500">Peak trapping: +22.87 µg/m³</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-900">Lead-Time Skill Metrics (PM₂.₅)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                      <th className="pb-1.5">Horizon</th>
                      <th className="pb-1.5">MAE (µg/m³)</th>
                      <th className="pb-1.5">RMSE (µg/m³)</th>
                      <th className="pb-1.5">Bias</th>
                      <th className="pb-1.5">Pearson R</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 font-bold text-emerald-600">24h Forecast</td>
                      <td className="py-2 text-slate-700">20.29</td>
                      <td className="py-2 text-slate-700">23.33</td>
                      <td className="py-2 text-emerald-600 font-bold">+18.55</td>
                      <td className="py-2 text-emerald-600 font-bold">0.901</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-indigo-600">48h Forecast</td>
                      <td className="py-2 text-slate-700">29.74</td>
                      <td className="py-2 text-slate-700">31.68</td>
                      <td className="py-2 text-emerald-600 font-bold">+29.74</td>
                      <td className="py-2 text-indigo-600 font-bold">0.941</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-purple-600">72h Forecast</td>
                      <td className="py-2 text-slate-700">34.04</td>
                      <td className="py-2 text-slate-700">36.58</td>
                      <td className="py-2 text-emerald-600 font-bold">+34.04</td>
                      <td className="py-2 text-purple-600 font-bold">0.864</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* COMPACT FOOTER */}
      <footer className="flex-none bg-white border-t border-slate-200 text-slate-500 py-2 px-5 text-[11px]">
        <div className="max-w-[1750px] mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vital Air — Delhi NCR Air Quality Platform</span>
          </div>
          <div className="text-slate-500">WRF-Chem Coupled Modeling & OpenStreetMap &copy; 2026</div>
        </div>
      </footer>
    </div>
  );
}
