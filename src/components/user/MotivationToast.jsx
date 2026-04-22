import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

const quotes = [
  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
  "İyi bir sürücü, sadece aracı değil, duygularını da yönetendir.",
  "Bugün yapacağın pratik, yarınki güvenli sürüşünün temelidir.",
  "Direksiyondaki rahatlığın, bilginden gelir.",
  "Hata yapmaktan korkma, onlardan ders almaktan kork.",
  "Zorlu yollar, usta sürücüler yetiştirir."
];

const MotivationToast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Sadece session'da yoksa göster ki her sayfaya geçişte rahatsız etmesin
    const hasSeenToast = sessionStorage.getItem('hasSeenMotivation');
    if (!hasSeenToast) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
      
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('hasSeenMotivation', 'true');
        
        // 5 saniye sonra otomatik kapat
        setTimeout(() => setIsVisible(false), 6000);
      }, 1000); // Sayfa yüklendikten 1 saniye sonra

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          <div className="glass-card rounded-2xl p-4 flex items-start gap-4 shadow-2xl relative overflow-hidden group border-white/10 border bg-bg-card/80 backdrop-blur-xl">
            {/* Soft Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50"></div>
            
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Sparkles className="w-5 h-5 text-primary-light animate-pulse" />
            </div>
            
            <div className="flex-1 pt-1 z-10">
              <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">Günün Motivasyonu</h4>
              <p className="text-text-muted text-xs leading-relaxed font-medium">"{quote}"</p>
            </div>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1 text-text-muted hover:text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MotivationToast;
