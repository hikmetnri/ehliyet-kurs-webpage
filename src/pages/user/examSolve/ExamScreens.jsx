import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, BarChart2, CheckCircle2, ChevronLeft, Home } from 'lucide-react';
import { getPassingScore } from '../../../utils/examTiming';

const MotionDiv = motion.div;

export const EmptyReviewState = ({ mode, navigate }) => (
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

export const ExamIntroScreen = ({ exam, mode, questions, reviewTotalCount, reviewPendingAfterSession, navigate, handleStartExam }) => (
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
            <p className="text-2xl font-black text-success">{getPassingScore(exam)}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Geçme Puanı</p>
          </div>
        </div>
      )}

      <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-xs text-primary-light font-medium text-left mb-8 flex gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="leading-relaxed">
          {mode === 'short' ? 'Bu bir pekiştirme testidir. Yanlış cevap verdiğinizde doğru cevap ve açıklama gösterilir. Seçiminiz sonradan değiştirilemez.' :
           mode === 'review' ? `Bugünün tekrar testindesiniz. Şimdi ${questions.length} soru çözülecek${reviewPendingAfterSession > 0 ? `, kalan ${reviewPendingAfterSession} soru daha sonra çözülecek` : ''}. Bir soru 4 kez doğru yapılınca tamamlanır ve listeden çıkar.` :
           mode === 'wrong' ? 'Yanlışlar testindesiniz. Doğru yaptığın sorular listenden çıkarılır; yeniden yanlış yaptıkların tekrar listende kalır.' :
           mode === 'mock' ? 'Genel Deneme modundasınız. Cevaplarınız sınavı teslim ettiğinizde değerlendirilecektir. Sürenizi verimli kullanın.' :
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
