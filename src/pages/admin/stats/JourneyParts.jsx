import React from 'react';
import { Eye } from 'lucide-react';
import {
  formatShortDate,
  formatDateTime,
  eventLabels,
  getTimelineSourceLabel,
  getVisibleTimelineMetadata,
  getTimelineMetadataItems,
  getTimelineDescription,
} from './statsHelpers';

export const EventFunnelCard = ({ event, index }) => {
  const tones = [
    'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
    'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    'text-violet-300 bg-violet-500/10 border-violet-500/20',
    'text-amber-300 bg-amber-500/10 border-amber-500/20',
    'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/20',
    'text-rose-300 bg-rose-500/10 border-rose-500/20',
  ];

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-4">
      <div className={`mb-4 inline-flex h-8 w-8 items-center justify-center rounded-2xl border text-xs font-black ${tones[index % tones.length]}`}>
        {index + 1}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{event.label}</p>
      <h3 className="mt-2 text-2xl font-black text-white">{event.count || 0}</h3>
      <p className="mt-1 text-[11px] font-semibold text-text-muted">{event.rawCount || 0} toplam event</p>
    </div>
  );
};

export const FunnelStepCard = ({ step, index }) => {
  const tones = [
    'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
    'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
    'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    'bg-violet-500/15 text-violet-300 border-violet-500/20',
    'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20',
    'bg-amber-500/15 text-amber-300 border-amber-500/20',
  ];
  const tone = tones[index % tones.length];

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-4 min-h-[160px] flex flex-col justify-between">
      <div>
        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl border text-xs font-black ${tone}`}>
          {index + 1}
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-text-muted">{step.label}</p>
        <h3 className="mt-1 text-2xl font-black text-white leading-none">{step.count || 0}</h3>
        <p className="mt-2 text-[11px] font-semibold text-text-muted leading-tight">{step.helper}</p>
      </div>
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
          <div className="h-full rounded-full bg-white/60" style={{ width: `${Math.min(step.totalRate || 0, 100)}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-white/50">%{step.totalRate || 0}</span>
          <span className="text-[10px] font-bold text-text-muted">önceki %{step.previousRate || 0}</span>
        </div>
      </div>
    </div>
  );
};

export const JourneySegment = ({ segment }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 flex items-start justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-bold text-white leading-tight">{segment.title}</p>
      <p className="mt-2 text-[11px] font-semibold text-text-muted leading-relaxed">{segment.action}</p>
    </div>
    <div className="shrink-0 text-right">
      <div className="text-2xl font-bold text-white leading-none">{segment.count || 0}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-rose-300">%{segment.rate || 0}</div>
    </div>
  </div>
);

export const SourcePerformanceRow = ({ source }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{source.source || 'unknown'}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{source.registered || 0} kayıt</p>
      </div>
      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-300">
        %{source.activationRate || 0}
      </span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center">
      <MiniMetric label="Kayıt" value={source.registered || 0} compact />
      <MiniMetric label="İlk Test" value={source.firstTest || 0} compact />
      <MiniMetric label="PRO" value={source.pro || 0} compact />
    </div>
  </div>
);

export const CohortRow = ({ cohort }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-bold text-white">{cohort.label}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{cohort.registered || 0} kayıt</p>
      </div>
      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary-light">
        Aktivasyon %{cohort.activationRate || 0}
      </span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-black/40">
      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(cohort.activationRate || 0, 100)}%` }} />
    </div>
    <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted">
      <span>{cohort.firstTest || 0} ilk test</span>
      <span>{cohort.wrongReview || 0} yanlış tekrar</span>
    </div>
  </div>
);

export const MetricPanelHeader = ({ icon: Icon, title, subtitle, color, bg, border }) => (
  <div className="mb-6 flex items-center gap-4">
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${bg} ${border}`}>
      {React.createElement(Icon, { className: `h-6 w-6 ${color}` })}
    </div>
    <div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>
    </div>
  </div>
);

export const MiniMetric = ({ label, value, compact = false }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/[0.015] ${compact ? 'p-3' : 'p-4'}`}>
    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
    <p className={`${compact ? 'text-lg' : 'text-2xl'} mt-1 font-bold leading-none text-white`}>{value}</p>
  </div>
);

export const RiskUserRow = ({ user, onOpenTimeline }) => (
  <button
    type="button"
    onClick={() => onOpenTimeline?.(user)}
    className="w-full rounded-2xl border border-white/10 bg-white/[0.015] p-3 text-left transition hover:border-rose-400/25 hover:bg-rose-500/5"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-white">{user.name}</p>
        <p className="truncate text-[10px] font-semibold text-text-muted">{user.email}</p>
      </div>
      <Eye className="h-4 w-4 shrink-0 text-text-muted" />
    </div>
    <p className="mt-2 inline-flex rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-rose-300">
      {user.reason}
    </p>
  </button>
);

export const TimelineEventRow = ({ event }) => {
  const visibleMetadata = getVisibleTimelineMetadata(event.metadata);
  const description = getTimelineDescription(event, visibleMetadata);
  const metadataItems = getTimelineMetadataItems(event.metadata);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black text-white">{eventLabels[event.eventType] || event.eventType}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
            {getTimelineSourceLabel(event)}
          </p>
        </div>
        <span className="text-[10px] font-bold text-text-muted">{formatDateTime(event.createdAt)}</span>
      </div>
      {description && (
        <p className="mt-3 rounded-2xl border border-white/5 bg-black/20 px-3 py-2 text-xs font-semibold leading-relaxed text-white/75">
          {description}
        </p>
      )}
      {metadataItems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {metadataItems.map(item => (
            <span
              key={item.key}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-white/75"
            >
              <span className="shrink-0 text-text-muted">{item.label}:</span>
              <span className="min-w-0 truncate">{item.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const statusTone = (status) => {
  if (status === 'PRO') return 'bg-amber-400/10 text-amber-300 border-amber-400/20';
  if (status === 'Kategori bekliyor') return 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20';
  if (status === 'İlk test bekliyor') return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20';
  if (status === 'Yanlış tekrar bekliyor') return 'bg-violet-400/10 text-violet-300 border-violet-400/20';
  return 'bg-white/5 text-white/70 border-white/10';
};

export const JourneyUserRow = ({ user, onOpenTimeline }) => (
  <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_0.9fr_0.9fr_1fr_auto] gap-3 rounded-3xl border border-white/10 bg-white/[0.015] p-4 items-center">
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-white">{user.name}</p>
      <p className="truncate text-[11px] font-semibold text-text-muted">{user.email}</p>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Kategori</p>
      <p className="truncate text-xs font-bold text-white/75">{user.selectedCategoryName || '-'}</p>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Test</p>
      <p className="text-xs font-bold text-white/75">{user.examCount || 0} çözüm</p>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Yanlış</p>
      <p className="text-xs font-bold text-white/75">{user.dueWrongCount || 0} due / {user.wrongReviewCount || 0} tekrar</p>
    </div>
    <div className="flex flex-col lg:items-end gap-2">
      <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusTone(user.status)}`}>
        {user.status}
      </span>
      <span className="text-[10px] font-semibold text-text-muted">Kayıt: {formatShortDate(user.createdAt)}</span>
    </div>
    <button
      type="button"
      onClick={() => onOpenTimeline?.(user)}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition hover:border-primary/30 hover:bg-primary/10"
    >
      <Eye className="h-4 w-4 text-primary-light" />
      Akış
    </button>
  </div>
);
