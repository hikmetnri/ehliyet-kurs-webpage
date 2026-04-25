import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Clock, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, BarChart2,
  Send, RefreshCw, Home, Flag, BookOpen, Star
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ReportQuestionModal from '../../components/user/ReportQuestionModal';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const resolveMedia = (src) => {
  if (!src || src.startsWith('http')) return src;
  if (src.startsWith('assets/content/')) return `${API_BASE}/content/${src.replace('assets/content/', '')}`;
  if (src.startsWith('assets/images/')) return `${API_BASE}/images/${src.replace('assets/images/', '')}`;
  if (src.startsWith('assets/')) return `${API_BASE}/images/${src.replace('assets/', '')}`;
  return `${API_BASE}/images/${src}`;
};

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

// ─── Timer Hook ──────────────────────────────────────────────────────────────
const useTimer = (durationMinutes, onExpire) => {
  const [remaining, setRemaining] = useState(durationMinutes * 60);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); onExpire?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const stop = () => clearInterval(intervalRef.current);

  const formatted = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  const pct = ((durationMinutes * 60 - remaining) / (durationMinutes * 60)) * 100;
  const isWarning = remaining < 300; // < 5 min
  const isDanger = remaining < 60;

  return { formatted, pct, isWarning, isDanger, stop, remaining };
};

// ─── Result Screen ────────────────────────────────────────────────────────────
const ResultScreen = ({ questions, answers, exam, onRetry, onHome }) => {
  let correct = 0, wrong = 0, empty = 0;
  questions.forEach((q, i) => {
    if (answers[i] === undefined || answers[i] === null) empty++;
    else if (answers[i] === q.correctAnswer) correct++;
    else wrong++;
  });
  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= 70;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-full max-w-2xl glass-card p-10 rounded-3xl border border-white/10 shadow-2xl text-center"
      >
        {/* Score Circle */}
        <div className={`w-32 h-32 rounded-full mx-auto mb-8 flex flex-col items-center justify-center border-4 shadow-xl ${
          passed ? 'border-success bg-success/10 shadow-success/20' : 'border-danger bg-danger/10 shadow-danger/20'
        }`}>
          <span className={`text-4xl font-black ${passed ? 'text-success' : 'text-danger'}`}>{score}</span>
          <span className="text-xs text-white/50 font-bold">PUAN</span>
        </div>

        <h2 className={`text-2xl font-black tracking-tight mb-2 ${passed ? 'text-success' : 'text-danger'}`}>
          {passed ? '🎉 Tebrikler, Geçtiniz!' : '😕 Maalesef Kaldınız'}
        </h2>
        <p className="text-text-muted text-sm mb-8 font-medium">
          {exam?.name} sınavı sonuçlandı. {passed ? 'Harika bir performans!' : 'Bir sonraki denemede başarılar!'}
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Tekrar Çöz
          </button>
          
          {exam?._id?.startsWith('short_test_') ? (
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
      </motion.div>
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
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({}); // { questionIndex: optionIndex }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'solving' | 'result'
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/users/favorites');
      const ids = res.data.favorites.map(f => f._id || f);
      setFavoriteIds(ids);
    } catch {}
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
  }, [examId, categoryId, customType]);

  const mode = customType === 'short_test' ? 'short' : 
               customType === 'real_test' ? 'real' : 
               (!exam?.categoryId ? 'mock' : 'real');
               
  const showFeedback = mode === 'short' || mode === 'mock';

  const handleExpire = useCallback(() => {
    handleSubmit(true);
  }, [answers, questions]);

  const timer = useTimer(exam?.duration || 45, handleExpire);

  const handleAnswer = (optionIdx) => {
    if (showFeedback && answers[currentIdx] !== undefined) return; // Kilitliyse tıklanamaz
    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const handleSubmit = async (forced = false) => {
    if (!forced && !window.confirm('Sınavı bitirmek istediğinize emin misiniz?')) return;
    timer.stop();
    setSubmitting(true);

    try {
      let correct = 0, wrong = 0;
      const wrongQuestions = [];

      questions.forEach((q, i) => {
        const ans = answers[i];
        if (ans === q.correctAnswer) correct++;
        else if (ans !== undefined) {
          wrong++;
          wrongQuestions.push({ 
            questionId: q._id, 
            questionText: q.text,
            options: q.options,
            userAnswer: ans,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          });
        }
      });

      const total = questions.length;
      const empty = total - correct - wrong;
      const score = total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 0;
      const passed = score >= 70;
      const timeSpentSecs = (exam?.duration || 45) * 60 - timer.remaining;

      await api.post('/exam-results', {
        examId: (customType === 'short_test' || customType === 'real_test') ? null : examId,
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
      });
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

  // ─── RESULT ────────────────────────────────────────────────────────
  if (phase === 'result') {
    return <ResultScreen
      questions={questions}
      answers={answers}
      exam={exam}
      onRetry={() => { setAnswers({}); setCurrentIdx(0); setPhase('intro'); }}
      onHome={(path) => navigate(path || '/dashboard/exams')}
    />;
  }

  // ─── INTRO ─────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg glass-card p-10 rounded-3xl border border-white/10 shadow-2xl text-center"
        >
          <div className="w-20 h-20 rounded-[28px] bg-primary/20 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
            <BarChart2 className="w-10 h-10 text-primary-light" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{exam.name}</h2>
          {exam.description && <p className="text-text-muted text-sm mb-6 font-medium">{exam.description}</p>}

          <div className="flex justify-center gap-6 mb-8">
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

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-xs text-primary-light font-medium text-left mb-8 flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="leading-relaxed">
              {mode === 'short' ? 'Bu bir pekiştirme testidir. İşaretlediğiniz an sorunun doğrusunu ve detaylı açıklamasını göreceksiniz. Seçiminiz sonradan değiştirilemez.' : 
               mode === 'mock' ? 'Genel Deneme modundasınız. Süre tutulacak ancak işaretleme anında sorunun çözümünü ve doğrusunu görebileceksiniz. Lütfen sürenizi verimli kullanın.' :
               'Gerçek Sınav Simülasyonu. Sınavı tamamla butonuna basana kadar cevapların doğru/yanlış olduğunu göremeyeceksiniz. Kalan sürenize dikkat edin!'}
            </span>
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
              <ChevronLeft className="w-4 h-4 inline mr-1" /> Geri
            </button>
            <button
              onClick={() => setPhase('solving')}
              disabled={questions.length === 0}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              Sınava Başla →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── SOLVING ───────────────────────────────────────────────────────
  const q = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = ((currentIdx) / questions.length) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-128px)] overflow-hidden">

      {/* Header Bar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-bg-card border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => { if (window.confirm('Sınavdan çıkmak istiyor musunuz? İlerlemeniz kaydedilmez.')) navigate('/dashboard/exams'); }} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div>
            <h3 className="text-sm font-black text-white truncate max-w-xs">{exam.name}</h3>
            <p className="text-[10px] font-bold text-text-muted uppercase">Soru {currentIdx + 1} / {questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Favori Butonu */}
          <button
            onClick={() => toggleFavorite(q?._id)}
            disabled={favLoading || !q?._id}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-xs font-bold border ${
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
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-text-muted hover:text-warning hover:bg-warning/10 hover:border-warning/20 transition-all text-xs font-bold"
            title="Bu soruyu raporla"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Raporla</span>
          </button>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-sm transition-all ${
          timer.isDanger ? 'bg-danger/10 border-danger/30 text-danger animate-pulse' :
          timer.isWarning ? 'bg-warning/10 border-warning/30 text-warning' :
          'bg-white/5 border-white/10 text-white'
        }`}>
          <Clock className="w-4 h-4" /> {timer.formatted}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-black/30 shrink-0">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="p-8 max-w-3xl mx-auto"
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
                    src={resolveMedia(q.media)}
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
                    className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${btnClass}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${iconClass}`}>
                      {OPTION_LABELS[idx]}
                    </div>
                    <span className={`text-sm leading-relaxed pt-0.5 ${textClass}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Notice */}
            <AnimatePresence>
              {showFeedback && answers[currentIdx] !== undefined && (
                <motion.div 
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="shrink-0 px-6 py-4 bg-bg-card border-t border-white/5 flex items-center justify-between gap-4">
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

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1.5 px-5 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white/10 transition-all disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Önceki
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(i => i + 1)}
              className="flex items-center gap-1.5 px-5 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Sonraki <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-3 bg-success text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-success/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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
    </div>
  );
};

export default UserExamSolve;
