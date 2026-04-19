import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CarFront, Target, Trophy, CheckCircle2, ChevronRight, 
  Brain, Zap, Sparkles, Smartphone, Download, ChevronDown, Star, ShieldCheck, Map
} from 'lucide-react';
import api from '../api';

const FALLBACK_FAQS = [
  { _id: '1', question: "Ehliyet sınavına hazırlık için bu sistem yeterli mi?", answer: "Kesinlikle! MEB'in güncel 2026 müfredatına %100 uyumlu, daha önce çıkmış ve çıkma ihtimali yüksek sorulardan oluşan yapay zeka destekli havuzumuz tek başına yeterlidir." },
  { _id: '2', question: "Uygulamayı indirmek ücretli mi?", answer: "Uygulamamızı indirmek ve temel testleri çözmek tamamen ücretsizdir. Premium özellikler için opsiyonel PRO paketlerimiz bulunur." },
  { _id: '3', question: "Kişiselleştirilmiş analiz tam olarak nedir?", answer: "Çözdüğünüz her test analiz edilir. Yapay zeka karşınıza zayıf olduğunuz konulardan daha çok soru getirerek eksiklerinizi hızla kapatır." },
  { _id: '4', question: "Testler gerçek sınav formatında mı?", answer: "Birebir aynı! Elektronik sınav (e-sınav) merkezlerinde karşılaşacağınız arayüzün aynısını simüle ediyoruz." }
];

const features = [
  { icon: Brain, title: "Yapay Zeka Destekli Analiz", desc: "Zayıf noktalarını bul, sadece ihtiyacın olanı çalış. Zaman kazan." },
  { icon: Sparkles, title: "Oyunlaştırma (Gamification)", desc: "Günlük hedefler, rozetler ve Türkiye geneli liderlik tablosu ile çalışmayı eğlenceye çevir." },
  { icon: Map, title: "Görsel ve 3D Anlatımlar", desc: "Sıkıcı uzun metinler yok. Tüm karmaşık trafik kurallarını görsel haritalarla öğren." },
  { icon: Target, title: "Birebir MEB Simülasyonu", desc: "Gerçek sınav arayüzünün birebir kopyası ile sınav stresi yaşamadan pratik yap." }
];

const FAQItem = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
      className={`mb-4 border rounded-2xl overflow-hidden transition-all cursor-pointer bg-white/[0.02] ${isOpen ? 'border-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/10 hover:border-white/30'}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-5 flex justify-between items-center gap-4">
        <h4 className="text-white font-bold text-base md:text-lg">{faq.q}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
          <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-primary-light' : 'text-white/50'}`} />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-5 pt-0 text-text-muted leading-relaxed font-medium">
              <div className="w-full h-px bg-white/5 mb-5"></div>
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalUsers: '24',
    totalExams: '490',
    avgSuccess: '%37',
    rating: '4.9'
  });
  const [faqList, setFaqList] = useState(FALLBACK_FAQS);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats/public-overview');
        if (res.data) {
          const formatNumber = (num) => num >= 1000 ? (num/1000).toFixed(1).replace('.0','') + 'K+' : num;
          setStats({
            totalUsers: formatNumber(res.data.totalUsers),
            totalExams: formatNumber(res.data.totalQuestions) + '+',
            avgSuccess: '%' + (res.data.avgSuccessRate || 85),
            rating: '4.9'
          });
        }
      } catch (err) {
        console.error('İstatistikler alınamadı', err);
      }
    };

    const fetchFaqs = async () => {
      try {
        const res = await api.get('/faqs');
        if (res.data && res.data.length > 0) {
          setFaqList(res.data);
        }
      } catch (err) {
        console.error('S.S.S. alınamadı, fallback kullanılıyor.', err);
      }
    };

    fetchStats();
    fetchFaqs();
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden w-full font-sans text-white selection:bg-primary/30">
      {/* Dynamic Animated Grid Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
      
      {/* Floating Glowing Orbs */}
      <motion.div animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />
      <motion.div animate={{ y: [0, 40, 0], scale: [1, 1.2, 1] }} transition={{ duration: 15, repeat: Infinity, delay: 2 }} className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <motion.div animate={{ x: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 1 }} className="absolute bottom-[0%] left-[20%] w-[600px] h-[600px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Modern Navbar */}
      <nav className="relative z-50 px-4 py-4 max-w-7xl mx-auto top-4">
        <div className="flex justify-between items-center bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-3 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-500 p-0.5 shadow-lg shadow-primary/20 flex items-center justify-center">
              <img src="/logo.png" alt="Ehliyet Yolu" className="w-full h-full object-contain filter drop-shadow-md invert opacity-90" onError={(e) => e.target.style.display='none'} />
              {!document.querySelector('img[src="/logo.png"]')?.complete && <CarFront className="w-5 h-5 text-white" />}
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              Ehliyet<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-indigo-300">Yolu</span>
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <a href="#features" className="text-text-muted hover:text-white font-bold transition-colors hidden md:block text-xs uppercase tracking-widest px-3">Özellikler</a>
            <a href="#faq" className="text-text-muted hover:text-white font-bold transition-colors hidden md:block text-xs uppercase tracking-widest px-3">S.S.S</a>
            <Link to="/login" className="text-white hover:text-primary-light font-bold transition-colors hidden sm:block text-sm px-3">Öğrenci Girişi</Link>
            <Link to="/register" className="bg-white hover:scale-105 transition-transform text-black py-2.5 px-6 rounded-2xl flex items-center gap-2 text-sm font-black shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Kayıt Ol <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Ultimate Animation Hero */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", duration: 0.8 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-warning/30 bg-warning/10 text-warning text-xs font-black tracking-widest uppercase mb-10 shadow-[0_0_15px_rgba(251,191,36,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-warning/0 via-warning/20 to-warning/0 -translate-x-full group-hover:animate-[shine_2s_infinite]"></div>
          <Star className="w-3.5 h-3.5" /> %100 Yeni MEB Müfredatı
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl lg:text-[6rem] leading-[1.05] font-black tracking-tighter mb-8 max-w-5xl">
          Eski Kitapları <span className="text-transparent bg-clip-text bg-gradient-to-br from-gray-400 to-gray-700 strike-through opacity-50 relative line-through decoration-red-500/50">Çöpe Atın.</span><br/>
          Sınavı <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-indigo-400 to-purple-400 relative">
            Tek Seferde
            <motion.svg className="absolute -bottom-2 left-0 w-full h-3 text-primary" viewBox="0 0 100 10" preserveAspectRatio="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 1 }}><path d="M0 5 Q 50 10 100 5" fill="transparent" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></motion.svg>
          </span> Geçin.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-lg md:text-2xl text-text-muted max-w-2xl mb-12 font-medium leading-relaxed">
          Zaman kaybetmeden, yapay zeka analizleriyle sadece eksiğin olan konulara odaklan. Hem eğlen, hem öğren, ehliyeti cebe indir.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/register" className="bg-primary hover:bg-primary-light text-white text-lg font-black tracking-wide py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_0_40px_rgba(99,102,241,0.5)] w-full sm:w-auto">
            Hemen Serüvene Başla <Zap className="w-5 h-5" />
          </Link>
          <a href="#app" className="bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-white/10 text-white text-lg font-black tracking-wide py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 w-full sm:w-auto">
            <Smartphone className="w-5 h-5" /> Uygulamayı İndir
          </a>
        </motion.div>

        {/* Realtime Stats Floating Dashboard Effect */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, type: "spring" }} className="mt-24 max-w-4xl w-full bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-colors duration-700"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">{stats.totalUsers}</span>
              <span className="text-xs uppercase tracking-widest font-bold text-text-muted mt-2">Güncel Öğrenci</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-primary-light to-primary/50">{stats.totalExams}</span>
              <span className="text-xs uppercase tracking-widest font-bold text-text-muted mt-2">Soru Havuzu</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-success to-success/50">{stats.avgSuccess}</span>
              <span className="text-xs uppercase tracking-widest font-bold text-text-muted mt-2">Başarı Ortalaması</span>
            </div>
             <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-warning to-warning/50">{stats.rating}</span>
              <span className="flex items-center gap-1 text-xs uppercase tracking-widest font-bold text-text-muted mt-2"><Star className="w-3 h-3 text-warning fill-warning" /> Mağaza Puanı</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Interactive Features */}
      <section id="features" className="relative z-10 py-32 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Sıkıcı Kursları Unutun</h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg md:text-xl font-medium">Bambaşka bir öğrenme deneyimi. Sen çalışırken sistem seni analiz eder, eksiklerini kapatır ve başarını oyunlaştırır.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {features.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-500">
                  <item.icon className="w-8 h-8 text-primary-light" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{item.title}</h3>
                <p className="text-text-muted text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-32 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Sıkça Sorulan Sorular</h2>
          <p className="text-text-muted text-lg md:text-xl font-medium">Kafanıza takılan tüm soruların cevapları burada.</p>
        </div>
        <div className="space-y-4">
          {faqList.map((faq, i) => (
            <FAQItem
              key={faq._id || i}
              faq={{ q: faq.question || faq.q, a: faq.answer || faq.a }}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* App Download CTA */}
      <section id="app" className="relative z-10 max-w-7xl mx-auto px-6 pb-40">
        <div className="glass-card rounded-[3rem] p-10 md:p-16 border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-black/40 to-indigo-900/20 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0"></div>
          
          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 border border-white/10 text-white font-bold text-xs uppercase tracking-widest mb-6">
              <Download className="w-4 h-4 text-primary-light" /> Mobil Uygulama
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">Cebindeki <br/>Ehliyet Hocası.</h2>
            <p className="text-text-muted text-lg md:text-xl mb-10 max-w-md mx-auto md:mx-0">
              Uygulamamızı hemen indir, otobüste veya yolda boş zamanlarını değerlendirerek sınava hazırlan.
            </p>
            <a href="https://play.google.com/store/apps/details?id=com.mach.ehliyetyolu" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-4 bg-white text-black hover:bg-gray-100 font-black py-4 px-10 rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] w-full sm:w-auto">
               <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.3414C17.523 15.3414 16.2731 16.0371 14.5097 17.0274L14.4925 17.037L10.5186 19.3087C10.5057 19.3164 10.4907 19.3245 10.4745 19.3332L8.68307 10.4714L17.5255 15.337L17.523 15.3414ZM5.28919 4.3168V19.3524C5.28919 19.98 5.66068 20.2526 6.07921 19.9928L8.14088 18.7056L10.0215 19.8778L8.14925 10.6121L5.30252 4.30907C5.29342 4.31174 5.28919 4.3168 5.28919 4.3168ZM18.788 14.6186L17.9622 14.1506L8.68307 9.04351L18.4239 13.9113L18.788 14.6186ZM18.788 14.6186C19.068 14.7766 19.2435 15.0456 19.2435 15.338C19.2435 15.6322 19.0655 15.8996 18.788 16.0592L18.4216 16.2694L17.9622 16.5332L17.523 16.784L14.5097 18.4984L10.3204 20.8906C9.91971 21.121 9.47953 20.916 9.47953 20.45L9.47164 20.4452L8.68307 16.5375L8.14088 13.8553L6.07921 12.5694C5.66068 12.3091 5.28919 12.5833 5.28919 13.2098V20.4503L5.30252 20.4566C5.32179 20.9174 5.76307 21.122 6.16075 20.8925L10.3541 18.5202L14.5428 16.1485L17.5562 14.4363L18.0163 14.1724L18.4746 13.9103C18.8783 13.6811 19.3241 13.8967 19.3241 14.3642C19.3241 14.4442 19.2982 14.5207 19.2536 14.5828L18.788 14.6186ZM5.9892 3.86438L8.68307 9.04351L17.9404 14.1378L18.4216 14.4024C18.8252 14.6315 19.2713 14.4161 19.2713 13.9482C19.2713 13.8687 19.2458 13.7925 19.2017 13.7314L18.788 13.6816L18.3303 13.4326L14.5097 11.3435L10.3204 9.04944L6.1264 6.7554M5.9892 3.86438C5.59011 3.63372 5.14816 3.83984 5.14816 4.30561V13.21C5.14816 13.8824 5.58987 14.1166 6.04652 13.8569L8.14088 12.656L10.3541 13.9216L14.5428 16.3117L18.0163 18.3075L18.4746 18.5683C18.8783 18.7975 19.3241 18.5819 19.3241 18.1144C19.3241 18.0343 19.2982 17.9578 19.2536 17.8958L18.788 17.86L17.9622 17.3912L8.68307 12.2858L5.9892 3.86438Z" />
               </svg>
               <div className="text-left leading-tight">
                 <span className="text-[10px] block font-bold uppercase tracking-wider opacity-60">Hemen İndir</span>
                 <span className="text-xl -mt-1 block font-black">Google Play</span>
               </div>
            </a>
          </div>

          <div className="relative w-64 h-[500px] bg-[#0c0c12] rounded-[3rem] border-8 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden hidden md:flex flex-col items-center justify-center pt-8 z-10 shrink-0 mx-auto">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-white/10 rounded-b-xl z-20"></div>
             <img src="/logo.png" alt="Ehliyet Yolu" className="w-16 h-16 object-contain mb-6 animate-pulse filter invert" />
             <h3 className="text-xl font-black mb-2 text-white">Ehliyet<span className="text-primary-light">Yolu</span></h3>
             <div className="flex flex-col gap-3 w-full px-6 mt-4">
               <div className="w-full h-12 bg-white/5 rounded-xl border border-white/5"></div>
               <div className="w-full h-24 bg-white/5 rounded-xl border border-white/5"></div>
               <div className="w-full h-24 bg-white/5 rounded-xl border border-white/5"></div>
             </div>
             <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-primary/40 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Clean Footer preserving Privacy routing */}
      <footer className="relative z-10 border-t border-white/5 py-16 text-center bg-[#030305]">
        <div className="flex flex-col items-center gap-6 max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 p-1.5 flex items-center justify-center">
                <img src="/logo.png" alt="Ehliyet Yolu" className="w-full h-full object-contain filter invert opacity-50" onError={(e) => e.target.style.display='none'} />
            </div>
            <span className="font-black text-white/40 tracking-widest uppercase text-lg">Ehliyet Yolu</span>
          </div>
          <div className="flex items-center flex-wrap justify-center gap-6 text-[11px] font-black uppercase tracking-widest text-text-muted/60">
            <Link to="/policy" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
            <span className="opacity-20">•</span>
            <Link to="/policy" className="hover:text-white transition-colors">KVKK Sözleşmesi</Link>
            <span className="opacity-20">•</span>
            <Link to="/policy" className="hover:text-white transition-colors">Kullanıcı Şartları</Link>
            <span className="opacity-20">•</span>
            <Link to="/contact" className="hover:text-white transition-colors">İletişim</Link>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-30 mt-4">© 2026 EhliyetYolu Eğitim Altyapısı. Tüm Hakları Saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
