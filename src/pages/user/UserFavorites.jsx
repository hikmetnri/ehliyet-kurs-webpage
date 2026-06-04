import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Search,
  Trash2,
  BookOpen,
  HelpCircle,
  ImageIcon,
  CheckCircle2,
  Inbox,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const normalizeText = (value) => String(value || '').toLocaleLowerCase('tr-TR');

const UserFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubject, setActiveSubject] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/favorites');
      setFavorites(res.data.favorites || []);
    } catch (err) {
      console.error('Favoriler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = useMemo(() => {
    const subjects = favorites.map((question) => question.subject || 'Genel');
    return ['all', ...Array.from(new Set(subjects)).sort((a, b) => a.localeCompare(b, 'tr'))];
  }, [favorites]);

  useEffect(() => {
    if (activeSubject !== 'all' && !subjectOptions.includes(activeSubject)) {
      setActiveSubject('all');
    }
  }, [activeSubject, subjectOptions]);

  const filteredFavorites = useMemo(() => {
    const query = normalizeText(searchTerm);
    return favorites.filter((question) => {
      const subject = question.subject || 'Genel';
      const matchesSubject = activeSubject === 'all' || subject === activeSubject;
      const searchable = `${question.text || ''} ${subject} ${question.explanation || ''}`;
      return matchesSubject && normalizeText(searchable).includes(query);
    });
  }, [activeSubject, favorites, searchTerm]);

  const imageCount = useMemo(
    () => favorites.filter((question) => Boolean(question.media)).length,
    [favorites],
  );

  const handleRemoveFavorite = async (qId, e) => {
    e.stopPropagation();
    if (!window.confirm('Bu soruyu favorilerinizden çıkarmak istiyor musunuz?')) return;
    try {
      await api.delete(`/users/favorites/${qId}`);
      setFavorites((prev) => prev.filter((question) => question._id !== qId));
      if (selectedQuestion?._id === qId) setSelectedQuestion(null);
    } catch (err) {
      alert('Hata oluştu');
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'hard': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-text-muted bg-white/5 border-white/10';
    }
  };

  const getDifficultyLabel = (diff) => {
    switch (diff) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Belirsiz';
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-128px)] flex-col gap-5 pb-20 lg:h-[calc(100vh-128px)] lg:pb-0">
      <div className="flex shrink-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">Kayıtlı Sorular</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Favori Sorular</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-muted">
            Zorlandığın veya tekrar görmek istediğin soruları filtrele, doğru cevabı ve açıklamayı aynı ekranda incele.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/5 bg-[#0e1017]/80 p-1.5">
          {[
            ['Toplam', favorites.length],
            ['Konu', Math.max(0, subjectOptions.length - 1)],
            ['Görsel', imageCount],
          ].map(([label, value]) => (
            <div key={label} className="min-w-24 rounded-xl bg-white/[0.015] border border-white/[0.04] px-4 py-3 text-center transition hover:border-amber-500/20 hover:bg-amber-500/[0.02]">
              <p className="text-lg font-black text-amber-300 leading-none">{value}</p>
              <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col gap-4">
          <section className="rounded-3xl border border-white/10 bg-[#0e1017]/60 p-4 backdrop-blur-md">
            <div className="flex items-center rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 transition focus-within:border-amber-500/50 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Search className="mr-3 h-4.5 w-4.5 text-amber-300" />
              <input
                type="text"
                placeholder="Soru, konu veya açıklama ara..."
                className="w-full border-none bg-transparent text-xs font-semibold text-white outline-none placeholder:text-text-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
              {subjectOptions.map((subject) => {
                const active = activeSubject === subject;
                const count = subject === 'all'
                  ? favorites.length
                  : favorites.filter((question) => (question.subject || 'Genel') === subject).length;
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setActiveSubject(subject)}
                    className={`shrink-0 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                      active
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                        : 'border-white/5 bg-white/[0.015] text-text-muted hover:border-white/15 hover:text-white'
                    }`}
                  >
                    {subject === 'all' ? 'Tümü' : subject}
                    <span className="ml-2 opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
              <span>{filteredFavorites.length} soru listeleniyor</span>
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')} className="text-amber-300 hover:text-amber-200">
                  Temizle
                </button>
              )}
            </div>
          </section>

          <section className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sorular yükleniyor...</span>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 text-center">
                <Inbox className="mb-4 h-14 w-14 text-white/15" />
                <h3 className="text-sm font-black text-white">
                  {favorites.length === 0 ? 'Henüz favori sorunuz yok' : 'Filtreye uygun soru yok'}
                </h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-text-muted">
                  {favorites.length === 0
                    ? 'Sınav çözerken zorlandığınız soruları yıldızlayarak buraya ekleyebilirsiniz.'
                    : 'Arama metnini veya konu filtresini değiştirerek tekrar deneyin.'}
                </p>
                {favorites.length === 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/exams')}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-amber-400"
                  >
                    Sınavlara Git
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFavorites.map((question) => {
                  const isSelected = selectedQuestion?._id === question._id;
                  return (
                    <motion.div
                      key={question._id}
                      role="button"
                      tabIndex={0}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedQuestion(question)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedQuestion(question);
                        }
                      }}
                      className={`group w-full cursor-pointer rounded-2xl border-l-4 border-y border-r p-4 text-left transition hover:-translate-y-0.5 hover:scale-[1.01] duration-200 ${
                        isSelected
                          ? 'border-l-amber-500 border-y-white/5 border-r-white/5 bg-gradient-to-r from-amber-500/10 to-transparent text-white shadow-[0_4px_20px_rgba(245,158,11,0.15)]'
                          : question.difficulty === 'easy'
                            ? 'border-l-success/40 border-y-white/5 border-r-white/5 bg-white/[0.015] hover:border-l-success'
                            : question.difficulty === 'medium'
                              ? 'border-l-warning/40 border-y-white/5 border-r-white/5 bg-white/[0.015] hover:border-l-warning'
                              : question.difficulty === 'hard'
                                ? 'border-l-danger/40 border-y-white/5 border-r-white/5 bg-white/[0.015] hover:border-l-danger'
                                : 'border-l-white/10 border-y-white/5 border-r-white/5 bg-white/[0.015] hover:border-l-amber-500/30'
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <span className={`rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyLabel(question.difficulty)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveFavorite(question._id, e)}
                          className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-text-muted opacity-100 transition hover:border-danger/25 hover:bg-danger/10 hover:text-danger lg:opacity-0 lg:group-hover:opacity-100"
                          title="Favoriden çıkar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h3 className="line-clamp-3 text-sm font-bold leading-relaxed text-white">
                        {question.text}
                      </h3>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                          <BookOpen className="h-3.5 w-3.5" />
                          {question.subject || 'Genel'}
                        </span>
                        {question.media && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary-light">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Görselli
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </aside>

        <section className="min-h-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0e1017]/40 backdrop-blur-md">
          {selectedQuestion ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedQuestion._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-full flex-col"
              >
                <div className="flex flex-col gap-4 border-b border-white/10 bg-gradient-to-r from-[#11131a] to-[#0b0d12] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                      <HelpCircle className="h-5 w-5 text-amber-300" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-black text-white leading-none">Soru Detayı</h2>
                      <p className="mt-2 truncate text-[9px] font-black uppercase tracking-widest text-text-muted">
                        {selectedQuestion.subject || 'Genel Kategori'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFavorite(selectedQuestion._id, e)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-danger transition hover:bg-danger/15 active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Favoriden Çıkar
                  </button>
                </div>

                <div className="flex-1 space-y-7 overflow-y-auto p-5 custom-scrollbar sm:p-6 lg:p-8">
                  {selectedQuestion.media && (
                    <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-2 shadow-xl">
                      <img
                        src={resolveMediaUrl(selectedQuestion.media)}
                        alt="Soru Görseli"
                        className="max-h-[320px] w-full rounded-2xl object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div className="mx-auto max-w-3xl">
                    <p className="text-base font-bold leading-relaxed text-white sm:text-lg">
                      {selectedQuestion.text}
                    </p>
                  </div>

                  <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
                    {(selectedQuestion.options || []).map((opt, idx) => {
                      const isCorrect = idx === selectedQuestion.correctAnswer;
                      return (
                        <div
                          key={`${opt}-${idx}`}
                          className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                            isCorrect
                              ? 'border-success/40 bg-gradient-to-r from-success/10 to-transparent text-success shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black'
                              : 'border-white/5 bg-white/[0.015] text-text-secondary hover:border-white/15 hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors ${
                            isCorrect ? 'bg-success text-white' : 'bg-white/10 text-text-muted'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-sm font-bold leading-snug">{opt}</span>
                          {isCorrect && <CheckCircle2 className="ml-auto h-5 w-5 text-success shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {selectedQuestion.explanation && (
                    <div className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-6 shadow-[0_4px_20px_rgba(99,102,241,0.05)]">
                      <h4 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-light">
                        <Sparkles className="h-4 w-4" />
                        Soru Çözümü ve Açıklama
                      </h4>
                      <p className="text-sm font-semibold leading-relaxed text-white/85">
                        {selectedQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-8 text-center bg-gradient-to-b from-[#111218]/30 to-[#0e1017]/80">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[36px] bg-gradient-to-br from-amber-500/20 to-yellow-500/5 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <Star className="h-10 w-10 fill-amber-500/10 text-amber-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-white">Soru Seçilmedi</h3>
              <p className="mt-3 max-w-sm text-sm font-semibold leading-relaxed text-text-muted">
                Detayları, doğru cevabı ve açıklamayı görmek için listeden bir favori soru seç.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserFavorites;
