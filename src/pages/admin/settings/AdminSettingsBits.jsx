import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Save, CheckCircle2, AlertTriangle, X } from 'lucide-react';

// ─── Mini bileşenler ──────────────────────────────────────────────────────────

export const SaveBtn = ({ loading, label = 'Kaydet' }) => (
  <button
    type="submit"
    disabled={loading}
    className="flex h-11 items-center gap-2 rounded-2xl border border-primary/30 bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
    {label}
  </button>
);

export const SectionCard = ({ children, className = '' }) => (
  <div className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ icon: Icon, _iconColor = 'from-primary to-primary-dark', title, subtitle, action }) => (
  <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
        <Icon className="w-5 h-5 text-primary-light" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

export const FieldLabel = ({ children }) => (
  <label className="mb-2 block text-xs font-bold text-text-muted">{children}</label>
);

export const TextInput = ({ value, onChange, placeholder, ...rest }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium"
    {...rest}
  />
);

// SemVer Stepper — major.minor.patch for each part
export const SemverStepper = ({ value = '1.0.0', onChange }) => {
  const parts = String(value).split('.').map(Number);
  const [major, minor, patch] = [parts[0] || 1, parts[1] || 0, parts[2] || 0];

  const update = (index, delta) => {
    const next = [major, minor, patch];
    next[index] = Math.max(0, next[index] + delta);
    onChange(next.join('.'));
  };

  const labels = ['Major', 'Minor', 'Patch'];
  const values = [major, minor, patch];
  const colors = ['text-sky-400', 'text-violet-400', 'text-emerald-400'];

  return (
    <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-2.5">
      {values.map((v, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-white/20 font-bold text-lg select-none">.</span>}
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => update(i, 1)}
              className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded transition-all text-xs leading-none"
            >▲</button>
            <div className="flex flex-col items-center">
              <span className={`text-lg font-bold tabular-nums leading-none ${colors[i]}`}>{v}</span>
              <span className="text-[8px] text-white/20 uppercase tracking-wider">{labels[i]}</span>
            </div>
            <button
              type="button"
              onClick={() => update(i, -1)}
              className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded transition-all text-xs leading-none"
            >▼</button>
          </div>
        </React.Fragment>
      ))}
      {/* Editable raw input */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="ml-auto text-xs text-white/40 bg-transparent border-l border-white/10 pl-3 w-16 focus:outline-none focus:text-white font-mono"
      />
    </div>
  );
};

export const Toast = ({ msg, type = 'success', onClose }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-bold shadow-xl shadow-black/40 ${
          type === 'success'
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-danger/10 border-danger/30 text-danger'
        }`}
      >
        {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        {msg}
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
