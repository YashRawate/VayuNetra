const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

const rightColStart = code.indexOf('{/* BEGIN: RightColumn (Visual Telemetry & Action Center) */}');
const minimalFooterStart = code.indexOf('{/* BEGIN: MinimalFooter */}'); // Wait, let's use </main>

if (rightColStart !== -1) {
  // We want to replace from rightColStart to the closing </section>
  // Because it's <section className="lg:col-span-3..."> ... </section>
  
  const rightColEnd = code.indexOf('</section>', rightColStart) + 10;
  
  const correctRightCol = `{/* BEGIN: RightColumn (Visual Telemetry & Action Center) */}
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
                  <path className="text-red-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={\`\${gaugeArc}, 100\`} strokeLinecap="round" strokeWidth="3.6"></path>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-mono text-slate-900 tracking-tight leading-none">{activeHotspot.aqi}</span>
                  <span className="text-[9px] font-extrabold text-red-700 uppercase mt-0.5 tracking-wider">{activeHotspot.tag}</span>
                </div>
              </div>
              {/* Gauge Context Callout */}
              <div className="flex-1 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">Peak Hotspot</span>
                  <p className="text-xs font-extrabold text-slate-900">{activeHotspot.label} ({activeHotspot.aqi})</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">Advisory Status</span>
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
          <div onClick={() => setIsAqiModalOpen(true)} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle cursor-pointer hover:shadow-md transition relative group">
            <div className="absolute top-3 right-3 text-slate-300 group-hover:text-slate-500 transition"><i className="fa-solid fa-expand"></i></div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-flask text-slate-500 text-xs"></i>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Chemical Speciation</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">24h Rolling Mean</span>
            </div>
            
            <div className="space-y-3 mt-4">
              {[
                { name: 'PM 2.5', val: pm25Val, unit: '/ 60 µg/m³', limit: \`\${(pm25Val / 60).toFixed(1)}x limit\`, pct: \`\${pm25Pct}%\`, bar: 'from-rose-600 to-rose-500', badge: 'bg-rose-100 text-rose-800' },
                { name: 'PM 10', val: pm10Val, unit: '/ 100 µg/m³', limit: \`\${(pm10Val / 100).toFixed(1)}x limit\`, pct: \`\${pm10Pct}%\`, bar: 'from-red-700 to-red-500', badge: 'bg-red-100 text-red-800' },
                { name: 'NO₂', val: no2Val, unit: '/ 80 µg/m³', limit: \`\${(no2Val / 80).toFixed(1)}x limit\`, pct: \`\${no2Pct}%\`, bar: 'from-amber-500 to-yellow-400', badge: 'bg-amber-100 text-amber-800' },
                { name: 'CO', val: coVal, unit: '/ 2.0 mg/m³', limit: \`\${(parseFloat(coVal) / 2.0).toFixed(1)}x limit\`, pct: \`\${coPct}%\`, bar: 'from-amber-600 to-amber-400', badge: 'bg-orange-100 text-orange-800' }
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">{p.name}</span>
                      <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full \${p.badge}\`}>{p.limit}</span>
                    </div>
                    <div className="text-[10px]">
                      <span className="font-bold text-slate-900">{p.val}</span>
                      <span className="text-slate-400 font-mono ml-1">{p.unit}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={\`h-full rounded-full bg-gradient-to-r \${p.bar}\`} style={{ width: p.pct }}></div>
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
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">72h Predictive Trajectory</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">WRF-Chem Model</span>
            </div>
            
            {/* Color-Graded Forecast Histogram Columns */}
            <div className="flex items-end justify-between h-24 pt-4 px-1 gap-2 border-b border-slate-100">
              {[
                { time: 'Now', val: activeHotspot.aqi, color: getGaugeColor(activeHotspot.tag) },
                { time: '+12h', val: Math.round(activeHotspot.aqi * 1.1), color: getGaugeColor(hotspots[0].tag) },
                { time: '+24h', val: Math.round(activeHotspot.aqi * 0.95), color: getGaugeColor(hotspots[2].tag) },
                { time: '+36h', val: Math.round(activeHotspot.aqi * 0.8), color: getGaugeColor(hotspots[3].tag) },
                { time: '+48h', val: Math.round(activeHotspot.aqi * 0.6), color: getGaugeColor(hotspots[4].tag) },
                { time: '+72h', val: Math.round(activeHotspot.aqi * 0.4), color: '#10b981' }
              ].map((fc, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                  <span className="text-[10px] font-mono font-bold mb-1 opacity-0 group-hover:opacity-100 transition" style={{ color: fc.color }}>
                    {fc.val}
                  </span>
                  <div className="w-full rounded-t-md transition-all group-hover:brightness-110" style={{ height: \`\${Math.min(100, Math.max(10, (fc.val/500)*100))}%\`, backgroundColor: fc.color }}></div>
                  <span className={\`text-[10px] font-mono mt-2 \${i === 0 ? 'font-bold text-slate-600' : 'text-slate-400'}\`}>
                    {fc.time}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex items-start gap-2 px-1">
              <i className="fa-solid fa-cloud-showers-heavy text-blue-500 mt-0.5"></i>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Western disturbance shear expected Fri afternoon (+48h) to clear inversion.
              </p>
            </div>
          </div>

          {/* Immediate Interventions Section */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-bolt text-rose-500 text-xs"></i>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Immediate Interventions</h2>
              </div>
              <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-100">4 Flagged</span>
            </div>

            <div className="space-y-2.5">
              {/* Action 1: Dynamic Hotspot */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <i className="fa-solid fa-truck-droplet text-xs"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-slate-800">{activeHotspot.label} Core</span>
                    <span className="text-[10px] text-slate-400 font-medium">Deploy Anti-Smog Guns</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAction(1, \`Deploy Smog Guns to \${activeHotspot.label}\`)}
                  className={\`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs \${actionsTriggered[1] ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white border border-slate-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50'}\`}
                >
                  {actionsTriggered[1] ? <><i className="fa-solid fa-check mr-1.5"></i>Deployed</> : 'Deploy'}
                </button>
              </div>

              {/* Action 2 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <i className="fa-solid fa-fire-ban text-xs"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-slate-800">Biomass Burning</span>
                    <span className="text-[10px] text-slate-400 font-medium">Dispatch MCD Patrols</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAction(2, 'Dispatch Patrols')}
                  className={\`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs \${actionsTriggered[2] ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-100'}\`}
                >
                  {actionsTriggered[2] ? <><i className="fa-solid fa-check mr-1.5"></i>Active</> : 'Dispatch'}
                </button>
              </div>
              
              {/* Action 3 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <i className="fa-solid fa-road-barrier text-xs"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-slate-800">Heavy Vehicles</span>
                    <span className="text-[10px] text-slate-400 font-medium">Issue Entry Ban Alert</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAction(3, 'Issue Border Ban Alert')}
                  className={\`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs \${actionsTriggered[3] ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-800 text-white hover:bg-slate-700'}\`}
                >
                  {actionsTriggered[3] ? <><i className="fa-solid fa-check mr-1.5"></i>Issued</> : 'Issue Ban'}
                </button>
              </div>

            </div>
          </div>
        </section>`;

  code = code.substring(0, rightColStart) + correctRightCol + code.substring(rightColEnd);
  fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
  console.log('Right column successfully replaced with 100% dynamic version.');
} else {
  console.log('Could not find rightColStart!');
}
