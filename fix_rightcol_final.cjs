const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

// 1. Make the 72H Trajectory Chart dynamic
const trajectoryBlockStart = code.indexOf('<div className="flex items-end justify-between h-24 pt-4 px-1 gap-2 border-b border-slate-100">');
const trajectoryBlockEnd = code.indexOf('Western disturbance shear expected Fri afternoon');
if (trajectoryBlockStart > -1 && trajectoryBlockEnd > -1) {
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
                `;
  
  code = code.substring(0, trajectoryBlockStart) + dynamicTrajectory + code.substring(trajectoryBlockEnd);
}

// 2. Immediate Interventions section
code = code.replace(/Anand Vihar ISBT/g, '{activeHotspot.label} Core');
code = code.replace(/Deploy Smog Guns to Anand Vihar/g, 'Deploy Smog Guns to {activeHotspot.label}');
code = code.replace(/handleAction\(1, "Deploy Smog Guns to \{activeHotspot\.label\}"\)/g, 'handleAction(1, `Deploy Smog Guns to ${activeHotspot.label}`)');

fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('Fixed Right Column completely!');
