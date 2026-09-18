import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ForecastSection from '../ForecastSection';
import AttributionSection from '../AttributionSection';
import AccuracyTrackerSection from '../AccuracyTrackerSection';
import StationGridSection from '../StationGridSection';
import PublicAlertCard from '../PublicAlertCard';
import { useSensorStore } from '../../store/sensorStore';

export default function DeepInsightsModal({ onClose, theme }) {
  const { stations } = useSensorStore();
  const currentStation = stations[0] || { station: "Loading..." };

  return (
    <motion.div
      className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800"
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Deep Insights & Analytics</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-12">
          {/* Forecast & Trends */}
          <div>
            <h3 className="text-xl font-bold mb-4 tracking-tight">AI Predictive Forecast</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <ForecastSection theme={theme} />
            </div>
          </div>

          {/* Attribution & Sources */}
          <div>
            <h3 className="text-xl font-bold mb-4 tracking-tight">Real-Time Source Attribution</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <AttributionSection
                localEmissions={41}
                inversionTrapping={27}
                stubbleSmoke={32}
              />
            </div>
          </div>

          {/* Model Accuracy & Public Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <AccuracyTrackerSection theme={theme} />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <PublicAlertCard
                alertsSentToday={48200}
                channels="SMS + WhatsApp"
                lastSent="6:05 AM"
              />
            </div>
          </div>

          {/* Station Grid */}
          <div>
            <h3 className="text-xl font-bold mb-4 tracking-tight">Monitoring Network</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <StationGridSection
                stationName={currentStation.station}
                stations={stations}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
