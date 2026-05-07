import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MessageCircle,
  RefreshCw,
  Share2,
  ShieldAlert,
  X,
} from 'lucide-react';
import api from '../../api';

const readList = (body) => {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];
  for (const key of ['data', 'items', 'results', 'reports', 'posts', 'notifications']) {
    if (Array.isArray(body[key])) return body[key];
  }
  return [];
};

const statusText = (status) => String(status || '').toLowerCase();

const formatTime = (date) => {
  if (!date) return '';

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';

  const diff = Math.floor((Date.now() - value.getTime()) / 1000);
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return value.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const getLastMessage = (ticket) => {
  const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
  return messages[messages.length - 1] || null;
};

const createSupportNotification = (ticket) => {
  const lastMessage = getLastMessage(ticket);
  const userName = [ticket.userId?.firstName, ticket.userId?.lastName].filter(Boolean).join(' ') || ticket.userId?.name || 'Kullanıcı';

  return {
    id: `support-${ticket._id}`,
    type: 'support',
    title: ticket.status === 'new' ? 'Yeni destek talebi' : 'Destek mesajı geldi',
    text: lastMessage?.text || ticket.message || ticket.subject || 'Yeni destek mesajı var.',
    meta: `${userName} • ${ticket.subject || 'Destek talebi'}`,
    date: lastMessage?.sentAt || ticket.updatedAt || ticket.createdAt,
    path: '/admin/support',
  };
};

const createReportNotification = (report) => ({
  id: `report-${report._id}`,
  type: 'report',
  title: 'Yeni rapor',
  text: report.description || report.details || report.reason || 'Bir içerik raporlandı.',
  meta: report.questionId?.text ? `Soru: ${report.questionId.text}` : 'Rapor yönetimi',
  date: report.createdAt || report.updatedAt,
  path: '/admin/reports',
});

const createPostNotification = (post) => ({
  id: `post-${post._id}`,
  type: 'feed',
  title: 'Akış onayı bekliyor',
  text: post.title || post.content || 'Yeni gönderi onay bekliyor.',
  meta: post.userName || 'Akış gönderisi',
  date: post.createdAt || post.updatedAt,
  path: '/admin/feed',
});

const notificationConfig = {
  support: {
    icon: MessageCircle,
    label: 'Destek',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  report: {
    icon: ShieldAlert,
    label: 'Rapor',
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  feed: {
    icon: Share2,
    label: 'Akış',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
};

const AdminNotifications = () => {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState({ support: 0, reports: 0, feed: 0 });

  const totalCount = notifications.length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, ticketsRes, reportsRes] = await Promise.all([
        api.get('/posts/admin/pending').catch(() => ({ data: [] })),
        api.get('/contact').catch(() => ({ data: { data: [] } })),
        api.get('/reports').catch(() => ({ data: [] })),
      ]);

      const posts = readList(postsRes.data).filter((post) => statusText(post.status || 'pending') === 'pending');
      const tickets = readList(ticketsRes.data).filter((ticket) => {
        const status = statusText(ticket.status);
        const lastMessage = getLastMessage(ticket);
        return status !== 'closed' && (status === 'new' || lastMessage?.sender === 'user');
      });
      const reports = readList(reportsRes.data).filter((report) => {
        const status = statusText(report.status || 'open');
        return !['resolved', 'rejected', 'dismissed', 'closed'].includes(status);
      });

      const items = [
        ...tickets.map(createSupportNotification),
        ...reports.map(createReportNotification),
        ...posts.map(createPostNotification),
      ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      setNotifications(items);
      setSummary({ support: tickets.length, reports: reports.length, feed: posts.length });
    } catch (err) {
      console.error('Admin bildirimleri alınamadı:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [fetchNotifications, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const summaryItems = useMemo(() => ([
    { key: 'support', label: 'Destek', value: summary.support },
    { key: 'reports', label: 'Rapor', value: summary.reports },
    { key: 'feed', label: 'Akış', value: summary.feed },
  ]), [summary]);

  const openNotification = (item) => {
    setIsOpen(false);
    navigate(item.path);
  };

  const openPath = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative w-10 h-10 flex items-center justify-center rounded-xl border transition-all group ${
          isOpen
            ? 'bg-primary/10 border-primary/30 text-primary-light'
            : 'bg-white/[0.02] border-white/5 text-text-muted hover:text-white hover:bg-white/[0.05]'
        }`}
        aria-label="Admin bildirimleri"
      >
        <Bell className={`w-5 h-5 transition-transform ${isOpen ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`} />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-bg-card shadow-[0_0_10px_rgba(239,68,68,0.8)]">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-3 flex max-h-[74vh] w-[min(92vw,440px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101017] shadow-2xl shadow-black/70 ring-1 ring-black/40"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/5 bg-black/20 p-5">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-lg text-white">Admin Bildirimleri</h3>
                  {totalCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-danger/15 text-danger text-[10px] font-black rounded-full uppercase tracking-wider">
                      {totalCount} bekleyen
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted font-medium mt-1">Destek, rapor ve akış onaylarını buradan takip et.</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white"
                  title="Yenile"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-white/5 bg-black/30 p-3">
              {summaryItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => openPath(item.key === 'support' ? '/admin/support' : item.key === 'reports' ? '/admin/reports' : '/admin/feed')}
                  className="rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] px-3 py-2 text-left transition-colors"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{item.label}</p>
                  <p className="text-lg font-black text-white leading-tight mt-1">{item.value}</p>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-[#101017] custom-scrollbar">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-7 h-7 text-success" />
                  </div>
                  <p className="text-white font-black text-sm">Bekleyen iş yok</p>
                  <p className="text-text-muted text-xs mt-1">Yeni destek, rapor veya akış onayı geldiğinde burada görünecek.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((item) => {
                    const config = notificationConfig[item.type];
                    const Icon = config.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openNotification(item)}
                        className="w-full p-4 flex gap-3 text-left hover:bg-white/[0.04] transition-colors group"
                      >
                        <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-white leading-tight truncate">{item.title}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1 truncate">{config.label} • {item.meta}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">{item.text}</p>
                          <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            {formatTime(item.date)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNotifications;
