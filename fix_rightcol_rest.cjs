const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

// 1. Make the 72H Trajectory Chart dynamic
const trajectoryBlock = /<div className=\"flex items-end justify-between h-24 pt-4 px-1 gap-2 border-b border-slate-100\">[\s\S]*?Western disturbance shear expected Fri afternoon/m;
const dynamicTrajectory = `<div className="flex items-end justify-between h-24 pt-4 px-1 gap-2 border-b border-slate-100">
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
                Western disturbance shear expected Fri afternoon`;

code = code.replace(trajectoryBlock, dynamicTrajectory);

// 2. Immediate Interventions section
const interventionsRegex = /\{/\*\s*Action 1: Anand Vihar ISBT\s*\*/\}[\s\S]*?Deploy Smog Guns to Anand Vihar[\s\S]*?font-bold text-rose-800[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/m;
const dynamicIntervention = `{/* Action 1: Dynamic Hotspot */}
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
                    handleAction(1, \`Deploy Smog Guns to \${activeHotspot.label}\`)
                  }
                  className={\`px-2.5 py-1 text-[11px] font-bold rounded-lg transition shadow-xs \${
                    actionsTriggered[1]
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-white border border-slate-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                  }\`}
                >
                  {actionsTriggered[1] ? (
                    <><i className="fa-solid fa-check mr-1.5"></i>Deployed</>
                  ) : (
                    "Deploy"
                  )}
                </button>
              </div>`;

code = code.replace(interventionsRegex, dynamicIntervention);

fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('Fixed Right Column completely!');
