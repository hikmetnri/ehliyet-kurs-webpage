import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Inbox,
  Loader2,
  Play,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';
import {
  filterQuestionsToCategoryTree,
  hydrateWrongAnswers,
  normalizeId,
  readApiList,
} from '../../utils/wrongAnswers';

import GuestBlocker from '../../components/user/GuestBlocker';

const MotionDiv = motion.div;

const getTopic = (question) => (
  question.categoryName || question.subject || 'Yanlış soru'
);

const getCorrectReviewCount = (question) => (
  Math.max(0, Math.min(3, Number(question.reviewStage || 0)))
);

const UserWrongAnswers = ({ onCountChange }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  if (user?.isGuest) {
    return (
      <GuestBlocker 
        title="Yanlışlarınızı Takip Etmek İçin Üye Olun" 
        description="Çözdüğünüz testlerdeki hataları görmek, yanlışlarınızı tekrar çözerek ilerlemek ve istatistiklerinizi kaydetmek için lütfen ücretsiz üye olun. Misafir modunda yaptığınız yanlışlar üye olduğunuzda otomatik olarak hesabınıza aktarılacaktır."
      />
    );
  }

  const [questions, setQuestions] = useState([]);
  const [dueQuestions, setDueQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dueLoading, setDueLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  const loadWrongAnswers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [wrongRes, categoryRes] = await Promise.all([
        api.get('/wrong-answers'),
        user?.selectedCategoryId
          ? api.get('/categories/all').catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ]);

      const wrongItems = readApiList(wrongRes);
      const hydrated = await hydrateWrongAnswers(api, wrongItems);
      const categories = readApiList(categoryRes);
      const scoped = filterQuestionsToCategoryTree(
        hydrated,
        categories,
        normalizeId(user?.selectedCategoryId),
      );

      setQuestions(scoped);
      onCountChange?.(scoped.length);
    } catch (err) {
      setError(err.response?.data?.error || 'Yanlış sorular alınamadı.');
      setQuestions([]);
      onCountChange?.(0);
    } finally {
      setLoading(false);
    }
  }, [onCountChange, user?.selectedCategoryId]);

  const loadDueQuestions = useCallback(async () => {
    try {
      setDueLoading(true);
      const [dueRes, categoryRes] = await Promise.all([
        api.get('/wrong-answers/review-due?limit=100'),
        user?.selectedCategoryId
          ? api.get('/categories/all').catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ]);
      const dueItems = readApiList(dueRes);
      const hydrated = await hydrateWrongAnswers(api, dueItems);
      const scoped = filterQuestionsToCategoryTree(
        hydrated,
        readApiList(categoryRes),
        normalizeId(user?.selectedCategoryId),
      );
      setDueQuestions(scoped);
    } catch {
      setDueQuestions([]);
    } finally {
      setDueLoading(false);
    }
  }, [user?.selectedCategoryId]);

  useEffect(() => {
    loadWrongAnswers();
    loadDueQuestions();
  }, [loadWrongAnswers, loadDueQuestions]);

  const dueIds = useMemo(
    () => new Set(dueQuestions.map((question) => normalizeId(question._id || question.questionId))),
    [dueQuestions],
  );
  const dueCount = useMemo(
    () => questions.filter((question) => dueIds.has(normalizeId(question._id || question.questionId))).length,
    [dueIds, questions],
  );
  const inProgressCount = useMemo(
    () => questions.filter((question) => getCorrectReviewCount(question) > 0).length,
    [questions],
  );
  const visibleQuestions = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('tr-TR');
    return questions.filter((question) => {
      const id = normalizeId(question._id || question.questionId);
      const isDueToday = dueIds.has(id);
      const correctReviewCount = getCorrectReviewCount(question);
      const matchesFilter = (
        filterMode === 'all' ||
        (filterMode === 'due' && isDueToday) ||
        (filterMode === 'in_progress' && correctReviewCount > 0)
      );
      const searchable = `${question.text || ''} ${getTopic(question)}`.toLocaleLowerCase('tr-TR');
      return matchesFilter && searchable.includes(query);
    });
  }, [dueIds, filterMode, questions, searchTerm]);
  const filterOptions = [
    { id: 'all', label: 'Tümü', count: questions.length },
    { id: 'due', label: 'Bugün', count: dueCount },
    { id: 'in_progress', label: 'Tekrarda', count: inProgressCount },
  ];

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-text-muted">Yanlışların yükleniyor...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
        <h3 className="text-lg font-black text-white">Harika gidiyorsun</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-text-muted">
          Çözdüğün testlerde açıkta kalan yanlış soru yok. Yeni test çözdükçe burası otomatik güncellenir.
        </p>
        <button
          onClick={() => navigate('/dashboard/exams')}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition hover:scale-[1.01] active:scale-95"
        >
          <Play className="h-4 w-4" />
          Test Çöz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm font-bold text-danger">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-danger">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-white">Yanlış Soru Tekrarı</p>
              <p className="mt-1 text-sm font-semibold text-text-muted">
                {dueLoading
                  ? 'Tekrar zamanı kontrol ediliyor.'
                  : dueCount > 0
                    ? `${dueCount} soru bugün tekrar edilebilir.`
                    : 'İstersen tüm yanlışlarını tekrar çözebilirsin.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-2">
            {[
              ['Toplam', questions.length],
              ['Bugün', dueCount],
              ['Tekrarda', inProgressCount],
            ].map(([label, value]) => (
              <div key={label} className="min-w-20 rounded-xl bg-white/[0.035] px-3 py-2 text-center">
                <p className="text-base font-black text-white">{value}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={loadWrongAnswers}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Yenile
            </button>
            <button
              type="button"
              onClick={() => navigate(dueCount > 0 ? '/dashboard/exams/wrong-review' : '/dashboard/exams/wrong-answers')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-danger px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-500"
            >
              <Play className="h-4 w-4" />
              {dueCount > 0 ? 'Bugünü Çöz' : 'Yanlışları Çöz'}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <Search className="mr-3 h-5 w-5 text-primary-light" />
            <input
              type="text"
              placeholder="Yanlış sorularda ara..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full border-none bg-transparent text-sm font-semibold text-white outline-none placeholder:text-text-muted"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar xl:pb-0">
            {filterOptions.map((option) => {
              const active = filterMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilterMode(option.id)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                    active
                      ? 'border-primary/35 bg-primary/15 text-primary-light'
                      : 'border-white/10 bg-white/[0.03] text-text-muted hover:border-white/20 hover:text-white'
                  }`}
                >
                  {option.label}
                  <span className="ml-2 opacity-70">{option.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
          <span>{visibleQuestions.length} soru listeleniyor</span>
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} className="text-primary-light hover:text-white">
              Aramayı temizle
            </button>
          )}
        </div>
      </section>

      {visibleQuestions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
          <Inbox className="mx-auto mb-4 h-12 w-12 text-white/15" />
          <h3 className="text-base font-black text-white">Bu filtrede soru yok</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-text-muted">
            Arama metnini veya tekrar filtresini değiştirerek yanlış soru listeni tekrar görüntüleyebilirsin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {visibleQuestions.map((question, index) => {
          const id = normalizeId(question._id || question.questionId);
          const isDueToday = dueIds.has(id);
          const correctReviewCount = getCorrectReviewCount(question);
          return (
            <MotionDiv
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: Math.min(index * 0.012, 0.08) }}
              className={`rounded-3xl border bg-white/[0.025] p-4 ${
                isDueToday ? 'border-primary/25' : 'border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                  isDueToday
                    ? 'border-primary/25 bg-primary/10 text-primary-light'
                    : 'border-danger/20 bg-danger/10 text-danger'
                }`}>
                  {isDueToday ? <ClipboardList className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-[11px] font-black uppercase tracking-widest text-text-muted">
                      {getTopic(question)}
                    </p>
                    {isDueToday && (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary-light">
                        Bugün
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-relaxed text-white">
                    {question.text}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-widest text-success">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {correctReviewCount}/3 doğru tekrar
                    </span>
                    <span className="flex items-center gap-1">
                      {[0, 1, 2].map((step) => (
                        <span
                          key={step}
                          className={`h-1.5 w-5 rounded-full ${
                            step < correctReviewCount
                              ? 'bg-success'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </MotionDiv>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default UserWrongAnswers;
