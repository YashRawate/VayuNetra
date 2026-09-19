const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

const rightColStart = code.indexOf('{/* BEGIN: RightColumn (Visual Telemetry & Action Center) */}');
const minimalFooterStart = code.indexOf('{/* BEGIN: MinimalFooter */}');

if (rightColStart !== -1 && minimalFooterStart !== -1) {
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
                  className={\`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs \${actionsTriggered[1] ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-rose-600'
                    }\`}
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
                  className={\`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs \${actionsTriggered[2] ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }\`}
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
                  className={\`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs \${actionsTriggered[3] ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }\`}
                >
                  {actionsTriggered[3] ? 'Audit Active' : 'Squad Audit'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* END: MainDashboardGrid */}
`;

  const newCode = code.substring(0, rightColStart) + correctRightCol + code.substring(minimalFooterStart);
  fs.writeFileSync('src/components/VayuCommandDashboard.jsx', newCode);
  console.log('Right column replaced!');
} else {
  console.log('Could not find markers');
}
