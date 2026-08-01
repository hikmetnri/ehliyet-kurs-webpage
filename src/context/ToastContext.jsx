import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] pointer-events-none space-y-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const config = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
    },
    error: {
      icon: AlertTriangle,
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      text: 'text-primary-light',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
    },
  };

  const cfg = config[toast.type] || config.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-bold shadow-xl shadow-black/40 pointer-events-auto ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onRemove}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

// Convenience hook for common patterns
export const useToastActions = () => {
  const toast = useToast();

  return {
    showSuccess: (message = 'İşlem başarıyla tamamlandı') => toast.showSuccess(message),
    showError: (message = 'Bir hata oluştu') => toast.showError(message),
    showLoading: (message = 'Yükleniyor...') => toast.showInfo(message, 0), // No auto-dismiss
    showDeleted: (itemName = 'Öğe') => toast.showSuccess(`${itemName} silindi`),
    showCreated: (itemName = 'Öğe') => toast.showSuccess(`${itemName} oluşturuldu`),
    showUpdated: (itemName = 'Öğe') => toast.showSuccess(`${itemName} güncellendi`),
    showValidationError: (message = 'Lütfen tüm gerekli alanları doldurun') => toast.showError(message),
    showNetworkError: () => toast.showError('Ağ bağlantısında sorun oluştu. Lütfen tekrar deneyin.'),
  };
};
