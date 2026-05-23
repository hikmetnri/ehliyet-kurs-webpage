import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookMarked,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  LayoutGrid,
  Loader2,
  PlayCircle,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Bell,
  Flame,
  ChevronRight,
  Zap,
  Quote,
  X,
  Play
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import CategorySelectorModal from '../../components/user/CategorySelectorModal';
import NotificationPanel from '../../components/user/NotificationPanel';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { isVideoRecord, limitQuoteText } from '../../utils/categoryContent';

const getStoredExamDate = () => {
  try {
    return localStorage.getItem('exam_date') || '';
  } catch {
    return '';
  }
};

const getExamCountdown = (dateValue) => {
  if (!dateValue) return null;

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const examStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const diffDays = Math.ceil((examStart - todayStart) / 86400000);

  return {
    date: parsed,
    days: Math.abs(diffDays),
    isPast: diffDays < 0,
    isToday: diffDays === 0,
    formatted: parsed.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
  };
};

const planIconByType = {
  select_category: ShieldCheck,
  wrong_review: RefreshCcw,
  weak_topic: BookOpen,
  lesson: BookOpen,
  daily_goal: Target,
  short_test: FileQuestion,
  mock_exam: GraduationCap,
};

const planRouteByAction = {
  wrong_review: '/dashboard/exams/wrong-review',
  weak_topic: '/dashboard/lessons',
  lesson: '/dashboard/lessons',
  daily_goal: '/dashboard/exams',
  short_test: '/dashboard/exams',
  mock_exam: '/dashboard/exams',
  stats: '/dashboard/stats',
};

const getCategoryIcon = (name) => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('trafik') || lowercaseName.includes('levha') || lowercaseName.includes('işaret')) {
    return AlertCircle;
  }
  if (lowercaseName.includes('motor') || lowercaseName.includes('araç') || lowercaseName.includes('teknik')) {
    return Settings2;
  }
  if (lowercaseName.includes('ilkyardım') || lowercaseName.includes('ilk yardım') || lowercaseName.includes('sağlık')) {
    return Activity;
  }
  if (lowercaseName.includes('adab') || lowercaseName.includes('çevre') || lowercaseName.includes('davranış')) {
    return ShieldCheck;
  }
  return BookOpen;
};

const getCategoryColor = (name) => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('trafik')) return '#06b6d4'; // Cyan
  if (lowercaseName.includes('motor')) return '#f59e0b'; // Amber/Orange
  if (lowercaseName.includes('ilkyardım')) return '#ef4444'; // Red
  if (lowercaseName.includes('adab')) return '#10b981'; // Green
  return '#6366f1'; // Purple/Indigo
};

const UserHome = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [quote, setQuote] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [reviewDue, setReviewDue] = useState({ count: 0, items: [] });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [completedIds, setCompletedIds] = useState([]);

  // Son ziyaret edilen ders bilgileri
  const [lastVisitedId, setLastVisitedId] = useState(null);
  const [lastVisitedName, setLastVisitedName] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data?.notifications || res.data?.data || res.data;
      const list = Array.isArray(data) ? data : [];
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Bildirim sayısı alınamadı:', err);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleCloseNotifications = () => {
    setShowNotifications(false);
    setTimeout(fetchUnreadCount, 500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setIsMockMode(false);

        // LocalStorage'dan son okunan konuyu al
        setLastVisitedId(localStorage.getItem('last_visited_id'));
        setLastVisitedName(localStorage.getItem('last_visited_name'));

        // LocalStorage'dan tamamlanan konuları al
        try {
          const list = JSON.parse(localStorage.getItem('completedLessons') || '[]');
          setCompletedIds(list);
        } catch {
          setCompletedIds([]);
        }

        try {
          const statsRes = await api.get('/exam-results/stats');
          if (statsRes.data && !statsRes.data.error) setStats(statsRes.data);
        } catch (err) {
          console.error('Stats error', err);
        }

        try {
          const planRes = await api.get('/stats/daily-plan');
          const planData = planRes.data?.data || planRes.data;
          setDailyPlan(planData?.tasks ? planData : null);
        } catch (err) {
          console.error('Daily plan error', err);
          setDailyPlan(null);
        }

        try {
          const mainRes = await api.get('/categories');
          const mainData = mainRes.data?.data || mainRes.data?.categories || mainRes.data;
          const filteredMain = (Array.isArray(mainData) ? mainData : [])
            .filter((category) => !category.parent && !isVideoRecord(category));
          setMainCategories(filteredMain);
          if (filteredMain.length === 0) setIsMockMode(true);
        } catch (err) {
          setIsMockMode(true);
          console.error('Main categories error', err);
        }

        if (user?.selectedCategoryId) {
          try {
            const subRes = await api.get(`/categories?parent=${user.selectedCategoryId}`);
            const subData = subRes.data?.data || subRes.data?.categories || subRes.data;
            setSubCategories((Array.isArray(subData) ? subData : []).filter((category) => !isVideoRecord(category)));
          } catch (err) {
            console.error('Sub categories error', err);
          }
        } else {
          setSubCategories([]);
        }

        try {
          const allRes = await api.get('/categories/all');
          const allCats = allRes.data?.data || [];
          setAllCategories(allCats);
        } catch (err) {
          console.error('All categories fetch error', err);
        }

        try {
          const quoteRes = await api.get('/quotes/random');
          const quoteData = quoteRes.data?.data || quoteRes.data;
          if (quoteData?.text) {
            setQuote({
              text: limitQuoteText(quoteData.text),
              author: quoteData.author || '',
            });
          }
        } catch (err) {
          console.error('Quotes error', err);
        }

        try {
          const reviewRes = await api.get('/wrong-answers/review-due?limit=3');
          const reviewItems = reviewRes.data?.data || [];
          setReviewDue({
            count: reviewRes.data?.count ?? reviewItems.length,
            items: Array.isArray(reviewItems) ? reviewItems : [],
          });
        } catch (err) {
          console.error('Review due error', err);
          setReviewDue({ count: 0, items: [] });
        }
      } catch (err) {
        console.error('Global fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.selectedCategoryId]);

  const planProgress = dailyPlan?.progress || {};
  const dailyGoal = planProgress.dailyGoal || stats?.dailyGoal || 20;
  const todayQuestions = planProgress.todayQuestions ?? stats?.todayQuestions ?? 0;
  const dailyProgress = dailyGoal > 0
    ? Math.min(100, Math.round((todayQuestions / dailyGoal) * 100))
    : 0;
  const examCountdown = getExamCountdown(user?.examDate || getStoredExamDate());
  const remainingQuestions = planProgress.remainingQuestions ?? Math.max(0, dailyGoal - todayQuestions);
  const totalScore = Number(user?.totalScore || user?.totalPoints || stats?.totalScore || 0);
  const level = Number(user?.level || stats?.level || 1);
  const nextLevelTarget = Math.max(100, Math.ceil((totalScore + 1) / 500) * 500);
  const levelProgress = Math.min(100, Math.round((totalScore / nextLevelTarget) * 100));
  const selectedPackage = user?.selectedCategoryName || 'Sınıf seçilmedi';

  const actionCards = useMemo(() => ([
    {
      to: '/dashboard/exams',
      icon: PlayCircle,
      label: 'Sınav Çöz',
      text: 'Kısa test veya MEB simülasyonu başlat.',
      tone: 'from-primary/20 to-accent/10',
    },
    {
      to: '/dashboard/lessons',
      icon: BookMarked,
      label: 'Derse Devam',
      text: 'Seçili paketin konu anlatımlarını oku.',
      tone: 'from-success/15 to-primary/10',
    },
    {
      to: '/dashboard/traffic-signs',
      icon: ShieldCheck,
      label: 'Trafik İşaretleri',
      text: 'Sınavda sık çıkan işaretleri tekrar et.',
      tone: 'from-accent/15 to-white/[0.02]',
    },
    {
      to: '/dashboard/videos',
      icon: PlayCircle,
      label: 'Video Dersler',
      text: 'Online video anlatımlarını kategori kategori izle.',
      tone: 'from-warning/15 to-primary/10',
    },
  ]), []);

  const studyPlan = dailyPlan?.tasks?.length
    ? dailyPlan.tasks.slice(0, 3).map((task) => ({
      label: task.title,
      detail: task.detail,
      icon: planIconByType[task.type] || ClipboardList,
      done: Boolean(task.completed),
    }))
    : [
      { label: 'Konu tekrarı', detail: '15 dakika okuma', icon: BookOpen, done: Boolean(user?.selectedCategoryId) },
      { label: 'Mini test', detail: '10 soru çöz', icon: ClipboardList, done: todayQuestions >= 10 },
      { label: 'Günlük hedef', detail: `${dailyGoal} soruluk hedef`, icon: Target, done: todayQuestions >= dailyGoal },
    ];

  const wrongCount = stats?.totalWrong || stats?.wrongCount || 0;
  const recommendation = (() => {
    if (dailyPlan?.title) {
      const action = dailyPlan.primaryAction || {};
      const actionType = action.type || dailyPlan.tasks?.find((task) => !task.completed)?.type || 'short_test';
      const to = actionType === 'select_category'
        ? undefined
        : action.target || planRouteByAction[actionType] || '/dashboard/exams';
      return {
        title: dailyPlan.title,
        detail: dailyPlan.subtitle || 'Bugünkü çalışma planın hazır.',
        action: action.label || 'Başla',
        to,
        onClick: actionType === 'select_category' ? () => setShowCategoryModal(true) : undefined,
        icon: planIconByType[actionType] || Target,
        tone: dailyPlan.dueWrong?.count > 0
          ? 'warning'
          : dailyPlan.progress?.completed
            ? 'accent'
            : 'success',
      };
    }

    if (!user?.selectedCategoryId) {
      return {
        title: 'Bugün sınıfını seç',
        detail: 'Ders, sınav ve hedef önerilerini kişiselleştirmek için ehliyet sınıfını belirle.',
        action: 'Sınıf Seç',
        onClick: () => setShowCategoryModal(true),
        icon: ShieldCheck,
        tone: 'primary',
      };
    }

    if (remainingQuestions > 0) {
      const suggestedQuestions = Math.min(Math.max(remainingQuestions, 10), 20);
      return {
        title: `Bugün ${suggestedQuestions} soru + 1 konu tekrarı`,
        detail: wrongCount > 0
          ? `${wrongCount} yanlışın var. Önce kısa tekrar, sonra hedefini tamamlayacak mini test iyi gider.`
          : 'Hedefe düzenli ilerlemek için kısa bir konu okuması ve mini test yeterli.',
        action: 'Teste Başla',
        to: '/dashboard/exams',
        icon: Target,
        tone: 'success',
      };
    }

    if (wrongCount > 0) {
      return {
        title: 'Bugün yanlışlarını temizle',
        detail: 'Günlük hedef tamam. Şimdi zorlandığın konuları tekrar edip bir deneme daha çözebilirsin.',
        action: 'İstatistiklere Git',
        to: '/dashboard/stats',
        icon: RefreshCcw,
        tone: 'warning',
      };
    }

    return {
      title: 'Bugün hafif tekrar yeterli',
      detail: 'Hedef tamam ve performans iyi görünüyor. Kısa ders tekrarıyla ritmi koru.',
      action: 'Derslere Git',
      to: '/dashboard/lessons',
      icon: BookOpen,
      tone: 'accent',
    };
  })();

  const recommendationTone = {
    primary: 'border-primary/20 bg-primary/10 text-primary-light',
    success: 'border-success/20 bg-success/10 text-success',
    warning: 'border-warning/20 bg-warning/10 text-warning',
    accent: 'border-accent/20 bg-accent/10 text-accent-light',
  }[recommendation.tone];

  const recommendationBorderMobile = {
    primary: 'border-primary/20',
    success: 'border-success/20',
    warning: 'border-warning/20',
    accent: 'border-accent/20',
  }[recommendation.tone];

  const recommendationColorMobile = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    accent: 'text-accent-light',
  }[recommendation.tone];

  const recommendationBgMobile = {
    primary: 'bg-primary/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    accent: 'bg-accent/10',
  }[recommendation.tone];

  const quoteText = limitQuoteText(quote?.text || 'Bugün kısa bir tekrar, yarın daha sakin bir sınav.');
  const quoteAuthor = quote?.author || 'Ehliyet Yolu';
  const quoteDuration = `${Math.max(22, Math.min(58, Math.round(quoteText.length / 7)))}s`;

  // Dairesel SVG İlerleme değerleri
  const radius = 26;
  const strokeWidth = 5.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dailyProgress / 100) * circumference;

  // Mobil kategori ilerleme hesaplayıcı
  const getCategoryProgressPercent = (catId) => {
    if (allCategories.length === 0) return 0;
    const target = allCategories.find(c => c._id === catId);
    if (!target) return 0;

    // Eğer kategorinin doğrudan içeriği varsa
    if (target.content && target.content.trim().length > 0) {
      return completedIds.includes(catId) ? 100 : 0;
    }

    // Alt dalları bul
    const getDescendantIds = (parentId) => {
      const children = allCategories.filter(c => {
        const pId = c.parent?._id || c.parent;
        return pId === parentId;
      });
      let desc = [...children];
      children.forEach(child => {
        desc = [...desc, ...getDescendantIds(child._id)];
      });
      return desc.map(d => d._id);
    };

    const descendantIds = getDescendantIds(catId);
    const contentDescendants = allCategories.filter(c => descendantIds.includes(c._id) && c.content && c.content.trim().length > 0);
    if (contentDescendants.length === 0) {
      return completedIds.includes(catId) ? 100 : 0;
    }

    const completedDescendants = contentDescendants.filter(c => completedIds.includes(c._id)).length;
    return Math.round((completedDescendants / contentDescendants.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Dashboard hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      {/* Notifications Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={handleCloseNotifications}
      />

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* DESKTOP VIEW (UNCHANGED) */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block space-y-4 pb-20 sm:space-y-6 sm:pb-24">
        {isMockMode && mainCategories.length === 0 && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/10 p-3"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-[11px] font-bold uppercase leading-relaxed tracking-wider text-warning">
              Backend verisi bulunamadı veya bağlantı yok. Admin panelden kategori eklemelisiniz.
            </p>
          </Motion.div>
        )}

        <Motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-white/[0.035] to-accent/10 py-3"
        >
          <div
            className="quote-marquee-track flex w-max items-center whitespace-nowrap"
            style={{ '--quote-duration': quoteDuration }}
          >
            {[0, 1].map((item) => (
              <div key={item} className="flex items-center gap-3 px-10">
                <Sparkles className="h-4 w-4 text-primary-light" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-light">Günün Sözü</span>
                <span className="text-sm font-bold text-white sm:text-base">
                  {quoteText}
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-text-muted">
                  {quoteAuthor}
                </span>
              </div>
            ))}
          </div>
        </Motion.div>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_18%_15%,rgba(99,102,241,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025)_52%,rgba(6,182,212,0.08))] p-4 shadow-xl shadow-black/10 sm:p-5 lg:p-6"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-[80px]" />
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary-light" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-light">
                    Öğrenci Paneli
                  </span>
                </div>
                <h1 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Merhaba {user?.firstName || 'sürücü adayı'}
                </h1>
                <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-text-secondary">
                  Bugünkü hedefin, aktif paketin ve sınav hazırlığın tek ekranda. Önce kısa planı tamamla, sonra denemeye geç.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link
                  to="/dashboard/exams"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition hover:bg-primary-light"
                >
                  <PlayCircle className="h-4 w-4" />
                  Test Çöz
                </Link>
                <Link
                  to="/dashboard/lessons"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-white/10"
                >
                  <BookOpen className="h-4 w-4 text-accent-light" />
                  Dersler
                </Link>
              </div>
            </div>

            <div className="relative z-10 mt-5 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 md:col-span-2 xl:col-span-1">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <ShieldCheck className="h-4 w-4 text-primary-light" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Aktif Paket</p>
                      <p className="mt-1 truncate text-sm font-black text-white">{selectedPackage}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-text-muted">
                        {dailyPlan?.primaryAction?.label || 'Bugünkü plana devam et'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Toplam Sınav</p>
                      <p className="mt-1 text-2xl font-black text-white">{stats?.totalExams || 0}</p>
                    </div>
                    <ClipboardList className="h-5 w-5 text-primary-light" />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-text-muted">Çözdüğün deneme sayısı</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Doğru Cevap</p>
                      <p className="mt-1 text-2xl font-black text-white">{stats?.totalCorrect || 0}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-text-muted">Tüm sınavlardaki doğru</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Seri</p>
                      <p className="mt-1 text-2xl font-black text-white">
                        {stats?.streak || 0}
                        <span className="text-sm font-black text-text-muted"> gün</span>
                      </p>
                    </div>
                    <CalendarDays className="h-5 w-5 text-warning" />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-text-muted">Düzenli çalışma takibi</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Bugünkü Soru</p>
                      <p className="mt-1 text-2xl font-black text-white">
                        {todayQuestions}
                        <span className="text-sm font-black text-text-muted">/{dailyGoal}</span>
                      </p>
                    </div>
                    <Activity className="h-5 w-5 text-accent-light" />
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dailyProgress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-text-muted">
                    {remainingQuestions === 0 ? 'Bugünkü hedef tamamlandı.' : `${remainingQuestions} soru daha çözmen yeterli.`}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Seviye</p>
                      <p className="mt-1 text-2xl font-black text-white">{level}</p>
                    </div>
                    <Star className="h-5 w-5 text-warning" />
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-warning to-primary-light"
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-text-muted">{totalScore} XP</p>
                </div>

                <div className={`rounded-2xl border p-4 ${
                  examCountdown
                    ? examCountdown.isPast
                      ? 'border-danger/20 bg-danger/10'
                      : 'border-success/20 bg-success/10'
                    : 'border-white/10 bg-black/20'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sınav</p>
                      <p className="mt-1 text-2xl font-black text-white">
                        {examCountdown ? (examCountdown.isToday ? 0 : examCountdown.days) : '-'}
                        <span className="text-sm font-black text-text-muted"> gün</span>
                      </p>
                    </div>
                    <CalendarDays className="h-5 w-5 text-success" />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-text-muted">
                    {examCountdown?.formatted || 'Tarih eklenmedi'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-4">
              <div className="grid gap-3 md:grid-cols-3">
                {actionCards.map((card) => (
                  <Link
                    key={card.to}
                    to={card.to}
                    className={`group flex min-h-[92px] items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-br ${card.tone} p-4 transition hover:-translate-y-0.5 hover:border-primary/30`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                        <card.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black tracking-tight text-white">{card.label}</h3>
                        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-text-muted">{card.text}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                ))}
              </div>
            </div>
          </Motion.div>

          <Motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-success">Bugünkü Plan</p>
                <h2 className="mt-2 text-xl font-black tracking-tight">Çalışma Sırası</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-success/20 bg-success/10">
                <Target className="h-5 w-5 text-success" />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${recommendationTone}`}>
                  {React.createElement(recommendation.icon, { className: 'h-5 w-5' })}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Bugün Ne Yapmalıyım?</p>
                  <h3 className="mt-1 text-base font-black leading-tight text-white">{recommendation.title}</h3>
                  <p className="mt-2 line-clamp-3 text-xs font-semibold leading-relaxed text-text-muted">{recommendation.detail}</p>
                </div>
              </div>
              {recommendation.to ? (
                <Link
                  to={recommendation.to}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
                >
                  {recommendation.action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={recommendation.onClick}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-light transition hover:bg-primary/20"
                >
                  {recommendation.action}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className={`mt-3 rounded-2xl border p-3 ${
              reviewDue.count > 0
                ? 'border-primary/20 bg-primary/10'
                : 'border-white/10 bg-black/20'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                  reviewDue.count > 0
                    ? 'border-primary/20 bg-primary/10 text-primary-light'
                    : 'border-white/10 bg-white/5 text-text-muted'
                }`}>
                  <RefreshCcw className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-black uppercase tracking-widest text-primary-light">Bugün Çözülecek Yanlışlar</p>
                  <p className="mt-1 truncate text-xs font-semibold text-text-muted">
                    {reviewDue.count > 0 ? `${reviewDue.count} soru tekrar bekliyor.` : 'Bugün yeniden çözmen gereken soru yok.'}
                  </p>
                </div>
                <Link
                  to={reviewDue.count > 0 ? '/dashboard/exams/wrong-review' : '/dashboard/exams'}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/10"
                >
                  {reviewDue.count > 0 ? 'Çöz' : 'Test'}
                </Link>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              {studyPlan.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.025] p-3 transition hover:bg-white/[0.045]">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.done ? 'bg-success/10 text-success' : 'bg-white/5 text-text-muted'}`}>
                    {item.done ? <CheckCircle2 className="h-5 w-5" /> : React.createElement(item.icon, { className: 'h-5 w-5' })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-white">{item.label}</p>
                    <p className="truncate text-xs font-semibold text-text-muted">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Motion.aside>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Eğitim Paketi</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                {!user?.selectedCategoryId ? 'Sınıfını seçerek başla' : user.selectedCategoryName}
              </h2>
            </div>
            {user?.selectedCategoryId && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-widest text-text-secondary transition hover:border-primary/30 hover:bg-primary/10 hover:text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Sınıfı Değiştir
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!user?.selectedCategoryId ? (
              <Motion.div
                key="empty-category"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-14 text-center"
              >
                <ShieldCheck className="mx-auto mb-5 h-14 w-14 text-primary-light" />
                <h3 className="text-xl font-black text-white">Eğitim sınıfı seçilmedi</h3>
                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-text-secondary">
                  Dersler, sınavlar ve hedefler seçtiğin ehliyet sınıfına göre kişiselleştirilecek.
                </p>
                <button onClick={() => setShowCategoryModal(true)} className="btn-primary mt-6 px-8 py-3">
                  Sınıf Seç
                </button>
              </Motion.div>
            ) : (
              <Motion.div
                key="selected-category"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="grid grid-cols-1 gap-5 rounded-[1.75rem] border border-primary/25 bg-gradient-to-br from-primary/10 to-white/[0.02] p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-2xl shadow-primary/25 sm:h-20 sm:w-20 sm:rounded-3xl">
                    <ShieldCheck className="h-10 w-10 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-black tracking-tight sm:text-3xl">{user.selectedCategoryName}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                        <BookOpen className="h-3.5 w-3.5 text-primary-light" />
                        {subCategories.length} Eğitim Konusu
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-warning">
                        <Star className="h-3.5 w-3.5" />
                        MEB Uyumlu
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-widest transition hover:bg-white/10"
                >
                  <Settings2 className="h-5 w-5 text-primary-light" />
                  Düzenle
                </button>
              </Motion.div>
            )}
          </AnimatePresence>
        </section>

        <AnimatePresence>
          {user?.selectedCategoryId && subCategories.length > 0 && (
            <Motion.section
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
                  <LayoutGrid className="h-5 w-5 text-accent-light" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent-light">Müfredat</p>
                  <h2 className="text-2xl font-black tracking-tight">Kategori Konuları</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {subCategories.map((category, index) => (
                  <Motion.div
                    key={category._id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      to={`/dashboard/lessons?category=${category._id}`}
                      className="group relative flex h-full min-h-56 flex-col rounded-2xl border border-white/5 bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-primary/25 hover:bg-primary/5"
                    >
                      {category.image ? (
                        <div className="mb-5 h-28 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                          <img
                            src={resolveMediaUrl(category.image)}
                            alt={category.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="mb-6 flex items-start justify-between gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <BookOpen className="h-6 w-6 text-primary-light" />
                          </div>
                          <ArrowRight className="h-5 w-5 text-text-muted transition group-hover:translate-x-1 group-hover:text-primary-light" />
                        </div>
                      )}
                      {category.image && (
                        <ArrowRight className="absolute right-5 top-5 h-5 w-5 text-white/70 drop-shadow transition group-hover:translate-x-1 group-hover:text-white" />
                      )}
                      <h4 className="text-lg font-black leading-tight tracking-tight transition group-hover:text-primary-light">
                        {category.name}
                      </h4>
                      <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-text-muted">
                        {category.description || 'Bu ders için hazırlanan özel eğitim müfredatı.'}
                      </p>
                      <div className="mt-auto border-t border-white/5 pt-4">
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {category.content ? 'Ders İçeriği Hazır' : 'Okuma Materyali'}
                        </span>
                      </div>
                    </Link>
                  </Motion.div>
                ))}
              </div>
            </Motion.section>
          )}

          {user?.selectedCategoryId && subCategories.length === 0 && (
            <Motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-14 text-center"
            >
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-text-muted opacity-50" />
              <p className="font-bold text-text-muted">Bu sınıfa ait çalışma konusu henüz eklenmemiş.</p>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-text-muted">Lütfen daha sonra tekrar kontrol edin.</p>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* MOBILE VIEW (FLUTTER DASHBOARD STYLE) */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden space-y-4 pb-24 px-1 sm:px-2">
        {/* Header (Flutter style) */}
        <div className="flex items-center justify-between py-3 px-1">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/settings"
              className="h-11 w-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-black/20"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-white text-base">
                  {user?.firstName?.charAt(0) || 'Ö'}
                </span>
              )}
            </Link>
            <Link to="/dashboard/settings" className="block text-left">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none">Merhaba,</p>
              <h2 className="text-base font-black text-white truncate mt-1 leading-none">
                {user?.firstName || 'Sürücü Adayı'}
              </h2>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/5 text-text-muted hover:text-white"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-danger text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-bg-dark animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Günün Sözü (Flutter scrolling text format) */}
        {quote && (
          <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-bg-card p-3 flex items-center shadow-lg shadow-black/10">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/15 mr-3 shrink-0">
              <Quote className="h-4 w-4 text-primary-light" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden relative">
              <div
                className="quote-marquee-track flex w-max items-center whitespace-nowrap"
                style={{ '--quote-duration': quoteDuration }}
              >
                {[0, 1].map((item) => (
                  <div key={item} className="flex items-center gap-3 px-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-light italic">Günün Sözü:</span>
                    <span className="text-xs font-bold text-white/90 italic">
                      "{quoteText}"
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                      {quoteAuthor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bugünün Görevi (Daily Action Panel) */}
        <div className="w-full p-4 rounded-3xl border border-white/5 bg-gradient-to-br from-[#21183e] to-[#101827] shadow-xl shadow-black/15">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <span className={`inline-flex px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wide ${
                todayQuestions >= dailyGoal
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-primary/10 border-primary/20 text-primary-light'
              }`}>
                {todayQuestions >= dailyGoal ? 'Günlük hedef tamamlandı' : 'Bugünkü görev'}
              </span>
              <h3 className="text-xl font-black text-white mt-3 leading-snug tracking-tight">
                {dailyPlan?.title || (todayQuestions >= dailyGoal ? 'Serini korudun, şimdi pekiştir.' : 'Bugünkü Testi Çöz')}
              </h3>
              <p className="text-xs font-semibold text-text-muted mt-1.5 leading-relaxed">
                {dailyPlan?.subtitle || (todayQuestions >= dailyGoal ? 'Yanlışlarını azaltmak için kısa bir tekrar iyi gider.' : `${remainingQuestions} soru daha çözerek günlük hedefini tamamla.`)}
              </p>
            </div>

            <div className="relative shrink-0 flex items-center justify-center w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke={todayQuestions >= dailyGoal ? "#10b981" : "#6366f1"}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm font-black text-white leading-none">{todayQuestions}</span>
                <span className="text-[9px] font-bold text-text-muted mt-0.5 leading-none">/{dailyGoal}</span>
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <div
              onClick={() => navigate('/dashboard/exams')}
              className="flex items-center justify-center gap-2 h-10 px-2.5 rounded-2xl bg-warning/10 border border-warning/15 cursor-pointer hover:bg-warning/20 transition-all"
            >
              <Flame className="w-4 h-4 text-warning" />
              <span className="text-xs font-black text-white truncate">
                {stats?.streak > 0 ? `${stats.streak} gün seri` : 'Seriyi başlat'}
              </span>
            </div>
            <div
              onClick={() => wrongCount > 0 ? navigate('/dashboard/exams?tab=wrong_answers') : navigate('/dashboard/exams')}
              className={`flex items-center justify-center gap-2 h-10 px-2.5 rounded-2xl cursor-pointer hover:bg-opacity-20 transition-all ${
                wrongCount > 0 ? 'bg-danger/10 border border-danger/15' : 'bg-success/10 border border-success/15'
              }`}
            >
              <AlertCircle className={`w-4 h-4 ${wrongCount > 0 ? 'text-danger' : 'text-success'}`} />
              <span className="text-xs font-black text-white truncate">
                {wrongCount > 0 ? `${wrongCount} yanlış` : 'Yanlış yok'}
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => {
              const actionType = dailyPlan?.primaryAction?.type || 'short_test';
              if (actionType === 'select_category') setShowCategoryModal(true);
              else navigate(dailyPlan?.primaryAction?.target || planRouteByAction[actionType] || '/dashboard/exams');
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent font-black text-xs uppercase tracking-widest text-white mt-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
          >
            <Play className="w-4 h-4" />
            {dailyPlan?.primaryAction?.label || 'Hızlı Teste Başla'}
          </button>
        </div>

        {/* Smart Guidance (Kişisel Yönlendirme) */}
        {recommendation && (
          <div className={`p-4 rounded-3xl border ${recommendationBorderMobile} bg-bg-card flex items-center justify-between shadow-lg shadow-black/10`}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${recommendationBgMobile}`}>
                {React.createElement(recommendation.icon, { className: `w-5 h-5 ${recommendationColorMobile}` })}
              </div>
              <div className="min-w-0 pr-2">
                <h4 className="text-sm font-black text-white leading-snug truncate">{recommendation.title}</h4>
                <p className="text-xs text-text-muted mt-1 leading-normal line-clamp-1">{recommendation.detail}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (recommendation.onClick) recommendation.onClick();
                else if (recommendation.to) navigate(recommendation.to);
              }}
              className={`px-4 py-2 border ${recommendationBorderMobile} ${recommendationBgMobile} ${recommendationColorMobile} rounded-xl text-[11px] font-black uppercase shrink-0 active:scale-95 transition-all`}
            >
              {recommendation.action}
            </button>
          </div>
        )}

        {/* Sınav Tarihi Kartı */}
        <div
          onClick={() => navigate('/dashboard/settings')}
          className="p-4 rounded-3xl border border-accent/15 bg-bg-card flex items-center justify-between shadow-lg shadow-black/10 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-accent-light" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white leading-snug">
                {examCountdown ? (examCountdown.isPast ? 'Sınav tarihin geçti' : 'Sınava kalan süre') : 'Sınav tarihini ekle'}
              </h4>
              <p className="text-xs text-text-muted mt-0.5 leading-normal">
                {examCountdown ? `Planın ${examCountdown.formatted} tarihine göre hazırlanıyor.` : 'Kalan süreyi ana sayfada takip et.'}
              </p>
            </div>
          </div>
          <span className="px-3.5 py-2 rounded-xl bg-accent/15 border border-accent/25 text-accent-light text-xs font-black shrink-0">
            {examCountdown ? (examCountdown.isToday ? 'Bugün' : `${examCountdown.days} gün`) : 'Ayarla'}
          </span>
        </div>

        {/* Devam Et Kartı */}
        {lastVisitedId && lastVisitedName && (
          <div
            onClick={() => navigate(`/dashboard/lessons?category=${lastVisitedId}`)}
            className="p-4 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/5 flex items-center justify-between shadow-lg shadow-black/10 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                <PlayCircle className="w-5 h-5 text-primary-light animate-pulse" />
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest leading-none">Kaldığın Yerden Devam Et</p>
                <h4 className="text-sm font-black text-white truncate mt-1 leading-none">{lastVisitedName}</h4>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-primary-light shrink-0" />
          </div>
        )}

        {/* Öğrenme Alanı (Learning Hub) */}
        <div className="grid grid-cols-3 gap-2.5">
          <div
            onClick={() => navigate('/dashboard/lessons')}
            className="p-3 bg-bg-card rounded-2xl border border-primary/10 shadow-lg shadow-black/10 flex flex-col items-start h-24 justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-primary-light" />
            </div>
            <div className="text-left w-full min-w-0">
              <h4 className="text-xs font-black text-white leading-none">Konu Oku</h4>
              <p className="text-[9px] font-bold text-text-muted truncate mt-1.5 leading-none">{selectedPackage}</p>
            </div>
          </div>
          <div
            onClick={() => navigate('/dashboard/traffic-signs')}
            className="p-3 bg-bg-card rounded-2xl border border-accent/10 shadow-lg shadow-black/10 flex flex-col items-start h-24 justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <AlertCircle className="w-4.5 h-4.5 text-accent-light" />
            </div>
            <div className="text-left w-full min-w-0">
              <h4 className="text-xs font-black text-white leading-none">Levhalar</h4>
              <p className="text-[9px] font-bold text-text-muted truncate mt-1.5 leading-none">Trafik İşaretleri</p>
            </div>
          </div>
          <div
            onClick={() => navigate('/dashboard/videos')}
            className="p-3 bg-bg-card rounded-2xl border border-warning/10 shadow-lg shadow-black/10 flex flex-col items-start h-24 justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
              <PlayCircle className="w-4.5 h-4.5 text-warning" />
            </div>
            <div className="text-left w-full min-w-0">
              <h4 className="text-xs font-black text-white leading-none">Video</h4>
              <p className="text-[9px] font-bold text-text-muted truncate mt-1.5 leading-none">Görsel Anlatım</p>
            </div>
          </div>
        </div>

        {/* Konu Anlatımları Başlığı */}
        <div className="p-3.5 bg-bg-card border border-white/5 rounded-3xl flex items-center justify-between shadow-lg shadow-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <BookOpen className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black text-white leading-none">Konu Anlatımları</h4>
              <p className="text-[10px] font-bold text-text-muted mt-1 leading-none">{selectedPackage}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3 py-1.5 bg-primary/10 border border-primary/25 rounded-xl text-[10px] font-black text-primary-light uppercase shrink-0 active:scale-95 transition-transform flex items-center gap-1"
          >
            <RefreshCcw className="w-3 h-3" /> Değiştir
          </button>
        </div>

        {/* Konular Listesi Grid (curriculum) */}
        {!user?.selectedCategoryId ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-10 text-center">
            <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-primary-light" />
            <h3 className="text-lg font-black text-white">Eğitim sınıfı seçilmedi</h3>
            <p className="mx-auto mt-1.5 max-w-xs text-xs font-medium leading-relaxed text-text-secondary">
              Müfredat konularını görebilmek için lütfen ehliyet sınıfı seçiminizi yapınız.
            </p>
            <button onClick={() => setShowCategoryModal(true)} className="mt-4 px-6 py-2.5 bg-primary rounded-xl font-bold text-xs uppercase text-white tracking-widest">
              Sınıf Seç
            </button>
          </div>
        ) : subCategories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-10 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-text-muted opacity-50" />
            <p className="font-bold text-text-muted text-sm">Bu sınıfa ait çalışma konusu henüz eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {subCategories.map((category) => {
              const catColor = getCategoryColor(category.name);
              const catIcon = getCategoryIcon(category.name);
              const progress = getCategoryProgressPercent(category._id);
              const isCompleted = progress >= 100;
              const statusText = isCompleted ? 'Tamamlandı' : progress > 0 ? 'Devam et' : 'Başla';

              return (
                <Link
                  key={category._id}
                  to={`/dashboard/lessons?category=${category._id}`}
                  className="group relative flex flex-col justify-between h-44 rounded-3xl border border-white/5 bg-bg-card p-4 shadow-lg shadow-black/10 overflow-hidden text-left hover:-translate-y-0.5 transition-transform"
                >
                  {/* Top colored stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: catColor }}
                  />

                  {/* Watermark Icon */}
                  <div className="absolute -right-5 -bottom-5 text-white pointer-events-none opacity-[0.03] scale-[2.2]">
                    {React.createElement(catIcon, { size: 100 })}
                  </div>

                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${catColor}15`,
                        borderColor: `${catColor}30`,
                        color: catColor
                      }}
                    >
                      {React.createElement(catIcon, { className: "w-5 h-5" })}
                    </div>

                    {category.isPro && (
                      <span className="px-1.5 py-0.5 bg-warning/15 border border-warning/20 text-warning rounded text-[8px] font-black uppercase">PRO</span>
                    )}
                  </div>

                  {/* Title & description */}
                  <div className="mt-3 flex-1 min-w-0">
                    <h5 className="text-sm font-black text-white leading-snug line-clamp-2">
                      {category.name}
                    </h5>
                  </div>

                  {/* Bottom progress layout */}
                  <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider mb-1.5">
                      <span
                        className="px-1.5 py-0.5 rounded-lg"
                        style={{
                          backgroundColor: `${catColor}15`,
                          color: catColor
                        }}
                      >
                        {statusText}
                      </span>
                      <span style={{ color: catColor }}>%{progress}</span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: catColor,
                          width: `${progress}%`
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <CategorySelectorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />
    </div>
  );
};

export default UserHome;
