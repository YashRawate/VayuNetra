import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function VayuCommandDashboard() {
  const [activeTab, setActiveTab] = useState("Live GIS Airshed");
  const [selectedHotspot, setSelectedHotspot] = useState("Anand Vihar & East");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState("Heatmap");
  const [timeHorizon, setTimeHorizon] = useState("Live Now");
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
    {
      name: "Anand Vihar & East",
      label: "Anand Vihar",
      location: "ISBT, Trans-Yamuna Basin",
      aqi: 452,
      tag: "HAZ",
      tagBg: "bg-purple-900 text-white",
      width: "90.4%",
      barGrad: "from-rose-600 to-purple-900",
      lat: 28.6469,
      lng: 77.316,
    },
    {
      name: "Jahangirpuri & North Corridor",
      label: "Jahangirpuri",
      location: "GT Karnal Highway axis",
      aqi: 410,
      tag: "SEV+",
      tagBg: "bg-rose-100 text-rose-800",
      width: "82%",
      barGrad: "from-rose-600 to-rose-700",
      lat: 28.7325,
      lng: 77.1706,
    },
    {
      name: "ITO & Central Core",
      label: "ITO",
      location: "Urban arterial intersection",
      aqi: 387,
      tag: "SEV",
      tagBg: "bg-rose-100 text-rose-700",
      width: "77.4%",
      barGrad: "from-rose-500 to-red-600",
      lat: 28.6317,
      lng: 77.241,
    },
    {
      name: "Sector 62, Noida",
      label: "Noida 62",
      location: "Eastern border commercial zone",
      aqi: 378,
      tag: "SEV",
      tagBg: "bg-rose-100 text-rose-700",
      width: "75.6%",
      barGrad: "from-rose-500 to-red-600",
      lat: 28.6245,
      lng: 77.3649,
    },
    {
      name: "Cyber City, Gurugram",
      label: "Gurugram Cyber Hub",
      location: "NH-48 Southwestern gateway",
      aqi: 362,
      tag: "V.POOR",
      tagBg: "bg-orange-100 text-orange-700",
      width: "72.4%",
      barGrad: "from-amber-500 to-orange-500",
      lat: 28.4952,
      lng: 77.0895,
    },
    {
      name: "Karnal Upwind Gateway",
      label: "Karnal Entry",
      location: "Agricultural inflow boundary",
      aqi: 298,
      tag: "POOR",
      tagBg: "bg-amber-100 text-amber-700",
      width: "59.6%",
      barGrad: "from-amber-400 to-amber-500",
      lat: 29.6857,
      lng: 76.9905,
    },
  ];

  // ── Derived data for selected hotspot ──
  const activeHotspot =
    hotspots.find((h) => selectedHotspot.includes(h.name.split(" ")[0])) ||
    hotspots[0];

  const getAdvisory = (tag) => {
    if (tag === "HAZ")
      return "Emergency Protocol: Restrict all BS-III/IV diesel vehicles & suspend primary schools. GRAP Stage IV enforced.";
    if (tag === "SEV+")
      return "GRAP Stage III Active: Heavy vehicle restrictions & mandatory 50% WFH for govt. employees.";
    if (tag === "SEV")
      return "GRAP Stage III: Diesel gen-sets banned, construction restricted, schools on advisory.";
    if (tag === "V.POOR")
      return "GRAP Stage II: Mechanised road sweeping intensified. Outdoor exercise advisory issued.";
    return "GRAP Stage I: Preventive measures in place. Monitor AQI regularly.";
  };

  const getGaugeColor = (tag) => {
    if (tag === "HAZ") return "#7c2d12";
    if (tag === "SEV+") return "#991b1b";
    if (tag === "SEV") return "#b91c1c";
    if (tag === "V.POOR") return "#d97706";
    return "#b45309";
  };

  const getAdvisoryTags = (tag) => {
    if (tag === "HAZ")
      return ["BS-IV Diesel Ban", "School Closure", "Construction Halt"];
    if (tag === "SEV+")
      return ["Heavy Vehicle Ban", "WFH Advisory", "Dust Control"];
    if (tag === "SEV")
      return ["Diesel Gen-set Ban", "Construction Curb", "Health Advisory"];
    if (tag === "V.POOR")
      return ["Road Sweeping", "AQI Monitoring", "Outdoor Advisory"];
    return ["Preventive Measures", "AQI Monitoring"];
  };

  // Scaled pollution values from AQI
  const hs = activeHotspot;
  const pm25Val = Math.round(hs.aqi * 0.69);
  const pm10Val = Math.round(hs.aqi * 0.91);
  const no2Val = Math.round(hs.aqi * 0.15);
  const coVal = (hs.aqi * 0.0062).toFixed(1);
  const so2Val = Math.round(hs.aqi * 0.027);
  const pm25Pct = Math.min(96, Math.round((pm25Val / 320) * 100));
  const pm10Pct = Math.min(96, Math.round((pm10Val / 430) * 100));
  const no2Pct = Math.min(96, Math.round((no2Val / 80) * 100));
  const coPct = Math.min(96, Math.round((parseFloat(coVal) / 2.8) * 100));
  const so2Pct = Math.min(96, Math.round((so2Val / 15) * 100));
  const gaugeArc = ((hs.aqi / 500) * 100).toFixed(1);

  // Action Items State
  const [actionsTriggered, setActionsTriggered] = useState({});
  const [toasts, setToasts] = useState([]);

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleAction = (id, actionName) => {
    // Toggle logic so they can click again to undo
    setActionsTriggered((prev) => {
      const isNowActive = !prev[id];
      addToast(
        isNowActive
          ? `✅ Activated: ${actionName}`
          : `🛑 Revoked: ${actionName}`,
      );
      return { ...prev, [id]: isNowActive };
    });
  };

  const toggleLayer = (layerKey) => {
    setGisLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Tile layer URL getter based on mapStyle
  const getTileUrl = (style) => {
    if (style === "Terrain") {
      return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    }
    if (style === "Vectors") {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
    // Heatmap / Default
    return "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.65, 77.18],
        zoom: 9.2,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
        maxZoom: 18,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }
  }, []); // Only run once on mount

  // Invalidate map size when switching back to Live GIS tab
  useEffect(() => {
    if (activeTab === "Live GIS Airshed" && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, [activeTab]);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(mapStyle));
    }
  }, [mapStyle, activeTab]);

  // Update Layers & Markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 2. Render Heatmap circles if active
    if (gisLayers.heatmap) {
      // Upwind Airshed Heat Ring
      L.circle([29.2, 76.95], {
        radius: 35000,
        color: "#dc2626",
        fillColor: "#f59e0b",
        fillOpacity: 0.22,
        stroke: false,
      }).addTo(layerGroup);

      // Delhi NCR Core Severe Trapping Zone
      L.circle([28.64, 77.25], {
        radius: 26000,
        color: "#881337",
        fillColor: "#dc2626",
        fillOpacity: 0.32,
        stroke: false,
      }).addTo(layerGroup);
    }

    // 3. Render Station Geo-Pins if active
    if (gisLayers.pins) {
      hotspots.forEach((st) => {
        const isSelected = selectedHotspot.includes(st.name.split(" ")[0]);

        let pinHtml = "";
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
          const colorClass =
            st.aqi > 400
              ? "bg-purple-900"
              : st.aqi > 350
                ? "bg-rose-600"
                : "bg-amber-500";
          const textClass =
            st.aqi > 400
              ? "text-purple-900"
              : st.aqi > 350
                ? "text-rose-700"
                : "text-amber-800";

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
          className: "leaflet-custom-pin",
          iconSize: [160, 36],
          iconAnchor: [20, 18],
        });

        const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(
          layerGroup,
        );
        marker.on("click", () => {
          setSelectedHotspot(st.name);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([st.lat, st.lng], {
              animate: true,
              duration: 0.8,
            });
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
                  <span className="text-base font-extrabold tracking-tight text-slate-950 font-sans leading-none">
                    VAYU CONTROL
                  </span>
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    Airshed GIS
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                  Delhi NCR Regional Telemetry Command
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Telemetry Sync Network Pill */}
            <div className="hidden md:flex items-center gap-2.5 text-xs font-mono text-emerald-700 bg-emerald-50/90 px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold tracking-tight">
                38/38 CPCB STATIONS LIVE
              </span>
            </div>

            {/* Live IST Clock with ping latency */}
            <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/70">
              <i className="fa-regular fa-clock text-slate-400"></i>
              <span className="font-bold text-slate-700">06:00:14 IST</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100/80 px-1 rounded">
                24ms
              </span>
            </div>
          </div>

          {/* Center Segmental Operational View Switcher */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 text-xs font-medium">
            {[
              {
                id: "Live GIS Airshed",
                icon: "fa-layer-group",
                color: "text-rose-600",
              },
              {
                id: "Plume Dispersion",
                icon: "fa-fire-burner",
                color: "text-amber-500",
              },
              {
                id: "GRAP Action Center",
                icon: "fa-shield-halved",
                color: "text-indigo-600",
              },
              {
                id: "Station Telemetry",
                icon: "fa-chart-line",
                color: "text-teal-600",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                  activeTab === tab.id
                    ? "bg-white font-bold text-slate-950 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
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
              <div
                className="flex items-center gap-1.5"
                title="Surface Wind Speed & Direction"
              >
                <i className="fa-solid fa-compass text-slate-400"></i>
                <span>
                  NW <strong className="text-slate-900 font-bold">6.2</strong>{" "}
                  km/h
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div
                className="flex items-center gap-1.5"
                title="Surface Ambient Temperature"
              >
                <i className="fa-solid fa-temperature-half text-slate-400"></i>
                <span className="font-bold text-slate-900">14.2°C</span>
              </div>
              <span className="text-slate-300">|</span>
              <div
                className="flex items-center gap-1.5"
                title="Relative Humidity"
              >
                <i className="fa-solid fa-droplet text-blue-500"></i>
                <span className="font-bold text-slate-900">78%</span>
              </div>
              <span className="text-slate-300">|</span>
              <div
                className="flex items-center gap-1.5"
                title="Inversion Index Trapping Severity"
              >
                <i className="fa-solid fa-smog text-amber-600"></i>
                <span className="text-rose-600 font-bold uppercase text-[10px]">
                  Inv: High
                </span>
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
                <i
                  className={`fa-solid fa-chevron-down text-[10px] text-slate-400 ml-0.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                ></i>
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
                          mapInstanceRef.current.panTo([st.lat, st.lng], {
                            animate: true,
                          });
                        }
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        selectedHotspot === st.name
                          ? "bg-rose-50/50 font-bold text-rose-900"
                          : "text-slate-700"
                      }`}
                    >
                      <span>{st.name}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${st.tagBg}`}
                      >
                        {st.aqi}
                      </span>
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

      <div
        style={{
          display: activeTab === "Live GIS Airshed" ? "flex" : "none",
          flex: 1,
          width: "100%",
          flexDirection: "column",
        }}
      >
        {/* BEGIN: MainDashboardGrid */}
        <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* BEGIN: LeftColumn (Spatial Hotspots & Atmospheric Physics) */}
          <section className="lg:col-span-3 flex flex-col gap-3.5 order-2 lg:order-1">
            {/* Sector AQI Hotspots Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex flex-col justify-between">
              <div
                className={`flex items-center justify-between ${isLeaderboardOpen ? "pb-3 mb-3 border-b border-slate-100" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-map-pin text-rose-600 text-xs"></i>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Hotspot Leaderboard
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                    7 ZONES MONITORED
                  </span>
                  <button
                    onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    title={isLeaderboardOpen ? "Collapse" : "Expand"}
                  >
                    <i
                      className={`fa-solid ${isLeaderboardOpen ? "fa-chevron-up" : "fa-chevron-down"}`}
                    ></i>
                  </button>
                </div>
              </div>

              {isLeaderboardOpen && (
                <>
                  {/* Composite Summary Bar */}
                  <div className="mb-3.5 p-3 bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 rounded-xl border border-rose-200/80 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[11px] font-bold text-rose-900 block tracking-tight">
                        Delhi NCR Airshed Composite
                      </span>
                      <span className="text-[11px] text-rose-700/90 font-medium">
                        38 CAQM Telemetry stations avg
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-rose-700 leading-none">
                        {activeHotspot.aqi}
                      </span>
                      <span className="block text-[9px] font-extrabold text-rose-800 uppercase tracking-widest mt-0.5">
                        {activeHotspot.tag}
                      </span>
                    </div>
                  </div>

                  {/* Hotspot Leaderboard Items */}
                  <div className="space-y-2">
                    {hotspots.map((st, idx) => {
                      const isSelected = selectedHotspot.includes(
                        st.name.split(" ")[0],
                      );
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedHotspot(st.name)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer group ${
                            isSelected
                              ? "bg-rose-50 border-rose-300 shadow-sm"
                              : "bg-slate-50 border-slate-200/80 hover:bg-white hover:border-rose-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition">
                                  {st.label}
                                </span>
                                {isSelected && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                                {st.location}
                              </span>
                            </div>
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${st.tagBg}`}
                            >
                              {st.aqi} {st.tag}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`bg-gradient-to-r ${st.barGrad} h-full rounded-full`}
                              style={{ width: st.width }}
                            ></div>
                          </div>

                          {/* Toast Notifications */}
                          <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                            {toasts.map((toast) => (
                              <div
                                key={toast.id}
                                className="bg-slate-900/90 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-auto backdrop-blur-md border border-slate-700/50"
                              >
                                <span className="text-sm font-semibold tracking-wide">
                                  {toast.message}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Map Layer Toggles */}
              {isLeaderboardOpen && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      GIS Layer Controls
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {Object.values(gisLayers).filter(Boolean).length} Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-100 transition select-none">
                      <input
                        type="checkbox"
                        checked={gisLayers.heatmap}
                        onChange={() => toggleLayer("heatmap")}
                        className="rounded text-rose-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">
                        AQI Heatmap
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-100 transition select-none">
                      <input
                        type="checkbox"
                        checked={gisLayers.wind}
                        onChange={() => toggleLayer("wind")}
                        className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">
                        Wind Vectors
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-100 transition select-none">
                      <input
                        type="checkbox"
                        checked={gisLayers.pins}
                        onChange={() => toggleLayer("pins")}
                        className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">
                        Sensor Telemetry
                      </span>
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
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Atmospheric Physics
                  </h2>
                </div>
                <span className="text-[9px] font-mono uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold border border-amber-200/80">
                  Thermal Inversion
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Mixing Depth Metric */}
                <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                    Mixing Depth
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black font-mono text-slate-900">
                      320
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      meters
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 mt-0.5 flex items-center gap-1">
                    <i className="fa-solid fa-arrow-down text-[8px]"></i> Severe
                    Trapping
                  </span>
                </div>

                {/* Ventilation Index */}
                <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                    Ventilation Index
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black font-mono text-slate-900">
                      1,984
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      m²/s
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 mt-0.5 flex items-center gap-1">
                    <i className="fa-solid fa-triangle-exclamation text-[8px]"></i>{" "}
                    Poor Clearance (&lt;6000)
                  </span>
                </div>
              </div>

              {/* Thermal Inversion Alert Window */}
              <div className="mt-3 bg-amber-50/80 rounded-xl p-2.5 border border-amber-200/70 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-temperature-arrow-up text-sm"></i>
                </div>
                <div className="text-[11px] leading-snug">
                  <span className="font-bold text-amber-950 block">
                    Inversion Trapping Window: 03:30 - 09:00 IST
                  </span>
                  <span className="text-amber-800/85">
                    Colder surface air locked beneath warm lid; stagnation index
                    at 9.4/10.
                  </span>
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
              <div
                ref={mapContainerRef}
                className="absolute inset-0 w-full h-full z-0"
              />

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
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-sans">
                        Regional Airshed Dispersion Zone
                      </span>
                      <span className="text-[9px] font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold border border-rose-200">
                        360° OMNIDIRECTIONAL
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                      Multi-Directional Wind Influx:{" "}
                      <span className="font-bold text-rose-700">
                        Red Airshed Boundary Active
                      </span>
                    </p>
                  </div>
                </div>

                {/* Controls: Style Toggle + Time Slider Pills + Zoom */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Map Style Toggle */}
                  <div className="glass-surface p-1 rounded-xl border border-slate-200/90 shadow-xs flex items-center text-[11px] font-mono font-semibold text-slate-600">
                    {["Heatmap"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setMapStyle(st)}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          mapStyle === st
                            ? "bg-slate-900 text-white font-bold shadow-xs"
                            : "hover:text-slate-900"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Time Horizon Pills */}
                  <div className="glass-surface p-1 rounded-xl border border-slate-200/90 shadow-xs flex items-center text-xs font-mono font-medium text-slate-600">
                    {["Live Now", "+6h", "+12h", "+24h", "+48h", "+72h"].map(
                      (th) => (
                        <button
                          key={th}
                          onClick={() => setTimeHorizon(th)}
                          className={`px-2 py-1 rounded-lg transition ${
                            timeHorizon === th
                              ? "bg-rose-600 text-white font-bold shadow-xs"
                              : "hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          {th}
                        </button>
                      ),
                    )}
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
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      0-50 Good
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      51-100 Satisfactory
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      101-200 Moderate
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      201-300 Poor
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      301-400 Very Poor
                    </span>
                    <span className="flex items-center gap-1 text-purple-950 font-black">
                      <span className="w-2 h-2 rounded-full bg-purple-900"></span>
                      401-500+ Severe/Hazardous
                    </span>
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
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                      style={{ left: "77.4%" }}
                    >
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
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider font-mono">
                    Airshed Inversion
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    Ground Inversion Active
                  </span>
                  <span className="text-[10px] text-rose-600 font-medium block leading-tight">
                    Stable lapse rate trapping
                  </span>
                </div>
              </div>

              {/* Ribbon Metric 2: Plume Transport Speed */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <i className="fa-solid fa-wind text-base"></i>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider font-mono">
                    Plume Speed
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    2.1 km/h (Omnidirectional)
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium block leading-tight">
                    Low advection clearance
                  </span>
                </div>
              </div>

              {/* Ribbon Metric 3: Telemetry Network Health */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <i className="fa-solid fa-satellite-dish text-base"></i>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider font-mono">
                    Telemetry Health
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700">
                    98.4% Live Uptime
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                    38 sensors transmitting
                  </span>
                </div>
              </div>
            </div>
          </section>
          {/* END: CenterHeroMap */}

          {/* BEGIN: RightColumn (Visual Telemetry & Action Center) */}
          <section className="lg:col-span-3 flex flex-col gap-3.5 order-3">
            {/* Regional AQI Hero Gauge Card */}
            <div
              onClick={() => setIsAqiModalOpen(true)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle cursor-pointer hover:shadow-md hover:border-rose-300 transition group relative"
            >
              <div className="absolute top-3 right-3 text-slate-300 group-hover:text-rose-500 transition">
                <i className="fa-solid fa-expand"></i>
              </div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-nodes text-rose-500 text-xs"></i>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Regional AQI Metric
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-100">
                  CPCB REALTIME
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 gap-3">
                {/* Circular Radial Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.6"
                    ></path>
                    <path
                      className="text-red-700"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${gaugeArc}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.6"
                    ></path>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black font-mono text-slate-900 tracking-tight leading-none">
                      {activeHotspot.aqi}
                    </span>
                    <span className="text-[9px] font-extrabold text-red-700 uppercase mt-0.5 tracking-wider">
                      {activeHotspot.tag}
                    </span>
                  </div>
                </div>
                {/* Gauge Context Callout */}
                <div className="flex-1 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">
                      Peak Hotspot
                    </span>
                    <p className="text-xs font-extrabold text-slate-900">
                      {activeHotspot.label} ({activeHotspot.aqi})
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">
                      Advisory Status
                    </span>
                    <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg mt-1">
                      <p className="text-[10px] font-semibold text-rose-800 leading-tight">
                        {getAdvisory(activeHotspot.tag)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Speciation Snapshot */}
            <div
              onClick={() => setIsAqiModalOpen(true)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle cursor-pointer hover:shadow-md transition relative group"
            >
              <div className="absolute top-3 right-3 text-slate-300 group-hover:text-slate-500 transition">
                <i className="fa-solid fa-expand"></i>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-flask text-slate-500 text-xs"></i>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Chemical Speciation
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  24h Rolling Mean
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {[
                  {
                    name: "PM 2.5",
                    val: pm25Val,
                    unit: "/ 60 µg/m³",
                    limit: `${(pm25Val / 60).toFixed(1)}x limit`,
                    pct: `${pm25Pct}%`,
                    bar: "from-rose-600 to-rose-500",
                    badge: "bg-rose-100 text-rose-800",
                  },
                  {
                    name: "PM 10",
                    val: pm10Val,
                    unit: "/ 100 µg/m³",
                    limit: `${(pm10Val / 100).toFixed(1)}x limit`,
                    pct: `${pm10Pct}%`,
                    bar: "from-red-700 to-red-500",
                    badge: "bg-red-100 text-red-800",
                  },
                  {
                    name: "NO₂",
                    val: no2Val,
                    unit: "/ 80 µg/m³",
                    limit: `${(no2Val / 80).toFixed(1)}x limit`,
                    pct: `${no2Pct}%`,
                    bar: "from-amber-500 to-yellow-400",
                    badge: "bg-amber-100 text-amber-800",
                  },
                  {
                    name: "CO",
                    val: coVal,
                    unit: "/ 2.0 mg/m³",
                    limit: `${(parseFloat(coVal) / 2.0).toFixed(1)}x limit`,
                    pct: `${coPct}%`,
                    bar: "from-amber-600 to-amber-400",
                    badge: "bg-orange-100 text-orange-800",
                  },
                ].map((p, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">
                          {p.name}
                        </span>
                        <span
                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${p.badge}`}
                        >
                          {p.limit}
                        </span>
                      </div>
                      <div className="text-[10px]">
                        <span className="font-bold text-slate-900">
                          {p.val}
                        </span>
                        <span className="text-slate-400 font-mono ml-1">
                          {p.unit}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${p.bar}`}
                        style={{ width: p.pct }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 72h Predictive Trajectory Histogram Chart */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple text-slate-400 text-xs"></i>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    72h Predictive Trajectory
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  WRF-Chem Model
                </span>
              </div>

              {/* Color-Graded Forecast Histogram Columns */}
              <div className="flex items-end justify-between h-24 pt-4 px-1 gap-2 border-b border-slate-100">
                {[
                  {
                    time: "Now",
                    val: activeHotspot.aqi,
                    color: getGaugeColor(activeHotspot.tag),
                  },
                  {
                    time: "+12h",
                    val: Math.round(activeHotspot.aqi * 1.1),
                    color: getGaugeColor(hotspots[0].tag),
                  },
                  {
                    time: "+24h",
                    val: Math.round(activeHotspot.aqi * 0.95),
                    color: getGaugeColor(hotspots[2].tag),
                  },
                  {
                    time: "+36h",
                    val: Math.round(activeHotspot.aqi * 0.8),
                    color: getGaugeColor(hotspots[3].tag),
                  },
                  {
                    time: "+48h",
                    val: Math.round(activeHotspot.aqi * 0.6),
                    color: getGaugeColor(hotspots[4].tag),
                  },
                  {
                    time: "+72h",
                    val: Math.round(activeHotspot.aqi * 0.4),
                    color: "#10b981",
                  },
                ].map((fc, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    <span
                      className="text-[10px] font-mono font-bold mb-1 opacity-0 group-hover:opacity-100 transition"
                      style={{ color: fc.color }}
                    >
                      {fc.val}
                    </span>
                    <div
                      className="w-full rounded-t-md transition-all group-hover:brightness-110"
                      style={{
                        height: `${Math.min(100, Math.max(10, (fc.val / 500) * 100))}%`,
                        backgroundColor: fc.color,
                      }}
                    ></div>
                    <span
                      className={`text-[10px] font-mono mt-2 ${i === 0 ? "font-bold text-slate-600" : "text-slate-400"}`}
                    >
                      {fc.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-start gap-2 px-1">
                <i className="fa-solid fa-cloud-showers-heavy text-blue-500 mt-0.5"></i>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Western disturbance shear expected Fri afternoon (+48h) to
                  clear inversion.
                </p>
              </div>
            </div>

            {/* Immediate Interventions Section */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-bolt text-rose-500 text-xs"></i>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Immediate Interventions
                  </h2>
                </div>
                <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-100">
                  4 Flagged
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Action 1: Dynamic Hotspot */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <i className="fa-solid fa-truck-droplet text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold text-slate-800">
                        {activeHotspot.label} Core
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Deploy Anti-Smog Guns
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleAction(
                        1,
                        `Deploy Smog Guns to ${activeHotspot.label}`,
                      )
                    }
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs ${actionsTriggered[1] ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-white border border-slate-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50"}`}
                  >
                    {actionsTriggered[1] ? (
                      <>
                        <i className="fa-solid fa-check mr-1.5"></i>Deployed
                      </>
                    ) : (
                      "Deploy"
                    )}
                  </button>
                </div>

                {/* Action 2 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <i className="fa-solid fa-fire-ban text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold text-slate-800">
                        Biomass Burning
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Dispatch MCD Patrols
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction(2, "Dispatch Patrols")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs ${actionsTriggered[2] ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-white border border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-100"}`}
                  >
                    {actionsTriggered[2] ? (
                      <>
                        <i className="fa-solid fa-check mr-1.5"></i>Active
                      </>
                    ) : (
                      "Dispatch"
                    )}
                  </button>
                </div>

                {/* Action 3 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                      <i className="fa-solid fa-road-barrier text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold text-slate-800">
                        Heavy Vehicles
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Issue Entry Ban Alert
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction(3, "Issue Border Ban Alert")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs ${actionsTriggered[3] ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-slate-800 text-white hover:bg-slate-700"}`}
                  >
                    {actionsTriggered[3] ? (
                      <>
                        <i className="fa-solid fa-check mr-1.5"></i>Issued
                      </>
                    ) : (
                      "Issue Ban"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
        {/* END: MainDashboardGrid */}
      </div>

      {activeTab === "Plume Dispersion" && (
        <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 lg:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500 text-xl shadow-inner">
              <i className="fa-solid fa-fire-burner"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Plume Dispersion Dynamics
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Real-time tracking of biomass burning smoke trajectories and
                thermal anomalies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 z-10">
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  <i className="fa-solid fa-wind mr-2 text-amber-500"></i>Wind
                  Vector Field
                </h2>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100">
                  North-Westerly Flow
                </span>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[url('https://cartodb-basemaps-c.global.ssl.fastly.net/light_all/7/89/53.png')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-600/20"></div>
                <div className="relative z-10 text-center">
                  <i className="fa-solid fa-satellite-dish text-4xl text-amber-400 mb-3 opacity-50"></i>
                  <p className="text-sm font-bold text-slate-500">
                    Satellite Telemetry Syncing...
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
                    VIIRS / MODIS Active Fire Data
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-4">
                  <i className="fa-solid fa-temperature-arrow-up mr-2 text-rose-500"></i>
                  Thermal Anomalies
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Punjab & Haryana
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Detected last 24h
                      </span>
                    </div>
                    <span className="text-xl font-black text-rose-600">
                      1,248
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Upwind Trajectory
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Transport time to NCR
                      </span>
                    </div>
                    <span className="text-lg font-black text-amber-600">
                      14h
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl p-6 border border-slate-700 shadow-lg text-white">
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 mb-4">
                  <i className="fa-solid fa-layer-group mr-2 text-indigo-400"></i>
                  Atmospheric Inversion
                </h2>
                <div className="mt-2 mb-6">
                  <span className="text-3xl font-black block">850m</span>
                  <span className="text-[10px] uppercase tracking-widest text-indigo-300">
                    Boundary Layer Height
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="w-1/3 bg-indigo-500 h-full rounded-full"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3">
                  Severe trapping conditions detected. Plume descent expected
                  post-sunset.
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === "GRAP Action Center" && (
        <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 lg:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl shadow-inner">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  GRAP Action Center
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  Graded Response Action Plan Enforcement & Compliance Tracking.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></div>
              <span className="text-sm font-bold text-rose-800 uppercase tracking-widest">
                Stage IV Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: "Active Restrictions",
                val: "14",
                icon: "fa-ban",
                color: "text-rose-600",
                bg: "bg-rose-50",
              },
              {
                label: "Enforcement Teams",
                val: "248",
                icon: "fa-users-gear",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Challans Issued (24h)",
                val: "₹4.2M",
                icon: "fa-file-invoice-dollar",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Compliance Index",
                val: "68%",
                icon: "fa-chart-pie",
                color: "text-amber-500",
                bg: "bg-amber-50",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${stat.bg} ${stat.color}`}
                >
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 block leading-none mb-1">
                    {stat.val}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-6">
              <i className="fa-solid fa-list-check mr-2 text-indigo-500"></i>
              Current Stage IV Directives
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "Halt all construction activities",
                  desc: "Complete ban on C&D activities including public projects (highways, flyovers, power transmission).",
                  status: "Enforced",
                  badge: "bg-emerald-100 text-emerald-700",
                },
                {
                  title: "Ban on BS-IV Diesel Vehicles",
                  desc: "No entry for heavy and medium goods vehicles into Delhi except essential commodities.",
                  status: "Enforced",
                  badge: "bg-emerald-100 text-emerald-700",
                },
                {
                  title: "School Closures",
                  desc: "Physical classes suspended for all grades except 10th and 12th.",
                  status: "Partial",
                  badge: "bg-amber-100 text-amber-700",
                },
                {
                  title: "Work From Home Directive",
                  desc: "50% attendance for NCR government offices and private corporate sectors.",
                  status: "Advisory",
                  badge: "bg-slate-100 text-slate-600",
                },
              ].map((task, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full border-2 border-indigo-200 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 opacity-0 hover:opacity-100 transition"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        {task.desc}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${task.badge}`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {activeTab === "Station Telemetry" && (
        <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 lg:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 text-xl shadow-inner">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Station Telemetry
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Deep-dive technical diagnostics for all 38 CAQM monitoring
                stations.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      Station ID
                    </th>
                    <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      Zone
                    </th>
                    <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      PM2.5
                    </th>
                    <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      PM10
                    </th>
                    <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      Ozone
                    </th>
                    <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      Last Calibrated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      id: "ST-01",
                      zone: "Anand Vihar",
                      status: "Online",
                      sColor: "text-emerald-500",
                      pm25: 312,
                      pm10: 410,
                      o3: 45,
                      cal: "2 days ago",
                    },
                    {
                      id: "ST-02",
                      zone: "Jahangirpuri",
                      status: "Online",
                      sColor: "text-emerald-500",
                      pm25: 298,
                      pm10: 380,
                      o3: 52,
                      cal: "1 week ago",
                    },
                    {
                      id: "ST-03",
                      zone: "ITO Core",
                      status: "Warning",
                      sColor: "text-amber-500",
                      pm25: 267,
                      pm10: 352,
                      o3: 61,
                      cal: "Sensor Drift",
                    },
                    {
                      id: "ST-04",
                      zone: "Noida Sec 62",
                      status: "Online",
                      sColor: "text-emerald-500",
                      pm25: 245,
                      pm10: 310,
                      o3: 48,
                      cal: "3 days ago",
                    },
                    {
                      id: "ST-05",
                      zone: "Gurugram Cyber",
                      status: "Offline",
                      sColor: "text-slate-400",
                      pm25: "--",
                      pm10: "--",
                      o3: "--",
                      cal: "Power Failure",
                    },
                    {
                      id: "ST-06",
                      zone: "Karnal Entry",
                      status: "Online",
                      sColor: "text-emerald-500",
                      pm25: 185,
                      pm10: 220,
                      o3: 35,
                      cal: "5 days ago",
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition cursor-pointer"
                    >
                      <td className="p-4 font-mono text-xs font-bold text-slate-700">
                        {row.id}
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-900">
                        {row.zone}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${row.status === "Online" ? "bg-emerald-500" : row.status === "Warning" ? "bg-amber-500" : "bg-slate-300"}`}
                          ></div>
                          <span className={`text-xs font-bold ${row.sColor}`}>
                            {row.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm font-bold text-rose-600">
                        {row.pm25}
                      </td>
                      <td className="p-4 font-mono text-sm font-bold text-rose-500">
                        {row.pm10}
                      </td>
                      <td className="p-4 font-mono text-sm font-bold text-slate-600">
                        {row.o3}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">
                        {row.cal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}
      {/* BEGIN: MinimalFooter */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-5 py-2.5 text-slate-500 text-xs flex flex-wrap items-center justify-between gap-2 shadow-subtle">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <i className="fa-solid fa-shield-halved text-rose-600"></i>{" "}
            Commission for Air Quality Management (CAQM) Airshed System
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-[11px]">
            CPCB Telemetry Feed v4.2.8
          </span>
        </div>
        <div className="font-mono text-[11px]">
          Last Telemetry Sync:{" "}
          <span className="text-slate-800 font-bold">06:00 IST</span> (24ms mesh
          latency | Continuous WRF-Chem Reanalysis)
        </div>
      </footer>
      {/* END: MinimalFooter */}

      {/* AQI & Chemical Detail Modal */}
      {isAqiModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsAqiModalOpen(false)}
        >
          <div
            className="bg-[#f3f6fb] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                  <i className="fa-solid fa-microscope text-rose-600 text-xs"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">
                    Detailed AQI & Chemical Speciation
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {activeHotspot.label} Station · CPCB Telemetry · Live Data
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>{" "}
                  LIVE
                </span>
                <button
                  onClick={() => setIsAqiModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 transition"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-5">
              {/* ── ROW 1: AQI Gauge + AQI Scale Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* AQI Radial Gauge */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Composite AQI
                  </p>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="3.2"
                      ></path>
                      {/* Severity zone arcs - background color ramp */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#aqiGrad)"
                        strokeDasharray="77.4, 100"
                        strokeLinecap="round"
                        strokeWidth="3.8"
                      ></path>
                      <defs>
                        <linearGradient
                          id="aqiGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="#dc2626" />
                          <stop offset="100%" stopColor="#7c2d12" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-black font-mono text-slate-900 leading-none">
                        {activeHotspot.aqi}
                      </span>
                      <span className="text-[9px] font-extrabold text-red-700 uppercase mt-1 tracking-widest bg-red-50 px-2 py-0.5 rounded-full">
                        {activeHotspot.tag}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono">
                    <span className="text-slate-400">Peak:</span>
                    <span className="font-extrabold text-purple-900">
                      Anand Vihar 452
                    </span>
                  </div>
                </div>

                {/* Hotspot AQI Bar Chart */}
                <div className="md:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Zone-wise AQI Comparison
                    </p>
                    <span className="text-[9px] font-mono text-slate-400">
                      All 6 monitored zones
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Anand Vihar",
                        aqi: 452,
                        pct: 90,
                        color: "bg-purple-900",
                      },
                      {
                        label: "Jahangirpuri",
                        aqi: 410,
                        pct: 82,
                        color: "bg-rose-700",
                      },
                      {
                        label: "ITO Core",
                        aqi: 387,
                        pct: 77,
                        color: "bg-rose-600",
                      },
                      {
                        label: "Noida Sec 62",
                        aqi: 378,
                        pct: 76,
                        color: "bg-red-500",
                      },
                      {
                        label: "Gurugram Cyber",
                        aqi: 362,
                        pct: 72,
                        color: "bg-orange-500",
                      },
                      {
                        label: "Karnal Entry",
                        aqi: 298,
                        pct: 60,
                        color: "bg-amber-400",
                      },
                    ].map((z, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-[11px]"
                      >
                        <span className="w-24 text-slate-600 font-medium shrink-0 truncate">
                          {z.label}
                        </span>
                        <div className="flex-1 bg-slate-100 h-3.5 rounded-full overflow-hidden">
                          <div
                            className={`${z.color} h-full rounded-full transition-all`}
                            style={{ width: `${z.pct}%` }}
                          ></div>
                        </div>
                        <span className="w-9 text-right font-mono font-bold text-slate-800 shrink-0">
                          {z.aqi}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── ROW 2: Pie Chart + Speciation Bars ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SVG Donut Pie Chart — Pollutant Composition */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-chart-pie text-rose-500 text-xs"></i>
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Pollutant Composition
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">
                      % of total PM load
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Donut SVG */}
                    <svg
                      viewBox="0 0 36 36"
                      className="w-36 h-36 shrink-0 -rotate-90"
                    >
                      {/* PM2.5 — 48% → 172.8deg */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="6"
                        strokeDasharray="42 88"
                        strokeDashoffset="0"
                      />
                      {/* PM10 — 25% → 90deg */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="6"
                        strokeDasharray="22 108"
                        strokeDashoffset="-42"
                      />
                      {/* NO2 — 15% → 54deg */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="6"
                        strokeDasharray="13 117"
                        strokeDashoffset="-64"
                      />
                      {/* CO — 8% */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="6"
                        strokeDasharray="7 123"
                        strokeDashoffset="-77"
                      />
                      {/* SO2 — 4% */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="6"
                        strokeDasharray="4 126"
                        strokeDashoffset="-84"
                      />
                      {/* Center hole */}
                      <circle cx="18" cy="18" r="10" fill="white" />
                    </svg>
                    {/* Legend */}
                    <div className="space-y-1.5 text-[11px]">
                      {[
                        {
                          label: "PM 2.5",
                          pct: "48%",
                          color: "bg-red-600",
                          val: "312 µg",
                        },
                        {
                          label: "PM 10",
                          pct: "25%",
                          color: "bg-violet-600",
                          val: "410 µg",
                        },
                        {
                          label: "NO₂",
                          pct: "15%",
                          color: "bg-amber-500",
                          val: "68 µg",
                        },
                        {
                          label: "CO",
                          pct: "8%",
                          color: "bg-emerald-500",
                          val: "2.8 mg",
                        },
                        {
                          label: "SO₂",
                          pct: "4%",
                          color: "bg-slate-500",
                          val: "12 µg",
                        },
                      ].map((l, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-sm ${l.color} shrink-0`}
                          ></span>
                          <span className="text-slate-700 font-semibold">
                            {l.label}
                          </span>
                          <span className="text-slate-400 ml-auto font-mono">
                            {l.pct}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chemical Speciation Bars (enhanced) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-flask-vial text-slate-400 text-xs"></i>
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Chemical Speciation
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">
                      24h Rolling Mean
                    </span>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      {
                        name: "PM 2.5",
                        val: 312,
                        unit: "/ 60 µg/m³",
                        limit: "5.2x",
                        pct: "88%",
                        bar: "from-rose-600 to-rose-500",
                        badge: "bg-rose-100 text-rose-800",
                      },
                      {
                        name: "PM 10",
                        val: 410,
                        unit: "/ 100 µg/m³",
                        limit: "4.1x",
                        pct: "92%",
                        bar: "from-red-700 to-red-500",
                        badge: "bg-red-100 text-red-800",
                      },
                      {
                        name: "NO₂",
                        val: 68,
                        unit: "/ 80 µg/m³",
                        limit: "0.8x",
                        pct: "65%",
                        bar: "from-amber-500 to-yellow-400",
                        badge: "bg-amber-100 text-amber-800",
                      },
                      {
                        name: "CO",
                        val: "2.8",
                        unit: "/ 2.0 mg/m³",
                        limit: "1.4x",
                        pct: "70%",
                        bar: "from-amber-600 to-amber-400",
                        badge: "bg-orange-100 text-orange-800",
                      },
                      {
                        name: "SO₂",
                        val: 12,
                        unit: "/ 40 µg/m³",
                        limit: "0.3x",
                        pct: "30%",
                        bar: "from-slate-400 to-slate-300",
                        badge: "bg-slate-100 text-slate-600",
                      },
                    ].map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">
                              {p.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${p.badge}`}
                            >
                              {p.limit} limit
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">
                            {p.val}{" "}
                            <span className="text-slate-400 font-normal text-[10px]">
                              {p.unit}
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${p.bar} h-full rounded-full`}
                            style={{ width: p.pct }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── ROW 3: 24h Trend Sparkline ── */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-chart-line text-indigo-500 text-xs"></i>
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      24h AQI Trend — Anand Vihar
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-rose-600 inline-block rounded"></span>{" "}
                      PM2.5
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-violet-600 inline-block rounded"></span>{" "}
                      AQI
                    </span>
                  </div>
                </div>
                <div className="relative h-24">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 400 80"
                    preserveAspectRatio="none"
                  >
                    {/* Grid lines */}
                    {[20, 40, 60].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="400"
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    ))}
                    {/* AQI area fill */}
                    <defs>
                      <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#7c3aed"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#7c3aed"
                          stopOpacity="0.02"
                        />
                      </linearGradient>
                      <linearGradient id="pmFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#dc2626"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#dc2626"
                          stopOpacity="0.02"
                        />
                      </linearGradient>
                    </defs>
                    {/* AQI line (violet) — 24h data points */}
                    <polyline
                      points="0,68 17,64 33,58 50,52 67,48 83,44 100,40 117,38 133,36 150,34 167,32 183,30 200,28 217,30 233,34 250,38 267,42 283,46 300,44 317,40 333,36 350,32 367,28 383,26 400,24"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {/* PM2.5 line (rose) */}
                    <polyline
                      points="0,72 17,68 33,62 50,56 67,52 83,48 100,44 117,42 133,40 150,38 167,36 183,34 200,30 217,32 233,36 250,40 267,44 283,48 300,46 317,42 333,38 350,34 367,30 383,28 400,26"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {/* Vertical "now" marker */}
                    <line
                      x1="400"
                      y1="0"
                      x2="400"
                      y2="80"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="3,2"
                    />
                  </svg>
                  {/* X-axis labels */}
                  <div className="flex justify-between mt-1 text-[9px] font-mono text-slate-400">
                    {[
                      "00:00",
                      "04:00",
                      "08:00",
                      "12:00",
                      "16:00",
                      "20:00",
                      "Now",
                    ].map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── ROW 4: Advisory Status ── */}
              <div className="bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 rounded-2xl p-4 border border-rose-200/80">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fa-solid fa-triangle-exclamation text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-rose-900 uppercase tracking-wide mb-1">
                      Emergency Advisory — GRAP Stage IV Active
                    </p>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Restrict all BS-III/IV diesel vehicles in NCR. Suspend
                      primary schools &amp; outdoor activities. Construction
                      banned within 300m of residential zones. Industries on
                      reduced load schedule.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {[
                        "BS-IV Diesel Ban",
                        "School Closure",
                        "Construction Halt",
                      ].map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-bold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
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
