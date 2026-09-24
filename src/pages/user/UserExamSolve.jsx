import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import { TEST_TYPES, WRONG_REVIEW_TEST_TYPES } from '../../constants/testTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { soundService } from '../../services/soundService';
import {
  Loader2, Clock, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle,
  Send, Flag, Star, ListChecks, X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ReportQuestionModal from '../../components/user/ReportQuestionModal';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { trackEvent } from '../../utils/analytics';
import GuestBlocker from '../../components/user/GuestBlocker';
import { getPassingScore, getExamScore } from '../../utils/examTiming';
import {
  filterQuestionsToCategoryTree,
  hydrateWrongAnswers,
  normalizeId,
  readApiList,
} from '../../utils/wrongAnswers';
import { clearAiPageContext, compactQuestionContext, setAiPageContext } from '../../utils/aiPageContext';
import { queueOperation, flushOperations } from '../../services/resultOutbox';
import { fetchAllQuestions } from '../../utils/questionPages';

// ─── Extracted Modules (SRP) ──────────────────────────────────────────────────
import { OPTION_LABELS, REVIEW_SESSION_LIMIT, shuffleArray, cleanOptionText } from './examSolve/examSolveUtils';
import { useTimer } from './examSolve/useExamTimer';
import { ResultScreen } from './examSolve/ResultScreen';
import { EmptyReviewState, ExamIntroScreen } from './examSolve/ExamScreens';

const MotionDiv = motion.div;
const MotionButton = motion.button;

// ─── Main Exam Solve Component ────────────────────────────────────────────────
const UserExamSolve = ({ customType }) => {
  const { examId, categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuthStore();

  let guestBlockNode = null;
  if (user?.isGuest) {
    const solvedCount = parseInt(localStorage.getItem('guest_solved_test_count') || '0', 10);
    if (solvedCount >= 4) {
      guestBlockNode = (
        <div className="min-h-screen bg-[#050508] text-white pt-16 flex items-center justify-center">
          <GuestBlocker 
            title="Günlük Test Limitine Ulaştınız" 
            description="Misafir modu için belirlenen 4 adet ücretsiz test çözme limitini doldurdunuz. Sınırsız test çözmek, yanlış sorularınızı takip etmek ve ilerlemek için lütfen üye olun." 
          />
        </div>
      );
    }
  }

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
  const [guestMsg, setGuestMsg] = useState(null);
  const [reviewSync, setReviewSync] = useState({ status: 'idle', wrongCount: 0 });
  const [reloadKey, setReloadKey] = useState(0);
  const [resultSync, setResultSync] = useState('idle');
  const [verifiedResult, setVerifiedResult] = useState(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchFavorites = async () => {
    if (!user || user.isGuest) return;
    try {
      const res = await api.get('/users/favorites');
      const ids = (res.data?.favorites || []).map(f => f._id || f);
      setFavoriteIds(ids);
    } catch {
      // Favori listesi yüklenemezse sınav akışı devam edebilir.
    }
  };

  const toggleFavorite = async (qId) => {
    if (favLoading) return;
    if (user?.isGuest) {
      setGuestMsg('Favoriye eklemek için üye olun');
      setTimeout(() => setGuestMsg(null), 3000);
      return;
    }
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
        if (customType === TEST_TYPES.SHORT_TEST) {
          // Synthetic exam based on category questions
          const [qs, catRes] = await Promise.all([
            fetchAllQuestions({ category: categoryId, testType: TEST_TYPES.SHORT_TEST }),
            api.get(`/categories/${categoryId}`)
          ]);
          const sessionQuestions = qs.length > 500 ? shuffleArray(qs).slice(0, 500) : qs;
          setQuestions(sessionQuestions);
          setExam({
            _id: `short_test_${categoryId}`,
            name: `${catRes.data?.data?.name || 'Konu'} Kısa Testi`,
            categoryName: catRes.data?.data?.name || 'Konu Testi',
            description: 'Bu kategorideki konulardan oluşan özel test.',
            duration: Math.max(10, Math.ceil(sessionQuestions.length * 1.5)), // ~1.5 min per question
            categoryId: categoryId
          });
        } else if (customType === TEST_TYPES.REAL_TEST) {
          // Real MEB Simulator
          let allQ = (await fetchAllQuestions()).filter(q => (
            [TEST_TYPES.REAL_EXAM, TEST_TYPES.MOCK_EXAM, TEST_TYPES.EXAM].includes(q.testType)
          ));
          // Random 50 questions
          allQ = shuffleArray(allQ).slice(0, 50);
          
          setQuestions(allQ);
          setExam({
            _id: `real_test_${categoryId}`,
            name: `E-Sınav Simülatörü`,
            categoryName: 'Karma Simülasyon',
            description: `MEB formatında ${allQ.length} soruluk elektronik sınav simülasyonu. Anında geri bildirim yoktur, süreyi verimli kullanın.`,
            duration: 45,
            categoryId: categoryId
          });
        } else if (customType === TEST_TYPES.WRONG_REVIEW) {
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
            testType: TEST_TYPES.WRONG_REVIEW,
          });
        } else if (customType === TEST_TYPES.WRONG_ANSWERS) {
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
          const sessionQuestions = qs.length > 500 ? shuffleArray(qs).slice(0, 500) : qs;

          setQuestions(sessionQuestions);
          setExam({
            _id: 'wrong_answers_all',
            name: 'Yanlışlar Testi',
            categoryName: 'Yanlışlarım',
            description: 'Yanlış yaptığın sorulardan oluşan kişisel tekrar testi.',
            duration: Math.max(10, Math.ceil(sessionQuestions.length * 1.5)),
            categoryId: user?.selectedCategoryId || null,
            testType: TEST_TYPES.WRONG_ANSWERS,
          });
        } else {
          // Normal exam
          const [examRes, examQuestions] = await Promise.all([
            api.get(`/exams/${examId}`),
            fetchAllQuestions({ exam: examId }),
          ]);
          const examData = examRes.data?.exam || examRes.data;
          setExam({
            ...examData,
            categoryName: examData.categoryId?.name || examData.categoryName || 'Genel Sınav'
          });
          setQuestions(examQuestions);
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
  // testType alanı varsa öncelikli kullan; yoksa isim heuristiğine fallback yap
  const mode = forceRealMode ? 'real' :
               customType === TEST_TYPES.SHORT_TEST ? 'short' :
               customType === TEST_TYPES.WRONG_REVIEW ? 'review' :
               customType === TEST_TYPES.WRONG_ANSWERS ? 'wrong' :
               customType === TEST_TYPES.REAL_TEST ? 'real' :
               exam?.testType === TEST_TYPES.REAL_EXAM ? 'real' :
               exam?.testType === TEST_TYPES.SHORT_TEST ? 'short' :
               exam?.testType === TEST_TYPES.MOCK_EXAM ? 'mock' :
               // legacy fallback: adında "deneme" yoksa AND "mock" da geçmiyorsa real say
               (exam?.name && !exam.name.toLowerCase().includes('deneme') && !exam.name.toLowerCase().includes('mock') ? 'real' : 'mock');
  const persistedTestType = mode === 'real'
    ? TEST_TYPES.REAL_EXAM
    : customType || exam?.testType || (exam?.categoryId ? TEST_TYPES.MOCK_EXAM : TEST_TYPES.EXAM);
               
  // Kısa test ve tekrar çalışmaları öğretim modudur. Deneme ile gerçek sınavda
  // cevaplar sınav bitene kadar değerlendirilmez.
  const showFeedback = mode === 'short' || mode === 'review' || mode === 'wrong';
  const reviewTotalCount = exam?.reviewTotalCount || questions.length;
  const reviewPendingAfterSession = Math.max(0, reviewTotalCount - questions.length);

  const handleSubmitRef = useRef(null);

  const handleExpire = useCallback(() => {
    handleSubmitRef.current?.(true);
  }, []);

  const timer = useTimer(exam?.duration || 45, handleExpire, phase === 'solving');

  const prevIdxRef = useRef(currentIdx);
  useEffect(() => {
    if (phase === 'solving' && prevIdxRef.current !== currentIdx) {
      soundService.playClick();
    }
    prevIdxRef.current = currentIdx;
  }, [currentIdx, phase]);

  const handleAnswer = (optionIdx) => {
    if (showFeedback && answers[currentIdx] !== undefined) return; // Kilitliyse tıklanamaz
    
    if (showFeedback) {
      const isCorrect = optionIdx === questions[currentIdx]?.correctAnswer;
      if (isCorrect) {
        soundService.playCorrect();
      } else {
        soundService.playWrong();
      }
    } else {
      soundService.playClick();
    }

    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const attemptRef = useRef(null);
  const startingRef = useRef(false);
  const handleStartExam = async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      const response = await api.post('/exam-results/attempts', {
        questionIds: questions.map(question => question._id),
        examId: customType ? '' : examId,
        categoryId: normalizeId(exam?.categoryId) || '',
        testType: customType === TEST_TYPES.REAL_TEST ? TEST_TYPES.REAL_TEST : (customType || exam?.testType || persistedTestType),
      });
      attemptRef.current = response.data.attemptId;
    } catch {
      window.alert('Test başlatılamadı. Bağlantını kontrol edip tekrar dene.');
      return;
    } finally { startingRef.current = false; }

    trackEvent(mode === 'review' ? 'wrong_review_started' : 'test_started', {
      examId: exam?._id,
      examName: exam?.name,
      mode,
      testType: customType || (exam?.categoryId ? TEST_TYPES.MOCK_EXAM : TEST_TYPES.EXAM),
      categoryId: typeof exam?.categoryId === 'object' ? exam?.categoryId?._id : exam?.categoryId,
      categoryName: exam?.categoryName || '',
      questionCount: questions.length,
      duration: exam?.duration || 45,
    });
    submittedRef.current = false;
    setResultSync('idle');
    setVerifiedResult(null);
    setPhase('solving');
  };

  const handleSubmit = async (forced = false) => {
    if (submittedRef.current) return;
    if (!forced && !window.confirm('Sınavı bitirmek istediğinize emin misiniz?')) return;
    submittedRef.current = true;
    const timeSpentSecs = timer.stop();
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
      const empty = total - Object.keys(answers).length;
      const hiddenAnswers = questions.some(q => !Number.isInteger(q.correctAnswer));
      if (hiddenAnswers && user?.isGuest) {
        const response = await api.post(`/exam-results/attempts/${attemptRef.current}/guest-finish`, {
          duration: timeSpentSecs,
          answers: questions.map((q, i) => ({ questionId: q._id, answer: answers[i] ?? -1 })),
        });
        correct = response.data.correctCount;
        wrong = response.data.wrongCount - empty;
        setVerifiedResult({ correct, wrong, empty });
      }
      const score = getExamScore(correct, total);
      let passed = total > 0 && correct * 100 >= getPassingScore(exam) * total;

      const isWrongPoolMode = customType === TEST_TYPES.WRONG_ANSWERS;

      const resultPayload = {
        examId: (customType === TEST_TYPES.SHORT_TEST || customType === TEST_TYPES.REAL_TEST || isWrongPoolMode) ? null : examId,
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
        duration: timeSpentSecs,
        operationId: crypto.randomUUID(),
        attemptId: attemptRef.current,
        answers: questions.map((q, i) => ({ questionId: q._id, answer: answers[i] ?? -1 })),
      };

      if (user?.isGuest) {
        // Save test results locally
        const localResults = JSON.parse(localStorage.getItem('guest_saved_results') || '[]');
        localResults.push(resultPayload);
        localStorage.setItem('guest_saved_results', JSON.stringify(localResults));

        // Increment solved test count
        const currentCount = parseInt(localStorage.getItem('guest_solved_test_count') || '0', 10);
        localStorage.setItem('guest_solved_test_count', String(currentCount + 1));

        setReviewSync({
          status: 'success',
          wrongCount: wrongQuestions.length,
          summary: { added: wrongQuestions.length, removed: 0 }
        });
      } else {
        try {
          const owner = String(user?._id || user?.id || '');
          queueOperation(owner, '/exam-results', resultPayload);
          const synced = await flushOperations(owner);
          let verifiedWrongCount = wrongQuestions.length;
          if (hiddenAnswers) {
            const review = await api.get(`/exam-results/attempts/${attemptRef.current}/review`);
            const key = new Map((review.data?.answers || []).map(item => [item.questionId, item.correctAnswer]));
            if (key.size !== questions.length || questions.some(q => !key.has(q._id))) throw new Error('Cevap anahtarı eksik.');
            setQuestions(questions.map(q => ({ ...q, correctAnswer: key.get(q._id) })));
            verifiedWrongCount = questions.reduce((count, q, index) => (
              answers[index] !== undefined && answers[index] !== key.get(q._id) ? count + 1 : count
            ), 0);
            const verifiedCorrect = questions.reduce((count, q, index) => (
              answers[index] === key.get(q._id) ? count + 1 : count
            ), 0);
            passed = total > 0 && verifiedCorrect * 100 >= getPassingScore(exam) * total;
          }
          setResultSync(synced || hiddenAnswers ? 'success' : 'error');
          setReviewSync({ status: synced || hiddenAnswers ? 'success' : 'error', wrongCount: verifiedWrongCount });
        } catch { setResultSync('error'); }

      }

      if (passed) {
        soundService.playClapping();
      } else {
        soundService.playFailed();
      }
    } catch (err) {
      setResultSync('error');
      console.error('Sonuç kaydedilemedi:', err);
    } finally {
      setSubmitting(false);
      setPhase('result');
    }
  };
  handleSubmitRef.current = handleSubmit;

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

  if (guestBlockNode) return guestBlockNode;

  // ── Misafir toast (favori denemesi) ──────────────────────────────────────────
  const guestToast = guestMsg ? (
    <div className="fixed bottom-24 left-1/2 z-[9999] -translate-x-1/2 animate-fadeIn">
      <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-[#1a1200]/90 px-4 py-2.5 shadow-xl backdrop-blur">
        <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <p className="text-xs font-black text-amber-300">{guestMsg}</p>
        <button onClick={() => { logout(); navigate('/register'); }} className="ml-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 transition hover:bg-amber-500/20">
          Üye Ol
        </button>
      </div>
    </div>
  ) : null;

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
    return <EmptyReviewState mode={mode} navigate={navigate} />;
  }

  // ─── RESULT ────────────────────────────────────────────────────────
  if (phase === 'result') {
    return <ResultScreen
      questions={questions}
      answers={answers}
      verifiedResult={verifiedResult}
      exam={exam}
      reviewSync={reviewSync}
      resultSync={resultSync}
      onRetry={() => {
        setAnswers({});
        setVerifiedResult(null);
        setCurrentIdx(0);
        setReviewSync({ status: 'idle', wrongCount: 0 });
        if (WRONG_REVIEW_TEST_TYPES.includes(customType)) {
          setLoading(true);
          setQuestions([]);
          setExam(null);
        }
        setPhase('intro');
        if (WRONG_REVIEW_TEST_TYPES.includes(customType)) setReloadKey((key) => key + 1);
      }}
      onHome={(path) => navigate(path || '/dashboard/exams')}
    />;
  }

  // ─── INTRO ─────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <ExamIntroScreen
        exam={exam}
        mode={mode}
        questions={questions}
        reviewTotalCount={reviewTotalCount}
        reviewPendingAfterSession={reviewPendingAfterSession}
        navigate={navigate}
        handleStartExam={handleStartExam}
      />
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
      {guestToast}
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
                    {mode === 'short'
                      ? 'Açıklama yalnızca yanlış cevapta gösterilir.'
                      : showFeedback
                        ? 'Cevap işaretlendikten sonra geri bildirim gösterilir.'
                        : 'Cevaplar teslimden sonra değerlendirilecek.'}
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
                      {(mode !== 'short' || !currentAnswerCorrect) && (
                        <p className="text-sm font-medium leading-relaxed text-text-muted">
                          <strong className="text-white">Çözüm / Açıklama:</strong><br />
                          {q.explanation || 'Bu soru için detaylı çözüm açıklaması girilmemiştir.'}
                        </p>
                      )}
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
