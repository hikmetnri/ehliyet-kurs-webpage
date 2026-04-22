import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Star, Flame, Trophy,
  ArrowRight, ShieldCheck, Zap, Lock,
  Clock, PlayCircle, LayoutGrid, ChevronRight,
  AlertCircle, Settings2, RefreshCcw, Loader2, Users
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import CategorySelectorModal from '../../components/user/CategorySelectorModal';

const fallbackQuotes = [
  { text: "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.", author: "Robert Collier" },
  { text: "Öğrenmek akıntıya karşı kürek çekmek gibidir, durduğunuz an geriye gidersiniz.", author: "Çin Atasözü" },
  { text: "Büyük işler güçle değil, azimle yapılır.", author: "Samuel Johnson" },
  { text: "Zorlu yollar, usta sürücüler yetiştirir.", author: "Ehliyet Yolu" }
];

const UserHome = () => {
  const { user, setAuth, token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [quote, setQuote] = useState(fallbackQuotes[0]);
  const [isMockMode, setIsMockMode] = useState(false);
  
  const [isChangingCategory, setIsChangingCategory] = useState(false);

  useEffect(() => {
    setQuote(fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setIsMockMode(false);
        
        // 1. İstatistikler
        try {
          const statsRes = await api.get('/exam-results/stats');
          if (statsRes.data && !statsRes.data.error) setStats(statsRes.data);
        } catch (e) { console.error("Stats error", e); }

        // 2. Ana Kategoriler
        try {
          const mainRes = await api.get('/categories');
          let mainData = mainRes.data?.data || mainRes.data?.categories || mainRes.data;
          const filteredMain = (Array.isArray(mainData) ? mainData : []).filter(c => !c.parent);
          setMainCategories(filteredMain);
          if (filteredMain.length === 0) setIsMockMode(true);
        } catch (e) { 
          setIsMockMode(true);
          console.error("Main categories error", e); 
        }
        
        // 3. Alt Dersler
        if (user?.selectedCategoryId) {
          try {
            const subRes = await api.get(`/categories?parent=${user.selectedCategoryId}`);
            let subData = subRes.data?.data || subRes.data?.categories || subRes.data;
            setSubCategories(Array.isArray(subData) ? subData : []);
            setIsChangingCategory(false);
          } catch (e) { console.error("Sub categories error", e); }
        } else {
          setIsChangingCategory(true);
          setSubCategories([]);
        }
        
        // 4. Günün Sözü
        try {
          const quoteRes = await api.get('/quotes/random');
          if (quoteRes.data && quoteRes.data.text) {
            setQuote({
              text: quoteRes.data.text,
              author: quoteRes.data.author || 'Sistem'
            });
          }
        } catch (e) { 
          console.error("Quotes error", e); 
        }
        
      } catch (err) {
        console.error("Global fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.selectedCategoryId]);

  const handleQuickSelect = async (cat) => {
    if (selectingId) return;
    setSelectingId(cat._id);
    try {
      const res = await api.put('/auth/profile', {
        selectedCategoryId: cat._id,
        selectedCategoryName: cat.name
      });
      if (res.data.success) {
        setAuth({ ...user, ...res.data.user }, token);
        setIsChangingCategory(false);
      }
    } catch (err) {
      console.error("Seçim güncellenemedi:", err);
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-24 text-white">
      
      {/* Offline Mode Warning */}
      {isMockMode && !loading && mainCategories.length === 0 && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-warning/10 border border-warning/20 p-3 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-warning shrink-0" />
          <p className="text-[11px] font-bold text-warning uppercase tracking-wider font-montserrat">Backend verisi bulunamadı veya bağlantı yok. Admin panelden kategori eklemelisiniz.</p>
        </motion.div>
      )}

      {/* Hero & Stats Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-6 md:p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] pointer-events-none rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-light">Günün Sözü</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black leading-tight mb-6 italic font-display">
              "{quote.text}"
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg shadow-primary/20">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center font-black text-xs">EH</div>
              </div>
              <span className="text-text-muted font-bold">— {quote.author}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between bg-gradient-to-br from-white/[0.02] to-transparent"
        >
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl tracking-tight">İlerleme</h3>
              <Zap className="w-6 h-6 text-primary-light" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">
                  <span>Günlük Hedef</span>
                  <span className="text-white">{stats?.todayQuestions || 0}/{stats?.dailyGoal || 20}</span>
                </div>
                <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((stats?.todayQuestions || 0) / (stats?.dailyGoal || 20)) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary-light rounded-full"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">{stats?.streak || 0} Gün</div>
                    <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">Çalışma Serisi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Extra Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-center bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sınav Geri Sayımı</span>
          </div>
          <div className="flex gap-4 font-black text-3xl">
            <div className="text-center"><span className="block">14</span><span className="text-[8px] text-text-muted uppercase mt-1">GÜN</span></div>
            <span className="opacity-20">:</span>
            <div className="text-center"><span className="block">05</span><span className="text-[8px] text-text-muted uppercase mt-1">SAAT</span></div>
            <span className="opacity-20">:</span>
            <div className="text-center"><span className="block">42</span><span className="text-[8px] text-text-muted uppercase mt-1">DAK</span></div>
          </div>
        </div>
        <Link to="/dashboard/exams" className="md:col-span-2 p-8 rounded-[2.5rem] bg-gradient-to-r from-primary to-accent relative overflow-hidden group shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all">
           <PlayCircle className="absolute right-[-30px] top-[-30px] w-52 h-52 text-white opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000" />
           <div className="relative z-10 flex h-full items-center justify-between">
              <div>
                <span className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Hemen Başla</span>
                <h3 className="text-3xl font-black leading-tight">Deneme Sınavları ile<br/>Kendini Test Et!</h3>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-white/40 transition-all">
                <ArrowRight className="w-8 h-8" />
              </div>
           </div>
        </Link>
      </div>

      {/* Ehliyet Sınıfı Seçimi */}
      <section className="relative pt-6">
        <div className="flex items-center justify-between mb-8 px-4">
           <div className="flex items-center gap-4">
             <div className="w-3 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(108,99,255,0.6)]"></div>
             <div>
               <h2 className="text-3xl font-black tracking-tight italic">
                 {isChangingCategory || !user?.selectedCategoryId ? 'Eğitim Sınıfını Seç' : 'Seçili Eğitim Paketi'}
               </h2>
               {!isChangingCategory && user?.selectedCategoryId && (
                 <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">
                   Şu an <span className="text-primary-light">{user.selectedCategoryName}</span> müfredatındasın
                 </p>
               )}
             </div>
           </div>
           
           {user?.selectedCategoryId && !isChangingCategory && (
             <button 
               onClick={() => setIsChangingCategory(true)}
               className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-primary/20 flex items-center justify-center text-text-muted hover:text-primary transition-all border border-white/10 group"
             >
               <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
             </button>
           )}
        </div>

        <AnimatePresence mode="wait">
          {isChangingCategory || !user?.selectedCategoryId ? (
            <motion.div 
              key="selector-grid"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {mainCategories.length > 0 ? (
                mainCategories.map((cat) => (
                  <motion.div
                    key={cat._id}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`glass-card p-8 rounded-[3rem] border-2 transition-all cursor-pointer group relative overflow-hidden ${user?.selectedCategoryId === cat._id ? 'border-primary bg-primary/10 shadow-2xl shadow-primary/20' : 'border-white/5 hover:border-white/20'}`}
                    onClick={() => handleQuickSelect(cat)}
                  >
                    <div className="flex items-center gap-6 relative z-10">
                      <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-3xl transition-all ${user?.selectedCategoryId === cat._id ? 'bg-primary text-white shadow-xl shadow-primary/40' : 'bg-white/5 text-text-muted group-hover:bg-white/10 group-hover:text-white'}`}>
                        {selectingId === cat._id ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldCheck className="w-10 h-10" />}
                      </div>
                      <div>
                        <h4 className="font-black text-2xl mb-1 tracking-tight">{cat.name}</h4>
                        <p className="text-[11px] text-text-muted font-black uppercase tracking-widest">Giriş Yapmak İçin Tıkla</p>
                      </div>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                       <ShieldCheck className="w-32 h-32" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border border-white/5">
                   <p className="text-text-muted font-bold">Lütfen Admin Panelden Ehliyet Sınıfı Kategori Ekleyiniz.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="selected-header"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
              className="glass-card p-10 rounded-[3rem] border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none" />
               <div className="flex items-center gap-8 relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-primary shadow-2xl shadow-primary/50 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform">
                    <ShieldCheck className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black tracking-tighter mb-2">{user.selectedCategoryName}</h3>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-text-muted">
                       <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full"><BookOpen className="w-3.5 h-3.5 text-primary-light" /> {subCategories.length} Eğitim Konusu</span>
                       <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full text-warning"><Star className="w-3.5 h-3.5" /> MEB Müfredatına Uygun</span>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={() => setIsChangingCategory(true)}
                 className="flex items-center gap-3 px-10 py-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-sm font-black border border-white/10 transition-all group relative z-10"
               >
                 <Settings2 className="w-5 h-5 text-primary-light group-hover:rotate-90 transition-transform" /> 
                 SINIFI DEĞİŞTİR
               </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Çalışma Müfredatı */}
        <AnimatePresence>
          {!isChangingCategory && user?.selectedCategoryId && subCategories.length > 0 && (
            <motion.div 
              className="mt-16"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-8 px-4">
                 <div className="w-12 h-12 rounded-[1rem] bg-accent/10 border border-accent/20 flex items-center justify-center">
                   <LayoutGrid className="w-6 h-6 text-accent-light" />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight">Kategori Müfredatı</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {subCategories.map((cat, i) => (
                    <motion.div key={cat._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                       <Link to={`/dashboard/lessons?category=${cat._id}`} className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all flex flex-col h-full group relative overflow-hidden">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8"><BookOpen className="w-7 h-7 text-primary-light" /></div>
                          <h4 className="font-black text-xl mb-3 tracking-tighter leading-none group-hover:text-primary-light transition-colors">{cat.name}</h4>
                          <p className="text-xs text-text-muted font-medium line-clamp-2 mb-8 leading-relaxed">{cat.description || 'Bu ders için hazırlanan özel eğitim müfredatı.'}</p>
                          <div className="mt-auto pt-5 flex items-center justify-between border-t border-white/5">
                             <div className="flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{cat.content ? 'Ders İçeriği Hazır' : 'Okuma Materyali'}</span>
                             </div>
                             <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-2 transition-all" />
                          </div>
                          <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                             <BookOpen className="w-28 h-28" />
                          </div>
                       </Link>
                    </motion.div>
                 ))}
              </div>
            </motion.div>
          )}
          {!isChangingCategory && user?.selectedCategoryId && subCategories.length === 0 && !loading && (
            <motion.div className="mt-16 text-center py-20 glass-card rounded-[3rem] border border-dashed border-white/10 mx-4">
               <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
               <p className="text-text-muted font-bold">Bu sınıfa ait çalışma konusu henüz eklenmemiş.</p>
               <p className="text-[10px] text-text-muted uppercase mt-2">Lütfen daha sonra tekrar kontrol edin.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <CategorySelectorModal 
        isOpen={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)} 
      />
    </div>
  );
};

export default UserHome;
