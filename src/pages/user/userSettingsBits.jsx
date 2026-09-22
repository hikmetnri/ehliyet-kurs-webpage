import React from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { BADGE_ICON_MAP } from './userSettingsHelpers';

const BadgeIcon = ({ name, ...props }) => {
  // Emoji veya bilinmeyen string ise direkt render et, Lucide name ise component döndür
  const Icon = BADGE_ICON_MAP[name];
  if (Icon) return <Icon {...props} />;
  // Emoji / fallback string
  return <span className="text-2xl leading-none">{name || '🏅'}</span>;
};

const DesktopSection = ({ icon: Icon, title, description, children, action, tone = 'primary' }) => {
  const toneClass = {
    primary: 'text-primary-light bg-primary/10 border-primary/20',
    accent: 'text-accent-light bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
    danger: 'text-danger bg-danger/10 border-danger/20',
  }[tone] || 'text-primary-light bg-primary/10 border-primary/20';

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">{title}</h3>
            {description && <p className="mt-1 max-w-xl text-sm font-semibold leading-relaxed text-text-muted">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
};

const DesktopField = ({ label, children }) => (
  <div className="space-y-2">
    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</label>
    {children}
  </div>
);

// Helper to render responsive slide-up sheets
const renderMobileModal = (isOpen, onClose, title, children) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
          onClick={() => onClose(false)}
        >
          <Motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            role="dialog" aria-modal="true" aria-label={title}
            onKeyDown={(event) => { if (event.key === 'Escape') onClose(false); }}
            className="flutter-mobile-sheet w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] bg-[#111218] border-t border-x border-white/5 p-6 pb-12 space-y-5 shadow-2xl overflow-y-auto max-h-[85vh] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
              <button
                onClick={() => onClose(false)}
                aria-label="Pencereyi kapat"
                className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-1">
              {children}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export {
  BadgeIcon,
  DesktopSection,
  DesktopField,
  // eslint-disable-next-line react-refresh/only-export-components -- portal yardimci fonksiyonu (JSX dondurur); adi birebir tasimadan korundu
  renderMobileModal
};
