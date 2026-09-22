import React from 'react';
import {
  Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart,
} from 'lucide-react';

const ICON_MAP = { Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart };

export const BadgeIcon = ({ name, ...props }) => {
  const Icon = ICON_MAP[name] || Award;
  return <Icon {...props} />;
};

// Top KPIs Components
export const StatsCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${bg} ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs font-semibold text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold leading-none text-white">{value}</p>
    </div>
  </div>
);

// Detail Cards inside Modal
export const ReportCard = ({ title, value, icon: Icon, color, bg, border }) => (
  <div className={`flex flex-col items-start gap-3 rounded-2xl border ${border} bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]`}>
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
       <Icon className="h-5 w-5" />
    </div>
    <div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="mt-1 text-xs font-bold text-white/50">{title}</div>
    </div>
  </div>
);
