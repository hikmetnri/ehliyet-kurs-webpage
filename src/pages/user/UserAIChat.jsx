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
        console.error('Sınav Koçu istatistik bağlamı hazırlanamadı:', err);
        setPageContext(getAiPageContext());
      }
    };

    buildStatsContext();
  }, [user?.selectedCategoryId, user?.selectedCategoryName]);

  const fetchPromptCount = async () => {
    try {
      // We can check local storage or make a dummy request, or backend returns it.
      // Since we don't have a separate GET stats route, we can read user profile or check previous count.
      // Let's fetch the current user profile from backend to get the latest aiPromptCount.
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

    // Client-side limit check for non-PRO users as a fallback
    if (!user?.proStatus && promptCount >= limit) {
      setShowLimitModal(true);
      return;
    }

    const newUserMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setLoading(true);
    setErrorText('');

    try {
      // Send message history to keep context (max 10 recent messages for context size/cost limits)
      const contextMessages = [...messages, newUserMessage].slice(-10);
      
      const res = await api.post('/ai/chat', {
        messages: contextMessages,
        pageContext: pageContext || getAiPageContext(),
      }, { timeout: 45000 });
      
      if (res.data) {
        const assistantMessage = { role: 'assistant', content: res.data.reply };
        setMessages((prev) => [...prev, assistantMessage]);
        
        if (res.data.promptCount !== undefined) {
          setPromptCount(res.data.promptCount);
        }
        if (res.data.limit !== undefined) {
          setLimit(res.data.limit);
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
            ? 'Sınav Koçu yanıtı biraz uzun sürdü. Lütfen tekrar deneyin.'
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

  const remainingPrompts = limit - promptCount;

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
            Sınav Koçunuz <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary-light uppercase">DeepSeek</span>
          </h1>
          <p className="text-text-muted text-xs mt-1 font-semibold">
            Trafik, motor, ilk yardım ve sınav konularında aklınıza takılan her şeyi sorun.
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
      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col min-h-0 relative overflow-hidden">
        {messages.length === 0 ? (
          /* Landing/Intro State */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col justify-center items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent p-[2px] shadow-lg shadow-primary/20 flex items-center justify-center mb-6">
              <div className="w-full h-full bg-[#0a0c12] rounded-[22px] flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary-light" />
              </div>
            </div>
            
            <h3 className="text-xl font-black text-white tracking-tight">Sınav Koçuna Merhaba Deyin!</h3>
            <p className="text-text-secondary text-sm max-w-md mt-2 font-medium">
              Ehliyet sınavınızda başarılı olmanız için tüm müfredatı ezbere biliyorum. Sorularınızı bekliyorum!
            </p>
            
            {/* Quick Prompts Container */}
            <div className="mt-8 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt.text)}
                  className="p-4 text-left rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group flex flex-col justify-between h-28 cursor-pointer"
                >
                  <span className="text-xs text-white/90 font-semibold leading-relaxed line-clamp-2">
                    "{prompt.text}"
                  </span>
                  <span className="flex items-center justify-between w-full mt-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-primary-light">{prompt.category}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Conversation */
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar min-h-0">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Icon Profile */}
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border text-xs font-bold ${
                    isUser
                      ? 'bg-white/10 border-white/5 text-white'
                      : 'bg-primary/20 border-primary/20 text-primary-light shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                  }`}>
                    {isUser ? '👤' : <Bot className="w-4 h-4" />}
                  </div>
                  
                  {/* Bubble Content */}
                  <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-primary border border-primary/20 text-white rounded-tr-none'
                        : 'bg-[#141624] border border-white/5 text-white/90 rounded-tl-none markdown-content'
                    }`}>
                      {isUser ? (
                        <div className="whitespace-pre-wrap font-semibold">{msg.content}</div>
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="font-medium" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-white font-black text-sm mt-3 mb-1.5" {...props} />,
                            h4: ({node, ...props}) => <h4 className="text-white font-bold text-xs mt-2 mb-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-primary-light font-black" {...props} />,
                            table: ({node, ...props}) => <table className="w-full border-collapse border border-white/10 my-2 text-xs" {...props} />,
                            th: ({node, ...props}) => <th className="border border-white/10 bg-white/5 px-2.5 py-1.5 font-bold text-white text-left" {...props} />,
                            td: ({node, ...props}) => <td className="border border-white/10 px-2.5 py-1.5" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    <span className="text-[9px] text-text-muted mt-1 px-1 font-bold tracking-wider uppercase">
                      {isUser ? 'Siz' : 'Sınav Koçu'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Thinking / Loader state */}
            {loading && (
              <div className="flex gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-primary/20 border border-primary/20 text-primary-light flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className="px-5 py-4 rounded-2xl bg-[#141624] border border-white/5 flex items-center gap-2 rounded-tl-none text-text-secondary text-xs font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-light" />
                    Sınav Koçu düşünüyor ve yanıt üretiyor...
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
        <div className="p-4 border-t border-white/5 bg-[#090b10] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              placeholder="Trafik, sınav veya sürüşle ilgili sorun..."
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition placeholder:text-text-muted disabled:opacity-50 font-semibold"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-6 py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition bg-primary hover:bg-primary-light shadow-lg shadow-primary/15"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          
          {/* Footer Warning Counter */}
          {!user?.proStatus && (
            <div className="mt-2 text-center text-[10px] text-text-muted font-bold tracking-wide uppercase">
              Günlük ücretsiz soru hakkınız: {remainingPrompts > 0 ? remainingPrompts : 0} / {limit}. Daha fazla hak için{' '}
              <span 
                onClick={() => navigate('/dashboard/settings')} 
                className="text-primary-light underline cursor-pointer hover:text-white transition-colors"
              >
                PRO Sürüme Geçin
              </span>.
            </div>
          )}
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
              
              <h3 className="text-lg font-black text-white tracking-tight">Günlük AI Sınırına Ulaştınız</h3>
              <p className="text-text-secondary text-sm font-semibold mt-2.5 leading-relaxed">
                Ücretsiz planda günlük yapay zeka danışmanlığı limitiniz (20 soru) dolmuştur.
              </p>
              
              <div className="my-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left text-xs font-semibold space-y-2 text-text-muted">
                <p className="text-white font-bold flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" /> PRO Üyelik Ayrıcalıkları:</p>
                <p>• Sınırsız Sınav Koçu kullanımı</p>
                <p>• Reklamsız Sınav Çözümü</p>
                <p>• Tüm Konu Anlatımları ve Soru Bankası</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    navigate('/dashboard/settings');
                  }}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-98 transition shadow-lg shadow-amber-500/10"
                >
                  PRO Sürüme Geç
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
