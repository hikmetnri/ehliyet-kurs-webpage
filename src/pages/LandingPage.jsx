import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  CarFront, Target, Trophy, CheckCircle2, ChevronRight, 
  Brain, Zap, Sparkles, Smartphone, Download, ChevronDown, 
  Star, ShieldCheck, Map, PlayCircle, BarChart3, Clock, 
  Users, Award, ArrowRight, Quote, Check, BookOpen, User
} from 'lucide-react';
import api from '../api';

const FALLBACK_FAQS = [
  { _id: '1', question: "Ehliyet sınavına hazırlık için bu sistem yeterli mi?", answer: "Kesinlikle! MEB'in güncel 2026 müfredatına %100 uyumlu, daha önce çıkmış ve çıkma ihtimali yüksek sorulardan oluşan yapay zeka destekli havuzumuz tek başına yeterlidir." },
  { _id: '2', question: "Animasyonlu sorular müfredata uygun mu?", answer: "Evet, MEB'in yeni nesil e-sınav sisteminde yer alan tüm animasyonlu ve videolu soru tiplerini sistemimizde birebir simüle ediyoruz." },
  { _id: '3', question: "Uygulamayı indirmek ücretli mi?", answer: "Uygulamamızı indirmek ve temel testleri çözmek tamamen ücretsizdir. Daha kapsamlı analizler ve premium özellikler için opsiyonel PRO paketlerimiz bulunur." },
  { _id: '4', question: "Kişiselleştirilmiş analiz tam olarak nedir?", answer: "Çözdüğünüz her test sistemimiz tarafından analiz edilir. Yapay zeka, hata yaptığınız veya yavaş kaldığınız konuları tespit ederek karşınıza bu zayıflıkları giderecek özel testler çıkarır." },
  { _id: '5', question: "Testler gerçek sınav formatında mı?", answer: "Birebir aynı! Elektronik sınav (e-sınav) merkezlerinde karşılaşacağınız arayüzün aynısını simüle ediyoruz, böylece sınav günü hiçbir yabancılık çekmezsiniz." },
  { _id: '6', question: "İnternetsiz kullanabilir miyim?", answer: "Mobil uygulamamız üzerinden favoriye aldığınız soruları ve daha önce indirdiğiniz konu anlatımlarını çevrimdışı (internetsiz) olarak da çalışabilirsiniz." }
];

const features = [
  { icon: Brain, color: "from-blue-500 to-cyan-400", title: "Yapay Zeka Destekli Analiz", desc: "Zayıf noktalarını bul, sadece ihtiyacın olanı çalış. Akıllı algoritmamızla zaman kazan ve netlerini hızla artır." },
  { icon: Target, color: "from-indigo-500 to-purple-500", title: "Birebir MEB Simülasyonu", desc: "Gerçek e-sınav arayüzünün birebir kopyası ile sınav stresi yaşamadan pratik yap. Sürprizlere yer yok." },
  { icon: PlayCircle, color: "from-rose-500 to-orange-400", title: "Yeni Nesil Animasyonlu Sorular", desc: "MEB'in yeni müfredatındaki videolu ve hareketli sorulara tam uyumlu, en güncel soru havuzu." },
  { icon: Sparkles, color: "from-amber-400 to-yellow-500", title: "Oyunlaştırma (Gamification)", desc: "Günlük hedefler, rozetler ve Türkiye geneli liderlik tablosu ile çalışmayı sıkıcı bir görevden eğlenceye çevir." },
  { icon: Map, color: "from-emerald-400 to-teal-500", title: "Görsel ve 3D Anlatımlar", desc: "Sıkıcı uzun metinler yok. Tüm karmaşık trafik kurallarını, motor parçalarını ve ilkyardım adımlarını görsel haritalarla öğren." },
  { icon: BarChart3, color: "from-fuchsia-500 to-pink-500", title: "Detaylı Performans Raporları", desc: "Gelişimini anlık takip et. Hangi konuda ne kadar başarılı olduğunu görerek çalışma stratejini optimize et." }
];

const steps = [
  { num: "01", title: "Hedefini Belirle", desc: "Sınav tarihini ve hedeflediğin puanı girerek sana özel çalışma planını oluştur." },
  { num: "02", title: "Akıllı Testleri Çöz", desc: "Günde sadece 20 dakikanı ayırarak MEB uyumlu güncel soruları çöz." },
  { num: "03", title: "Eksiklerini Kapat", desc: "Yapay zeka analizleriyle zayıf olduğun konulara odaklan ve hızla geliş." },
  { num: "04", title: "Sınavı Geç!", desc: "Hazırlık seviyen %100'e ulaştığında gerçek sınava gir ve tek seferde kazan." }
];

const testimonials = [
  { name: "Ayşe Yılmaz", role: "Öğrenci", score: "96 Puan", text: "Daha önce iki kez kalmıştım. Bu platformdaki animasyonlu sorular ve yapay zeka analizleri sayesinde eksiklerimi gördüm ve 96 alarak geçtim!" },
  { name: "Mehmet K.", role: "Üniversite Öğrencisi", score: "100 Puan", text: "Otobüste, molalarda sadece mobilden çözdüm. Gerçek sınav arayüzünün aynısı olması sınav anındaki heyecanımı sıfıra indirdi. Harika!" },
  { name: "Elif Şahin", role: "Öğrenci", score: "92 Puan", text: "Sıkıcı kitaplardan çalışmak yerine oyunlaştırılmış sistemle rozet kazanarak çalışmak çok keyifliydi. Kesinlikle tavsiye ediyorum." }
];

const courseCategories = [
  { title: "Trafik ve Çevre", icon: Map, count: "850+ Soru", color: "text-blue-400", bg: "bg-blue-400/10" },
  { title: "İlk Yardım", icon: ShieldCheck, count: "400+ Soru", color: "text-red-400", bg: "bg-red-400/10" },
  { title: "Motor ve Araç", icon: CarFront, count: "550+ Soru", color: "text-amber-400", bg: "bg-amber-400/10" },
  { title: "Trafik Adabı", icon: Users, count: "200+ Soru", color: "text-emerald-400", bg: "bg-emerald-400/10" }
];

const badges = [
  { name: "Hızlı Sürücü", icon: Zap, color: "text-yellow-400" },
  { name: "Hatasız Haftalık", icon: CheckCircle2, color: "text-green-400" },
  { name: "Bilgi Kurdu", icon: Brain, color: "text-purple-400" },
  { name: "Sınav Şampiyonu", icon: Trophy, color: "text-orange-400" }
];

const FAQItem = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
      className={`mb-4 border rounded-2xl overflow-hidden transition-all cursor-pointer backdrop-blur-sm ${isOpen ? 'bg-primary/5 border-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04]'}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-5 md:p-6 flex justify-between items-center gap-4">
        <h4 className={`font-bold text-base md:text-lg transition-colors ${isOpen ? 'text-white' : 'text-white/90'}`}>{faq.q}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-primary/20 text-primary-light' : 'bg-white/5 text-white/50'}`}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-5 md:p-6 pt-0 text-text-muted leading-relaxed font-medium text-base">
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
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  const [stats, setStats] = useState({
    totalUsers: '5K+',
    totalExams: '15K+',
    avgSuccess: '%92',
    rating: '4.9'
  });
  const [faqList, setFaqList] = useState(FALLBACK_FAQS);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats/public-overview');
        if (res.data) {
          const formatNumber = (num) => num >= 1000 ? (num/1000).toFixed(1).replace('.0','') + 'K+' : num + '+';
          setStats({
            totalUsers: formatNumber(res.data.totalUsers || 5240),
            totalExams: formatNumber(res.data.totalQuestions || 15000),
            avgSuccess: '%' + (res.data.avgSuccessRate || 92),
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
    <div className="min-h-screen bg-[#050508] relative w-full font-sans text-white selection:bg-primary/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none mix-blend-overlay z-50"></div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
      
      {/* Dynamic Glows */}
      <motion.div style={{ y: y1 }} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />
      <motion.div style={{ y: y2 }} className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[60%] left-[20%] w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Modern, Sticky Navbar */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className={`flex justify-between items-center transition-all duration-500 rounded-2xl sm:rounded-[2.5rem] ${scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-2 sm:p-3 pl-4 sm:pl-6' : 'bg-transparent border-transparent p-3 sm:p-4 pl-4 sm:pl-6'}`}>
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-200 shadow-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                <img src="/logo.png" alt="Ehliyet Yolu Logo" className="w-full h-full object-contain scale-[1.3]" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                <CarFront className="w-6 h-6 sm:w-8 sm:h-8 text-primary hidden" />
              </div>
              <span className="text-xl sm:text-3xl font-black tracking-tighter text-white">
                Ehliyet<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-cyan-300">Yolu</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10 bg-white/[0.03] border border-white/5 rounded-full px-10 py-4 backdrop-blur-md">
              <a href="#features" className="text-base font-bold text-white/70 hover:text-white transition-colors">Özellikler</a>
              <a href="#categories" className="text-base font-bold text-white/70 hover:text-white transition-colors">Kategoriler</a>
              <a href="#how-it-works" className="text-base font-bold text-white/70 hover:text-white transition-colors">Nasıl Çalışır?</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 sm:gap-6 pr-1 sm:pr-0">
              <Link to="/login" className="text-sm sm:text-base font-bold text-white/80 hover:text-white transition-colors px-3 sm:px-6 py-2 sm:py-3">Giriş</Link>
              <Link to="/register" className="bg-white hover:bg-gray-100 text-black py-2.5 sm:py-4 px-4 sm:px-10 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 text-xs sm:text-base font-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]">
                Kayıt Ol <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 hidden xs:block" />
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Ultimate Animation Hero */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center text-center">
        
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", duration: 0.8 }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/10 text-primary-light text-xs sm:text-sm font-black tracking-widest uppercase mb-8 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:animate-[shine_2s_infinite]"></div>
          <Sparkles className="w-4 h-4" /> 2026 MEB Müfredatına %100 Uyumlu
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[1.1] font-black tracking-tighter mb-8 max-w-5xl">
          Eski Kitapları <span className="text-transparent bg-clip-text bg-gradient-to-br from-gray-400 to-gray-600 relative inline-block">
            Çöpe Atın
            <span className="absolute top-1/2 left-0 w-full h-1.5 sm:h-2 bg-red-500/80 -translate-y-1/2 -rotate-2 rounded-full"></span>
          </span><br className="hidden sm:block" />
          Sınavı <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-indigo-400 to-cyan-400 relative inline-block">
            Tek Seferde
            <motion.svg className="absolute -bottom-1 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-primary" viewBox="0 0 100 10" preserveAspectRatio="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 1 }}><path d="M0 5 Q 50 10 100 5" fill="transparent" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /></motion.svg>
          </span> Geçin.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-2xl text-text-muted max-w-3xl mb-12 font-medium leading-relaxed">
          Türkiye'nin en gelişmiş, yapay zeka destekli ehliyet sınavı hazırlık platformu. Zaman kaybetme, eksiklerini gör, sınava %100 hazır gir.
        </motion.p>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
          <Link to="/register" className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-light hover:to-indigo-500 text-white text-lg font-black tracking-wide py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_0_40px_rgba(99,102,241,0.5)] w-full sm:w-auto group border border-white/10">
            Hemen Serüvene Başla <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#app" className="bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-lg font-black tracking-wide py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 w-full sm:w-auto">
            <Smartphone className="w-5 h-5" /> Uygulamayı İndir
          </a>
        </motion.div>

        {/* Stats Strip */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, type: "spring" }} className="mt-20 lg:mt-32 w-full max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-colors duration-700"></div>
            
            <div className="flex flex-col items-center p-4">
              <span className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2">{stats.totalUsers}</span>
              <span className="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest text-center">Aktif Öğrenci</span>
            </div>
            <div className="flex flex-col items-center p-4 border-l border-white/5">
              <span className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2">{stats.totalExams}</span>
              <span className="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest text-center">Soru Havuzu</span>
            </div>
            <div className="flex flex-col items-center p-4 md:border-l border-white/5">
              <span className="text-4xl md:text-5xl lg:text-6xl font-black text-success mb-2">{stats.avgSuccess}</span>
              <span className="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest text-center">Başarı Oranı</span>
            </div>
             <div className="flex flex-col items-center p-4 border-l border-white/5">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-4xl md:text-5xl lg:text-6xl font-black text-warning">{stats.rating}</span>
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-warning fill-warning" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest text-center">Mağaza Puanı</span>
            </div>
          </div>
          
          {/* Trust Bar */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-bold tracking-tighter text-xl"><ShieldCheck className="w-6 h-6" /> MEB ONAYLI MÜFREDAT</div>
            <div className="flex items-center gap-2 font-bold tracking-tighter text-xl"><Award className="w-6 h-6" /> EN İYİ EĞİTİM ÖDÜLÜ</div>
            <div className="flex items-center gap-2 font-bold tracking-tighter text-xl"><CheckCircle2 className="w-6 h-6" /> %100 GÜVENLİ</div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 lg:py-32 bg-[#030305] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-sm font-black text-primary-light uppercase tracking-widest mb-3">Neden Biz?</h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white">Sıradan Kursları Unutun</h3>
            <p className="text-text-muted max-w-2xl mx-auto text-lg md:text-xl font-medium">Öğrenmeyi sıkıcı bir zorunluluk olmaktan çıkarıyoruz. Sen sadece çalış, sistem seni analiz edip başarıya ulaştırsın.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5, delay: i * 0.1 }} 
                className="group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-full relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-500 rounded-full`}></div>
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} p-[1px] mb-8 inline-block shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <div className="w-full h-full bg-[#101017] rounded-2xl flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-black text-white mb-4 tracking-tight">{item.title}</h4>
                <p className="text-text-muted text-lg leading-relaxed flex-grow">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section id="categories" className="relative z-10 py-24 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-3">Eğitim İçeriği</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">Her Konuda Tam Hazırlık.</h3>
            </div>
            <Link to="/register" className="group flex items-center gap-3 text-white font-bold hover:text-amber-400 transition-colors">
              Tüm Soruları İncele <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courseCategories.map((cat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.05] transition-all group"
              >
                <div className={`w-14 h-14 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{cat.title}</h4>
                <p className="text-text-muted font-medium mb-4">{cat.count}</p>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }} className={`h-full ${cat.bg.replace('/10', '')}`}></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (Steps) */}
      <section id="how-it-works" className="relative z-10 py-24 lg:py-32 bg-[#030305] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <h2 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-3">Sistem Nasıl Çalışır?</h2>
              <h3 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-white leading-tight">Başarıya Giden 4 Basit Adım.</h3>
              <p className="text-text-muted text-lg mb-12">Karmaşık süreçlere ve ne yapacağını bilmeden geçirilen saatlere son. Sana özel çizilen yol haritası ile adım adım ehliyetine ulaş.</p>
              
              <div className="space-y-8">
                {steps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl text-white/50 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition-all duration-300">
                        {step.num}
                      </div>
                      {i !== steps.length - 1 && <div className="w-px h-full bg-white/10 mt-4 group-hover:bg-cyan-500/30 transition-colors"></div>}
                    </div>
                    <div className="pb-8">
                      <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{step.title}</h4>
                      <p className="text-text-muted text-lg leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-primary/20 blur-[100px] rounded-full"></div>
              <div className="relative rounded-[3rem] border border-white/10 bg-[#0a0a0f] shadow-2xl p-4 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-cyan-400"></div>
                <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200&h=1600" alt="App Dashboard Mockup" className="rounded-[2.5rem] w-full h-auto opacity-80" />
                
                {/* Floating Elements */}
                <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-10 top-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center"><Check className="w-6 h-6 text-success" /></div>
                  <div>
                    <div className="text-sm font-bold text-white">Deneme Sınavı</div>
                    <div className="text-xs text-text-muted">96 Puan - Başarılı</div>
                  </div>
                </motion.div>
                
                <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-8 bottom-32 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center"><Trophy className="w-6 h-6 text-warning" /></div>
                  <div>
                    <div className="text-sm font-bold text-white">Yeni Rozet!</div>
                    <div className="text-xs text-warning">Hız Şampiyonu</div>
                  </div>
                </motion.div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Badge Showcase */}
      <section className="relative z-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
            
            <h3 className="text-3xl md:text-4xl font-black text-white mb-6">Rozetleri Topla, Lider Ol!</h3>
            <p className="text-text-muted text-lg max-w-2xl mx-auto mb-12">Çalıştıkça rozet kazan, seviye atla ve Türkiye genelindeki diğer öğrencilerle rekabet et.</p>
            
            <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
              {badges.map((badge, i) => (
                <motion.div key={i} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", delay: i * 0.1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${badge.color} shadow-lg shadow-black/40 group hover:scale-110 transition-transform duration-300 relative`}>
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <badge.icon className="w-10 h-10 lg:w-14 lg:h-14 relative z-10" />
                  </div>
                  <span className="font-bold text-white/70 text-sm lg:text-base">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 lg:py-32 bg-[#030305] border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-sm font-black text-success uppercase tracking-widest mb-3">Başarı Hikayeleri</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white">Binlerce Mutlu Sürücü</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] relative">
                <Quote className="absolute top-6 right-6 w-12 h-12 text-white/5" />
                <div className="flex gap-1 text-warning mb-6">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="w-5 h-5 fill-warning" />)}
                </div>
                <p className="text-text-muted text-lg mb-8 leading-relaxed relative z-10">"{item.text}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-white">{item.name}</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">{item.role}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span className="text-xs font-bold text-success">{item.score}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 lg:py-32 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black text-primary-light uppercase tracking-widest mb-3">S.S.S</h2>
          <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Merak Edilenler</h3>
          <p className="text-text-muted text-lg font-medium">Aklınıza takılan soruların cevaplarını burada bulabilirsiniz.</p>
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

      {/* Ultimate App Download CTA */}
      <section id="app" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-40">
        <div className="rounded-[3rem] p-10 sm:p-16 border border-white/10 bg-gradient-to-br from-[#101017] via-primary/10 to-[#0a0a0f] text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-16 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay z-0"></div>
          
          <div className="flex-1 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest mb-8">
              <Download className="w-4 h-4 text-primary-light" /> Mobil Uygulama
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[1.1]">
              Cebindeki <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-cyan-400">Ehliyet Hocası.</span>
            </h2>
            <p className="text-text-muted text-xl mb-12 max-w-md mx-auto lg:mx-0 leading-relaxed">
              İnternetsiz mod, özel deneme sınavları ve anlık bildirimler için mobil uygulamamızı hemen indir.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <a href="https://play.google.com/store/apps/details?id=com.mach.ehliyetyolu" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-4 bg-white text-black font-black py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.15)] w-full sm:w-auto border border-transparent">
                 <svg className="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414C17.523 15.3414 16.2731 16.0371 14.5097 17.0274L14.4925 17.037L10.5186 19.3087C10.5057 19.3164 10.4907 19.3245 10.4745 19.3332L8.68307 10.4714L17.5255 15.337L17.523 15.3414ZM5.28919 4.3168V19.3524C5.28919 19.98 5.66068 20.2526 6.07921 19.9928L8.14088 18.7056L10.0215 19.8778L8.14925 10.6121L5.30252 4.30907C5.29342 4.31174 5.28919 4.3168 5.28919 4.3168ZM18.788 14.6186L17.9622 14.1506L8.68307 9.04351L18.4239 13.9113L18.788 14.6186ZM18.788 14.6186C19.068 14.7766 19.2435 15.0456 19.2435 15.338C19.2435 15.6322 19.0655 15.8996 18.788 16.0592L18.4216 16.2694L17.9622 16.5332L17.523 16.784L14.5097 18.4984L10.3204 20.8906C9.91971 21.121 9.47953 20.916 9.47953 20.45L9.47164 20.4452L8.68307 16.5375L8.14088 13.8553L6.07921 12.5694C5.66068 12.3091 5.28919 12.5833 5.28919 13.2098V20.4503L5.30252 20.4566C5.32179 20.9174 5.76307 21.122 6.16075 20.8925L10.3541 18.5202L14.5428 16.1485L17.5562 14.4363L18.0163 14.1724L18.4746 13.9103C18.8783 13.6811 19.3241 13.8967 19.3241 14.3642C19.3241 14.4442 19.2982 14.5207 19.2536 14.5828L18.788 14.6186ZM5.9892 3.86438L8.68307 9.04351L17.9404 14.1378L18.4216 14.4024C18.8252 14.6315 19.2713 14.4161 19.2713 13.9482C19.2713 13.8687 19.2458 13.7925 19.2017 13.7314L18.788 13.6816L18.3303 13.4326L14.5097 11.3435L10.3204 9.04944L6.1264 6.7554M5.9892 3.86438C5.59011 3.63372 5.14816 3.83984 5.14816 4.30561V13.21C5.14816 13.8824 5.58987 14.1166 6.04652 13.8569L8.14088 12.656L10.3541 13.9216L14.5428 16.3117L18.0163 18.3075L18.4746 18.5683C18.8783 18.7975 19.3241 18.5819 19.3241 18.1144C19.3241 18.0343 19.2982 17.9578 19.2536 17.8958L18.788 17.86L17.9622 17.3912L8.68307 12.2858L5.9892 3.86438Z" />
                 </svg>
                 <div className="text-left leading-tight">
                   <span className="text-[10px] block font-bold uppercase tracking-wider opacity-60">Hemen İndir</span>
                   <span className="text-xl -mt-1 block font-black">Google Play</span>
                 </div>
              </a>
              <a href="#" className="group inline-flex items-center justify-center gap-4 bg-white/5 border border-white/10 text-white font-black py-4 px-8 rounded-2xl transition-all duration-300 hover:bg-white/10 w-full sm:w-auto">
                 <svg className="w-8 h-8 opacity-50" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.84 1.56.03 2.89.69 3.67 1.84-3.2 1.83-2.67 5.75.39 7.02-.75 1.76-1.57 3.25-2.64 4.15zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                 </svg>
                 <div className="text-left leading-tight opacity-50">
                   <span className="text-[10px] block font-bold uppercase tracking-wider">Çok Yakında</span>
                   <span className="text-xl -mt-1 block font-black">App Store</span>
                 </div>
              </a>
            </div>
          </div>

          <div className="relative w-72 h-[550px] bg-[#0c0c12] rounded-[3.5rem] border-[10px] border-[#1f2029] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden hidden lg:flex flex-col items-center justify-center z-10 shrink-0 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1f2029] rounded-b-2xl z-20"></div>
             
             {/* Mockup Screen Inside */}
             <div className="w-full h-full bg-[#050508] p-5 pt-12 relative flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-white/50 text-xs font-bold mb-1">Hoş Geldin 👋</div>
                    <div className="text-white font-black">Ayşe Yılmaz</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-200 shadow-lg flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" className="w-full h-full object-contain scale-[1.3]" alt="Logo" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-5 mb-6 text-white relative overflow-hidden shadow-lg shadow-primary/20">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                  <div className="text-white/80 text-xs font-bold mb-1">Sıradaki Görev</div>
                  <div className="text-xl font-black mb-4">Motor Dersleri - Test 3</div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">%45 Tamamlandı</span>
                    <button className="bg-white text-primary text-xs font-black py-2 px-4 rounded-xl">Devam Et</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mb-2"><Trophy className="w-5 h-5 text-success" /></div>
                    <div className="text-white font-black text-xl">12</div>
                    <div className="text-white/50 text-xs font-bold">Kazanılan Rozet</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2"><Target className="w-5 h-5 text-cyan-400" /></div>
                    <div className="text-white font-black text-xl">%94</div>
                    <div className="text-white/50 text-xs font-bold">Sınav Hazırlığı</div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"><PlayCircle className="w-6 h-6 text-primary-light" /></div>
                  <div>
                    <div className="text-white font-bold text-sm">Günün Denemesi</div>
                    <div className="text-white/50 text-xs">50 Soru • 45 Dakika</div>
                  </div>
                </div>

                {/* Bottom Nav Bar Fake */}
                <div className="absolute bottom-0 left-0 w-full h-20 bg-[#0a0a0f]/90 backdrop-blur-md border-t border-white/10 flex justify-around items-center px-6">
                  <div className="w-10 h-10 flex items-center justify-center text-primary"><Map className="w-6 h-6" /></div>
                  <div className="w-10 h-10 flex items-center justify-center text-white/30"><BookOpen className="w-6 h-6" /></div>
                  <div className="w-10 h-10 flex items-center justify-center text-white/30"><User className="w-6 h-6" /></div>
                </div>
             </div>
             <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#1f2029]/80 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Clean Footer preserving Privacy routing */}
      <footer className="relative z-10 border-t border-white/10 pt-20 pb-10 bg-[#030305]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Ehliyet Yolu" className="w-full h-full object-contain scale-[1.3]" onError={(e) => { e.target.style.display='none'; }} />
                </div>
                <span className="font-black text-white text-2xl tracking-tighter">Ehliyet<span className="text-primary-light">Yolu</span></span>
              </Link>
              <p className="text-text-muted text-sm leading-relaxed max-w-sm mb-6">
                Ehliyet sınavına hazırlıkta yeni nesil yapay zeka destekli eğitim platformu. Sınavı ilk seferde, stressiz ve kolayca geçmeniz için tasarlandı.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors text-white/50"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.084-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors text-white/50"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Hızlı Linkler</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-text-muted hover:text-white transition-colors text-sm">Özellikler</a></li>
                <li><a href="#how-it-works" className="text-text-muted hover:text-white transition-colors text-sm">Nasıl Çalışır?</a></li>
                <li><a href="#faq" className="text-text-muted hover:text-white transition-colors text-sm">S.S.S</a></li>
                <li><Link to="/login" className="text-text-muted hover:text-white transition-colors text-sm">Öğrenci Girişi</Link></li>
                <li><Link to="/register" className="text-text-muted hover:text-white transition-colors text-sm">Yeni Kayıt</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Yasal</h4>
              <ul className="space-y-3">
                <li><Link to="/policy" className="text-text-muted hover:text-white transition-colors text-sm">Gizlilik Politikası</Link></li>
                <li><Link to="/policy" className="text-text-muted hover:text-white transition-colors text-sm">KVKK Aydınlatma Metni</Link></li>
                <li><Link to="/policy" className="text-text-muted hover:text-white transition-colors text-sm">Kullanıcı Sözleşmesi</Link></li>
                <li><Link to="/policy" className="text-text-muted hover:text-white transition-colors text-sm">Çerez Politikası</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted/60">© 2026 EhliyetYolu Eğitim Altyapısı. Tüm Hakları Saklıdır.</p>
            <div className="flex items-center gap-2 text-text-muted/60 text-xs font-bold uppercase tracking-widest">
              Made with <Star className="w-3 h-3 text-red-500 fill-red-500" /> in Türkiye
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
