import React from 'react';
import { AlertCircle } from 'lucide-react';
import { DIFFICULTY_CONFIG } from './examConstants';

// ─── Utility Components ───────────────────────────────────────────────────────
const DifficultyBadge = ({ difficulty }) => {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const InputField = ({ label, icon: Icon, required, error, children }) => (
  <div>
    {label && (
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        <span className="text-xs font-bold text-text-secondary">{label}</span>
        {required && <span className="text-danger text-xs">(Zorunlu)</span>}
      </div>
    )}
    {children}
    {error && <p className="text-danger text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

const ExamOverviewCard = ({ icon: Icon, label, value, detail, color, bg, border }) => (
  <div className="group flex min-h-[104px] items-center justify-between gap-3 rounded-2xl border border-[#243044] bg-[#101725] p-4 transition-all hover:border-[#35445e] hover:bg-[#151E2E]">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8F9BB0]">{label}</p>
      <h3 className="mt-2 text-2xl font-black leading-none tracking-tight text-white">{value}</h3>
      {detail && <p className="mt-1.5 text-[10px] font-medium text-white/40">{detail}</p>}
    </div>
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${border} ${bg} ${color} transition-transform group-hover:scale-105`}>
      <Icon className="h-[18px] w-[18px]" />
    </div>
  </div>
);

const SubjectBadge = ({ label, count, color }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold tracking-tight ${color}`}>
    <span>{label}</span>
    <div className="px-1.5 py-0.5 bg-white/10 rounded-md min-w-[1.2rem] text-center text-[10px]">{count}</div>
  </div>
);

export { DifficultyBadge, InputField, ExamOverviewCard, SubjectBadge };
