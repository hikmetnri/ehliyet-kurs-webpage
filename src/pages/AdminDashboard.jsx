import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Bolt,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CloudDownload,
  FileQuestion,
  Flag,
  Loader2,
  Megaphone,
  MessageCircle,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import api from '../api';
import useAuthStore from '../store/authStore';
import {
  normalizeCategoryStats,
  normalizeRegistrationTrend,
  readList,
} from '../utils/statsData';

const COLORS = {
  background: '#080D18',
  surface: '#101725',
  raised: '#151E2E',
  border: '#243044',
  text: '#F4F7FB',
  muted: '#8F9BB0',
  primary: '#7C6CFF',
  cyan: '#42D6C6',
  amber: '#FFB85C',
  red: '#FF647C',
  blue: '#70A4FF',
  green: '#64D98B',
};

const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

const formatNumber = (value) => numberValue(value).toLocaleString('tr-TR');

const formatDate = () => {
  const raw = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date());

  return raw.toLocaleUpperCase('tr-TR');
};

const SectionHeader = ({ eyebrow, title, trailing, trailingColor = COLORS.primary }) => (
  <div className="flex items-end justify-between gap-4">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8F9BB0]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-black tracking-[-0.02em] text-[#F4F7FB]">{title}</h2>
    </div>
    {trailing ? (
      <span
        className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black"
        style={{
          color: trailingColor,
          borderColor: `${trailingColor}35`,
          backgroundColor: `${trailingColor}12`,
        }}
      >
        {trailing}
      </span>
    ) : null}
  </div>
);

const MetricCard = ({ label, value, icon: Icon, color }) => (
  <div className="min-h-[112px] rounded-[20px] border border-[#243044] bg-[#101725] p-3.5 sm:p-4">
    <div className="flex items-start justify-between gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ color, backgroundColor: `${color}16` }}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
    </div>
    <p className="mt-3 text-xl font-black leading-none tracking-[-0.03em] text-[#F4F7FB] sm:text-2xl">
      {formatNumber(value)}
    </p>
    <p className="mt-1.5 truncate text-[11px] font-semibold text-[#8F9BB0]">{label}</p>
  </div>
);

const QueueRow = ({ label, description, count, icon: Icon, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[#151E2E]"
  >
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]"
      style={{ color, backgroundColor: `${color}15` }}
    >
      <Icon className="h-[18px] w-[18px]" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-extrabold text-[#F4F7FB]">{label}</span>
      <span className="mt-0.5 block truncate text-[11px] font-medium text-[#8F9BB0]">
        {description}
      </span>
    </span>
    <span
      className="min-w-8 rounded-lg px-2 py-1 text-center text-xs font-black"
      style={{ color, backgroundColor: `${color}13` }}
    >
      {count}
    </span>
    <ChevronRight className="h-4 w-4 shrink-0 text-[#536078] transition-transform group-hover:translate-x-0.5 group-hover:text-[#F4F7FB]" />
  </button>
);

const ActionCard = ({ label, icon: Icon, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex min-h-[98px] flex-col items-center justify-center rounded-[18px] border border-[#243044] bg-[#101725] px-2 py-3 transition-all hover:-translate-y-0.5 hover:border-[#35445e] hover:bg-[#151E2E]"
  >
    <span
      className="flex h-10 w-10 items-center justify-center rounded-[13px] transition-transform group-hover:scale-105"
      style={{ color, backgroundColor: `${color}16` }}
    >
      <Icon className="h-[18px] w-[18px]" />
    </span>
    <span className="mt-2.5 text-center text-[11px] font-extrabold text-[#DDE5F2]">{label}</span>
  </button>
);

const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex min-h-[140px] flex-col items-center justify-center px-5 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#151E2E] text-[#61708A]">
      <Icon className="h-5 w-5" />
    </span>
    <p className="mt-3 text-xs font-semibold text-[#8F9BB0]">{text}</p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 pb-10">
    <div className="h-56 animate-pulse rounded-[26px] border border-[#243044] bg-[#101725]" />
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-28 animate-pulse rounded-[20px] border border-[#243044] bg-[#101725]"
        />
      ))}
    </div>
    <div className="h-52 animate-pulse rounded-[22px] border border-[#243044] bg-[#101725]" />
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [overview, setOverview] = useState({});
  const [pendingPosts, setPendingPosts] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [reports, setReports] = useState([]);
  const [registrationTrend, setRegistrationTrend] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [rootCategories, setRootCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);
  const [note, setNote] = useState(() => localStorage.getItem('adminNote') || '');

  const loadDashboard = useCallback(async () => {
    if (Object.keys(overview).length) setRefreshing(true);
    else setLoading(true);
    setHasLoadError(false);

    const params = new URLSearchParams({ days: '7' });
    if (selectedCategoryId !== 'all') params.set('categoryId', selectedCategoryId);
    const query = `?${params.toString()}`;

    const safeRequest = async (request) => {
      try {
        return { ok: true, response: await request };
      } catch (error) {
        console.error('[AdminDashboard] veri alınamadı:', error);
        return { ok: false, response: null };
      }
    };

    try {
      const results = await Promise.all([
        safeRequest(api.get(`/admin/stats/overview${query}`)),
        safeRequest(api.get('/posts/admin/pending')),
        safeRequest(api.get('/contact')),
        safeRequest(api.get('/reports')),
        safeRequest(api.get(`/admin/stats/registration-trend${query}`)),
        safeRequest(api.get(`/admin/stats/categories${query}`)),
        safeRequest(api.get('/admin/maintenance-status')),
        safeRequest(api.get('/categories/all')),
        safeRequest(api.get('/admin/logs')),
      ]);

      const [
        overviewResult,
        postsResult,
        ticketsResult,
        reportsResult,
        trendResult,
        categoriesStatsResult,
        maintenanceResult,
        allCategoriesResult,
        logsResult,
      ] = results;

      const ticketList = readList(getPayload(ticketsResult.response)).filter(
        (ticket) => !['closed', 'kapalı'].includes(String(ticket?.status || '').toLowerCase()),
      );
      const reportList = readList(getPayload(reportsResult.response)).filter(
        (report) =>
          !['closed', 'resolved', 'rejected', 'dismissed'].includes(
            String(report?.status || '').toLowerCase(),
          ),
      );
      const allCategories = readList(getPayload(allCategoriesResult.response));

      if (overviewResult.ok) setOverview(getPayload(overviewResult.response));
      if (postsResult.ok) setPendingPosts(readList(getPayload(postsResult.response)));
      if (ticketsResult.ok) setSupportTickets(ticketList);
      if (reportsResult.ok) setReports(reportList);
      if (trendResult.ok) {
        setRegistrationTrend(normalizeRegistrationTrend(getPayload(trendResult.response)));
      }
      if (categoriesStatsResult.ok) {
        setCategoryStats(normalizeCategoryStats(getPayload(categoriesStatsResult.response)));
      }
      if (maintenanceResult.ok) {
        const maintenance = getPayload(maintenanceResult.response);
        setIsMaintenance(Boolean(maintenance?.enabled || maintenance?.isMaintenance));
      }
      if (allCategoriesResult.ok) {
        setRootCategories(
          allCategories.filter((category) => !category?.parent && !category?.parentId),
        );
      }
      if (logsResult.ok) setAdminLogs(readList(getPayload(logsResult.response)).slice(0, 8));

      setHasLoadError(results.some((result) => !result.ok));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [overview, selectedCategoryId]);

  useEffect(() => {
    loadDashboard();
    // `overview` yalnızca ilk yüklemede skeleton seçimi için kullanılır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  const pendingTotal = pendingPosts.length + supportTickets.length + reports.length;
  const clean = pendingTotal === 0;

  const trendTotal = useMemo(
    () =>
      registrationTrend.reduce(
        (sum, item) => sum + numberValue(item?.users ?? item?.count ?? item?.value),
        0,
      ),
    [registrationTrend],
  );

  const visibleCategoryStats = useMemo(
    () =>
      [...categoryStats]
        .sort(
          (a, b) =>
            numberValue(b?.successRate ?? b?.rate ?? b?.value) -
            numberValue(a?.successRate ?? a?.rate ?? a?.value),
        )
        .slice(0, 4),
    [categoryStats],
  );

  const toggleMaintenance = async () => {
    try {
      setProcessingAction('maintenance');
      const nextValue = !isMaintenance;
      await api.post('/admin/maintenance', { enabled: nextValue });
      setIsMaintenance(nextValue);
    } catch {
      window.alert('Bakım modu değiştirilemedi.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleBackup = async () => {
    try {
      setProcessingAction('backup');
      const response = await api.get('/admin/backup');
      const payload = getPayload(response);
      window.alert(
        payload?.status === 'success'
          ? `Yedekleme tamamlandı${payload?.filename ? `: ${payload.filename}` : '.'}`
          : 'Yedekleme isteği tamamlandı.',
      );
    } catch {
      window.alert('Yedekleme sırasında bir hata oluştu.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePostDecision = async (postId, action) => {
    const adminNote =
      action === 'reject' ? window.prompt('Reddetme sebebi (isteğe bağlı):') : '';
    if (adminNote === null) return;

    try {
      setProcessingAction(`post-${postId}-${action}`);
      await api.patch(
        `/posts/${postId}/${action}`,
        action === 'reject' ? { adminNote } : undefined,
      );
      setPendingPosts((current) => current.filter((post) => post._id !== postId));
    } catch {
      window.alert(action === 'approve' ? 'Gönderi onaylanamadı.' : 'Gönderi reddedilemedi.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReportDecision = async (reportId, status) => {
    try {
      setProcessingAction(`report-${reportId}-${status}`);
      await api.put(`/reports/${reportId}/status`, { status });
      setReports((current) => current.filter((report) => report._id !== reportId));
    } catch {
      window.alert('Rapor durumu güncellenemedi.');
    } finally {
      setProcessingAction(null);
    }
  };

  const saveNote = (event) => {
    const nextNote = event.target.value;
    setNote(nextNote);
    localStorage.setItem('adminNote', nextNote);
  };

  const metrics = [
    {
      label: 'Toplam kullanıcı',
      value: overview.totalUsers,
      icon: Users,
      color: COLORS.primary,
    },
    {
      label: 'PRO üyeler',
      value: overview.proUsers ?? overview.totalProUsers,
      icon: Sparkles,
      color: COLORS.amber,
    },
    {
      label: 'Aktif sınavlar',
      value: overview.totalExams,
      icon: ClipboardCheck,
      color: COLORS.cyan,
    },
    {
      label: 'Soru bankası',
      value: overview.totalQuestions,
      icon: FileQuestion,
      color: COLORS.blue,
    },
  ];

  const queueItems = [
    {
      label: 'İçerik raporları',
      description: 'İnceleme bekleyen bildirimler',
      count: reports.length,
      icon: Flag,
      color: COLORS.red,
      path: '/admin/reports',
    },
    {
      label: 'Gönderi onayları',
      description: 'Topluluk moderasyon kuyruğu',
      count: pendingPosts.length,
      icon: Activity,
      color: COLORS.amber,
      path: '/admin/feed',
    },
    {
      label: 'Destek talepleri',
      description: 'Yanıt bekleyen mesajlar',
      count: supportTickets.length,
      icon: MessageCircle,
      color: COLORS.cyan,
      path: '/admin/support',
    },
  ];

  const quickActions = [
    { label: 'Kullanıcılar', icon: Users, color: COLORS.primary, path: '/admin/users' },
    { label: 'Sınavlar', icon: ClipboardCheck, color: COLORS.amber, path: '/admin/exams' },
    { label: 'Analitik', icon: BarChart3, color: COLORS.cyan, path: '/admin/stats' },
    { label: 'Duyuru', icon: Megaphone, color: COLORS.blue, path: '/admin/notifications' },
    { label: 'Abonelik', icon: WalletCards, color: '#FFD166', path: '/admin/settings' },
    { label: 'Reklamlar', icon: Bell, color: COLORS.green, path: '/admin/marketing' },
  ];

  if (loading) return <LoadingState />;

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6 pb-5 sm:space-y-7 lg:pb-2">
      {hasLoadError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#FFB85C]/30 bg-[#FFB85C]/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB85C]" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-[#FFD59A]">Bazı veriler yüklenemedi</p>
            <p className="mt-0.5 text-[11px] text-[#B7A98F]">
              Erişilebilen veriler gösteriliyor. Sunucu bağlantısını kontrol edip yeniden deneyebilirsin.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            className="rounded-lg px-2 py-1 text-[11px] font-black text-[#FFB85C] hover:bg-[#FFB85C]/10"
          >
            Dene
          </button>
        </div>
      ) : null}

      {isMaintenance ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#FF647C]/30 bg-[#FF647C]/10 px-4 py-3">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#FF647C]" />
          <p className="min-w-0 flex-1 text-xs font-bold text-[#FF9AAC]">
            Bakım modu aktif; kullanıcı erişimi sınırlandırılıyor.
          </p>
          <button
            type="button"
            onClick={toggleMaintenance}
            disabled={processingAction === 'maintenance'}
            className="text-[11px] font-black text-[#FF9AAC] disabled:opacity-50"
          >
            Kapat
          </button>
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[26px] border border-[#243044] bg-[#101725] p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-[#7C6CFF]/10" />
        <div className="pointer-events-none absolute -bottom-16 right-12 h-32 w-32 rounded-full bg-[#42D6C6]/[0.07]" />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <p className="pt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#42D6C6]">
              {formatDate()}
            </p>
            <button
              type="button"
              onClick={loadDashboard}
              disabled={refreshing}
              aria-label="Dashboard verilerini yenile"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#243044] bg-[#151E2E] text-[#DDE5F2] transition-colors hover:border-[#465672] hover:text-white disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#42D6C6]" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>
          </div>

          <h1 className="mt-3 max-w-2xl truncate text-[27px] font-black leading-[1.08] tracking-[-0.04em] text-[#F4F7FB] sm:text-3xl">
            Merhaba, {user?.firstName || 'Yönetici'}
          </h1>
          <p className="mt-2 max-w-xl text-[13px] font-medium leading-5 text-[#8F9BB0]">
            {clean
              ? 'Harika, tüm operasyon kuyrukları temiz.'
              : `Bugün ilgilenmen gereken ${pendingTotal} işlem var.`}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[11px] font-black"
              style={{
                color: clean ? COLORS.cyan : COLORS.amber,
                backgroundColor: `${clean ? COLORS.cyan : COLORS.amber}15`,
              }}
            >
              {clean ? <CheckCircle2 className="h-4 w-4" /> : <Bolt className="h-4 w-4" />}
              {clean ? 'Her şey yolunda' : 'Aksiyon gerekli'}
            </span>

            {rootCategories.length ? (
              <label className="relative">
                <span className="sr-only">Dashboard kategorisi</span>
                <select
                  value={selectedCategoryId}
                  onChange={(event) => setSelectedCategoryId(event.target.value)}
                  className="h-8 appearance-none rounded-[10px] border border-[#243044] bg-[#151E2E] py-0 pl-3 pr-8 text-[11px] font-bold text-[#DDE5F2] outline-none transition-colors hover:border-[#465672] focus:border-[#7C6CFF]"
                >
                  <option value="all">Tüm eğitimler</option>
                  {rootCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2.5 top-2 h-3.5 w-3.5 rotate-90 text-[#8F9BB0]" />
              </label>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="space-y-6">
          <section className="space-y-3">
            <SectionHeader
              eyebrow="Öncelikli"
              title="İşlem merkezi"
              trailing={`${pendingTotal} bekleyen`}
              trailingColor={clean ? COLORS.cyan : COLORS.amber}
            />
            <div className="divide-y divide-[#243044] overflow-hidden rounded-[22px] border border-[#243044] bg-[#101725]">
              {queueItems.map((item) => (
                <QueueRow
                  key={item.label}
                  {...item}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader
              eyebrow="Büyüme"
              title="Son 7 gün"
              trailing={`+${formatNumber(trendTotal)} kayıt`}
            />
            <div className="h-[220px] rounded-[22px] border border-[#243044] bg-[#101725] p-3 sm:h-[245px] sm:p-4">
              {registrationTrend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationTrend} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.38} />
                        <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#243044" strokeDasharray="3 5" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: COLORS.muted, fontSize: 10, fontWeight: 600 }}
                      minTickGap={14}
                    />
                    <Tooltip
                      cursor={{ stroke: COLORS.primary, strokeOpacity: 0.3 }}
                      contentStyle={{
                        background: COLORS.raised,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 12,
                        color: COLORS.text,
                        fontSize: 11,
                      }}
                      labelStyle={{ color: COLORS.muted }}
                      formatter={(value) => [`${formatNumber(value)} kullanıcı`, 'Kayıt']}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke={COLORS.primary}
                      strokeWidth={2.5}
                      fill="url(#adminTrendFill)"
                      dot={{ r: 3, fill: COLORS.background, stroke: COLORS.cyan, strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: COLORS.cyan, stroke: COLORS.background, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={BarChart3} text="Kayıt trendi henüz oluşmadı." />
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <SectionHeader eyebrow="Kısayollar" title="Yönetim araçları" />
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 xl:grid-cols-3">
              {quickActions.map((action) => (
                <ActionCard
                  key={action.label}
                  {...action}
                  onClick={() => navigate(action.path)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader eyebrow="İçgörü" title="Kategori performansı" />
            <div className="rounded-[22px] border border-[#243044] bg-[#101725] p-4 sm:p-[18px]">
              {visibleCategoryStats.length ? (
                <div className="space-y-4">
                  {visibleCategoryStats.map((item, index) => {
                    const rawRate = numberValue(
                      item.successRate ?? item.avgSuccessRate ?? item.rate ?? item.value,
                    );
                    const percentage = Math.max(
                      0,
                      Math.min(100, rawRate <= 1 ? rawRate * 100 : rawRate),
                    );
                    const colors = [COLORS.primary, COLORS.cyan, COLORS.amber, COLORS.blue];

                    return (
                      <div key={item._id || item.name || index}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-xs font-bold text-[#DDE5F2]">
                            {item.categoryName || item.name || item.category || 'Kategori'}
                          </p>
                          <span className="text-[11px] font-black" style={{ color: colors[index] }}>
                            %{Math.round(percentage)}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#202B3E]">
                          <div
                            className="h-full rounded-full transition-[width] duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: colors[index] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={Activity} text="Kategori performans verisi bulunamadı." />
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleBackup}
          disabled={processingAction === 'backup'}
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-2xl border border-[#7C6CFF]/30 bg-[#7C6CFF]/10 px-4 text-xs font-black text-[#AFA5FF] transition-colors hover:bg-[#7C6CFF]/15 disabled:opacity-50"
        >
          {processingAction === 'backup' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CloudDownload className="h-4 w-4" />
          )}
          Veritabanını yedekle
        </button>
        <button
          type="button"
          onClick={toggleMaintenance}
          disabled={processingAction === 'maintenance'}
          className={`flex min-h-14 items-center justify-center gap-2.5 rounded-2xl border px-4 text-xs font-black transition-colors disabled:opacity-50 ${
            isMaintenance
              ? 'border-[#FF647C]/30 bg-[#FF647C]/10 text-[#FF9AAC] hover:bg-[#FF647C]/15'
              : 'border-[#FFB85C]/30 bg-[#FFB85C]/10 text-[#FFD092] hover:bg-[#FFB85C]/15'
          }`}
        >
          {processingAction === 'maintenance' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isMaintenance ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          {isMaintenance ? 'Bakım modunu kapat' : 'Bakım modunu aç'}
        </button>
      </section>

      <details className="group overflow-hidden rounded-[22px] border border-[#243044] bg-[#101725]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 marker:hidden sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#151E2E] text-[#8F9BB0]">
              <Settings className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-[#F4F7FB]">Web yönetim detayları</span>
              <span className="mt-0.5 block text-[11px] text-[#8F9BB0]">
                Hızlı moderasyon, notlar ve işlem geçmişi
              </span>
            </span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#8F9BB0] transition-transform group-open:rotate-90" />
        </summary>

        <div className="grid gap-4 border-t border-[#243044] p-4 lg:grid-cols-3 lg:p-5">
          <div className="rounded-2xl border border-[#243044] bg-[#0D1422] p-3.5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-black text-[#F4F7FB]">Hızlı moderasyon</h3>
              <button
                type="button"
                onClick={() => navigate('/admin/feed')}
                className="text-[10px] font-black text-[#AFA5FF]"
              >
                Tümü
              </button>
            </div>
            <div className="space-y-2">
              {pendingPosts.slice(0, 2).map((post) => (
                <div key={post._id} className="rounded-xl border border-[#243044] bg-[#101725] p-3">
                  <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-[#DDE5F2]">
                    {post.content || post.text || 'Gönderi içeriği'}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePostDecision(post._id, 'approve')}
                      disabled={processingAction?.startsWith(`post-${post._id}`)}
                      className="flex-1 rounded-lg bg-[#42D6C6]/10 py-1.5 text-[10px] font-black text-[#42D6C6] disabled:opacity-50"
                    >
                      Onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePostDecision(post._id, 'reject')}
                      disabled={processingAction?.startsWith(`post-${post._id}`)}
                      className="flex-1 rounded-lg bg-[#FF647C]/10 py-1.5 text-[10px] font-black text-[#FF8CA0] disabled:opacity-50"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
              {!pendingPosts.length && reports.slice(0, 1).map((report) => (
                <div key={report._id} className="rounded-xl border border-[#243044] bg-[#101725] p-3">
                  <p className="line-clamp-2 text-[11px] font-semibold text-[#DDE5F2]">
                    {report.reason || 'İçerik raporu'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleReportDecision(report._id, 'resolved')}
                    disabled={processingAction?.startsWith(`report-${report._id}`)}
                    className="mt-2 w-full rounded-lg bg-[#42D6C6]/10 py-1.5 text-[10px] font-black text-[#42D6C6] disabled:opacity-50"
                  >
                    Çözüldü olarak işaretle
                  </button>
                </div>
              ))}
              {!pendingPosts.length && !reports.length ? (
                <p className="py-5 text-center text-[11px] font-semibold text-[#69758A]">
                  Moderasyon kuyruğu temiz.
                </p>
              ) : null}
            </div>
          </div>

          <label className="rounded-2xl border border-[#243044] bg-[#0D1422] p-3.5">
            <span className="text-xs font-black text-[#F4F7FB]">Hızlı not</span>
            <span className="mt-1 block text-[10px] text-[#8F9BB0]">Bu tarayıcıda otomatik saklanır.</span>
            <textarea
              value={note}
              onChange={saveNote}
              rows={7}
              placeholder="Bugün yapılacaklar..."
              className="mt-3 w-full resize-none rounded-xl border border-[#243044] bg-[#101725] p-3 text-xs leading-5 text-[#F4F7FB] outline-none placeholder:text-[#65728A] focus:border-[#7C6CFF]"
            />
          </label>

          <div className="rounded-2xl border border-[#243044] bg-[#0D1422] p-3.5">
            <h3 className="text-xs font-black text-[#F4F7FB]">Son işlemler</h3>
            <div className="mt-3 space-y-3">
              {adminLogs.length ? (
                adminLogs.slice(0, 6).map((log) => (
                  <div key={log._id} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C6CFF]" />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold text-[#DDE5F2]">
                        {log.action || 'Yönetim işlemi'}
                      </p>
                      <p className="mt-0.5 text-[9px] text-[#69758A]">
                        {log.adminName || 'Admin'}
                        {log.createdAt
                          ? ` · ${new Date(log.createdAt).toLocaleString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-5 text-center text-[11px] font-semibold text-[#69758A]">
                  İşlem kaydı bulunamadı.
                </p>
              )}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};

export default AdminDashboard;
