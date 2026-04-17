import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, AlertTriangle, QrCode, 
  Loader2, Award, BrainCircuit, Users, Activity, Target, CheckCircle
} from 'lucide-react';

const AdminStats = () => {
  const [overview, setOverview] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [difficultQuestions, setDifficultQuestions] = useState([]);
  const [qrCount, setQrCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [overviewRes, catRes, diffRes, qrRes] = await Promise.all([
        api.get('/admin/stats/overview'),
        api.get('/admin/stats/categories'),
        api.get('/admin/stats/difficult-questions'),
        api.get('/admin/stats/qr')
      ]);
      
      setOverview(overviewRes.data);
      setCategoryStats(catRes.data || []);
      setDifficultQuestions(diffRes.data || []);
      setQrCount(qrRes.data?.count || 0);
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
        <span className="text-text-muted font-bold text-xs uppercase tracking-widest">Sistem Verileri Derleniyor...</span>
      </div>
    );
  }

  // En iyi ve en kötü kategori
  const bestCategory = categoryStats.length > 0 ? categoryStats[categoryStats.length - 1]?.categoryName : '-';
  const worstCategory = categoryStats.length > 0 ? categoryStats[0]?.categoryName : '-';

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Merkezi Algoritma & Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Sistemin nabzını tutun. Kullanıcı davranışları, başarı analizleri ve kritik veriler.</p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={Users} title="Kayıtlı Öğrenci" value={overview?.totalUsers || 0} 
          subtitle={`${overview?.newUsersThisWeek || 0} Bu Hafta`} 
          color="text-primary-light" bg="bg-primary/20" border="border-primary/30" 
        />
        <StatsCard 
          icon={Activity} title="Bugün Aktif" value={overview?.activeToday || 0} 
          subtitle="Son 24 saatteki trafik" 
          color="text-success" bg="bg-success/20" border="border-success/30" 
        />
        <StatsCard 
          icon={Target} title="Ortalama Başarı" value={`%${overview?.avgSuccessRate || 0}`} 
          subtitle="Tüm denemelerin ortalaması" 
          color="text-warning" bg="bg-warning/20" border="border-warning/30" 
        />
        <StatsCard 
          icon={QrCode} title="QR Taramalar" value={qrCount} 
          subtitle="Fiziksel pazarlama dönüşümü" 
          color="text-indigo-400" bg="bg-indigo-500/20" border="border-indigo-500/30" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kategori Başarı Oranları */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col h-full border border-white/5 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Konu Bazlı Başarı Oranları</h2>
              <p className="text-xs text-text-secondary mt-1 tracking-wide">Algoritmanın çıkardığı "En Zorlanılan Konudan - En Kolaya"</p>
            </div>
          </div>

          <div className="space-y-7 flex-1">
            {categoryStats.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                 <p className="text-sm text-text-muted text-center">Henüz kategori verisi bulunmuyor.</p>
              </div>
            ) : (
              categoryStats.map((stat, i) => (
                <StatProgressBar 
                  key={i}
                  label={stat.categoryName}
                  value={stat.totalAttempts}
                  percentage={stat.avgSuccessRate}
                  color={stat.avgSuccessRate > 75 ? 'bg-success' : stat.avgSuccessRate > 50 ? 'bg-warning' : 'bg-danger'}
                />
              ))
            )}
          </div>
        </motion.div>

        {/* En Çok Hata Yapılan Sorular */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col h-full border border-white/5 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Sistemin Kritik Soruları</h2>
              <p className="text-xs text-text-secondary mt-1 tracking-wide">Öğrencilerin sınavda en çok düştüğü tuzak sorular</p>
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {difficultQuestions.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                 <p className="text-sm text-text-muted text-center">Yeterli veri birikmedi.</p>
              </div>
            ) : (
              difficultQuestions.slice(0, 5).map((q, i) => (
                <div key={i} className="p-5 rounded-2xl bg-black/20 border border-white/5 hover:border-danger/30 transition-all group flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-danger/10 text-danger border border-danger/20 rounded-lg text-[10px] font-black tracking-widest uppercase">
                      Hata Oranı: %{Math.round(q.failRate * 100)}
                    </span>
                    <span className="text-[11px] font-medium text-text-muted bg-white/5 px-2 py-1 rounded-md">{q.wrongCount} Yanlış İşaretleme</span>
                  </div>
                  <p className="text-sm font-medium text-white/90 line-clamp-3 leading-relaxed">
                    {q.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>

      {/* Ekstra Bilgi Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewDetailCard 
          icon={CheckCircle} color="text-success" bg="bg-success/10" 
          title="En Çok Bilinen" desc={bestCategory}
        />
        <OverviewDetailCard 
          icon={TrendingUp} color="text-warning" bg="bg-warning/10" 
          title="Toplam Simülasyon" desc={`Sistemde ${overview?.totalExams || 0} adet sınav çözüldü`}
        />
        <OverviewDetailCard 
          icon={BrainCircuit} color="text-primary-light" bg="bg-primary/10" 
          title="Yapay Zeka Analizi" desc={worstCategory !== '-' ? `Öğrenciler ağırlıklı olarak ${worstCategory} konusuna çalıştırılmalı.` : 'Veri bekleniyor...'}
        />
      </div>
    </div>
  );
};

// Alt Bilgi Kartları
const OverviewDetailCard = ({ icon: Icon, color, bg, title, desc }) => (
   <div className="glass-card rounded-3xl p-6 flex items-center gap-5 border border-white/5 hover:bg-white/[0.02] transition-colors">
     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${bg} ${color}`}>
       <Icon className="w-7 h-7" />
     </div>
     <div>
       <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">{title}</h4>
       <p className="text-sm font-semibold text-white mt-1.5 line-clamp-2 leading-relaxed">{desc}</p>
     </div>
   </div>
);

// Progress Bar Component
const StatProgressBar = ({ label, value, percentage, color }) => (
  <div className="space-y-2.5">
    <div className="flex justify-between items-end">
      <span className="text-sm font-bold text-white/90">{label}</span>
      <span className="text-[11px] font-bold text-text-muted bg-white/5 px-2 py-1 rounded-md">
        %{percentage} Başarı <span className="opacity-50">({value} Çözüm)</span>
      </span>
    </div>
    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5 relative">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={`absolute top-0 left-0 h-full rounded-full ${color} shadow-lg`}
      />
    </div>
  </div>
);

// Ana StatsCard Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color, bg, border }) => (
  <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-all hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${bg} ${color} ${border}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div>
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-2">{title}</p>
      <p className="text-3xl font-black text-white leading-none">{value}</p>
      <p className="text-[11px] font-semibold text-white/40 mt-3 flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> {subtitle}</p>
    </div>
  </div>
);

export default AdminStats;
