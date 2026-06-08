import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Clock, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, BarChart2,
  Send, RefreshCw, Home, Flag, BookOpen, Star, ListChecks, X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ReportQuestionModal from '../../components/user/ReportQuestionModal';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { trackEvent } from '../../utils/analytics';
import {
  filterQuestionsToCategoryTree,
  hydrateWrongAnswers,
  normalizeId,
  readApiList,
} from '../../utils/wrongAnswers';
import { clearAiPageContext, compactQuestionContext, setAiPageContext } from '../../utils/aiPageContext';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
const REVIEW_SESSION_LIMIT = 20;
const MotionDiv = motion.div;
const MotionButton = motion.button;

const cleanOptionText = (option, index) => {
  if (typeof option !== 'string') return option;
  const label = OPTION_LABELS[index];
  if (!label) return option.trim();
  return option.replace(new RegExp(`^\\s*${label}\\s*[).:\\-]\\s*`, 'i'), '').trim();
};

// ─── Timer Hook ──────────────────────────────────────────────────────────────
const useTimer = (durationMinutes, onExpire, active = false) => {
  const durationSeconds = Math.max(1, durationMinutes || 45) * 60;
  const [timerState, setTimerState] = useState({
    durationSeconds,
    remaining: durationSeconds,
  });
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  const remaining = timerState.durationSeconds === durationSeconds
    ? timerState.remaining
    : durationSeconds;

  const setRemaining = useCallback((updater) => {
    setTimerState((prev) => {
      const current = prev.durationSeconds === durationSeconds
        ? prev.remaining
        : durationSeconds;
      const nextRemaining = typeof updater === 'function'
        ? updater(current)
        : updater;
      return {
        durationSeconds,
        remaining: nextRemaining,
      };
    });
  }, [durationSeconds]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!active) return undefined;
    if (remaining <= 0) { onExpireRef.current?.(); return undefined; }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); onExpireRef.current?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, remaining, setRemaining]);

  const stop = () => clearInterval(intervalRef.current);

  const formatted = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  const pct = ((durationSeconds - remaining) / durationSeconds) * 100;
  const isWarning = remaining < 300; // < 5 min
  const isDanger = remaining < 60;

  return { formatted, pct, isWarning, isDanger, stop, remaining };
};

// ─── Result Screen ────────────────────────────────────────────────────────────
const ResultScreen = ({ questions, answers, exam, reviewSync, onRetry, onHome }) => {
  let correct = 0, wrong = 0, empty = 0;
  questions.forEach((q, i) => {
    if (answers[i] === undefined || answers[i] === null) empty++;
    else if (answers[i] === q.correctAnswer) correct++;
    else wrong++;
  });
  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= 70;
  const isReview = exam?.testType === 'wrong_review' || exam?._id === 'wrong_review_today';
  const isWrongPool = exam?.testType === 'wrong_answers' || exam?._id === 'wrong_answers_all';
  const isAdaptiveReview = isReview || isWrongPool;
  const reviewSummary = reviewSync?.summary || {};
  const resultTone = isAdaptiveReview ? (wrong === 0 ? 'success' : 'primary') : (passed ? 'success' : 'danger');
  const toneClasses = {
    success: 'border-success bg-success/10 shadow-success/20 text-success',
    primary: 'border-primary bg-primary/10 shadow-primary/20 text-primary-light',
    danger: 'border-danger bg-danger/10 shadow-danger/20 text-danger',
  }[resultTone];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-3 sm:p-6">
      <MotionDiv
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-full max-w-2xl glass-card rounded-3xl border border-white/10 p-5 text-center shadow-2xl sm:p-10"
      >
        {/* Score Circle */}
        <div className={`w-32 h-32 rounded-full mx-auto mb-8 flex flex-col items-center justify-center border-4 shadow-xl ${toneClasses}`}>
          <span className="text-4xl font-black">{score}</span>
          <span className="text-xs text-white/50 font-bold">{isAdaptiveReview ? 'BAŞARI' : 'PUAN'}</span>
        </div>

        <h2 className={`text-2xl font-black tracking-tight mb-2 ${
          isAdaptiveReview ? 'text-primary-light' : passed ? 'text-success' : 'text-danger'
        }`}>
          {isReview
            ? 'Tekrar Tamamlandı'
            : isWrongPool
              ? 'Yanlışlar Güncellendi'
              : passed ? 'Tebrikler, Geçtiniz!' : 'Maalesef Kaldınız'}
        </h2>
        <p className="text-text-muted text-sm mb-8 font-medium">
          {isReview
            ? `Bugünkü tekrar testi bitti. 4 kez doğru yapılan sorular tamamlandı; diğer doğrular ileriki bir güne bırakıldı.`
            : isWrongPool
              ? 'Doğru yaptığın sorular tekrar aşamasında ilerledi. Bir soru 4 doğru tekrardan sonra öğrenildi sayılır.'
            : `${exam?.name} sınavı sonuçlandı. ${passed ? 'Harika bir performans!' : 'Bir sonraki denemede başarılar!'}`}
        </p>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-success/10 border border-success/20 rounded-2xl p-4">
            <p className="text-2xl font-black text-success">{correct}</p>
            <p className="text-[10px] font-bold text-success/70 uppercase tracking-widest mt-1">Doğru</p>
          </div>
          <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4">
            <p className="text-2xl font-black text-danger">{wrong}</p>
            <p className="text-[10px] font-bold text-danger/70 uppercase tracking-widest mt-1">Yanlış</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-2xl font-black text-text-muted">{empty}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Boş</p>
          </div>
        </div>

        {reviewSync?.status && reviewSync.status !== 'idle' && (
          <div className={`mb-8 flex items-start gap-3 rounded-2xl border p-4 text-left ${
            reviewSync.status === 'success'
              ? 'border-primary/20 bg-primary/10 text-primary-light'
              : 'border-warning/20 bg-warning/10 text-warning'
          }`}>
            {reviewSync.status === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div>
              <p className="text-xs font-black uppercase tracking-widest">
                {reviewSync.status === 'success'
                  ? isReview ? 'Tekrar Sonuçları Kaydedildi' : 'Yanlışlar Kaydedildi'
                  : 'Yanlışlar Kaydedilemedi'}
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-white/80">
                {reviewSync.status === 'success'
                  ? isAdaptiveReview
                    ? [
                        reviewSummary.masteredCount > 0 ? `${reviewSummary.masteredCount} soru öğrenildi ve artık tekrar listesinde görünmeyecek.` : '',
                        reviewSummary.postponedCount > 0 ? `${reviewSummary.postponedCount} doğru soru ileriki bir güne bırakıldı.` : '',
                        reviewSummary.wrongCount > 0 ? `${reviewSummary.wrongCount} yanlış soru tekrar listesinde kaldı.` : '',
                      ].filter(Boolean).join(' ') || 'Tekrar sonuçların kaydedildi.'
                    : reviewSync.wrongCount > 0
                      ? `${reviewSync.wrongCount} yanlış cevap tekrar listene eklendi.`
                      : 'Bu sınavda yeni yanlış yok; tekrar listen güncellendi.'
                  : 'Sonuç ekranı kaydedildi, ancak yanlış cevaplar şu an tekrar listesine eklenemedi.'}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> {isReview || isWrongPool ? 'Kalanları Göster' : 'Tekrar Çöz'}
          </button>
          
          {isReview ? (
            <button
              onClick={() => onHome('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <Home className="w-4 h-4" /> Ana Sayfaya Dön
            </button>
          ) : exam?._id?.startsWith('short_test_') ? (
            <button
              onClick={() => onHome('/dashboard/lessons')}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-success text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-success/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <BookOpen className="w-4 h-4" /> Derslere Dön
            </button>
          ) : (
            <button
              onClick={() => onHome('/dashboard/exams')}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <Home className="w-4 h-4" /> Sınav Merkezine Dön
            </button>
          )}
        </div>
      </MotionDiv>
    </div>
  );
};

// ─── Main Exam Solve Component ────────────────────────────────────────────────
const UserExamSolve = ({ customType }) => {
  const { examId, categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { questionIndex: optionIndex }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'solving' | 'result'
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [reviewSync, setReviewSync] = useState({ status: 'idle', wrongCount: 0 });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/users/favorites');
      const ids = res.data.favorites.map(f => f._id || f);
      setFavoriteIds(ids);
    } catch {
      // Favori listesi yüklenemezse sınav akışı devam edebilir.
    }
  };

  const toggleFavorite = async (qId) => {
    if (favLoading) return;
    setFavLoading(true);
    const isFav = favoriteIds.includes(qId);
    try {
      if (isFav) {
        await api.delete(`/users/favorites/${qId}`);
        setFavoriteIds(prev => prev.filter(id => id !== qId));
      } else {
        await api.post(`/users/favorites/${qId}`);
        setFavoriteIds(prev => [...prev, qId]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        if (customType === 'short_test') {
          // Synthetic exam based on category questions
          const [qRes, catRes] = await Promise.all([
            api.get(`/questions?category=${categoryId}&testType=short_test`),
            api.get(`/categories/${categoryId}`)
          ]);
          const qs = qRes.data || [];
          setQuestions(qs);
          setExam({
            _id: `short_test_${categoryId}`,
            name: `${catRes.data?.data?.name || 'Konu'} Kısa Testi`,
            categoryName: catRes.data?.data?.name || 'Konu Testi',
            description: 'Bu kategorideki konulardan oluşan özel test.',
            duration: Math.max(10, Math.ceil(qs.length * 1.5)), // ~1.5 min per question
            categoryId: categoryId
          });
        } else if (customType === 'real_test') {
          // Real MEB Simulator
          const qRes = await api.get('/questions');
          let allQ = qRes.data || [];
          // Random 50 questions
          allQ = allQ.sort(() => 0.5 - Math.random()).slice(0, 50);
          
          setQuestions(allQ);
          setExam({
            _id: `real_test_${categoryId}`,
            name: `E-Sınav Simülatörü`,
            categoryName: 'Karma Simülasyon',
            description: 'MEB formatında 50 soruluk gerçek elektronik sınav simülasyonu. Anında geri bildirim yoktur, süreyi verimli kullanın.',
            duration: 45,
            categoryId: categoryId
          });
        } else if (customType === 'wrong_review') {
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
          const qs = scoped.filter((question) => (
            question._id && question.text && Array.isArray(question.options) && question.options.length > 0
          )).slice(0, REVIEW_SESSION_LIMIT);
          const reviewTotalCount = scoped.length;

          setQuestions(qs);
          setExam({
            _id: 'wrong_review_today',
            name: 'Bugün Çözülecek Yanlışlar',
            categoryName: 'Yanlış Tekrarı',
            description: 'Bugün yeniden çözmen gereken yanlış sorulardan oluşan kişisel çalışma testi.',
            duration: Math.max(10, Math.ceil(qs.length * 1.5)),
            categoryId: user?.selectedCategoryId || null,
            reviewTotalCount,
            reviewSessionLimit: REVIEW_SESSION_LIMIT,
            testType: 'wrong_review',
          });
        } else if (customType === 'wrong_answers') {
          const [wrongRes, categoryRes] = await Promise.all([
            api.get('/wrong-answers'),
            user?.selectedCategoryId
              ? api.get('/categories/all').catch(() => ({ data: [] }))
              : Promise.resolve({ data: [] }),
          ]);
          const wrongItems = readApiList(wrongRes);
          const hydrated = await hydrateWrongAnswers(api, wrongItems);
          const scoped = filterQuestionsToCategoryTree(
            hydrated,
            readApiList(categoryRes),
            normalizeId(user?.selectedCategoryId),
          );
          const qs = scoped.filter((question) => (
            question._id && question.text && Array.isArray(question.options) && question.options.length > 0
          ));

          setQuestions(qs);
          setExam({
            _id: 'wrong_answers_all',
            name: 'Yanlışlar Testi',
            categoryName: 'Yanlışlarım',
            description: 'Yanlış yaptığın sorulardan oluşan kişisel tekrar testi.',
            duration: Math.max(10, Math.ceil(qs.length * 1.5)),
            categoryId: user?.selectedCategoryId || null,
            testType: 'wrong_answers',
          });
        } else {
          // Normal exam
          const [examRes, qRes] = await Promise.all([
            api.get(`/exams/${examId}`),
            api.get(`/questions?exam=${examId}`),
          ]);
          const examData = examRes.data?.exam || examRes.data;
          setExam({
            ...examData,
            categoryName: examData.categoryId?.name || examData.categoryName || 'Genel Sınav'
          });
          setQuestions(qRes.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, categoryId, customType, user?.selectedCategoryId, reloadKey]);

  const forceRealMode = searchParams.get('mode') === 'real';
  const mode = forceRealMode ? 'real' :
               customType === 'short_test' ? 'short' :
               customType === 'wrong_review' ? 'review' :
               customType === 'wrong_answers' ? 'wrong' :
               customType === 'real_test' ? 'real' :
               (exam?.name && !exam.name.toLowerCase().includes('deneme') ? 'real' : 'mock');
  const persistedTestType = mode === 'real'
    ? 'real_exam'
    : customType || (exam?.categoryId ? 'mock_exam' : 'exam');
               
  const showFeedback = mode === 'short' || mode === 'mock' || mode === 'review' || mode === 'wrong';
  const reviewTotalCount = exam?.reviewTotalCount || questions.length;
  const reviewPendingAfterSession = Math.max(0, reviewTotalCount - questions.length);

  const handleExpire = useCallback(() => {
    handleSubmit(true);
  }, [answers, questions]);

  const timer = useTimer(exam?.duration || 45, handleExpire, phase === 'solving');

  const handleAnswer = (optionIdx) => {
    if (showFeedback && answers[currentIdx] !== undefined) return; // Kilitliyse tıklanamaz
    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const handleStartExam = () => {
    trackEvent(mode === 'review' ? 'wrong_review_started' : 'test_started', {
      examId: exam?._id,
      examName: exam?.name,
      mode,
      testType: customType || (exam?.categoryId ? 'mock_exam' : 'exam'),
      categoryId: typeof exam?.categoryId === 'object' ? exam?.categoryId?._id : exam?.categoryId,
      categoryName: exam?.categoryName || '',
      questionCount: questions.length,
      duration: exam?.duration || 45,
    });
    setPhase('solving');
  };

  const handleSubmit = async (forced = false) => {
    if (!forced && !window.confirm('Sınavı bitirmek istediğinize emin misiniz?')) return;
    timer.stop();
    setSubmitting(true);
    setReviewSync({ status: 'idle', wrongCount: 0 });

    try {
      let correct = 0, wrong = 0;
      const wrongQuestions = [];
      const correctQuestionIds = [];

      questions.forEach((q, i) => {
        const ans = answers[i];
        if (ans === q.correctAnswer) {
          correct++;
          correctQuestionIds.push(q._id);
        }
        else if (ans !== undefined) {
          wrong++;
          wrongQuestions.push({ 
            questionId: q._id, 
            questionText: q.text,
            options: q.options,
            userAnswer: ans,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            media: q.media || '',
            mediaDescription: q.mediaDescription || '',
            categoryId: typeof q.category === 'object' ? q.category?._id : q.category,
            categoryName: typeof q.category === 'object' ? q.category?.name : '',
            testType: q.testType,
            subject: q.subject || '',
          });
        }
      });

      const total = questions.length;
      const empty = total - correct - wrong;
      const score = total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 0;
      const passed = score >= 70;
      const timeSpentSecs = (exam?.duration || 45) * 60 - timer.remaining;
      const isReviewMode = customType === 'wrong_review';
      const isWrongPoolMode = customType === 'wrong_answers';

      const resultPayload = {
        examId: (customType === 'short_test' || customType === 'real_test' || isWrongPoolMode) ? null : examId,
        examName: exam?.name,
        testType: persistedTestType,
        categoryId: typeof exam?.categoryId === 'object' ? exam?.categoryId?._id : exam?.categoryId,
        categoryName: exam?.categoryName || (typeof exam?.categoryId === 'object' ? exam?.categoryId?.name : ''),
        totalQuestions: total,
        correctCount: correct,
        wrongCount: wrong,
        emptyCount: empty,
        score,
        passed,
        duration: Math.round(timeSpentSecs / 60),
        wrongQuestions,
      };

      const wrongAnswerPayload = {
        wrongQuestions,
        correctQuestionIds,
        categoryId: typeof exam?.categoryId === 'object' ? exam?.categoryId?._id : exam?.categoryId,
        categoryName: exam?.categoryName || (typeof exam?.categoryId === 'object' ? exam?.categoryId?.name : ''),
        testType: persistedTestType,
      };

      const syncWrongAnswers = async () => api.post('/wrong-answers/bulk', wrongAnswerPayload).then((res) => {
        setReviewSync({
          status: 'success',
          wrongCount: wrongQuestions.length,
          summary: res.data?.summary || null,
        });
      }).catch((err) => {
        console.warn('Yanlış cevap listesi güncellenemedi:', err);
        setReviewSync({ status: 'error', wrongCount: wrongQuestions.length });
      });

      if (isReviewMode) {
        await syncWrongAnswers();
        await api.post('/exam-results', resultPayload).catch((err) => {
          console.warn('Tekrar testi sonucu geçmişe kaydedilemedi:', err);
        });
      } else if (isWrongPoolMode) {
        await api.post('/exam-results', resultPayload).catch((err) => {
          console.warn('Yanlışlar testi sonucu geçmişe kaydedilemedi:', err);
        });
        await syncWrongAnswers();
      } else {
        await api.post('/exam-results', resultPayload);
        await syncWrongAnswers();
      }
    } catch (err) {
      console.error('Sonuç kaydedilemedi:', err);
    } finally {
      setSubmitting(false);
      setPhase('result');
    }
  };

  const q = questions[currentIdx];
  const currentAnswer = answers[currentIdx];
  const hasCurrentAnswer = currentAnswer !== undefined;

  useEffect(() => {
    if (phase !== 'solving' || !q) {
      clearAiPageContext('exam_solve');
      return undefined;
    }

    setAiPageContext(compactQuestionContext({
      question: q,
      exam,
      index: currentIdx,
      total: questions.length,
      answerIndex: currentAnswer,
      showAnswer: showFeedback && hasCurrentAnswer,
    }));

    return () => clearAiPageContext('exam_solve');
  }, [phase, q, exam, currentIdx, questions.length, currentAnswer, showFeedback, hasCurrentAnswer]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
      <span className="text-text-muted text-xs font-bold uppercase tracking-widest">Sınav Hazırlanıyor...</span>
    </div>
  );

  if (!exam) return (
    <div className="text-center py-20">
      <p className="text-text-muted">Sınav bulunamadı.</p>
      <button onClick={() => navigate('/dashboard/exams')} className="mt-4 text-primary-light font-bold text-sm hover:underline">Geri Dön</button>
    </div>
  );

  if ((mode === 'review' || mode === 'wrong') && phase === 'intro' && questions.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-3 sm:p-6">
        <MotionDiv
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg glass-card rounded-3xl border border-white/10 p-5 text-center shadow-2xl sm:p-10"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border-2 border-success/30 bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="mb-2 text-2xl font-black tracking-tight text-white">
            {mode === 'review' ? 'Bugün Çözülecek Yanlış Kalmadı' : 'Açıkta Yanlış Soru Kalmadı'}
          </h2>
          <p className="mb-8 text-sm font-medium leading-relaxed text-text-muted">
            {mode === 'review'
              ? 'Şu anda yeniden çözmen gereken yanlış soru yok. Yeni test çözdükçe veya eski yanlışların günü geldikçe bu alan yeniden dolacak.'
              : 'Yanlış listen temiz görünüyor. Yeni test çözdükçe hatalı cevapların burada tekrar çözülebilir hale gelir.'}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
            >
              <Home className="mr-1 inline h-4 w-4" /> Ana Sayfa
            </button>
            <button
              onClick={() => navigate('/dashboard/exams')}
              className="flex-1 rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary-light active:scale-95"
            >
              Yeni Test Çöz →
            </button>
          </div>
        </MotionDiv>
      </div>
    );
  }

  // ─── RESULT ────────────────────────────────────────────────────────
  if (phase === 'result') {
    return <ResultScreen
      questions={questions}
      answers={answers}
      exam={exam}
      reviewSync={reviewSync}
      onRetry={() => {
        setAnswers({});
        setCurrentIdx(0);
        setReviewSync({ status: 'idle', wrongCount: 0 });
        if (customType === 'wrong_review' || customType === 'wrong_answers') {
          setLoading(true);
          setQuestions([]);
          setExam(null);
        }
        setPhase('intro');
        if (customType === 'wrong_review' || customType === 'wrong_answers') setReloadKey((key) => key + 1);
      }}
      onHome={(path) => navigate(path || '/dashboard/exams')}
    />;
  }

  // ─── INTRO ─────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-3 sm:p-6">
        <MotionDiv
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg glass-card rounded-3xl border border-white/10 p-5 text-center shadow-2xl sm:p-10"
        >
          <div className="w-20 h-20 rounded-[28px] bg-primary/20 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
            <BarChart2 className="w-10 h-10 text-primary-light" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{exam.name}</h2>
          {exam.description && <p className="text-text-muted text-sm mb-6 font-medium">{exam.description}</p>}

          {mode === 'review' ? (
            <div className="mb-8 grid grid-cols-3 gap-3 sm:flex sm:justify-center sm:gap-6">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{questions.length}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Şimdi Çözülecek</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-primary-light">{reviewTotalCount}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Bugünkü Toplam</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-white">{exam.duration || 45}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Dakika</p>
              </div>
            </div>
          ) : (
            <div className="mb-8 grid grid-cols-3 gap-3 sm:flex sm:justify-center sm:gap-6">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{questions.length}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Soru</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-white">{exam.duration || 45}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Dakika</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-success">70</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Geçme Puanı</p>
              </div>
            </div>
          )}

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-xs text-primary-light font-medium text-left mb-8 flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="leading-relaxed">
              {mode === 'short' ? 'Bu bir pekiştirme testidir. İşaretlediğiniz an sorunun doğrusunu ve detaylı açıklamasını göreceksiniz. Seçiminiz sonradan değiştirilemez.' :
               mode === 'review' ? `Bugünün tekrar testindesiniz. Şimdi ${questions.length} soru çözülecek${reviewPendingAfterSession > 0 ? `, kalan ${reviewPendingAfterSession} soru daha sonra çözülecek` : ''}. Bir soru 4 kez doğru yapılınca tamamlanır ve listeden çıkar.` :
               mode === 'wrong' ? 'Yanlışlar testindesiniz. Doğru yaptığın sorular listenden çıkarılır; yeniden yanlış yaptıkların tekrar listende kalır.' :
               mode === 'mock' ? 'Genel Deneme modundasınız. Süre tutulacak ancak işaretleme anında sorunun çözümünü ve doğrusunu görebileceksiniz. Lütfen sürenizi verimli kullanın.' :
               'Gerçek Sınav Simülasyonu. Sınavı tamamla butonuna basana kadar cevapların doğru/yanlış olduğunu göremeyeceksiniz. Kalan sürenize dikkat edin!'}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <button onClick={() => navigate(-1)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
              <ChevronLeft className="w-4 h-4 inline mr-1" /> Geri
            </button>
            <button
              onClick={handleStartExam}
              disabled={questions.length === 0}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {mode === 'review' ? 'Tekrar Testini Başlat →' : mode === 'wrong' ? 'Yanlışlar Testini Başlat →' : 'Sınava Başla →'}
            </button>
          </div>
        </MotionDiv>
      </div>
    );
  }

  // ─── SOLVING ───────────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  const emptyCount = questions.length - answeredCount;
  const completionPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const questionProgressPct = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;
  const correctAnsweredCount = showFeedback
    ? questions.reduce((sum, question, index) => (
        answers[index] === question.correctAnswer ? sum + 1 : sum
      ), 0)
    : 0;
  const wrongAnsweredCount = showFeedback
    ? questions.reduce((sum, question, index) => (
        answers[index] !== undefined && answers[index] !== question.correctAnswer ? sum + 1 : sum
      ), 0)
    : 0;
  const modeLabel = {
    short: 'Kısa Test',
    review: 'Yanlış Tekrarı',
    wrong: 'Yanlışlarım',
    mock: 'Deneme',
    real: 'Gerçek Simülasyon',
  }[mode] || 'Sınav';
  const currentAnswerCorrect = hasCurrentAnswer && currentAnswer === q?.correctAnswer;

  const questionNavClass = (question, index) => {
    const answered = answers[index] !== undefined;
    const current = index === currentIdx;

    if (current) return 'border-white bg-white text-bg-dark shadow-lg shadow-white/10';
    if (!answered) return 'border-white/10 bg-white/[0.04] text-text-muted hover:border-white/20 hover:bg-white/[0.08] hover:text-white';
    if (showFeedback) {
      return answers[index] === question.correctAnswer
        ? 'border-success/35 bg-success/15 text-success'
        : 'border-danger/35 bg-danger/15 text-danger';
    }
    return 'border-primary/35 bg-primary/15 text-primary-light';
  };

  return (
    <div className="flex min-h-[calc(100vh-96px)] flex-col overflow-hidden bg-[#07080c] sm:h-[calc(100vh-128px)]">
      <header className="shrink-0 border-b border-white/10 bg-[#0b0d13]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:flex-nowrap lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              onClick={() => { if (window.confirm('Sınavdan çıkmak istiyor musunuz? İlerlemeniz kaydedilmez.')) navigate('/dashboard/exams'); }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-text-muted transition hover:bg-white/[0.07] hover:text-white"
              title="Sınavdan çık"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="mb-1 flex min-w-0 items-center gap-2">
                <span className="rounded-lg border border-accent/20 bg-accent/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-accent-light">
                  {modeLabel}
                </span>
                <span className="hidden truncate text-[10px] font-bold uppercase tracking-widest text-text-muted sm:block">
                  {exam.categoryName || 'Genel'}
                </span>
              </div>
              <h1 className="truncate text-sm font-black leading-tight text-white sm:max-w-[44vw] lg:max-w-[520px]">
                {exam.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => toggleFavorite(q?._id)}
              disabled={favLoading || !q?._id}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                favoriteIds.includes(q?._id)
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'border-white/10 bg-white/[0.04] text-text-muted hover:border-amber-500/25 hover:bg-amber-500/10 hover:text-amber-400'
              }`}
              title={favoriteIds.includes(q?._id) ? "Favorilerden çıkar" : "Favorilere ekle"}
            >
              <Star className={`h-4 w-4 ${favoriteIds.includes(q?._id) ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-text-muted transition hover:border-warning/25 hover:bg-warning/10 hover:text-warning"
              title="Bu soruyu raporla"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-[auto_auto]">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">İlerleme</p>
              <p className="mt-1 text-sm font-black text-white">{currentIdx + 1} / {questions.length}</p>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${
              timer.isDanger ? 'border-danger/35 bg-danger/10 text-danger' :
              timer.isWarning ? 'border-warning/35 bg-warning/10 text-warning' :
              'border-white/10 bg-white/[0.04] text-white'
            }`}>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Süre</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-black">
                <Clock className="h-4 w-4" /> {timer.formatted}
              </p>
            </div>
          </div>
        </div>
        <div className="h-1 bg-black/30">
          <MotionDiv
            className="h-full bg-accent"
            animate={{ width: `${questionProgressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto grid h-full max-w-[1500px] grid-cols-1 gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-6 xl:grid-cols-[240px_minmax(0,1fr)_280px]">
          <aside className="hidden min-h-0 rounded-2xl border border-white/10 bg-white/[0.025] lg:flex lg:flex-col">
            <div className="border-b border-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Soru Haritası</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-black text-white">{answeredCount}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-text-muted">işaretli</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-text-muted">{emptyCount}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-text-muted">boş</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-primary" style={{ width: `${completionPct}%` }} />
              </div>
            </div>

            <div className="custom-scrollbar grid grid-cols-5 gap-2 overflow-y-auto p-4">
              {questions.map((question, index) => (
                <button
                  key={question._id || index}
                  type="button"
                  onClick={() => setCurrentIdx(index)}
                  className={`h-9 rounded-xl border text-xs font-black transition ${questionNavClass(question, index)}`}
                  title={`${index + 1}. soru`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/10 p-4 text-[10px] font-bold text-text-muted">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded bg-primary/60" /> İşaretli</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded bg-white" /> Aktif</span>
              {showFeedback && (
                <>
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded bg-success" /> Doğru</span>
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded bg-danger" /> Yanlış</span>
                </>
              )}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1018] custom-scrollbar">
            <AnimatePresence mode="wait">
              <MotionDiv
                key={currentIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8"
              >
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-light">
                      Soru {currentIdx + 1}
                    </span>
                    {hasCurrentAnswer && showFeedback && (
                      <span className={`ml-2 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                        currentAnswerCorrect
                          ? 'border-success/25 bg-success/10 text-success'
                          : 'border-danger/25 bg-danger/10 text-danger'
                      }`}>
                        {currentAnswerCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {currentAnswerCorrect ? 'Doğru' : 'Yanlış'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-text-muted">
                    {showFeedback ? 'İşaretledikten sonra açıklama açılır.' : 'Cevaplar teslimden sonra değerlendirilecek.'}
                  </p>
                </div>

                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
                  <p className="text-base font-semibold leading-relaxed text-white sm:text-lg">
                    {q.text}
                  </p>

                  {q.media && (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-3">
                      <img
                        src={resolveMediaUrl(q.media)}
                        alt="Soru görseli"
                        className="mx-auto max-h-72 w-full object-contain"
                      />
                    </div>
                  )}
                </section>

                <div className="mt-5 space-y-3">
                  {q.options.map((option, idx) => {
                    const isAnswered = showFeedback && answers[currentIdx] !== undefined;
                    const isCorrectOption = idx === q.correctAnswer;
                    const selected = answers[currentIdx] === idx;

                    let btnClass = 'border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]';
                    let iconClass = 'border border-white/10 bg-white/5 text-text-muted';
                    let textClass = 'text-white/80';

                    if (showFeedback && isAnswered) {
                      if (isCorrectOption) {
                        btnClass = 'border-success/45 bg-success/10 shadow-lg shadow-success/10';
                        iconClass = 'bg-success text-white shadow-lg shadow-success/25';
                        textClass = 'text-white font-semibold';
                      } else if (selected && !isCorrectOption) {
                        btnClass = 'border-danger/45 bg-danger/10 shadow-lg shadow-danger/10';
                        iconClass = 'bg-danger text-white shadow-lg shadow-danger/25';
                        textClass = 'text-white font-semibold';
                      } else {
                        btnClass = 'border-white/5 bg-white/[0.015] opacity-55 cursor-not-allowed';
                      }
                    } else if (selected) {
                      btnClass = 'border-primary/45 bg-primary/15 shadow-lg shadow-primary/10';
                      iconClass = 'bg-primary text-white shadow-lg shadow-primary/25';
                      textClass = 'text-white font-semibold';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleAnswer(idx)}
                        className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-200 sm:gap-4 sm:p-4 ${btnClass}`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all ${iconClass}`}>
                          {OPTION_LABELS[idx]}
                        </div>
                        <span className={`pt-1 text-sm leading-relaxed sm:text-[15px] ${textClass}`}>
                          {cleanOptionText(option, idx)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {showFeedback && answers[currentIdx] !== undefined && (
                    <MotionDiv
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        {answers[currentIdx] === q.correctAnswer ? (
                          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/15 px-3 py-1 text-success">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Doğru Cevap</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/15 px-3 py-1 text-danger">
                            <XCircle className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Yanlış Cevap</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-text-muted">
                        <strong className="text-white">Çözüm / Açıklama:</strong><br />
                        {q.explanation || 'Bu soru için detaylı çözüm açıklaması girilmemiştir.'}
                      </p>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </MotionDiv>
            </AnimatePresence>
          </main>

          <aside className="hidden min-h-0 flex-col gap-4 xl:flex">
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sınav Durumu</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-2xl font-black text-white">{answeredCount}</p>
                  <p className="mt-1 text-[10px] font-bold text-text-muted">İşaretli</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-2xl font-black text-text-muted">{emptyCount}</p>
                  <p className="mt-1 text-[10px] font-bold text-text-muted">Boş</p>
                </div>
                {showFeedback && (
                  <>
                    <div className="rounded-xl border border-success/20 bg-success/10 p-3">
                      <p className="text-2xl font-black text-success">{correctAnsweredCount}</p>
                      <p className="mt-1 text-[10px] font-bold text-success/80">Doğru</p>
                    </div>
                    <div className="rounded-xl border border-danger/20 bg-danger/10 p-3">
                      <p className="text-2xl font-black text-danger">{wrongAnsweredCount}</p>
                      <p className="mt-1 text-[10px] font-bold text-danger/80">Yanlış</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Zaman</p>
              <div className={`mt-4 rounded-2xl border p-4 ${
                timer.isDanger ? 'border-danger/30 bg-danger/10 text-danger' :
                timer.isWarning ? 'border-warning/30 bg-warning/10 text-warning' :
                'border-white/10 bg-white/[0.035] text-white'
              }`}>
                <p className="flex items-center gap-2 text-2xl font-black">
                  <Clock className="h-5 w-5" /> {timer.formatted}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
                  <div className="h-full rounded-full bg-current" style={{ width: `${timer.pct}%` }} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Araçlar</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleFavorite(q?._id)}
                  disabled={favLoading || !q?._id}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-black transition ${
                    favoriteIds.includes(q?._id)
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : 'border-white/10 bg-white/[0.04] text-text-muted hover:border-amber-500/25 hover:bg-amber-500/10 hover:text-amber-400'
                  }`}
                >
                  <Star className={`h-4 w-4 ${favoriteIds.includes(q?._id) ? 'fill-amber-400' : ''}`} /> Favori
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-black text-text-muted transition hover:border-warning/25 hover:bg-warning/10 hover:text-warning"
                >
                  <Flag className="h-4 w-4" /> Raporla
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <footer className="shrink-0 border-t border-white/10 bg-[#0b0d13]/95 px-3 py-3 backdrop-blur-xl sm:px-5 lg:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <div className="hidden items-center gap-3 text-xs font-bold text-text-muted sm:flex">
            <span>{answeredCount} işaretli</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>{emptyCount} boş</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>%{completionPct} tamamlandı</span>
          </div>

          <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
            <button
              type="button"
              onClick={() => setShowQuestionList(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/10 sm:flex-none lg:hidden"
            >
              <ListChecks className="h-4 w-4" /> Soru Listesi
            </button>

            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/10 disabled:opacity-30 sm:flex-none"
            >
              <ChevronLeft className="h-4 w-4" /> Önceki
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(i => i + 1)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition hover:bg-primary-light active:scale-95 sm:flex-none"
              >
                Sonraki <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-success/20 transition active:scale-95 disabled:opacity-50 sm:flex-none"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Sınavı Teslim Et</>}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Report Modal */}
      <ReportQuestionModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        question={q}
      />

      <AnimatePresence>
        {showQuestionList && (
          <div className="fixed inset-0 z-[90] lg:hidden">
            <MotionButton
              type="button"
              aria-label="Soru listesini kapat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuestionList(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <MotionDiv
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-hidden rounded-t-[28px] border border-white/10 bg-bg-card shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/5 p-4">
                <div>
                  <h3 className="text-base font-black text-white">Soru Listesi</h3>
                  <p className="mt-1 text-xs font-bold text-text-muted">
                    {answeredCount} işaretli, {emptyCount} boş soru var.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuestionList(false)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-text-muted transition hover:bg-white/10 hover:text-white"
                  title="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid max-h-[54vh] grid-cols-5 gap-2 overflow-y-auto p-4 custom-scrollbar sm:grid-cols-8">
                {questions.map((question, i) => {
                  return (
                    <button
                      key={question._id || i}
                      type="button"
                      onClick={() => {
                        setCurrentIdx(i);
                        setShowQuestionList(false);
                      }}
                      className={`h-12 rounded-2xl border text-xs font-black transition-all ${questionNavClass(question, i)}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/5 p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-primary/40" /> İşaretli</span>
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-white/10" /> Boş</span>
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-white" /> Aktif</span>
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserExamSolve;
