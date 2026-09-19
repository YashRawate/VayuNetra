const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

// 1. Change the wrapper for Live GIS Airshed to be CSS display toggle instead of unmounting
code = code.replace(
  /\{activeTab === "Live GIS Airshed" && \(\s*<>\s*\{\/\* BEGIN: MainDashboardGrid \*\/\}/m,
  '<div style={{ display: activeTab === "Live GIS Airshed" ? "flex" : "none", flex: 1, width: "100%", flexDirection: "column" }}>\n          {/* BEGIN: MainDashboardGrid */}'
);

code = code.replace(
  /<\/>\s*\)\}\s*\{activeTab === 'Plume Dispersion' && \(/m,
  '</div>\n\n      {activeTab === \'Plume Dispersion\' && ('
);

// 2. Fix the first useEffect (Map Initialization)
// We remove `activeTab` from dependencies, and we remove the cleanup function.
// We also add invalidateSize() if activeTab === 'Live GIS Airshed'.

const oldUseEffect1 = `  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.65, 77.18],
        zoom: 9.2,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
        maxZoom: 18,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab]);`;

const newUseEffect1 = `  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.65, 77.18],
        zoom: 9.2,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
        maxZoom: 18,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }
  }, []); // Only run once on mount

  // Invalidate map size when switching back to Live GIS tab
  useEffect(() => {
    if (activeTab === "Live GIS Airshed" && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, [activeTab]);`;

code = code.replace(oldUseEffect1, newUseEffect1);

fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('Fixed CSS hide and map init!');
