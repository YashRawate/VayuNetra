const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

const mainStartStr = '{/* BEGIN: MainDashboardGrid */}';
const mainStartIndex = code.indexOf(mainStartStr);

const mainEndStr = '{/* BEGIN: MinimalFooter */}';
const mainEndIndex = code.indexOf(mainEndStr);

if (mainStartIndex > -1 && mainEndIndex > -1) {
  let mainContent = code.substring(mainStartIndex, mainEndIndex);
  
  // Need to correctly replace the <main> block, leaving the wrapper.
  
  const modifiedMain = `{activeTab === 'Live GIS Airshed' && (
      <>
        ` + mainContent.replace(/^/gm, '      ') + `
      </>
    )}

    {activeTab === 'Plume Dispersion' && (
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 lg:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500 text-xl shadow-inner">
            <i className="fa-solid fa-fire-burner"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Plume Dispersion Dynamics</h1>
            <p className="text-sm font-medium text-slate-500">Real-time tracking of biomass burning smoke trajectories and thermal anomalies.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 z-10">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700"><i className="fa-solid fa-wind mr-2 text-amber-500"></i>Wind Vector Field</h2>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100">North-Westerly Flow</span>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 opacity-20 bg-[url('https://cartodb-basemaps-c.global.ssl.fastly.net/light_all/7/89/53.png')] bg-cover bg-center"></div>
               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-600/20"></div>
               <div className="relative z-10 text-center">
                 <i className="fa-solid fa-satellite-dish text-4xl text-amber-400 mb-3 opacity-50"></i>
                 <p className="text-sm font-bold text-slate-500">Satellite Telemetry Syncing...</p>
                 <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">VIIRS / MODIS Active Fire Data</p>
               </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-4"><i className="fa-solid fa-temperature-arrow-up mr-2 text-rose-500"></i>Thermal Anomalies</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Punjab & Haryana</span>
                    <span className="text-[10px] text-slate-400 font-medium">Detected last 24h</span>
                  </div>
                  <span className="text-xl font-black text-rose-600">1,248</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Upwind Trajectory</span>
                    <span className="text-[10px] text-slate-400 font-medium">Transport time to NCR</span>
                  </div>
                  <span className="text-lg font-black text-amber-600">14h</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl p-6 border border-slate-700 shadow-lg text-white">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 mb-4"><i className="fa-solid fa-layer-group mr-2 text-indigo-400"></i>Atmospheric Inversion</h2>
              <div className="mt-2 mb-6">
                <span className="text-3xl font-black block">850m</span>
                <span className="text-[10px] uppercase tracking-widest text-indigo-300">Boundary Layer Height</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="w-1/3 bg-indigo-500 h-full rounded-full"></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Severe trapping conditions detected. Plume descent expected post-sunset.</p>
            </div>
          </div>
        </div>
      </main>
    )}

    {activeTab === 'GRAP Action Center' && (
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 lg:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl shadow-inner">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">GRAP Action Center</h1>
              <p className="text-sm font-medium text-slate-500">Graded Response Action Plan Enforcement & Compliance Tracking.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl">
             <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></div>
             <span className="text-sm font-bold text-rose-800 uppercase tracking-widest">Stage IV Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Restrictions', val: '14', icon: 'fa-ban', color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Enforcement Teams', val: '248', icon: 'fa-users-gear', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Challans Issued (24h)', val: '₹4.2M', icon: 'fa-file-invoice-dollar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Compliance Index', val: '68%', icon: 'fa-chart-pie', color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center text-lg \${stat.bg} \${stat.color}\`}>
                <i className={\`fa-solid \${stat.icon}\`}></i>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block leading-none mb-1">{stat.val}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1">
           <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-6"><i className="fa-solid fa-list-check mr-2 text-indigo-500"></i>Current Stage IV Directives</h2>
           <div className="space-y-4">
             {[
               { title: 'Halt all construction activities', desc: 'Complete ban on C&D activities including public projects (highways, flyovers, power transmission).', status: 'Enforced', badge: 'bg-emerald-100 text-emerald-700' },
               { title: 'Ban on BS-IV Diesel Vehicles', desc: 'No entry for heavy and medium goods vehicles into Delhi except essential commodities.', status: 'Enforced', badge: 'bg-emerald-100 text-emerald-700' },
               { title: 'School Closures', desc: 'Physical classes suspended for all grades except 10th and 12th.', status: 'Partial', badge: 'bg-amber-100 text-amber-700' },
               { title: 'Work From Home Directive', desc: '50% attendance for NCR government offices and private corporate sectors.', status: 'Advisory', badge: 'bg-slate-100 text-slate-600' }
             ].map((task, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition cursor-pointer">
                 <div className="flex items-start gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full border-2 border-indigo-200 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 opacity-0 hover:opacity-100 transition"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">{task.desc}</p>
                    </div>
                 </div>
                 <span className={\`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider \${task.badge}\`}>
                   {task.status}
                 </span>
               </div>
             ))}
           </div>
        </div>
      </main>
    )}

    {activeTab === 'Station Telemetry' && (
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 lg:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 text-xl shadow-inner">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Station Telemetry</h1>
            <p className="text-sm font-medium text-slate-500">Deep-dive technical diagnostics for all 38 CAQM monitoring stations.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Station ID</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Zone</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">PM2.5</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">PM10</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Ozone</th>
                  <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Last Calibrated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 'ST-01', zone: 'Anand Vihar', status: 'Online', sColor: 'text-emerald-500', pm25: 312, pm10: 410, o3: 45, cal: '2 days ago' },
                  { id: 'ST-02', zone: 'Jahangirpuri', status: 'Online', sColor: 'text-emerald-500', pm25: 298, pm10: 380, o3: 52, cal: '1 week ago' },
                  { id: 'ST-03', zone: 'ITO Core', status: 'Warning', sColor: 'text-amber-500', pm25: 267, pm10: 352, o3: 61, cal: 'Sensor Drift' },
                  { id: 'ST-04', zone: 'Noida Sec 62', status: 'Online', sColor: 'text-emerald-500', pm25: 245, pm10: 310, o3: 48, cal: '3 days ago' },
                  { id: 'ST-05', zone: 'Gurugram Cyber', status: 'Offline', sColor: 'text-slate-400', pm25: '--', pm10: '--', o3: '--', cal: 'Power Failure' },
                  { id: 'ST-06', zone: 'Karnal Entry', status: 'Online', sColor: 'text-emerald-500', pm25: 185, pm10: 220, o3: 35, cal: '5 days ago' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition cursor-pointer">
                    <td className="p-4 font-mono text-xs font-bold text-slate-700">{row.id}</td>
                    <td className="p-4 text-sm font-bold text-slate-900">{row.zone}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className={\`w-1.5 h-1.5 rounded-full \${row.status === 'Online' ? 'bg-emerald-500' : row.status === 'Warning' ? 'bg-amber-500' : 'bg-slate-300'}\`}></div>
                        <span className={\`text-xs font-bold \${row.sColor}\`}>{row.status}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm font-bold text-rose-600">{row.pm25}</td>
                    <td className="p-4 font-mono text-sm font-bold text-rose-500">{row.pm10}</td>
                    <td className="p-4 font-mono text-sm font-bold text-slate-600">{row.o3}</td>
                    <td className="p-4 text-xs font-medium text-slate-500">{row.cal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    )}`;

  code = code.substring(0, mainStartIndex) + modifiedMain + code.substring(mainEndIndex);
  fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
  console.log('Successfully injected conditional tabs into VayuCommandDashboard.jsx');
} else {
  console.log('Could not find main start or end markers');
}
