import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export const StatsCard = ({ icon: Icon, title, value, trend, trendLabel, color, bg }) => (
  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 relative overflow-hidden group hover:border-white/20 transition-all shadow-sm">
    <div className="absolute -right-2 -top-2 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform pointer-events-none">
      {React.createElement(Icon, { className: `w-24 h-24 ${color}` })}
    </div>
    <div className="relative z-10 flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} border border-white/10`}>
        {React.createElement(Icon, { className: `w-6 h-6 ${color}` })}
      </div>
      <div>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1 leading-none">{value}</h3>
        <div className="flex items-center gap-2 mt-4">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/10 bg-white/[0.03] ${color}`}>{trend}</span>
          <span className="text-[10px] text-text-muted font-bold tracking-tight">{trendLabel}</span>
        </div>
      </div>
    </div>
  </div>
);

export const StatProgressBar = ({ label, percentage, total }) => {
  const colorClass = percentage > 80 ? 'bg-emerald-500' : percentage > 60 ? 'bg-amber-400' : 'bg-rose-500';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-white/80">{label}</span>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">%{percentage} Başarı <span className="opacity-40">/ {total} Çözüm</span></span>
      </div>
      <div className="h-2 w-full bg-black/40 rounded-full border border-white/10 overflow-hidden">
        <MotionDiv
            initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
};

export const InsightCard = ({ icon: Icon, title, value, desc }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-5 flex items-center gap-5 hover:bg-white/[0.03] transition-all">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
      {React.createElement(Icon, { className: 'w-6 h-6 text-white/40' })}
    </div>
    <div>
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{title}</p>
      <h4 className="text-xl font-bold text-white mt-0.5">{value}</h4>
      <p className="text-[11px] font-medium text-text-muted mt-1 leading-tight">{desc}</p>
    </div>
  </div>
);
