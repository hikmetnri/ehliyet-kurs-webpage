import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, XCircle, AlertCircle,
  ClipboardList, ChevronDown, ChevronUp, Info, Award
} from 'lucide-react';

const ExamDetailModal = ({ result, onClose }) => {
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (!result) return null;

  const wrongQuestions = result.wrongQuestions || [];
  const totalWrong = result.wrongCount || wrongQuestions.length;
  const totalCorrect = result.correctCount || 0;
  const totalQ = result.totalQuestions || (totalCorrect + totalWrong);
  const score = result.score || 0;
  const passed = result.passed;
  const examName = result.examName || result.categoryName || 'Deneme Sınavı';
  const date = result.createdAt
    ? new Date(result.createdAt).toLocaleDateString('tr-TR', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : '';

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 24 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0d0d14] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/60"
        >
          {/* Header */}
          <div className="shrink-0 p-6 md:p-8 border-b border-white/5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${passed ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'}`}>
                {passed
                  ? <Award className="w-6 h-6 text-success" />
                  : <ClipboardList className="w-6 h-6 text-danger" />
                }
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                  {examName}
                </h2>
                <p className="text-xs text-text-muted font-bold mt-0.5 uppercase tracking-wider">{date}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Score Summary Bar */}
          <div className="shrink-0 px-6 md:px-8 py-5 grid grid-cols-3 gap-4 border-b border-white/5">
            <div className="text-center">
              <p className="text-2xl font-black text-white">%{score}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Puan</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-success">{totalCorrect}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Doğru</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-danger">{totalWrong}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Yanlış</p>
            </div>
          </div>

          {/* Score Progress */}
          <div className="shrink-0 px-6 md:px-8 py-4 border-b border-white/5">
            <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">
              <span>Başarı Oranı</span>
              <span className={passed ? 'text-success' : 'text-danger'}>
                {passed ? '✓ GEÇTİ' : '✗ KALDI'}
              </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, score)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${passed ? 'bg-success' : score > 50 ? 'bg-warning' : 'bg-danger'}`}
              />
            </div>
          </div>

          {/* Wrong Questions List */}
          <div className="flex-1 overflow-y-auto">
            {wrongQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <CheckCircle2 className="w-14 h-14 text-success opacity-60" />
                <p className="text-text-muted font-bold text-sm">Bu sınavda yanlış soru detayı kaydedilmedi.</p>
              </div>
            ) : (
              <div className="p-4 md:p-6 space-y-3">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2 mb-4">
                  Yanlış Yanıtlanan Sorular ({wrongQuestions.length})
                </p>

                {wrongQuestions.map((q, idx) => {
                  const isExpanded = expandedIdx === idx;
                  const options = q.options || [];
                  const correctIdx = q.correctAnswer ?? -1;
                  const userIdx = q.userAnswer ?? -1;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden"
                    >
                      {/* Question Header — Clickable */}
                      <button
                        className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/[0.03] transition-colors"
                        onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                      >
                        <span className="shrink-0 w-7 h-7 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center text-[10px] font-black text-danger mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="flex-1 text-sm font-bold text-white leading-relaxed">
                          {q.questionText || q.text || 'Soru metni mevcut değil.'}
                        </p>
                        <span className="shrink-0 ml-2 text-text-muted">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </button>

                      {/* Expanded Detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-2">
                              {/* Options */}
                              {options && options.length > 0 && options.map((opt, oIdx) => {
                                const isCorrect = oIdx === correctIdx;
                                const isUser = oIdx === userIdx;

                                let cls = 'bg-white/[0.02] border-white/5 text-text-secondary';
                                let icon = null;

                                if (isCorrect) {
                                  cls = 'bg-success/10 border-success/30 text-success';
                                  icon = <CheckCircle2 className="w-4 h-4 text-success shrink-0" />;
                                } else if (isUser && !isCorrect) {
                                  cls = 'bg-danger/10 border-danger/30 text-danger';
                                  icon = <XCircle className="w-4 h-4 text-danger shrink-0" />;
                                }

                                return (
                                  <div
                                    key={oIdx}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold ${cls}`}
                                  >
                                    <span className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black border border-current/30 bg-current/10">
                                      {optionLabels[oIdx] || oIdx}
                                    </span>
                                    <span className="flex-1">{opt}</span>
                                    {icon}
                                  </div>
                                );
                              })}

                              {/* Explanation */}
                              {q.explanation && q.explanation.trim() !== "" && (
                                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/15 rounded-xl mt-3">
                                  <Info className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
                                  <p className="text-xs text-text-secondary leading-relaxed font-medium">
                                    <span className="text-primary-light font-black uppercase tracking-widest text-[9px] block mb-1">Çözüm / Açıklama</span>
                                    {q.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 p-4 md:p-6 border-t border-white/5">
            <button
              onClick={onClose}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/5"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExamDetailModal;
