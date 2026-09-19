import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import LiveMapPanel from '../LiveMapPanel';
import ControlsColumn from '../live-map/ControlsColumn';

export default function MapExpandModal({ onClose, theme }) {
  const [selectedZone, setSelectedZone] = useState('Delhi NCR (all)');
  const [layers, setLayers] = useState({
    heatmap: true,
    plume: true,
    stations: true
  });

  const handleToggleLayer = (layerKey) => {
    setLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  return (
    <motion.div
      className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-[95vw] h-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800"
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Full Spatial Overview</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
          <div className="w-full md:w-[320px] shrink-0 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 overflow-y-auto p-4">
            <ControlsColumn
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              layers={layers}
              onToggleLayer={handleToggleLayer}
            />
          </div>
          <div className="flex-1 relative">
            <LiveMapPanel
              selectedZone={selectedZone}
              layers={layers}
              theme={theme}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
