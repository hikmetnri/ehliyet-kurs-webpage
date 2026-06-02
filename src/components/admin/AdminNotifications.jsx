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
        className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
          isOpen
            ? 'border-primary/30 bg-primary/15 text-primary-light'
            : 'border-white/10 bg-white/[0.025] text-text-muted hover:bg-white/[0.06] hover:text-white'
        }`}
        aria-label="Admin bildirimleri"
      >
        <Bell className="h-5 w-5" />
        {totalCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[#0f1118] bg-danger px-1 text-[10px] font-black text-white">
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
            className="absolute right-0 top-full z-50 mt-3 flex max-h-[74vh] w-[min(92vw,440px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11131a] shadow-xl shadow-black/40"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-white/[0.02] p-5">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-lg text-white">Admin Bildirimleri</h3>
                  {totalCount > 0 && (
                    <span className="rounded-full border border-danger/20 bg-danger/10 px-2.5 py-0.5 text-xs font-bold text-danger">
                      {totalCount} bekleyen
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-text-muted">Destek, rapor ve akış onaylarını takip et.</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="rounded-xl p-2 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
                  title="Yenile"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-white/10 bg-black/15 p-3">
              {summaryItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => openPath(item.key === 'support' ? '/admin/support' : item.key === 'reports' ? '/admin/reports' : '/admin/feed')}
                  className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <p className="text-xs font-bold text-text-muted">{item.label}</p>
                  <p className="mt-1 text-lg font-black leading-tight text-white">{item.value}</p>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-[#11131a] custom-scrollbar">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-success/20 bg-success/10">
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
                        className="group flex w-full gap-3 p-4 text-left transition-colors hover:bg-white/[0.04]"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.border} ${config.bg}`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-white leading-tight truncate">{item.title}</p>
                              <p className="mt-1 truncate text-xs font-semibold text-text-muted">{config.label} • {item.meta}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted">{item.text}</p>
                          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                            <Clock className="h-3 w-3" />
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
