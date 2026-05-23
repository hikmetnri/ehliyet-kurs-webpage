import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Clock, Lock,
  Loader2, BookOpen, Target, FileQuestion,
  Play, ListChecks, AlertCircle, GraduationCap, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { trackEvent } from '../../utils/analytics';
import { isVideoRecord } from '../../utils/categoryContent';
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
          api.get('/wrong-answers/review-due?limit=1').catch(() => ({ data: { count: 0 } })),
          api.get('/wrong-answers').catch(() => ({ data: { data: [] } })),
        ]);
        const allExams = examRes.data?.exams || examRes.data || [];
        const resultRows = resultRes.data?.results || resultRes.data || [];
        setReviewDueCount(Number(reviewRes.data?.count || 0));
        const wrongRows = wrongRes.data?.data || wrongRes.data || [];
        setWrongAnswerCount(Array.isArray(wrongRows) ? wrongRows.length : 0);
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

  const generalExams = exams.filter(e => !e.categoryId);
  const shortTests = exams.filter(e => e._isSynthetic);
  const realSimExams = exams.filter(e => e._isRealMeb);

  const shortGroups = shortTests.reduce((acc, exam) => {
    const groupName = getParentName(exam.categoryId);
    acc[groupName] = (acc[groupName] || 0) + 1;
    return acc;
  }, {});

  const displayedExams = exams.filter(e => {
    const catId = e.categoryId?._id || e.categoryId;
    
    if (activeTab === 'general') return !catId && !e._isSynthetic && !e._isRealMeb;
    if (activeTab === 'short_tests') {
      if (!e._isSynthetic) return false;
      return activeShortGroup === 'all' || getParentName(e.categoryId) === activeShortGroup;
    }
    if (activeTab === 'real_sim_cat') return e._isRealMeb;
    
    return false;
  });
  const lockedExamIds = displayedExams
    .filter((exam) => exam.isPro && !user?.proStatus)
    .map((exam) => exam._id)
    .join(',');

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
      <div className="hidden lg:block space-y-7 pb-10 text-white">
        
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary-light" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary-light">Sınav Değerlendirme Sistemi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Sınav Merkezi</h1>
            <p className="mt-1 text-sm font-semibold text-text-muted">
              Seçili Paket: <span className="gradient-text font-black uppercase tracking-widest">{user?.selectedCategoryName}</span>
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-text-secondary shadow-lg shadow-black/5">
            <ClipboardList className="h-4.5 w-4.5 text-primary-light" />
            <span className="text-white font-black">{generalExams.length}</span> deneme · <span className="text-white font-black">{shortTests.length}</span> kısa test
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Toplam Sınav */}
          <div className="glass-card p-5 rounded-[24px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent flex items-center justify-between group hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary-light border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                <ListChecks className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white leading-none">{exams.length}</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1.5">Toplam Sınav</p>
              </div>
            </div>
          </div>

          {/* Card 2: Konu Testi */}
          <div className="glass-card p-5 rounded-[24px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent flex items-center justify-between group hover:border-accent/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-accent/10 text-accent-light border border-accent/20 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white leading-none">{shortTests.length}</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1.5">Konu Testi</p>
              </div>
            </div>
          </div>

          {/* Card 3: Genel Deneme */}
          <div className="glass-card p-5 rounded-[24px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent flex items-center justify-between group hover:border-warning/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-warning/10 text-warning border border-warning/20 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white leading-none">{generalExams.length}</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1.5">Genel Deneme</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wrong Review Quick Entry */}
        <div className={`relative overflow-hidden rounded-[24px] border p-6 transition-all duration-300 shadow-lg ${
          reviewDueCount > 0
            ? 'border-primary/25 bg-gradient-to-br from-primary/15 to-transparent shadow-primary/5'
            : 'border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent shadow-black/10'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none rounded-full" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all ${
                reviewDueCount > 0
                  ? 'border-primary/30 bg-primary/20 text-primary-light shadow-lg shadow-primary/10'
                  : 'border-white/10 bg-black/20 text-text-muted'
              }`}>
                <ListChecks className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white">Bugün Çözülecek Yanlışlar</p>
                <p className="mt-1 text-xs font-semibold text-text-muted">
                  {reviewDueCount > 0
                    ? `${reviewDueCount} yanlış soru yeniden çözülmeyi bekliyor.`
                    : 'Bugün yeniden çözmen gereken yanlış soru yok.'}
                </p>
              </div>
            </div>
            <button
              disabled={reviewDueCount === 0}
              onClick={() => navigate('/dashboard/exams/wrong-review')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                reviewDueCount > 0
                  ? 'bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 cursor-pointer'
                  : 'cursor-not-allowed border border-white/10 bg-white/5 text-text-muted'
              }`}
            >
              <Play className="h-4 w-4" />
              {reviewDueCount > 0 ? 'Yanlışları Çöz' : 'Bugün Yok'}
            </button>
          </div>
        </div>

        {/* Filter Tabs - Sliding Pill Container */}
        <div className="relative flex p-1.5 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-md shadow-lg shadow-black/10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="relative flex-1 py-4 flex flex-col items-center justify-center gap-1.5 rounded-2xl text-center transition-colors duration-300 focus:outline-none z-10 cursor-pointer"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeExamTab"
                    className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/20 z-[-1]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-2">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-primary-light'}`} />
                  <span className={`text-sm font-black tracking-tight ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                    {tab.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-text-muted'
                  }`}>
                    {tab.count}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-white/70' : 'text-text-muted'}`}>
                  {tab.hint}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === 'short_tests' && (
          <div className="glass-card rounded-[24px] border border-white/5 p-5 shadow-lg shadow-black/5">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">Kısa Test Kategorileri</p>
                <p className="text-xs font-semibold text-text-muted mt-0.5">Konu grubunu seç, alt testleri filtrele.</p>
              </div>
              <span className="inline-flex rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                {displayedExams.length} test listeleniyor
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['all', 'Tümü', shortTests.length],
                ...Object.entries(shortGroups).sort(([a], [b]) => a.localeCompare(b, 'tr')),
              ].map(([groupName, countOrLabel, maybeCount]) => {
                const isAll = groupName === 'all';
                const label = isAll ? countOrLabel : groupName;
                const count = isAll ? maybeCount ?? shortTests.length : countOrLabel;
                const active = activeShortGroup === groupName;
                return (
                  <button
                    key={groupName}
                    onClick={() => setActiveShortGroup(groupName)}
                    className={`relative rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/20 border border-primary'
                        : 'border border-white/10 bg-white/5 text-text-muted hover:border-white/20 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {label}
                    <span className={`ml-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-white/5 text-text-muted'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Exam Grid */}
        {activeTab === 'wrong_answers' ? (
          <UserWrongAnswers onCountChange={setWrongAnswerCount} />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <span className="text-text-muted text-[10px] uppercase tracking-widest font-black">Sınavlar Yükleniyor...</span>
          </div>
        ) : displayedExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center glass-card rounded-[3rem] border border-dashed border-white/10">
            <ClipboardList className="w-16 h-16 text-text-muted opacity-30 mb-6" />
            <p className="text-lg font-black text-white tracking-tight mb-2">Bu alanda sınav bulunamadı</p>
            <p className="text-sm font-medium text-text-muted max-w-sm">Seçtiğiniz kategoriye ait sınav içerikleri kısa süre içinde admin tarafından eklenecektir.</p>
          </div>
        ) : (() => {
          const renderExamCard = (exam, i) => {
            const isLocked = exam.isPro && !user?.proStatus;
            const isGeneral = !exam.categoryId;
            const isSimulation = exam._isRealMeb;
            const isShort = exam._isSynthetic;
            const catName = isShort ? getParentName(exam.categoryId) : getCategoryName(exam.categoryId);
            const badgeLabel = isGeneral ? 'Deneme Sınavı' : isSimulation ? 'E-Sınav Simülatörü' : isShort ? 'Kısa Test' : 'Konu Sınavı';
            const Icon = isGeneral ? Target : isSimulation ? GraduationCap : isShort ? FileQuestion : BookOpen;
            const resultKey = isShort ? `short_${exam._realCategoryId}` : exam._id;
            const lastResult = latestResults[resultKey];
            const score = Number(lastResult?.score || 0);
            const completed = Boolean(lastResult);
            const passed = Boolean(lastResult?.passed);

            // Glow color configurations based on exam type
            let cardTheme = {
              borderHover: 'hover:border-primary/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
              iconBg: 'bg-primary/10 border-primary/20 text-primary-light',
              badgeStyle: 'bg-primary/10 text-primary-light border-primary/20',
              btnStyle: 'bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20'
            };

            if (isGeneral) {
              cardTheme = {
                borderHover: 'hover:border-warning/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
                iconBg: 'bg-warning/10 border-warning/20 text-warning',
                badgeStyle: 'bg-warning/10 text-warning border-warning/20',
                btnStyle: 'bg-warning hover:bg-warning-light text-white shadow-lg shadow-warning/20'
              };
            } else if (isSimulation) {
              cardTheme = {
                borderHover: 'hover:border-success/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
                iconBg: 'bg-success/10 border-success/20 text-success',
                badgeStyle: 'bg-success/10 text-success border-success/20',
                btnStyle: 'bg-success hover:bg-success-light text-white shadow-lg shadow-success/20'
              };
            }

            const handleExamAction = () => {
              if (isLocked) {
                trackEvent('pro_clicked', {
                  surface: 'exam_card',
                  contentType: 'exam',
                  examId: exam._id,
                  examName: exam.name,
                  tab: activeTab,
                });
                return;
              }

              navigate(
                isSimulation ? `/dashboard/exams/real-test/${user?.selectedCategoryId}` :
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
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, delay: Math.min(i * 0.015, 0.09) }}
                className={`glass-card p-6 rounded-[24px] border flex flex-col justify-between gap-5 transition-all duration-300 relative overflow-hidden group ${
                  isLocked
                    ? 'border-warning/10 opacity-75'
                    : completed
                      ? passed
                        ? 'border-success/25 bg-success/[0.02] hover:border-success/40 ' + cardTheme.borderHover
                        : 'border-danger/25 bg-danger/[0.02] hover:border-danger/40 ' + cardTheme.borderHover
                      : 'border-white/5 hover:-translate-y-1 ' + cardTheme.borderHover
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-xl pointer-events-none rounded-full" />
                
                {/* Top Header */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-105 ${cardTheme.iconBg}`}>
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5">
                      {isLocked && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-warning/15 text-warning border border-warning/20 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-warning/5 animate-pulse">
                          <Lock className="w-3 h-3" /> PRO Sınav
                        </span>
                      )}
                      {completed && (
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          passed
                            ? 'bg-success/15 text-success border-success/20'
                            : 'bg-danger/15 text-danger border-danger/20'
                        }`}>
                          {passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {passed ? 'GEÇİLDİ' : 'KALINDI'}
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cardTheme.badgeStyle}`}>
                        {badgeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-4">
                    <h3 className="font-black text-lg tracking-tight leading-tight text-white group-hover:text-primary-light transition-colors">
                      {exam.name}
                    </h3>
                    {catName && (
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1.5">
                        {catName}
                      </p>
                    )}
                    {exam.description && (
                      <p className="text-xs text-text-muted mt-2.5 line-clamp-2 leading-relaxed font-semibold">
                        {exam.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Layout Container */}
                <div className="space-y-4">
                  {completed && (
                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                      <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className={passed ? 'text-success' : 'text-danger'}>
                          {passed ? 'Başarı Skoru' : 'Tamamlanan Skor'}
                        </span>
                        <span className="text-white font-black">{score}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${passed ? 'bg-success' : 'bg-danger'}`}
                          style={{ width: `${Math.max(4, Math.min(score, 100))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center gap-3 py-3 border-y border-white/5 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary-light" />
                      <span>{exam.duration || 45} DAKİKA</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-1">
                      <FileQuestion className="w-3.5 h-3.5 text-warning" />
                      <span>{isShort ? '10' : '50'} SORU</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleExamAction}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                      isLocked
                        ? 'bg-white/5 text-text-muted border border-white/5 hover:bg-warning/10 hover:text-warning hover:border-warning/20'
                        : cardTheme.btnStyle + ' hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4.5 h-4.5" />
                        KİLİDİ AÇ (PRO)
                      </>
                    ) : (
                      <>
                        <Play className="w-4.5 h-4.5" />
                        TESTİ BAŞLAT
                      </>
                    )}
                  </button>
                </div>
              </MotionDiv>
            );
          };
    
          return (
            <MotionDiv layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {displayedExams.map((exam, i) => renderExamCard(exam, i))}
              </AnimatePresence>
            </MotionDiv>
          );
        })()}
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden space-y-6 pb-24 text-white">
        {/* Premium Header Card */}
        <div className="relative overflow-hidden rounded-3xl p-5 border border-white/5 bg-gradient-to-br from-[#20193A] to-[#111827] shadow-xl">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 bg-radial-gradient(circle, #6366f1, transparent)" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/30 shrink-0">
              {user?.firstName?.charAt(0).toUpperCase() || 'H'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Bugünkü pratik alanın</p>
              <h1 className="text-white text-2xl font-black tracking-tight">Testler</h1>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const incomplete = shortTests.find(t => !latestResults[`short_${t._realCategoryId}`]);
                const target = incomplete || shortTests[0];
                if (target) navigate(`/dashboard/exams/short-test/${target._realCategoryId}`);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-warning/15 border border-warning/20 text-warning rounded-xl text-xs font-black uppercase tracking-wider hover:bg-warning/25 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-warning" /> Hızlı Çöz
            </button>
            <button
              onClick={() => navigate('/dashboard/stats')}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-500/25 transition-all"
            >
              <Target className="w-3.5 h-3.5" /> İlerleme Takibi
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
            const isActive = activeTab === tab.id || (tab.id === 'general' && activeTab === 'real_sim_cat');
            return (
              <button
                key={tab.id}
                onClick={() => {
                  handleTabChange(tab.id);
                }}
                className={`flex-1 text-center py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
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

        {/* Accordion list for Kısa Testler */}
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
                  
                  // Find a matching category in validCategories for category color/icon if available
                  const matchedCat = validCategories.find(c => c.name === groupName || getCategoryName(c._id) === groupName);
                  const categoryColor = matchedCat?.color || '#6366f1';

                  return (
                    <div
                      key={groupName}
                      className="border border-white/5 bg-[#171927]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-md"
                    >
                      {/* Header */}
                      <button
                        onClick={() => toggleCategory(groupName)}
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
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
                          <p className="text-[11px] text-text-muted mt-0.5">{count} Soru • Süreli değil</p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-text-muted transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-white' : ''
                          }`}
                        />
                      </button>

                      {/* Children List */}
                      {isExpanded && (
                        <div className="border-t border-white/5 bg-black/15 divide-y divide-white/5 px-2">
                          {groupExams.map((exam) => {
                            const resultKey = `short_${exam._realCategoryId}`;
                            const lastResult = latestResults[resultKey];
                            const score = Number(lastResult?.score || 0);
                            const completed = Boolean(lastResult);
                            const passed = Boolean(lastResult?.passed);
                            const isLocked = exam.isPro && !user?.proStatus;

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
                                      navigate('/dashboard/settings?tab=pro');
                                      return;
                                    }
                                    navigate(`/dashboard/exams/short-test/${exam._realCategoryId}`);
                                  }}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${
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

        {/* Deneme Tab: lists both standard general denemes and MEB simulators */}
        {(activeTab === 'general' || activeTab === 'real_sim_cat') && (
          <div className="space-y-4">
            {/* Real MEB simulator card at the top (prominent like Flutter) */}
            {realSimExams.map((exam) => {
              const resultKey = exam._id;
              const lastResult = latestResults[resultKey];
              const score = Number(lastResult?.score || 0);
              const completed = Boolean(lastResult);
              const passed = Boolean(lastResult?.passed);
              
              return (
                <div
                  key={exam._id}
                  className="relative overflow-hidden rounded-2xl border border-success/20 bg-gradient-to-br from-success/[0.04] to-transparent p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 text-success flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20">
                        MEB E-SINAV
                      </span>
                      {completed && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          passed ? 'bg-success/15 text-success border-success/20' : 'bg-danger/15 text-danger border-danger/20'
                        }`}>
                          {passed ? 'GEÇİLDİ' : 'TEKRAR'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-white font-black text-base">{exam.name}</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{exam.description}</p>
                  </div>

                  {completed && (
                    <div className="mt-4 rounded-xl bg-black/25 p-3 border border-white/5">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1.5">
                        <span className={passed ? 'text-success' : 'text-danger'}>{passed ? 'BAŞARILI' : 'TAMAMLANDI'}</span>
                        <span className="text-white">{score}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${passed ? 'bg-success' : 'bg-danger'}`}
                          style={{ width: `${Math.max(5, score)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-wider py-3 border-y border-white/5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary-light" /> {exam.duration || 45} DK
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-1">
                      <FileQuestion className="w-3.5 h-3.5 text-warning" /> 50 SORU
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/dashboard/exams/real-test/${user?.selectedCategoryId}`)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 py-3 bg-success hover:bg-success/90 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-success/10 transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" /> Sınavı Başlat
                  </button>
                </div>
              );
            })}

            {/* Standard Denemes */}
            <div className="space-y-3">
              <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider px-1">Deneme Sınavları</h4>
              {generalExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <Target className="w-10 h-10 text-text-muted opacity-30 mb-2" />
                  <p className="text-xs text-text-muted">Deneme sınavı bulunamadı.</p>
                </div>
              ) : (
                generalExams.map((exam) => {
                  const resultKey = exam._id;
                  const lastResult = latestResults[resultKey];
                  const score = Number(lastResult?.score || 0);
                  const completed = Boolean(lastResult);
                  const passed = Boolean(lastResult?.passed);
                  const isLocked = exam.isPro && !user?.proStatus;

                  return (
                    <div
                      key={exam._id}
                      className="p-4 rounded-2xl border border-white/5 bg-[#171927]/60 shadow-md flex items-center gap-3.5"
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
                            navigate('/dashboard/settings?tab=pro');
                            return;
                          }
                          navigate(`/dashboard/exams/${exam._id}`);
                        }}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${
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
          </div>
        )}

        {/* Yanlışlarım Tab */}
        {activeTab === 'wrong_answers' && (
          <div className="space-y-4">
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
                  <ListChecks className="h-6 w-6" />
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
                className={`mt-4 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
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
    </>
  );
};

export default UserExams;
