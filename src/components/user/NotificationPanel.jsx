import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, Check, CheckCheck, Trash2, Loader2,
  Megaphone, MessageCircle, Trophy, AlertTriangle, BookOpen, ClipboardList
} from 'lucide-react';
import api from '../../api';

const typeConfig = {
  system:      { icon: Bell,           color: 'text-primary-light', bg: 'bg-primary/10',  border: 'border-primary/20' },
  broadcast:   { icon: Megaphone,      color: 'text-warning',       bg: 'bg-warning/10',  border: 'border-warning/20' },
  social:      { icon: MessageCircle,  color: 'text-accent-light',  bg: 'bg-accent/10',   border: 'border-accent/20' },
  feed:        { icon: MessageCircle,  color: 'text-accent-light',  bg: 'bg-accent/10',   border: 'border-accent/20' },
  achievement: { icon: Trophy,         color: 'text-warning',       bg: 'bg-warning/10',  border: 'border-warning/20' },
  alert:       { icon: AlertTriangle,  color: 'text-danger',        bg: 'bg-danger/10',   border: 'border-danger/20' },
  exam:        { icon: ClipboardList,  color: 'text-success',       bg: 'bg-success/10',  border: 'border-success/20' },
};

const timeAgo = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return new Date(date).toLocaleDateString('tr-TR');
};

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  // Dış tıklama ile kapatma
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const data = res.data?.notifications || res.data?.data || res.data;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Bildirim yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const markAllRead = async () => {
    setActionLoading('all');
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const deleteNotification = async (id) => {
    setActionLoading(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-[420px] max-h-[70vh] glass-card border border-white/10 rounded-2xl shadow-2xl shadow-black/40 z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="font-black text-lg">Bildirimler</h3>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-primary/20 text-primary-light text-[10px] font-black rounded-full uppercase tracking-wider">
                  {unreadCount} yeni
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={actionLoading === 'all'}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-success"
                  title="Tümünü Okundu İşaretle"
                >
                  {actionLoading === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Bell className="w-7 h-7 text-text-muted opacity-50" />
                </div>
                <p className="text-text-muted font-bold text-sm">Henüz bildiriminiz yok</p>
                <p className="text-text-muted text-xs mt-1 opacity-60">Yeni bildirimler burada görünecek.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => {
                  const config = typeConfig[notif.type] || typeConfig.system;
                  const IconComp = config.icon;
                  return (
                    <motion.div
                      key={notif._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 flex gap-3 transition-colors group ${
                        notif.isRead ? 'opacity-60 hover:opacity-80' : 'bg-primary/[0.02] hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
                        <IconComp className={`w-5 h-5 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-bold leading-tight ${notif.isRead ? 'text-text-secondary' : 'text-white'}`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{timeAgo(notif.createdAt)}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.isRead && (
                              <button
                                onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                                disabled={actionLoading === notif._id}
                                className="p-1.5 hover:bg-success/10 rounded-lg text-text-muted hover:text-success transition-colors"
                                title="Okundu İşaretle"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                              disabled={actionLoading === notif._id}
                              className="p-1.5 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger transition-colors"
                              title="Sil"
                            >
                              {actionLoading === notif._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
