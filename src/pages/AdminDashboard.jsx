import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, CheckCircle2, Clock, Loader2, AlertTriangle,
  MessageCircle, BarChart2, ShieldAlert, Settings,
  Edit3, Activity, Library, Award, QrCode, Share2, XCircle, AlertCircle,
  RefreshCw, Megaphone, Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import api from '../api';
import { hasChartValue, normalizeCategoryStats, normalizeRegistrationTrend, readList } from '../utils/statsData';
import { isVideoRecord } from '../utils/categoryContent';
import useAuthStore from '../store/authStore';

const MotionDiv = motion.div;

const StatCard = ({ title, value, icon, colorClass, delay }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay }}
    className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="mb-2 text-xs font-semibold leading-tight text-text-muted">{title}</h3>
        <p className="truncate text-2xl font-black tracking-tight text-white">{value}</p>
      </div>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${colorClass}`}>
        {React.createElement(icon, { className: 'h-4 w-4' })}
      </div>
    </div>
  </MotionDiv>
);

const QuickActionCard = ({ title, description, icon, color, items, emptyText, renderItem, onViewAll }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex h-[340px] flex-col rounded-3xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20"
  >
    <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${color.bg} ${color.text} ${color.border}`}>
          {React.createElement(icon, { className: 'h-4 w-4' })}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-black leading-tight text-white">{title}</h2>
          <p className="mt-0.5 line-clamp-1 text-xs font-medium text-text-muted">{description}</p>
        </div>
      </div>
      <button onClick={onViewAll} className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-text-muted transition-colors hover:bg-white/[0.07] hover:text-white">
        Tümü
      </button>
    </div>
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-6 text-center">
          {React.createElement(icon, { className: 'mb-3 h-8 w-8 text-white/20' })}
          <p className="text-xs font-bold text-text-muted">{emptyText}</p>
        </div>
      ) : (
        items.map((item, idx) => (
          <div key={item._id || idx} className="rounded-2xl border border-white/10 bg-black/15 p-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]">
            {renderItem(item)}
          </div>
        ))
      )}
    </div>
  </MotionDiv>
);

const ModuleCard = ({ title, description, icon, color, path, metric, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(path)}
    className="group min-h-[122px] rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition-colors hover:border-white/20 hover:bg-white/[0.05]"
  >
    <div className="flex items-start justify-between gap-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${color.bg} ${color.text} ${color.border}`}>
        {React.createElement(icon, { className: 'h-4 w-4' })}
      </div>
      <span className="text-xs font-bold text-white/30 transition-colors group-hover:text-white/60">
        Aç
      </span>
    </div>
    <div className="mt-4">
      <h3 className="text-sm font-black text-white">{title}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">{description}</p>
      {metric && <p className={`mt-3 text-xs font-black ${color.text}`}>{metric}</p>}
    </div>
  </button>
);

const HealthCard = ({ title, value, detail, icon, tone, path, onOpen, delay }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition-colors hover:border-white/20 hover:bg-white/[0.04]"
  >
    <button type="button" onClick={() => onOpen(path)} className="flex w-full items-center gap-3 text-left">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${tone.bg} ${tone.text} ${tone.border}`}>
        {React.createElement(icon, { className: 'h-5 w-5' })}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-text-muted">{title}</span>
        <span className="mt-1 block text-2xl font-black leading-none text-white">{value}</span>
        <span className="mt-1.5 block truncate text-xs font-semibold text-text-muted">{detail}</span>
      </span>
      <span className="text-xs font-bold text-white/30 transition group-hover:text-white/70">
        İncele
      </span>
    </button>
  </MotionDiv>
);

const ChartEmptyState = ({ text }) => (
  <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 text-center">
    <AlertCircle className="mb-3 h-8 w-8 text-white/25" />
    <p className="text-xs font-bold leading-relaxed text-text-muted">{text}</p>
  </div>
);

const PriorityBanner = ({ title, description, actionLabel, onAction, tone, chips }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${tone.bg} ${tone.text} ${tone.border}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Bugün önce buna bak</p>
          <h2 className="mt-1 text-lg font-black leading-tight text-white">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-muted">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onAction}
          className={`rounded-2xl border px-4 py-3 text-sm font-black transition-colors ${tone.bg} ${tone.text} ${tone.border} hover:opacity-90`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70"
        >
          <span className={`h-2 w-2 rounded-full ${chip.dot}`} />
          {chip.label}: <span className="text-white">{chip.value}</span>
        </span>
      ))}
    </div>
  </MotionDiv>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    totalUsers: 0, totalExams: 0, avgSuccessRate: 0, pendingPostsCount: 0, activeSupportCount: 0, activeReportsCount: 0
  });
  const [contentHealth, setContentHealth] = useState({ missingContentCount: 0, totalContentCategories: 0 });
  const [isMaintenance, setIsMaintenance] = useState(false);
  
  const [pendingPosts, setPendingPosts] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [processingAction, setProcessingAction] = useState(null);
  
  // Real Chart States
  const [regData, setRegData] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(localStorage.getItem('adminNote') || '');
  const [activeQueueTab, setActiveQueueTab] = useState('posts');

  // Kategori Filtresi Eyaletleri
  const [rootCategories, setRootCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  useEffect(() => {
    const fetchRootCategories = async () => {
      try {
        const res = await api.get('/categories/all');
        const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        const roots = list.filter(cat => !cat.parent);
        setRootCategories(roots);
      } catch (err) {
        console.error('Kategoriler alınamadı:', err);
      }
    };
    fetchRootCategories();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategoryId !== 'all') params.set('categoryId', selectedCategoryId);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      
      const [overviewRes, postsRes, ticketsRes, reportsRes, logsRes, regTrendRes, catStatsRes, categoriesRes, maintenanceRes] = await Promise.all([
        api.get(`/admin/stats/overview${queryStr}`).catch(() => ({ data: { totalUsers: 0, totalExams: 0, avgSuccessRate: 0 } })),
        api.get('/posts/admin/pending').catch(() => ({ data: { data: [] } })),
        api.get('/contact').catch(() => ({ data: { data: [] } })),
        api.get('/reports').catch(() => ({ data: { data: [] } })),
        api.get('/admin/logs').catch(() => ({ data: [] })),
        api.get(`/admin/stats/registration-trend${queryStr}`).catch(() => ({ data: [] })),
        api.get(`/admin/stats/categories${queryStr}`).catch(() => ({ data: [] })),
        api.get('/categories/all').catch(() => ({ data: { data: [] } })),
        api.get('/admin/maintenance-status').catch(() => ({ data: { isMaintenance: false } }))
      ]);

      const overviewData = overviewRes.data || {};
      const postsData = readList(postsRes.data);
      const ticketsData = readList(ticketsRes.data);
      const reportsData = readList(reportsRes.data);
      const logsData = readList(logsRes.data);
      const categoriesData = readList(categoriesRes.data).filter((category) => !isVideoRecord(category));
      
      setRegData(normalizeRegistrationTrend(regTrendRes.data));
      setCategoryStats(normalizeCategoryStats(catStatsRes.data));
      setIsMaintenance(!!(maintenanceRes?.data?.isMaintenance || maintenanceRes?.data?.enabled));

      const activeTickets = ticketsData.filter(t => !['closed', 'kapalı'].includes(String(t.status || '').toLowerCase()));
      const activeReports = reportsData.filter(r => !['closed', 'resolved', 'rejected', 'dismissed'].includes(String(r.status || '').toLowerCase()));
      const contentCategories = categoriesData.filter(c => {
        const hasChildren = categoriesData.some(child => String(child.parent?._id || child.parent || '') === String(c._id));
        return !hasChildren;
      });
      const missingContentCount = contentCategories.filter(c => !c.content || !c.content.trim()).length;

      setStats({
        totalUsers: overviewData.totalUsers || 0,
        totalExams: overviewData.totalExams || 0,
        avgSuccessRate: overviewData.avgSuccessRate || 0,
        pendingPostsCount: postsData.length,
        activeSupportCount: activeTickets.length,
        activeReportsCount: activeReports.length
      });
      setContentHealth({ missingContentCount, totalContentCategories: contentCategories.length });

      setPendingPosts(postsData.slice(0, 5));
      setSupportTickets(activeTickets.slice(0, 5)); 
      setReportedItems(activeReports.slice(0, 5)); 
      
      setAdminLogs(logsData.slice(0, 10));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveNote = (e) => {
    setNote(e.target.value);
    localStorage.setItem('adminNote', e.target.value);
  };

  const toggleMaintenance = async () => {
    try {
      setProcessingAction('maintenance');
      const nextVal = !isMaintenance;
      await api.post('/admin/maintenance', { enabled: nextVal });
      setIsMaintenance(nextVal);
      alert(`Bakım modu ${nextVal ? 'aktif edildi' : 'kapatıldı'}.`);
    } catch {
      alert('Bakım modu değiştirilemedi.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleBackup = async () => {
    try {
      setProcessingAction('backup');
      const res = await api.get('/admin/backup');
      if (res.data?.status === 'success') {
        alert(`Yedekleme başarılı! Dosya: ${res.data.filename}`);
      } else {
        alert('Yedekleme başarısız oldu.');
      }
    } catch {
      alert('Yedekleme hatası oluştu.');
    } finally {
      setProcessingAction(null);
    }
  };

  const updatePendingCount = (field, delta) => {
    setStats(prev => ({
      ...prev,
      [field]: Math.max(0, (prev[field] || 0) + delta)
    }));
  };

  const handlePostDecision = async (postId, action) => {
    const adminNote = action === 'reject' ? window.prompt('Reddetme sebebi (isteğe bağlı):') : '';
    if (adminNote === null) return;

    try {
      setProcessingAction(`post-${postId}-${action}`);
      await api.patch(`/posts/${postId}/${action}`, action === 'reject' ? { adminNote } : undefined);
      setPendingPosts(prev => prev.filter(post => post._id !== postId));
      updatePendingCount('pendingPostsCount', -1);
    } catch {
      alert(action === 'approve' ? 'Gönderi onaylanamadı.' : 'Gönderi reddedilemedi.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReportDecision = async (reportId, status) => {
    try {
      setProcessingAction(`report-${reportId}-${status}`);
      await api.put(`/reports/${reportId}/status`, { status });
      setReportedItems(prev => prev.filter(report => report._id !== reportId));
      updatePendingCount('activeReportsCount', -1);
    } catch {
      alert('Rapor durumu güncellenemedi.');
    } finally {
      setProcessingAction(null);
    }
  };

  const statCards = [
    { title: 'Toplam Kullanıcı', value: stats.totalUsers.toLocaleString('tr-TR'), icon: Users, colorClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', delay: 0.1 },
    { title: 'Çözülen Sınav', value: stats.totalExams.toLocaleString('tr-TR'), icon: FileText, colorClass: 'bg-blue-500/10 text-blue-300 border-blue-500/20', delay: 0.2 },
    { title: 'Genel Başarı', value: `%${stats.avgSuccessRate}`, icon: BarChart2, colorClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', delay: 0.3 },
    { title: 'Bekleyen Gönderi', value: stats.pendingPostsCount.toString(), icon: Clock, colorClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20', delay: 0.4 },
    { title: 'Açık Destek', value: stats.activeSupportCount.toString(), icon: MessageCircle, colorClass: 'bg-pink-500/10 text-pink-300 border-pink-500/20', delay: 0.5 },
    { title: 'Açık Raporlar', value: stats.activeReportsCount.toString(), icon: ShieldAlert, colorClass: 'bg-red-500/10 text-red-300 border-red-500/20', delay: 0.6 },
  ];

  const moduleCards = [
    { title: 'Kullanıcı Yönetimi', description: 'Hesap, yetki, PRO ve bildirim işlemleri.', icon: Users, path: '/admin/users', metric: `${stats.totalUsers.toLocaleString('tr-TR')} hesap`, color: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20' } },
    { title: 'Bildirim Yönetimi', description: 'Toplu veya hedefli anlık push bildirimleri.', icon: Bell, path: '/admin/notifications', color: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/20' } },
    { title: 'Sınav Yönetimi', description: 'Kısa test, deneme ve gerçek sınav soru bankası.', icon: FileText, path: '/admin/exams', metric: `${stats.totalExams.toLocaleString('tr-TR')} çözüm`, color: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20' } },
    { title: 'İçerik Yönetimi', description: 'Ders notları, kategoriler ve konu içerikleri.', icon: Library, path: '/admin/content', color: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' } },
    { title: 'İstatistikler', description: 'Kayıt trendi, kategori başarıları ve zor sorular.', icon: BarChart2, path: '/admin/stats', metric: `%${stats.avgSuccessRate} başarı`, color: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/20' } },
    { title: 'Destek Talepleri', description: 'Öğrenci mesajlarını takip et ve yanıtla.', icon: MessageCircle, path: '/admin/support', metric: `${stats.activeSupportCount} açık talep`, color: { bg: 'bg-pink-500/10', text: 'text-pink-300', border: 'border-pink-500/20' } },
    { title: 'Akış Yönetimi', description: 'Topluluk gönderilerini onayla veya reddet.', icon: Share2, path: '/admin/feed', metric: `${stats.pendingPostsCount} bekleyen`, color: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' } },
    { title: 'Rapor Yönetimi', description: 'Şikayetleri ve işaretlenen içerikleri incele.', icon: ShieldAlert, path: '/admin/reports', metric: `${stats.activeReportsCount} açık rapor`, color: { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/20' } },
    { title: 'Rozetler', description: 'Başarı rozetlerini oluştur ve düzenle.', icon: Award, path: '/admin/badges', color: { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/20' } },
    { title: 'Pazarlama', description: 'QR kampanyaları ve reklam ayarları.', icon: QrCode, path: '/admin/marketing', color: { bg: 'bg-teal-500/10', text: 'text-teal-300', border: 'border-teal-500/20' } },
    { title: 'Yönetim Merkezi', description: 'Sistem, hukuki metinler, S.S.S. ve anonslar.', icon: Settings, path: '/admin/settings', color: { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/20' } },
  ];

  const healthCards = [
    {
      title: 'Açık Destek',
      value: stats.activeSupportCount,
      detail: 'Yanıt bekleyen destek talepleri',
      icon: MessageCircle,
      path: '/admin/support',
      tone: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/20' },
    },
    {
      title: 'Açık Rapor',
      value: stats.activeReportsCount,
      detail: 'İnceleme bekleyen şikayetler',
      icon: ShieldAlert,
      path: '/admin/reports',
      tone: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' },
    },
    {
      title: 'Akış Onayı',
      value: stats.pendingPostsCount,
      detail: 'Yayınlanmayı bekleyen gönderiler',
      icon: Share2,
      path: '/admin/feed',
      tone: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
    },
    {
      title: 'Eksik İçerik',
      value: contentHealth.missingContentCount,
      detail: `${contentHealth.totalContentCategories} konu içinde boş içerik`,
      icon: AlertCircle,
      path: '/admin/content',
      tone: { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/20' },
    },
  ];
  const hasRegistrationData = hasChartValue(regData, 'users');
  const hasCategoryData = categoryStats.length > 0;
  const priorityItems = [
    {
      label: 'Bekleyen gönderi',
      value: stats.pendingPostsCount,
      path: '/admin/feed',
      tone: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
      dot: 'bg-amber-400',
      description: 'Topluluk onay kuyruğu',
    },
    {
      label: 'Açık destek',
      value: stats.activeSupportCount,
      path: '/admin/support',
      tone: { bg: 'bg-pink-500/10', text: 'text-pink-300', border: 'border-pink-500/20' },
      dot: 'bg-pink-400',
      description: 'Yanıt bekleyen talepler',
    },
    {
      label: 'Açık rapor',
      value: stats.activeReportsCount,
      path: '/admin/reports',
      tone: { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/20' },
      dot: 'bg-red-400',
      description: 'İncelenmesi gereken içerikler',
    },
    {
      label: 'Eksik içerik',
      value: contentHealth.missingContentCount,
      path: '/admin/content',
      tone: { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/20' },
      dot: 'bg-violet-400',
      description: 'Tamamlanması gereken konu sayısı',
    },
  ].sort((a, b) => b.value - a.value);
  const prioritySignal = priorityItems[0];
  const priorityTitle =
    prioritySignal?.value > 0
      ? `${prioritySignal.label} önde`
      : 'Acil kuyruk yok';
  const priorityDescription =
    prioritySignal?.value > 0
      ? `${prioritySignal.description} şu anda en yüksek öncelikte görünüyor.`
      : 'Bekleyen gönderi, destek, rapor veya eksik içerik görünmüyor.';

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-xs font-black text-text-muted">Admin dashboard yükleniyor</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Bakım Modu Uyarı Bandı */}
      {isMaintenance && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500 animate-pulse" />
          <p className="text-sm font-bold text-rose-400 flex-1">
            Bakım modu aktif — Kullanıcılar uygulamaya erişemiyor.
          </p>
          <button
            type="button"
            onClick={toggleMaintenance}
            disabled={processingAction === 'maintenance'}
            className="shrink-0 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Header section with Category Filter & Quick Actions */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-light">
              Hoş Geldiniz{user?.firstName ? `, ${user.firstName}` : ''}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">Yönetici Paneli</h1>
            <p className="mt-1.5 max-w-2xl text-xs font-medium text-text-muted">
              Moderasyon kuyrukları, sistem durumu ve detaylı kullanım metriklerini buradan yönetin.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0d1017] px-4 py-3 text-xs font-bold text-white outline-none cursor-pointer hover:border-white/20 transition-all w-full sm:w-auto"
            >
              <option value="all">Tüm Eğitimler (Ortak)</option>
              {rootCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs font-black text-white hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Verileri Yenile
            </button>
          </div>
        </div>
      </section>

      {/* Priority Banner (Today's Highlight) */}
      <PriorityBanner
        title={priorityTitle}
        description={priorityDescription}
        actionLabel={prioritySignal?.value > 0 ? 'Öncelikli Kuyruğa Git' : 'İçeriği Gözden Geçir'}
        onAction={() => navigate(prioritySignal?.value > 0 ? prioritySignal.path : '/admin/content')}
        tone={prioritySignal?.tone || { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' }}
        chips={priorityItems.map((item) => ({
          label: item.label,
          value: item.value.toLocaleString('tr-TR'),
          dot: item.dot,
        }))}
      />

      {/* Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (col-span-8): KPIs, Tabbed Operations Queue, Charts */}
        <div className="lg:col-span-8 space-y-6 w-full min-w-0">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {statCards.map((stat, i) => (
              <StatCard key={i} {...stat} delay={i * 0.05} />
            ))}
          </div>

          {/* Tabbed Operations Queue */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col shadow-sm">
            {/* Header / Tabs Selector */}
            <div className="border-b border-white/10 bg-black/20 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Operasyonel İş Kuyruğu</h3>
                <p className="text-[10px] text-text-muted mt-0.5 font-bold">Onay, destek biletleri ve şikayet yönetim alanı</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'posts', label: 'Onay Bekleyenler', icon: Clock, count: pendingPosts.length, color: 'text-amber-400' },
                  { id: 'support', label: 'Destek Talepleri', icon: MessageCircle, count: supportTickets.length, color: 'text-pink-400' },
                  { id: 'reports', label: 'Şikayetler', icon: ShieldAlert, count: reportedItems.length, color: 'text-rose-400' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveQueueTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeQueueTab === tab.id
                        ? 'bg-primary/10 border-primary/30 text-primary-light font-black'
                        : 'bg-white/[0.02] border-white/10 text-text-muted hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <tab.icon className={`w-3.5 h-3.5 ${tab.color}`} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] text-white font-bold">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue Tab Content */}
            <div className="p-5 max-h-[360px] overflow-y-auto custom-scrollbar">
              {activeQueueTab === 'posts' && (
                <div className="space-y-4">
                  {pendingPosts.length === 0 ? (
                    <div className="p-8 text-center text-text-muted text-xs">Onay bekleyen akış gönderisi bulunmamaktadır.</div>
                  ) : (
                    pendingPosts.map(post => (
                      <div key={post._id} className="rounded-2xl border border-white/5 bg-black/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/[0.02] hover:border-white/10">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-text-secondary uppercase">{post.category || 'Genel'}</span>
                            <span className="text-[9px] text-text-muted">{post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR') : '-'}</span>
                          </div>
                          <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{post.title || post.content}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={processingAction?.startsWith(`post-${post._id}`)}
                            onClick={() => handlePostDecision(post._id, 'approve')}
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Onayla
                          </button>
                          <button
                            type="button"
                            disabled={processingAction?.startsWith(`post-${post._id}`)}
                            onClick={() => handlePostDecision(post._id, 'reject')}
                            className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reddet
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeQueueTab === 'support' && (
                <div className="space-y-4">
                  {supportTickets.length === 0 ? (
                    <div className="p-8 text-center text-text-muted text-xs">Açık destek talebi bulunmamaktadır.</div>
                  ) : (
                    supportTickets.map(ticket => (
                      <div key={ticket._id} className="rounded-2xl border border-white/5 bg-black/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/[0.02] hover:border-white/10">
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-3">
                            <p className="text-sm font-semibold text-white truncate">{ticket.subject || 'Konusuz'}</p>
                            <span className="text-[9px] text-text-muted shrink-0">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('tr-TR') : '-'}</span>
                          </div>
                          <p className="text-xs text-text-muted italic mt-1.5 line-clamp-1">"{ticket.message || 'Detaylar sistemde kayıtlı.'}"</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/admin/support')}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-white/10 cursor-pointer shrink-0"
                        >
                          Yanıtla
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeQueueTab === 'reports' && (
                <div className="space-y-4">
                  {reportedItems.length === 0 ? (
                    <div className="p-8 text-center text-text-muted text-xs">Açık şikayet/rapor bulunmamaktadır.</div>
                  ) : (
                    reportedItems.map(report => (
                      <div key={report._id} className="rounded-2xl border border-white/5 bg-black/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/[0.02] hover:border-white/10">
                        <div className="min-w-0 flex-1 flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white uppercase tracking-wider truncate">{report.reason || 'Şikayet'}</p>
                            <p className="text-xs text-text-secondary leading-tight mt-1 line-clamp-2">{report.details || report.description || 'Açıklama belirtilmemiş.'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={processingAction?.startsWith(`report-${report._id}`)}
                            onClick={() => handleReportDecision(report._id, 'resolved')}
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Çözüldü
                          </button>
                          <button
                            type="button"
                            disabled={processingAction?.startsWith(`report-${report._id}`)}
                            onClick={() => handleReportDecision(report._id, 'rejected')}
                            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-text-muted transition hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reddet
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Performance Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registration Trend */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-black text-white">Yeni Kayıt Trendi</h3>
                <p className="text-[11px] font-medium text-text-muted">Son 7 günlük yeni kullanıcı hareketi</p>
              </div>
              <div className="h-56 w-full">
                {hasRegistrationData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={regData} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} itemStyle={{ color: '#a5b4fc' }} />
                      <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmptyState text="Son 7 gün kayıt verisi bulunmamaktadır." />
                )}
              </div>
            </div>

            {/* Category Success Rates */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-black text-white">Kategori Başarı Oranları</h3>
                <p className="text-[11px] font-medium text-text-muted">Kategori bazlı sınav performansları</p>
              </div>
              <div className="h-56 w-full flex flex-col justify-center">
                {hasCategoryData ? (
                  <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 custom-scrollbar">
                    {categoryStats.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white truncate max-w-[70%]">{cat.name}</span>
                          <span className="font-black text-emerald-400">%{cat.oran}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${cat.oran}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-text-muted text-center py-4">Sınav performansı verisi bulunmuyor.</p>
                )}
              </div>
            </div>
          </div>

          {/* Module Links Cards Grid */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black tracking-tight text-white">Tüm Yönetim Modülleri</h2>
              <p className="text-xs text-text-muted mt-0.5">Operasyonel ekranlara hızlı geçiş yapın</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
              {moduleCards.map((module) => (
                <ModuleCard key={module.path} {...module} onOpen={navigate} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (col-span-4): Controls, Quick Notes, Logs */}
        <div className="lg:col-span-4 space-y-6 w-full shrink-0">
          {/* Quick Operations Controls */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Hızlı Kontroller</h3>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin/notifications')}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 py-3 text-[10px] font-black uppercase tracking-wider text-primary-light hover:bg-primary/15 transition duration-150 cursor-pointer active:scale-95"
              >
                <Bell className="h-4 w-4" />
                <span>Bildirim</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/settings')}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-3 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/15 transition duration-150 cursor-pointer active:scale-95"
              >
                <Megaphone className="h-4 w-4" />
                <span>Duyuru</span>
              </button>
              <button
                type="button"
                onClick={handleBackup}
                disabled={processingAction === 'backup'}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 py-3 text-[10px] font-black uppercase tracking-wider text-indigo-400 hover:bg-indigo-500/15 transition duration-150 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {processingAction === 'backup' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                <span>Yedek</span>
              </button>
              <button
                type="button"
                onClick={toggleMaintenance}
                disabled={processingAction === 'maintenance'}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer active:scale-95 disabled:opacity-50 ${
                  isMaintenance 
                    ? 'border-rose-500/30 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25' 
                    : 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>{isMaintenance ? 'Aktif' : 'Bakım'}</span>
              </button>
            </div>

            {/* Health Indicators */}
            <div className="border-t border-white/5 pt-4 space-y-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Sağlık Sinyalleri</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-text-secondary">
                <div className="flex items-center gap-2 p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${stats.activeReportsCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="truncate">Şikayetler: <strong className="text-white">{stats.activeReportsCount}</strong></span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${stats.activeSupportCount > 0 ? 'bg-pink-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="truncate">Açık Destek: <strong className="text-white">{stats.activeSupportCount}</strong></span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${stats.pendingPostsCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="truncate">Akış Onayı: <strong className="text-white">{stats.pendingPostsCount}</strong></span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${contentHealth.missingContentCount > 0 ? 'bg-warning animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="truncate">Eksik Konu: <strong className="text-white">{contentHealth.missingContentCount}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Sticky Notes */}
          <div className="flex min-h-[220px] flex-col rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-black text-warning text-sm uppercase tracking-wider">
              <Edit3 className="h-4 w-4" />
              Hızlı Notlar
            </h3>
            <textarea
              value={note}
              onChange={saveNote}
              className="w-full flex-1 resize-none rounded-2xl border border-amber-500/10 bg-black/20 p-3.5 text-xs font-semibold leading-relaxed text-white/90 placeholder:text-warning/30 focus:border-amber-500/30 focus:outline-none custom-scrollbar"
              placeholder="Kendinize veya ekibe notlar alın. Tarayıcıda saklanır..."
            />
          </div>

          {/* Activity Logs Feed */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 shadow-sm flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-wider">
                <Activity className="h-4 w-4 text-primary-light" />
                Sistem Günlüğü
              </h3>
              <button 
                className="rounded-xl border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-bold text-text-muted hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                onClick={() => navigate('/admin/stats')}
              >
                Loglar
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {adminLogs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-4 py-8 text-center">
                  <p className="text-xs font-bold text-text-muted">Aktivite kaydı bulunamadı.</p>
                </div>
              ) : (
                adminLogs.map((log) => (
                  <div key={log._id} className="flex gap-2 border-b border-white/5 pb-2.5 mb-2.5 last:border-0 last:pb-0 last:mb-0 items-start text-[11px]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-primary-light">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white leading-normal truncate">{log.action}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{log.adminName || 'Admin'} • {new Date(log.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
