import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, CheckCircle2, Clock, Loader2, AlertTriangle,
  MessageCircle, BarChart2, ShieldAlert, Settings,
  Edit3, Activity, Library, Award, QrCode, Share2, XCircle, AlertCircle,
  RefreshCw
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [overviewRes, postsRes, ticketsRes, reportsRes, logsRes, regTrendRes, catStatsRes, categoriesRes, maintenanceRes] = await Promise.all([
        api.get('/admin/stats/overview').catch(() => ({ data: { totalUsers: 0, totalExams: 0, avgSuccessRate: 0 } })),
        api.get('/posts/admin/pending').catch(() => ({ data: { data: [] } })),
        api.get('/contact').catch(() => ({ data: { data: [] } })),
        api.get('/reports').catch(() => ({ data: { data: [] } })),
        api.get('/admin/logs').catch(() => ({ data: [] })),
        api.get('/admin/stats/registration-trend').catch(() => ({ data: [] })),
        api.get('/admin/stats/categories').catch(() => ({ data: [] })),
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
  }, []);

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
    } catch (err) {
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
    } catch (err) {
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

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-xs font-black text-text-muted">Admin dashboard yükleniyor</span>
      </div>
    );
  }

  return (
    <>
      {/* Masaüstü Görünümü */}
      <div className="hidden lg:block w-full space-y-5 pb-10">
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-black text-primary-light">Operasyon özeti</p>
            <h1 className="text-2xl font-black leading-tight text-white">Admin dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-text-muted">
              Bekleyen moderasyon, destek ve içerik sağlığı metriklerini tek bakışta takip et.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2">
              <p className="text-xs font-semibold text-text-muted">Bekleyen iş</p>
              <p className="text-lg font-black text-white">
                {stats.pendingPostsCount + stats.activeSupportCount + stats.activeReportsCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2">
              <p className="text-xs font-semibold text-text-muted">Eksik içerik</p>
              <p className="text-lg font-black text-white">{contentHealth.missingContentCount}</p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="rounded-2xl border border-primary/30 bg-primary/15 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-primary/25"
            >
              Verileri yenile
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {statCards.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">Öncelikli Kuyruklar</h2>
            <p className="mt-1 text-sm text-text-muted">Admin girince ilk bakılması gereken operasyon sinyalleri.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {healthCards.map((card, index) => (
            <HealthCard key={card.title} {...card} delay={index * 0.05} onOpen={navigate} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">Yönetim Modülleri</h2>
          <p className="mt-1 text-sm text-text-muted">Admin panelindeki ana çalışma alanlarına hızlı erişim.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {moduleCards.map((module) => (
            <ModuleCard key={module.path} {...module} onOpen={navigate} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">Bekleyen İş Akışı</h2>
          <p className="mt-1 text-sm text-text-muted">Onay, destek ve rapor kararlarını dashboard üzerinden hızlıca yönet.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <QuickActionCard
          title="Bekleyen Gönderiler"
          description="Topluluk onay bekliyor"
          icon={Clock}
          color={{ bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' }}
          items={pendingPosts}
          emptyText="Bekleyen gönderi yok."
          onViewAll={() => navigate('/admin/feed')}
          renderItem={(post) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-text-secondary uppercase">{post.category || 'Genel'}</span>
                <span className="text-[9px] text-text-muted">{post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR') : '-'}</span>
              </div>
              <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{post.title || post.content}</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={processingAction?.startsWith(`post-${post._id}`)}
                  onClick={() => handlePostDecision(post._id, 'approve')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Onayla
                </button>
                <button
                  type="button"
                  disabled={processingAction?.startsWith(`post-${post._id}`)}
                  onClick={() => handlePostDecision(post._id, 'reject')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reddet
                </button>
              </div>
            </div>
          )}
        />
        <QuickActionCard
          title="Destek Talepleri"
          description="Kullanıcılar yanıt bekliyor"
          icon={MessageCircle}
          color={{ bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' }}
          items={supportTickets}
          emptyText="Açık destek bileti yok."
          onViewAll={() => navigate('/admin/support')}
          renderItem={(ticket) => (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm font-semibold text-white truncate min-w-0">{ticket.subject || 'Konusuz'}</p>
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5" />
              </div>
              <p className="text-xs text-text-muted italic line-clamp-1">{ticket.message || 'Detaylar sistemde kayıtlı.'}</p>
            </div>
          )}
        />
        <QuickActionCard
          title="Şikayetler / Raporlar"
          description="İncelenmesi gerekenler"
          icon={ShieldAlert}
          color={{ bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' }}
          items={reportedItems}
          emptyText="Şu an açık şikayet yok."
          onViewAll={() => navigate('/admin/reports')}
          renderItem={(report) => (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider truncate">{report.reason || 'Bildirim'}</p>
                  </div>
                  <p className="text-xs text-text-secondary leading-tight mt-1 line-clamp-2">{report.details || report.description || 'Açıklama belirtilmemiş.'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={processingAction?.startsWith(`report-${report._id}`)}
                  onClick={() => handleReportDecision(report._id, 'resolved')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Kapat
                </button>
                <button
                  type="button"
                  disabled={processingAction?.startsWith(`report-${report._id}`)}
                  onClick={() => handleReportDecision(report._id, 'rejected')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-text-muted transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reddet
                </button>
              </div>
            </div>
          )}
        />
        </div>
      </section>

      {/* Grafikler Alanı */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MotionDiv className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
          <div className="mb-4">
            <h3 className="text-sm font-black text-white sm:text-base">Yeni Kayıt Trendi</h3>
            <p className="mt-1 text-xs font-medium text-text-muted">Son 7 gün içindeki yeni kullanıcı hareketi</p>
          </div>
          <div className="h-56 sm:h-64 w-full">
            {hasRegistrationData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={regData} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} itemStyle={{ color: '#a5b4fc' }} />
                  <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState text="Seçili aralıkta yeni kayıt yok. Veri geldikçe trend burada çizilecek." />
            )}
          </div>
        </MotionDiv>

        <MotionDiv className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
          <div className="mb-4">
            <h3 className="text-sm font-black text-white sm:text-base">Kategori Başarı Oranları</h3>
            <p className="mt-1 text-xs font-medium text-text-muted">Kategori bazlı sınav performansı</p>
          </div>
          <div className="h-56 sm:h-64 w-full">
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} interval={0} tickFormatter={(value) => String(value).slice(0, 8)} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip cursor={{fill: '#27272a', opacity: 0.4}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                  <Bar dataKey="oran" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState text="Kategori bazlı sınav sonucu oluşunca başarı oranları burada görünecek." />
            )}
          </div>
        </MotionDiv>
      </section>

      {/* Ekstra Modüller: Loglar ve Not Defteri */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Aktivite Logları */}
        <MotionDiv className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.025] p-4 lg:col-span-3" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
          <div className="mb-4 flex items-start justify-between gap-3 sm:items-center">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-black text-white sm:text-base">
                <Activity className="h-5 w-5 text-primary-light" />
                Sistem Aktiviteleri
              </h3>
              <p className="mt-1 text-xs font-medium text-text-muted">Son yönetici işlemleri ve sistem kayıtları</p>
            </div>
            <button className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-text-muted transition-colors hover:bg-white/[0.07] hover:text-white" onClick={() => navigate('/admin/stats')}>
               Detaylı Loglar
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {adminLogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-4 py-10 text-center">
                <p className="text-sm font-bold text-text-muted">Henüz aktivite kaydı yok.</p>
              </div>
            ) : adminLogs.map((log) => (
              <div key={log._id} className="grid gap-3 border-b border-white/5 px-1 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{log.action}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{log.adminName || 'Bilinmeyen yönetici'}</p>
                  </div>
                </div>
                <span className="w-fit rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-text-muted">
                  {new Date(log.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </MotionDiv>

        {/* Not Defteri */}
        <MotionDiv className="flex min-h-[260px] flex-col rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
          <h3 className="mb-3 flex items-center gap-2 font-black text-warning">
            <Edit3 className="h-5 w-5" />
            Hızlı Notlar
          </h3>
          <textarea
            value={note}
            onChange={saveNote}
            className="w-full flex-1 resize-none rounded-2xl border border-amber-500/10 bg-black/10 p-3 text-sm font-medium leading-relaxed text-white/90 placeholder:text-warning/30 focus:border-amber-500/30 focus:outline-none custom-scrollbar"
            placeholder="Kendinize veya ekibe notlar alın. Tarayıcıda saklanır..."
          />
        </MotionDiv>
      </div>

      </div>

      {/* Mobil Görünümü */}
      <div className="block lg:hidden w-full space-y-6 pb-20">
        {/* Mobil Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted">Merhaba,</span>
            <h1 className="text-xl font-black text-white">Yönetici {user?.firstName || 'Admin'}</h1>
          </div>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white transition active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Yönetim Özeti (Hero Card) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-5 text-white shadow-xl shadow-indigo-950/20">
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Toplam Bekleyen İş</span>
            <p className="mt-1 text-4xl font-black tracking-tight">
              {stats.pendingPostsCount + stats.activeSupportCount + stats.activeReportsCount}
            </p>
            <p className="mt-2 text-xs font-medium text-indigo-100">
              Onay bekleyen akış gönderileri, şikayetler ve açık destek talepleri.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />
        </div>

        {/* Metric Strip (3 Columns) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 text-center">
            <ShieldAlert className="mx-auto h-5 w-5 text-rose-400" />
            <span className="mt-1 block text-lg font-black text-white">{stats.activeReportsCount}</span>
            <span className="text-[10px] font-bold text-rose-300/70">Rapor</span>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
            <Clock className="mx-auto h-5 w-5 text-amber-400" />
            <span className="mt-1 block text-lg font-black text-white">{stats.pendingPostsCount}</span>
            <span className="text-[10px] font-bold text-amber-300/70">Akış</span>
          </div>
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3 text-center">
            <MessageCircle className="mx-auto h-5 w-5 text-purple-400" />
            <span className="mt-1 block text-lg font-black text-white">{stats.activeSupportCount}</span>
            <span className="text-[10px] font-bold text-purple-300/70">Destek</span>
          </div>
        </div>

        {/* Analitik Kartları */}
        <div className="space-y-4">
          {/* Kayıt Trendi */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
            <h3 className="text-sm font-black text-white">Kayıt Trendi</h3>
            <p className="text-[11px] font-medium text-text-muted">Son 7 günlük yeni kullanıcı kaydı</p>
            <div className="mt-4 h-48 w-full">
              {hasRegistrationData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={regData} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsersMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} itemStyle={{ color: '#a5b4fc' }} />
                    <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsersMobile)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState text="Veri bulunmuyor." />
              )}
            </div>
          </div>

          {/* Kategori Başarı Listesi (Progress Bar ile) */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
            <h3 className="text-sm font-black text-white">Kategori Başarı Oranları</h3>
            <p className="text-[11px] font-medium text-text-muted">Kategori bazlı sınav performansları</p>
            
            <div className="mt-4 space-y-3">
              {hasCategoryData ? (
                categoryStats.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-[70%]">{cat.name}</span>
                      <span className="font-black text-emerald-400">%{cat.oran}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${cat.oran}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-text-muted text-center py-4">Veri bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>

        {/* Öncelikli İşler (Akış & Raporlar) */}
        <div className="space-y-4">
          <h2 className="text-base font-black tracking-tight text-white">Öncelikli İşler</h2>
          
          <div className="space-y-3">
            {/* Bekleyen Gönderiler */}
            {pendingPosts.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bekleyen Gönderi ({pendingPosts.length})</h3>
                </div>
                <div className="space-y-3">
                  {pendingPosts.map((post) => (
                    <div key={post._id} className="rounded-2xl border border-white/5 bg-black/20 p-3 space-y-2">
                      <p className="text-xs font-medium text-text-muted">{post.category || 'Genel'}</p>
                      <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{post.title || post.content}</p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          disabled={processingAction?.startsWith(`post-${post._id}`)}
                          onClick={() => handlePostDecision(post._id, 'approve')}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition active:scale-95 disabled:opacity-50"
                        >
                          Onayla
                        </button>
                        <button
                          type="button"
                          disabled={processingAction?.startsWith(`post-${post._id}`)}
                          onClick={() => handlePostDecision(post._id, 'reject')}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-rose-300 transition active:scale-95 disabled:opacity-50"
                        >
                          Reddet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Şikayetler */}
            {reportedItems.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Açık Şikayetler ({reportedItems.length})</h3>
                </div>
                <div className="space-y-3">
                  {reportedItems.map((report) => (
                    <div key={report._id} className="rounded-2xl border border-white/5 bg-black/20 p-3 space-y-2">
                      <p className="text-xs font-bold text-white uppercase">{report.reason || 'Şikayet'}</p>
                      <p className="text-xs text-text-secondary leading-tight line-clamp-2">{report.details || report.description || 'Açıklama belirtilmemiş.'}</p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          disabled={processingAction?.startsWith(`report-${report._id}`)}
                          onClick={() => handleReportDecision(report._id, 'resolved')}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition active:scale-95 disabled:opacity-50"
                        >
                          Kapat
                        </button>
                        <button
                          type="button"
                          disabled={processingAction?.startsWith(`report-${report._id}`)}
                          onClick={() => handleReportDecision(report._id, 'rejected')}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-text-muted transition active:scale-95 disabled:opacity-50"
                        >
                          Reddet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {pendingPosts.length === 0 && reportedItems.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.015] p-6 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/40 mb-2" />
                <p className="text-xs font-bold text-text-muted">Şu an ilgilenilmesi gereken iş bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

        {/* Hızlı Araçlar (Toolbox) */}
        <div className="space-y-4">
          <h2 className="text-base font-black tracking-tight text-white">Hızlı Araçlar</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-center transition active:scale-95 hover:bg-white/[0.04]"
            >
              <MessageCircle className="h-5 w-5 text-indigo-400 mb-2" />
              <span className="text-xs font-bold text-white">Duyuru Gönder</span>
              <span className="text-[10px] text-text-muted mt-1">Kullanıcılara anons et</span>
            </button>
            
            <button
              type="button"
              onClick={handleBackup}
              disabled={processingAction === 'backup'}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-center transition active:scale-95 hover:bg-white/[0.04] disabled:opacity-50"
            >
              <FileText className="h-5 w-5 text-emerald-400 mb-2" />
              <span className="text-xs font-bold text-white">Hızlı Yedek</span>
              <span className="text-[10px] text-text-muted mt-1">DB yedeği al</span>
            </button>
            
            <button
              type="button"
              onClick={toggleMaintenance}
              disabled={processingAction === 'maintenance'}
              className={`col-span-2 flex items-center justify-between rounded-2xl border p-4 transition active:scale-95 disabled:opacity-50 ${
                isMaintenance 
                  ? 'border-rose-500/30 bg-rose-500/5' 
                  : 'border-emerald-500/30 bg-emerald-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`h-5 w-5 ${isMaintenance ? 'text-rose-400' : 'text-emerald-400'}`} />
                <div className="text-left">
                  <span className="block text-xs font-bold text-white">Bakım Modu</span>
                  <span className="block text-[10px] text-text-muted">
                    {isMaintenance ? 'Sistem şu an bakımda (Kapalı)' : 'Sistem aktif çalışıyor (Açık)'}
                  </span>
                </div>
              </div>
              <div className={`h-5 w-10 rounded-full p-0.5 transition-colors duration-200 ${isMaintenance ? 'bg-rose-500' : 'bg-zinc-700'}`}>
                <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 ${isMaintenance ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
