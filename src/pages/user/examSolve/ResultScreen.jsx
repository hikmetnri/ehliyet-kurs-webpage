import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, RefreshCw, Home, BookOpen } from 'lucide-react';
import { TEST_TYPES } from '../../../constants/testTypes';
import { getPassingScore, getExamScore } from '../../../utils/examTiming';

const MotionDiv = motion.div;

// ─── Result Screen ────────────────────────────────────────────────────────────
export const ResultScreen = ({ questions, answers, exam, reviewSync, resultSync, verifiedResult, onRetry, onHome }) => {
  if (questions.some(q => !Number.isInteger(q.correctAnswer)) && !verifiedResult) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-warning/30 bg-warning/10 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Sonuç doğrulanmayı bekliyor</h2>
        <p className="mt-3 text-sm">Sınav cevabı sunucuda değerlendiriliyor. Bağlantı geri geldiğinde sınav geçmişinden sonucunu görebilirsin.</p>
        <button onClick={() => onHome('/dashboard/exams')} className="mt-6 rounded-xl bg-primary px-5 py-3 font-bold">Sınavlara dön</button>
      </div>
    );
  }
  let correct = 0, wrong = 0, empty = 0;
  questions.forEach((q, i) => {
    if (answers[i] === undefined || answers[i] === null) empty++;
    else if (answers[i] === q.correctAnswer) correct++;
    else wrong++;
  });
  if (verifiedResult) ({ correct, wrong, empty } = verifiedResult);
  const total = questions.length;
  const score = getExamScore(correct, total);
  const passed = total > 0 && correct * 100 >= getPassingScore(exam) * total;
  const isReview = exam?.testType === TEST_TYPES.WRONG_REVIEW || exam?._id === 'wrong_review_today';
  const isWrongPool = exam?.testType === TEST_TYPES.WRONG_ANSWERS || exam?._id === 'wrong_answers_all';
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
                  : 'Yanlış cevaplar şu an tekrar listesine eklenemedi.'}
              </p>
            </div>
          </div>
        )}

        {resultSync === 'error' && (
          <div role="alert" className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-left text-warning">
            <p className="font-bold">Sınav sonucu geçmişe kaydedilemedi</p>
            <p className="mt-1 text-sm">Bu ekrandaki sonuç cihazınızda hesaplandı. Kaydın sunucuya ulaştığı doğrulanamadı; sınav geçmişinizi kontrol edin.</p>
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
