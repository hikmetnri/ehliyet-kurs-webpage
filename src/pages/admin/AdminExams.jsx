import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { TEST_TYPES } from '../../constants/testTypes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, RefreshCw, Shield, Zap, BookOpen, HardHat,
  HelpCircle, Send, Image as ImageIcon, AlertCircle,
} from 'lucide-react';
import { isVideoCategory } from '../../utils/categoryContent';
import { fetchAllQuestions } from '../../utils/questionPages';

// ─── Extracted Modules (SRP) ──────────────────────────────────────────────────
import {
  getCategoryGroup,
  getCategoryGroupFromText,
  getExamCategoryGroup,
  normalizeTestType,
  resolveExamTestType,
  questionExamId,
} from './exams/examConstants';
import { ExamOverviewCard } from './exams/ExamUiBits';
import { ShortTestTab, ExamQuestionsTab } from './exams/ExamTypeTabs';

// ─── Main AdminExams Component ────────────────────────────────────────────────
const AdminExams = () => {
  const [activeCatFilter, setActiveCatFilter] = useState('b_class');
  const [activeTypeFilter, setActiveTypeFilter] = useState(TEST_TYPES.REAL_EXAM); // 'real_exam' | 'mock_exam' | 'short_test'
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [questionList, cRes, eRes] = await Promise.all([
        fetchAllQuestions(),
        api.get('/categories/all'),
        api.get('/exams?admin=true'), // Admin: taslaklar dahil tüm sınavlar
      ]);
      setQuestions(questionList);
      setCategories(cRes.data.data || []);
      setExams(Array.isArray(eRes.data) ? eRes.data : (eRes.data.data || eRes.data || []));
    } catch (err) {
      console.error('Veri çekme hatası:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Sınav verileri alınamadı. Bağlantınızı kontrol edip yeniden deneyin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  // Sınav Merkezi yalnızca gerçek sınavların iki resmi kökünü gösterir.
  const rootCategories = categories.filter(c => !c.parent?._id && !c.parent && !isVideoCategory(c));
  const examCategoryRoots = rootCategories.filter(category => Boolean(getCategoryGroupFromText(category.name)));

  // Tür bazlı sınav/soru filtreleme
  const allTypedExams = exams
    .filter(exam => !exam.isMiniTest)
    .map(exam => ({ ...exam, _resolvedTestType: resolveExamTestType(exam, questions) }));
  const typeExams = allTypedExams.filter(
    exam => exam._resolvedTestType === activeTypeFilter,
  );
  const filteredExams = typeExams.filter(
    exam => getExamCategoryGroup(exam, categories) === activeCatFilter,
  );
  const filteredExamIds = new Set(filteredExams.map(exam => exam._id?.toString()));
  const filteredQuestions = questions.filter(question => {
    if (normalizeTestType(question.testType) !== activeTypeFilter) return false;
    const examId = questionExamId(question)?.toString();
    if (examId) return filteredExamIds.has(examId);
    return getCategoryGroup(question.category, categories) === activeCatFilter;
  });

  const realCount = filteredQuestions.length;
  const activeExamCount = filteredExams.filter(e => e.isActive !== false).length;
  const publishedExamCount = filteredExams.filter(e => e.isPublished !== false).length;
  const imageQuestionCount = filteredQuestions.filter(q => q.media).length;

  // Sekme başlığı ve açıklamaları
  const typeMeta = {
    [TEST_TYPES.REAL_EXAM]: {
      kicker: 'Gerçek Sınav Yönetimi',
      title: 'Sınav Merkezi',
      desc: 'B Sınıfı ve İş Makinesi gerçek sınavlarını, soru dağılımlarını ve yayın durumlarını yönetin.',
      label: 'Gerçek Sınav',
    },
    [TEST_TYPES.MOCK_EXAM]: {
      kicker: 'Deneme Sınavı Yönetimi',
      title: 'Deneme Sınavları',
      desc: 'B Sınıfı ve İş Makinesi deneme sınavlarını, soru dağılımlarını ve yayın durumlarını yönetin.',
      label: 'Deneme Sınavı',
    },
    [TEST_TYPES.SHORT_TEST]: {
      kicker: 'Kısa Test Yönetimi',
      title: 'Kısa Testler',
      desc: 'Konu bazlı kısa testleri ve soru dağılımlarını yönetin.',
      label: 'Kısa Test',
    },
  }[activeTypeFilter];

  const isShort = activeTypeFilter === TEST_TYPES.SHORT_TEST;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <section className="rounded-[26px] border border-[#243044] bg-[#101725] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFB85C]">{typeMeta.kicker}</p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-white">{typeMeta.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-[#8F9BB0]">{typeMeta.desc}</p>
          </div>
          <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-text-secondary hover:text-white hover:bg-white/10 transition-all self-start sm:self-auto">
            <RefreshCw className="w-4 h-4" /> Yenile
          </button>
        </div>

        {/* Sınav Türü Seçimi */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-[#243044] bg-[#0B1220] p-1.5 sm:max-w-lg">
          {[
            { id: TEST_TYPES.REAL_EXAM, label: 'Gerçek Sınav', icon: Shield, color: 'text-[#AFA5FF]' },
            { id: TEST_TYPES.MOCK_EXAM, label: 'Deneme Sınavı', icon: Zap, color: 'text-[#FFB85C]' },
            { id: TEST_TYPES.SHORT_TEST, label: 'Kısa Test', icon: BookOpen, color: 'text-[#6EE7B7]' },
          ].map(item => {
            const Icon = item.icon;
            const active = activeTypeFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTypeFilter(item.id)}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black transition-all ${
                  active
                    ? 'border-[#7C6CFF]/35 bg-[#7C6CFF]/15 text-white'
                    : 'border-transparent text-[#8F9BB0] hover:bg-[#151E2E] hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? item.color : ''}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Kategori Filtresi (Kısa Test hariç) */}
        {!isShort && (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-[#243044] bg-[#0B1220] p-1.5 sm:max-w-lg">
          {[
            { id: 'b_class', label: 'B Sınıfı', icon: Shield, color: 'text-[#AFA5FF]' },
            { id: 'is_makinesi', label: 'İş Makinesi', icon: HardHat, color: 'text-[#FFB85C]' },
          ].map(item => {
            const Icon = item.icon;
            const active = activeCatFilter === item.id;
            const categoryExists = examCategoryRoots.some(
              category => getCategoryGroupFromText(category.name) === item.id,
            );
            const count = typeExams.filter(
              exam => getExamCategoryGroup(exam, categories) === item.id,
            ).length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCatFilter(item.id)}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-black transition-all ${
                  active
                    ? 'border-[#7C6CFF]/35 bg-[#7C6CFF]/15 text-white'
                    : 'border-transparent text-[#8F9BB0] hover:bg-[#151E2E] hover:text-white'
                }`}
                title={categoryExists ? undefined : 'Bu kategori henüz oluşturulmamış'}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? item.color : ''}`} />
                <span className="truncate">{item.label}</span>
                <span className="rounded-lg bg-white/[0.06] px-1.5 py-0.5 text-[10px]">{count}</span>
              </button>
            );
          })}
          </div>
        )}
      </section>

      {!isShort && (
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <ExamOverviewCard icon={Shield} label={typeMeta.label} value={filteredExams.length} detail={`${activeExamCount} aktif`} color="text-warning" bg="bg-warning/10" border="border-warning/20" />
        <ExamOverviewCard icon={HelpCircle} label="Toplam Soru" value={realCount} color="text-primary-light" bg="bg-primary/10" border="border-primary/20" />
        <ExamOverviewCard icon={Send} label="Yayında" value={publishedExamCount} color="text-accent" bg="bg-accent/10" border="border-accent/20" />
        <ExamOverviewCard icon={ImageIcon} label="Görselli Soru" value={imageQuestionCount} color="text-success" bg="bg-success/10" border="border-success/20" />
      </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest">Yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-danger/20 bg-danger/5 px-6 py-20 text-center">
          <AlertCircle className="mb-4 h-10 w-10 text-danger" />
          <p className="font-bold text-white">Sınav sistemi yüklenemedi</p>
          <p className="mt-2 max-w-md text-sm text-text-muted">{error}</p>
          <button type="button" onClick={fetchData} className="mt-5 rounded-2xl border border-danger/30 bg-danger/15 px-5 py-2.5 text-sm font-black text-danger transition-colors hover:bg-danger/25">
            Yeniden Dene
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTypeFilter + activeCatFilter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {isShort ? (
              <ShortTestTab
                questions={questions}
                categories={categories}
                onRefresh={handleRefresh}
              />
            ) : (
              <ExamQuestionsTab
                questions={filteredQuestions}
                categories={categories}
                exams={filteredExams}
                allTypeExams={allTypedExams}
                onRefresh={handleRefresh}
                testType={activeTypeFilter}
                title={activeTypeFilter === TEST_TYPES.MOCK_EXAM ? 'Deneme Sınavı' : 'Gerçek Sınav'}
                activeCatFilter={activeCatFilter}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AdminExams;
