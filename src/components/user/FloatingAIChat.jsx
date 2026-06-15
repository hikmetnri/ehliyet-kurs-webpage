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
  p: ({ node: _node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({ node: _node, ...props }) => <ul className="mb-2 list-disc space-y-1 pl-5" {...props} />,
  ol: ({ node: _node, ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-5" {...props} />,
  li: ({ node: _node, ...props }) => <li className="font-medium" {...props} />,
  strong: ({ node: _node, ...props }) => <strong className="font-black text-primary-light" {...props} />,
};

const TypewriterMarkdown = ({ content, speed = 8, scrollRef, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let currentText = '';
    let index = 0;
    setDisplayedContent('▎');

    const interval = setInterval(() => {
      if (index < content.length) {
        currentText += content[index];
        setDisplayedContent(currentText + '▎');
        index++;
        if (scrollRef && scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'auto' });
        }
      } else {
        clearInterval(interval);
        setDisplayedContent(content);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, speed, scrollRef]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {displayedContent}
    </ReactMarkdown>
  );
};

export default function FloatingAIChat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isSolvePage = location.pathname.includes('/exams/') && location.pathname !== '/dashboard/exams';
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
  const [assistantLabelIndex, setAssistantLabelIndex] = useState(0);
  const [showAssistantLabel, setShowAssistantLabel] = useState(true);
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

  useEffect(() => {
    let timer;

    const cycleLabel = (visible, index) => {
      timer = window.setTimeout(() => {
        if (visible) {
          setShowAssistantLabel(false);
          cycleLabel(false, index);
        } else {
          const nextIndex = (index + 1) % 2;
          setAssistantLabelIndex(nextIndex);
          setShowAssistantLabel(true);
          cycleLabel(true, nextIndex);
        }
      }, visible ? 2400 : 650);
    };

    cycleLabel(true, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const markMessageAsTyped = (msgIndex) => {
    setMessages((prev) => prev.map((m, idx) => idx === msgIndex ? { ...m, isNew: false } : m));
  };

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
      const assistantMessage = { role: 'assistant', content: res.data?.reply || 'Şu an yanıt üretemedim.', isNew: true };
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
            ? 'Yola yanıtı biraz uzun sürdü. Lütfen tekrar deneyin.'
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
            className="fixed bottom-[6.25rem] right-3 z-50 flex h-[min(680px,calc(100vh-8rem))] w-[calc(100vw-1.5rem)] max-w-[420px] flex-col overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-b from-[#0b0d13] to-[#06080c] shadow-[0_20px_50px_rgba(0,0,0,0.5)] lg:bottom-6 lg:right-6"
          >
            <header className="flex items-center justify-between gap-3 border-b border-white/[0.08] bg-white/[0.015] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary-light/20 to-accent/20 text-primary-light shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-white">Yolla AI</h2>
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
                <div className="flex min-h-full flex-col justify-center relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-primary/5 blur-[40px] pointer-events-none" />
                  
                  <div className="mb-5 text-center relative z-10">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[22px] border border-primary/30 bg-gradient-to-br from-primary-light/15 to-accent/15 text-primary-light shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-black text-white">Bulunduğun Yerde Sor</h3>
                    <p className="mx-auto mt-2 max-w-xs text-xs font-semibold leading-5 text-text-muted">{contextHint}</p>
                    {pageContext?.page && (
                      <p className="mx-auto mt-3 w-fit rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary-light">
                        Ekran bağlamı aktif
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2 relative z-10">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt.text}
                        onClick={() => handleSend(prompt.text)}
                        className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3 text-left transition hover:bg-white/[0.04] hover:border-primary/25 hover:shadow-[0_4px_15px_rgba(99,102,241,0.05)] cursor-pointer"
                      >
                        <p className="line-clamp-2 text-xs font-bold leading-5 text-white/90">"{prompt.text}"</p>
                        <span className="mt-2 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-primary-light">
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
                        className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}
                      >
                        {isUser ? (
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-[10px] shadow-md">
                            {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-primary/30 bg-gradient-to-br from-primary-light/20 to-accent/20 text-primary-light shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                            <Bot className="h-4.5 w-4.5 text-primary-light" />
                          </div>
                        )}
                        <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-5 ${
                          isUser 
                            ? 'rounded-tr-none bg-gradient-to-br from-primary to-primary-dark text-white font-semibold shadow-[0_3px_10px_rgba(99,102,241,0.15)]' 
                            : 'rounded-tl-none border border-white/[0.06] bg-white/[0.03] backdrop-blur-md text-white/90 shadow-[0_5px_15px_rgba(0,0,0,0.1)]'
                        }`}>
                          {isUser ? (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            msg.isNew ? (
                              <TypewriterMarkdown
                                content={msg.content}
                                scrollRef={messagesEndRef}
                                onComplete={() => markMessageAsTyped(index)}
                              />
                            ) : (
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {msg.content}
                              </ReactMarkdown>
                            )
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {loading && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary-light/20 to-accent/20 text-primary-light animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        <Bot className="h-4.5 w-4.5 animate-bounce text-primary-light" />
                      </div>
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md px-4 py-3 text-xs font-bold text-text-muted flex items-center gap-2">
                        <Loader2 className="inline h-3.5 w-3.5 animate-spin text-primary-light" />
                        Yolla AI yanıt hazırlıyor...
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
              className="border-t border-white/[0.08] bg-black/40 backdrop-blur-md p-3"
            >
              <div className="flex gap-2.5">
                <input
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  disabled={loading}
                  placeholder="Sorunu yaz..."
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-text-muted focus:border-primary/45 focus:ring-4 focus:ring-primary/10 disabled:opacity-50 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition duration-200"
                >
                  {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <div className={`fixed z-40 flex items-center gap-2 ${
        isSolvePage 
          ? 'bottom-[5.25rem] right-4 lg:bottom-[5.5rem] lg:right-6' 
          : 'bottom-[6.25rem] right-4 lg:bottom-6 lg:right-6'
      } ${open ? 'pointer-events-none' : ''}`}>
        <AnimatePresence mode="wait">
          {!open && showAssistantLabel && (
            <motion.button
              key={assistantLabelIndex}
              type="button"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, x: 24, scaleX: 0.75 }}
              animate={{ opacity: 1, x: 0, scaleX: 1 }}
              exit={{ opacity: 0, x: 18, scaleX: 0.82 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="origin-right whitespace-nowrap rounded-2xl border border-primary/25 bg-[#111424]/95 px-4 py-2.5 text-xs font-black text-white shadow-xl shadow-black/30 backdrop-blur-md"
            >
              {assistantLabelIndex === 0 ? 'Yolla AI' : 'Yolla AI Asistanı'}
            </motion.button>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary text-white shadow-2xl shadow-primary/25 transition hover:bg-primary-light active:scale-95 ${open ? 'opacity-0' : 'opacity-100'}`}
          aria-label="Yolla AI asistanını aç"
        >
          <MessageCircle className="h-6 w-6" />
          {!user?.proStatus && remainingPrompts > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#07080c] bg-success px-1 text-[10px] font-black text-white">
              {remainingPrompts > 9 ? '9+' : remainingPrompts}
            </span>
          )}
        </button>
      </div>

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
