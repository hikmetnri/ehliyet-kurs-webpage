import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  ChevronDown,
  Crown,
  Loader2,
  Maximize2,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../api';
import useAuthStore from '../../store/authStore';
import { getAiPageContext } from '../../utils/aiPageContext';

const QUICK_PROMPTS = [
  { text: 'Bu ekranda neye öncelik vermeliyim?', category: 'Rehber' },
  { text: 'Kavşaklarda geçiş üstünlüğünü kısa örnekle anlatır mısın?', category: 'Trafik' },
  { text: 'Bu konuyu sınav diliyle nasıl çalışmalıyım?', category: 'Çalışma' },
  { text: 'Yanlışlarımı azaltmak için bugün ne yapayım?', category: 'Analiz' },
];

const getContextHint = (pathname) => {
  if (pathname.includes('/lessons')) return 'Konu anlatımında takıldığın yeri yaz, sade örnekle açıklayayım.';
  if (pathname.includes('/exams')) return 'Test çözerken zorlandığın mantığı yaz, ipucu ve konu özeti vereyim.';
  if (pathname.includes('/traffic-signs')) return 'Bir levhanın anlamını veya kullanım yerini sorabilirsin.';
  if (pathname.includes('/stats')) return 'İstatistiklerine göre nasıl çalışacağını birlikte planlayabiliriz.';
  if (pathname.includes('/settings')) return 'Hedef, sınav tarihi veya çalışma düzeni için yardım edebilirim.';
  return 'Ehliyet, iş makinesi, İSG ve sınav çalışması hakkında soru sorabilirsin.';
};

const markdownComponents = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="mb-2 list-disc space-y-1 pl-5" {...props} />,
  ol: ({ node, ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-5" {...props} />,
  li: ({ node, ...props }) => <li className="font-medium" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-black text-primary-light" {...props} />,
};

export default function FloatingAIChat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
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

  const contextHint = useMemo(() => getContextHint(location.pathname), [location.pathname]);
  const remainingPrompts = Math.max(0, limit - promptCount);

  useEffect(() => {
    sessionStorage.setItem('ehliyet_yolu_ai_chat', JSON.stringify(messages));
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    const fetchPromptCount = async () => {
      try {
        const res = await api.get('/users/me');
        const data = res.data?.data || res.data?.user || res.data;
        setPromptCount(data?.aiPromptCount || 0);
      } catch (err) {
        console.error('AI hak bilgisi alınamadı:', err);
      }
    };
    fetchPromptCount();
  }, []);

  useEffect(() => {
    const syncContext = () => setPageContext(getAiPageContext());
    syncContext();
    window.addEventListener('ai-page-context-change', syncContext);
    return () => window.removeEventListener('ai-page-context-change', syncContext);
  }, [location.pathname]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    if (!user?.proStatus && promptCount >= limit) {
      setShowLimitModal(true);
      return;
    }

    const newUserMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setLoading(true);
    setErrorText('');
    setOpen(true);

    try {
      const contextMessages = [...messages, newUserMessage].slice(-10);
      const res = await api.post('/ai/chat', {
        messages: contextMessages,
        pageContext: getAiPageContext(),
      }, { timeout: 45000 });
      const assistantMessage = { role: 'assistant', content: res.data?.reply || 'Şu an yanıt üretemedim.' };
      setMessages((prev) => [...prev, assistantMessage]);
      if (res.data?.promptCount !== undefined) setPromptCount(res.data.promptCount);
      if (res.data?.limit !== undefined) setLimit(res.data.limit);
    } catch (err) {
      const isLimitError = err.response?.status === 403 && err.response?.data?.limitReached;
      if (isLimitError) {
        setPromptCount(limit);
        setShowLimitModal(true);
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

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('ehliyet_yolu_ai_chat');
    setErrorText('');
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-[6.25rem] right-3 z-50 flex h-[min(680px,calc(100vh-8rem))] w-[calc(100vw-1.5rem)] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d13] shadow-2xl shadow-black/50 lg:bottom-6 lg:right-6"
          >
            <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary-light">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-white">Sınav Koçu</h2>
                  <p className="truncate text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {user?.proStatus ? 'Sınırsız PRO' : `${remainingPrompts}/${limit} hak kaldı`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button onClick={clearChat} className="rounded-xl p-2 text-text-muted transition hover:bg-white/5 hover:text-danger" title="Sohbeti temizle">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => navigate('/dashboard/ai-chat')} className="rounded-xl p-2 text-text-muted transition hover:bg-white/5 hover:text-white" title="Tam sayfa aç">
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(false)} className="rounded-xl p-2 text-text-muted transition hover:bg-white/5 hover:text-white" title="Kapat">
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col justify-center">
                  <div className="mb-5 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl border border-primary/25 bg-primary/15 text-primary-light">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-black text-white">Bulunduğun yerde sor</h3>
                    <p className="mx-auto mt-2 max-w-xs text-sm font-semibold leading-6 text-text-muted">{contextHint}</p>
                    {pageContext?.page && (
                      <p className="mx-auto mt-3 w-fit rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-light">
                        Ekran bağlamı aktif
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt.text}
                        onClick={() => handleSend(prompt.text)}
                        className="group rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:bg-white/[0.05]"
                      >
                        <p className="line-clamp-2 text-xs font-bold leading-5 text-white/90">"{prompt.text}"</p>
                        <span className="mt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary-light">
                          {prompt.category}
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <motion.div
                        key={`${msg.role}-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border text-xs font-black ${isUser ? 'border-white/10 bg-white/10 text-white' : 'border-primary/25 bg-primary/15 text-primary-light'}`}>
                          {isUser ? 'S' : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${isUser ? 'rounded-tr-none bg-primary text-white' : 'rounded-tl-none border border-white/10 bg-white/[0.04] text-white/90'}`}>
                          {isUser ? (
                            <div className="whitespace-pre-wrap font-semibold">{msg.content}</div>
                          ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {loading && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary-light">
                        <Bot className="h-4 w-4 animate-bounce" />
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-text-muted">
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-primary-light" />
                        Yanıt hazırlanıyor...
                      </div>
                    </div>
                  )}
                  {errorText && (
                    <div className="flex items-center gap-2 rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-xs font-bold text-danger">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorText}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="border-t border-white/10 bg-[#090b10] p-3"
            >
              <div className="flex gap-2">
                <input
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  disabled={loading}
                  placeholder="Sorunu yaz..."
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white transition hover:bg-primary-light disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-[6.25rem] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary text-white shadow-2xl shadow-primary/25 transition hover:bg-primary-light active:scale-95 lg:bottom-6 lg:right-6 ${open ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        aria-label="AI danışmanı aç"
      >
        <MessageCircle className="h-6 w-6" />
        {!user?.proStatus && remainingPrompts > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#07080c] bg-success px-1 text-[10px] font-black text-white">
            {remainingPrompts > 9 ? '9+' : remainingPrompts}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="w-full max-w-sm rounded-3xl border border-amber-500/25 bg-[#121422] p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10">
                <Crown className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-black text-white">Günlük AI sınırı doldu</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-text-muted">
                Ücretsiz planda günlük yapay zeka danışmanlığı limitine ulaştın.
              </p>
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  navigate('/dashboard/settings');
                }}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-amber-500 text-xs font-black uppercase tracking-widest text-white"
              >
                PRO Sürüme Geç
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest text-text-secondary"
              >
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
