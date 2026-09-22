import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../api';
import { TEST_TYPES } from '../../constants/testTypes';
import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Loader2,
  PlayCircle,
  RefreshCcw,
  ShieldCheck,
  Star,
  Target,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import CategorySelectorModal from '../../components/user/CategorySelectorModal';
import NotificationPanel from '../../components/user/NotificationPanel';
import { isVideoRecord, limitQuoteText } from '../../utils/categoryContent';
import { getSignLibraryForCategoryName } from '../../data/signLibrariesData';
import { buildScopedStats } from '../../utils/scopedStats';
import {
  filterQuestionsToCategoryTree,
  hydrateWrongAnswers,
  normalizeId,
  readApiList,
} from '../../utils/wrongAnswers';

// ─── Extracted Modules (SRP) ─────────────────────────────────────
import {
  getStoredExamDate,
  getExamCountdown,
  planIconByType,
  planRouteByAction,
} from './home/homeHelpers';
import { DesktopView, MobileHomeView } from './home/HomeViews';

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
      const actionType = action.type || dailyPlan.tasks?.find((task) => !task.completed)?.type || TEST_TYPES.SHORT_TEST;
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
      <DesktopView
        actionCards={actionCards}
        dailyGoal={dailyGoal}
        dailyProgress={dailyProgress}
        desktopSummaryCards={desktopSummaryCards}
        examCountdown={examCountdown}
        level={level}
        levelProgress={levelProgress}
        logout={logout}
        navigate={navigate}
        quote={quote}
        quoteAuthor={quoteAuthor}
        quoteText={quoteText}
        recentResults={recentResults}
        recommendation={recommendation}
        recommendationTone={recommendationTone}
        reviewDue={reviewDue}
        selectedPackage={selectedPackage}
        setShowCategoryModal={setShowCategoryModal}
        studyPlan={studyPlan}
        subCategories={subCategories}
        todayQuestions={todayQuestions}
        totalScore={totalScore}
        user={user}
      />


      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* MOBILE VIEW (FLUTTER DASHBOARD STYLE) */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <MobileHomeView
        circumference={circumference}
        dailyGoal={dailyGoal}
        dailyPlan={dailyPlan}
        examCountdown={examCountdown}
        getCategoryProgressPercent={getCategoryProgressPercent}
        isThemeLocked={isThemeLocked}
        lastVisitedId={lastVisitedId}
        lastVisitedName={lastVisitedName}
        logout={logout}
        navigate={navigate}
        quote={quote}
        quoteAuthor={quoteAuthor}
        quoteDuration={quoteDuration}
        quoteText={quoteText}
        radius={radius}
        recommendation={recommendation}
        recommendationBgMobile={recommendationBgMobile}
        recommendationBorderMobile={recommendationBorderMobile}
        recommendationColorMobile={recommendationColorMobile}
        remainingQuestions={remainingQuestions}
        reviewDue={reviewDue}
        selectedPackage={selectedPackage}
        setShowCategoryModal={setShowCategoryModal}
        setShowNotifications={setShowNotifications}
        signLibrary={signLibrary}
        stats={stats}
        strokeDashoffset={strokeDashoffset}
        strokeWidth={strokeWidth}
        subCategories={subCategories}
        themeMode={themeMode}
        todayQuestions={todayQuestions}
        toggleThemeMode={toggleThemeMode}
        unreadCount={unreadCount}
        user={user}
        wrongCount={wrongCount}
      />

      <CategorySelectorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />
    </div>
  );
};

export default UserHome;
