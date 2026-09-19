import React from 'react';
import { AlertTriangle, Shield, Send } from 'lucide-react';

export default function GrapMandateBanner({
  data = {
    stage: "Phase IV",
    trigger: "Regional AQI > 450",
    restrictions: [
      "Diesel heavy vehicles halted at borders",
      "50% staggered remote shifts active across public bodies",
      "Anti-smog gun saturation deployed"
    ]
  },
  onDirectivesClick = () => {},
  onDeploySquadsClick = () => {}
}) {
  return (
    <div className="w-full bg-[#FDECEA] border-b border-[var(--border)] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[#B8281E] z-20">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-full bg-[#B8281E]/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-[#B8281E]" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold text-xs tracking-wider uppercase">
            GRAP EMERGENCY {data.stage.toUpperCase()} MANDATE
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B8281E] text-white tracking-tight">
            {data.trigger}
          </span>
        </div>
      </div>

      <div className="text-xs text-[var(--text-primary)] font-medium flex-1 truncate max-w-4xl">
        <span className="text-[var(--text-secondary)] font-normal mr-1">Active Restrictions:</span>
        <span className="italic">{data.restrictions.join(" · ")}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button
          onClick={onDirectivesClick}
          className="px-3 py-1 bg-white border border-[#B8281E] text-[#B8281E] rounded text-xs font-semibold hover:bg-[#B8281E]/5 transition-colors flex items-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Directives</span>
        </button>
        <button
          onClick={onDeploySquadsClick}
          className="px-3 py-1 bg-[#B8281E] text-white rounded text-xs font-semibold hover:bg-[#991F18] transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Deploy Squads</span>
        </button>
      </div>
    </div>
  );
}
