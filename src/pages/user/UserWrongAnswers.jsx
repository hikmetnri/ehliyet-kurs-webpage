import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Play,
  RefreshCw,
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
  const [questions, setQuestions] = useState([]);
  const [dueQuestions, setDueQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dueLoading, setDueLoading] = useState(true);
  const [error, setError] = useState('');

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
      const res = await api.get('/wrong-answers/review-due?limit=100');
      const dueItems = readApiList(res);
      const hydrated = await hydrateWrongAnswers(api, dueItems);
      setDueQuestions(hydrated);
    } catch {
      setDueQuestions([]);
    } finally {
      setDueLoading(false);
    }
  }, []);

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
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm font-bold text-danger">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-danger/20 bg-danger/10 text-danger">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">{questions.length} yanlış soru</p>
              <p className="mt-1 text-xs font-semibold text-text-muted">
                {dueLoading
                  ? 'Tekrar zamanı kontrol ediliyor.'
                  : dueCount > 0
                    ? `${dueCount} soru bugün tekrar edilebilir.`
                    : 'İstersen tüm yanlışlarını tekrar çözebilirsin.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={loadWrongAnswers}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Yenile
            </button>
            <button
              onClick={() => navigate('/dashboard/exams/wrong-answers')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-danger/20 transition hover:scale-[1.01] active:scale-95"
            >
              <Play className="h-4 w-4" />
              Çöz
            </button>
          </div>
        </div>

        {dueCount > 0 && (
          <button
            onClick={() => navigate('/dashboard/exams/wrong-review')}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-light transition hover:bg-primary/20"
          >
            <ClipboardList className="h-4 w-4" />
            Bugün Çözülecekleri Aç
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {questions.map((question, index) => {
          const id = normalizeId(question._id || question.questionId);
          const isDueToday = dueIds.has(id);
          const correctReviewCount = getCorrectReviewCount(question);
          return (
            <MotionDiv
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: Math.min(index * 0.012, 0.08) }}
              className={`rounded-2xl border bg-white/[0.03] p-4 ${
                isDueToday ? 'border-primary/25' : 'border-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
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
                      {correctReviewCount}/4 doğru tekrar
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
    </div>
  );
};

export default UserWrongAnswers;
