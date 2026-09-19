const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');
const lines = code.split('\n');

// Helper: replace a single line (0-indexed)
function setLine(lineNum, newContent) {
  lines[lineNum - 1] = newContent;
}

// Helper: replace a range of lines with new content (1-indexed, inclusive)
function replaceRange(startLine, endLine, newLines) {
  lines.splice(startLine - 1, endLine - startLine + 1, ...newLines);
}

// ── Find all occurrences of hardcoded values and their line numbers ──
lines.forEach((line, i) => {
  const ln = i + 1;
  
  // ── 1. Hotspot Leaderboard composite summary bar (shows composite 387 / SEVERE) ──
  //    These are non-selected-hotspot composite values — keep as NCR average, don't change.

  // ── 2. Inline RIGHT COLUMN: Regional AQI Gauge card ──
  // Line 550: "                       387"
  if (ln === 550 && line.trim() === '387') {
    lines[i] = line.replace('387', '{activeHotspot.aqi}');
  }
  // Line 553: "                       SEVERE"  
  if (ln === 553 && line.trim() === 'SEVERE') {
    lines[i] = line.replace('SEVERE', '{activeHotspot.tag}');
  }

  // ── 3. Inline RIGHT COLUMN gauge arc (strokeDasharray) ──
  // Find inline card's first SVG gauge arc
  if (ln >= 940 && ln <= 1000 && line.includes('strokeDasharray') && line.includes('77.4, 100')) {
    lines[i] = line.replace('"77.4, 100"', '{`${gaugeArc}, 100`}');
    console.log(`Fixed gauge arc at line ${ln}`);
  }

  // ── 4. Inline RIGHT COLUMN: "387" and "SEVERE" in the big AQI circle ──
  if (ln >= 960 && ln <= 1010) {
    if (line.includes('>387<') || (line.trim() === '387')) {
      lines[i] = line.replace(/>387</, '>{activeHotspot.aqi}<').replace(/^\s*387\s*$/, line.replace('387', '{activeHotspot.aqi}'));
      console.log(`Fixed aqi number at line ${ln}`);
    }
    if (line.includes('>SEVERE<') || (line.trim() === 'SEVERE')) {
      lines[i] = line.replace(/>SEVERE</, '>{activeHotspot.tag}<').replace(/^\s*SEVERE\s*$/, line.replace('SEVERE', '{activeHotspot.tag}'));
      console.log(`Fixed tag at line ${ln}`);
    }
    if (line.includes('Anand Vihar (452)')) {
      lines[i] = line.replace('Anand Vihar (452)', '{activeHotspot.label} ({activeHotspot.aqi})');
      console.log(`Fixed hotspot name at line ${ln}`);
    }
    if (line.includes('Emergency Protocol: Restrict all BS-III/IV diesel vehicles & suspend primary schools.')) {
      lines[i] = line.replace(
        'Emergency Protocol: Restrict all BS-III/IV diesel vehicles & suspend primary schools.',
        '{getAdvisory(activeHotspot.tag)}'
      );
      console.log(`Fixed advisory at line ${ln}`);
    }
  }

  // ── 5. Inline RIGHT COLUMN: Chemical Speciation bars ──
  // PM2.5 val, limit
  if (ln >= 1020 && ln <= 1160) {
    // These are the inline card speciation values - check for exact patterns
    if (line.includes('5.2x limit') && line.includes('bg-rose-100')) {
      lines[i] = line.replace('5.2x limit', '{`${(pm25Val/60).toFixed(1)}x limit`}');
      console.log(`Fixed PM25 limit at line ${ln}`);
    }
    if (line.includes('4.1x limit') && line.includes('bg-red-100')) {
      lines[i] = line.replace('4.1x limit', '{`${(pm10Val/100).toFixed(1)}x limit`}');
      console.log(`Fixed PM10 limit at line ${ln}`);
    }
    if (line.includes('0.8x limit') && line.includes('bg-amber-100')) {
      lines[i] = line.replace('0.8x limit', '{`${(no2Val/80).toFixed(1)}x limit`}');
      console.log(`Fixed NO2 limit at line ${ln}`);
    }
    if (line.includes('1.4x limit') && line.includes('bg-amber-100')) {
      lines[i] = line.replace('1.4x limit', '{`${(parseFloat(coVal)/2.0).toFixed(1)}x limit`}');
      console.log(`Fixed CO limit at line ${ln}`);
    }
    // PM2.5 value "312"
    if (line.includes('312{" "}')) {
      lines[i] = line.replace('312{" "}', '{pm25Val}{" "}');
      console.log(`Fixed PM25 val at line ${ln}`);
    }
    // PM10 value "410"
    if (line.includes('410{" "}')) {
      lines[i] = line.replace('410{" "}', '{pm10Val}{" "}');
      console.log(`Fixed PM10 val at line ${ln}`);
    }
    // NO2 value "68"
    if (line.includes('68{" "}')) {
      lines[i] = line.replace('68{" "}', '{no2Val}{" "}');
      console.log(`Fixed NO2 val at line ${ln}`);
    }
    // CO value "2.8"
    if (line.includes('2.8{" "}')) {
      lines[i] = line.replace('2.8{" "}', '{coVal}{" "}');
      console.log(`Fixed CO val at line ${ln}`);
    }
    // Bar widths
    if (line.includes('style={{ width: "88%" }}') && lines[i-5] && lines[i-5].includes('PM')) {
      lines[i] = line.replace('"88%"', '`${pm25Pct}%`');
      console.log(`Fixed PM25 bar at line ${ln}`);
    }
    if (line.includes('style={{ width: "92%" }}')) {
      lines[i] = line.replace('"92%"', '`${pm10Pct}%`');
      console.log(`Fixed PM10 bar at line ${ln}`);
    }
    if (line.includes('style={{ width: "65%" }}')) {
      lines[i] = line.replace('"65%"', '`${no2Pct}%`');
      console.log(`Fixed NO2 bar at line ${ln}`);
    }
    if (line.includes('style={{ width: "70%" }}')) {
      lines[i] = line.replace('"70%"', '`${coPct}%`');
      console.log(`Fixed CO bar at line ${ln}`);
    }
  }

  // ── 6. NAQI spectrum bar "387" marker ──
  if (ln >= 1130 && ln <= 1165 && line.includes('387')) {
    lines[i] = line.replace(/387/g, '{activeHotspot.aqi}');
    console.log(`Fixed NAQI marker at line ${ln}`);
  }

  // ── 7. MODAL: gauge number, tag, hotspot name ──
  if (ln >= 1420 && ln <= 1520) {
    if (line.trim() === '387') {
      lines[i] = line.replace('387', '{activeHotspot.aqi}');
      console.log(`Fixed modal gauge at line ${ln}`);
    }
    if (line.trim() === 'SEVERE') {
      lines[i] = line.replace('SEVERE', '{activeHotspot.tag}');
      console.log(`Fixed modal tag at line ${ln}`);
    }
    if (line.includes('Anand Vihar (452)')) {
      lines[i] = line.replace('Anand Vihar (452)', '{activeHotspot.label} ({activeHotspot.aqi})');
      console.log(`Fixed modal hotspot name at line ${ln}`);
    }
    if (line.includes('strokeDasharray') && line.includes('77.4, 100')) {
      lines[i] = line.replace('"77.4, 100"', '{`${gaugeArc}, 100`}');
      console.log(`Fixed modal gauge arc at line ${ln}`);
    }
    if (line.includes('Emergency Protocol: Restrict all BS-III/IV diesel')) {
      lines[i] = line.replace(
        'Emergency Protocol: Restrict all BS-III/IV diesel',
        '{getAdvisory(activeHotspot.tag)} {/* '
      );
    }
    if (line.includes('vehicles & suspend primary schools.')) {
      lines[i] = line.replace('vehicles & suspend primary schools.', '*/}');
    }
  }
  
  // ── 8. Modal "Anand Vihar 452" peak label ──
  if (ln >= 1460 && ln <= 1540 && line.includes('Anand Vihar 452')) {
    lines[i] = line.replace('Anand Vihar 452', '{activeHotspot.label} {activeHotspot.aqi}');
    console.log(`Fixed modal peak label at line ${ln}`);
  }
  
  // ── 9. Modal large donut "387" and "SEVERE" ──
  if (ln >= 1454 && ln <= 1475) {
    if (line.trim() === '387') {
      lines[i] = line.replace('387', '{activeHotspot.aqi}');
      console.log(`Fixed modal donut aqi at line ${ln}`);
    }
    if (line.trim() === 'SEVERE') {
      lines[i] = line.replace('SEVERE', '{activeHotspot.tag}');
      console.log(`Fixed modal donut tag at line ${ln}`);
    }
  }

  // ── 10. Modal advisory text ──  
  if (ln >= 1700 && ln <= 1800 && line.includes('Restrict all BS-III/IV diesel vehicles in NCR')) {
    lines[i] = line.replace(
      /Restrict all BS-III/,
      '{getAdvisory(activeHotspot.tag)} {/* Restrict all BS-III'
    );
  }
  if (ln >= 1700 && ln <= 1800 && line.includes('Construction banned within')) {
    lines[i] = '*/}';
  }

  // ── 11. 24h trend chart title: "ANAND VIHAR" → dynamic ──
  if (line.includes('24H AQI TREND — ANAND VIHAR')) {
    lines[i] = line.replace('24H AQI TREND — ANAND VIHAR', '24H AQI TREND — {activeHotspot.label.toUpperCase()}');
    console.log(`Fixed trend title at line ${ln}`);
  }
  
  // ── 12. Modal station subtitle ──
  if (line.includes('Delhi NCR Airshed · CPCB Telemetry · Live Data')) {
    lines[i] = line.replace('Delhi NCR Airshed · CPCB Telemetry · Live Data', '{activeHotspot.label} Station · CPCB Telemetry · Live Data');
    console.log(`Fixed modal subtitle at line ${ln}`);
  }
});

code = lines.join('\n');
fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('\nAll dynamic replacements done!');
