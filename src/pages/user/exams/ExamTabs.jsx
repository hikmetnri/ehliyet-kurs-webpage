import React from 'react';
import {
  BookOpen, ChevronDown, Lock, Play, Target, AlertCircle, FileQuestion,
} from 'lucide-react';
import { trackEvent } from '../../../utils/analytics';
import UserWrongAnswers from '../UserWrongAnswers';

export const ExamTabBar = ({ activeTab, handleTabChange }) => (
<div className="flutter-segmented p-1 rounded-full flex gap-1">
              {[
                { id: 'short_tests', label: 'Kısa Testler' },
                { id: 'general', label: 'Deneme' },
                { id: 'wrong_answers', label: 'Yanlışlarım' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleTabChange(tab.id);
                    }}
                    className={`flex-1 text-center py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/40'
                        : 'text-text-muted hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
);

export const ShortTestsTab = ({
  shortGroups,
  expandedCategories,
  toggleCategory,
  shortTests,
  getParentName,
  getCategoryName,
  validCategories,
  latestResults,
  user,
  navigate,
}) => (
<div className="space-y-3">
                {Object.keys(shortGroups).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileQuestion className="w-12 h-12 text-text-muted opacity-30 mb-3" />
                    <p className="text-sm font-bold text-text-muted">Kısa test bulunamadı.</p>
                  </div>
                ) : (
                  Object.entries(shortGroups)
                    .sort(([a], [b]) => a.localeCompare(b, 'tr'))
                    .map(([groupName, count]) => {
                      const isExpanded = expandedCategories[groupName];
                      const groupExams = shortTests.filter(e => getParentName(e.categoryId) === groupName);
                      const groupQuestionCount = groupExams.reduce(
                        (total, exam) => total + Number(exam.questionCount || 0),
                        0,
                      );
                      const matchedCat = validCategories.find(c => c.name === groupName || getCategoryName(c._id) === groupName);
                      const categoryColor = matchedCat?.color || '#6366f1';

                      return (
                        <div
                          key={groupName}
                          className="border border-white/5 bg-[#171927]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-md animate-fadeIn"
                        >
                          {/* Header */}
                          <button
                            onClick={() => toggleCategory(groupName)}
                            className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                              style={{
                                backgroundColor: `${categoryColor}1f`,
                                borderColor: `${categoryColor}33`,
                                color: categoryColor
                              }}
                            >
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-white truncate">{groupName}</h3>
                              <p className="text-[11px] text-text-muted mt-0.5">{count} Test • {groupQuestionCount} Soru</p>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-text-muted transition-transform duration-300 ${
                                isExpanded ? 'rotate-180 text-white' : ''
                              }`}
                            />
                          </button>

                          {/* Children List */}
                          {isExpanded && (
                            <div className="border-t border-white/5 bg-black/15 divide-y divide-white/5 px-2 animate-slideDown">
                              {groupExams.map((exam, index) => {
                                const resultKey = `short_${exam._realCategoryId}`;
                                const lastResult = latestResults[resultKey];
                                const score = Number(lastResult?.score || 0);
                                const completed = Boolean(lastResult);
                                const passed = Boolean(lastResult?.passed);
                                const adUnlockedIds = new Set((user?.adUnlockedExamIds || []).map(String));
                                const isLocked = (exam.isPro && !user?.proStatus) || (!exam.isPro && !user?.proStatus && index >= 5 && !adUnlockedIds.has(String(exam._id)));

                                return (
                                  <div key={exam._id} className="flex items-center justify-between p-3 gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs text-white truncate">{exam.name}</p>
                                      {completed ? (
                                        <div className="flex items-center gap-1.5 mt-1">
                                          <span className={`text-[10px] font-black uppercase tracking-wider ${passed ? 'text-success' : 'text-danger'}`}>
                                            {passed ? 'GEÇİLDİ' : 'TEKRAR'}
                                          </span>
                                          <span className="text-[10px] text-text-muted">• Başarı: {score}%</span>
                                        </div>
                                      ) : (
                                        <p className="text-[10px] text-text-muted mt-1">
                                          {exam.questionCount} Soru • {exam.duration} Dk
                                        </p>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => {
                                        if (isLocked) {
                                          trackEvent('pro_clicked', {
                                            surface: 'exam_card_mobile',
                                            contentType: 'exam',
                                            examId: exam._id,
                                            examName: exam.name,
                                          });
                                          alert("Premium abonelik işlemleri web sürümünde desteklenmemektedir. Güvenlik ve faturalandırma kuralları nedeniyle premium abonelik işlemleri şu an için yalnızca Android uygulamamız (Google Play) üzerinden gerçekleştirilebilir.");
                                          return;
                                        }
                                        navigate(`/dashboard/exams/short-test/${exam._realCategoryId}`);
                                      }}
                                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                                        isLocked
                                          ? 'bg-warning/10 text-warning border border-warning/20'
                                          : completed
                                            ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                            : 'bg-primary text-white shadow-md shadow-primary/20 hover:scale-[1.01]'
                                      }`}
                                    >
                                      {isLocked ? (
                                        <>
                                          <Lock className="w-3 h-3" /> PRO
                                        </>
                                      ) : completed ? (
                                        'TEKRAR'
                                      ) : (
                                        <>
                                          <Play className="w-3 h-3 fill-white" /> BAŞLAT
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
);

export const GeneralTab = ({
  generalExams,
  latestResults,
  user,
  navigate,
}) => (
<div className="space-y-3">
                <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider px-1">Deneme Sınavları</h4>
                {generalExams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <Target className="w-10 h-10 text-text-muted opacity-30 mb-2" />
                    <p className="text-xs text-text-muted">Deneme sınavı bulunamadı.</p>
                  </div>
                ) : (
                  generalExams.map((exam, index) => {
                    const resultKey = exam._id;
                    const lastResult = latestResults[resultKey];
                    const score = Number(lastResult?.score || 0);
                    const completed = Boolean(lastResult);
                    const passed = Boolean(lastResult?.passed);
                    const adUnlockedIds = new Set((user?.adUnlockedExamIds || []).map(String));
                    const isLocked = (exam.isPro && !user?.proStatus) || (!exam.isPro && !user?.proStatus && index >= 5 && !adUnlockedIds.has(String(exam._id)));

                    return (
                      <div
                        key={exam._id}
                        className="flutter-mock-row p-4 rounded-2xl border border-border-color bg-bg-card flex items-center gap-3.5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 text-warning flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-sm truncate">{exam.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                            <span>{exam.duration || 45} Dk</span>
                            <span>•</span>
                            <span>50 Soru</span>
                            {completed && (
                              <>
                                <span>•</span>
                                <span className={passed ? 'text-success font-black' : 'text-danger font-black'}>
                                  {score}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (isLocked) {
                              trackEvent('pro_clicked', {
                                surface: 'exam_card_mobile',
                                contentType: 'exam',
                                examId: exam._id,
                                examName: exam.name,
                              });
                              alert("Premium abonelik işlemleri web sürümünde desteklenmemektedir. Güvenlik ve faturalandırma kuralları nedeniyle premium abonelik işlemleri şu an için yalnızca Android uygulamamız (Google Play) üzerinden gerçekleştirilebilir.");
                              return;
                            }
                            navigate(`/dashboard/exams/${exam._id}`);
                          }}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                            isLocked
                              ? 'bg-warning/10 text-warning border border-warning/20'
                              : completed
                                ? 'bg-white/5 text-white border border-white/10'
                                : 'bg-primary text-white shadow-md shadow-primary/20 hover:scale-[1.01]'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="w-3 h-3" /> PRO
                            </>
                          ) : completed ? (
                            'TEKRAR'
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-white" /> BAŞLAT
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
);

export const WrongAnswersTab = ({ reviewDueCount, navigate, setWrongAnswerCount }) => (
<div className="space-y-4 animate-fadeIn">
                <div className={`rounded-2xl border p-5 ${
                  reviewDueCount > 0
                    ? 'border-primary/20 bg-primary/10'
                    : 'border-white/5 bg-[#171927]/60'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                      reviewDueCount > 0
                        ? 'border-primary/30 bg-primary/15 text-primary-light'
                        : 'border-white/10 bg-black/20 text-text-muted'
                    }`}>
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white">Bugün Çözülecek Yanlışlar</p>
                      <p className="mt-1 text-xs text-text-muted font-medium">
                        {reviewDueCount > 0
                          ? `${reviewDueCount} yanlış soru yeniden çözülmeyi bekliyor.`
                          : 'Bugün yeniden çözmen gereken yanlış soru yok.'}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={reviewDueCount === 0}
                    onClick={() => navigate('/dashboard/exams/wrong-review')}
                    className={`mt-4 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      reviewDueCount > 0
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.01]'
                        : 'border border-white/5 bg-white/5 text-text-muted cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {reviewDueCount > 0 ? 'Yanlışları Çöz' : 'Bugün Yok'}
                  </button>
                </div>
                <UserWrongAnswers onCountChange={setWrongAnswerCount} />
              </div>
);
