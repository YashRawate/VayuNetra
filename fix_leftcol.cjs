const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

const leftColStart = code.indexOf('{/* BEGIN: LeftColumn (Spatial Hotspots & Atmospheric Physics) */}');
const centerColStart = code.indexOf('{/* BEGIN: Centerpiece Leaflet Map */}');

if (leftColStart !== -1 && centerColStart !== -1) {
  const correctLeftCol = `{/* BEGIN: LeftColumn (Spatial Hotspots & Atmospheric Physics) */}
        <section className="lg:col-span-3 flex flex-col gap-3.5 order-2 lg:order-1">
          {/* Sector AQI Hotspots Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div className={\`flex items-center justify-between \${isLeaderboardOpen ? 'pb-3 mb-3 border-b border-slate-100' : ''}\`}>
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
                  <i className={\`fa-solid \${isLeaderboardOpen ? 'fa-chevron-up' : 'fa-chevron-down'}\`}></i>
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
                        onClick={() => setSelectedHotspot(st.name)}
                        className={\`p-2.5 rounded-xl border transition cursor-pointer group \${
                          isSelected 
                            ? 'bg-rose-50 border-rose-300 shadow-sm' 
                            : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:border-rose-200'
                        }\`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition">{st.label}</span>
                              {isSelected && <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                              </span>}
                            </div>
                            <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">{st.location}</span>
                          </div>
                          <span className={\`font-mono font-bold px-2 py-0.5 rounded text-[11px] \${st.tagBg}\`}>
                            {st.aqi} {st.tag}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={\`bg-gradient-to-r \${st.barGrad} h-full rounded-full\`} style={{ width: st.width }}></div>
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
\n`;

  const newCode = code.substring(0, leftColStart) + correctLeftCol + code.substring(centerColStart);
  fs.writeFileSync('src/components/VayuCommandDashboard.jsx', newCode);
  console.log('Left column replaced!');
} else {
  console.log('Could not find markers');
}
