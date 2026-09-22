import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart,
  ChevronRight,
} from 'lucide-react';

const ICON_MAP = { Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart };

export const BadgeIcon = ({ name, ...props }) => {
  const Icon = ICON_MAP[name] || Award;
  return <Icon {...props} />;
};
export const EmptyAction = ({ icon: Icon, title, text, action, to }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-4 py-8 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
      <Icon className="h-5 w-5 text-primary-light" />
    </div>
    <h4 className="text-sm font-black text-white">{title}</h4>
    <p className="mt-2 max-w-xs text-xs font-semibold leading-relaxed text-text-muted">{text}</p>
    <Link
      to={to}
      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-light transition hover:bg-primary/20"
    >
      {action}
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

export const MiniStat = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.025] border border-white/10 hover:border-white/15 transition-all">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} ${color} shrink-0 mb-2`}>
      <Icon className="w-4.5 h-4.5" />
    </div>
    <span className="text-sm font-black text-white leading-tight">{value}</span>
    <span className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tight line-clamp-1">{label}</span>
  </div>
);

export const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]">
        <Icon className="h-5 w-5 text-primary-light" />
      </div>
      <div>
        <h3 className="text-base font-black tracking-tight text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs font-semibold text-text-muted">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

export const MetricTile = ({ icon: Icon, label, value, helper, color = 'text-white', bg = 'bg-white/[0.04]' }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
    </div>
    <p className={`mt-3 text-2xl font-black leading-none ${color}`}>{value}</p>
    {helper && <p className="mt-2 text-xs font-semibold leading-relaxed text-text-muted">{helper}</p>}
  </div>
);
