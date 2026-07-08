import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Clock, Lock,
  Loader2, BookOpen, Target, FileQuestion,
  Play, ListChecks, AlertCircle, GraduationCap, CheckCircle2, XCircle,
  ChevronDown, ArrowRight
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { trackEvent } from '../../utils/analytics';
import { isVideoRecord } from '../../utils/categoryContent';
import { normalizeId } from '../../utils/wrongAnswers';
import UserWrongAnswers from './UserWrongAnswers';

const examTabIds = ['short_tests', 'general', 'real_sim_cat', 'wrong_answers'];
const MotionDiv = motion.div;

const UserExams = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { user } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [validCategories, setValidCategories] = useState([]);
  const [latestResults, setLatestResults] = useState({});
  const [reviewDueCount, setReviewDueCount] = useState(0);
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    examTabIds.includes(tabParam) ? tabParam : 'short_tests'
  ); // 'short_tests' | 'general' | 'real_sim_cat'
  const [activeShortGroup, setActiveShortGroup] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (name) => {
    setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    const nextTab = examTabIds.includes(tabParam) ? tabParam : 'short_tests';
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
    if (nextTab !== 'short_tests') setActiveShortGroup('all');
  }, [activeTab, tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'short_tests') setActiveShortGroup('all');
    setSearchParams(tabId === 'short_tests' ? {} : { tab: tabId }, {
      replace: true,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Tüm kategorileri çek
        const catRes = await api.get('/categories/all');
        const allCategories = (catRes.data?.data || catRes.data || []).filter((category) => !isVideoRecord(category));

        // Belirli bir parent'ın tüm alt çocuklarını bul (Recursive)
        const getDescendants = (parentId) => {
           const children = allCategories.filter(c => {
             const pId = c.parent?._id || c.parent;
             return pId === parentId;
           });
           let desc = [...children];
           children.forEach(child => {
              desc = [...desc, ...getDescendants(child._id)];
           });
           return desc;
        }

        const userDescendants = user?.selectedCategoryId ? getDescendants(user.selectedCategoryId) : [];
        const validCatIds = [user?.selectedCategoryId, ...userDescendants.map(c => c._id)].filter(Boolean);

        // İçeriği olan alt konu başlıklarını bul (Kısa test üretmek için)
        const lessonCategories = userDescendants.filter(c => c.content && c.content.trim().length > 0);

        // Her konu/içerik kategorisi için otomatik, sentetik bir Mini Test oluştur
        const syntheticExams = lessonCategories.map(cat => ({
          _id: `short_${cat._id}`,
          name: `${cat.name} Mini Test`,
          description: 'İlgili konuyu pekiştirmen için özel hazırlanan değerlendirme testi.',
          categoryId: cat._id,
          duration: 5,
          isMiniTest: true,
          isPro: false,
          _isSynthetic: true,
          _realCategoryId: cat._id
        }));

        // Tüm sınavları ve kullanıcının son sonuçlarını getir
        const [examRes, resultRes, reviewRes, wrongRes] = await Promise.all([
          api.get('/exams'),
          api.get('/exam-results').catch(() => ({ data: [] })),
          api.get('/wrong-answers/review-due?limit=100').catch(() => ({ data: { data: [] } })),
          api.get('/wrong-answers').catch(() => ({ data: { data: [] } })),
        ]);
        const allExams = examRes.data?.exams || examRes.data || [];
        const resultRows = resultRes.data?.results || resultRes.data || [];
        const validCatSet = new Set(validCatIds.map((id) => normalizeId(id)).filter(Boolean));
        const reviewRows = reviewRes.data?.data || reviewRes.data || [];
        setReviewDueCount(Array.isArray(reviewRows)
          ? reviewRows.filter((item) => validCatSet.size === 0 || validCatSet.has(normalizeId(item.categoryId || item.category))).length
          : 0);
        const wrongRows = wrongRes.data?.data || wrongRes.data || [];
        setWrongAnswerCount(Array.isArray(wrongRows)
          ? wrongRows.filter((item) => validCatSet.size === 0 || validCatSet.has(normalizeId(item.categoryId || item.category))).length
          : 0);
        const resultMap = {};

        resultRows.forEach((result) => {
          const key = result.testType === 'short_test'
            ? `short_${result.categoryId}`
            : result.examId;
          if (key && !resultMap[key]) resultMap[key] = result;
        });

        // "Gerçek MEB E-Sınav Simülatörü" oluştur
        const syntheticMebExam = {
          _id: `real_sim_${user?.selectedCategoryId}`,
          name: `MEB E-Sınav Simülatörü`,
          description: 'Belirlediğiniz ehliyet sınıfının tüm müfredatından rastgele 50 soru. Anında cevap göremezsiniz, gerçek MEB formatındadır.',
          categoryId: 'real_sim_cat',
          duration: 45,
          isMiniTest: false,
          isPro: false,
          _isRealMeb: true,
        };

        // Filtreleme: Ya sınavın kategorisi null (Genel Deneme), ya da kullanıcının alt test kısımlarında.
        const filteredExams = allExams.filter(e => {
           if (!e.categoryId) return true; // Genel Deneme
           const cid = e.categoryId?._id || e.categoryId;
           return validCatIds.includes(cid);
        });

        // Testleri listeye ekle
        setValidCategories(allCategories);
        setLatestResults(resultMap);
        setExams([...filteredExams, ...syntheticExams, syntheticMebExam]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.selectedCategoryId]);

  const getCategoryName = (categoryId) => {
    if (!categoryId) return null;
    const cid = categoryId?._id || categoryId;
    const cat = validCategories.find(c => c._id === cid);
    return cat?.name || 'Sınıflandırılmamış';
  };

  const getParentName = (categoryId) => {
    if (!categoryId) return 'Genel';
    const cid = categoryId?._id || categoryId;
    const cat = validCategories.find(c => c._id === cid);
    if (!cat || !cat.parent) return 'Sınıflandırılmamış';
    const pId = typeof cat.parent === 'object' ? cat.parent._id : cat.parent;
    const pCat = validCategories.find(c => c._id === pId);
    return pCat?.name || 'Diğer Ana Konular';
  };

  const generalExams = exams.filter(e => {
    if (e._isSynthetic || e._isRealMeb) return false;
    if (!e.categoryId) {
      // testType ile öncelikli kontrol; yoksa isim heuristiği
      if (e.testType === 'mock_exam') return true;
      if (e.testType === 'real_exam') return false;
      return e.name.toLowerCase().includes('deneme');
    }
    return false;
  });
  const shortTests = exams.filter(e => e._isSynthetic);
  const realSimExams = exams.filter(e => {
    if (e._isRealMeb) return true;
    if (e._isSynthetic) return false;
    if (!e.categoryId) {
      if (e.testType === 'real_exam') return true;
      if (e.testType === 'mock_exam') return false;
      return !e.name.toLowerCase().includes('deneme');
    }
    return false;
  });

  const shortGroups = shortTests.reduce((acc, exam) => {
    const groupName = getParentName(exam.categoryId);
    acc[groupName] = (acc[groupName] || 0) + 1;
    return acc;
  }, {});

  const displayedExams = exams.filter(e => {
    const catId = e.categoryId?._id || e.categoryId;

    if (activeTab === 'general') {
      return generalExams.includes(e);
    }
    if (activeTab === 'short_tests') {
      if (!e._isSynthetic) return false;
      return activeShortGroup === 'all' || getParentName(e.categoryId) === activeShortGroup;
    }
    if (activeTab === 'real_sim_cat') {
      return realSimExams.includes(e);
    }

    return false;
  });
  const lockedExamIds = displayedExams
    .filter((exam) => exam.isPro && !user?.proStatus)
    .map((exam) => exam._id)
    .join(',');
  const completedExamCount = Object.keys(latestResults).length;
  const passedExamCount = Object.values(latestResults).filter((result) => result?.passed).length;

  useEffect(() => {
    if (!lockedExamIds) return;
    trackEvent('paywall_seen', {
      surface: 'exam_list',
      tab: activeTab,
      lockedExamCount: lockedExamIds.split(',').length,
      lockedExamIds,
    });
  }, [lockedExamIds, activeTab]);

  const tabs = [
    {
      id: 'short_tests',
      label: 'Kısa Testler',
      count: shortTests.length,
      icon: FileQuestion,
      hint: 'Konu kategorilerine göre',
    },
    {
      id: 'general',
      label: 'Deneme',
      count: generalExams.length,
      icon: Target,
      hint: '50 soruluk deneme sınavları',
    },
    {
      id: 'real_sim_cat',
      label: 'MEB E-Sınav',
      count: realSimExams.length,
      icon: GraduationCap,
      hint: 'Süreli sınav simülasyonu',
    },
    {
      id: 'wrong_answers',
      label: 'Yanlışlarım',
      count: wrongAnswerCount,
      icon: XCircle,
      hint: 'Tekrar listesi',
    },
  ];

  // Ekran render kontrolü
  if (!user?.selectedCategoryId) {
    return (
       <div className="flex flex-col items-center justify-center py-32 text-text-muted text-center px-4">
          <AlertCircle className="w-16 h-16 opacity-20 mb-4" />
          <h2 className="text-xl font-black text-white mb-2 tracking-tight">Eğitim Paketi Seçilmedi</h2>
          <p className="font-medium text-sm mb-6 max-w-md">Sınavları görebilmek için lütfen ana sayfadan ehliyet sınıfı seçiminizi yapınız.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary px-8">Ana Sayfaya Dön</button>
       </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      {/* Desktop View — Premium Redesign */}
      <div className="hidden lg:block space-y-5 pb-10 text-white">

        {/* ── Row 1: Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0f1322] via-[#0c0f1c] to-[#07080f] p-6 shadow-2xl shadow-black/40">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/8 blur-[80px]" />
          <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-primary-light" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-light">Sınav Merkezi</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white xl:text-4xl">
                Testler & Denemeler
              </h1>
              <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-text-muted">
                Kısa konu testleri, genel denemeler, MEB simülasyonu ve yanlış tekrarları tek alanda.
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary-light">{user?.selectedCategoryName}</p>
            </div>

            {/* Stats row */}
            <div className="grid shrink-0 grid-cols-4 gap-3 xl:w-[500px]">
              {[
                { label: 'Toplam Test', value: exams.length, icon: ListChecks, tone: 'text-primary-light border-primary/20 bg-primary/10' },
                { label: 'Konu Testi', value: shortTests.length, icon: FileQuestion, tone: 'text-accent-light border-accent/20 bg-accent/10' },
                { label: 'Genel Deneme', value: generalExams.length, icon: Target, tone: 'text-warning border-warning/20 bg-warning/10' },
                { label: 'Başarılı', value: `${passedExamCount}/${completedExamCount}`, icon: CheckCircle2, tone: 'text-success border-success/20 bg-success/10' },
              ].map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className="rounded-2xl border border-white/[0.06] bg-black/20 p-3 text-center">
                  <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl border ${tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-lg font-black leading-none text-white">{value}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 2: Yanlış Tekrar + Tab Bar ── */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Yanlış Tekrar Quick Entry */}
          <div className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors xl:w-80 ${
            reviewDueCount > 0 ? 'border-primary/25 bg-primary/8' : 'border-white/[0.07] bg-white/[0.02]'
          }`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              reviewDueCount > 0 ? 'border-primary/30 bg-primary/15 text-primary-light' : 'border-white/10 bg-black/20 text-text-muted'
            }`}>
              <ListChecks className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white">Bugünkü Yanlışlar</p>
              <p className="mt-0.5 text-[10px] font-semibold text-text-muted">
                {reviewDueCount > 0 ? `${reviewDueCount} soru bekliyor` : 'Bugün yok'}
              </p>
            </div>
            <button
              disabled={reviewDueCount === 0}
              onClick={() => navigate('/dashboard/exams/wrong-review')}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                reviewDueCount > 0
                  ? 'bg-primary text-white hover:bg-primary-light active:scale-95 cursor-pointer'
                  : 'cursor-not-allowed border border-white/10 bg-white/5 text-text-muted'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              {reviewDueCount > 0 ? 'Çöz' : 'Yok'}
            </button>
          </div>

          {/* Tab Bar — sliding pill */}
          <div className="flex flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-colors focus:outline-none cursor-pointer"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeExamTab"
                      className="absolute inset-0 z-[-1] rounded-xl border border-primary/30 bg-primary/15"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-light' : 'text-text-muted'}`} />
                  <span className={isActive ? 'text-white' : 'text-text-secondary'}>{tab.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                    isActive ? 'bg-white/15 text-white' : 'bg-white/5 text-text-muted'
                  }`}>{tab.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Row 3: Category Filter (short tests only) ── */}
        {activeTab === 'short_tests' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted pr-2">Filtre:</span>
            {[
              { key: 'all', label: 'Tümü', count: shortTests.length },
              ...Object.entries(shortGroups)
                .sort(([a], [b]) => a.localeCompare(b, 'tr'))
                .map(([name, cnt]) => ({ key: name, label: name, count: cnt })),
            ].map(({ key, label, count }) => {
              const active = activeShortGroup === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveShortGroup(key)}
                  className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-primary/15 text-white border border-primary/30'
                      : 'border border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20 hover:text-white'
                  }`}
                >
                  {label}
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] ${
                    active ? 'bg-white/15' : 'bg-white/5'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Row 4: Exam Grid / Wrong Answers ── */}
        {activeTab === 'wrong_answers' ? (
          <UserWrongAnswers onCountChange={setWrongAnswerCount} />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sınavlar Yükleniyor...</span>
          </div>
        ) : displayedExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.015] py-24 text-center">
            <ClipboardList className="mb-6 h-14 w-14 text-white/10" />
            <p className="text-lg font-black tracking-tight text-white">Bu alanda sınav bulunamadı</p>
            <p className="mt-2 max-w-sm text-sm font-medium text-text-muted">İçerik yakında eklenecektir.</p>
          </div>
        ) : (() => {
          const renderExamCard = (exam, i) => {
            const adUnlockedIds = new Set((user?.adUnlockedExamIds || []).map(String));
            const isAdUnlocked = adUnlockedIds.has(String(exam._id));
            const isLocked = (exam.isPro && !user?.proStatus) || (!exam.isPro && !user?.proStatus && i >= 5 && !isAdUnlocked);
            const isSimulation = exam._isRealMeb;
            const isShort = exam._isSynthetic;
            const examNameLower = (exam.name || '').toLocaleLowerCase('tr-TR');
            const isRealExam = activeTab === 'real_sim_cat' && !isSimulation && !isShort && !exam.categoryId && !examNameLower.includes('deneme');
            const isGeneral = !exam.categoryId && !isRealExam;
            const catName = isShort ? getParentName(exam.categoryId) : getCategoryName(exam.categoryId);
            const badgeLabel = isRealExam ? 'MEB E-Sınav' : isGeneral ? 'Deneme' : isSimulation ? 'E-Sınav Sim.' : isShort ? 'Kısa Test' : 'Konu Sınavı';
            const Icon = isRealExam ? GraduationCap : isGeneral ? Target : isSimulation ? GraduationCap : isShort ? FileQuestion : BookOpen;
            const resultKey = isShort ? `short_${exam._realCategoryId}` : exam._id;
            const lastResult = latestResults[resultKey];
            const score = Number(lastResult?.score || 0);
            const completed = Boolean(lastResult);
            const passed = Boolean(lastResult?.passed);

            let cardAccent = { border: 'border-primary/20', bg: 'bg-primary/10', text: 'text-primary-light', btn: 'bg-primary hover:bg-primary-light' };
            if (isGeneral) cardAccent = { border: 'border-warning/20', bg: 'bg-warning/10', text: 'text-warning', btn: 'bg-warning hover:opacity-90' };
            if (isSimulation || isRealExam) cardAccent = { border: 'border-success/20', bg: 'bg-success/10', text: 'text-success', btn: 'bg-success hover:opacity-90' };

            const handleExamAction = () => {
              if (isLocked) {
                trackEvent('pro_clicked', { surface: 'exam_card', examId: exam._id, tab: activeTab });
                alert("Premium abonelik işlemleri şu an için yalnızca Android uygulamamız (Google Play) üzerinden gerçekleştirilebilir.");
                return;
              }
              navigate(
                isSimulation ? `/dashboard/exams/real-test/${user?.selectedCategoryId}` :
                isRealExam ? `/dashboard/exams/${exam._id}?mode=real` :
                isShort ? `/dashboard/exams/short-test/${exam._realCategoryId}` :
                `/dashboard/exams/${exam._id}`
              );
            };

            return (
              <MotionDiv
                layout
                key={exam._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, delay: Math.min(i * 0.015, 0.09) }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br from-[#0f1322] to-[#0a0d16] p-5 transition-all duration-300 ${
                  isLocked
                    ? 'border-warning/10 opacity-70'
                    : completed
                      ? passed ? 'border-success/20 hover:border-success/35' : 'border-danger/20 hover:border-danger/35'
                      : `border-white/[0.07] hover:border-white/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30`
                }`}
              >
                {/* Top stripe accent */}
                <div className={`absolute inset-x-0 top-0 h-px ${completed ? (passed ? 'bg-success/40' : 'bg-danger/40') : 'bg-gradient-to-r from-transparent via-primary/20 to-transparent'}`} />

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${cardAccent.border} ${cardAccent.bg}`}>
                    <Icon className={`h-4 w-4 ${cardAccent.text}`} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-xl border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${cardAccent.border} ${cardAccent.bg} ${cardAccent.text}`}>
                      {badgeLabel}
                    </span>
                    {completed && (
                      <span className={`rounded-xl border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                        passed ? 'border-success/20 bg-success/10 text-success' : 'border-danger/20 bg-danger/10 text-danger'
                      }`}>
                        {passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {passed ? 'Geçildi' : 'Kalındı'}
                      </span>
                    )}
                    {isLocked && (
                      <span className="flex items-center gap-1 rounded-xl border border-warning/20 bg-warning/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-warning">
                        <Lock className="h-3 w-3" /> PRO
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1">
                  <h3 className={`text-base font-black leading-snug tracking-tight transition-colors group-hover:${cardAccent.text}`} style={{ color: 'white' }}>
                    {exam.name}
                  </h3>
                  {catName && <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-text-muted">{catName}</p>}
                  {exam.description && (
                    <p className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-text-muted">{exam.description}</p>
                  )}
                </div>

                {/* Score bar */}
                {completed && (
                  <div className="my-4 rounded-xl border border-white/5 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className={passed ? 'text-success' : 'text-danger'}>{passed ? 'Başarı Skoru' : 'Skor'}</span>
                      <span className="text-white">%{score}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${passed ? 'bg-success' : 'bg-danger'}`} style={{ width: `${Math.max(4, Math.min(score, 100))}%` }} />
                    </div>
                  </div>
                )}

                {/* Meta + CTA */}
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3 border-t border-white/[0.06] pt-3 text-[9px] font-black uppercase tracking-widest text-text-muted">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary-light" />{exam.duration || 45} dk</span>
                    <span className="h-1 w-1 rounded-full bg-white/10" />
                    <span className="flex items-center gap-1"><FileQuestion className="h-3.5 w-3.5 text-warning" />{exam.questionCount ? `${exam.questionCount} soru` : isShort ? 'Konu testi' : '50 soru'}</span>
                  </div>
                  <button
                    onClick={handleExamAction}
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer ${
                      isLocked
                        ? 'border border-white/10 bg-white/[0.03] text-text-muted hover:border-warning/20 hover:bg-warning/10 hover:text-warning'
                        : `${cardAccent.btn} text-white shadow-lg hover:scale-[1.01]`
                    }`}
                  >
                    {isLocked ? <><Lock className="h-4 w-4" /> Kilidi Aç (PRO)</> : <><Play className="h-4 w-4" /> Başla</>}
                  </button>
                </div>
              </MotionDiv>
            );
          };

          return (
            <MotionDiv layout className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <AnimatePresence>{displayedExams.map((exam, i) => renderExamCard(exam, i))}</AnimatePresence>
            </MotionDiv>
          );
        })()}
      </div>


      {/* Mobile View */}
      <div className="block lg:hidden space-y-6 pb-24 text-white">
        {activeTab === 'real_sim_cat' ? (
          // MEB E-Sınav / Sınavlar View (ExamListScreen Parity)
          <div className="space-y-6 animate-fadeIn">
            {/* Premium Header Card */}
            <div className="relative overflow-hidden rounded-3xl p-5 border border-white/5 bg-gradient-to-br from-[#171927] to-[#11141b] shadow-xl">
              {/* Orange/Deep gradient border top like Flutter */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#ff9f43] to-[#ff6b6b]" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Verify Badge */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ff9f43]/15 text-[#ff9f43] border border-[#ff9f43]/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f43] animate-pulse" />
                    Sınav Merkezi
                  </div>
                  <h1 className="text-white text-2xl font-black tracking-tight mt-3">Sınavlar</h1>
                  <p className="text-text-muted text-xs font-semibold leading-relaxed mt-2.5">
                    Gerçek sınav temposunda çözün, süreyi yönetin ve sonucu net görün.
                  </p>
                </div>

                {/* Count Dial */}
                <div className="w-16 h-16 rounded-full bg-[#ff9f43]/10 border border-[#ff9f43]/20 flex flex-col items-center justify-center shrink-0 shadow-lg shadow-[#ff9f43]/5">
                  <span className="text-white font-black text-lg leading-none">{realSimExams.length}</span>
                  <span className="text-[#ff9f43] text-[9px] font-black uppercase tracking-widest mt-1">Sınav</span>
                </div>
              </div>

              {/* Metric Row */}
              <div className="grid grid-cols-3 gap-2 py-4 my-4 border-y border-white/5">
                {/* metric 1 */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ff9f43]/10 text-[#ff9f43] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-black text-xs leading-none">45 dk</p>
                    <p className="text-text-muted text-[9px] font-bold mt-1">Süre</p>
                  </div>
                </div>
                {/* metric 2 */}
                <div className="flex items-center gap-2 border-l border-white/5 pl-2">
                  <div className="w-8 h-8 rounded-xl bg-[#a55eea]/10 text-[#a55eea] flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-black text-xs leading-none">50</p>
                    <p className="text-text-muted text-[9px] font-bold mt-1">Soru</p>
                  </div>
                </div>
                {/* metric 3 */}
                <div className="flex items-center gap-2 border-l border-white/5 pl-2">
                  <div className="w-8 h-8 rounded-xl bg-[#2bcbba]/10 text-[#2bcbba] flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-black text-xs leading-none">Analiz</p>
                    <p className="text-text-muted text-[9px] font-bold mt-1">Sonuçlar</p>
                  </div>
                </div>
              </div>

              {/* Buttons Row */}
              <div className="flex gap-2">
                <button
                  disabled={realSimExams.length === 0}
                  onClick={() => {
                    if (realSimExams.length > 0) {
                      navigate(`/dashboard/exams/real-test/${user?.selectedCategoryId}`);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#ff9f43] to-[#ff6b6b] text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#ff9f43]/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Sınav Moduna Başla
                </button>
                <button
                  onClick={() => navigate('/dashboard/stats')}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-[#2bcbba] flex items-center justify-center shrink-0 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  <Target className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between gap-3 px-1 mt-6">
              <div>
                <h2 className="text-base font-black text-white">Gerçek Sınavlar</h2>
                <p className="text-xs text-text-muted mt-0.5">MEB temposunda çöz, sonucu analiz ekranında takip et.</p>
              </div>
              <span className="inline-flex rounded-full border border-[#ff9f43]/20 bg-[#ff9f43]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#ff9f43]">
                {realSimExams.length} sınav
              </span>
            </div>

            {/* Real MEB simulator card list */}
            <div className="space-y-4">
              {realSimExams.map((exam) => {
                const isSyntheticSimulator = exam._isRealMeb;
                const resultKey = exam._id;
                const lastResult = latestResults[resultKey];
                const score = Number(lastResult?.score || 0);
                const completed = Boolean(lastResult);
                const passed = Boolean(lastResult?.passed);

                return (
                  <div
                    key={exam._id}
                    className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#171927]/60 p-5 shadow-lg flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#ff9f43]/10 border border-[#ff9f43]/20 text-[#ff9f43] flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="px-2.5 py-1 bg-[#ff9f43]/10 text-[#ff9f43] border border-[#ff9f43]/20 rounded-xl text-[9px] font-black uppercase tracking-widest">
                          MEB E-SINAV
                        </span>
                        {completed && (
                          <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            passed ? 'bg-success/15 text-success border-success/20' : 'bg-danger/15 text-danger border-danger/20'
                          }`}>
                            {passed ? 'GEÇİLDİ' : 'TEKRAR'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-black text-base">{exam.name}</h3>
                      <p className="text-xs text-text-muted mt-2 leading-relaxed font-semibold">{exam.description}</p>
                    </div>

                    {completed && (
                      <div className="rounded-2xl bg-black/20 p-3.5 border border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className={passed ? 'text-success' : 'text-danger'}>
                            {passed ? 'BAŞARILI' : 'TAMAMLANDI'}
                          </span>
                          <span className="text-white font-black">{score}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${passed ? 'bg-success' : 'bg-danger'}`}
                            style={{ width: `${Math.max(5, score)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 py-3 border-y border-white/5 text-[10px] font-black text-text-secondary uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#ff9f43]" />
                        <span>{exam.duration || 45} DAKİKA</span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                      <div className="flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-[#a55eea]" />
                        <span>50 SORU</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(
                        isSyntheticSimulator
                          ? `/dashboard/exams/real-test/${user?.selectedCategoryId}`
                          : `/dashboard/exams/${exam._id}?mode=real`
                      )}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#ff9f43] hover:bg-[#ff9f43]/90 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#ff9f43]/10 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Sınavı Başlat
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Soru Merkezi View (TestListScreen Parity)
          <div className="space-y-6 animate-fadeIn">
            {/* Premium Header Card */}
            <div className="relative overflow-hidden rounded-3xl p-5 border border-white/5 bg-gradient-to-br from-[#20193A] to-[#111827] shadow-xl">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 bg-radial-gradient(circle, #6366f1, transparent)" />
              </div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30">
                  <FileQuestion className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Soru ve sınav pratiği</p>
                  <h1 className="text-white text-2xl font-black tracking-tight mt-0.5">Soru Merkezi</h1>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                <button
                  onClick={() => {
                    const incomplete = shortTests.find(t => !latestResults[`short_${t._realCategoryId}`]);
                    const target = incomplete || shortTests[0];
                    if (target) navigate(`/dashboard/exams/short-test/${target._realCategoryId}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-warning/15 border border-warning/20 text-warning rounded-xl text-xs font-black uppercase tracking-wider hover:bg-warning/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-warning" /> Hızlı Test <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard/stats')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" /> İstatistikler <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modern Tab Bar */}
            <div className="p-1 bg-white/5 border border-white/5 rounded-full flex gap-1">
              {[
                { id: 'short_tests', label: 'Kısa Testler' },
                { id: 'general', label: 'Deneme' },
                { id: 'wrong_answers', label: 'Yanlışlarım' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleTabChange(tab.id);
                    }}
                    className={`flex-1 text-center py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/40'
                        : 'text-text-muted hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {activeTab === 'short_tests' && (
              <div className="space-y-3">
                {Object.keys(shortGroups).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileQuestion className="w-12 h-12 text-text-muted opacity-30 mb-3" />
                    <p className="text-sm font-bold text-text-muted">Kısa test bulunamadı.</p>
                  </div>
                ) : (
                  Object.entries(shortGroups)
                    .sort(([a], [b]) => a.localeCompare(b, 'tr'))
                    .map(([groupName, count]) => {
                      const isExpanded = expandedCategories[groupName];
                      const groupExams = shortTests.filter(e => getParentName(e.categoryId) === groupName);
                      const matchedCat = validCategories.find(c => c.name === groupName || getCategoryName(c._id) === groupName);
                      const categoryColor = matchedCat?.color || '#6366f1';

                      return (
                        <div
                          key={groupName}
                          className="border border-white/5 bg-[#171927]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-md animate-fadeIn"
                        >
                          {/* Header */}
                          <button
                            onClick={() => toggleCategory(groupName)}
                            className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                              style={{
                                backgroundColor: `${categoryColor}1f`,
                                borderColor: `${categoryColor}33`,
                                color: categoryColor
                              }}
                            >
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-white truncate">{groupName}</h3>
                              <p className="text-[11px] text-text-muted mt-0.5">{count} Test • Süreli değil</p>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-text-muted transition-transform duration-300 ${
                                isExpanded ? 'rotate-180 text-white' : ''
                              }`}
                            />
                          </button>

                          {/* Children List */}
                          {isExpanded && (
                            <div className="border-t border-white/5 bg-black/15 divide-y divide-white/5 px-2 animate-slideDown">
                              {groupExams.map((exam, index) => {
                                const resultKey = `short_${exam._realCategoryId}`;
                                const lastResult = latestResults[resultKey];
                                const score = Number(lastResult?.score || 0);
                                const completed = Boolean(lastResult);
                                const passed = Boolean(lastResult?.passed);
                                const adUnlockedIds = new Set((user?.adUnlockedExamIds || []).map(String));
                                const isLocked = (exam.isPro && !user?.proStatus) || (!exam.isPro && !user?.proStatus && index >= 5 && !adUnlockedIds.has(String(exam._id)));

                                return (
                                  <div key={exam._id} className="flex items-center justify-between p-3 gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs text-white truncate">{exam.name}</p>
                                      {completed ? (
                                        <div className="flex items-center gap-1.5 mt-1">
                                          <span className={`text-[10px] font-black uppercase tracking-wider ${passed ? 'text-success' : 'text-danger'}`}>
                                            {passed ? 'GEÇİLDİ' : 'TEKRAR'}
                                          </span>
                                          <span className="text-[10px] text-text-muted">• Başarı: {score}%</span>
                                        </div>
                                      ) : (
                                        <p className="text-[10px] text-text-muted mt-1">Konu Değerlendirme Testi</p>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => {
                                        if (isLocked) {
                                          trackEvent('pro_clicked', {
                                            surface: 'exam_card_mobile',
                                            contentType: 'exam',
                                            examId: exam._id,
                                            examName: exam.name,
                                          });
                                          alert("Premium abonelik işlemleri web sürümünde desteklenmemektedir. Güvenlik ve faturalandırma kuralları nedeniyle premium abonelik işlemleri şu an için yalnızca Android uygulamamız (Google Play) üzerinden gerçekleştirilebilir.");
                                          return;
                                        }
                                        navigate(`/dashboard/exams/short-test/${exam._realCategoryId}`);
                                      }}
                                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                                        isLocked
                                          ? 'bg-warning/10 text-warning border border-warning/20'
                                          : completed
                                            ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                            : 'bg-primary text-white shadow-md shadow-primary/20 hover:scale-[1.01]'
                                      }`}
                                    >
                                      {isLocked ? (
                                        <>
                                          <Lock className="w-3 h-3" /> PRO
                                        </>
                                      ) : completed ? (
                                        'TEKRAR'
                                      ) : (
                                        <>
                                          <Play className="w-3 h-3 fill-white" /> BAŞLAT
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-3">
                <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider px-1">Deneme Sınavları</h4>
                {generalExams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <Target className="w-10 h-10 text-text-muted opacity-30 mb-2" />
                    <p className="text-xs text-text-muted">Deneme sınavı bulunamadı.</p>
                  </div>
                ) : (
                  generalExams.map((exam, index) => {
                    const resultKey = exam._id;
                    const lastResult = latestResults[resultKey];
                    const score = Number(lastResult?.score || 0);
                    const completed = Boolean(lastResult);
                    const passed = Boolean(lastResult?.passed);
                    const adUnlockedIds = new Set((user?.adUnlockedExamIds || []).map(String));
                    const isLocked = (exam.isPro && !user?.proStatus) || (!exam.isPro && !user?.proStatus && index >= 5 && !adUnlockedIds.has(String(exam._id)));

                    return (
                      <div
                        key={exam._id}
                        className="p-4 rounded-2xl border border-white/5 bg-[#171927]/60 shadow-md flex items-center gap-3.5 animate-fadeIn"
                      >
                        <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 text-warning flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-sm truncate">{exam.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                            <span>{exam.duration || 45} Dk</span>
                            <span>•</span>
                            <span>50 Soru</span>
                            {completed && (
                              <>
                                <span>•</span>
                                <span className={passed ? 'text-success font-black' : 'text-danger font-black'}>
                                  {score}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (isLocked) {
                              trackEvent('pro_clicked', {
                                surface: 'exam_card_mobile',
                                contentType: 'exam',
                                examId: exam._id,
                                examName: exam.name,
                              });
                              alert("Premium abonelik işlemleri web sürümünde desteklenmemektedir. Güvenlik ve faturalandırma kuralları nedeniyle premium abonelik işlemleri şu an için yalnızca Android uygulamamız (Google Play) üzerinden gerçekleştirilebilir.");
                              return;
                            }
                            navigate(`/dashboard/exams/${exam._id}`);
                          }}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                            isLocked
                              ? 'bg-warning/10 text-warning border border-warning/20'
                              : completed
                                ? 'bg-white/5 text-white border border-white/10'
                                : 'bg-primary text-white shadow-md shadow-primary/20 hover:scale-[1.01]'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="w-3 h-3" /> PRO
                            </>
                          ) : completed ? (
                            'TEKRAR'
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-white" /> BAŞLAT
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'wrong_answers' && (
              <div className="space-y-4 animate-fadeIn">
                <div className={`rounded-2xl border p-5 ${
                  reviewDueCount > 0
                    ? 'border-primary/20 bg-primary/10'
                    : 'border-white/5 bg-[#171927]/60'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                      reviewDueCount > 0
                        ? 'border-primary/30 bg-primary/15 text-primary-light'
                        : 'border-white/10 bg-black/20 text-text-muted'
                    }`}>
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white">Bugün Çözülecek Yanlışlar</p>
                      <p className="mt-1 text-xs text-text-muted font-medium">
                        {reviewDueCount > 0
                          ? `${reviewDueCount} yanlış soru yeniden çözülmeyi bekliyor.`
                          : 'Bugün yeniden çözmen gereken yanlış soru yok.'}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={reviewDueCount === 0}
                    onClick={() => navigate('/dashboard/exams/wrong-review')}
                    className={`mt-4 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      reviewDueCount > 0
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.01]'
                        : 'border border-white/5 bg-white/5 text-text-muted cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {reviewDueCount > 0 ? 'Yanlışları Çöz' : 'Bugün Yok'}
                  </button>
                </div>
                <UserWrongAnswers onCountChange={setWrongAnswerCount} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default UserExams;
