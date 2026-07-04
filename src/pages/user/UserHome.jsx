import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
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
  Play,
  Sun,
  Moon,
  Lock,
  Monitor
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import CategorySelectorModal from '../../components/user/CategorySelectorModal';
import NotificationPanel from '../../components/user/NotificationPanel';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { isVideoRecord, limitQuoteText } from '../../utils/categoryContent';
import { getSignLibraryForCategoryName } from '../../data/signLibrariesData';
import { buildScopedStats } from '../../utils/scopedStats';
import {
  filterQuestionsToCategoryTree,
  hydrateWrongAnswers,
  normalizeId,
  readApiList,
} from '../../utils/wrongAnswers';

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
  const { themeMode, toggleThemeMode, isThemeLocked } = useOutletContext();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [quote, setQuote] = useState(null);
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
          const [statsRes, resultsRes, categoryRes] = await Promise.all([
            api.get('/exam-results/stats'),
            api.get('/exam-results?limit=500').catch(() => ({ data: [] })),
            user?.selectedCategoryId
              ? api.get('/categories/all').catch(() => ({ data: [] }))
              : Promise.resolve({ data: [] }),
          ]);
          if (statsRes.data && !statsRes.data.error) {
            const scoped = buildScopedStats({
              baseStats: statsRes.data,
              results: readApiList(resultsRes),
              categories: readApiList(categoryRes),
              selectedCategoryId: normalizeId(user?.selectedCategoryId),
            });
            setStats(scoped.stats);
            // Son 5 sınav sonucunu sidebar için kaydet
            setRecentResults(scoped.results.slice(0, 5));
          }
        } catch (err) {
          console.error('Stats error', err);
        }

        try {
          const planRes = await api.get('/stats/daily-plan', {
            params: {
              categoryId: user?.selectedCategoryId || undefined,
              categoryName: user?.selectedCategoryName || undefined,
            },
          });
          const planData = planRes.data?.data || planRes.data;
          setDailyPlan(planData?.tasks ? planData : null);
        } catch (err) {
          console.error('Daily plan error', err);
          setDailyPlan(null);
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
          const [reviewRes, categoryRes] = await Promise.all([
            api.get('/wrong-answers/review-due?limit=100'),
            user?.selectedCategoryId
              ? api.get('/categories/all').catch(() => ({ data: [] }))
              : Promise.resolve({ data: [] }),
          ]);
          const reviewItems = readApiList(reviewRes);
          const hydrated = await hydrateWrongAnswers(api, reviewItems);
          const scoped = filterQuestionsToCategoryTree(
            hydrated,
            readApiList(categoryRes),
            normalizeId(user?.selectedCategoryId),
          );
          setReviewDue({
            count: scoped.length,
            items: scoped.slice(0, 3),
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
  }, [user?.selectedCategoryId, user?.selectedCategoryName]);

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
  const signLibrary = useMemo(
    () => getSignLibraryForCategoryName(user?.selectedCategoryName),
    [user?.selectedCategoryName]
  );

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
      label: signLibrary.title,
      text: `${signLibrary.shortTitle} levhalarını kategori kategori tekrar et.`,
      tone: 'from-accent/15 to-white/[0.02]',
    },
    {
      to: '/dashboard/videos',
      icon: PlayCircle,
      label: 'Video Dersler',
      text: 'Online video anlatımlarını kategori kategori izle.',
      tone: 'from-warning/15 to-primary/10',
    },
  ]), [signLibrary.shortTitle, signLibrary.title]);

  const wrongCount = stats?.totalWrong || stats?.wrongCount || 0;
  const desktopSummaryCards = [
    { label: 'Bugünkü Hedef', value: `${todayQuestions}/${dailyGoal}`, helper: remainingQuestions === 0 ? 'Tamamlandı' : `${remainingQuestions} soru kaldı`, icon: Target, tone: 'text-primary-light bg-primary/10 border-primary/20' },
    { label: 'Başarı', value: `%${stats?.successRate || 0}`, helper: `${stats?.totalExams || 0} test sonucu`, icon: CheckCircle2, tone: 'text-success bg-success/10 border-success/20' },
    { label: 'Yanlışlar', value: reviewDue.count || wrongCount || 0, helper: reviewDue.count > 0 ? 'Bugün tekrar et' : 'Takipte soru', icon: RefreshCcw, tone: 'text-warning bg-warning/10 border-warning/20' },
    { label: 'Seviye', value: level, helper: `${totalScore} XP`, icon: Star, tone: 'text-accent-light bg-accent/10 border-accent/20' },
  ];

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
      {/* DESKTOP VIEW */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DESKTOP VIEW — Premium Redesign                                         */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-full pb-10">
        <div className="mx-auto max-w-[1440px] space-y-5">

          {/* ── Row 1: Welcome Banner + Metric Cards ── */}
          <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0f1322] via-[#0c0f1c] to-[#070b14] p-6 shadow-2xl shadow-black/40"
          >
            {/* Ambient glows */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/8 blur-[100px]" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-accent/5 blur-[80px]" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              {/* Left: greeting */}
              <div className="min-w-0">
                {user?.isGuest ? (
                  /* ── GUEST greeting ── */
                  <>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-warning/25 bg-warning/10 px-3 py-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-warning" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-warning">Misafir Modu</span>
                    </div>
                    <h1 className="text-3xl font-black leading-tight tracking-tight text-white xl:text-4xl">
                      Hoş geldiniz! <span className="bg-gradient-to-r from-warning to-accent-light bg-clip-text text-transparent">Ücretsiz dene 👋</span>
                    </h1>
                    <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-text-muted">
                      4 ücretsiz test çözdükten sonra tam erişim için üye olun. İlerlemeniz, yanlışlarınız ve istatistikleriniz sizi bekliyor.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => { logout(); navigate('/register'); }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/25 transition hover:opacity-90 active:scale-95"
                      >
                        <Zap className="h-4 w-4" />
                        Ücretsiz Üye Ol
                      </button>
                      <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/[0.08]"
                      >
                        <Lock className="h-4 w-4 text-text-muted" />
                        Giriş Yap
                      </button>
                      <Link to="/dashboard/exams" className="inline-flex items-center gap-2 rounded-2xl border border-warning/20 bg-warning/10 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-warning transition hover:bg-warning/20 active:scale-95">
                        <PlayCircle className="h-4 w-4" />
                        Teste Başla
                      </Link>
                    </div>
                  </>
                ) : (
                  /* ── MEMBER greeting ── */
                  <>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary-light" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-light">{selectedPackage}</span>
                    </div>
                    <h1 className="text-3xl font-black leading-tight tracking-tight text-white xl:text-4xl">
                      Merhaba, <span className="bg-gradient-to-r from-primary-light to-accent-light bg-clip-text text-transparent">{user?.firstName || 'Sürücü Adayı'}</span> 👋
                    </h1>
                    <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-text-muted">
                      {recommendation.detail || 'Bugünkü çalışma planın hazır. Hedefini tamamla ve sınavına bir adım daha yaklaş.'}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link to="/dashboard/exams" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/40 active:scale-95">
                        <PlayCircle className="h-4 w-4" />
                        Teste Başla
                      </Link>
                      <Link to="/dashboard/lessons" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/[0.08]">
                        <BookOpen className="h-4 w-4 text-accent-light" />
                        Ders Oku
                      </Link>
                      {reviewDue.count > 0 && (
                        <Link to="/dashboard/exams/wrong-review" className="inline-flex items-center gap-2 rounded-2xl border border-warning/25 bg-warning/10 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-warning transition hover:bg-warning/20 active:scale-95">
                          <RefreshCcw className="h-4 w-4" />
                          {reviewDue.count} Yanlış Bekliyor
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right: 4 metric cards (members) OR feature list (guests) */}
              {user?.isGuest ? (
                <div className="shrink-0 xl:w-[420px]">
                  <div className="rounded-2xl border border-warning/10 bg-warning/[0.04] p-5">
                    <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-warning/70">Üye olunca erişilir</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Activity,       label: 'Kişisel İstatistikler',   detail: 'Başarı, seri, grafik' },
                        { icon: RefreshCcw,     label: 'Yanlış Takip Sistemi',    detail: 'Akıllı tekrar algoritması' },
                        { icon: Star,           label: 'XP & Rozet Sistemi',      detail: 'Seviye atlayarak kazan' },
                        { icon: GraduationCap,  label: 'Sınırsız Test',           detail: 'Tüm kısa test ve sınavlar' },
                      ].map(({ icon: Icon, label, detail }) => (
                        <div key={label} className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                            <Icon className="h-3.5 w-3.5 text-primary-light" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white leading-tight">{label}</p>
                            <p className="mt-0.5 text-[9px] font-semibold text-text-muted">{detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid shrink-0 grid-cols-2 gap-3 xl:w-[420px] xl:grid-cols-2">
                  {desktopSummaryCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={`group rounded-2xl border bg-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04] ${item.tone.split(' ').find(c => c.startsWith('border')) || 'border-white/10'}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${item.tone}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">{item.label}</p>
                        </div>
                        <p className="text-2xl font-black leading-none text-white">{item.value}</p>
                        <p className="mt-1.5 text-[10px] font-semibold text-text-muted">{item.helper}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* XP + Daily Progress inline bar */}
            <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
              {/* Günlük hedef */}
              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Target className="h-4 w-4 text-primary-light" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Günlük Hedef</p>
                    <span className={`text-[10px] font-black ${dailyProgress >= 100 ? 'text-success' : 'text-primary-light'}`}>
                      {todayQuestions}/{dailyGoal} • %{dailyProgress}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dailyProgress}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className={`h-full rounded-full ${dailyProgress >= 100 ? 'bg-success' : 'bg-gradient-to-r from-primary to-accent'}`}
                    />
                  </div>
                </div>
              </div>
              {/* XP / Seviye */}
              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-warning/20 bg-warning/10">
                  <Star className="h-4 w-4 text-warning" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Seviye {level}</p>
                    <span className="text-[10px] font-black text-warning">{totalScore} XP • %{levelProgress}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-warning to-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>

          {/* ── Row 2: Main 3-column grid ── */}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_300px]">

            {/* Col 1: Today's plan + curriculum */}
            <div className="space-y-4">

              {/* Bugünkü Plan */}
              <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0f1322] to-[#0a0d16] p-5 shadow-xl shadow-black/25">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${recommendationTone}`}>
                      {React.createElement(recommendation.icon, { className: 'h-4.5 w-4.5' })}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-success">Bugünkü Plan</p>
                      <h2 className="mt-0.5 text-base font-black tracking-tight text-white">{recommendation.title}</h2>
                    </div>
                  </div>
                  {recommendation.to ? (
                    <Link to={recommendation.to} className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary-light transition hover:bg-primary/20">
                      {recommendation.action} <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <button type="button" onClick={recommendation.onClick} className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary-light transition hover:bg-primary/20">
                      {recommendation.action} <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {studyPlan.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${item.done ? 'border-success/15 bg-success/5' : 'border-white/[0.06] bg-white/[0.015]'}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${item.done ? 'border-success/20 bg-success/10 text-success' : 'border-white/10 bg-white/[0.03] text-text-muted'}`}>
                          {item.done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-xs font-black ${item.done ? 'text-text-muted line-through' : 'text-white'}`}>{item.label}</p>
                          <p className="mt-0.5 truncate text-[10px] font-semibold text-text-muted">{item.detail}</p>
                        </div>
                        {item.done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hızlı Erişim */}
              <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0f1322] to-[#0a0d16] p-5 shadow-xl shadow-black/25">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-accent-light">Hızlı Erişim</p>
                <div className="grid grid-cols-2 gap-3">
                  {actionCards.map((card) => (
                    <Link
                      key={card.to}
                      to={card.to}
                      className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all hover:border-white/15 hover:bg-white/[0.05] hover:-translate-y-0.5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                        <card.icon className="h-4.5 w-4.5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white">{card.label}</p>
                        <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-text-muted">{card.text}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-muted/50 transition group-hover:translate-x-0.5 group-hover:text-white" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 2: Curriculum */}
            <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0f1322] to-[#0a0d16] p-5 shadow-xl shadow-black/25">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Müfredat</p>
                <Link to="/dashboard/lessons" className="text-[10px] font-black uppercase tracking-widest text-text-muted transition hover:text-white">
                  Tümü →
                </Link>
              </div>
              {user?.selectedCategoryId && subCategories.length > 0 ? (
                <div className="space-y-2.5">
                  {subCategories.slice(0, 8).map((category) => {
                    const Icon = getCategoryIcon(category.name);
                    const accentColor = getCategoryColor(category.name);
                    return (
                      <Link
                        key={category._id}
                        to={`/dashboard/lessons?category=${category._id}`}
                        className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.015] px-3 py-2.5 transition hover:border-white/10 hover:bg-white/[0.04]"
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border"
                          style={{ borderColor: `${accentColor}30`, backgroundColor: `${accentColor}10`, color: accentColor }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-white">{category.name}</p>
                          {category.description && (
                            <p className="mt-0.5 truncate text-[10px] font-semibold text-text-muted">{category.description}</p>
                          )}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted/40 transition group-hover:translate-x-0.5 group-hover:text-white" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-12 text-center">
                  <ShieldCheck className="mb-3 h-10 w-10 text-primary-light/40" />
                  <p className="text-xs font-black text-text-muted">Kategori seçilmedi</p>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="mt-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-light transition hover:bg-primary/20"
                  >
                    Seç
                  </button>
                </div>
              )}
            </div>

            {/* Col 3: Sidebar widgets */}
            <div className="space-y-4">
              {/* Aktif Eğitim */}
              <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0f1322] to-[#0a0d16] p-4 shadow-xl shadow-black/25">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Aktif Eğitim</p>
                <h3 className="mt-1.5 text-base font-black text-white">{user?.selectedCategoryName || 'Seçilmedi'}</h3>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-light transition hover:bg-primary/20"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Değiştir
                </button>
              </div>

              {/* Sınav Geri Sayımı */}
              {examCountdown ? (
                <div className={`rounded-3xl border p-4 shadow-xl shadow-black/25 ${examCountdown.isPast ? 'border-danger/20 bg-danger/5' : 'border-success/15 bg-success/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${examCountdown.isPast ? 'border-danger/20 bg-danger/10 text-danger' : 'border-success/20 bg-success/10 text-success'}`}>
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">MEB E-Sınav</p>
                      <p className={`text-base font-black ${examCountdown.isPast ? 'text-danger' : 'text-white'}`}>
                        {examCountdown.isToday ? 'Bugün!' : examCountdown.isPast ? 'Geçti' : `${examCountdown.days} Gün`}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] font-semibold text-text-muted">{examCountdown.formatted}</p>
                </div>
              ) : (
                <Link to="/dashboard/settings" className="block rounded-3xl border border-dashed border-white/10 bg-white/[0.015] p-4 text-center transition hover:border-white/20">
                  <CalendarDays className="mx-auto mb-2 h-7 w-7 text-text-muted/40" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sınav tarihi ekle</p>
                </Link>
              )}

              {/* Son Sınavlarım */}
              {recentResults.length > 0 && (
                <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0f1322] to-[#0a0d16] p-4 shadow-xl shadow-black/25">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Son Sınavlar</p>
                    <Link to="/dashboard/stats" className="text-[10px] font-black uppercase tracking-widest text-primary-light transition hover:text-white">
                      Tümü →
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {recentResults.map((res, i) => (
                      <div key={res._id || i} className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.01] px-2.5 py-2">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-black ${res.passed ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                          {res.passed ? '✓' : '✗'}
                        </span>
                        <p className="min-w-0 flex-1 truncate text-[10px] font-bold text-white">
                          {res.examName || res.categoryName || 'Deneme'}
                        </p>
                        <span className={`shrink-0 text-[10px] font-black ${res.passed ? 'text-success' : 'text-danger'}`}>
                          %{res.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Günün Sözü — belirgin kart */}
              {quote && (
                <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/8 via-[#0f1322] to-[#0a0d16] p-5 shadow-xl shadow-black/30">
                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-[40px]" />
                  <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-primary/30 via-accent/20 to-transparent" />
                  {/* Header */}
                  <div className="relative mb-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-primary/25 bg-primary/15">
                      <Quote className="h-3.5 w-3.5 text-primary-light" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary-light">Günün Sözü</span>
                  </div>
                  {/* Quote text */}
                  <p className="relative text-sm font-semibold italic leading-relaxed text-white/90">
                    "{quoteText}"
                  </p>
                  {/* Author */}
                  <div className="relative mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3">
                    <div className="h-1 w-5 rounded-full bg-primary/40" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-light/70">{quoteAuthor}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>


      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* MOBILE VIEW (FLUTTER DASHBOARD STYLE) */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden space-y-4 pb-24 px-1 sm:px-2">
        {/* Header (Flutter style) */}
        <div className="flex items-center justify-between py-3 px-1">
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-white/10 active:bg-white/[0.05] pl-2 pr-4 py-1.5 rounded-2xl transition-all max-w-[75%] group"
          >
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-white text-base">
                    {user?.firstName?.charAt(0) || 'Ö'}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-primary text-white rounded-full flex items-center justify-center border border-bg-dark shadow-md">
                <Settings2 className="w-2.5 h-2.5" />
              </div>
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1 text-text-muted group-hover:text-primary transition-colors">
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">Profil & Ayarlar</p>
                <ChevronRight className="w-2.5 h-2.5" />
              </div>
              <h2 className="text-sm font-black text-white truncate mt-1 leading-none group-hover:text-primary-light transition-colors">
                {user?.firstName || 'Sürücü Adayı'}
              </h2>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Tema Değiştirici */}
            <div className="relative flex items-center">
              <button
                onClick={toggleThemeMode}
                className={`relative w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 border ${
                  isThemeLocked
                    ? 'bg-white/[0.02] border-border-color cursor-not-allowed opacity-60'
                    : themeMode === 'dark'
                      ? 'bg-[#2d2f4e]/80 border-primary/20 hover:border-primary/45'
                      : themeMode === 'system'
                        ? 'bg-teal-500/10 border-teal-500/25 hover:border-teal-500/45'
                        : 'bg-primary/10 border-primary/25 hover:border-primary/45'
                }`}
                title={isThemeLocked ? "Özel tema etkinken renk modu değiştirilemez" : "Temayı Değiştir (Koyu - Açık - Sistem)"}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                    isThemeLocked
                      ? 'translate-x-0 bg-text-muted/40'
                      : themeMode === 'dark'
                        ? 'translate-x-0 bg-gradient-to-r from-primary to-accent'
                        : themeMode === 'system'
                          ? 'translate-x-3.5 bg-gradient-to-r from-teal-500 to-indigo-400'
                          : 'translate-x-7 bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                >
                  {isThemeLocked ? (
                    <Lock className="w-2.5 h-2.5 text-text-muted" />
                  ) : themeMode === 'dark' ? (
                    <Moon className="w-2.5 h-2.5 text-white fill-white" />
                  ) : themeMode === 'system' ? (
                    <Monitor className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <Sun className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
              </button>
            </div>

            {/* Bildirimler */}
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

        {/* ── GUEST BANNER (mobile) ── */}
        {user?.isGuest && (
          <div className="relative overflow-hidden rounded-3xl border border-warning/20 bg-gradient-to-br from-warning/8 via-[#0f1322] to-[#0a0d16] p-5 shadow-xl shadow-black/30">
            {/* Glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-warning/10 blur-[50px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-warning/30 via-accent/15 to-transparent" />
            <div className="relative">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-xl border border-warning/25 bg-warning/10 px-2.5 py-1">
                <Sparkles className="h-3 w-3 text-warning" />
                <span className="text-[9px] font-black uppercase tracking-widest text-warning">Misafir Modu</span>
              </div>
              <h3 className="text-base font-black text-white leading-snug">
                Tüm özelliklere erişmek için <span className="text-warning">üye ol!</span>
              </h3>
              <p className="mt-1.5 text-[11px] font-semibold text-text-muted leading-relaxed">
                Yanlış takip, istatistik, rozet ve sınırsız test — hepsi ücretsiz kaydolunca açılır.
              </p>
              <div className="mt-4 flex gap-2.5">
                <button
                  onClick={() => { logout(); navigate('/register'); }}
                  className="flex-1 h-10 rounded-2xl bg-gradient-to-r from-primary to-accent text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition active:scale-95"
                >
                  Ücretsiz Üye Ol
                </button>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="flex-1 h-10 rounded-2xl border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/[0.06] active:scale-95"
                >
                  Giriş Yap
                </button>
              </div>
            </div>
          </div>
        )}

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
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wide ${
                  todayQuestions >= dailyGoal
                    ? 'bg-success/10 border-success/20 text-success'
                    : 'bg-primary/10 border-primary/20 text-primary-light'
                }`}>
                  {todayQuestions >= dailyGoal ? 'Günlük hedef tamamlandı' : 'Bugünkü görev'}
                </span>

                {examCountdown && (
                  <Link
                    to="/dashboard/settings"
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wide ${
                      examCountdown.isPast
                        ? 'bg-danger/10 border-danger/20 text-danger'
                        : 'bg-warning/10 border-warning/20 text-warning'
                    }`}
                  >
                    <CalendarDays className="w-3 h-3" />
                    {examCountdown.isPast
                      ? 'Tarih geçti'
                      : examCountdown.isToday
                      ? 'Sınav bugün'
                      : `${examCountdown.days} gün kaldı`}
                  </Link>
                )}
              </div>
              
              <h3 className="text-xl font-black text-white mt-3 leading-snug tracking-tight">
                {dailyPlan?.title || (todayQuestions >= dailyGoal ? 'Serini korudun, şimdi pekiştir.' : 'Bugünkü Testi Çöz')}
              </h3>
              <p className="text-xs font-semibold text-text-muted mt-1.5 leading-relaxed">
                {dailyPlan?.subtitle || (todayQuestions >= dailyGoal ? 'Yanlışlarını azaltmak için kısa bir tekrar iyi gider.' : `${remainingQuestions} soru daha çözerek günlük hedefini tamamla.`)}
              </p>
            </div>

            <div className="relative shrink-0 flex items-center justify-center w-16 h-16">
              <svg className="w-16 h-16">
                <g transform="rotate(-90 32 32)">
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
                </g>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm font-black text-white leading-none">{todayQuestions}</span>
                <span className="text-[9px] font-bold text-text-muted mt-0.5 leading-none">/{dailyGoal}</span>
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {/* Streak */}
            <div
              onClick={() => navigate('/dashboard/exams')}
              className="flex items-center justify-center gap-1.5 h-10 px-2 rounded-2xl bg-warning/10 border border-warning/15 cursor-pointer hover:bg-warning/20 transition-all text-center min-w-0"
            >
              <Flame className="w-3.5 h-3.5 text-warning shrink-0" />
              <span className="text-[10px] font-black text-white truncate">
                {stats?.streak > 0 ? `${stats.streak} gün` : 'Seri'}
              </span>
            </div>

            {/* Success Rate */}
            <div
              onClick={() => navigate('/dashboard/stats')}
              className="flex items-center justify-center gap-1.5 h-10 px-2 rounded-2xl bg-accent/10 border border-accent/15 cursor-pointer hover:bg-accent/20 transition-all text-center min-w-0"
            >
              <Target className="w-3.5 h-3.5 text-accent-light shrink-0" />
              <span className="text-[10px] font-black text-white truncate">
                {stats?.successRate > 0 ? `%${stats.successRate}` : 'Başarı'}
              </span>
            </div>

            {/* Wrong Answers */}
            <div
              onClick={() => wrongCount > 0 ? navigate('/dashboard/exams?tab=wrong_answers') : navigate('/dashboard/exams')}
              className={`flex items-center justify-center gap-1.5 h-10 px-2 rounded-2xl cursor-pointer hover:bg-opacity-20 transition-all text-center min-w-0 ${
                wrongCount > 0 ? 'bg-danger/10 border border-danger/15' : 'bg-success/10 border border-success/15'
              }`}
            >
              <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${wrongCount > 0 ? 'text-danger' : 'text-success'}`} />
              <span className="text-[10px] font-black text-white truncate">
                {wrongCount > 0 ? `${wrongCount} yanlış` : 'Temiz'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              const actionType = dailyPlan?.primaryAction?.type || 'short_test';
              if (actionType === 'select_category') setShowCategoryModal(true);
              else navigate(dailyPlan?.primaryAction?.target || planRouteByAction[actionType] || '/dashboard/exams', { state: { fromQuickStart: true } });
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent font-black text-xs uppercase tracking-widest text-white mt-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
          >
            <Play className="w-4 h-4" />
            {dailyPlan?.primaryAction?.label || 'Hızlı Teste Başla'}
          </button>
        </div>

        {/* Quick Action Rail */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Hızlı Test */}
          <button
            onClick={() => navigate('/dashboard/exams')}
            className="h-[88px] p-3 rounded-2xl bg-bg-card border border-primary/15 flex flex-col justify-between text-left shadow-lg shadow-black/10 active:scale-[0.98] transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-primary-light" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white leading-none">Hızlı Test</h4>
              <p className="text-[9px] font-bold text-text-muted truncate mt-1.5 leading-none">Günlük hedef</p>
            </div>
          </button>

          {/* Yanlışlar */}
          <button
            onClick={() => wrongCount > 0 ? navigate('/dashboard/exams?tab=wrong_answers') : navigate('/dashboard/exams')}
            className={`h-[88px] p-3 rounded-2xl bg-bg-card border flex flex-col justify-between text-left shadow-lg shadow-black/10 active:scale-[0.98] transition-transform ${
              wrongCount > 0 ? 'border-danger/15' : 'border-success/15'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              wrongCount > 0 ? 'bg-danger/10' : 'bg-success/10'
            }`}>
              <AlertCircle className={`w-4.5 h-4.5 ${wrongCount > 0 ? 'text-danger' : 'text-success'}`} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white leading-none">Yanlışlar</h4>
              <p className="text-[9px] font-bold text-text-muted truncate mt-1.5 leading-none">
                {reviewDue.count > 0
                  ? `${reviewDue.count} bugün`
                  : wrongCount > 0
                  ? `${wrongCount} takipte`
                  : 'Liste temiz'}
              </p>
            </div>
          </button>

          {/* Devam Et / Konu Oku */}
          <button
            onClick={() => {
              if (lastVisitedId) {
                navigate(`/dashboard/lessons?category=${lastVisitedId}`);
              } else {
                navigate('/dashboard/lessons');
              }
            }}
            className="h-[88px] p-3 rounded-2xl bg-bg-card border border-accent/15 flex flex-col justify-between text-left shadow-lg shadow-black/10 active:scale-[0.98] transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-accent-light" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white leading-none">
                {lastVisitedId ? 'Devam Et' : 'Konu Oku'}
              </h4>
              <p className="text-[9px] font-bold text-text-muted truncate mt-1.5 leading-none">
                {lastVisitedName || selectedPackage || 'Ders notları'}
              </p>
            </div>
          </button>
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
        {!examCountdown && (
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
                  Sınav tarihini ekle
                </h4>
                <p className="text-xs text-text-muted mt-0.5 leading-normal">
                  Kalan süreyi ana sayfada takip et.
                </p>
              </div>
            </div>
            <span className="px-3.5 py-2 rounded-xl bg-accent/15 border border-accent/25 text-accent-light text-xs font-black shrink-0">
              Ayarla
            </span>
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
              <p className="text-[9px] font-bold text-text-muted truncate mt-1.5 leading-none">{signLibrary.shortTitle} Levhaları</p>
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
          {!user?.selectedCategoryId && (
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-3 py-1.5 bg-primary/10 border border-primary/25 rounded-xl text-[10px] font-black text-primary-light uppercase shrink-0 active:scale-95 transition-transform flex items-center gap-1"
            >
              <RefreshCcw className="w-3 h-3" /> Seç
            </button>
          )}
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
