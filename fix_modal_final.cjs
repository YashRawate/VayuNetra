const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

// 1. Fix Modal Peak Label
code = code.replace(
  /<span className="text-slate-400">Peak:<\/span>[\s\S]*?<span className="font-extrabold text-purple-900">[\s\S]*?Anand Vihar 452[\s\S]*?<\/span>/m,
  '<span className="text-slate-400">Peak:</span>\n<span className="font-extrabold text-purple-900">\n{activeHotspot.label} {activeHotspot.aqi}\n</span>'
);

// 2. Fix Modal Chemical Speciation Bars
const specRegex = /\{\[\s*\{\s*name:\s*"PM 2\.5",\s*val:\s*312,[\s\S]*?\]\.map/m;
const dynamicSpec = `{[{ name: 'PM 2.5', val: pm25Val, unit: '/ 60 µg/m³', limit: \`\${(pm25Val / 60).toFixed(1)}x\`, pct: \`\${pm25Pct}%\`, bar: 'from-rose-600 to-rose-500', badge: 'bg-rose-100 text-rose-800' },
                      { name: 'PM 10', val: pm10Val, unit: '/ 100 µg/m³', limit: \`\${(pm10Val / 100).toFixed(1)}x\`, pct: \`\${pm10Pct}%\`, bar: 'from-red-700 to-red-500', badge: 'bg-red-100 text-red-800' },
                      { name: 'NO₂', val: no2Val, unit: '/ 80 µg/m³', limit: \`\${(no2Val / 80).toFixed(1)}x\`, pct: \`\${no2Pct}%\`, bar: 'from-amber-500 to-yellow-400', badge: 'bg-amber-100 text-amber-800' },
                      { name: 'CO', val: coVal, unit: '/ 2.0 mg/m³', limit: \`\${(parseFloat(coVal) / 2.0).toFixed(1)}x\`, pct: \`\${coPct}%\`, bar: 'from-amber-600 to-amber-400', badge: 'bg-orange-100 text-orange-800' },
                      { name: 'SO₂', val: so2Val, unit: '/ 40 µg/m³', limit: \`\${(so2Val / 40).toFixed(1)}x\`, pct: \`\${so2Pct}%\`, bar: 'from-slate-400 to-slate-300', badge: 'bg-slate-100 text-slate-600' }
                    ].map`;
code = code.replace(specRegex, dynamicSpec);

// 3. Fix Donut Chart values
const donutLegendRegex = /\{\[\s*\{\s*label:\s*"PM 2\.5",\s*pct:\s*"48%",\s*color:\s*"bg-red-600",\s*val:\s*"312 µg",\s*\},[\s\S]*?\]\.map/m;
const dynamicDonut = `{[{ label: 'PM 2.5', pct: \`\${Math.round((pm25Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-red-600', val: \`\${pm25Val} µg\` },
                        { label: 'PM 10', pct: \`\${Math.round((pm10Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-violet-600', val: \`\${pm10Val} µg\` },
                        { label: 'NO₂', pct: \`\${Math.round((no2Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-amber-500', val: \`\${no2Val} µg\` },
                        { label: 'CO', pct: \`\${Math.round((parseFloat(coVal) / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-emerald-500', val: \`\${coVal} mg\` },
                        { label: 'SO₂', pct: \`\${Math.round((so2Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 100)}%\`, color: 'bg-slate-500', val: \`\${so2Val} µg\` }
                      ].map`;
code = code.replace(donutLegendRegex, dynamicDonut);

// 4. Fix Zone-Wise AQI Comparison Chart
const zoneWiseRegex = /\{\[\s*\{\s*label:\s*"Anand Vihar",\s*aqi:\s*452,\s*pct:\s*90,\s*color:\s*"bg-purple-900",\s*\},[\s\S]*?\]\.map\(\(z,\s*i\)\s*=>\s*\([\s\S]*?<\/div>\s*\)\)/m;
const dynamicZoneWise = `{hotspots.map((z, i) => {
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
                    })}`;
code = code.replace(zoneWiseRegex, dynamicZoneWise);

// 5. Replace Advisory string
const advRegex = /Restrict all BS-III\/IV diesel vehicles in NCR\. Suspend primary schools & outdoor activities\.[\s\S]*?reduced load schedule\./m;
code = code.replace(advRegex, '{getAdvisory(activeHotspot.tag)}');

// 6. Replace Advisory tags
const tagsRegex = /\{\[\s*"BS-IV Diesel Ban",\s*"School Closure",\s*"Construction Halt",\s*\]\.map/m;
code = code.replace(tagsRegex, '{getAdvisoryTags(activeHotspot.tag).map');

// 7. Dynamic donut pie slice stroke array (the percentages)
code = code.replace(/strokeDasharray="42 88"/, 'strokeDasharray={`\${((pm25Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88`}');
code = code.replace(/strokeDasharray="22 108"/, 'strokeDasharray={`\${((pm10Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88`}');
code = code.replace(/strokeDasharray="13 117"/, 'strokeDasharray={`\${((no2Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88`}');
code = code.replace(/strokeDasharray="7 123"/, 'strokeDasharray={`\${((parseFloat(coVal) / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88`}');
code = code.replace(/strokeDasharray="4 126"/, 'strokeDasharray={`\${((so2Val / (pm25Val + pm10Val + no2Val + parseFloat(coVal) + so2Val)) * 88).toFixed(1)} 88`}');

fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('Fixed ALL remaining hardcoded modal values.');
