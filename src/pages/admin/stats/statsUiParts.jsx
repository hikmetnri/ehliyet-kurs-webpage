import React from 'react';
import { motion } from 'framer-motion';
import { Activity, X } from 'lucide-react';
import { analysisGuideItems } from './statsHelpers';

const MotionDiv = motion.div;

export const ChartEmptyState = ({ text }) => (
  <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.01] px-6 text-center">
    <Activity className="mb-3 h-8 w-8 text-white/25" />
    <p className="text-xs font-bold leading-relaxed text-text-muted">{text}</p>
  </div>
);

export const InsightGuide = ({ title, description, chips = [], actions = [] }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Nereden başlamalı?</p>
        <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-text-muted">{description}</p>
      </div>
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`rounded-2xl border px-4 py-3 text-sm font-black transition-colors ${action.className}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
    {chips.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70"
          >
            <span className={`h-2 w-2 rounded-full ${chip.dot || 'bg-primary-light'}`} />
            {chip.label}: <span className="text-white">{chip.value}</span>
          </span>
        ))}
      </div>
    )}
  </MotionDiv>
);

export const AnalysisGuideModal = ({ onClose }) => (
  <MotionDiv
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <MotionDiv
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      onClick={(event) => event.stopPropagation()}
      className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#11141d] p-4 shadow-2xl custom-scrollbar sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Yönetici Rehberi</p>
          <h2 className="mt-1 text-xl font-black text-white">İstatistikleri nasıl yorumlamalısın?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            Her bölümün neyi gösterdiğini, sonucu nasıl okuyacağını ve sonrasında hangi aksiyonu alabileceğini buradan görebilirsin.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-text-muted transition hover:bg-white/10 hover:text-white"
          aria-label="Analiz rehberini kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {analysisGuideItems.map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <h3 className="text-base font-black text-white">{item.title}</h3>
            <div className="mt-4 space-y-4">
              <GuideDetail label="Bu neyi gösterir?" text={item.shows} tone="text-cyan-300" />
              <GuideDetail label="Nasıl yorumlanır?" text={item.interpret} tone="text-amber-300" />
              <GuideDetail label="Hangi aksiyon alınmalı?" text={item.action} tone="text-emerald-300" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-3xl border border-primary/20 bg-primary/10 p-5">
        <h3 className="text-sm font-black text-white">Hızlı yorumlama eşikleri</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <GuideThreshold label="%70 ve üzeri" description="Güçlü veya sağlıklı alan" tone="text-emerald-300" />
          <GuideThreshold label="%50 - %69" description="İzlenmesi gereken alan" tone="text-amber-300" />
          <GuideThreshold label="%50 altı" description="Öncelikli iyileştirme alanı" tone="text-rose-300" />
        </div>
      </div>
    </MotionDiv>
  </MotionDiv>
);

export const GuideDetail = ({ label, text, tone }) => (
  <div>
    <p className={`text-[10px] font-black uppercase tracking-widest ${tone}`}>{label}</p>
    <p className="mt-1 text-xs font-semibold leading-5 text-text-muted">{text}</p>
  </div>
);

export const GuideThreshold = ({ label, description, tone }) => (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
    <p className={`text-sm font-black ${tone}`}>{label}</p>
    <p className="mt-1 text-[11px] font-semibold text-text-muted">{description}</p>
  </div>
);

export const QuickStartRail = ({ items = [] }) => (
  <div className="grid grid-cols-1 gap-3 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item, index) => (
      <div
        key={item.title}
        className="rounded-2xl border border-white/10 bg-black/20 p-4"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary-light">
            {index + 1}
          </span>
          <p className="text-sm font-black text-white">{item.title}</p>
        </div>
        <p className="mt-3 text-xs font-semibold leading-6 text-text-muted">
          {item.text}
        </p>
      </div>
    ))}
  </div>
);

export const StatsSectionTabs = ({ tabs, activeSection, onChange }) => (
  <div className="grid grid-cols-1 gap-2 rounded-3xl border border-white/10 bg-white/[0.02] p-2 sm:grid-cols-2 xl:grid-cols-4 shadow-sm">
    {tabs.map(tab => {
      const Icon = tab.icon;
      const active = activeSection === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex min-h-[72px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
            active
              ? 'border-primary/20 bg-primary/10 text-white shadow-md shadow-primary/10'
              : 'border-white/10 bg-black/20 text-text-muted hover:border-white/20 hover:bg-white/[0.04] hover:text-white'
          }`}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            active ? 'border-primary/20 bg-primary/10 text-primary-light' : 'border-white/10 bg-white/5 text-text-muted'
          }`}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold leading-tight">{tab.label}</span>
            <span className={`mt-1 block text-[10px] font-bold leading-tight ${active ? 'text-white/60' : 'text-text-muted'}`}>
              {tab.helper}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);
