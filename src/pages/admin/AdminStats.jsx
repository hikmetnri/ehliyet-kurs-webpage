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
  Target, Bell, Clock, Crown, DownloadCloud,
  Filter, Eye, X, MousePointerClick, ShieldAlert
} from 'lucide-react';
import { hasChartValue, normalizeCategoryStats, normalizeRegistrationTrend } from '../../utils/statsData';

const MotionDiv = motion.div;

const ChartEmptyState = ({ text }) => (
  <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] px-6 text-center">
    <Activity className="mb-3 h-8 w-8 text-white/25" />
    <p className="text-xs font-bold leading-relaxed text-text-muted">{text}</p>
  </div>
);

const StatsSectionTabs = ({ tabs, activeSection, onChange }) => (
  <div className="grid grid-cols-1 gap-2 rounded-[24px] border border-white/5 bg-white/[0.025] p-2 sm:grid-cols-2 xl:grid-cols-4">
    {tabs.map(tab => {
      const Icon = tab.icon;
      const active = activeSection === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex min-h-[72px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
            active
              ? 'border-primary/35 bg-primary/15 text-white shadow-lg shadow-primary/10'
              : 'border-white/5 bg-black/10 text-text-muted hover:border-white/15 hover:bg-white/[0.045] hover:text-white'
          }`}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            active ? 'border-primary/30 bg-primary/20 text-primary-light' : 'border-white/10 bg-white/5 text-text-muted'
          }`}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black leading-tight">{tab.label}</span>
            <span className={`mt-1 block text-[10px] font-bold leading-tight ${active ? 'text-white/60' : 'text-text-muted'}`}>
              {tab.helper}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);

const AdminStats = () => {
  const [overview, setOverview] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [difficultQuestions, setDifficultQuestions] = useState([]);
  const [registrationTrend, setRegistrationTrend] = useState([]);
  const [qrStats, setQrStats] = useState({ count: 0, daily: {} });
  const [dailyGoals, setDailyGoals] = useState([]);
  const [journeyAnalytics, setJourneyAnalytics] = useState(null);
  const [journeyDays, setJourneyDays] = useState('30');
  const [journeySource, setJourneySource] = useState('all');
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [timelineUser, setTimelineUser] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!loading) fetchJourneyStats();
  }, [journeyDays, journeySource]);

  const fetchJourneyStats = async ({ silent = false } = {}) => {
    try {
      if (!silent) setJourneyLoading(true);
      const params = new URLSearchParams({ days: journeyDays });
      if (journeySource !== 'all') params.set('source', journeySource);
      const res = await api.get(`/admin/stats/journey?${params.toString()}`);
      setJourneyAnalytics(res.data);
    } catch (err) {
      console.error('Kullanıcı yolculuğu alınamadı:', err);
      setJourneyAnalytics(null);
    } finally {
      if (!silent) setJourneyLoading(false);
    }
  };

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
      setCategoryStats(results[1].status === 'fulfilled' ? normalizeCategoryStats(results[1].value.data) : []);
      setDifficultQuestions(results[2].status === 'fulfilled' ? results[2].value.data : []);
      setQrStats(results[3].status === 'fulfilled' ? results[3].value.data : { count: 0, daily: {} });
      setRegistrationTrend(results[4].status === 'fulfilled' ? normalizeRegistrationTrend(results[4].value.data) : []);
      setDailyGoals(results[5].status === 'fulfilled' ? results[5].value.data : []);
      await fetchJourneyStats({ silent: true });
    } catch (err) {
      console.error('İstatistikler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const openTimeline = async (user) => {
    if (!user?.id) return;
    try {
      setTimelineUser(user);
      setTimelineLoading(true);
      setTimelineEvents([]);
      const res = await api.get(`/analytics/users/${user.id}/timeline?limit=80`);
      setTimelineEvents(res.data?.data || []);
    } catch (err) {
      console.error('Kullanıcı timeline alınamadı:', err);
      setTimelineEvents([]);
    } finally {
      setTimelineLoading(false);
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
  const journeySummary = journeyAnalytics?.summary || {};
  const journeyFunnel = journeyAnalytics?.funnel || [];
  const journeySegments = journeyAnalytics?.segments || [];
  const journeyTrend = journeyAnalytics?.trend || [];
  const recentJourneys = journeyAnalytics?.recentUsers || [];
  const eventFunnel = journeyAnalytics?.eventFunnel || [];
  const sourceBreakdown = journeyAnalytics?.sourceBreakdown || [];
  const cohorts = journeyAnalytics?.cohorts || [];
  const notificationEffect = journeyAnalytics?.notificationEffect || {};
  const paywall = journeyAnalytics?.paywall || {};
  const riskUsers = journeyAnalytics?.riskUsers || [];
  const sourceOptions = ['all', ...new Set([
    journeySource,
    ...sourceBreakdown.map(item => item.source),
  ].filter(Boolean).filter(item => item !== 'all'))];
  const hasRegistrationData = hasChartValue(registrationTrend, 'users');
  const hasCategoryData = categoryStats.length > 0;
  const hasJourneyTrend = journeyTrend.some(item => item.registered || item.firstTest || item.wrongReview || item.paywallSeen || item.proClicked);
  const sectionTabs = [
    { id: 'overview', label: 'Genel Bakış', icon: Activity, helper: 'KPI, kayıt, QR ve üyelik' },
    { id: 'journey', label: 'Yolculuk', icon: TrendingUp, helper: 'Huni, trend ve kullanıcı akışı' },
    { id: 'campaigns', label: 'Etkileşim', icon: Filter, helper: 'Kaynak, bildirim, paywall ve risk' },
    { id: 'education', label: 'Eğitim', icon: BrainCircuit, helper: 'Konu başarısı ve zor sorular' },
  ];
  const renderJourneyFilters = () => (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
        {['7', '30', '90'].map(days => (
          <button
            key={days}
            type="button"
            onClick={() => setJourneyDays(days)}
            className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${
              journeyDays === days ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            {days}g
          </button>
        ))}
      </div>
      <label className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 sm:w-auto">
        <Filter className="h-3.5 w-3.5 text-primary-light" />
        <select
          value={journeySource}
          onChange={(event) => setJourneySource(event.target.value)}
          className="w-full bg-transparent text-[10px] font-black uppercase tracking-widest text-white outline-none sm:w-40"
        >
          {sourceOptions.map(source => (
            <option key={source} value={source} className="bg-bg-card">
              {source === 'all' ? 'Tüm kaynaklar' : source}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">Merkezi Analitik Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Sistemin performans verileri ve kullanıcı davranış analizleri.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/10 transition-all"
        >
          <Activity className="w-4 h-4 text-primary-light" /> Verileri Tazele
        </button>
      </div>

      <StatsSectionTabs
        tabs={sectionTabs}
        activeSection={activeSection}
        onChange={setActiveSection}
      />

      {/* --- TOP KPIs --- */}
      {activeSection === 'overview' && (
      <>
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
      </>
      )}

      {activeSection === 'journey' && (
      <>
      <MotionDiv
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-[24px] border border-primary/15 bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15">
            <Activity className="h-6 w-6 text-primary-light" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Kullanıcı Yolculuğu</p>
            <h2 className="text-lg font-black text-white">Dönüşüm, kaynak ve kohort analitiği</h2>
          </div>
        </div>
        {renderJourneyFilters()}
      </MotionDiv>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Target} title="Kategori Dönüşümü" value={`%${journeySummary.categorySelectionRate || 0}`}
          trend={`${journeySummary.selectedCategoryUsers || 0}/${journeySummary.totalUsers || 0}`} trendLabel="Onboarding"
          color="text-cyan-400" bg="bg-cyan-400/20"
        />
        <StatsCard
          icon={Activity} title="İlk Test Aktivasyonu" value={`%${journeySummary.activationRate || 0}`}
          trend={`${journeySummary.firstTestUsers || 0} öğrenci`} trendLabel="İlk çözüm"
          color="text-emerald-400" bg="bg-emerald-400/20"
        />
        <StatsCard
          icon={BrainCircuit} title="Yanlış Tekrar" value={`%${journeySummary.wrongReviewRate || 0}`}
          trend={`${journeySummary.wrongReviewUsers || 0}/${journeySummary.wrongAnswerUsers || 0}`} trendLabel="Tekrar dönüşü"
          color="text-violet-400" bg="bg-violet-400/20"
        />
        <StatsCard
          icon={Crown} title="PRO Adayı" value={journeySummary.highIntentFreeUsers || 0}
          trend={`${journeySummary.avgHoursToFirstTest || 0} sa`} trendLabel="Ort. ilk test"
          color="text-amber-400" bg="bg-amber-400/20"
        />
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Kullanıcı Yolculuğu Hunisi</h2>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Kayıttan tekrar çözümüne ve PRO niyetine kadar ana adımlar</p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
            {journeyDays} gün · {journeySource === 'all' ? 'tüm kaynaklar' : journeySource}
          </span>
        </div>

        {journeyLoading && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs font-bold text-primary-light">
            <Loader2 className="h-4 w-4 animate-spin" />
            Yolculuk filtresi güncelleniyor...
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
          {journeyFunnel.length > 0 ? (
            journeyFunnel.map((step, index) => (
              <FunnelStepCard key={step.key} step={step} index={index} />
            ))
          ) : (
            <div className="sm:col-span-2 xl:col-span-6">
              <ChartEmptyState text="Kullanıcı yolculuğu verisi henüz hesaplanamadı." />
            </div>
          )}
        </div>
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
      >
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Event Bazlı Dönüşüm</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-text-muted">Web ve mobil temas noktalarından gelen gerçek olay kayıtları</p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
            {journeyAnalytics?.filters?.source || 'all'}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {eventFunnel.length > 0 ? (
            eventFunnel.map((event, index) => (
              <EventFunnelCard key={event.key} event={event} index={index} />
            ))
          ) : (
            <div className="sm:col-span-2 lg:col-span-4 xl:col-span-7">
              <ChartEmptyState text="Seçili aralıkta event kaydı henüz yok." />
            </div>
          )}
        </div>
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Yolculuk Trendleri</h2>
                <p className="text-xs text-text-muted mt-0.5">Kayıt, ilk test ve yanlış tekrar hareketi.</p>
              </div>
            </div>
          </div>
          <div className="h-[240px] sm:h-[280px]">
            {hasJourneyTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={journeyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="label" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff10', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="registered" name="Kayıt" stroke="#6366f1" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="firstTest" name="İlk Test" stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="wrongReview" name="Yanlış Tekrar" stroke="#a78bfa" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="paywallSeen" name="Paywall" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="proClicked" name="PRO Tık" stroke="#ec4899" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState text="Son günlerde kayıt, ilk test veya yanlış tekrar hareketi yok." />
            )}
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Aksiyon Segmentleri</h2>
              <p className="text-xs text-text-muted mt-0.5">Dönüşümün takıldığı kullanıcı grupları.</p>
            </div>
          </div>
          <div className="space-y-3">
            {journeySegments.length > 0 ? (
              journeySegments.map(segment => (
                <JourneySegment key={segment.key} segment={segment} />
              ))
            ) : (
              <ChartEmptyState text="Aksiyon segmenti üretmek için yeterli veri yok." />
            )}
          </div>
        </MotionDiv>
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Son Kayıtların Yolculuğu</h2>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Yeni kullanıcılar hangi adımda bekliyor?</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Son {recentJourneys.length} hesap
          </span>
        </div>
        <div className="space-y-3">
          {recentJourneys.length > 0 ? (
            recentJourneys.map(user => (
              <JourneyUserRow key={user.id} user={user} onOpenTimeline={openTimeline} />
            ))
          ) : (
            <ChartEmptyState text="Yeni kullanıcı yolculuğu verisi bulunamadı." />
          )}
        </div>
      </MotionDiv>
      </>
      )}

      {activeSection === 'campaigns' && (
      <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
              <Filter className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Kaynak Performansı</h2>
              <p className="mt-0.5 text-xs text-text-muted">Kayıt kaynağına göre aktivasyon ve PRO dönüşümü.</p>
            </div>
          </div>
          <div className="space-y-3">
            {sourceBreakdown.length > 0 ? (
              sourceBreakdown.map(source => (
                <SourcePerformanceRow key={source.source} source={source} />
              ))
            ) : (
              <ChartEmptyState text="Kaynak bazlı event verisi henüz oluşmadı." />
            )}
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <TrendingUp className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Kohort Aktivasyonu</h2>
              <p className="mt-0.5 text-xs text-text-muted">Kayıt günü bazında ilk test ve yanlış tekrar geçişi.</p>
            </div>
          </div>
          <div className="space-y-3">
            {cohorts.length > 0 ? (
              cohorts.slice(-8).reverse().map(cohort => (
                <CohortRow key={cohort.date} cohort={cohort} />
              ))
            ) : (
              <ChartEmptyState text="Kohort hesaplamak için kayıt event’i yok." />
            )}
          </div>
        </MotionDiv>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
        >
          <MetricPanelHeader icon={Bell} title="Bildirim Etkisi" subtitle="Gönderim ve açılma hareketi" color="text-sky-300" bg="bg-sky-500/10" border="border-sky-500/20" />
          <div className="grid grid-cols-2 gap-3">
            <MiniMetric label="Kampanya" value={notificationEffect.campaigns || 0} />
            <MiniMetric label="In-App" value={notificationEffect.inAppSent || 0} />
            <MiniMetric label="Push" value={notificationEffect.pushSent || 0} />
            <MiniMetric label="Açılma" value={`%${notificationEffect.openRate || 0}`} />
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
        >
          <MetricPanelHeader icon={MousePointerClick} title="Paywall Dönüşümü" subtitle="Görme, tıklama ve satın alma" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
          <div className="grid grid-cols-2 gap-3">
            <MiniMetric label="Gören" value={paywall.seenUsers || 0} />
            <MiniMetric label="Tıklayan" value={paywall.clickedUsers || 0} />
            <MiniMetric label="Tık Oranı" value={`%${paywall.clickRate || 0}`} />
            <MiniMetric label="Satın Alma" value={paywall.purchases || 0} />
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
        >
          <MetricPanelHeader icon={ShieldAlert} title="Riskli Kullanıcılar" subtitle="Admin aksiyonu bekleyen hesaplar" color="text-rose-300" bg="bg-rose-500/10" border="border-rose-500/20" />
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {riskUsers.length > 0 ? (
              riskUsers.map(user => (
                <RiskUserRow key={`${user.id}-${user.reason}`} user={user} onOpenTimeline={openTimeline} />
              ))
            ) : (
              <ChartEmptyState text="Seçili aralıkta risk listesi boş." />
            )}
          </div>
        </MotionDiv>
      </div>
      </>
      )}

      {activeSection === 'overview' && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- REGISTRATION TREND (MAIN CHART) --- */}
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h2 className="text-lg font-black text-white">Grafiksel Kayıt Akışı</h2>
              <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Son 7 Günlük Kayıtlar</p>
            </div>
            <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black text-primary-light uppercase tracking-widest">
              Gerçek Zamanlı
            </div>
          </div>
          
          <div className="h-[240px] sm:h-[300px] w-full">
            {hasRegistrationData ? (
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
                      allowDecimals={false}
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
            ) : (
              <ChartEmptyState text="Seçili aralıkta yeni kayıt yok. Yeni öğrenciler geldikçe akış burada çizilecek." />
            )}
          </div>
        </MotionDiv>

        {/* --- PRO STATUS (DONUT CHART) --- */}
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center"
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
      </>
      )}

      {activeSection === 'overview' && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
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
          <div className="h-[220px] sm:h-[260px]">
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
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
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
          <div className="h-[220px] sm:h-[260px]">
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
      </>
      )}

      {activeSection === 'education' && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- CATEGORY PROGRESS --- */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl"
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
            {hasCategoryData ? (
              categoryStats.slice(0, 6).map((stat, i) => (
                <StatProgressBar 
                  key={i}
                  label={stat.categoryName}
                  percentage={stat.avgSuccessRate}
                  total={stat.totalAttempts}
                />
              ))
            ) : (
              <ChartEmptyState text="Kategori performansı için henüz yeterli sınav sonucu yok." />
            )}
          </div>
        </MotionDiv>

        {/* --- DIFFICULT QUESTIONS --- */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/5 shadow-2xl flex flex-col"
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
      </>
      )}

      {/* --- FOOTER INSIGHTS --- */}
      {activeSection === 'overview' && (
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
      )}

      <AnimatePresence>
        {timelineUser && (
          <MotionDiv
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionDiv
              initial={{ y: 20, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.98, opacity: 0 }}
              className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-bg-card shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/5 p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Kullanıcı Timeline</p>
                  <h3 className="mt-1 truncate text-xl font-black text-white">{timelineUser.name}</h3>
                  <p className="truncate text-xs font-semibold text-text-muted">{timelineUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTimelineUser(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-text-muted transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                {timelineLoading ? (
                  <div className="flex h-52 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : timelineEvents.length > 0 ? (
                  <div className="space-y-3">
                    {timelineEvents.map(event => (
                      <TimelineEventRow key={event._id} event={event} />
                    ))}
                  </div>
                ) : (
                  <ChartEmptyState text="Bu kullanıcı için event timeline kaydı yok." />
                )}
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- SUB COMPONENTS ---

const formatShortDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
};

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const eventLabels = {
  register_completed: 'Kayıt tamamlandı',
  login_completed: 'Giriş yaptı',
  category_selected: 'Kategori seçti',
  daily_goal_set: 'Günlük hedef',
  exam_date_set: 'Sınav tarihi',
  test_started: 'Test başladı',
  test_completed: 'Test bitti',
  first_test_completed: 'İlk test bitti',
  wrong_answer_added: 'Yanlış eklendi',
  wrong_review_started: 'Yanlış tekrar başladı',
  wrong_review_completed: 'Yanlış tekrar bitti',
  wrong_review_item_reviewed: 'Yanlış soru tekrarlandı',
  wrong_answer_mastered: 'Yanlış tamamlandı',
  paywall_seen: 'Paywall görüldü',
  pro_clicked: 'PRO tıklandı',
  pro_purchase_completed: 'PRO satın alma',
  pro_manual_toggled: 'PRO admin değişimi',
  notification_sent: 'Bildirim gönderildi',
  notification_opened: 'Bildirim açıldı',
  notification_mark_all_read: 'Bildirimler okundu',
  source_visit: 'Kaynak ziyareti',
};

const sourceLabels = {
  direct: 'Doğrudan',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  tiktok: 'TikTok',
  owned_web: 'Web sitesi',
  unknown: 'Bilinmiyor',
};

const platformLabels = {
  web: 'Web',
  mobile: 'Mobil',
  backend: 'Sistem',
  unknown: 'Bilinmiyor',
};

const getTimelineSourceLabel = (event) => {
  if (event.metadata?.derived) return 'Geçmiş veri';

  const platform = platformLabels[event.platform] || event.platform || 'Bilinmiyor';
  const source = sourceLabels[event.source] || event.source || 'Doğrudan';
  return `${platform} · ${source}`;
};

const getVisibleTimelineMetadata = (metadata = {}) => (
  Object.fromEntries(Object.entries(metadata).filter(([key]) => key !== 'derived'))
);

const timelineMetadataLabels = {
  email: 'E-posta',
  name: 'Ad soyad',
  selectedCategoryId: 'Kategori ID',
  selectedCategoryName: 'Kategori',
  resultId: 'Sonuç ID',
  examId: 'Test ID',
  examName: 'Test',
  testType: 'Test türü',
  categoryId: 'Kategori ID',
  categoryName: 'Kategori',
  totalQuestions: 'Toplam soru',
  correctCount: 'Doğru',
  wrongCount: 'Yanlış',
  emptyCount: 'Boş',
  score: 'Puan',
  passed: 'Durum',
  duration: 'Süre',
  questionId: 'Soru ID',
  subject: 'Konu',
  result: 'Tekrar sonucu',
  reviewStage: 'Tekrar aşaması',
  nextReviewAt: 'Sonraki tekrar',
  mastered: 'Öğrenildi',
  mode: 'İşlem',
};

const testTypeLabels = {
  short_test: 'Kısa test',
  mock_exam: 'Deneme sınavı',
  real_exam: 'Gerçek sınav',
  exam: 'Test',
  wrong_review: 'Yanlış tekrar',
};

const resultLabels = {
  correct: 'Doğru',
  wrong: 'Yanlış',
  skip: 'Atlandı',
  mastered: 'Öğrenildi',
  reviewed: 'Tekrarlandı',
};

const modeLabels = {
  create: 'Yeni kayıt',
  update: 'Güncelleme',
};

const formatTimelineMetadataValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '';
  if (key === 'passed') return value ? 'Geçti' : 'Kaldı';
  if (key === 'mastered') return value ? 'Evet' : 'Hayır';
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
  if (key === 'duration') {
    const seconds = Number(value) || 0;
    if (seconds <= 0) return '';
    if (seconds < 60) return `${seconds} sn`;
    return `${Math.round(seconds / 60)} dk`;
  }
  if (key === 'testType') return testTypeLabels[value] || value;
  if (key === 'result') return resultLabels[value] || value;
  if (key === 'mode') return modeLabels[value] || value;
  if (key.endsWith('At')) return formatDateTime(value);
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'object') return Object.values(value).filter(Boolean).join(', ');
  return String(value);
};

const getTimelineMetadataItems = (metadata = {}) => (
  Object.entries(getVisibleTimelineMetadata(metadata))
    .map(([key, value]) => ({
      key,
      label: timelineMetadataLabels[key] || key,
      value: formatTimelineMetadataValue(key, value),
    }))
    .filter(item => item.value)
);

const getTimelineDescription = (event, metadata) => {
  const examName = metadata.examName || metadata.categoryName || 'Test';
  const categoryName = metadata.selectedCategoryName || metadata.categoryName || 'Kategori';

  if (event.eventType === 'register_completed') {
    return metadata.name ? `${metadata.name} kayıt oldu.` : 'Kullanıcı kayıt oldu.';
  }
  if (event.eventType === 'category_selected') {
    return `${categoryName} seçildi.`;
  }
  if (event.eventType === 'test_started') {
    return `${examName} başlatıldı.`;
  }
  if (event.eventType === 'test_completed' || event.eventType === 'first_test_completed') {
    const scoreText = metadata.score !== undefined ? ` Puan: ${metadata.score}.` : '';
    return `${examName} tamamlandı.${scoreText}`;
  }
  if (event.eventType === 'wrong_answer_added') {
    return `${metadata.categoryName || metadata.subject || 'Bir soru'} yanlış havuzuna eklendi.`;
  }
  if (event.eventType === 'wrong_review_started') {
    return 'Yanlış tekrar oturumu başladı.';
  }
  if (event.eventType === 'wrong_review_completed') {
    return 'Yanlış tekrar oturumu tamamlandı.';
  }
  if (event.eventType === 'wrong_review_item_reviewed') {
    const result = resultLabels[metadata.result] || metadata.result || 'Tekrarlandı';
    return `Yanlış soru tekrarlandı. Sonuç: ${result}.`;
  }
  if (event.eventType === 'wrong_answer_mastered') {
    return 'Yanlış soru öğrenildi olarak işaretlendi.';
  }
  if (event.eventType === 'paywall_seen') {
    return 'PRO ekranı görüntülendi.';
  }
  if (event.eventType === 'pro_clicked') {
    return 'PRO satın alma butonuna tıklandı.';
  }
  if (event.eventType === 'pro_purchase_completed') {
    return 'PRO satın alma tamamlandı.';
  }
  if (event.eventType === 'notification_sent') {
    return 'Bildirim gönderildi.';
  }
  if (event.eventType === 'notification_opened') {
    return 'Bildirim açıldı.';
  }
  return '';
};

const EventFunnelCard = ({ event, index }) => {
  const tones = [
    'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
    'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    'text-violet-300 bg-violet-500/10 border-violet-500/20',
    'text-amber-300 bg-amber-500/10 border-amber-500/20',
    'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/20',
    'text-rose-300 bg-rose-500/10 border-rose-500/20',
  ];

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-4">
      <div className={`mb-4 inline-flex h-8 w-8 items-center justify-center rounded-2xl border text-xs font-black ${tones[index % tones.length]}`}>
        {index + 1}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{event.label}</p>
      <h3 className="mt-2 text-2xl font-black text-white">{event.count || 0}</h3>
      <p className="mt-1 text-[11px] font-semibold text-text-muted">{event.rawCount || 0} toplam event</p>
    </div>
  );
};

const FunnelStepCard = ({ step, index }) => {
  const tones = [
    'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
    'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
    'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    'bg-violet-500/15 text-violet-300 border-violet-500/20',
    'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20',
    'bg-amber-500/15 text-amber-300 border-amber-500/20',
  ];
  const tone = tones[index % tones.length];

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-4 min-h-[160px] flex flex-col justify-between">
      <div>
        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl border text-xs font-black ${tone}`}>
          {index + 1}
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-text-muted">{step.label}</p>
        <h3 className="mt-1 text-2xl font-black text-white leading-none">{step.count || 0}</h3>
        <p className="mt-2 text-[11px] font-semibold text-text-muted leading-tight">{step.helper}</p>
      </div>
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
          <div className="h-full rounded-full bg-white/60" style={{ width: `${Math.min(step.totalRate || 0, 100)}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-white/50">%{step.totalRate || 0}</span>
          <span className="text-[10px] font-bold text-text-muted">önceki %{step.previousRate || 0}</span>
        </div>
      </div>
    </div>
  );
};

const JourneySegment = ({ segment }) => (
  <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-4 flex items-start justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-black text-white leading-tight">{segment.title}</p>
      <p className="mt-2 text-[11px] font-semibold text-text-muted leading-relaxed">{segment.action}</p>
    </div>
    <div className="shrink-0 text-right">
      <div className="text-2xl font-black text-white leading-none">{segment.count || 0}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-rose-300">%{segment.rate || 0}</div>
    </div>
  </div>
);

const SourcePerformanceRow = ({ source }) => (
  <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-white">{source.source || 'unknown'}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{source.registered || 0} kayıt</p>
      </div>
      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-300">
        %{source.activationRate || 0}
      </span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center">
      <MiniMetric label="Kayıt" value={source.registered || 0} compact />
      <MiniMetric label="İlk Test" value={source.firstTest || 0} compact />
      <MiniMetric label="PRO" value={source.pro || 0} compact />
    </div>
  </div>
);

const CohortRow = ({ cohort }) => (
  <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-black text-white">{cohort.label}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{cohort.registered || 0} kayıt</p>
      </div>
      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black text-primary-light">
        Aktivasyon %{cohort.activationRate || 0}
      </span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-black/40">
      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(cohort.activationRate || 0, 100)}%` }} />
    </div>
    <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted">
      <span>{cohort.firstTest || 0} ilk test</span>
      <span>{cohort.wrongReview || 0} yanlış tekrar</span>
    </div>
  </div>
);

const MetricPanelHeader = ({ icon: Icon, title, subtitle, color, bg, border }) => (
  <div className="mb-6 flex items-center gap-4">
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${bg} ${border}`}>
      {React.createElement(Icon, { className: `h-6 w-6 ${color}` })}
    </div>
    <div>
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>
    </div>
  </div>
);

const MiniMetric = ({ label, value, compact = false }) => (
  <div className={`rounded-2xl border border-white/5 bg-white/[0.025] ${compact ? 'p-3' : 'p-4'}`}>
    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
    <p className={`${compact ? 'text-lg' : 'text-2xl'} mt-1 font-black leading-none text-white`}>{value}</p>
  </div>
);

const RiskUserRow = ({ user, onOpenTimeline }) => (
  <button
    type="button"
    onClick={() => onOpenTimeline?.(user)}
    className="w-full rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-rose-400/25 hover:bg-rose-500/5"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-black text-white">{user.name}</p>
        <p className="truncate text-[10px] font-semibold text-text-muted">{user.email}</p>
      </div>
      <Eye className="h-4 w-4 shrink-0 text-text-muted" />
    </div>
    <p className="mt-2 inline-flex rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-rose-300">
      {user.reason}
    </p>
  </button>
);

const TimelineEventRow = ({ event }) => {
  const visibleMetadata = getVisibleTimelineMetadata(event.metadata);
  const description = getTimelineDescription(event, visibleMetadata);
  const metadataItems = getTimelineMetadataItems(event.metadata);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black text-white">{eventLabels[event.eventType] || event.eventType}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
            {getTimelineSourceLabel(event)}
          </p>
        </div>
        <span className="text-[10px] font-bold text-text-muted">{formatDateTime(event.createdAt)}</span>
      </div>
      {description && (
        <p className="mt-3 rounded-2xl border border-white/5 bg-black/20 px-3 py-2 text-xs font-semibold leading-relaxed text-white/75">
          {description}
        </p>
      )}
      {metadataItems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {metadataItems.map(item => (
            <span
              key={item.key}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-white/75"
            >
              <span className="shrink-0 text-text-muted">{item.label}:</span>
              <span className="min-w-0 truncate">{item.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const statusTone = (status) => {
  if (status === 'PRO') return 'bg-amber-400/10 text-amber-300 border-amber-400/20';
  if (status === 'Kategori bekliyor') return 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20';
  if (status === 'İlk test bekliyor') return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20';
  if (status === 'Yanlış tekrar bekliyor') return 'bg-violet-400/10 text-violet-300 border-violet-400/20';
  return 'bg-white/5 text-white/70 border-white/10';
};

const JourneyUserRow = ({ user, onOpenTimeline }) => (
  <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_0.9fr_0.9fr_1fr_auto] gap-3 rounded-3xl border border-white/5 bg-white/[0.02] p-4 items-center">
    <div className="min-w-0">
      <p className="truncate text-sm font-black text-white">{user.name}</p>
      <p className="truncate text-[11px] font-semibold text-text-muted">{user.email}</p>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Kategori</p>
      <p className="truncate text-xs font-bold text-white/75">{user.selectedCategoryName || '-'}</p>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Test</p>
      <p className="text-xs font-bold text-white/75">{user.examCount || 0} çözüm</p>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Yanlış</p>
      <p className="text-xs font-bold text-white/75">{user.dueWrongCount || 0} due / {user.wrongReviewCount || 0} tekrar</p>
    </div>
    <div className="flex flex-col lg:items-end gap-2">
      <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusTone(user.status)}`}>
        {user.status}
      </span>
      <span className="text-[10px] font-semibold text-text-muted">Kayıt: {formatShortDate(user.createdAt)}</span>
    </div>
    <button
      type="button"
      onClick={() => onOpenTimeline?.(user)}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:border-primary/30 hover:bg-primary/10"
    >
      <Eye className="h-4 w-4 text-primary-light" />
      Akış
    </button>
  </div>
);

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
