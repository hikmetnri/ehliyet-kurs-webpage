import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, 
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, QrCode, 
  Loader2, BrainCircuit, Users, Activity, 
  Target, Bell, Clock, Crown, DownloadCloud
} from 'lucide-react';

const MotionDiv = motion.div;

const AdminStats = () => {
  const [overview, setOverview] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [difficultQuestions, setDifficultQuestions] = useState([]);
  const [registrationTrend, setRegistrationTrend] = useState([]);
  const [qrStats, setQrStats] = useState({ count: 0, daily: {} });
  const [dailyGoals, setDailyGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get('/admin/stats/overview'),
        api.get('/admin/stats/categories'),
        api.get('/admin/stats/difficult-questions'),
        api.get('/admin/stats/qr'),
        api.get('/admin/stats/registration-trend'),
        api.get('/admin/stats/daily-goals')
      ]);
      
      setOverview(results[0].status === 'fulfilled' ? results[0].value.data : null);
      setCategoryStats(results[1].status === 'fulfilled' ? results[1].value.data : []);
      setDifficultQuestions(results[2].status === 'fulfilled' ? results[2].value.data : []);
      setQrStats(results[3].status === 'fulfilled' ? results[3].value.data : { count: 0, daily: {} });
      setRegistrationTrend(results[4].status === 'fulfilled' ? results[4].value.data : []);
      setDailyGoals(results[5].status === 'fulfilled' ? results[5].value.data : []);
    } catch (err) {
      console.error('İstatistikler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <span className="text-text-muted font-bold text-xs uppercase tracking-widest text-center">
            Analitik Veriler Toplanıyor...
        </span>
      </div>
    );
  }

  const pieData = [
    { name: 'PRO', value: overview?.proUsers || 0, color: '#FCD34D' },
    { name: 'Free', value: (overview?.totalUsers || 0) - (overview?.proUsers || 0), color: '#6366f1' }
  ];
  const qrTrend = Object.entries(qrStats?.daily || {})
    .slice(-14)
    .map(([date, clicks]) => ({
      date: new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
      clicks,
    }));
  const dailyGoalData = dailyGoals.map(item => ({
    name: `${item.dailyGoal || 0} soru`,
    users: item.userCount || 0,
  }));

  return (
    <div className="space-y-6 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Merkezi Analitik Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Sistemin performans verileri ve kullanıcı davranış analizleri.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/10 transition-all"
        >
          <Activity className="w-4 h-4 text-primary-light" /> Verileri Tazele
        </button>
      </div>

      {/* --- TOP KPIs --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={Users} title="Toplam Öğrenci" value={overview?.totalUsers || 0} 
          trend={`+${overview?.newUsersThisWeek || 0}`} trendLabel="Bu Hafta"
          color="text-primary-light" bg="bg-primary/20"
        />
        <StatsCard 
          icon={Crown} title="PRO Üyeler" value={overview?.proUsers || 0} 
          trend={`%${Math.round((overview?.proUsers/overview?.totalUsers)*100) || 0}`} trendLabel="Oran"
          color="text-amber-400" bg="bg-amber-400/20"
        />
        <StatsCard 
          icon={Target} title="Genel Başarı" value={`%${overview?.avgSuccessRate || 0}`} 
          trend="Stabil" trendLabel="Genel Durum"
          color="text-emerald-400" bg="bg-emerald-400/20"
        />
        <StatsCard 
          icon={QrCode} title="QR Dönüşümü" value={qrStats?.count || 0} 
          trend="Aktif" trendLabel="Kampanyalar"
          color="text-indigo-400" bg="bg-indigo-400/20"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Activity} title="Bugün Aktif" value={overview?.activeToday || 0}
          trend={`%${Math.round(((overview?.activeToday || 0) / (overview?.totalUsers || 1)) * 100)}`} trendLabel="Aktif oran"
          color="text-cyan-400" bg="bg-cyan-400/20"
        />
        <StatsCard
          icon={BrainCircuit} title="Soru Havuzu" value={overview?.totalQuestions || 0}
          trend={`${difficultQuestions.length}`} trendLabel="Kritik soru"
          color="text-violet-400" bg="bg-violet-400/20"
        />
        <StatsCard
          icon={Bell} title="Bildirim Kapalı" value={overview?.notifDisabledCount || 0}
          trend={`%${Math.round(((overview?.notifDisabledCount || 0) / (overview?.totalUsers || 1)) * 100)}`} trendLabel="Kapalı oran"
          color="text-rose-400" bg="bg-rose-400/20"
        />
        <StatsCard
          icon={QrCode} title="QR Tıklanma" value={qrStats?.count || 0}
          trend={qrStats?.lastScanAt ? new Date(qrStats.lastScanAt).toLocaleDateString('tr-TR') : '-'} trendLabel="Son tıklama"
          color="text-indigo-400" bg="bg-indigo-400/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- REGISTRATION TREND (MAIN CHART) --- */}
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-card rounded-[32px] p-8 border border-white/5 shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-black text-white">Grafiksel Kayıt Akışı</h2>
              <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Son 7 Günlük Kayıtlar</p>
            </div>
            <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black text-primary-light uppercase tracking-widest">
              Gerçek Zamanlı
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#ffffff30" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                />
                <YAxis 
                    stroke="#ffffff30" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff10', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#6366f1' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#000' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>

        {/* --- PRO STATUS (DONUT CHART) --- */}
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-[32px] p-8 border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center"
        >
           <h2 className="text-lg font-black text-white mb-1">Üyelik Dağılımı</h2>
           <p className="text-xs text-text-muted mb-6 uppercase tracking-widest font-bold">Gelir Modeli Yapısı</p>
           
           <div className="relative h-[220px] w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
             </ResponsiveContainer>
             {/* Center Label */}
             <div className="absolute flex flex-col">
               <span className="text-2xl font-black text-white">{overview?.proUsers || 0}</span>
               <span className="text-[10px] font-black text-amber-400 uppercase">PRO</span>
             </div>
           </div>

           <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                <span className="text-[11px] font-black text-white/60">PRO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                <span className="text-[11px] font-black text-white/60">ÜCRETSİZ</span>
              </div>
           </div>
        </MotionDiv>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[32px] p-8 border border-white/5 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">QR Tıklanma Grafiği</h2>
              <p className="text-xs text-text-muted mt-0.5">Basılı QR kodun günlük tıklanma performansı.</p>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qrTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff10', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="clicks" fill="#818cf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-[32px] p-8 border border-white/5 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Günlük Hedef Dağılımı</h2>
              <p className="text-xs text-text-muted mt-0.5">Öğrencilerin seçtiği günlük soru hedefleri.</p>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyGoalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff10', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="users" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- CATEGORY PROGRESS --- */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-[32px] p-8 border border-white/5 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
               <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Konu Performans Barometresi</h2>
              <p className="text-xs text-text-muted mt-0.5">En çok çalışılması gereken konulardan en başarılılara.</p>
            </div>
          </div>

          <div className="space-y-6">
            {categoryStats.slice(0, 6).map((stat, i) => (
              <StatProgressBar 
                key={i}
                label={stat.categoryName}
                percentage={stat.avgSuccessRate}
                total={stat.totalAttempts}
              />
            ))}
          </div>
        </MotionDiv>

        {/* --- DIFFICULT QUESTIONS --- */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-[32px] p-8 border border-white/5 shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-white">Kritik Hata Noktaları</h2>
                    <p className="text-xs text-text-muted mt-0.5">Öğrencileri en çok eleyen sorular.</p>
                </div>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-2 custom-scrollbar">
             {difficultQuestions.slice(0, 5).map((q, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-3 group hover:border-rose-500/30 transition-all">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                         <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Kritik Soru</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/30">{q.wrongCount} Toplam Hata</span>
                   </div>
                   <p className="text-sm font-semibold text-white/80 leading-relaxed italic line-clamp-2">"{q.text}"</p>
                   <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${Math.round(q.failRate * 100)}%` }}></div>
                   </div>
                </div>
             ))}
          </div>
        </MotionDiv>

      </div>

      {/* --- FOOTER INSIGHTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <InsightCard 
            icon={Bell} title="Bildirim Etkileşimi" 
            value={`%${Math.round((overview?.notifEnabledCount/overview?.totalUsers)*100) || 0}`}
            desc={`${overview?.notifEnabledCount || 0} Kullanıcı bildirimleri açık.`}
         />
         <InsightCard 
            icon={Clock} title="Favori Saat" 
            value={`${overview?.mostCommonNotifHour || 0}:00`}
            desc="Kullanıcılar en çok bu saatte çalışıyor."
         />
         <InsightCard 
            icon={DownloadCloud} title="Haftalık Büyüme" 
            value={`+${overview?.newUsersThisWeek || 0}`}
            desc="Yeni katılan potansiyel PRO adayları."
         />
      </div>

    </div>
  );
};

// --- SUB COMPONENTS ---

const StatsCard = ({ icon: Icon, title, value, trend, trendLabel, color, bg }) => (
    <div className="glass-card p-6 rounded-[28px] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
        <div className="absolute -right-2 -top-2 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform">
            {React.createElement(Icon, { className: `w-24 h-24 ${color}` })}
        </div>
        <div className="relative z-10 flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} border border-white/5`}>
                {React.createElement(Icon, { className: `w-6 h-6 ${color}` })}
            </div>
            <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-black text-white mt-1 leading-none">{value}</h3>
                <div className="flex items-center gap-2 mt-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg bg-white/5 ${color}`}>{trend}</span>
                    <span className="text-[10px] text-text-muted font-bold tracking-tight">{trendLabel}</span>
                </div>
            </div>
        </div>
    </div>
);

const StatProgressBar = ({ label, percentage, total }) => {
  const colorClass = percentage > 80 ? 'bg-emerald-500' : percentage > 60 ? 'bg-amber-400' : 'bg-rose-500';
  const shadowClass = percentage > 80 ? 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' : percentage > 60 ? 'shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'shadow-[0_0_10px_rgba(244,63,94,0.3)]';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-white/80">{label}</span>
        <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">%{percentage} Başarı <span className="opacity-40">/ {total} Çözüm</span></span>
      </div>
      <div className="h-2 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden">
        <MotionDiv 
            initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${colorClass} ${shadowClass}`}
        />
      </div>
    </div>
  );
};

const InsightCard = ({ icon: Icon, title, value, desc }) => (
    <div className="glass-card p-6 rounded-[28px] border border-white/5 flex items-center gap-5 hover:bg-white/[0.01] transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
            {React.createElement(Icon, { className: 'w-7 h-7 text-white/40' })}
        </div>
        <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{title}</p>
            <h4 className="text-xl font-black text-white mt-0.5">{value}</h4>
            <p className="text-[11px] font-medium text-text-muted mt-1 leading-tight">{desc}</p>
        </div>
    </div>
);

export default AdminStats;
