import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookMarked,
  BookOpen,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Flame,
  LayoutGrid,
  Loader2,
  PlayCircle,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import CategorySelectorModal from '../../components/user/CategorySelectorModal';

const StatCard = ({ icon: Icon, label, value, detail, tone = 'primary', delay = 0 }) => {
  const toneClass = {
    primary: 'bg-primary/10 border-primary/20 text-primary-light',
    accent: 'bg-accent/10 border-accent/20 text-accent-light',
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
  }[tone];

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group rounded-2xl border border-white/5 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.055] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition group-hover:scale-105 sm:h-11 sm:w-11 ${toneClass}`}>
          {React.createElement(Icon, { className: 'h-5 w-5' })}
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold leading-relaxed text-text-secondary sm:mt-4">{detail}</p>
    </Motion.div>
  );
};

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

const UserHome = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [quote, setQuote] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setIsMockMode(false);

        try {
          const statsRes = await api.get('/exam-results/stats');
          if (statsRes.data && !statsRes.data.error) setStats(statsRes.data);
        } catch (err) {
          console.error('Stats error', err);
        }

        try {
          const mainRes = await api.get('/categories');
          const mainData = mainRes.data?.data || mainRes.data?.categories || mainRes.data;
          const filteredMain = (Array.isArray(mainData) ? mainData : []).filter((category) => !category.parent);
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
            setSubCategories(Array.isArray(subData) ? subData : []);
          } catch (err) {
            console.error('Sub categories error', err);
          }
        } else {
          setSubCategories([]);
        }

        try {
          const quoteRes = await api.get('/quotes/random');
          const quoteData = quoteRes.data?.data || quoteRes.data;
          if (quoteData?.text) {
            setQuote({
              text: quoteData.text,
              author: quoteData.author || '',
            });
          }
        } catch (err) {
          console.error('Quotes error', err);
        }
      } catch (err) {
        console.error('Global fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.selectedCategoryId]);

  const dailyGoal = stats?.dailyGoal || 20;
  const todayQuestions = stats?.todayQuestions || 0;
  const dailyProgress = Math.min(100, Math.round((todayQuestions / dailyGoal) * 100));
  const examCountdown = getExamCountdown(user?.examDate || getStoredExamDate());
  const remainingQuestions = Math.max(0, dailyGoal - todayQuestions);

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
  ]), []);

  const studyPlan = [
    { label: 'Konu tekrarı', detail: '15 dakika okuma', icon: BookOpen, done: Boolean(user?.selectedCategoryId) },
    { label: 'Mini test', detail: '10 soru çöz', icon: ClipboardList, done: todayQuestions >= 10 },
    { label: 'Günlük hedef', detail: `${dailyGoal} soruluk hedef`, icon: Target, done: todayQuestions >= dailyGoal },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Dashboard hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-20 text-white sm:space-y-6 sm:pb-24">
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
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg-dark to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg-dark to-transparent" />
        <div className="flex w-max animate-[quoteMarquee_42s_linear_infinite] items-center gap-40 whitespace-nowrap px-6">
          {[0, 1].map((item) => (
            <div key={item} className="flex min-w-[100vw] items-center justify-center gap-3">
              <Sparkles className="h-4 w-4 text-primary-light" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-light">Günün Sözü</span>
              <span className="text-sm font-bold text-white sm:text-base">
                {quote?.text || 'Bugün kısa bir tekrar, yarın daha sakin bir sınav.'}
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-text-muted">
                {quote?.author || 'Ehliyet Yolu'}
              </span>
            </div>
          ))}
        </div>
      </Motion.div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(330px,420px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.24),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025)_45%,rgba(6,182,212,0.10))] p-5 shadow-2xl shadow-black/20 sm:p-7 lg:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/10 blur-[80px]" />
          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary-light" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-light">
                  Öğrenci Paneli
                </span>
              </div>
              <h1 className="max-w-[12ch] text-3xl font-black leading-[0.98] tracking-tight text-white sm:max-w-none sm:text-4xl lg:text-5xl">
                Merhaba {user?.firstName || 'sürücü adayı'}
              </h1>
              <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-text-secondary sm:text-base">
                Bugün hedefe odaklan: kısa konu tekrarı, mini test ve sınav tarihine göre düzenli ilerleme.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <Link
                to="/dashboard/exams"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition hover:bg-primary-light sm:px-5 sm:py-4 sm:text-sm"
              >
                <PlayCircle className="h-5 w-5" />
                Teste Başla
              </Link>
              <Link
                to="/dashboard/lessons"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10 sm:px-5 sm:py-4 sm:text-sm"
              >
                <BookOpen className="h-5 w-5 text-accent-light" />
                Dersler
              </Link>
            </div>
          </div>

          <div className="relative z-10 mt-7 grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_0.9fr_0.9fr] lg:mt-8">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Günlük Hedef</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-black">{dailyProgress}%</p>
                  <p className="mt-1 text-xs font-bold text-text-secondary">{remainingQuestions === 0 ? 'Hedef tamamlandı' : `${remainingQuestions} soru kaldı`}</p>
                </div>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(var(--color-primary)_0%,var(--color-accent)_var(--progress),rgba(255,255,255,0.08)_var(--progress))] p-1" style={{ '--progress': `${dailyProgress}%` }}>
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-bg-card text-[10px] font-black text-white">
                    {todayQuestions}/{dailyGoal}
                  </div>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <Motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyProgress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Çalışma Serisi</p>
              <div className="mt-3 flex items-center gap-3">
                <Flame className="h-8 w-8 text-warning" />
                <p className="text-3xl font-black">{stats?.streak || 0} gün</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sınav Tarihi</p>
              <div className="mt-3 flex items-center gap-3">
                <CalendarClock className="h-8 w-8 text-success" />
                <p className="text-2xl font-black">
                  {examCountdown
                    ? examCountdown.isToday
                      ? 'Bugün'
                      : `${examCountdown.days} gün`
                    : 'Eklenmedi'}
                </p>
              </div>
            </div>
          </div>
        </Motion.div>

        <Motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10 sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-success">Sınav Geri Sayımı</p>
              <h2 className="mt-2 text-xl font-black tracking-tight">Sınav Tarihi</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-success/20 bg-success/10 shadow-lg shadow-success/5">
              <CalendarDays className="h-5 w-5 text-success" />
            </div>
          </div>

          {examCountdown ? (
            <div className={`mt-6 rounded-2xl border p-5 ${examCountdown.isPast ? 'border-danger/20 bg-danger/10' : 'border-success/20 bg-success/10'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${examCountdown.isPast ? 'text-danger' : 'text-success'}`}>
                {examCountdown.isPast ? 'Sınav tarihi geçti' : examCountdown.isToday ? 'Sınav bugün' : 'Sınava kalan süre'}
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight">
                  {examCountdown.isToday ? 0 : examCountdown.days}
                </span>
                <span className="pb-2 text-sm font-black uppercase tracking-widest text-text-secondary">
                  {examCountdown.isToday ? 'gün' : examCountdown.isPast ? 'gün önce' : 'gün kaldı'}
                </span>
              </div>
              <p className="mt-4 text-sm font-bold text-text-secondary">{examCountdown.formatted}</p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.025] p-5">
              <p className="text-sm font-bold leading-relaxed text-text-secondary">
                Sınav tarihini tercihlerden eklersen burada kaç gün kaldığını göstereceğiz.
              </p>
              <Link
                to="/dashboard/settings"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:border-success/30 hover:bg-success/10"
              >
                Tarih Ekle
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="mt-7 space-y-2.5">
            {studyPlan.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.025] p-3 transition hover:bg-white/[0.045]">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.done ? 'bg-success/10 text-success' : 'bg-white/5 text-text-muted'}`}>
                  {item.done ? <CheckCircle2 className="h-5 w-5" /> : <item.icon className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-white">{item.label}</p>
                  <p className="text-xs font-semibold text-text-muted">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Motion.aside>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Toplam Sınav" value={stats?.totalExams || 0} detail="Çözdüğün deneme sayısı" tone="primary" />
        <StatCard icon={Target} label="Doğru Cevap" value={stats?.totalCorrect || 0} detail="Tüm sınavlardaki toplam doğru" tone="success" delay={0.03} />
        <StatCard icon={Activity} label="Bugünkü Soru" value={todayQuestions} detail="Günlük hedefe giden ilerleme" tone="accent" delay={0.06} />
        <StatCard icon={CalendarDays} label="Seri" value={`${stats?.streak || 0} gün`} detail="Düzenli çalışma takibi" tone="warning" delay={0.09} />
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {actionCards.map((card, index) => (
          <Motion.div
            key={card.to}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Link
              to={card.to}
              className={`group flex min-h-28 flex-row items-center justify-between gap-4 rounded-2xl border border-white/5 bg-gradient-to-br ${card.tone} p-4 transition hover:-translate-y-1 hover:border-primary/30 sm:min-h-36 sm:flex-col sm:items-stretch sm:p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 sm:h-12 sm:w-12">
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="hidden h-5 w-5 text-text-muted transition group-hover:translate-x-1 group-hover:text-white sm:block" />
              </div>
              <div className="min-w-0 flex-1 sm:flex-none">
                <h3 className="text-lg font-black tracking-tight">{card.label}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-text-secondary">{card.text}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-text-muted transition group-hover:translate-x-1 group-hover:text-white sm:hidden" />
            </Link>
          </Motion.div>
        ))}
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
                    className="group flex h-full min-h-56 flex-col rounded-2xl border border-white/5 bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-primary/25 hover:bg-primary/5"
                  >
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <BookOpen className="h-6 w-6 text-primary-light" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-text-muted transition group-hover:translate-x-1 group-hover:text-primary-light" />
                    </div>
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

      <CategorySelectorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />
    </div>
  );
};

export default UserHome;
