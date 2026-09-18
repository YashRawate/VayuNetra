import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function VayuCommandDashboard() {
  const [activeTab, setActiveTab] = useState('Live GIS Airshed');
  const [selectedHotspot, setSelectedHotspot] = useState('Anand Vihar & East');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState('Heatmap');
  const [timeHorizon, setTimeHorizon] = useState('Live Now');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(true);
  const [isAqiModalOpen, setIsAqiModalOpen] = useState(false);

  // GIS Layer Toggles
  const [gisLayers, setGisLayers] = useState({
    heatmap: true,
    wind: true,
    pins: true,
  });

  // Hotspots data
  const hotspots = [
    { name: "Anand Vihar & East", label: "Anand Vihar", location: "ISBT, Trans-Yamuna Basin", aqi: 452, tag: "HAZ", tagBg: "bg-purple-900 text-white", width: "90.4%", barGrad: "from-rose-600 to-purple-900", lat: 28.6469, lng: 77.3160 },
    { name: "Jahangirpuri & North Corridor", label: "Jahangirpuri", location: "GT Karnal Highway axis", aqi: 410, tag: "SEV+", tagBg: "bg-rose-100 text-rose-800", width: "82%", barGrad: "from-rose-600 to-rose-700", lat: 28.7325, lng: 77.1706 },
    { name: "ITO & Central Core", label: "ITO", location: "Urban arterial intersection", aqi: 387, tag: "SEV", tagBg: "bg-rose-100 text-rose-700", width: "77.4%", barGrad: "from-rose-500 to-red-600", lat: 28.6317, lng: 77.2410 },
    { name: "Sector 62, Noida", label: "Noida 62", location: "Eastern border commercial zone", aqi: 378, tag: "SEV", tagBg: "bg-rose-100 text-rose-700", width: "75.6%", barGrad: "from-rose-500 to-red-600", lat: 28.6245, lng: 77.3649 },
    { name: "Cyber City, Gurugram", label: "Gurugram Cyber Hub", location: "NH-48 Southwestern gateway", aqi: 362, tag: "V.POOR", tagBg: "bg-orange-100 text-orange-700", width: "72.4%", barGrad: "from-amber-500 to-orange-500", lat: 28.4952, lng: 77.0895 },
    { name: "Karnal Upwind Gateway", label: "Karnal Entry", location: "Agricultural inflow boundary", aqi: 298, tag: "POOR", tagBg: "bg-amber-100 text-amber-700", width: "59.6%", barGrad: "from-amber-400 to-amber-500", lat: 29.6857, lng: 76.9905 }
  ];

  // Action Items State
  const [actionsTriggered, setActionsTriggered] = useState({});

  const handleAction = (id, actionName) => {
    setActionsTriggered(prev => ({ ...prev, [id]: true }));
    alert(`Action Initiated: ${actionName}`);
  };

  const toggleLayer = (layerKey) => {
    setGisLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Tile layer URL getter based on mapStyle
  const getTileUrl = (style) => {
    if (style === 'Terrain') {
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
    if (style === 'Vectors') {
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
    // Heatmap / Default
    return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.65, 77.18],
        zoom: 9.2,
        zoomControl: false,
        attributionControl: false
      });

      const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
        maxZoom: 18,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(mapStyle));
    }
  }, [mapStyle]);

  // Update Layers & Markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 2. Render Heatmap circles if active
    if (gisLayers.heatmap) {
      // Upwind Airshed Heat Ring
      L.circle([29.20, 76.95], {
        radius: 35000,
        color: '#dc2626',
        fillColor: '#f59e0b',
        fillOpacity: 0.22,
        stroke: false
      }).addTo(layerGroup);

      // Delhi NCR Core Severe Trapping Zone
      L.circle([28.64, 77.25], {
        radius: 26000,
        color: '#881337',
        fillColor: '#dc2626',
        fillOpacity: 0.32,
        stroke: false
      }).addTo(layerGroup);
    }

    // 3. Render Station Geo-Pins if active
    if (gisLayers.pins) {
      hotspots.forEach(st => {
        const isSelected = selectedHotspot.includes(st.name.split(' ')[0]);

        let pinHtml = '';
        if (isSelected) {
          pinHtml = `
            <div class="flex items-center gap-2 cursor-pointer group">
              <div class="relative flex items-center justify-center">
                <span class="absolute w-8 h-8 rounded-full bg-rose-600/40 animate-ping"></span>
                <span class="w-4 h-4 rounded-full bg-purple-900 border-2 border-white shadow-lg ring-2 ring-purple-500/40"></span>
              </div>
              <div class="glass-surface px-3 py-1.5 rounded-xl shadow-md border border-purple-300 text-slate-900">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-extrabold text-slate-950">${st.label}</span>
                  <span class="text-[10px] font-mono font-black text-white bg-purple-900 px-1.5 py-0.5 rounded shadow-xs">${st.aqi} ${st.tag}</span>
                </div>
              </div>
            </div>
          `;
        } else {
          const colorClass = st.aqi > 400 ? 'bg-purple-900' : st.aqi > 350 ? 'bg-rose-600' : 'bg-amber-500';
          const textClass = st.aqi > 400 ? 'text-purple-900' : st.aqi > 350 ? 'text-rose-700' : 'text-amber-800';

          pinHtml = `
            <div class="flex items-center gap-1.5 cursor-pointer group">
              <div class="w-3.5 h-3.5 rounded-full ${colorClass} border-2 border-white shadow-md"></div>
              <div class="glass-surface px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 text-slate-900 group-hover:scale-105 transition">
                <span class="text-[10px] font-bold">${st.label} <strong class="${textClass} font-mono font-extrabold">${st.aqi}</strong></span>
              </div>
            </div>
          `;
        }

        const customIcon = L.divIcon({
          html: pinHtml,
          className: 'leaflet-custom-pin',
          iconSize: [160, 36],
          iconAnchor: [20, 18]
        });

        const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(layerGroup);
        marker.on('click', () => {
          setSelectedHotspot(st.name);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([st.lat, st.lng], { animate: true, duration: 0.8 });
          }
        });
      });
    }

  }, [gisLayers, selectedHotspot]);

  // Handle map zoom actions
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="bg-[#f3f6fb] text-slate-800 font-sans antialiased min-h-screen flex flex-col selection:bg-rose-600 selection:text-white">
      {/* BEGIN: NavigationBar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-4 lg:px-7 py-2.5 shadow-subtle">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
          {/* Brand & Live CPCB Status Indicator */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-rose-500 shadow-md ring-1 ring-slate-900/10 shrink-0">
                <i className="fa-solid fa-wind text-base"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-slate-950 font-sans leading-none">VAYU CONTROL</span>
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">Airshed GIS</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">Delhi NCR Regional Telemetry Command</p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Telemetry Sync Network Pill */}
            <div className="hidden md:flex items-center gap-2.5 text-xs font-mono text-emerald-700 bg-emerald-50/90 px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold tracking-tight">38/38 CPCB STATIONS LIVE</span>
            </div>

            {/* Live IST Clock with ping latency */}
            <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/70">
              <i className="fa-regular fa-clock text-slate-400"></i>
              <span className="font-bold text-slate-700">06:00:14 IST</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100/80 px-1 rounded">24ms</span>
            </div>
          </div>

          {/* Center Segmental Operational View Switcher */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 text-xs font-medium">
            {[
              { id: 'Live GIS Airshed', icon: 'fa-layer-group', color: 'text-rose-600' },
              { id: 'Plume Dispersion', icon: 'fa-fire-burner', color: 'text-amber-500' },
              { id: 'GRAP Action Center', icon: 'fa-shield-halved', color: 'text-indigo-600' },
              { id: 'Station Telemetry', icon: 'fa-chart-line', color: 'text-teal-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-white font-bold text-slate-950 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <i className={`fa-solid ${tab.icon} ${tab.color}`}></i>
                <span>{tab.id}</span>
              </button>
            ))}
          </nav>

          {/* Right Telemetry Metrics & Alert Status */}
          <div className="flex items-center gap-3">
            {/* Meteorological Quick-Stats Pill */}
            <div className="hidden 2xl:flex items-center gap-3 text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 shadow-xs">
              <div className="flex items-center gap-1.5" title="Surface Wind Speed & Direction">
                <i className="fa-solid fa-compass text-slate-400"></i>
                <span>NW <strong className="text-slate-900 font-bold">6.2</strong> km/h</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5" title="Surface Ambient Temperature">
                <i className="fa-solid fa-temperature-half text-slate-400"></i>
                <span className="font-bold text-slate-900">14.2°C</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5" title="Relative Humidity">
                <i className="fa-solid fa-droplet text-blue-500"></i>
                <span className="font-bold text-slate-900">78%</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5" title="Inversion Index Trapping Severity">
                <i className="fa-solid fa-smog text-amber-600"></i>
                <span className="text-rose-600 font-bold uppercase text-[10px]">Inv: High</span>
              </div>
            </div>

            {/* Hotspot Selector Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-xs font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 shadow-xs transition"
              >
                <i className="fa-solid fa-location-dot text-rose-500"></i>
                <span className="font-bold">{selectedHotspot}</span>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 ml-0.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  {hotspots.map((st) => (
                    <button
                      key={st.name}
                      onClick={() => {
                        setSelectedHotspot(st.name);
                        setIsDropdownOpen(false);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.panTo([st.lat, st.lng], { animate: true });
                        }
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        selectedHotspot === st.name ? 'bg-rose-50/50 font-bold text-rose-900' : 'text-slate-700'
                      }`}
                    >
                      <span>{st.name}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${st.tagBg}`}>{st.aqi}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* High-Impact Emergency Badge: GRAP Stage IV Active */}
            <div className="flex items-center gap-2 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-glow-danger tracking-wide border border-rose-500 ring-2 ring-rose-500/20 animate-pulse">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>GRAP STAGE IV ACTIVE</span>
            </div>
          </div>
        </div>
      </header>
      {/* END: NavigationBar */}

      {/* BEGIN: MainDashboardGrid */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* BEGIN: LeftColumn (Spatial Hotspots & Atmospheric Physics) */}
        <section className="lg:col-span-3 flex flex-col gap-3.5 order-2 lg:order-1">
          {/* Sector AQI Hotspots Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div>
              <div className={`flex items-center justify-between ${isLeaderboardOpen ? 'pb-3 mb-3 border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-map-pin text-rose-600 text-xs"></i>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Hotspot Leaderboard</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">7 ZONES MONITORED</span>
                  <button 
                    onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)} 
                    className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    title={isLeaderboardOpen ? "Collapse" : "Expand"}
                  >
                    <i className={`fa-solid ${isLeaderboardOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </button>
                </div>
              </div>

              {isLeaderboardOpen && (
                <>
                  {/* Composite Summary Bar */}
                  <div className="mb-3.5 p-3 bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 rounded-xl border border-rose-200/80 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[11px] font-bold text-rose-900 block tracking-tight">Delhi NCR Airshed Composite</span>
                      <span className="text-[11px] text-rose-700/90 font-medium">38 CAQM Telemetry stations avg</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-rose-700 leading-none">387</span>
                      <span className="block text-[9px] font-extrabold text-rose-800 uppercase tracking-widest mt-0.5">SEVERE</span>
                    </div>
                  </div>

                  {/* Hotspot Leaderboard Items */}
                  <div className="space-y-2">
                {hotspots.map((st, idx) => {
                  const isSelected = selectedHotspot.includes(st.name.split(' ')[0]);
                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedHotspot(st.name);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.panTo([st.lat, st.lng], { animate: true });
                        }
                      }}
                      className={`group p-2.5 rounded-xl border transition cursor-pointer ${
                        isSelected 
                          ? 'border-rose-300 bg-rose-50/60 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div>
                          <span className={`font-bold ${isSelected ? 'text-rose-950' : 'text-slate-800 group-hover:text-rose-700'}`}>{st.name}</span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">{st.location}</span>
                        </div>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${st.tagBg}`}>
                          {st.aqi} {st.tag}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`bg-gradient-to-r ${st.barGrad} h-full rounded-full`} style={{ width: st.width }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </>
              )}
            </div>

            {/* Map Layer Toggles */}
            {isLeaderboardOpen && (
              <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GIS Layer Controls</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Object.values(gisLayers).filter(Boolean).length} Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-100 transition select-none">
                  <input 
                    type="checkbox"
                    checked={gisLayers.heatmap} 
                    onChange={() => toggleLayer('heatmap')}
                    className="rounded text-rose-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">AQI Heatmap</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-100 transition select-none">
                  <input 
                    type="checkbox"
                    checked={gisLayers.wind} 
                    onChange={() => toggleLayer('wind')}
                    className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">Wind Vectors</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-100 transition select-none">
                  <input 
                    type="checkbox"
                    checked={gisLayers.pins} 
                    onChange={() => toggleLayer('pins')}
                    className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">Sensor Telemetry</span>
                </label>
              </div>
            </div>
            )}
          </div>

          {/* Atmospheric Physics & Ventilation Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-atom text-slate-500 text-xs"></i>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Atmospheric Physics</h2>
              </div>
              <span className="text-[9px] font-mono uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold border border-amber-200/80">Thermal Inversion</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Mixing Depth Metric */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Mixing Depth</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-slate-900">320</span>
                  <span className="text-xs font-mono text-slate-500">meters</span>
                </div>
                <span className="text-[10px] font-bold text-rose-600 mt-0.5 flex items-center gap-1">
                  <i className="fa-solid fa-arrow-down text-[8px]"></i> Severe Trapping
                </span>
              </div>

              {/* Ventilation Index */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Ventilation Index</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-slate-900">1,984</span>
                  <span className="text-xs font-mono text-slate-500">m²/s</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 mt-0.5 flex items-center gap-1">
                  <i className="fa-solid fa-triangle-exclamation text-[8px]"></i> Poor Clearance (&lt;6000)
                </span>
              </div>
            </div>

            {/* Thermal Inversion Alert Window */}
            <div className="mt-3 bg-amber-50/80 rounded-xl p-2.5 border border-amber-200/70 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-temperature-arrow-up text-sm"></i>
              </div>
              <div className="text-[11px] leading-snug">
                <span className="font-bold text-amber-950 block">Inversion Trapping Window: 03:30 - 09:00 IST</span>
                <span className="text-amber-800/85">Colder surface air locked beneath warm lid; stagnation index at 9.4/10.</span>
              </div>
            </div>
          </div>
        </section>
        {/* END: LeftColumn */}

        {/* BEGIN: Centerpiece Leaflet Map */}
        <section className="lg:col-span-6 flex flex-col gap-3 order-1 lg:order-2">
          {/* Interactive Leaflet Map Container */}
          <div className="relative bg-[#f8fafc] rounded-3xl overflow-hidden border border-slate-200/90 shadow-subtle min-h-[520px] lg:min-h-[610px] flex-1 flex flex-col justify-between select-none">
            {/* Real Interactive Leaflet Canvas */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

            {/* Top Floating Controls Overlay */}
            <div className="relative z-20 p-3.5 flex flex-wrap items-center justify-between gap-2.5 pointer-events-auto">
              {/* Airshed Influx Badge */}
              <div className="glass-surface text-slate-900 px-3.5 py-2 rounded-xl border border-rose-200/90 shadow-subtle flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-sans">Regional Airshed Dispersion Zone</span>
                    <span className="text-[9px] font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold border border-rose-200">360° OMNIDIRECTIONAL</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                    Multi-Directional Wind Influx: <span className="font-bold text-rose-700">Red Airshed Boundary Active</span>
                  </p>
                </div>
              </div>

              {/* Controls: Style Toggle + Time Slider Pills + Zoom */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Map Style Toggle */}
                <div className="glass-surface p-1 rounded-xl border border-slate-200/90 shadow-xs flex items-center text-[11px] font-mono font-semibold text-slate-600">
                  {['Heatmap'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setMapStyle(st)}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        mapStyle === st 
                          ? 'bg-slate-900 text-white font-bold shadow-xs' 
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Time Horizon Pills */}
                <div className="glass-surface p-1 rounded-xl border border-slate-200/90 shadow-xs flex items-center text-xs font-mono font-medium text-slate-600">
                  {['Live Now', '+6h', '+12h', '+24h', '+48h', '+72h'].map((th) => (
                    <button
                      key={th}
                      onClick={() => setTimeHorizon(th)}
                      className={`px-2 py-1 rounded-lg transition ${
                        timeHorizon === th
                          ? 'bg-rose-600 text-white font-bold shadow-xs'
                          : 'hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {th}
                    </button>
                  ))}
                </div>

                {/* Zoom In / Out Buttons */}
                <div className="glass-surface p-1 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-0.5">
                  <button 
                    onClick={handleZoomIn}
                    className="w-7 h-7 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm transition" 
                    title="Zoom in"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                  </button>
                  <button 
                    onClick={handleZoomOut}
                    className="w-7 h-7 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm transition" 
                    title="Zoom out"
                  >
                    <i className="fa-solid fa-minus text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Floating NAQI Spectrum Bar with Active Marker */}
            <div className="relative z-20 p-3.5 pt-0 pointer-events-auto">
              <div className="glass-surface p-2.5 rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600 mb-1.5 px-1 flex-wrap gap-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>0-50 Good</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>51-100 Satisfactory</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span>101-200 Moderate</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>201-300 Poor</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"></span>301-400 Very Poor</span>
                  <span className="flex items-center gap-1 text-purple-950 font-black"><span className="w-2 h-2 rounded-full bg-purple-900"></span>401-500+ Severe/Hazardous</span>
                </div>
                {/* Colored spectrum bar with marker pointer */}
                <div className="relative">
                  <div className="w-full h-2.5 rounded-full overflow-hidden flex shadow-inner">
                    <div className="h-full flex-1 bg-emerald-500"></div>
                    <div className="h-full flex-1 bg-emerald-400"></div>
                    <div className="h-full flex-1 bg-amber-400"></div>
                    <div className="h-full flex-1 bg-orange-500"></div>
                    <div className="h-full flex-1 bg-red-600"></div>
                    <div className="h-full flex-1 bg-purple-900"></div>
                  </div>
                  {/* Current Delhi Avg Pinpoint Marker (387 / 500 = 77.4%) */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none" style={{ left: '77.4%' }}>
                    <div className="w-3.5 h-3.5 bg-white border-2 border-red-700 rounded-full shadow-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Bottom Operational Status Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Ribbon Metric 1: Airshed Inversion */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <i className="fa-solid fa-gauge-high text-base"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider font-mono">Airshed Inversion</span>
                <span className="text-xs font-extrabold text-slate-900">Ground Inversion Active</span>
                <span className="text-[10px] text-rose-600 font-medium block leading-tight">Stable lapse rate trapping</span>
              </div>
            </div>

            {/* Ribbon Metric 2: Plume Transport Speed */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <i className="fa-solid fa-wind text-base"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider font-mono">Plume Speed</span>
                <span className="text-xs font-extrabold text-slate-900">2.1 km/h (Omnidirectional)</span>
                <span className="text-[10px] text-amber-700 font-medium block leading-tight">Low advection clearance</span>
              </div>
            </div>

            {/* Ribbon Metric 3: Telemetry Network Health */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <i className="fa-solid fa-satellite-dish text-base"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider font-mono">Telemetry Health</span>
                <span className="text-xs font-extrabold text-emerald-700">98.4% Live Uptime</span>
                <span className="text-[10px] text-slate-400 font-medium block leading-tight">38 sensors transmitting</span>
              </div>
            </div>
          </div>
        </section>
        {/* END: CenterHeroMap */}

        {/* BEGIN: RightColumn (Visual Telemetry & Action Center) */}
        <section className="lg:col-span-3 flex flex-col gap-3.5 order-3">
                    {/* Regional AQI Hero Gauge Card */}
          <div onClick={() => setIsAqiModalOpen(true)} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle cursor-pointer hover:shadow-md hover:border-rose-300 transition group relative">
              <div className="absolute top-3 right-3 text-slate-300 group-hover:text-rose-500 transition"><i className="fa-solid fa-expand"></i></div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-circle-nodes text-rose-500 text-xs"></i>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Regional AQI Metric</span>
              </div>
              <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-100">CPCB REALTIME</span>
            </div>
            <div className="flex items-center justify-between mt-2 gap-3">
              {/* Circular Radial Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.6"></path>
                  <path className="text-red-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="77.4, 100" strokeLinecap="round" strokeWidth="3.6"></path>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-mono text-slate-900 tracking-tight leading-none">387</span>
                  <span className="text-[9px] font-extrabold text-red-700 uppercase mt-0.5 tracking-wider">SEVERE</span>
                </div>
              </div>
              {/* Gauge Context Callout */}
              <div className="flex-1 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">Peak Hotspot</span>
                  <p className="text-xs font-extrabold text-slate-900">Anand Vihar (452)</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">Advisory Status</span>
                  <div className="bg-rose-50 border border-rose-200/80 p-1.5 rounded-lg">
                    <p className="text-[10px] font-semibold text-rose-800 leading-tight">
                      Emergency Protocol: Restrict all BS-III/IV diesel vehicles & suspend primary schools.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chemical Speciation Bars */}
          <div onClick={() => setIsAqiModalOpen(true)} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle cursor-pointer hover:shadow-md hover:border-rose-300 transition group relative">
            <div className="absolute top-3 right-3 text-slate-300 group-hover:text-rose-500 transition"><i className="fa-solid fa-expand"></i></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-flask-vial text-slate-400 text-xs"></i>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Chemical Speciation</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">24h Rolling Mean</span>
            </div>
            <div className="space-y-3">
              {/* PM 2.5 */}
              <div>
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">PM 2.5</span>
                    <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-800 px-1 py-0.2 rounded">5.2x limit</span>
                  </div>
                  <span className="font-mono font-bold text-rose-700">312 <span className="text-[10px] text-slate-400 font-normal">/ 60 µg/m³</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              {/* PM 10 */}
              <div>
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">PM 10</span>
                    <span className="text-[9px] font-mono font-bold bg-red-100 text-red-800 px-1 py-0.2 rounded">4.1x limit</span>
                  </div>
                  <span className="font-mono font-bold text-red-700">410 <span className="text-[10px] text-slate-400 font-normal">/ 100 µg/m³</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-700 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              {/* NO2 */}
              <div>
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">NO₂</span>
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">0.8x limit</span>
                  </div>
                  <span className="font-mono font-bold text-amber-600">68 <span className="text-[10px] text-slate-400 font-normal">/ 80 µg/m³</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              {/* Carbon Monoxide (CO) */}
              <div>
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">CO</span>
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">1.4x limit</span>
                  </div>
                  <span className="font-mono font-bold text-amber-700">2.8 <span className="text-[10px] text-slate-400 font-normal">/ 2.0 mg/m³</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 72h Predictive Trajectory Histogram Chart */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-chart-simple text-slate-400 text-xs"></i>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">72h Predictive Trajectory</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">WRF-Chem Model</span>
            </div>
            {/* Color-Graded Forecast Histogram Columns */}
            <div className="flex items-end justify-between h-24 pt-4 px-1 gap-2 border-b border-slate-100">
              {/* Col 1: Now */}
              <div className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                <span className="text-[10px] font-mono font-bold text-red-700 mb-1 opacity-0 group-hover:opacity-100 transition">387</span>
                <div className="w-full bg-red-700 rounded-t-md transition-all group-hover:brightness-110" style={{ height: '82%' }}></div>
                <span className="text-[10px] font-mono font-bold text-slate-600 mt-2">Now</span>
              </div>
              {/* Col 2: +12h */}
              <div className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                <span className="text-[10px] font-mono font-bold text-purple-900 mb-1 opacity-0 group-hover:opacity-100 transition">415</span>
                <div className="w-full bg-purple-900 rounded-t-md transition-all group-hover:brightness-110" style={{ height: '94%' }}></div>
                <span className="text-[10px] font-mono text-slate-400 mt-2">+12h</span>
              </div>
              {/* Col 3: +24h */}
              <div className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                <span className="text-[10px] font-mono font-bold text-red-700 mb-1 opacity-0 group-hover:opacity-100 transition">390</span>
                <div className="w-full bg-red-600 rounded-t-md transition-all group-hover:brightness-110" style={{ height: '84%' }}></div>
                <span className="text-[10px] font-mono text-slate-400 mt-2">+24h</span>
              </div>
              {/* Col 4: +36h */}
              <div className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                <span className="text-[10px] font-mono font-bold text-orange-600 mb-1 opacity-0 group-hover:opacity-100 transition">310</span>
                <div className="w-full bg-orange-500 rounded-t-md transition-all group-hover:brightness-110" style={{ height: '60%' }}></div>
                <span className="text-[10px] font-mono text-slate-400 mt-2">+36h</span>
              </div>
              {/* Col 5: +48h (Relief Begins) */}
              <div className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                <span className="text-[10px] font-mono font-bold text-amber-600 mb-1 opacity-0 group-hover:opacity-100 transition">240</span>
                <div className="w-full bg-amber-400 rounded-t-md transition-all group-hover:brightness-110" style={{ height: '48%' }}></div>
                <span className="text-[10px] font-mono text-slate-400 mt-2">+48h</span>
              </div>
              {/* Col 6: +72h (Clearance) */}
              <div className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                <span className="text-[10px] font-mono font-bold text-emerald-600 mb-1 opacity-0 group-hover:opacity-100 transition">190</span>
                <div className="w-full bg-emerald-500 rounded-t-md transition-all group-hover:brightness-110" style={{ height: '36%' }}></div>
                <span className="text-[10px] font-mono text-slate-400 mt-2">+72h</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
              <i className="fa-solid fa-cloud-bolt text-indigo-400 mr-1"></i>Western disturbance shear expected Fri afternoon (+48h) to clear inversion.
            </p>
          </div>

          {/* Immediate Enforcement Actions */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-bolt text-rose-600 text-xs"></i>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Immediate Interventions</h2>
              </div>
              <span className="text-[10px] font-mono text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">4 Flagged</span>
            </div>
            <div className="space-y-2">
              {/* Action 1: Anand Vihar ISBT */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">1</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Anand Vihar ISBT</span>
                    <span className="text-[10px] text-slate-400 font-medium">Anti-smog mobile saturation</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleAction(1, 'Deploy Smog Guns to Anand Vihar')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs ${
                    actionsTriggered[1] ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-rose-600'
                  }`}
                >
                  {actionsTriggered[1] ? 'Squad Dispatched' : 'Deploy Smog Guns'}
                </button>
              </div>

              {/* Action 2: Patparganj Depot */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">2</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Patparganj Depot</span>
                    <span className="text-[10px] text-slate-400 font-medium">Heavy diesel truck cordon</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleAction(2, 'Reroute Diesel Trucks at Patparganj')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs ${
                    actionsTriggered[2] ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {actionsTriggered[2] ? 'Traffic Rerouted' : 'Reroute Trucks'}
                </button>
              </div>

              {/* Action 3: Bawana Industrial */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">3</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Bawana Industrial</span>
                    <span className="text-[10px] text-slate-400 font-medium">Approved fuel compliance audit</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleAction(3, 'Squad Compliance Audit at Bawana')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs ${
                    actionsTriggered[3] ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {actionsTriggered[3] ? 'Audit Active' : 'Squad Audit'}
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* END: RightColumn */}
      </main>
      {/* END: MainDashboardGrid */}

      {/* BEGIN: MinimalFooter */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-5 py-2.5 text-slate-500 text-xs flex flex-wrap items-center justify-between gap-2 shadow-subtle">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <i className="fa-solid fa-shield-halved text-rose-600"></i> Commission for Air Quality Management (CAQM) Airshed System
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-[11px]">CPCB Telemetry Feed v4.2.8</span>
        </div>
        <div className="font-mono text-[11px]">
          Last Telemetry Sync: <span className="text-slate-800 font-bold">06:00 IST</span> (24ms mesh latency | Continuous WRF-Chem Reanalysis)
        </div>
      </footer>
      {/* END: MinimalFooter */}
    
      {/* AQI & Chemical Detail Modal */}
      {isAqiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAqiModalOpen(false)}>
          <div 
            className="bg-[#f3f6fb] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white z-10 shrink-0">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-microscope text-rose-600"></i>
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-sm">Detailed AQI & Chemical Speciation</h3>
              </div>
              <button 
                onClick={() => setIsAqiModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex flex-col gap-5 items-stretch">
                 {/* Regional AQI Hero Gauge Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-circle-nodes text-rose-500 text-xs"></i>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Regional AQI Metric</span>
              </div>
              <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-100">CPCB REALTIME</span>
            </div>
            <div className="flex items-center justify-between mt-2 gap-3">
              {/* Circular Radial Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.6"></path>
                  <path className="text-red-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="77.4, 100" strokeLinecap="round" strokeWidth="3.6"></path>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-mono text-slate-900 tracking-tight leading-none">387</span>
                  <span className="text-[9px] font-extrabold text-red-700 uppercase mt-0.5 tracking-wider">SEVERE</span>
                </div>
              </div>
              {/* Gauge Context Callout */}
              <div className="flex-1 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">Peak Hotspot</span>
                  <p className="text-xs font-extrabold text-slate-900">Anand Vihar (452)</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">Advisory Status</span>
                  <div className="bg-rose-50 border border-rose-200/80 p-1.5 rounded-lg">
                    <p className="text-[10px] font-semibold text-rose-800 leading-tight">
                      Emergency Protocol: Restrict all BS-III/IV diesel vehicles & suspend primary schools.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chemical Speciation Bars */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-flask-vial text-slate-400 text-xs"></i>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Chemical Speciation</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">24h Rolling Mean</span>
            </div>
            <div className="space-y-3">
              {/* PM 2.5 */}
              <div>
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">PM 2.5</span>
                    <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-800 px-1 py-0.2 rounded">5.2x limit</span>
                  </div>
                  <span className="font-mono font-bold text-rose-700">312 <span className="text-[10px] text-slate-400 font-normal">/ 60 µg/m³</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              {/* PM 10 */}
              <div>
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">PM 10</span>
                    <span className="text-[9px] font-mono font-bold bg-red-100 text-red-800 px-1 py-0.2 rounded">4.1x limit</span>
                  </div>
                  <span className="font-mono font-bold text-red-700">410 <span className="text-[10px] text-slate-400 font-normal">/ 100 µg/m³</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-700 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              {/* NO2 */}
              <div>
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">NO₂</span>
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">0.8x limit</span>
                  </div>
                  <span className="font-mono font-bold text-amber-600">68 <span className="text-[10px] text-slate-400 font-normal">/ 80 µg/m³</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              {/* Carbon Monoxide (CO) */}
              <div>
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">CO</span>
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">1.4x limit</span>
                  </div>
                  <span className="font-mono font-bold text-amber-700">2.8 <span className="text-[10px] text-slate-400 font-normal">/ 2.0 mg/m³</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>

          
            </div>
          </div>
        </div>
      )}
</div>
  );
}
