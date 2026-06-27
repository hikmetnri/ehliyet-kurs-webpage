import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Trash2, Loader2, Sparkles, AlertCircle,
  HelpCircle, ArrowRight, Lock, Crown, ChevronRight, RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../api';
import useAuthStore from '../../store/authStore';
import { compactStatsContext, getAiPageContext } from '../../utils/aiPageContext';
import { buildScopedStats, filterResultsToCategoryTree } from '../../utils/scopedStats';
import { normalizeId, readApiList } from '../../utils/wrongAnswers';

const MotionDiv = motion.div;

const QUICK_PROMPTS = [
  { text: 'Kavşaklarda geçiş üstünlüğü kuralları nelerdir?', category: 'Trafik' },
  { text: 'İlk yardımda Rentek manevrası ne zaman ve nasıl yapılır?', category: 'İlk Yardım' },
  { text: 'Motor yağı seviyesi ve rengi nasıl kontrol edilir?', category: 'Araç Tekniği' },
  { text: 'Trafik adabı ne anlama gelir? Sınavda nasıl sorular çıkar?', category: 'Trafik Adabı' }
];

export default function UserAIChat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ehliyet_yolu_ai_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [limit, setLimit] = useState(20);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [pageContext, setPageContext] = useState(() => getAiPageContext());

  const messagesEndRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('ehliyet_yolu_ai_chat', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get current prompt count status on mount
    fetchPromptCount();
  }, []);

  useEffect(() => {
    const buildStatsContext = async () => {
      try {
        const currentContext = getAiPageContext();
        if (currentContext && currentContext.page && currentContext.page !== 'stats') {
          setPageContext(currentContext);
          return;
        }

        const [statsRes, catRes, resultsRes, categoryRes] = await Promise.allSettled([
          api.get('/exam-results/stats'),
          api.get('/exam-results/category-stats'),
          api.get('/exam-results?limit=500'),
          user?.selectedCategoryId
            ? api.get('/categories/all')
            : Promise.resolve({ data: [] }),
        ]);

        const baseStats = statsRes.status === 'fulfilled' ? statsRes.value.data : {};
        const allResults = resultsRes.status === 'fulfilled' ? readApiList(resultsRes.value) : [];
        const categories = categoryRes.status === 'fulfilled' ? readApiList(categoryRes.value) : [];
        const selectedCategoryId = normalizeId(user?.selectedCategoryId);
        const scoped = buildScopedStats({
          baseStats,
          results: allResults,
          categories,
          selectedCategoryId,
        });

        let rawCatStats = catRes.status === 'fulfilled' ? readApiList(catRes.value) : [];
        if (selectedCategoryId && rawCatStats.length > 0) {
          const scopedCategoryIds = new Set(
            filterResultsToCategoryTree(
              categories.map((category) => ({ categoryId: category._id || category.id })),
              categories,
              selectedCategoryId,
            ).map((item) => normalizeId(item.categoryId)),
          );
          rawCatStats = rawCatStats.filter((item) => {
            const categoryId = normalizeId(item.categoryId || item.category);
            return !categoryId || scopedCategoryIds.has(categoryId);
          });
        }

        setPageContext(compactStatsContext({
          stats: scoped.stats,
          catStats: rawCatStats,
          recentResults: scoped.results.slice(0, 20),
          scopeLabel: selectedCategoryId ? (user?.selectedCategoryName || 'Seçili eğitim') : 'Tüm eğitimler',
          selectedCategoryName: user?.selectedCategoryName || '',
        }));
      } catch (err) {
        console.error('Yola istatistik bağlamı hazırlanamadı:', err);
        setPageContext(getAiPageContext());
      }
    };

    buildStatsContext();
  }, [user?.selectedCategoryId, user?.selectedCategoryName]);

  const fetchPromptCount = async () => {
    if (user?.isGuest) {
      const credits = parseInt(localStorage.getItem('guest_ai_credits') ?? '5', 10);
      setLimit(5);
      setPromptCount(5 - credits);
      return;
    }
    try {
      const res = await api.get('/users/me');
      if (res.data?.data) {
        setPromptCount(res.data.data.aiPromptCount || 0);
      }
    } catch (e) {
      console.error('Kullanıcı bilgileri alınamadı:', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    // Client-side limit check for guest and non-PRO users
    const currentPromptCount = user?.isGuest 
      ? (5 - parseInt(localStorage.getItem('guest_ai_credits') ?? '5', 10))
      : promptCount;
    const currentLimit = user?.isGuest ? 5 : limit;

    if (currentPromptCount >= currentLimit) {
      setShowLimitModal(true);
      return;
    }

    const newUserMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setLoading(true);
    setErrorText('');

    try {
      // Send message history to keep context
      const contextMessages = [...messages, newUserMessage].slice(-10);
      
      const res = await api.post('/ai/chat', {
        messages: contextMessages,
        pageContext: pageContext || getAiPageContext(),
      }, { timeout: 45000 });
      
      if (res.data) {
        const assistantMessage = { role: 'assistant', content: res.data.reply };
        setMessages((prev) => [...prev, assistantMessage]);
        
        if (user?.isGuest) {
          const currentCredits = parseInt(localStorage.getItem('guest_ai_credits') ?? '5', 10);
          const newCredits = Math.max(0, currentCredits - 1);
          localStorage.setItem('guest_ai_credits', String(newCredits));
          setPromptCount(5 - newCredits);
        } else {
          if (res.data.promptCount !== undefined) {
            setPromptCount(res.data.promptCount);
          }
          if (res.data.limit !== undefined) {
            setLimit(res.data.limit);
          }
        }
      }
    } catch (err) {
      console.error(err);
      const isLimitError = err.response?.status === 403 && err.response?.data?.limitReached;
      
      if (isLimitError) {
        setPromptCount(limit);
        setShowLimitModal(true);
        // Remove the last user message since it failed to process due to limit
        setMessages((prev) => prev.slice(0, -1));
      } else {
        setErrorText(
          err.code === 'ECONNABORTED'
            ? 'Yola yanıtı biraz uzun sürdü. Lütfen tekrar deneyin.'
            : (err.response?.data?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Sohbet geçmişini silmek istediğinize emin misiniz?')) {
      setMessages([]);
      sessionStorage.removeItem('ehliyet_yolu_ai_chat');
    }
  };

  const activeLimit = user?.isGuest ? 5 : limit;
  const remainingPrompts = activeLimit - promptCount;

  return (
    <div className="mx-auto max-w-5xl pb-24 px-4 h-[calc(100vh-120px)] min-h-[500px] flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0 mb-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-light" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary-light">Yapay Zeka Teknolojisi</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Yolla AI <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary-light uppercase">Yapay Zeka Asistanı</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-semibold">
            Anlamadığınız yerde Yolla AI'a yollayın, o cevaplasın! 🚀
          </p>
          {pageContext?.page === 'stats' && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              İstatistik bağlamı bağlı
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-2.5 rounded-2xl border border-white/10 bg-white/5 text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-300"
              title="Sohbeti Temizle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          
          {user?.proStatus ? (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-4 h-4 fill-amber-400/20" />
              Sınırsız PRO
            </div>
          ) : (
            <div 
              onClick={() => navigate('/dashboard/settings')}
              className="cursor-pointer group flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary-light hover:bg-primary/20 transition-all text-xs font-semibold"
            >
              <span>Kalan Hak: <strong className="text-white font-black">{remainingPrompts > 0 ? remainingPrompts : 0}</strong></span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[32px] flex flex-col min-h-0 relative overflow-hidden">
        {messages.length === 0 ? (
          /* Landing/Intro State */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col justify-center items-center text-center relative">
            {/* Subtle glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

            <div className="relative w-20 h-20 rounded-[28px] bg-gradient-to-br from-primary via-primary-light to-accent p-[2px] shadow-lg shadow-primary/25 flex items-center justify-center mb-6 hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#07070a] rounded-[26px] flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary-light animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
            </div>
            
            <h3 className="text-2xl font-black text-white tracking-tight">Yolla AI'a Merhaba Deyin!</h3>
            <p className="text-text-secondary text-sm max-w-md mt-3 font-semibold leading-relaxed">
              Anlamadığınız yerde Yolla AI'a yollayın, o cevaplasın! 🚀
            </p>
            
            {/* Quick Prompts Container */}
            <div className="mt-10 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {QUICK_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt.text)}
                  className="p-5 text-left rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-300 group flex flex-col justify-between h-28 cursor-pointer hover:shadow-[0_10px_25px_rgba(99,102,241,0.08)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="text-xs text-white/90 font-bold leading-relaxed line-clamp-2">
                    "{prompt.text}"
                  </span>
                  <span className="flex items-center justify-between w-full mt-2">
                    <span className="text-[9px] uppercase font-black tracking-widest text-primary-light bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">{prompt.category}</span>
                    <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-white transition-all" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Conversation */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 items-start ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar Profile */}
                  {isUser ? (
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs shadow-lg">
                      {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/30 bg-gradient-to-br from-primary-light/20 to-accent/20 text-primary-light shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                      <Bot className="w-5 h-5 text-primary-light animate-pulse" />
                    </div>
                  )}
                  
                  {/* Bubble Content */}
                  <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-none shadow-[0_4px_15px_rgba(99,102,241,0.25)] font-semibold'
                        : 'bg-white/[0.03] backdrop-blur-md border border-white/[0.06] text-white/90 rounded-tl-none shadow-[0_10px_30px_rgba(0,0,0,0.15)] markdown-content font-medium'
                    }`}>
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-text-secondary" {...props} />,
                            ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-text-secondary" {...props} />,
                            li: ({ ...props }) => <li className="font-semibold" {...props} />,
                            h3: ({ ...props }) => <h3 className="text-white font-black text-sm mt-3 mb-1.5" {...props} />,
                            h4: ({ ...props }) => <h4 className="text-white font-bold text-xs mt-2 mb-1" {...props} />,
                            strong: ({ ...props }) => <strong className="text-primary-light font-black" {...props} />,
                            table: ({ ...props }) => <table className="w-full border-collapse border border-white/10 my-2 text-xs" {...props} />,
                            th: ({ ...props }) => <th className="border border-white/10 bg-white/5 px-2.5 py-1.5 font-bold text-white text-left" {...props} />,
                            td: ({ ...props }) => <td className="border border-white/10 px-2.5 py-1.5 text-text-secondary" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    <span className="text-[9px] text-text-muted mt-1.5 px-2 font-bold tracking-wider uppercase">
                      {isUser ? 'Siz' : 'Yolla AI'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Thinking / Loader state */}
            {loading && (
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary-light/20 to-accent/20 text-primary-light flex items-center justify-center shrink-0 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <Bot className="w-5 h-5 animate-bounce text-primary-light" />
                </div>
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className="px-5 py-4 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] flex items-center gap-2.5 rounded-tl-none text-text-secondary text-xs font-bold shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-light" />
                    Yolla AI düşünüyor ve yanıt üretiyor...
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorText && (
              <div className="flex justify-center py-2 px-4 rounded-2xl bg-danger/10 border border-danger/25 text-danger text-xs font-semibold max-w-md mx-auto items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Chat Input Field Composer */}
        <div className="p-4 border-t border-white/[0.08] bg-black/40 backdrop-blur-md shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              placeholder="Trafik, sınav veya sürüşle ilgili sorun..."
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary/10 transition placeholder:text-text-muted disabled:opacity-50 font-semibold shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-6 py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 duration-200"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          
          {/* Footer Warning Counter */}
          {user?.isGuest ? (
            <div className="mt-2 text-center text-[10px] text-text-muted font-bold tracking-wide uppercase">
              Misafir ücretsiz soru hakkınız: {remainingPrompts > 0 ? remainingPrompts : 0} / {activeLimit}. Daha fazla hak için{' '}
              <span 
                onClick={() => {
                  const logout = useAuthStore.getState().logout;
                  logout();
                  navigate('/login');
                }} 
                className="text-primary-light underline cursor-pointer hover:text-white transition-colors"
              >
                Üye Olun
              </span>.
            </div>
          ) : !user?.proStatus ? (
            <div className="mt-2 text-center text-[10px] text-text-muted font-bold tracking-wide uppercase">
              Günlük ücretsiz soru hakkınız: {remainingPrompts > 0 ? remainingPrompts : 0} / {activeLimit}. Daha fazla hak için{' '}
              <span 
                onClick={() => navigate('/dashboard/settings')} 
                className="text-primary-light underline cursor-pointer hover:text-white transition-colors"
              >
                PRO Sürüme Geçin
              </span>.
            </div>
          ) : null}
        </div>
      </div>

      {/* Limit Over Limit Prompt Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/25 bg-[#121422] shadow-2xl p-6 text-center relative"
            >
              {/* Gold gradient header glow */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto mb-4 mt-2">
                <Crown className="w-8 h-8 text-amber-400 fill-amber-400/20" />
              </div>
              
              <h3 className="text-lg font-black text-white tracking-tight">
                {user?.isGuest ? 'AI Sınırına Ulaştınız' : 'Günlük AI Sınırına Ulaştınız'}
              </h3>
              <p className="text-text-secondary text-sm font-semibold mt-2.5 leading-relaxed">
                {user?.isGuest 
                  ? 'Misafir modu için tanımlanan 5 adet ücretsiz mesaj limitiniz dolmuştur.' 
                  : `Ücretsiz planda günlük yapay zeka danışmanlığı limitiniz (${activeLimit} soru) dolmuştur.`}
              </p>
              
              <div className="my-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left text-xs font-semibold space-y-2 text-text-muted">
                {user?.isGuest ? (
                  <>
                    <p className="text-white font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary-light shrink-0" /> Üye Olmanın Avantajları:</p>
                    <p>• Sınırsız veya daha yüksek Yolla AI mesaj hakkı</p>
                    <p>• Sınavlar ve Sorular sayfalarında test çözebilme</p>
                    <p>• Hatalarınızı kaydedip tekrar çözebilme</p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-bold flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" /> PRO Üyelik Ayrıcalıkları:</p>
                    <p>• Sınırsız Yolla AI kullanımı</p>
                    <p>• Reklamsız Sınav Çözümü</p>
                    <p>• Tüm Konu Anlatımları ve Soru Bankası</p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    if (user?.isGuest) {
                      const logout = useAuthStore.getState().logout;
                      logout();
                      navigate('/login');
                    } else {
                      navigate('/dashboard/settings');
                    }
                  }}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-98 transition shadow-lg"
                >
                  {user?.isGuest ? 'Giriş Yap / Üye Ol' : 'PRO Sürüme Geç'}
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 text-text-secondary hover:text-white font-bold text-xs uppercase tracking-wider active:scale-98 transition"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
