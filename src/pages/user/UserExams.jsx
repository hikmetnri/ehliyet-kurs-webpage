import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Clock, Lock,
  Loader2, BookOpen, Target, FileQuestion,
  Play, ListChecks, AlertCircle, GraduationCap, CheckCircle2, XCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const UserExams = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [validCategories, setValidCategories] = useState([]);
  const [latestResults, setLatestResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('short_tests'); // 'short_tests' | 'general' | 'real_sim_cat'
  const [activeShortGroup, setActiveShortGroup] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Tüm kategorileri çek
        const catRes = await api.get('/categories/all');
        const allCategories = catRes.data?.data || catRes.data || [];

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
        const [examRes, resultRes] = await Promise.all([
          api.get('/exams'),
          api.get('/exam-results').catch(() => ({ data: [] })),
        ]);
        const allExams = examRes.data?.exams || examRes.data || [];
        const resultRows = resultRes.data?.results || resultRes.data || [];
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

  const categoryExams = exams.filter(e => e.categoryId);
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
    <div className="space-y-7 pb-10 text-white">
      
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Sınav Merkezi</h1>
          <p className="text-text-muted text-sm font-medium">Seçili paket: <span className="text-primary-light font-black uppercase tracking-widest">{user?.selectedCategoryName}</span></p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-text-muted">
          <ClipboardList className="h-4 w-4 text-primary-light" />
          {generalExams.length} deneme · {shortTests.length} kısa test
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
             <ListChecks className="w-6 h-6 text-primary-light" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tighter leading-none">{exams.length}</p>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Toplam Sınav</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
             <BookOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tighter leading-none">{shortTests.length}</p>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Konu Testi</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
             <Target className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tighter leading-none">{generalExams.length}</p>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Genel Deneme</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'short_tests') setActiveShortGroup('all');
            }}
            className={`group flex min-h-[82px] items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              activeTab === tab.id ? 'border-white/20 bg-white/15' : 'border-white/10 bg-black/10 text-primary-light'
            }`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black tracking-tight">{tab.label}</span>
              <span className={`mt-1 block text-xs font-semibold ${activeTab === tab.id ? 'text-white/75' : 'text-text-muted'}`}>{tab.hint}</span>
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${activeTab === tab.id ? 'bg-white/15 text-white' : 'bg-white/5 text-text-muted'}`}>
              {tab.count}
            </span>
          </button>
          );
        })}
      </div>

      {activeTab === 'short_tests' && (
        <div className="glass-card rounded-2xl border border-white/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">Kısa Test Kategorileri</p>
              <p className="text-xs font-semibold text-text-muted">Konu grubunu seç, alt testleri düz listede gör.</p>
            </div>
            <span className="hidden rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-text-muted sm:block">
              {displayedExams.length} test
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
                  className={`rounded-xl border px-4 py-2.5 text-xs font-black transition-all ${
                    active
                      ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                      : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {label}
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-white/15 text-white' : 'bg-white/5 text-text-muted'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Exam Grid */}
      {loading ? (
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

          return (
            <motion.div
              layout
              key={exam._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, delay: Math.min(i * 0.015, 0.09) }}
              className={`glass-card p-6 rounded-2xl border flex flex-col gap-5 transition-all duration-300 relative overflow-hidden group ${
                isLocked
                  ? 'border-warning/20 opacity-80'
                  : completed
                    ? passed
                      ? 'border-success/25 bg-success/[0.035] hover:border-success/40 hover:bg-success/[0.06]'
                      : 'border-danger/25 bg-danger/[0.035] hover:border-danger/40 hover:bg-danger/[0.06]'
                    : 'border-white/5 hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10'
              }`}
            >
              {/* Top badges */}
              <div className="flex items-start justify-between gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                  isGeneral
                    ? 'bg-warning/10 border-warning/30 text-warning'
                    : isSimulation
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'bg-primary/10 border-primary/30 text-primary-light'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isLocked && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-warning/10">
                      <Lock className="w-3 h-3" /> PRO ÜYELİK
                    </span>
                  )}
                  {completed && (
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      passed
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-danger/10 text-danger border-danger/20'
                    }`}>
                      {passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {passed ? 'GEÇİLDİ' : 'TEKRAR'}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    isGeneral
                      ? 'bg-warning/10 text-warning border-warning/20'
                      : isSimulation
                        ? 'bg-success/10 text-success border-success/20'
                      : isShort 
                        ? 'bg-primary/10 text-primary-light border-primary/20'
                        : 'bg-primary/10 text-primary-light border-primary/20'
                  }`}>
                    {badgeLabel}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-black text-xl tracking-tight leading-tight mb-2 group-hover:text-primary-light transition-colors">{exam.name}</h3>
                {catName && <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mb-3">{catName}</p>}
                {exam.description && (
                  <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">{exam.description}</p>
                )}
              </div>

              {completed && (
                <div className="rounded-xl border border-white/5 bg-black/10 p-3">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className={passed ? 'text-success' : 'text-danger'}>{passed ? 'Başarılı' : 'Tamamlandı'}</span>
                    <span className="text-white">{score}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${passed ? 'bg-success' : 'bg-danger'}`}
                      style={{ width: `${Math.max(4, Math.min(score, 100))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 py-4 mt-auto border-y border-white/5 text-[11px] font-black text-text-muted uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary-light" /> {exam.duration || 45} Dakika
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <FileQuestion className="w-4 h-4 text-warning" /> Çoktan Seçmeli
                </div>
              </div>

              {/* CTA */}
              <button
                disabled={isLocked}
                onClick={() => navigate(
                   isSimulation ? `/dashboard/exams/real-test/${user?.selectedCategoryId}` :
                   isShort ? `/dashboard/exams/short-test/${exam._realCategoryId}` : 
                   `/dashboard/exams/${exam._id}`
                )}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  isLocked
                    ? 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
                    : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95'
                }`}
              >
                <Play className="w-5 h-5" />
                {isLocked ? 'KİLİDİ AÇ' : 'TESTİ BAŞLAT'}
              </button>
            </motion.div>
          );
        };
 
        return (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayedExams.map((exam, i) => renderExamCard(exam, i))}
            </AnimatePresence>
          </motion.div>
        );
      })()}
    </div>
  );
};

export default UserExams;
