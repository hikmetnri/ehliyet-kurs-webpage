import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, CheckCircle2, Clock, Loader2, AlertTriangle, 
  MessageCircle, BarChart2, ShieldAlert, Plus, Bell, Settings, 
  Edit3, Activity, Library, Award, QrCode, Share2, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import api from '../api';

const MotionDiv = motion.div;

const readList = (body) => {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];
  for (const key of ['data', 'items', 'results', 'reports', 'posts']) {
    if (Array.isArray(body[key])) return body[key];
  }
  return [];
};

const StatCard = ({ title, value, icon, colorClass, gradient, delay }) => (
  <MotionDiv 
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay }}
    className="bg-black/30 backdrop-blur-md rounded-2xl sm:rounded-[24px] p-4 sm:p-5 lg:p-6 relative overflow-hidden group border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.02]"
  >
    <div className={`absolute -right-4 -top-4 w-32 h-32 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-[40px] group-hover:opacity-40 transition-opacity duration-500`}></div>
    <div className="flex items-start justify-between gap-3 relative z-10">
      <div className="min-w-0">
        <h3 className="text-text-muted text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-tight">
          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${gradient}`}></span>
          {title}
        </h3>
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">{value}</p>
      </div>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[16px] flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 shadow-lg shrink-0 ${colorClass}`}>
        {React.createElement(icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
      </div>
    </div>
  </MotionDiv>
);

const QuickActionCard = ({ title, description, icon, color, items, emptyText, renderItem, onViewAll }) => (
  <MotionDiv 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-black/30 backdrop-blur-xl rounded-2xl sm:rounded-[32px] p-4 sm:p-6 border border-white/5 flex flex-col h-[320px] sm:h-[360px] lg:h-[380px] hover:border-white/10 transition-colors"
  >
    <div className="flex justify-between items-start sm:items-center gap-3 mb-5 sm:mb-6 shrink-0 sm:px-2">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-[20px] shadow-lg shadow-black/50 flex items-center justify-center ${color.bg} ${color.text} border ${color.border} relative overflow-hidden group shrink-0`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${color.bg}`}></div>
          {React.createElement(icon, { className: 'w-4 h-4 sm:w-5 sm:h-5 relative z-10' })}
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight truncate">{title}</h2>
          <p className="text-[11px] text-text-muted font-bold tracking-wide mt-0.5 line-clamp-1">{description}</p>
        </div>
      </div>
      <button onClick={onViewAll} className="px-3 sm:px-4 py-2 text-[10px] uppercase font-black tracking-widest text-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-[12px] transition-colors border border-white/5 shrink-0">
        Tümü
      </button>
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 sm:pr-2 custom-scrollbar">
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
          {React.createElement(icon, { className: 'w-14 h-14 mb-4 text-white' })}
          <p className="text-xs font-bold text-white uppercase tracking-widest">{emptyText}</p>
        </div>
      ) : (
        items.map((item, idx) => (
          <div key={item._id || idx} className="p-3 sm:p-4 rounded-2xl sm:rounded-[20px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 hover:shadow-xl transition-all duration-300">
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
    className="text-left bg-black/25 border border-white/5 rounded-2xl sm:rounded-[24px] p-4 sm:p-5 hover:bg-white/[0.04] hover:border-white/15 transition-all group min-h-[132px] sm:min-h-[150px]"
  >
    <div className="flex items-start justify-between gap-4">
      <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center border ${color.bg} ${color.text} ${color.border} shrink-0`}>
        {React.createElement(icon, { className: 'w-5 h-5' })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
        Aç
      </span>
    </div>
    <div className="mt-4 sm:mt-5">
      <h3 className="text-sm font-black text-white tracking-tight">{title}</h3>
      <p className="text-xs text-text-muted leading-relaxed mt-1 line-clamp-2">{description}</p>
      {metric && <p className={`text-[11px] font-black mt-4 ${color.text}`}>{metric}</p>}
    </div>
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0, totalExams: 0, avgSuccessRate: 0, pendingPostsCount: 0, activeSupportCount: 0, activeReportsCount: 0
  });
  
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
      
      const [overviewRes, postsRes, ticketsRes, reportsRes, logsRes, regTrendRes, catStatsRes] = await Promise.all([
        api.get('/admin/stats/overview').catch(() => ({ data: { totalUsers: 0, totalExams: 0, avgSuccessRate: 0 } })),
        api.get('/posts/admin/pending').catch(() => ({ data: { data: [] } })),
        api.get('/contact').catch(() => ({ data: { data: [] } })),
        api.get('/reports').catch(() => ({ data: { data: [] } })),
        api.get('/admin/logs').catch(() => ({ data: [] })),
        api.get('/admin/stats/registration-trend').catch(() => ({ data: [] })),
        api.get('/admin/stats/categories').catch(() => ({ data: [] }))
      ]);

      const overviewData = overviewRes.data || {};
      const postsData = readList(postsRes.data);
      const ticketsData = readList(ticketsRes.data);
      const reportsData = readList(reportsRes.data);
      const logsData = readList(logsRes.data);
      
      // Update chart states
      setRegData(readList(regTrendRes.data));

      // Map category stats correctly for Recharts (BarChart uses dataKey="oran")
      const catData = readList(catStatsRes.data).map(c => ({
        name: c.categoryName || 'Bilinmiyor',
        oran: c.avgSuccessRate || 0
      }));
      setCategoryStats(catData);

      const activeTickets = ticketsData.filter(t => !['closed', 'kapalı'].includes(String(t.status || '').toLowerCase()));
      const activeReports = reportsData.filter(r => !['closed', 'resolved', 'rejected', 'dismissed'].includes(String(r.status || '').toLowerCase()));

      setStats({
        totalUsers: overviewData.totalUsers || 0,
        totalExams: overviewData.totalExams || 0,
        avgSuccessRate: overviewData.avgSuccessRate || 0,
        pendingPostsCount: postsData.length,
        activeSupportCount: activeTickets.length,
        activeReportsCount: activeReports.length
      });

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
    { title: 'Toplam Kullanıcı', value: stats.totalUsers.toLocaleString('tr-TR'), icon: Users, colorClass: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30', gradient: 'from-indigo-500 to-indigo-400', delay: 0.1 },
    { title: 'Çözülen Sınav', value: stats.totalExams.toLocaleString('tr-TR'), icon: FileText, colorClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', gradient: 'from-blue-500 to-cyan-400', delay: 0.2 },
    { title: 'Genel Başarı', value: `%${stats.avgSuccessRate}`, icon: BarChart2, colorClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', gradient: 'from-emerald-500 to-emerald-400', delay: 0.3 },
    { title: 'Bekleyen Gönderi', value: stats.pendingPostsCount.toString(), icon: Clock, colorClass: 'bg-amber-500/20 text-amber-500 border border-amber-500/30', gradient: 'from-amber-500 to-orange-400', delay: 0.4 },
    { title: 'Açık Destek', value: stats.activeSupportCount.toString(), icon: MessageCircle, colorClass: 'bg-pink-500/20 text-pink-400 border border-pink-500/30', gradient: 'from-pink-500 to-rose-400', delay: 0.5 },
    { title: 'Açık Raporlar', value: stats.activeReportsCount.toString(), icon: ShieldAlert, colorClass: 'bg-red-500/20 text-red-500 border border-red-500/30', gradient: 'from-red-600 to-red-400', delay: 0.6 },
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

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
        <div className="absolute w-32 h-32 bg-primary/20 blur-[50px] rounded-full animate-pulse"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary-light z-10">Sistem Hazırlanıyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 w-full px-0 sm:px-2 2xl:px-8">
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight sm:leading-none mb-2">Sistem <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-indigo-400">Komuta Merkezi</span></h1>
          <p className="text-text-muted text-[13px] font-medium tracking-wide leading-relaxed">Tüm ağ analizlerini ve operasyonel metrikleri tek bir vizyondan yönetin.</p>
        </div>
        
        {/* Hızlı İşlem Butonları (Header) */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 xl:pb-0 custom-scrollbar shrink-0 -mx-3 px-3 sm:mx-0 sm:px-0">
          <button onClick={() => navigate('/admin/content')} className="flex items-center gap-2.5 px-4 sm:px-6 py-3 bg-primary/10 text-primary border border-primary/20 hover:border-primary/50 hover:bg-primary/20 rounded-[16px] font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shadow-lg shadow-primary/5">
            <Plus className="w-4 h-4" /> İçerik Üret
          </button>
          <button onClick={() => navigate('/admin/settings')} className="flex items-center gap-2.5 px-4 sm:px-6 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/20 rounded-[16px] font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shadow-lg shadow-amber-500/5">
            <Bell className="w-4 h-4" /> Anons Geç
          </button>
          <button onClick={() => navigate('/admin/settings?tab=system')} className="flex items-center gap-2.5 px-4 sm:px-6 py-3 bg-white/5 text-white border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-[16px] font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap overflow-hidden relative">
            <Settings className="w-4 h-4" /> Donanım
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Yönetim Modülleri</h2>
          <p className="text-text-muted text-sm mt-1">Admin panelindeki tüm sayfalara hızlı erişim.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3 sm:gap-4">
          {moduleCards.map((module) => (
            <ModuleCard key={module.path} {...module} onOpen={navigate} />
          ))}
        </div>
      </section>

      {/* Alt 3'lü Acil Aksiyonlar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Grafikler Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <MotionDiv className="glass-card p-4 sm:p-6 rounded-2xl border border-white/5 bg-black/20 min-w-0" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
          <h3 className="text-white font-black mb-4 text-sm sm:text-base">Yeni Kayıt Trendi (Son 7 Gün)</h3>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={regData} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} itemStyle={{ color: '#a5b4fc' }} />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>

        <MotionDiv className="glass-card p-4 sm:p-6 rounded-2xl border border-white/5 bg-black/20 min-w-0" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
          <h3 className="text-white font-black mb-4 text-sm sm:text-base">Kategori Başarı Oranları (%)</h3>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} interval={0} tickFormatter={(value) => String(value).slice(0, 8)} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: '#27272a', opacity: 0.4}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Bar dataKey="oran" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>
      </div>

      {/* Ekstra Modüller: Loglar ve Not Defteri */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Aktivite Logları */}
        <MotionDiv className="glass-card p-4 sm:p-5 rounded-2xl border border-white/5 bg-black/20 lg:col-span-3 min-w-0" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
          <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
               <h3 className="text-white font-black flex items-center gap-2 text-sm sm:text-base"><Activity className="w-5 h-5 text-primary-light" /> Sistem Aktiviteleri</h3>
            <button className="text-[10px] text-text-muted hover:text-white uppercase font-bold tracking-widest transition-colors cursor-pointer shrink-0" onClick={() => navigate('/admin/stats')}>
               Detaylı Loglar
            </button>
          </div>
          <div className="space-y-4 max-h-56 overflow-y-auto custom-scrollbar pr-2">
            {adminLogs.map((log) => (
              <div key={log._id} className="relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-[-16px] before:w-[2px] before:bg-white/10 last:before:hidden">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-bg-dark border border-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 pt-1">
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium">{log.action}</p>
                    <p className="text-[10px] text-text-muted">{log.adminName}</p>
                  </div>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-text-muted w-fit shrink-0">
                    {new Date(log.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </MotionDiv>

        {/* Not Defteri */}
        <MotionDiv className="glass-card p-4 sm:p-5 rounded-2xl border border-white/5 bg-warning/5 flex flex-col min-h-[260px]" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
          <h3 className="text-warning font-black flex items-center gap-2 mb-3"><Edit3 className="w-5 h-5" /> Hızlı Notlar</h3>
          <textarea 
            value={note}
            onChange={saveNote}
            className="w-full flex-1 bg-transparent border-none text-white/90 text-sm resize-none focus:ring-0 custom-scrollbar placeholder:text-warning/30 font-medium leading-relaxed"
            placeholder="Kendinize veya ekibe notlar alın. Tarayıcıda saklanır..."
          />
        </MotionDiv>
      </div>

    </div>
  );
};

export default AdminDashboard;
