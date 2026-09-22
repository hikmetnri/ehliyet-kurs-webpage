import { ChevronRight } from 'lucide-react';
import { COLORS, formatNumber } from './adminDashboardHelpers';

export const SectionHeader = ({ eyebrow, title, trailing, trailingColor = COLORS.primary }) => (
  <div className="flex items-end justify-between gap-4">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8F9BB0]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-black tracking-[-0.02em] text-[#F4F7FB]">{title}</h2>
    </div>
    {trailing ? (
      <span
        className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black"
        style={{
          color: trailingColor,
          borderColor: `${trailingColor}35`,
          backgroundColor: `${trailingColor}12`,
        }}
      >
        {trailing}
      </span>
    ) : null}
  </div>
);

export const MetricCard = ({ label, value, icon: Icon, color }) => (
  <div className="min-h-[112px] rounded-[20px] border border-[#243044] bg-[#101725] p-3.5 sm:p-4">
    <div className="flex items-start justify-between gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ color, backgroundColor: `${color}16` }}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
    </div>
    <p className="mt-3 text-xl font-black leading-none tracking-[-0.03em] text-[#F4F7FB] sm:text-2xl">
      {formatNumber(value)}
    </p>
    <p className="mt-1.5 truncate text-[11px] font-semibold text-[#8F9BB0]">{label}</p>
  </div>
);

export const QueueRow = ({ label, description, count, icon: Icon, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[#151E2E]"
  >
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]"
      style={{ color, backgroundColor: `${color}15` }}
    >
      <Icon className="h-[18px] w-[18px]" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-extrabold text-[#F4F7FB]">{label}</span>
      <span className="mt-0.5 block truncate text-[11px] font-medium text-[#8F9BB0]">
        {description}
      </span>
    </span>
    <span
      className="min-w-8 rounded-lg px-2 py-1 text-center text-xs font-black"
      style={{ color, backgroundColor: `${color}13` }}
    >
      {count}
    </span>
    <ChevronRight className="h-4 w-4 shrink-0 text-[#536078] transition-transform group-hover:translate-x-0.5 group-hover:text-[#F4F7FB]" />
  </button>
);

export const ActionCard = ({ label, icon: Icon, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex min-h-[98px] flex-col items-center justify-center rounded-[18px] border border-[#243044] bg-[#101725] px-2 py-3 transition-all hover:-translate-y-0.5 hover:border-[#35445e] hover:bg-[#151E2E]"
  >
    <span
      className="flex h-10 w-10 items-center justify-center rounded-[13px] transition-transform group-hover:scale-105"
      style={{ color, backgroundColor: `${color}16` }}
    >
      <Icon className="h-[18px] w-[18px]" />
    </span>
    <span className="mt-2.5 text-center text-[11px] font-extrabold text-[#DDE5F2]">{label}</span>
  </button>
);

export const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex min-h-[140px] flex-col items-center justify-center px-5 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#151E2E] text-[#61708A]">
      <Icon className="h-5 w-5" />
    </span>
    <p className="mt-3 text-xs font-semibold text-[#8F9BB0]">{text}</p>
  </div>
);

export const LoadingState = () => (
  <div className="space-y-4 pb-10">
    <div className="h-56 animate-pulse rounded-[26px] border border-[#243044] bg-[#101725]" />
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-28 animate-pulse rounded-[20px] border border-[#243044] bg-[#101725]"
        />
      ))}
    </div>
    <div className="h-52 animate-pulse rounded-[22px] border border-[#243044] bg-[#101725]" />
  </div>
);
