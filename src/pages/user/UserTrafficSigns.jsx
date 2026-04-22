import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TriangleAlert, Info, CircleStop, ArrowRight, Filter } from 'lucide-react';
import { trafficSignsData, categories } from '../../data/trafficSignsData';

const UserTrafficSigns = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSign, setSelectedSign] = useState(null);

  const filteredSigns = trafficSignsData.filter(sign => {
    const matchesCategory = activeCategory === 'all' || sign.category === activeCategory;
    const matchesSearch = sign.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sign.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 mb-8"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(6,182,212,0.1) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-black uppercase tracking-widest mb-6">
              <TriangleAlert className="w-4 h-4" /> Eğitim Materyali
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Trafik İşaretleri <span className="gradient-text">Kütüphanesi</span>
            </h1>
            <p className="text-text-secondary text-base sm:text-lg max-w-2xl leading-relaxed">
              Trafik levhalarının anlamlarını ve gruplarını öğrenerek sınavda ve gerçek trafikte bir adım önde olun.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-text-muted" />
          </div>
          <input
            type="text"
            placeholder="İşaret ara (Örn: Kavşak, Dur, Park)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-card border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-lg"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center whitespace-nowrap gap-2 px-5 py-4 rounded-2xl text-sm font-bold transition-all border ${
                activeCategory === cat.id 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-bg-card border-white/5 text-text-muted hover:border-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredSigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-bg-card border border-white/5 rounded-[2.5rem]">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Search className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Sonuç Bulunamadı</h3>
          <p className="text-text-muted">Arama kriterlerinize uyan trafik işareti bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSigns.map((sign, idx) => (
            <motion.div
              key={sign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedSign(sign)}
              className="glass-card rounded-3xl p-6 border border-white/5 cursor-pointer hover:border-white/20 transition-all group flex flex-col items-center text-center"
            >
              <div className="h-32 flex items-center justify-center mb-6">
                <img 
                  src={sign.image} 
                  alt={sign.title} 
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl" 
                />
              </div>
              <h3 className="text-white font-bold text-base mb-2 group-hover:text-primary-light transition-colors line-clamp-2 min-h-[40px] flex items-center">
                {sign.title}
              </h3>
              <div className="mt-auto pt-4 flex items-center justify-center gap-1 text-xs font-semibold text-text-muted group-hover:text-white transition-colors">
                Detayları Gör <ArrowRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSign(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#101017] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-32 h-32 mb-6 flex items-center justify-center bg-white/5 rounded-3xl p-4">
                <img src={selectedSign.image} alt={selectedSign.title} className="max-w-full max-h-full drop-shadow-2xl" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2">{selectedSign.title}</h2>
              
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-text-secondary uppercase tracking-widest mb-6">
                {categories.find(c => c.id === selectedSign.category)?.label}
              </div>
              
              <p className="text-text-muted leading-relaxed mb-8">
                {selectedSign.description}
              </p>
              
              <button 
                onClick={() => setSelectedSign(null)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest transition-colors border border-white/5"
              >
                Kapat
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserTrafficSigns;
