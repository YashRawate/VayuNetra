const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

// New modal content to replace lines 1306-1513
const oldModal = `      {isAqiModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsAqiModalOpen(false)}
        >
          <div
            className="bg-[#f3f6fb] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white z-10 shrink-0">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-microscope text-rose-600"></i>
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-sm">
                  Detailed AQI & Chemical Speciation
                </h3>
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
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
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
                        strokeDasharray="77.4, 100"
                        strokeLinecap="round"
                        strokeWidth="3.6"
                      ></path>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black font-mono text-slate-900 tracking-tight leading-none">
                        387
                      </span>
                      <span className="text-[9px] font-extrabold text-red-700 uppercase mt-0.5 tracking-wider">
                        SEVERE
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
                        Anand Vihar (452)
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">
                        Advisory Status
                      </span>
                      <div className="bg-rose-50 border border-rose-200/80 p-1.5 rounded-lg">
                        <p className="text-[10px] font-semibold text-rose-800 leading-tight">
                          Emergency Protocol: Restrict all BS-III/IV diesel
                          vehicles & suspend primary schools.
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
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Chemical Speciation
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    24h Rolling Mean
                  </span>
                </div>
                <div className="space-y-3">
                  {/* PM 2.5 */}
                  <div>
                    <div className="flex justify-between items-baseline text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">PM 2.5</span>
                        <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-800 px-1 py-0.2 rounded">
                          5.2x limit
                        </span>
                      </div>
                      <span className="font-mono font-bold text-rose-700">
                        312{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          / 60 µg/m³
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-600 h-full rounded-full"
                        style={{ width: "88%" }}
                      ></div>
                    </div>
                  </div>
                  {/* PM 10 */}
                  <div>
                    <div className="flex justify-between items-baseline text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">PM 10</span>
                        <span className="text-[9px] font-mono font-bold bg-red-100 text-red-800 px-1 py-0.2 rounded">
                          4.1x limit
                        </span>
                      </div>
                      <span className="font-mono font-bold text-red-700">
                        410{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          / 100 µg/m³
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-700 h-full rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                  {/* NO2 */}
                  <div>
                    <div className="flex justify-between items-baseline text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">NO₂</span>
                        <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                          0.8x limit
                        </span>
                      </div>
                      <span className="font-mono font-bold text-amber-600">
                        68{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          / 80 µg/m³
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                  </div>
                  {/* Carbon Monoxide (CO) */}
                  <div>
                    <div className="flex justify-between items-baseline text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">CO</span>
                        <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                          1.4x limit
                        </span>
                      </div>
                      <span className="font-mono font-bold text-amber-700">
                        2.8{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          / 2.0 mg/m³
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}`;

const newModal = `      {isAqiModalOpen && (
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
                  <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">Detailed AQI & Chemical Speciation</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Delhi NCR Airshed · CPCB Telemetry · Live Data</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> LIVE
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Composite AQI</p>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#f1f5f9" strokeWidth="3.2"></path>
                      {/* Severity zone arcs - background color ramp */}
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="url(#aqiGrad)" strokeDasharray="77.4, 100" strokeLinecap="round" strokeWidth="3.8"></path>
                      <defs>
                        <linearGradient id="aqiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b"/>
                          <stop offset="50%" stopColor="#dc2626"/>
                          <stop offset="100%" stopColor="#7c2d12"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-black font-mono text-slate-900 leading-none">387</span>
                      <span className="text-[9px] font-extrabold text-red-700 uppercase mt-1 tracking-widest bg-red-50 px-2 py-0.5 rounded-full">SEVERE</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono">
                    <span className="text-slate-400">Peak:</span>
                    <span className="font-extrabold text-purple-900">Anand Vihar 452</span>
                  </div>
                </div>

                {/* Hotspot AQI Bar Chart */}
                <div className="md:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Zone-wise AQI Comparison</p>
                    <span className="text-[9px] font-mono text-slate-400">All 6 monitored zones</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Anand Vihar', aqi: 452, pct: 90, color: 'bg-purple-900' },
                      { label: 'Jahangirpuri', aqi: 410, pct: 82, color: 'bg-rose-700' },
                      { label: 'ITO Core', aqi: 387, pct: 77, color: 'bg-rose-600' },
                      { label: 'Noida Sec 62', aqi: 378, pct: 76, color: 'bg-red-500' },
                      { label: 'Gurugram Cyber', aqi: 362, pct: 72, color: 'bg-orange-500' },
                      { label: 'Karnal Entry', aqi: 298, pct: 60, color: 'bg-amber-400' },
                    ].map((z, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <span className="w-24 text-slate-600 font-medium shrink-0 truncate">{z.label}</span>
                        <div className="flex-1 bg-slate-100 h-3.5 rounded-full overflow-hidden">
                          <div className={\`\${z.color} h-full rounded-full transition-all\`} style={{ width: \`\${z.pct}%\` }}></div>
                        </div>
                        <span className="w-9 text-right font-mono font-bold text-slate-800 shrink-0">{z.aqi}</span>
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
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Pollutant Composition</p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">% of total PM load</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Donut SVG */}
                    <svg viewBox="0 0 36 36" className="w-36 h-36 shrink-0 -rotate-90">
                      {/* PM2.5 — 48% → 172.8deg */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#dc2626" strokeWidth="6"
                        strokeDasharray="42 88" strokeDashoffset="0"/>
                      {/* PM10 — 25% → 90deg */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#7c3aed" strokeWidth="6"
                        strokeDasharray="22 108" strokeDashoffset="-42"/>
                      {/* NO2 — 15% → 54deg */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="6"
                        strokeDasharray="13 117" strokeDashoffset="-64"/>
                      {/* CO — 8% */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="6"
                        strokeDasharray="7 123" strokeDashoffset="-77"/>
                      {/* SO2 — 4% */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#64748b" strokeWidth="6"
                        strokeDasharray="4 126" strokeDashoffset="-84"/>
                      {/* Center hole */}
                      <circle cx="18" cy="18" r="10" fill="white"/>
                    </svg>
                    {/* Legend */}
                    <div className="space-y-1.5 text-[11px]">
                      {[
                        { label: 'PM 2.5', pct: '48%', color: 'bg-red-600', val: '312 µg' },
                        { label: 'PM 10', pct: '25%', color: 'bg-violet-600', val: '410 µg' },
                        { label: 'NO₂', pct: '15%', color: 'bg-amber-500', val: '68 µg' },
                        { label: 'CO', pct: '8%', color: 'bg-emerald-500', val: '2.8 mg' },
                        { label: 'SO₂', pct: '4%', color: 'bg-slate-500', val: '12 µg' },
                      ].map((l, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className={\`w-2.5 h-2.5 rounded-sm \${l.color} shrink-0\`}></span>
                          <span className="text-slate-700 font-semibold">{l.label}</span>
                          <span className="text-slate-400 ml-auto font-mono">{l.pct}</span>
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
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Chemical Speciation</p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">24h Rolling Mean</span>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      { name: 'PM 2.5', val: 312, unit: '/ 60 µg/m³', limit: '5.2x', pct: '88%', bar: 'from-rose-600 to-rose-500', badge: 'bg-rose-100 text-rose-800' },
                      { name: 'PM 10', val: 410, unit: '/ 100 µg/m³', limit: '4.1x', pct: '92%', bar: 'from-red-700 to-red-500', badge: 'bg-red-100 text-red-800' },
                      { name: 'NO₂', val: 68, unit: '/ 80 µg/m³', limit: '0.8x', pct: '65%', bar: 'from-amber-500 to-yellow-400', badge: 'bg-amber-100 text-amber-800' },
                      { name: 'CO', val: '2.8', unit: '/ 2.0 mg/m³', limit: '1.4x', pct: '70%', bar: 'from-amber-600 to-amber-400', badge: 'bg-orange-100 text-orange-800' },
                      { name: 'SO₂', val: 12, unit: '/ 40 µg/m³', limit: '0.3x', pct: '30%', bar: 'from-slate-400 to-slate-300', badge: 'bg-slate-100 text-slate-600' },
                    ].map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{p.name}</span>
                            <span className={\`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md \${p.badge}\`}>{p.limit} limit</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">{p.val} <span className="text-slate-400 font-normal text-[10px]">{p.unit}</span></span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className={\`bg-gradient-to-r \${p.bar} h-full rounded-full\`} style={{ width: p.pct }}></div>
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
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">24h AQI Trend — Anand Vihar</p>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-rose-600 inline-block rounded"></span> PM2.5</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-600 inline-block rounded"></span> AQI</span>
                  </div>
                </div>
                <div className="relative h-24">
                  <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[20, 40, 60].map(y => (
                      <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f1f5f9" strokeWidth="1"/>
                    ))}
                    {/* AQI area fill */}
                    <defs>
                      <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02"/>
                      </linearGradient>
                      <linearGradient id="pmFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0.02"/>
                      </linearGradient>
                    </defs>
                    {/* AQI line (violet) — 24h data points */}
                    <polyline
                      points="0,68 17,64 33,58 50,52 67,48 83,44 100,40 117,38 133,36 150,34 167,32 183,30 200,28 217,30 233,34 250,38 267,42 283,46 300,44 317,40 333,36 350,32 367,28 383,26 400,24"
                      fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                    {/* PM2.5 line (rose) */}
                    <polyline
                      points="0,72 17,68 33,62 50,56 67,52 83,48 100,44 117,42 133,40 150,38 167,36 183,34 200,30 217,32 233,36 250,40 267,44 283,48 300,46 317,42 333,38 350,34 367,30 383,28 400,26"
                      fill="none" stroke="#dc2626" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                    {/* Vertical "now" marker */}
                    <line x1="400" y1="0" x2="400" y2="80" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,2"/>
                  </svg>
                  {/* X-axis labels */}
                  <div className="flex justify-between mt-1 text-[9px] font-mono text-slate-400">
                    {['00:00','04:00','08:00','12:00','16:00','20:00','Now'].map(t => <span key={t}>{t}</span>)}
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
                    <p className="text-xs font-extrabold text-rose-900 uppercase tracking-wide mb-1">Emergency Advisory — GRAP Stage IV Active</p>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Restrict all BS-III/IV diesel vehicles in NCR. Suspend primary schools &amp; outdoor activities.
                      Construction banned within 300m of residential zones. Industries on reduced load schedule.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {['BS-IV Diesel Ban', 'School Closure', 'Construction Halt'].map(tag => (
                        <span key={tag} className="text-[9px] font-bold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}`;

if (code.includes(oldModal.substring(0, 100))) {
  code = code.replace(oldModal, newModal);
  fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
  console.log('Modal replaced!');
} else {
  console.log('Old modal not found, trying partial match...');
  const modalStart = code.indexOf('{isAqiModalOpen && (');
  const modalEnd = code.lastIndexOf('      )}');
  if (modalStart !== -1 && modalEnd !== -1) {
    code = code.substring(0, modalStart) + newModal + code.substring(modalEnd + 7);
    fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
    console.log('Modal replaced via partial match!');
  } else {
    console.log('Failed to find modal. Indices:', modalStart, modalEnd);
  }
}
