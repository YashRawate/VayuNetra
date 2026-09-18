import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function StatusBar({
  message = "Severe air quality expected tonight — inversion trapping stubble-burning smoke.",
  grapStage = "Stage IV"
}) {
  return (
    <div className="status-bar" role="alert">
      <div className="status-bar-left">
        <AlertTriangle size={17} className="status-icon-alert" />
        <span className="status-message-text">{message}</span>
      </div>

      <div className="grap-chip">
        GRAP {grapStage}
      </div>
    </div>
  );
}
