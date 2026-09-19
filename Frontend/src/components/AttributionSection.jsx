import React from 'react';
import { Factory, Wind, CloudFog } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttributionSection({
  localEmissions = 41,
  inversionTrapping = 27,
  stubbleSmoke = 32
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Real-time physical source breakdown computed by coupled chemical-transport model
      </div>

      {/* Stacked Horizontal Bar */}
      <div className="h-8 w-full rounded-full overflow-hidden flex shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${localEmissions}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-blue-500 flex items-center px-3 text-xs font-bold text-white whitespace-nowrap overflow-hidden"
          title={`Local emissions: ${localEmissions}%`}
        >
          Local {localEmissions}%
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${stubbleSmoke}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          className="h-full bg-red-500 flex items-center px-3 text-xs font-bold text-white whitespace-nowrap overflow-hidden"
          title={`Stubble smoke: ${stubbleSmoke}%`}
        >
          Stubble {stubbleSmoke}%
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${inversionTrapping}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="h-full bg-amber-500 flex items-center px-3 text-xs font-bold text-white whitespace-nowrap overflow-hidden"
          title={`Inversion trapping: ${inversionTrapping}%`}
        >
          Inversion {inversionTrapping}%
        </motion.div>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Factory size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Local Emissions</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Vehicular & Industrial ({localEmissions}%)</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <CloudFog size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Stubble Smoke</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Transboundary Transport ({stubbleSmoke}%)</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Wind size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Inversion Trapping</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Boundary Layer Compression ({inversionTrapping}%)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
