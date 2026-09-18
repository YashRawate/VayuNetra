import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// ── Windy.com speed → color ramp (Adapted for Light Map) ─────────────
// Darker, saturated colors to contrast against the white/light basemap
function speedToRGB(speed) {
  if (speed < 0.80) return [40, 20, 150];  // deep purple/indigo
  if (speed < 1.20) return [0,  70, 200];  // dark royal blue
  if (speed < 1.65) return [0,  120, 160]; // deep teal/cyan
  if (speed < 2.10) return [0,  140, 60];  // dark green
  return                   [180, 100, 0];  // dark orange/brown for fastest
}

export default function MapColumn({
  selectedZone = "Delhi NCR (all)",
  layers = { heatmap: true, plume: true, stations: false },
  stations = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef  = useRef(null);
  const layerGroupsRef  = useRef({ heatmap: null, plume: null, stations: null });
  const [timeframe, setTimeframe] = useState('Now');

  const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const zoneData = [
    { zone: "East Delhi",    aqi: 445, category: "severe",    lat: 28.63, lng: 77.30, radius: 14 },
    { zone: "North Delhi",   aqi: 410, category: "severe",    lat: 28.74, lng: 77.14, radius: 15 },
    { zone: "Central Delhi", aqi: 387, category: "severe",    lat: 28.62, lng: 77.21, radius: 13 },
    { zone: "South Delhi",   aqi: 340, category: "very_poor", lat: 28.52, lng: 77.20, radius: 13 },
    { zone: "Noida",         aqi: 360, category: "very_poor", lat: 28.57, lng: 77.34, radius: 14 },
    { zone: "Gurugram",      aqi: 310, category: "very_poor", lat: 28.46, lng: 77.03, radius: 15 }
  ];

  const canvasRef     = useRef(null);
  const animFrameRef  = useRef(null);
  const particlesRef  = useRef([]);
  const windActiveRef = useRef(false);

  // ─── Map init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [28.65, 77.15], zoom: 10,
      zoomControl: true, attributionControl: false, scrollWheelZoom: true
    });
    L.tileLayer(tileUrl, { maxZoom: 18, subdomains: 'abcd' }).addTo(map);
    layerGroupsRef.current.heatmap  = L.layerGroup().addTo(map);
    layerGroupsRef.current.plume    = L.layerGroup().addTo(map);
    layerGroupsRef.current.stations = L.layerGroup();
    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);
  }, []);

  // ─── Heatmap ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const group = layerGroupsRef.current.heatmap;
    if (!group) return;
    group.clearLayers();
    if (!layers.heatmap) return;
    zoneData.forEach(z => {
      const isSevere = z.category === 'severe';
      const color = isSevere ? '#C4451C' : '#B8860B';
      L.circle([z.lat, z.lng], {
        radius: z.radius * 240, color: 'transparent', fillColor: color, fillOpacity: 0.22
      }).addTo(group);
      L.circleMarker([z.lat, z.lng], {
        radius: 8, color: '#FFFFFF', weight: 1.5, fillColor: color, fillOpacity: 0.9
      }).addTo(group);
      L.marker([z.lat, z.lng], {
        icon: L.divIcon({
          className: 'map-in-place-label',
          html: `<div style="background:rgba(255,255,255,0.93);border:1px solid #E3E1D9;
            border-radius:4px;padding:2px 6px;font-size:11px;font-family:Inter,sans-serif;
            font-weight:600;color:#1C1B18;white-space:nowrap;
            box-shadow:0 1px 3px rgba(0,0,0,0.08);transform:translate(-50%,-100%);margin-top:-10px;
          ">${z.zone} · <span style="color:${color}">${z.aqi}</span></div>`,
          iconSize: [0, 0]
        })
      }).addTo(group);
    });
  }, [layers.heatmap, timeframe]);

  // ─── Punjab ↔ Delhi Wind Flow ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    windActiveRef.current = layers.plume;

    if (!layers.plume) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    // ── Corridor geometry ──────────────────────────────────────────────────────
    // Punjab is NW of Delhi. In canvas coords (y-down), NW→SE means
    // dx = +cos(45°) = +0.707 (rightward), dy = +sin(45°) = +0.707 (downward)
    // So the corridor goes from top-left corner toward bottom-right corner.
    const ANGLE_RAD = 45 * (Math.PI / 180);
    const aX = Math.cos(ANGLE_RAD);   // +0.707  along-corridor unit x
    const aY = Math.sin(ANGLE_RAD);   // +0.707  along-corridor unit y
    const nX = -aY;                   // -0.707  normal unit x (perpendicular)
    const nY =  aX;                   // +0.707  normal unit y

    const N_PARTICLES = 340;
    const TAIL_LEN    = 42;

    function getCorridorHalfW(cw, ch) {
      return Math.min(cw, ch) * 0.26; // corridor occupies ~52% of the shorter dimension
    }

    // Build 4-corner corridor polygon points for clipping/drawing
    function corridorCorners(cw, ch) {
      const cx = cw / 2, cy = ch / 2;
      const hw = getCorridorHalfW(cw, ch);
      const ext = Math.max(cw, ch) * 1.3;
      return [
        { x: cx - aX * ext + nX * hw,  y: cy - aY * ext + nY * hw  }, // NW top edge
        { x: cx - aX * ext - nX * hw,  y: cy - aY * ext - nY * hw  }, // NW bottom edge
        { x: cx + aX * ext - nX * hw,  y: cy + aY * ext - nY * hw  }, // SE bottom edge
        { x: cx + aX * ext + nX * hw,  y: cy + aY * ext + nY * hw  }, // SE top edge
      ];
    }

    function spawnParticle(cw, ch) {
      const cx  = cw / 2, cy = ch / 2;
      const hw  = getCorridorHalfW(cw, ch);
      const ext = Math.max(cw, ch) * 0.68;

      // 55% Punjab→Delhi (SE direction), 45% Delhi→Punjab (NW direction)
      const toSE = Math.random() < 0.55;
      const dir  = toSE ? 1 : -1;

      // Random offset within corridor width
      const perp = (Math.random() - 0.5) * 2 * hw * 0.9;

      // Spawn from the corridor ENTRY edge (opposite end to travel direction)
      const startAlong = -dir * ext;
      const x = cx + startAlong * aX + perp * nX;
      const y = cy + startAlong * aY + perp * nY;

      const speed   = 0.8 + Math.random() * 1.5;
      const jitter  = (Math.random() - 0.5) * 0.15;
      const life    = Math.floor(Math.random() * 200 + 100);

      return {
        x, y,
        vx: dir * speed * aX + jitter * nX,
        vy: dir * speed * aY + jitter * nY,
        speed,
        life, maxLife: life,
        tail: [],
        phase:   Math.random() * Math.PI * 2,
        meander: (Math.random() - 0.5) * 0.009
      };
    }

    // Size canvas
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;
    const cw = canvas.width, ch = canvas.height;

    // Seed particles pre-aged so they fill the corridor immediately on load
    particlesRef.current = Array.from({ length: N_PARTICLES }, () => {
      const p = spawnParticle(cw, ch);
      const preAge = Math.floor(Math.random() * p.life * 0.80);
      p.x   += p.vx * preAge;
      p.y   += p.vy * preAge;
      p.life -= preAge;
      p.phase += preAge * 0.04;
      // Pre-fill tail for instant streaks
      for (let k = preAge; k > 0; k--) {
        p.tail.push({ x: p.x - p.vx * k, y: p.y - p.vy * k });
      }
      if (p.tail.length > TAIL_LEN) p.tail = p.tail.slice(-TAIL_LEN);
      return p;
    });

    let frame = 0;

    function drawFrame() {
      if (!windActiveRef.current) return;
      frame++;

      const ctx = canvas.getContext('2d');
      const cw  = canvas.width, ch = canvas.height;
      const hw  = getCorridorHalfW(cw, ch);

      // ── 1. Clear full canvas every frame ─────────────────────────────────────
      ctx.clearRect(0, 0, cw, ch);

      // ── 2. Set up corridor clipping ──────────────────────────────────────────
      const corners = corridorCorners(cw, ch);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      corners.forEach(c => ctx.lineTo(c.x, c.y));
      ctx.closePath();
      ctx.clip();

      // Removed dark background band so map remains fully visible

      // ── 3. Draw particles INSIDE corridor clip ────────────────────────────────
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Fade in at birth, fade out at death
        const ageRatio = 1 - p.life / p.maxLife;
        const alpha =
          ageRatio < 0.08 ? (ageRatio / 0.08) * 1.0
          : ageRatio > 0.80 ? ((1 - ageRatio) / 0.20) * 1.0
          : 1.0;

        const [r, g, b] = speedToRGB(p.speed);

        // Tail — drawn from oldest to newest (gradual bright increase)
        if (p.tail.length > 1) {
          const tLen    = p.tail.length;
          const baseW   = p.speed > 1.6 ? 2.8 : p.speed > 1.2 ? 2.2 : 1.7;

          ctx.lineCap  = 'round';
          ctx.lineJoin = 'round';

          for (let t = 1; t < tLen; t++) {
            const frac = t / tLen;             // 0=old/dim → 1=new/bright
            ctx.beginPath();
            ctx.moveTo(p.tail[t - 1].x, p.tail[t - 1].y);
            ctx.lineTo(p.tail[t].x,     p.tail[t].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * frac * 0.78})`;
            ctx.lineWidth   = baseW * (0.2 + frac * 0.8);
            ctx.stroke();
          }

          // Join latest tail point → current head
          ctx.beginPath();
          ctx.moveTo(p.tail[tLen - 1].x, p.tail[tLen - 1].y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.92})`;
          ctx.lineWidth   = baseW;
          ctx.stroke();
        }

        // Head — bright filled dot with glow
        const headR = p.speed > 1.6 ? 3.5 : p.speed > 1.2 ? 2.8 : 2.2;

        // Soft glow ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, headR * 3.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.18})`;
        ctx.fill();

        // Inner glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, headR * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.45})`;
        ctx.fill();

        // Solid core
        ctx.beginPath();
        ctx.arc(p.x, p.y, headR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();

        // ── Advance particle ──
        p.tail.push({ x: p.x, y: p.y });
        if (p.tail.length > TAIL_LEN) p.tail.shift();

        const sin = Math.sin(frame * 0.035 + p.phase) * p.meander;
        p.x   += p.vx + sin * ch;
        p.y   += p.vy - sin * cw * 0.06;
        p.life -= 1;

        // Check if particle should respawn
        const cx2 = cw / 2, cy2 = ch / 2;
        const perpDist = Math.abs((p.x - cx2) * nX + (p.y - cy2) * nY);
        const oob = p.x > cw + 60 || p.x < -60 || p.y > ch + 60 || p.y < -60;

        if (p.life <= 0 || perpDist > hw * 1.05 || oob) {
          particles[i] = spawnParticle(cw, ch);
        }
      }

      ctx.restore(); // ← unclip

      // ── 4. Corridor edge glow (subtle bright border, outside clip) ────────────
      // Draws a thin bright border along the corridor edges to make boundaries clear
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      corners.forEach(c => ctx.lineTo(c.x, c.y));
      ctx.closePath();
      ctx.strokeStyle = 'rgba(80, 140, 255, 0.30)';
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(drawFrame);
    }

    animFrameRef.current = requestAnimationFrame(drawFrame);

    // Reset particles when map moves
    const map = mapInstanceRef.current;
    function onMapMove() {
      if (!windActiveRef.current) return;
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = Array.from({ length: N_PARTICLES }, () => spawnParticle(canvas.width, canvas.height));
    }
    if (map) { map.on('movestart', onMapMove); map.on('zoomstart', onMapMove); }

    return () => {
      windActiveRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (map) { map.off('movestart', onMapMove); map.off('zoomstart', onMapMove); }
    };
  }, [layers.plume]);

  // ─── Station Markers ─────────────────────────────────────────────────────────
  useEffect(() => {
    const group = layerGroupsRef.current.stations;
    const map   = mapInstanceRef.current;
    if (!group || !map) return;
    group.clearLayers();
    if (layers.stations) {
      if (!map.hasLayer(group)) group.addTo(map);
      [
        { name: "ITO, Delhi",            lat: 28.6289, lng: 77.2405 },
        { name: "Anand Vihar, Delhi",    lat: 28.6502, lng: 77.3150 },
        { name: "Punjabi Bagh, Delhi",   lat: 28.6683, lng: 77.1325 },
        { name: "R K Puram, Delhi",      lat: 28.5635, lng: 77.1865 },
        { name: "Sector 62, Noida",      lat: 28.6258, lng: 77.3644 },
        { name: "Vikas Sadan, Gurugram", lat: 28.4550, lng: 77.0320 }
      ].forEach(st => {
        L.circleMarker([st.lat, st.lng], {
          radius: 6, fillColor: '#2A5C8A', color: '#FFFFFF', weight: 1.5, fillOpacity: 0.9
        }).bindTooltip(st.name, { permanent: true, direction: 'bottom' }).addTo(group);
      });
    } else {
      if (map.hasLayer(group)) map.removeLayer(group);
    }
  }, [layers.stations]);

  // ─── Pan to zone ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (selectedZone === "Delhi NCR (all)") {
      map.setView([28.65, 77.15], 10);
    } else {
      const match = zoneData.find(z => z.zone === selectedZone);
      if (match) map.setView([match.lat, match.lng], 12, { animate: true });
    }
  }, [selectedZone]);

  return (
    <div className="map-column-panel">
      <div className="map-top-bar">
        <span className="map-panel-title">Delhi NCR — live AQI zones</span>
        <div className="timeframe-pill-group">
          {['Now', '+24h', '+72h'].map(tf => (
            <button key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}>
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="map-wrapper">
        <div ref={mapContainerRef} className="leaflet-map-root" />
        <canvas ref={canvasRef} className="wind-canvas" />

        <div className="map-legend-chip">
          <span style={{ color: '#281496', fontWeight: 700 }}>●</span> Slow &nbsp;
          <span style={{ color: '#0046C8', fontWeight: 700 }}>●</span> Mod &nbsp;
          <span style={{ color: '#0078A0', fontWeight: 700 }}>●</span> Fast &nbsp;
          <span style={{ color: '#008C3C', fontWeight: 700 }}>●</span> Strong &nbsp;·&nbsp;
          Punjab ↔ Delhi airflow
        </div>
      </div>
    </div>
  );
}
