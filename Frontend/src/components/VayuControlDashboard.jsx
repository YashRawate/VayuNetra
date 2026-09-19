import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import TopHeaderBar from './vayu/TopHeaderBar';
import SpatialSectorsPanel from './vayu/SpatialSectorsPanel';
import GisOverlaysPanel from './vayu/GisOverlaysPanel';
import BoundaryLayerMetPanel from './vayu/BoundaryLayerMetPanel';
import CenterMapPanel from './vayu/CenterMapPanel';
import RegionalAqiHeroPanel from './vayu/RegionalAqiHeroPanel';
import ChemicalTelemetryPanel from './vayu/ChemicalTelemetryPanel';
import TrajectoryOutlookPanel from './vayu/TrajectoryOutlookPanel';
import ImmediateInterventionsPanel from './vayu/ImmediateInterventionsPanel';

export default function VayuControlDashboard() {
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState("Live GIS Surveillance");
  const [selectedZone, setSelectedZone] = useState("Anand Vihar & East");
  const [timeframe, setTimeframe] = useState("Live");
  
  // GIS Overlays state
  const [gisLayers, setGisLayers] = useState({
    heatmap: true,
    biomass: true,
    wind: true,
    pins: true,
    traffic: false
  });

  const handleToggleLayer = (layerId) => {
    setGisLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const handleSelectZone = (zoneName) => {
    setSelectedZone(zoneName);
  };

  const handleTriggerIntervention = (item) => {
    alert(`Triggered action "${item.action}" for ${item.location} (${item.aqi} AQI)`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--bg-page)] text-[var(--text-primary)] overflow-hidden select-none font-sans transition-colors duration-300">
      {/* 1. Top Header Bar */}
      <TopHeaderBar
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        syncData={{
          stationsSynced: "38/38",
          syncTime: "06:00 IST",
          meshLatency: "24ms",
          wind: "NW 6 km/h",
          temp: "14°C",
          humidity: "78%",
          selectedZone: selectedZone,
          grapStage: "Stage IV Active"
        }}
      />

      {/* Note: GrapMandateBanner removed per user request for a cleaner interface */}

      {/* 2. Main Grid (Left Sidebar · Center Map · Right Sidebar) */}
      <main className="flex-1 overflow-hidden p-3 gap-3 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Sidebar (~320px equivalent, 3 cols out of 12) */}
        <left-sidebar className="lg:col-span-3 h-full flex flex-col gap-3 overflow-y-auto pr-0.5 custom-scrollbar">
          <SpatialSectorsPanel
            selectedZone={selectedZone}
            onSelectZone={handleSelectZone}
          />
          <GisOverlaysPanel
            layers={[
              { id: "heatmap", layer: "Interpolated AQI Heatmap", color: "var(--aqi-poor)", active: gisLayers.heatmap },
              { id: "biomass", layer: "Crop Biomass Plume Polygons", color: "var(--aqi-vpoor)", active: gisLayers.biomass },
              { id: "wind", layer: "Northwest Wind Streamlines", color: "#3B82F6", active: gisLayers.wind },
              { id: "pins", layer: "Station CAQM Pins", color: "var(--bg-navy)", active: gisLayers.pins },
              { id: "traffic", layer: "Urban Congestion Corridors", color: "var(--text-secondary)", active: gisLayers.traffic }
            ]}
            onToggleLayer={handleToggleLayer}
          />
          <BoundaryLayerMetPanel />
        </left-sidebar>

        {/* Center Map Panel (Flexible & Dominant, 6 cols out of 12) */}
        <center-column className="lg:col-span-6 h-full flex flex-col overflow-hidden">
          <CenterMapPanel
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            selectedZone={selectedZone}
            onSelectStation={handleSelectZone}
            gisLayers={gisLayers}
            theme={theme}
          />
        </center-column>

        {/* Right Sidebar (~360px equivalent, 3 cols out of 12) */}
        <right-sidebar className="lg:col-span-3 h-full flex flex-col gap-3 overflow-y-auto pl-0.5 custom-scrollbar">
          <RegionalAqiHeroPanel />
          <ChemicalTelemetryPanel />
          <TrajectoryOutlookPanel />
          <ImmediateInterventionsPanel
            onTriggerAction={handleTriggerIntervention}
          />
        </right-sidebar>
      </main>
    </div>
  );
}
