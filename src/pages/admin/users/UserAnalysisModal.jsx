import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, X, User, Mail, Target, PieChart, Flame,
  BarChart2, CheckCircle2, FileText, XCircle, ArrowUpDown, Award,
} from 'lucide-react';
import { TEST_TYPES } from '../../../constants/testTypes';
import { ReportCard, BadgeIcon } from './userBits';

const getExamName = (res) => {
    const examName = res.examName?.toString().trim();
    if (examName) return examName;
    if (res.examId && typeof res.examId === 'object' && res.examId.name) {
      return res.examId.name.toString().trim();
    }
    if (res.categoryName) return res.categoryName.toString().trim();
    if (res.testType === TEST_TYPES.WRONG_REVIEW) return 'Yanlış Tekrarı';
    if (res.testType === TEST_TYPES.SHORT_TEST) return 'Kısa Test';
    if (res.testType === TEST_TYPES.REAL_EXAM) return 'Sınav';
    return 'Genel Sınav';
  };

  const getAnswerText = (options, answerIndex) => {
    const idx = parseInt(answerIndex, 10);
    if (isNaN(idx) || idx < 0 || !options || idx >= options.length) return '-';
    return options[idx]?.toString().trim() || `${String.fromCharCode(65 + idx)} Şıkkı`;
  };

// ─── Kullanıcı Analiz Modalı ───────────────────────────────────────────────────────
const UserAnalysisModal = ({ statsModalOpen, onClose, loadingStats, selectedUserStats, expandedResultIds, setExpandedResultIds }) => (
<AnimatePresence>
        {statsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-bg-card shadow-xl shadow-black/40"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
                    <Activity className="h-5 w-5 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Kullanıcı Analizi</h2>
                    <p className="mt-1 text-xs font-semibold text-text-muted">Sınav performansı ve rozet özeti</p>
                  </div>
                </div>
                <button onClick={() => onClose} className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-2 transition-all">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 custom-scrollbar">
                {loadingStats ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="text-xs font-bold text-text-muted">Analiz yükleniyor</span>
                  </div>
                ) : selectedUserStats ? (
                  <div className="space-y-6">

                     {/* Identity Card */}
                     <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                            <User className="h-5 w-5 text-white/40" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 text-lg font-bold text-white">
                              {selectedUserStats.user.firstName} {selectedUserStats.user.lastName}
                              {selectedUserStats.user.proStatus && <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">PRO</span>}
                              {selectedUserStats.user.selectedCategoryName && (
                                <span className="rounded border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary-light">
                                  {selectedUserStats.user.selectedCategoryName}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-white/50">
                                <Mail className="w-3.5 h-3.5" /> {selectedUserStats.user.email}
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3 text-right">
                           <div className="text-xs font-semibold text-text-muted">Toplam puan</div>
                           <div className="text-3xl font-bold text-primary-light">{selectedUserStats.user.totalScore}</div>
                        </div>
                     </div>

                     {/* Stat Cards */}
                     <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <ReportCard title="Başarı Oranı" value={`%${selectedUserStats.stats.successRate}`} icon={Target} color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                        <ReportCard title="Sınav" value={selectedUserStats.stats.totalExams} icon={Activity} color="text-indigo-300" bg="bg-indigo-500/10" border="border-indigo-500/20" />
                        <ReportCard title="Soru" value={selectedUserStats.stats.totalQuestions} icon={PieChart} color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
                        <ReportCard title="Seri" value={`${selectedUserStats.stats.streak} Gün`} icon={Flame} color="text-rose-300" bg="bg-rose-500/10" border="border-rose-500/20" />
                     </div>

                     {/* Category Performance */}
                     <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                       <div className="mb-5 flex items-center justify-between gap-3">
                         <div>
                           <h3 className="flex items-center gap-2 text-sm font-bold text-primary-light">
                             <BarChart2 className="w-5 h-5" /> Kategori Bazlı Performans
                           </h3>
                           <p className="mt-1 text-xs font-semibold text-text-muted">
                             B sınıfı, İş Sağlığı ve alt konu testleri ayrı ayrı izlenir.
                           </p>
                         </div>
                         <span className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                           {selectedUserStats.stats.categoryPerformance?.length || 0} kategori
                         </span>
                       </div>

                       {selectedUserStats.stats.categoryPerformance?.length > 0 ? (
                         <div className="space-y-3">
                           {selectedUserStats.stats.categoryPerformance.map((category) => {
                             const success = Number(category.successRate || 0);
                             const tone = success >= 75
                               ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                               : success >= 50
                                 ? 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                                 : 'text-rose-300 bg-rose-500/10 border-rose-500/20';

                             return (
                               <div key={category.categoryId || category.categoryName} className="rounded-2xl border border-white/5 bg-black/10 p-4">
                                 <div className="mb-3 flex items-center justify-between gap-3">
                                   <div className="min-w-0">
                                     <h4 className="truncate text-sm font-black text-white">{category.categoryName || 'Genel Sınav'}</h4>
                                     <p className="mt-1 text-[11px] font-bold text-text-muted">
                                       {category.totalExams} test • {category.totalQuestions} soru • {category.totalWrong} yanlış
                                     </p>
                                   </div>
                                   <span className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-black ${tone}`}>
                                     %{success}
                                   </span>
                                 </div>
                                 <div className="h-1.5 overflow-hidden rounded-full border border-white/5 bg-white/5">
                                   <div
                                     className={`h-full rounded-full ${success >= 75 ? 'bg-emerald-400' : success >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                     style={{ width: `${Math.min(100, Math.max(0, success))}%` }}
                                   />
                                 </div>
                                 <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                   <div className="rounded-xl border border-white/5 bg-white/[0.015] px-2 py-2">
                                     <p className="text-[10px] font-bold text-text-muted">Doğru</p>
                                     <p className="mt-1 text-sm font-black text-emerald-300">{category.totalCorrect}</p>
                                   </div>
                                   <div className="rounded-xl border border-white/5 bg-white/[0.015] px-2 py-2">
                                     <p className="text-[10px] font-bold text-text-muted">Başarılı</p>
                                     <p className="mt-1 text-sm font-black text-primary-light">{category.passedCount}</p>
                                   </div>
                                   <div className="rounded-xl border border-white/5 bg-white/[0.015] px-2 py-2">
                                     <p className="text-[10px] font-bold text-text-muted">Başarısız</p>
                                     <p className="mt-1 text-sm font-black text-rose-300">{category.failedCount}</p>
                                   </div>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       ) : (
                         <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center">
                           <BarChart2 className="mx-auto mb-3 h-8 w-8 text-white/20" />
                           <p className="text-xs font-bold text-text-muted">Bu kullanıcı için kategori bazlı sınav verisi henüz yok.</p>
                         </div>
                       )}
                     </div>

                     {/* Progress Visualizer */}
                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                            <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-emerald-300"><CheckCircle2 className="w-4 h-4" /> Sınav Sonuçları</h3>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Tamamlanan Sınavlar</span>
                                    <span className="font-bold text-emerald-400 text-lg">{selectedUserStats.stats.passedCount}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(selectedUserStats.stats.passedCount / Math.max(selectedUserStats.stats.totalExams, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Başarısız sınavlar</span>
                                    <span className="font-bold text-rose-400 text-lg">{selectedUserStats.stats.failedCount}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full rounded-full bg-rose-400" style={{ width: `${(selectedUserStats.stats.failedCount / Math.max(selectedUserStats.stats.totalExams, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                            <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-primary-light"><PieChart className="w-4 h-4" /> Soru Performansı</h3>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Doğru cevap</span>
                                    <span className="font-bold text-primary-light text-lg">{selectedUserStats.stats.totalCorrect}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(selectedUserStats.stats.totalCorrect / Math.max(selectedUserStats.stats.totalQuestions, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Yanlış cevap</span>
                                    <span className="font-bold text-amber-400 text-lg">{selectedUserStats.stats.totalWrong}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full rounded-full bg-amber-400" style={{ width: `${(selectedUserStats.stats.totalWrong / Math.max(selectedUserStats.stats.totalQuestions, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* SON SINAVLAR (RECENT EXAMS) SECTION */}
                     {selectedUserStats.recentResults && selectedUserStats.recentResults.length > 0 && (
                       <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                         <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-indigo-300">
                           <FileText className="w-5 h-5" /> Son Sınav Sonuçları
                         </h3>
                         <div className="space-y-3">
                           {selectedUserStats.recentResults.map((res) => {
                             const examName = getExamName(res);
                             const passed = res.passed;
                             const score = Number(res.score || 0);
                             const totalQ = res.totalQuestions || 50;
                             const correct = res.correctCount ?? res.correctAnswers ?? 0;
                             const wrongQuestions = res.wrongQuestions || [];
                             
                             const date = res.createdAt ? new Date(res.createdAt) : null;
                             const dateStr = date ? date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
                             
                             const resultId = res._id || `${examName}_${res.createdAt}`;
                             const isExpanded = expandedResultIds.has(resultId);

                             return (
                               <div
                                 key={resultId}
                                 className={`rounded-2xl border transition-all duration-200 ${
                                   isExpanded 
                                     ? 'border-primary/40 bg-white/[0.04]' 
                                     : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                                 }`}
                               >
                                 {/* Item Header */}
                                 <div
                                   onClick={() => {
                                     if (wrongQuestions.length === 0) return;
                                     setExpandedResultIds(prev => {
                                       const next = new Set(prev);
                                       if (next.has(resultId)) next.delete(resultId);
                                       else next.add(resultId);
                                       return next;
                                     });
                                   }}
                                   className={`flex items-center justify-between gap-4 p-4 ${wrongQuestions.length > 0 ? 'cursor-pointer' : ''}`}
                                 >
                                   <div className="flex items-center gap-3 min-w-0">
                                     <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                                       passed 
                                         ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                                         : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                                     }`}>
                                       {passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                     </div>
                                     <div className="min-w-0">
                                       <h4 className="truncate text-sm font-bold text-white">{examName}</h4>
                                       <p className="mt-1 text-xs text-text-muted">
                                         {totalQ} Soru • {correct} Doğru • {wrongQuestions.length} Yanlış
                                       </p>
                                     </div>
                                   </div>

                                   <div className="flex items-center gap-3 shrink-0">
                                     <div className="text-right">
                                       <span className={`block text-sm font-black ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                                         {score} Puan
                                       </span>
                                       <span className="mt-0.5 block text-[10px] font-bold text-text-muted">
                                         {dateStr}
                                       </span>
                                     </div>
                                     {wrongQuestions.length > 0 && (
                                       <ArrowUpDown className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                     )}
                                   </div>
                                 </div>

                                 {/* Item Body (Collapsible Wrong Questions) */}
                                 {isExpanded && wrongQuestions.length > 0 && (
                                   <div className="border-t border-white/5 bg-black/10 p-4 space-y-3">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Yanlış Yapılan Sorular</p>
                                     {wrongQuestions.map((wq, wqIdx) => {
                                       const qText = wq.questionText || 'Soru metni bulunamadı';
                                       const options = wq.options || [];
                                       const userAnswerVal = getAnswerText(options, wq.userAnswer);
                                       const correctAnswerVal = getAnswerText(options, wq.correctAnswer);

                                       return (
                                         <div
                                           key={wq._id || wqIdx}
                                           className="rounded-xl border border-white/5 bg-[#0a0e21]/50 p-3 space-y-2.5"
                                         >
                                           <p className="text-xs font-bold text-white leading-relaxed">
                                             {wqIdx + 1}. {qText}
                                           </p>
                                           <div className="space-y-1.5 pl-1 border-l-2 border-white/5">
                                             <div className="flex items-start gap-1.5 text-[11px]">
                                               <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                               <span className="font-extrabold text-rose-500 shrink-0">Kullanıcı:</span>
                                               <span className="text-text-secondary leading-snug">{userAnswerVal}</span>
                                             </div>
                                             <div className="flex items-start gap-1.5 text-[11px]">
                                               <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                               <span className="font-extrabold text-emerald-500 shrink-0">Doğru:</span>
                                               <span className="text-text-secondary leading-snug">{correctAnswerVal}</span>
                                             </div>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     )}

                     {/* EARNED BADGES SECTION */}
                     <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                        <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-amber-300"><Award className="w-5 h-5" /> Kazanılan Rozetler</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 relative z-10">
                           {selectedUserStats.badges && selectedUserStats.badges.filter(b => b.isEarned).length > 0 ? (
                             selectedUserStats.badges.filter(b => b.isEarned).map((b, idx) => (
                               <motion.div
                                 key={b._id}
                                 initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                                 className="flex flex-col items-center text-center group/badge"
                               >
                                 <div
                                   className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover/badge:scale-105"
                                   style={{ backgroundColor: `${b.color}15`, border: `1px solid ${b.color}40` }}
                                 >
                                   <BadgeIcon name={b.icon} className="w-7 h-7" style={{ color: b.color }} />
                                 </div>
                                 <h4 className="text-[11px] font-bold text-white leading-tight mb-1">{b.name}</h4>
                                 <span className="text-[10px] font-bold text-text-muted">
                                   {new Date(b.earnedAt).toLocaleDateString('tr-TR')}
                                 </span>
                               </motion.div>
                             ))
                           ) : (
                             <div className="col-span-full py-10 flex flex-col items-center justify-center opacity-30">
                                 <Award className="w-12 h-12 mb-3" />
                                 <p className="text-xs font-bold">Henüz rozet kazanılmamış</p>
                             </div>
                           )}
                        </div>
                      </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                     <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mx-auto mb-4 opacity-50">
                        <AlertTriangle className="w-8 h-8 text-white" />
                     </div>
                     <p className="text-text-muted font-bold">Kullanıcıya ait rapor çekilemedi veya veritabanında henüz işlem yapmamış.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
);

export default UserAnalysisModal;
