const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

// Find where modal starts
const modalStartStr = '{isAqiModalOpen && (';
const modalStartIndex = code.indexOf(modalStartStr);

if (modalStartIndex === -1) {
  console.log("Could not find modal bounds");
  process.exit(1);
}

const dynamicModal = `{isAqiModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsAqiModalOpen(false)}
        >
          <div
            className="bg-[#f3f6fb] rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
                  <i className="fa-solid fa-microscope text-sm"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-sm">
                    Detailed AQI & Chemical Speciation
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">{activeHotspot.label} Station · CPCB Telemetry · Live Data</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-bold tracking-widest uppercase">Live</span>
                </div>
                <button
                  onClick={() => setIsAqiModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-4">
              
              {/* ROW 1: Gauge & Leaderboard */}
              <div className="grid grid-cols-3 gap-4">
                {/* Main Gauge Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Composite AQI</span>
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <defs>
                        <linearGradient id="aqiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#7c2d12" />
                        </linearGradient>
                      </defs>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="3.8"></circle>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="url(#aqiGrad)" 
                        strokeDasharray={\`\${gaugeArc}, 100\`} strokeLinecap="round" strokeWidth="3.8"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black font-mono text-slate-900 leading-none">{activeHotspot.aqi}</span>
                      <span className="text-[9px] font-extrabold text-red-700 uppercase mt-1 tracking-widest bg-red-50 px-2 py-0.5 rounded-full">{activeHotspot.tag}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-[10px] flex items-center gap-1.5">
                    <span className="text-slate-400">Peak:</span>
                    <span className="font-extrabold text-purple-900">{activeHotspot.label} {activeHotspot.aqi}</span>
                  </div>
                </div>

                {/* Zone-wise Bar Chart */}
                <div className="col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Zone-Wise AQI Comparison</span>
                    <span className="text-[9px] font-mono text-slate-400">All 6 monitored zones</span>
                  </div>
                  <div className="space-y-3">
                    {hotspots.map((z, i) => {
                      const isActive = z.name === activeHotspot.name;
                      const colors = ['bg-purple-900','bg-rose-700','bg-rose-600','bg-red-500','bg-orange-500','bg-amber-400'];
                      return (
                        <div key={i} className={\`flex items-center gap-3 text-xs \${isActive ? 'ring-1 ring-rose-400 bg-rose-50 rounded-lg px-2 py-1 -mx-2' : ''}\`}>
                          <span className={\`w-28 shrink-0 truncate \${isActive ? 'font-bold text-rose-700' : 'text-slate-600 font-medium'}\`}>{z.label}</span>
                          <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden">
                            <div className={\`\${colors[i] || 'bg-slate-400'} h-full rounded-full transition-all\`} style={{ width: z.width }}></div>
                          </div>
                          <span className={\`w-10 text-right font-mono font-bold shrink-0 \${isActive ? 'text-rose-700' : 'text-slate-800'}\`}>{z.aqi}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ROW 2: Speciation Pie & Bars */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Donut Chart Component */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-chart-pie text-rose-500"></i>
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Pollutant Composition</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">% of total PM load</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-8">
                    <div className="relative w-36 h-36 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        {/* Dynamic stroke array based on exact calculated % fractions of 100 */}
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray={\`\${((pm25Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88\`} strokeDashoffset="0"></circle>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeDasharray={\`\${((pm10Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88\`} strokeDashoffset={\`-\${((pm25Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)}\`}></circle>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray={\`\${((no2Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88\`} strokeDashoffset={\`-\${(((pm25Val+pm10Val) / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)}\`}></circle>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={\`\${((parseFloat(coVal) / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88\`} strokeDashoffset={\`-\${(((pm25Val+pm10Val+no2Val) / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)}\`}></circle>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#64748b" strokeWidth="8" strokeDasharray={\`\${((so2Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88\`} strokeDashoffset={\`-\${(((pm25Val+pm10Val+no2Val+parseFloat(coVal)) / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)}\`}></circle>
                      </svg>
                      <div className="absolute inset-0 bg-white rounded-full m-8 shadow-inner"></div>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { label: 'PM 2.5', pct: \`\${Math.round((pm25Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-red-600', val: \`\${pm25Val} µg\` },
                        { label: 'PM 10', pct: \`\${Math.round((pm10Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-violet-600', val: \`\${pm10Val} µg\` },
                        { label: 'NO₂', pct: \`\${Math.round((no2Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-amber-500', val: \`\${no2Val} µg\` },
                        { label: 'CO', pct: \`\${Math.round((parseFloat(coVal) / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-emerald-500', val: \`\${coVal} mg\` },
                        { label: 'SO₂', pct: \`\${Math.round((so2Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-slate-500', val: \`\${so2Val} µg\` }
                      ].map((lg, i) => (
                        <div key={i} className="flex items-center gap-3 text-[10px]">
                          <div className={\`w-2.5 h-2.5 rounded-full \${lg.color}\`}></div>
                          <span className="font-bold text-slate-700 w-10">{lg.label}</span>
                          <span className="text-slate-400 font-mono w-6">{lg.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Speciation Bars */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-flask text-slate-500"></i>
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Chemical Speciation</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">24h Rolling Mean</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'PM 2.5', val: pm25Val, unit: '/ 60 µg/m³', limit: \`\${(pm25Val / 60).toFixed(1)}x limit\`, pct: \`\${pm25Pct}%\`, bar: 'from-rose-600 to-rose-500', badge: 'bg-rose-100 text-rose-800' },
                      { name: 'PM 10', val: pm10Val, unit: '/ 100 µg/m³', limit: \`\${(pm10Val / 100).toFixed(1)}x limit\`, pct: \`\${pm10Pct}%\`, bar: 'from-red-700 to-red-500', badge: 'bg-red-100 text-red-800' },
                      { name: 'NO₂', val: no2Val, unit: '/ 80 µg/m³', limit: \`\${(no2Val / 80).toFixed(1)}x limit\`, pct: \`\${no2Pct}%\`, bar: 'from-amber-500 to-yellow-400', badge: 'bg-amber-100 text-amber-800' },
                      { name: 'CO', val: coVal, unit: '/ 2.0 mg/m³', limit: \`\${(parseFloat(coVal) / 2.0).toFixed(1)}x limit\`, pct: \`\${coPct}%\`, bar: 'from-amber-600 to-amber-400', badge: 'bg-orange-100 text-orange-800' },
                      { name: 'SO₂', val: so2Val, unit: '/ 40 µg/m³', limit: \`\${(so2Val / 40).toFixed(1)}x limit\`, pct: \`\${so2Pct}%\`, bar: 'from-slate-400 to-slate-300', badge: 'bg-slate-100 text-slate-600' }
                    ].map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-end mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold text-slate-900">{p.name}</span>
                            <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full \${p.badge}\`}>{p.limit}</span>
                          </div>
                          <div className="text-[10px]">
                            <span className="font-bold text-slate-900">{p.val}</span>
                            <span className="text-slate-400 font-mono ml-1">{p.unit}</span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={\`h-full rounded-full bg-gradient-to-r \${p.bar}\`} style={{ width: p.pct }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ROW 3: 24h Trend Sparkline */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mt-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-blue-600"></i>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">24H AQI TREND — {activeHotspot.label.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-bold">
                    <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-rose-500 rounded"></div><span className="text-slate-500">PM2.5</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-purple-600 rounded"></div><span className="text-slate-500">AQI</span></div>
                  </div>
                </div>
                <div className="h-24 w-full relative">
                  {/* Decorative grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="border-b border-slate-100 w-full h-0"></div>
                    <div className="border-b border-slate-100 w-full h-0"></div>
                    <div className="border-b border-slate-100 w-full h-0"></div>
                  </div>
                  {/* Sparkline SVG */}
                  <svg className="w-full h-full absolute inset-0 preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,80 L20,70 L40,65 L50,60 L70,75 L100,55" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0,85 L20,75 L40,70 L50,62 L70,78 L100,58" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0,100 L0,80 L20,70 L40,65 L50,60 L70,75 L100,55 L100,100 Z" fill="url(#sparkGrad)" />
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Current time marker */}
                  <div className="absolute right-0 top-0 bottom-0 border-l border-dashed border-emerald-500"></div>
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-2 px-1">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                  <span>Now</span>
                </div>
              </div>

              {/* ROW 4: Advisory Banner */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-4 mt-2">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-triangle-exclamation text-rose-600 text-lg"></i>
                </div>
                <div>
                  <h4 className="text-xs font-black text-rose-900 mb-1">ENFORCEMENT ACTIVE</h4>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    {getAdvisory(activeHotspot.tag)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {getAdvisoryTags(activeHotspot.tag).map(tag => (
                      <span key={tag} className="text-[9px] font-bold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
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
`;

code = code.substring(0, modalStartIndex) + dynamicModal;

fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('Modal entirely replaced with dynamic version, closing tags intact!');
