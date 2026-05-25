import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
          const reviewRes = await api.get(`/wrong-answers/review-due?limit=${REVIEW_SESSION_LIMIT}`);
          const reviewItems = reviewRes.data?.data || [];
          const reviewTotalCount = reviewRes.data?.count ?? reviewItems.length;
          const reviewIds = reviewItems.map((item) => item.questionId).filter(Boolean);
          const sourceQuestions = reviewIds.length > 0
            ? await api.get(`/questions?ids=${reviewIds.join(',')}`)
                .then((res) => res.data || [])
                .catch(() => [])
            : [];
          const sourceQuestionMap = new Map(sourceQuestions.map((question) => [question._id, question]));
          const qs = reviewItems.map((item) => ({
            _id: item.questionId,
            text: sourceQuestionMap.get(item.questionId)?.text || item.questionText,
            options: sourceQuestionMap.get(item.questionId)?.options || item.options || [],
            correctAnswer: sourceQuestionMap.get(item.questionId)?.correctAnswer ?? item.correctAnswer,
            explanation: sourceQuestionMap.get(item.questionId)?.explanation || item.explanation,
            media: sourceQuestionMap.get(item.questionId)?.media || item.media || '',
            category: sourceQuestionMap.get(item.questionId)?.category || item.categoryId,
            categoryName: sourceQuestionMap.get(item.questionId)?.category?.name || item.categoryName,
            testType: sourceQuestionMap.get(item.questionId)?.testType || item.testType || 'wrong_review',
            subject: sourceQuestionMap.get(item.questionId)?.subject || item.subject || '',
            wrongCount: item.wrongCount || 1,
          })).filter((question) => question._id && question.text && question.options.length > 0);

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

  const mode = customType === 'short_test' ? 'short' :
               customType === 'wrong_review' ? 'review' :
               customType === 'wrong_answers' ? 'wrong' :
               customType === 'real_test' ? 'real' :
               (!exam?.categoryId ? 'mock' : 'real');
               
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
        testType: customType || (exam?.categoryId ? 'mock_exam' : 'exam'),
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
        testType: customType || (exam?.categoryId ? 'mock_exam' : 'exam'),
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
  const q = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const emptyCount = questions.length - answeredCount;
  return (
    <div className="flex min-h-[calc(100vh-96px)] flex-col overflow-hidden sm:h-[calc(100vh-128px)]">

      {/* Header Bar */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-3 sm:px-6 py-4 bg-bg-card border-b border-white/5">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <button onClick={() => { if (window.confirm('Sınavdan çıkmak istiyor musunuz? İlerlemeniz kaydedilmez.')) navigate('/dashboard/exams'); }} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-white truncate max-w-[52vw] sm:max-w-xs">{exam.name}</h3>
            <p className="text-[10px] font-bold text-text-muted uppercase">Soru {currentIdx + 1} / {questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {/* Favori Butonu */}
          <button
            onClick={() => toggleFavorite(q?._id)}
            disabled={favLoading || !q?._id}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl transition-all text-xs font-bold border ${
              favoriteIds.includes(q?._id)
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-white/5 border-white/10 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/20'
            }`}
            title={favoriteIds.includes(q?._id) ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Star className={`w-3.5 h-3.5 ${favoriteIds.includes(q?._id) ? 'fill-amber-500' : ''}`} />
            <span className="hidden sm:inline">Favori</span>
          </button>

          {/* Raporla Butonu */}
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-text-muted hover:text-warning hover:bg-warning/10 hover:border-warning/20 transition-all text-xs font-bold"
            title="Bu soruyu raporla"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Raporla</span>
          </button>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border font-black text-sm transition-all ${
          timer.isDanger ? 'bg-danger/10 border-danger/30 text-danger animate-pulse' :
          timer.isWarning ? 'bg-warning/10 border-warning/30 text-warning' :
          'bg-white/5 border-white/10 text-white'
        }`}>
          <Clock className="w-4 h-4" /> {timer.formatted}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-black/30 shrink-0">
        <MotionDiv
          className="h-full bg-primary"
          animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={currentIdx}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8"
          >
            {/* Question */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black text-primary-light uppercase tracking-widest mb-4">
                Soru {currentIdx + 1}
              </span>
              <p className="text-white text-base font-semibold leading-relaxed">{q.text}</p>

              {/* Media */}
              {q.media && (
                <div className="mt-5">
                  <img
                    src={resolveMediaUrl(q.media)}
                    alt="Soru görseli"
                    className="max-h-56 rounded-2xl border border-white/10 shadow-xl object-contain mx-auto"
                  />
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const isAnswered = showFeedback && answers[currentIdx] !== undefined;
                const isCorrectOption = idx === q.correctAnswer;
                const selected = answers[currentIdx] === idx;
                
                let btnClass = 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20';
                let iconClass = 'bg-white/5 text-text-muted border border-white/10';
                let textClass = 'text-white/80';

                if (showFeedback && isAnswered) {
                   if (isCorrectOption) {
                      btnClass = 'bg-success/15 border-success/40 shadow-lg shadow-success/10';
                      iconClass = 'bg-success text-white shadow-lg shadow-success/30';
                      textClass = 'text-white font-semibold';
                   } else if (selected && !isCorrectOption) {
                      btnClass = 'bg-danger/15 border-danger/40 shadow-lg shadow-danger/10';
                      iconClass = 'bg-danger text-white shadow-lg shadow-danger/30';
                      textClass = 'text-white font-semibold';
                   } else {
                      btnClass = 'bg-white/[0.01] border-white/5 opacity-50 cursor-not-allowed';
                   }
                } else if (selected) {
                   btnClass = 'bg-primary/15 border-primary/40 shadow-lg shadow-primary/10';
                   iconClass = 'bg-primary text-white shadow-lg shadow-primary/30';
                   textClass = 'text-white font-semibold';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full flex items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-200 sm:gap-4 sm:p-4 ${btnClass}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${iconClass}`}>
                      {OPTION_LABELS[idx]}
                    </div>
                    <span className={`text-sm leading-relaxed pt-0.5 ${textClass}`}>
                      {cleanOptionText(option, idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Notice */}
            <AnimatePresence>
              {showFeedback && answers[currentIdx] !== undefined && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="p-6 bg-white/[0.02] border border-white/10 rounded-[1.5rem] overflow-hidden"
                >
                   <div className="flex items-center gap-3 mb-3">
                      {answers[currentIdx] === q.correctAnswer ? (
                         <div className="flex items-center gap-2 px-3 py-1 bg-success/20 border border-success/30 rounded-lg text-success">
                           <CheckCircle2 className="w-5 h-5" />
                           <span className="font-black tracking-widest text-[10px] uppercase">DOĞRU CEVAP</span>
                         </div>
                      ) : (
                         <div className="flex items-center gap-2 px-3 py-1 bg-danger/20 border border-danger/30 rounded-lg text-danger">
                           <XCircle className="w-5 h-5" />
                           <span className="font-black tracking-widest text-[10px] uppercase">YANLIŞ CEVAP</span>
                         </div>
                      )}
                   </div>
                   <p className="text-sm text-text-muted leading-relaxed font-medium">
                     <strong className="text-white">Çözüm / Açıklama:</strong> <br/>
                     {q.explanation || 'Bu soru için detaylı çözüm açıklaması girilmemiştir.'}
                   </p>
                </MotionDiv>
              )}
            </AnimatePresence>
          </MotionDiv>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="shrink-0 px-3 sm:px-6 py-4 bg-bg-card border-t border-white/5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Question Nav dots (minimap) */}
        <div className="hidden md:flex items-center gap-1 flex-wrap max-w-xs">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`w-6 h-6 rounded text-[9px] font-bold transition-all border ${
                i === currentIdx ? 'bg-white text-black border-white scale-110' :
                answers[i] !== undefined 
                  ? (showFeedback 
                       ? (answers[i] === questions[i].correctAnswer ? 'bg-success/20 text-success border-success/30' : 'bg-danger/20 text-danger border-danger/30')
                       : 'bg-primary/30 text-primary-light border-primary/40') 
                  : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowQuestionList(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 sm:flex-none md:hidden"
          >
            <ListChecks className="h-4 w-4" /> Soru Listesi
          </button>

          <button
            onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white/10 transition-all disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Önceki
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(i => i + 1)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Sonraki <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 bg-success text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-success/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Sınavı Teslim Et</>}
            </button>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportQuestionModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        question={q}
      />

      <AnimatePresence>
        {showQuestionList && (
          <div className="fixed inset-0 z-[90] md:hidden">
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

              <div className="grid max-h-[54vh] grid-cols-5 gap-2 overflow-y-auto p-4 custom-scrollbar">
                {questions.map((question, i) => {
                  const answered = answers[i] !== undefined;
                  const current = i === currentIdx;
                  const statusClass = current
                    ? 'border-white bg-white text-black scale-105'
                    : answered
                      ? (showFeedback && answers[i] !== question.correctAnswer
                        ? 'border-danger/40 bg-danger/15 text-danger'
                        : 'border-primary/40 bg-primary/20 text-primary-light')
                      : 'border-white/10 bg-white/5 text-text-muted';

                  return (
                    <button
                      key={question._id || i}
                      type="button"
                      onClick={() => {
                        setCurrentIdx(i);
                        setShowQuestionList(false);
                      }}
                      className={`h-12 rounded-2xl border text-xs font-black transition-all ${statusClass}`}
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
