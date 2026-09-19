import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

export default function PlumeMapSection() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const fireSources = [
    { location: "Sangrur, Punjab", intensity: 0.9, lat: 30.24, lng: 75.84 },
    { location: "Karnal, Haryana", intensity: 0.6, lat: 29.68, lng: 76.98 }
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [29.6, 76.6],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      });

      L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);

      // Plume trajectory corridor
      const plumeCoords = [
        [30.6, 75.2],
        [30.0, 75.0],
        [28.4, 77.0],
        [28.4, 77.5],
        [29.0, 77.6],
        [30.2, 76.4]
      ];

      L.polygon(plumeCoords, {
        color: '#C4451C',
        weight: 1.5,
        opacity: 0.7,
        fillColor: '#C4451C',
        fillOpacity: 0.15,
        dashArray: '4, 4'
      }).addTo(map);

      // 2 fire sources specified
      fireSources.forEach(src => {
        const marker = L.circleMarker([src.lat, src.lng], {
          radius: Math.round(7 + src.intensity * 5),
          fillColor: '#C4451C',
          color: '#FFFFFF',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindTooltip(`
          <div style="font-size: 11px; font-family: sans-serif;">
            <strong>${src.location}</strong><br/>
            Intensity: ${src.intensity * 100}%
          </div>
        `, { direction: 'top', permanent: true, offset: [0, -10] });
      });

      // Delhi NCR Receptor
      const delhiMarker = L.circleMarker([28.6139, 77.2090], {
        radius: 9,
        fillColor: '#2A5C8A',
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      delhiMarker.bindTooltip(`
        <div style="font-size: 11px; font-weight: 600; font-family: sans-serif;">
          Delhi NCR (Receptor)
        </div>
      `, { permanent: true, direction: 'right', offset: [8, 0] });

      mapInstanceRef.current = map;
    }
  }, []);

  return (
    <section aria-labelledby="plume-section-title">
      <div className="console-section-header">
        <span id="plume-section-title">Stubble Plume Tracking</span>
      </div>

      <div className="plume-map-card">
        <div className="plume-map-canvas">
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

          {/* Wind Vector Pill */}
          <div className="plume-wind-pill">
            <Navigation size={13} style={{ transform: 'rotate(315deg)', color: '#2A5C8A' }} />
            <span>NW 8 km/h</span>
          </div>
        </div>

        {/* Exact single caption line from spec */}
        <div className="plume-caption">
          Smoke from 2 active fire clusters expected to reach Delhi NCR in ~14 hours.
        </div>
      </div>
    </section>
  );
}
