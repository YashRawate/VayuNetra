const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

// ── STEP 1: Inject computed helpers after the hotspots array (after line 95 `];`) ──
const afterHotspots = `  ];

  // ── Derived data for selected hotspot ──
  const activeHotspot = hotspots.find(h => selectedHotspot.includes(h.name.split(' ')[0])) || hotspots[0];

  const getAdvisory = (tag) => {
    if (tag === 'HAZ')   return 'Emergency Protocol: Restrict all BS-III/IV diesel vehicles & suspend primary schools. GRAP Stage IV enforced.';
    if (tag === 'SEV+')  return 'GRAP Stage III Active: Heavy vehicle restrictions & mandatory 50% WFH for govt. employees.';
    if (tag === 'SEV')   return 'GRAP Stage III: Diesel gen-sets banned, construction restricted, schools on advisory.';
    if (tag === 'V.POOR')return 'GRAP Stage II: Mechanised road sweeping intensified. Outdoor exercise advisory issued.';
    return 'GRAP Stage I: Preventive measures in place. Monitor AQI regularly.';
  };

  const getGaugeColor = (tag) => {
    if (tag === 'HAZ')    return '#7c2d12';
    if (tag === 'SEV+')   return '#991b1b';
    if (tag === 'SEV')    return '#b91c1c';
    if (tag === 'V.POOR') return '#d97706';
    return '#b45309';
  };

  const getAdvisoryTags = (tag) => {
    if (tag === 'HAZ')    return ['BS-IV Diesel Ban','School Closure','Construction Halt'];
    if (tag === 'SEV+')   return ['Heavy Vehicle Ban','WFH Advisory','Dust Control'];
    if (tag === 'SEV')    return ['Diesel Gen-set Ban','Construction Curb','Health Advisory'];
    if (tag === 'V.POOR') return ['Road Sweeping','AQI Monitoring','Outdoor Advisory'];
    return ['Preventive Measures','AQI Monitoring'];
  };

  // Scaled pollution values from AQI
  const hs = activeHotspot;
  const pm25Val  = Math.round(hs.aqi * 0.69);
  const pm10Val  = Math.round(hs.aqi * 0.91);
  const no2Val   = Math.round(hs.aqi * 0.15);
  const coVal    = (hs.aqi * 0.0062).toFixed(1);
  const so2Val   = Math.round(hs.aqi * 0.027);
  const pm25Pct  = Math.min(96, Math.round((pm25Val / 320) * 100));
  const pm10Pct  = Math.min(96, Math.round((pm10Val / 430) * 100));
  const no2Pct   = Math.min(96, Math.round((no2Val  / 80)  * 100));
  const coPct    = Math.min(96, Math.round((parseFloat(coVal) / 2.8) * 100));
  const so2Pct   = Math.min(96, Math.round((so2Val  / 15)  * 100));
  const gaugeArc = ((hs.aqi / 500) * 100).toFixed(1);`;

// Replace the hardcoded `];` after hotspots array
code = code.replace(
  `  ];\n\n  // Action Items State`,
  afterHotspots + `\n\n  // Action Items State`
);

// ── STEP 2: Update the inline RIGHT-COLUMN AQI card ──
// Replace hardcoded "387" gauge, "SEVERE", "Anand Vihar (452)"
code = code.replace(
  `                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.6"></path>
                  <path className="text-red-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="77.4, 100" strokeLinecap="round" strokeWidth="3.6"></path>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-mono text-slate-900 tracking-tight leading-none">387</span>
                  <span className="text-[9px] font-extrabold text-red-700 uppercase mt-0.5 tracking-wider">SEVERE</span>
                </div>`,
  `                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.6"></path>
                  <path className="text-red-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={\`\${gaugeArc}, 100\`} strokeLinecap="round" strokeWidth="3.6"></path>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-mono text-slate-900 tracking-tight leading-none">{activeHotspot.aqi}</span>
                  <span className="text-[9px] font-extrabold text-red-700 uppercase mt-0.5 tracking-wider">{activeHotspot.tag}</span>
                </div>`
);

// Replace "Anand Vihar (452)" in inline card
code = code.replace(
  `                  <p className="text-xs font-extrabold text-slate-900">Anand Vihar (452)</p>`,
  `                  <p className="text-xs font-extrabold text-slate-900">{activeHotspot.label} ({activeHotspot.aqi})</p>`
);

// Replace advisory text in inline card
code = code.replace(
  `                      <p className="text-[10px] font-semibold text-rose-800 leading-tight">
                          Emergency Protocol: Restrict all BS-III/IV diesel vehicles & suspend primary schools.
                        </p>`,
  `                      <p className="text-[10px] font-semibold text-rose-800 leading-tight">{getAdvisory(activeHotspot.tag)}</p>`
);

// ── STEP 3: Update MODAL gauge + values ──
// Modal gauge arc
code = code.replace(
  `                      <path
                        className="text-red-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="77.4, 100"
                        strokeLinecap="round"
                        strokeWidth="3.6"
                      ></path>`,
  `                      <path
                        className="text-red-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={\`\${gaugeArc}, 100\`}
                        strokeLinecap="round"
                        strokeWidth="3.6"
                      ></path>`
);

// Modal gauge number + severity label
code = code.replace(
  `                      <span className="text-3xl font-black font-mono text-slate-900 tracking-tight leading-none">
                        387
                      </span>
                      <span className="text-[9px] font-extrabold text-red-700 uppercase mt-0.5 tracking-wider">
                        SEVERE
                      </span>`,
  `                      <span className="text-3xl font-black font-mono text-slate-900 tracking-tight leading-none">
                        {activeHotspot.aqi}
                      </span>
                      <span className="text-[9px] font-extrabold text-red-700 uppercase mt-0.5 tracking-wider">
                        {activeHotspot.tag}
                      </span>`
);

// Modal "Anand Vihar (452)"
code = code.replace(
  `                      <p className="text-xs font-extrabold text-slate-900">
                        Anand Vihar (452)
                      </p>`,
  `                      <p className="text-xs font-extrabold text-slate-900">
                        {activeHotspot.label} ({activeHotspot.aqi})
                      </p>`
);

// Modal advisory text
code = code.replace(
  `                        <p className="text-[10px] font-semibold text-rose-800 leading-tight">
                          Emergency Protocol: Restrict all BS-III/IV diesel
                          vehicles & suspend primary schools.
                        </p>`,
  `                        <p className="text-[10px] font-semibold text-rose-800 leading-tight">
                          {getAdvisory(activeHotspot.tag)}
                        </p>`
);

// Modal title showing "Delhi NCR Airshed · CPCB Telemetry · Live Data"
code = code.replace(
  `                  <p className="text-[10px] text-slate-400 font-medium">Delhi NCR Airshed · CPCB Telemetry · Live Data</p>`,
  `                  <p className="text-[10px] text-slate-400 font-medium">{activeHotspot.label} Station · CPCB Telemetry · Live Data</p>`
);

// ── STEP 4: Dynamic modal – make modal donut gauge dynamic ──
// The big modal donut gauge arc
code = code.replace(
  `                    <circle cx="18" cy="18" r="14" fill="none" stroke="url(#aqiGrad)"
                        strokeDasharray="77.4, 100" strokeLinecap="round" strokeWidth="3.8"></circle>`,
  `                    <circle cx="18" cy="18" r="14" fill="none" stroke="url(#aqiGrad)"
                        strokeDasharray={\`\${gaugeArc}, 100\`} strokeLinecap="round" strokeWidth="3.8"></circle>`
);

// Modal main donut number + label
code = code.replace(
  `                      <span className="text-4xl font-black font-mono text-slate-900 leading-none">387</span>
                      <span className="text-[9px] font-extrabold text-red-700 uppercase mt-1 tracking-widest bg-red-50 px-2 py-0.5 rounded-full">SEVERE</span>`,
  `                      <span className="text-4xl font-black font-mono text-slate-900 leading-none">{activeHotspot.aqi}</span>
                      <span className="text-[9px] font-extrabold text-red-700 uppercase mt-1 tracking-widest bg-red-50 px-2 py-0.5 rounded-full">{activeHotspot.tag}</span>`
);

// Modal "Peak Hotspot" label
code = code.replace(
  `                    <span className="font-extrabold text-purple-900">Anand Vihar 452</span>`,
  `                    <span className="font-extrabold text-purple-900">{activeHotspot.label} {activeHotspot.aqi}</span>`
);

// ── STEP 5: Dynamic Chemical Speciation bars in modal ──
// Replace the static speciation data array with a dynamic one
code = code.replace(
  `                    {[
                      { name: 'PM 2.5', val: 312, unit: '/ 60 µg/m³', limit: '5.2x', pct: '88%', bar: 'from-rose-600 to-rose-500', badge: 'bg-rose-100 text-rose-800' },
                      { name: 'PM 10', val: 410, unit: '/ 100 µg/m³', limit: '4.1x', pct: '92%', bar: 'from-red-700 to-red-500', badge: 'bg-red-100 text-red-800' },
                      { name: 'NO₂', val: 68, unit: '/ 80 µg/m³', limit: '0.8x', pct: '65%', bar: 'from-amber-500 to-yellow-400', badge: 'bg-amber-100 text-amber-800' },
                      { name: 'CO', val: '2.8', unit: '/ 2.0 mg/m³', limit: '1.4x', pct: '70%', bar: 'from-amber-600 to-amber-400', badge: 'bg-orange-100 text-orange-800' },
                      { name: 'SO₂', val: 12, unit: '/ 40 µg/m³', limit: '0.3x', pct: '30%', bar: 'from-slate-400 to-slate-300', badge: 'bg-slate-100 text-slate-600' },
                    ].map((p, i) => (`,
  `                    {[
                      { name: 'PM 2.5', val: pm25Val, unit: '/ 60 µg/m³', limit: \`\${(pm25Val/60).toFixed(1)}x\`, pct: \`\${pm25Pct}%\`, bar: 'from-rose-600 to-rose-500', badge: 'bg-rose-100 text-rose-800' },
                      { name: 'PM 10', val: pm10Val, unit: '/ 100 µg/m³', limit: \`\${(pm10Val/100).toFixed(1)}x\`, pct: \`\${pm10Pct}%\`, bar: 'from-red-700 to-red-500', badge: 'bg-red-100 text-red-800' },
                      { name: 'NO₂', val: no2Val, unit: '/ 80 µg/m³', limit: \`\${(no2Val/80).toFixed(1)}x\`, pct: \`\${no2Pct}%\`, bar: 'from-amber-500 to-yellow-400', badge: 'bg-amber-100 text-amber-800' },
                      { name: 'CO', val: coVal, unit: '/ 2.0 mg/m³', limit: \`\${(parseFloat(coVal)/2.0).toFixed(1)}x\`, pct: \`\${coPct}%\`, bar: 'from-amber-600 to-amber-400', badge: 'bg-orange-100 text-orange-800' },
                      { name: 'SO₂', val: so2Val, unit: '/ 40 µg/m³', limit: \`\${(so2Val/40).toFixed(1)}x\`, pct: \`\${so2Pct}%\`, bar: 'from-slate-400 to-slate-300', badge: 'bg-slate-100 text-slate-600' },
                    ].map((p, i) => (`
);

// ── STEP 6: Dynamic advisory banner tags ──
code = code.replace(
  `                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Restrict all BS-III/IV diesel vehicles in NCR. Suspend primary schools &amp; outdoor activities.
                      Construction banned within 300m of residential zones. Industries on reduced load schedule.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {['BS-IV Diesel Ban', 'School Closure', 'Construction Halt'].map(tag => (
                        <span key={tag} className="text-[9px] font-bold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>`,
  `                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      {getAdvisory(activeHotspot.tag)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getAdvisoryTags(activeHotspot.tag).map(tag => (
                        <span key={tag} className="text-[9px] font-bold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>`
);

// ── STEP 7: Zone-wise bar chart – highlight the active hotspot ──
// The zone comparison chart already uses hardcoded labels. Make it dynamic and highlight selected.
code = code.replace(
  `                  <div className="space-y-2">
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
                  </div>`,
  `                  <div className="space-y-2">
                    {hotspots.map((z, i) => {
                      const isActive = z.name === activeHotspot.name;
                      const colors = ['bg-purple-900','bg-rose-700','bg-rose-600','bg-red-500','bg-orange-500','bg-amber-400'];
                      return (
                        <div key={i} className={\`flex items-center gap-2 text-[11px] \${isActive ? 'ring-1 ring-rose-400 bg-rose-50 rounded-lg px-1 py-0.5 -mx-1' : ''}\`}>
                          <span className={\`w-24 shrink-0 truncate \${isActive ? 'font-bold text-rose-700' : 'text-slate-600 font-medium'}\`}>{z.label}</span>
                          <div className="flex-1 bg-slate-100 h-3.5 rounded-full overflow-hidden">
                            <div className={\`\${colors[i] || 'bg-slate-400'} h-full rounded-full transition-all\`} style={{ width: z.width }}></div>
                          </div>
                          <span className={\`w-9 text-right font-mono font-bold shrink-0 \${isActive ? 'text-rose-700' : 'text-slate-800'}\`}>{z.aqi}</span>
                        </div>
                      );
                    })}
                  </div>`
);

fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('Dynamic hotspot binding complete!');
