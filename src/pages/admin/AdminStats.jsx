import React, { useState, useEffect, useCallback } from 'react';
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
  Filter, X, MousePointerClick, ShieldAlert
} from 'lucide-react';
import { hasChartValue, normalizeCategoryStats, normalizeRegistrationTrend } from '../../utils/statsData';

// ─── Extracted Modules (SRP) ──────────────────────────────────────────────────
import {
  ChartEmptyState, InsightGuide, AnalysisGuideModal, QuickStartRail, StatsSectionTabs,
} from './stats/statsUiParts';
import {
  EventFunnelCard, FunnelStepCard, JourneySegment, SourcePerformanceRow, CohortRow,
  MetricPanelHeader, MiniMetric, RiskUserRow, TimelineEventRow, JourneyUserRow,
} from './stats/JourneyParts';
import { StatsCard, StatProgressBar, InsightCard } from './stats/StatsCards';

const MotionDiv = motion.div;

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
  const [analysisGuideOpen, setAnalysisGuideOpen] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const fetchJourneyStats = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setJourneyLoading(true);
      const params = new URLSearchParams({ days: journeyDays });
      if (journeySource !== 'all') params.set('source', journeySource);
      if (selectedCategoryId !== 'all') params.set('categoryId', selectedCategoryId);
      const res = await api.get(`/admin/stats/journey?${params.toString()}`);
      setJourneyAnalytics(res.data);
    } catch (err) {
      console.error('Kullanıcı yolculuğu alınamadı:', err);
      setJourneyAnalytics(null);
    } finally {
      if (!silent) setJourneyLoading(false);
    }
  }, [journeyDays, journeySource, selectedCategoryId]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategoryId !== 'all') params.set('categoryId', selectedCategoryId);
      const queryStr = params.toString() ? `?${params.toString()}` : '';

      const results = await Promise.allSettled([
        api.get(`/admin/stats/overview${queryStr}`),
        api.get(`/admin/stats/categories${queryStr}`),
        api.get(`/admin/stats/difficult-questions${queryStr}`),
        api.get(`/admin/stats/qr${queryStr}`),
        api.get(`/admin/stats/registration-trend${queryStr}`),
        api.get(`/admin/stats/daily-goals${queryStr}`)
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
  }, [selectedCategoryId, fetchJourneyStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!loading) fetchJourneyStats();
  }, [loading, fetchJourneyStats]);

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
  const weakestCategory = hasCategoryData
    ? [...categoryStats].sort((a, b) => (a.avgSuccessRate || 0) - (b.avgSuccessRate || 0))[0]
    : null;
  const strongestCategory = hasCategoryData
    ? [...categoryStats].sort((a, b) => (b.avgSuccessRate || 0) - (a.avgSuccessRate || 0))[0]
    : null;
  const hardestQuestion = difficultQuestions[0] || null;
  const guideTitle = hasCategoryData
    ? 'Önce zayıf konu, sonra zor sorular'
    : 'Önce genel bakış, sonra eğitim verileri';
  const guideDescription = hasCategoryData
    ? `${weakestCategory?.categoryName || 'Bir konu'} şu anda en zayıf alan gibi görünüyor. Orayı toparladıktan sonra zor sorular ve trendler çok daha anlamlı olur.`
    : 'Kategori verisi azsa önce genel KPI ve kayıt trendini incele, ardından eğitim sekmesine geç.';
  const guideActions = [
    {
      label: 'Analiz rehberi',
      className: 'bg-primary/10 border-primary/20 text-primary-light hover:bg-primary/20',
      onClick: () => setAnalysisGuideOpen(true),
    },
    {
      label: 'Eğitim sekmesi',
      className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20',
      onClick: () => setActiveSection('education'),
    },
    {
      label: 'Yolculuk sekmesi',
      className: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20',
      onClick: () => setActiveSection('journey'),
    },
  ];
  const guideChips = [
    {
      label: 'En zayıf konu',
      value: weakestCategory ? `%${Math.round(weakestCategory.avgSuccessRate || 0)}` : '-',
      dot: 'bg-rose-400',
    },
    {
      label: 'En güçlü konu',
      value: strongestCategory ? `%${Math.round(strongestCategory.avgSuccessRate || 0)}` : '-',
      dot: 'bg-emerald-400',
    },
    {
      label: 'Kritik soru',
      value: hardestQuestion?.text ? 'Var' : 'Yok',
      dot: 'bg-amber-400',
    },
  ];
  const quickStartItems = [
    {
      title: 'Önce Genel Bakış',
      text: 'Toplam kullanıcı, aktiflik ve ortalama başarıyla tabloyu hızlıca oku.',
    },
    {
      title: 'Sonra Yolculuk',
      text: 'Kayıttan ilk teste kadar nerede düşüş olduğunu gör.',
    },
    {
      title: 'Sonra Etkileşim',
      text: 'Bildirim, paywall ve kaynak performansını karşılaştır.',
    },
    {
      title: 'En Son Eğitim',
      text: 'Zayıf konuları ve zor soruları alıp içerik tarafına dön.',
    },
  ];
  const hasJourneyTrend = journeyTrend.some(item => item.registered || item.firstTest || item.wrongReview || item.paywallSeen || item.proClicked);
  const sectionTabs = [
    { id: 'overview', label: 'Genel Bakış', icon: Activity, helper: 'Özet, kayıt, QR ve üyelik dengesi' },
    { id: 'journey', label: 'Yolculuk', icon: TrendingUp, helper: 'Adım adım kayıt ve aktivasyon akışı' },
    { id: 'campaigns', label: 'Etkileşim', icon: Filter, helper: 'Kaynak, bildirim, paywall ve risk grubu' },
    { id: 'education', label: 'Eğitim', icon: BrainCircuit, helper: 'Konu başarısı ve zorlanılan sorular' },
  ];
  const renderJourneyFilters = () => (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.02] p-1">
        {['7', '30', '90'].map(days => (
          <button
            key={days}
            type="button"
            onClick={() => setJourneyDays(days)}
            className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition ${
              journeyDays === days ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            {days}g
          </button>
        ))}
      </div>
      <label className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2 sm:w-auto">
        <Filter className="h-3.5 w-3.5 text-primary-light" />
        <select
          value={journeySource}
          onChange={(event) => setJourneySource(event.target.value)}
          className="w-full bg-transparent text-[10px] font-bold uppercase tracking-widest text-white outline-none sm:w-40"
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
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-primary-light uppercase tracking-widest">Veri Merkezi</p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">Merkezi Analitik</h1>
          <p className="text-text-secondary text-sm mt-1">Hangi bölümün ne anlattığını hızlıca gör, sonra ayrıntıya in.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full sm:w-56 rounded-2xl border border-white/10 bg-[#0d1017] px-4 py-2.5 text-xs font-bold text-white outline-none cursor-pointer hover:border-white/20 transition-all"
          >
          <option value="all">Tüm Eğitimler (Ortak)</option>
          {rootCategories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
          </select>

          <button
            onClick={fetchStats}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 text-primary-light" /> Verileri Tazele
          </button>

          <button
            onClick={() => setShowGuides(prev => !prev)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              showGuides 
                ? 'bg-primary/10 border-primary/30 text-primary-light' 
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}
          >
            <BrainCircuit className="w-4 h-4" /> {showGuides ? 'Kılavuzu Gizle' : 'Kılavuzu Göster'}
          </button>
        </div>
      </div>
      </section>

      <StatsSectionTabs
        tabs={sectionTabs}
        activeSection={activeSection}
        onChange={setActiveSection}
      />

      <AnimatePresence>
        {showGuides && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4"
          >
            <InsightGuide
              title={guideTitle}
              description={guideDescription}
              chips={guideChips}
              actions={guideActions}
            />
            <QuickStartRail items={quickStartItems} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOP KPIs --- */}
      {activeSection === 'overview' && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users} title="Toplam Üye" value={overview?.totalUsers || 0}
          trend={`+${overview?.newUsersThisWeek || 0}`} trendLabel="Bu hafta yeni"
          color="text-primary-light" bg="bg-primary/10"
        />
        <StatsCard
          icon={Crown} title="PRO Üyeler" value={overview?.proUsers || 0}
          trend={`%${Math.round((overview?.proUsers/(overview?.totalUsers || 1))*100) || 0}`} trendLabel="Oran"
          color="text-amber-400" bg="bg-amber-400/10"
        />
        <StatsCard
          icon={Activity} title="Bugün Aktif" value={overview?.activeToday || 0}
          trend={`%${Math.round(((overview?.activeToday || 0) / (overview?.totalUsers || 1)) * 100)}`} trendLabel="Oran"
          color="text-cyan-400" bg="bg-cyan-400/10"
        />
        <StatsCard
          icon={Target} title="Genel Başarı" value={`%${overview?.avgSuccessRate || 0}`}
          trend="Ortalama" trendLabel="Genel performans"
          color="text-emerald-400" bg="bg-emerald-400/10"
        />
      </div>
      )}

      {activeSection === 'journey' && (
      <>
      <MotionDiv
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-3xl border border-primary/10 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Activity className="h-6 w-6 text-primary-light" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light">Kullanıcı Yolculuğu</p>
            <h2 className="text-lg font-bold text-white">Dönüşüm, kaynak ve kohort analitiği</h2>
          </div>
        </div>
        {renderJourneyFilters()}
      </MotionDiv>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Target} title="Kategori Dönüşümü" value={`%${journeySummary.categorySelectionRate || 0}`}
          trend={`${journeySummary.selectedCategoryUsers || 0}/${journeySummary.totalUsers || 0}`} trendLabel="Onboarding"
          color="text-cyan-400" bg="bg-cyan-400/10"
        />
        <StatsCard
          icon={Activity} title="İlk Test Aktivasyonu" value={`%${journeySummary.activationRate || 0}`}
          trend={`${journeySummary.firstTestUsers || 0} öğrenci`} trendLabel="İlk çözüm"
          color="text-emerald-400" bg="bg-emerald-400/10"
        />
        <StatsCard
          icon={BrainCircuit} title="Yanlış Tekrar" value={`%${journeySummary.wrongReviewRate || 0}`}
          trend={`${journeySummary.wrongReviewUsers || 0}/${journeySummary.wrongAnswerUsers || 0}`} trendLabel="Tekrar dönüşü"
          color="text-violet-400" bg="bg-violet-400/10"
        />
        <StatsCard
          icon={Crown} title="PRO Adayı" value={journeySummary.highIntentFreeUsers || 0}
          trend={`${journeySummary.avgHoursToFirstTest || 0} sa`} trendLabel="Ort. ilk test"
          color="text-amber-400" bg="bg-amber-400/10"
        />
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Kullanıcı Yolculuğu Hunisi</h2>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Kayıttan ilk çözüme, tekrar davranışına ve PRO niyetine kadar</p>
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
        className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6"
      >
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Event Bazlı Dönüşüm</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-text-muted">Web ve mobildeki gerçek temas noktaları</p>
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
          className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6"
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Yolculuk Trendleri</h2>
                <p className="text-xs text-text-muted mt-0.5">Kayıt, ilk test, yanlış tekrar ve PRO temasları.</p>
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
          className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6"
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
        className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6"
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
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
              <Filter className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
            <h2 className="text-lg font-bold text-white">Kaynak Performansı</h2>
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
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <TrendingUp className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Kohort Aktivasyonu</h2>
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
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm"
        >
              <MetricPanelHeader icon={Bell} title="Bildirim Etkisi" subtitle="Gönderim, açılma ve geri dönüş" color="text-sky-300" bg="bg-sky-500/10" border="border-sky-500/20" />
          <div className="grid grid-cols-2 gap-3">
            <MiniMetric label="Kampanya" value={notificationEffect.campaigns || 0} />
            <MiniMetric label="In-App" value={notificationEffect.inAppSent || 0} />
            <MiniMetric label="Push" value={notificationEffect.pushSent || 0} />
            <MiniMetric label="Açılma" value={`%${notificationEffect.openRate || 0}`} />
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm"
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
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm"
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
            className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Grafiksel Kayıt Akışı</h2>
              <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Son 7 günde kayıt hareketi</p>
            </div>
            <div className="w-fit px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-bold text-primary-light uppercase tracking-widest">
              Gerçek Zamanlı
            </div>
          </div>

          <div className="h-[240px] sm:h-[300px] w-full">
            {hasRegistrationData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                      contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#818cf8' }}
                  />
                  <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#6366f1"
                      strokeWidth={3}
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
            className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center text-center"
        >
           <h2 className="text-lg font-bold text-white mb-1">Üyelik Dağılımı</h2>
           <p className="text-xs text-text-muted mb-6 uppercase tracking-widest font-bold">PRO ve ücretsiz kullanıcı dengesi</p>

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
               <span className="text-2xl font-bold text-white">{overview?.proUsers || 0}</span>
               <span className="text-[10px] font-bold text-amber-400 uppercase">PRO</span>
             </div>
           </div>

           <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                <span className="text-[11px] font-bold text-white/60">PRO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary"></div>
                <span className="text-[11px] font-bold text-white/60">ÜCRETSİZ</span>
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
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">QR Tıklanma Grafiği</h2>
              <p className="text-xs text-text-muted mt-0.5">Basılı QR kodun günlük tıklanma akışı.</p>
            </div>
          </div>
          <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qrTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="clicks" fill="#818cf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Günlük Hedef Dağılımı</h2>
              <p className="text-xs text-text-muted mt-0.5">Öğrencilerin seçtiği günlük soru hedefleri.</p>
            </div>
          </div>
          <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyGoalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }} />
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
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
               <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Konu Performans Barometresi</h2>
              <p className="text-xs text-text-muted mt-0.5">En zayıf konudan en güçlü konuya doğru sıralama.</p>
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
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Kritik Hata Noktaları</h2>
                    <p className="text-xs text-text-muted mt-0.5">Öğrencileri en çok zorlayan sorular.</p>
                </div>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-2 custom-scrollbar">
             {difficultQuestions.slice(0, 5).map((q, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white/[0.015] border border-white/10 flex flex-col gap-3 group hover:border-rose-500/30 transition-all">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                         <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Kritik Soru</span>
                      </div>
                         <span className="text-[10px] font-bold text-white/30">{q.wrongCount} toplam hata</span>
                   </div>
                   <p className="text-sm font-semibold text-white/80 leading-relaxed italic line-clamp-2">"{q.text}"</p>
                   <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-rose-500 h-full" style={{ width: `${Math.round(q.failRate * 100)}%` }}></div>
                   </div>
                </div>
             ))}
          </div>
        </MotionDiv>

      </div>
      </>
      )}

      {/* --- SYSTEM METRICS & FOOTER INSIGHTS --- */}
      {activeSection === 'overview' && (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 flex items-center justify-between hover:bg-white/[0.025] transition-all">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Soru Havuzu</p>
              <h4 className="text-lg font-bold text-white mt-1">{overview?.totalQuestions || 0} soru</h4>
            </div>
            <BrainCircuit className="h-5 w-5 text-violet-400" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 flex items-center justify-between hover:bg-white/[0.025] transition-all">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Bildirim Kapalı</p>
              <h4 className="text-lg font-bold text-white mt-1">{overview?.notifDisabledCount || 0} öğrenci</h4>
            </div>
            <Bell className="h-5 w-5 text-rose-400" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 flex items-center justify-between hover:bg-white/[0.025] transition-all">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">QR Dönüşümü</p>
              <h4 className="text-lg font-bold text-white mt-1">{qrStats?.count || 0} tarama</h4>
            </div>
            <QrCode className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 flex items-center justify-between hover:bg-white/[0.025] transition-all">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Son QR Tarama</p>
              <h4 className="text-xs font-bold text-white mt-1">
                {qrStats?.lastScanAt ? new Date(qrStats.lastScanAt).toLocaleDateString('tr-TR') : '-'}
              </h4>
            </div>
            <Clock className="h-5 w-5 text-indigo-300" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <InsightCard
              icon={Bell} title="Bildirim Etkileşimi"
              value={`%${Math.round((overview?.notifEnabledCount/overview?.totalUsers)*100) || 0}`}
              desc={`${overview?.notifEnabledCount || 0} kullanıcının bildirimi açık.`}
           />
           <InsightCard
              icon={Clock} title="Favori Saat"
              value={`${overview?.mostCommonNotifHour || 0}:00`}
              desc="Kullanıcılar en çok bu saatte etkin."
           />
           <InsightCard
              icon={DownloadCloud} title="Haftalık Büyüme"
              value={`+${overview?.newUsersThisWeek || 0}`}
              desc="Yeni katılan potansiyel PRO adayları."
           />
        </div>
      </div>
      )}

      <AnimatePresence>
        {analysisGuideOpen && (
          <AnalysisGuideModal onClose={() => setAnalysisGuideOpen(false)} />
        )}
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
              className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-bg-card shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light">Kullanıcı Timeline</p>
                  <h3 className="mt-1 truncate text-xl font-bold text-white">{timelineUser.name}</h3>
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

export default AdminStats;
