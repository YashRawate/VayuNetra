import React from 'react';
import { Send, CheckCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicAlertCard({
  alertsSentToday = 48200,
  channels = "SMS + WhatsApp",
  lastSent = "6:05 AM"
}) {
  return (
    <div className="flex flex-col h-full w-full justify-between">
      <div>
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Public Dissemination</h3>
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Send size={18} />
          </div>
        </div>

        <div className="mb-8">
          <div className="text-5xl font-black tracking-tight text-blue-600 dark:text-blue-400">
            {alertsSentToday.toLocaleString()}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Citizen alerts dispatched today
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 space-y-3 text-sm">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <CheckCircle size={16} className="text-emerald-500" />
          <span>Active channels: <strong className="text-slate-900 dark:text-slate-100">{channels}</strong></span>
        </div>
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <MessageSquare size={16} className="text-slate-400" />
          <span>Last automated advisory: <strong className="text-slate-900 dark:text-slate-100">{lastSent} IST</strong></span>
        </div>
      </div>
    </div>
  );
}
