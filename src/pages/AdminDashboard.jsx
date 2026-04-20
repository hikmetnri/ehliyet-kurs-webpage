import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, CheckCircle, Clock, Loader2, AlertTriangle, 
  MessageCircle, BarChart2, ShieldAlert, Plus, Bell, Settings, 
  Download, Edit3, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import api from '../api';

const StatCard = ({ title, value, icon: Icon, colorClass, gradient, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay }}
    className="bg-black/30 backdrop-blur-md rounded-[24px] p-6 relative overflow-hidden group border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.02]"
  >
    <div className={`absolute -right-4 -top-4 w-32 h-32 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-[40px] group-hover:opacity-40 transition-opacity duration-500`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <h3 className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${gradient}`}></span>
          {title}
        </h3>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 shadow-lg ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </motion.div>
);

const QuickActionCard = ({ title, description, icon: Icon, color, items, emptyText, renderItem, onViewAll }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-black/30 backdrop-blur-xl rounded-[32px] p-6 border border-white/5 flex flex-col h-[380px] hover:border-white/10 transition-colors"
  >
    <div className="flex justify-between items-center mb-6 shrink-0 px-2">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-[20px] shadow-lg shadow-black/50 flex items-center justify-center ${color.bg} ${color.text} border ${color.border} relative overflow-hidden group`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${color.bg}`}></div>
          <Icon className="w-5 h-5 relative z-10" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white leading-tight tracking-tight">{title}</h2>
          <p className="text-[11px] text-text-muted font-bold tracking-wide mt-0.5">{description}</p>
        </div>
      </div>
      <button onClick={onViewAll} className="px-4 py-2 text-[10px] uppercase font-black tracking-widest text-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-[12px] transition-colors border border-white/5">
        Tümü
      </button>
    </div>
    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
          <Icon className="w-14 h-14 mb-4 text-white" />
          <p className="text-xs font-bold text-white uppercase tracking-widest">{emptyText}</p>
        </div>
      ) : (
        items.map((item, idx) => (
          <div key={item._id || idx} className="p-4 rounded-[20px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 hover:shadow-xl transition-all duration-300">
            {renderItem(item)}
          </div>
        ))
      )}
    </div>
  </motion.div>
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
  
  // Real Chart States
  const [regData, setRegData] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(localStorage.getItem('adminNote') || '');

  const fetchData = async () => {
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
      const postsData = postsRes.data?.data || [];
      const ticketsData = ticketsRes.data?.data || [];
      const reportsData = reportsRes.data?.data || [];
      const logsData = Array.isArray(logsRes.data) ? logsRes.data : [];
      
      // Update chart states
      setRegData(Array.isArray(regTrendRes.data) ? regTrendRes.data : []);

      // Map category stats correctly for Recharts (BarChart uses dataKey="oran")
      const catData = Array.isArray(catStatsRes.data) ? catStatsRes.data.map(c => ({
        name: c.categoryName || 'Bilinmiyor',
        oran: c.avgSuccessRate || 0
      })) : [];
      setCategoryStats(catData);

      const activeTickets = ticketsData.filter(t => t.status === 'unread' || t.status === 'read' || t.status === 'Yeni');
      const activeReports = reportsData.filter(r => r.status !== 'closed' && r.status !== 'resolved');

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
  };

  useEffect(() => { fetchData(); }, []);

  const saveNote = (e) => {
    setNote(e.target.value);
    localStorage.setItem('adminNote', e.target.value);
  };

  const statCards = [
    { title: 'Toplam Kullanıcı', value: stats.totalUsers.toLocaleString('tr-TR'), icon: Users, colorClass: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30', gradient: 'from-indigo-500 to-indigo-400', delay: 0.1 },
    { title: 'Çözülen Sınav', value: stats.totalExams.toLocaleString('tr-TR'), icon: FileText, colorClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', gradient: 'from-blue-500 to-cyan-400', delay: 0.2 },
    { title: 'Genel Başarı', value: `%${stats.avgSuccessRate}`, icon: BarChart2, colorClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', gradient: 'from-emerald-500 to-emerald-400', delay: 0.3 },
    { title: 'Bekleyen Gönderi', value: stats.pendingPostsCount.toString(), icon: Clock, colorClass: 'bg-amber-500/20 text-amber-500 border border-amber-500/30', gradient: 'from-amber-500 to-orange-400', delay: 0.4 },
    { title: 'Açık Destek', value: stats.activeSupportCount.toString(), icon: MessageCircle, colorClass: 'bg-pink-500/20 text-pink-400 border border-pink-500/30', gradient: 'from-pink-500 to-rose-400', delay: 0.5 },
    { title: 'Açık Raporlar', value: stats.activeReportsCount.toString(), icon: ShieldAlert, colorClass: 'bg-red-500/20 text-red-500 border border-red-500/30', gradient: 'from-red-600 to-red-400', delay: 0.6 },
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
    <div className="space-y-8 pb-10 w-full px-2 2xl:px-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Sistem <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-indigo-400">Komuta Merkezi</span></h1>
          <p className="text-text-muted text-[13px] font-medium tracking-wide">Tüm ağ analizlerini ve operasyonel metrikleri tek bir vizyondan yönetin.</p>
        </div>
        
        {/* Hızlı İşlem Butonları (Header) */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar shrink-0">
          <button onClick={() => navigate('/admin/content')} className="flex items-center gap-2.5 px-6 py-3 bg-primary/10 text-primary border border-primary/20 hover:border-primary/50 hover:bg-primary/20 rounded-[16px] font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shadow-lg shadow-primary/5">
            <Plus className="w-4 h-4" /> İçerik Üret
          </button>
          <button onClick={() => navigate('/admin/settings')} className="flex items-center gap-2.5 px-6 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/20 rounded-[16px] font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shadow-lg shadow-amber-500/5">
            <Bell className="w-4 h-4" /> Anons Geç
          </button>
          <button onClick={() => navigate('/admin/settings?tab=system')} className="flex items-center gap-2.5 px-6 py-3 bg-white/5 text-white border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-[16px] font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap overflow-hidden relative">
            <Settings className="w-4 h-4" /> Donanım
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      {/* Alt 3'lü Acil Aksiyonlar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-white truncate max-w-[70%]">{ticket.subject || 'Konusuz'}</p>
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
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider truncate">{report.reason || 'Bildirim'}</p>
                </div>
                <p className="text-xs text-text-secondary leading-tight mt-1 line-clamp-2">{report.details || 'Açıklama belirtilmemiş.'}</p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Grafikler Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="glass-card p-6 rounded-2xl border border-white/5 bg-black/20" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
          <h3 className="text-white font-black mb-4">Yeni Kayıt Trendi (Son 7 Gün)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={regData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} itemStyle={{ color: '#a5b4fc' }} />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="glass-card p-6 rounded-2xl border border-white/5 bg-black/20" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
          <h3 className="text-white font-black mb-4">Kategori Başarı Oranları (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: '#27272a', opacity: 0.4}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Bar dataKey="oran" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Ekstra Modüller: Loglar ve Not Defteri */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Aktivite Logları */}
        <motion.div className="glass-card p-5 rounded-2xl border border-white/5 bg-black/20 lg:col-span-3" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
          <div className="flex items-center justify-between mb-4">
               <h3 className="text-white font-black flex items-center gap-2"><Activity className="w-5 h-5 text-primary-light" /> Sistem Aktiviteleri</h3>
            <button className="text-[10px] text-text-muted hover:text-white uppercase font-bold tracking-widest transition-colors cursor-pointer" onClick={() => navigate('/admin/stats')}>
               Detaylı Loglar
            </button>
          </div>
          <div className="space-y-4 max-h-56 overflow-y-auto custom-scrollbar pr-2">
            {adminLogs.map((log) => (
              <div key={log._id} className="relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-[-16px] before:w-[2px] before:bg-white/10 last:before:hidden">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-bg-dark border border-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div className="flex justify-between items-start pt-1">
                  <div>
                    <p className="text-sm text-white font-medium">{log.action}</p>
                    <p className="text-[10px] text-text-muted">{log.adminName}</p>
                  </div>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-text-muted">
                    {new Date(log.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Not Defteri */}
        <motion.div className="glass-card p-5 rounded-2xl border border-white/5 bg-warning/5 flex flex-col" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
          <h3 className="text-warning font-black flex items-center gap-2 mb-3"><Edit3 className="w-5 h-5" /> Hızlı Notlar</h3>
          <textarea 
            value={note}
            onChange={saveNote}
            className="w-full flex-1 bg-transparent border-none text-white/90 text-sm resize-none focus:ring-0 custom-scrollbar placeholder:text-warning/30 font-medium leading-relaxed"
            placeholder="Kendinize veya ekibe notlar alın. Tarayıcıda saklanır..."
          />
        </motion.div>
      </div>

    </div>
  );
};

export default AdminDashboard;
