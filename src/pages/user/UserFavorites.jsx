import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Search, Trash2, ChevronRight, BookOpen, 
  HelpCircle, ImageIcon, CheckCircle2, XCircle,
  Clock, BarChart2, Inbox, Loader2, Flag
} from 'lucide-react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const UserFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleRemoveFavorite = async (qId, e) => {
    e.stopPropagation();
    if (!window.confirm('Bu soruyu favorilerinizden çıkarmak istiyor musunuz?')) return;
    try {
      await api.delete(`/users/favorites/${qId}`);
      setFavorites(prev => prev.filter(q => q._id !== qId));
      if (selectedQuestion?._id === qId) setSelectedQuestion(null);
    } catch (err) {
      alert('Hata oluştu');
    }
  };

  const filteredFavorites = favorites.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      case 'easy': return 'KOLAY';
      case 'medium': return 'ORTA';
      case 'hard': return 'ZOR';
      default: return 'BELİRSİZ';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-128px)] gap-6">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            Favori Sorularım
          </h1>
          <p className="text-text-secondary text-sm mt-1">Tekrar çalışmak için yıldızladığınız tüm sorular burada listelenir.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 min-h-0">
        
        {/* Left Side: Question List */}
        <div className="md:w-96 w-full flex flex-col gap-4 shrink-0">
          
          <div className="glass-card p-4 rounded-[24px] border border-white/5 space-y-4">
            <div className="flex items-center bg-black/40 rounded-[18px] px-4 py-3 w-full border border-white/5 transition-all focus-within:border-amber-500/50">
              <Search className="w-5 h-5 text-amber-500/70 mr-3" />
              <input 
                type="text" 
                placeholder="Favorilerinde ara..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-text-muted font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                {filteredFavorites.length} SORU LİSTELENDİ
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-bg-card border border-white/5 rounded-[24px]">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Sorular Yükleniyor...</span>
                </div>
            ) : filteredFavorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-bg-card border border-white/5 rounded-[24px] text-center px-6">
                    <Star className="w-16 h-16 text-white/5 mb-4" />
                    <h3 className="text-sm font-bold text-white mb-2">Henüz favori sorunuz yok</h3>
                    <p className="text-xs text-text-muted">Sınav çözerken zorlandığınız soruları yıldızlayarak buraya ekleyebilirsiniz.</p>
                    <button 
                      onClick={() => navigate('/dashboard/exams')}
                      className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                    >
                      Sınavlara Git
                    </button>
                </div>
            ) : (
                filteredFavorites.map((question) => {
                    const isSelected = selectedQuestion?._id === question._id;
                    
                    return (
                        <motion.button
                            key={question._id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedQuestion(question)}
                            className={`w-full text-left p-5 rounded-[24px] border transition-all duration-300 relative group ${
                                isSelected 
                                ? 'bg-amber-500/[0.03] border-amber-500/30 shadow-2xl' 
                                : 'bg-bg-card border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getDifficultyColor(question.difficulty)}`}>
                                    {getDifficultyLabel(question.difficulty)}
                                </span>
                                <button 
                                  onClick={(e) => handleRemoveFavorite(question._id, e)}
                                  className="p-2 bg-white/5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            
                            <h3 className="font-bold text-sm line-clamp-2 mb-2 text-white/90 leading-relaxed">
                                {question.text}
                            </h3>
                            
                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-tighter">
                                    <BookOpen className="w-2.5 h-2.5" /> {question.subject || 'Genel'}
                                </span>
                                {question.media && (
                                  <span className="text-[9px] font-black text-primary-light bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-tighter">
                                      <ImageIcon className="w-2.5 h-2.5" /> Görselli
                                  </span>
                                )}
                            </div>
                        </motion.button>
                    );
                })
            )}
          </div>
        </div>

        {/* Right Side: Detail Area */}
        <div className="flex-1 glass-card rounded-[32px] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
          {selectedQuestion ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedQuestion._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full"
              >
                {/* Detail Header */}
                <div className="px-8 py-5 border-b border-white/5 bg-black/40 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white leading-none">Soru Detayı</h2>
                      <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">{selectedQuestion.subject || 'Genel Kategori'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleRemoveFavorite(selectedQuestion._id, e)}
                    className="flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-xl text-xs font-bold hover:bg-danger hover:text-white transition-all"
                  >
                    <Star className="w-4 h-4 fill-current" /> Favoriden Çıkar
                  </button>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                  
                  {/* Question Media if exists */}
                  {selectedQuestion.media && (
                    <div className="max-w-xl mx-auto mb-8 bg-black/20 border border-white/5 rounded-3xl overflow-hidden p-2">
                       <img 
                          src={selectedQuestion.media.startsWith('http') ? selectedQuestion.media : `http://localhost:3000/${selectedQuestion.media}`} 
                          alt="Soru Görseli"
                          className="w-full h-auto max-h-[300px] object-contain rounded-2xl"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Görsel+Yüklenemedi'}
                       />
                    </div>
                  )}

                  {/* Question Text */}
                  <div className="max-w-2xl mx-auto">
                    <p className="text-lg font-bold text-white leading-relaxed text-center">
                      {selectedQuestion.text}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto pt-6">
                    {selectedQuestion.options.map((opt, idx) => {
                      const isCorrect = idx === selectedQuestion.correctAnswer;
                      return (
                        <div 
                          key={idx}
                          className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                            isCorrect 
                              ? 'bg-success/5 border-success/30 text-success' 
                              : 'bg-white/5 border-white/5 text-white/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isCorrect ? 'bg-success text-white' : 'bg-white/10 text-white/30'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="font-bold text-sm leading-tight">{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-5 h-5 ml-auto" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {selectedQuestion.explanation && (
                    <div className="max-w-3xl mx-auto pt-8">
                      <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                          <HelpCircle className="w-20 h-20 text-primary-light" />
                        </div>
                        <h4 className="text-xs font-black text-primary-light uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Soru Çözümü & Açıklama
                        </h4>
                        <p className="text-sm text-white/80 leading-relaxed relative z-10">
                          {selectedQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-32 h-32 rounded-[40px] bg-amber-500/5 border border-amber-500/10 flex items-center justify-center mb-8 relative">
                    <Star className="w-12 h-12 text-amber-500/10 relative z-10" />
                    <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full"></div>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Soru Seçilmedi</h3>
                <p className="text-text-secondary text-sm max-w-sm mt-3 font-medium">
                  Detayları ve doğru cevabı görmek için sol taraftaki listeden bir soru seçiniz.
                </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default UserFavorites;
