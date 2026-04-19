import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CarFront, Target, Trophy, CheckCircle2, ChevronRight, BookOpen, ShieldCheck, Zap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="glass-card p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
      <Icon className="text-primary w-7 h-7" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-text-primary">{title}</h3>
    <p className="text-text-secondary leading-relaxed">{description}</p>
  </motion.div>
);

const StatItem = ({ value, label, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="text-center p-6"
  >
    <div className="text-5xl md:text-6xl font-black gradient-text mb-3 tracking-tight">{value}</div>
    <div className="text-text-muted font-bold uppercase tracking-widest text-sm">{label}</div>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#07070a] relative overflow-hidden w-full m-0 p-0 selection:bg-primary/30 text-white font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-10"></div>
      
      <motion.div 
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1], rotate: [0, 5, 0] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 30, 0], scale: [1, 1.1, 1], rotate: [0, -5, 0] }} 
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[30%] -right-[15%] w-[800px] h-[800px] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, -40, 0], scale: [1, 1.2, 1] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] bg-accent/10 blur-[150px] rounded-full pointer-events-none"
      />

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto top-4 rounded-3xl bg-black/20 backdrop-blur-3xl border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-primary/20">
            <img src="/logo.png" alt="Ehliyet Yolu Logo" className="w-full h-full object-contain filter drop-shadow-md invert opacity-90" onError={(e) => e.target.style.display='none'} />
            {!document.querySelector('img[src="/logo.png"]')?.complete && <CarFront className="w-5 h-5 text-white" />}
          </div>
          <span className="text-2xl font-black tracking-tight text-white hidden sm:block">
            Ehliyet<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-indigo-400">Yolu</span>
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <Link to="/policy" className="text-text-muted hover:text-white font-bold transition-colors hidden md:block text-xs uppercase tracking-widest px-2">
            Gizlilik Politikası
          </Link>
          <Link to="/login" className="text-white hover:text-primary-light font-bold transition-colors hidden sm:block text-sm px-2">
            Öğrenci Girişi
          </Link>
          <Link to="/login" className="relative group overflow-hidden bg-white text-black py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm font-black transition-all hover:scale-105 shadow-xl shadow-white/10">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite]"></span>
            <span className="relative z-10">Kayıt Ol</span> 
            <ChevronRight className="w-4 h-4 relative z-10" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 pt-32 pb-40 flex flex-col items-center text-center">
        
        {/* Floating UI Badges */}
        <motion.div 
          animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute hidden lg:flex top-40 left-[10%] bg-black/40 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl items-center gap-3 z-30 transform -rotate-6"
        >
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-success" /></div>
          <div className="text-left"><p className="text-[10px] font-black uppercase text-text-muted tracking-widest leading-none mb-1">Sınav Sonucu</p><p className="text-white font-black text-lg leading-none">96 Puan - Geçtin!</p></div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute hidden lg:flex bottom-40 right-[10%] bg-black/40 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl items-center gap-3 z-30 transform rotate-3"
        >
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center"><Trophy className="w-5 h-5 text-warning" /></div>
          <div className="text-left"><p className="text-[10px] font-black uppercase text-text-muted tracking-widest leading-none mb-1">Yeni Rozet</p><p className="text-white font-black text-lg leading-none">Motor Ustası</p></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-white text-xs font-black tracking-widest uppercase mb-10 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:animate-[shine_2s_infinite]"></div>
          <span className="relative z-10 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> YAPAY ZEKA DESTEKLİ HAZIRLIK</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-[6.5rem] leading-[1.05] font-black tracking-tighter mb-8 max-w-5xl"
        >
          Ehliyeti <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-indigo-400 to-purple-400">Tek Seferde</span>
          <br />Garantile.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-2xl text-text-muted max-w-3xl mb-14 leading-relaxed font-medium"
        >
          Klasik kitaplardan kurtul. Akıllı tekrar sistemi, gerçekçi e-sınav simülasyonları ve sana özel çalışma programıyla sadece ihtiyacın olana odaklan.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link to="/login" className="bg-primary hover:bg-primary-light text-white text-lg font-black tracking-wide py-5 px-10 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-[0_0_30px_rgba(99,102,241,0.4)] w-full sm:w-auto">
            Hemen Çalışmaya Başla <ChevronRight className="w-5 h-5" />
          </Link>
          <a href="#download-app" className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white text-lg font-black tracking-wide py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 w-full sm:w-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414C17.523 15.3414 16.2731 16.0371 14.5097 17.0274L14.4925 17.037L10.5186 19.3087C10.5057 19.3164 10.4907 19.3245 10.4745 19.3332L8.68307 10.4714L17.5255 15.337L17.523 15.3414ZM5.28919 4.3168V19.3524C5.28919 19.98 5.66068 20.2526 6.07921 19.9928L8.14088 18.7056L10.0215 19.8778L8.14925 10.6121L5.30252 4.30907C5.29342 4.31174 5.28919 4.3168 5.28919 4.3168ZM18.788 14.6186L17.9622 14.1506L8.68307 9.04351L18.4239 13.9113L18.788 14.6186ZM18.788 14.6186C19.068 14.7766 19.2435 15.0456 19.2435 15.338C19.2435 15.6322 19.0655 15.8996 18.788 16.0592L18.4216 16.2694L17.9622 16.5332L17.523 16.784L14.5097 18.4984L10.3204 20.8906C9.91971 21.121 9.47953 20.916 9.47953 20.45L9.47164 20.4452L8.68307 16.5375L8.14088 13.8553L6.07921 12.5694C5.66068 12.3091 5.28919 12.5833 5.28919 13.2098V20.4503L5.30252 20.4566C5.32179 20.9174 5.76307 21.122 6.16075 20.8925L10.3541 18.5202L14.5428 16.1485L17.5562 14.4363L18.0163 14.1724L18.4746 13.9103C18.8783 13.6811 19.3241 13.8967 19.3241 14.3642C19.3241 14.4442 19.2982 14.5207 19.2536 14.5828L18.788 14.6186ZM5.9892 3.86438L8.68307 9.04351L17.9404 14.1378L18.4216 14.4024C18.8252 14.6315 19.2713 14.4161 19.2713 13.9482C19.2713 13.8687 19.2458 13.7925 19.2017 13.7314L18.788 13.6816L18.3303 13.4326L14.5097 11.3435L10.3204 9.04944L6.1264 6.7554M5.9892 3.86438C5.59011 3.63372 5.14816 3.83984 5.14816 4.30561V13.21C5.14816 13.8824 5.58987 14.1166 6.04652 13.8569L8.14088 12.656L10.3541 13.9216L14.5428 16.3117L18.0163 18.3075L18.4746 18.5683C18.8783 18.7975 19.3241 18.5819 19.3241 18.1144C19.3241 18.0343 19.2982 17.9578 19.2536 17.8958L18.788 17.86L17.9622 17.3912L8.68307 12.2858L5.9892 3.86438Z" /></svg>
            Uygulamayı İndir
          </a>
        </motion.div>
      </main>

      {/* Stats Section */}
      <section className="relative z-10 border-y border-white/5 bg-black/40 backdrop-blur-xl py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-4 divide-x divide-white/5">
          <StatItem value="10B+" label="Aktif Öğrenci" delay={0.1} />
          <StatItem value="500+" label="Güncel Soru" delay={0.2} />
          <StatItem value="%98" label="Başarı Oranı" delay={0.3} />
          <StatItem value="4.9" label="Kullanıcı Puanı" delay={0.4} />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-20 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">Seni Sınavda <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent-light">Uçuracak</span> Güçler</h2>
          <p className="text-text-muted max-w-2xl mx-auto text-xl font-medium">Sıkıcı kitapları unutun. Öğrenme sürecini interaktif, yapay zeka destekli bir dijital deneyime dönüştürdük.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Target}
            title="Kişiselleştirilmiş Yapay Zeka"
            description="Motor veya İlkyardım... Hangi konuda eksiğin varsa sistem seni oradan güçlendirir, boşuna zaman kaybetmezsin."
            delay={0.1}
          />
          <FeatureCard 
            icon={CheckCircle2}
            title="Gerçek Sınav Simülatörü"
            description="Birebir MEB elektronik sınav arayüzü. Sınav merkezine gittiğinde ekrana yabancılık çekmeyeceksin."
            delay={0.2}
          />
          <FeatureCard 
            icon={Trophy}
            title="Gamification & Rozetler"
            description="Günlük hedefleri tamamlayıp puanlar kazan, liderlik tablosunda üst sıralara tırman ve öğrenmeyi oyuna çevir."
            delay={0.3}
          />
          <FeatureCard 
            icon={BookOpen}
            title="Etkileşimli Konu Anlatımı"
            description="Uzun uzun okumak yok! Kısa, net, görsel ve animasyonlarla desteklenmiş yüksek kaliteli 3D anlatımlar."
            delay={0.4}
          />
          <FeatureCard 
            icon={ShieldCheck}
            title="MEB 2026 Uyumlu"
            description="Eski formattaki hiçbir soru havuzumuzda yok. Her ay yenilenen müfredata %100 güncel testler."
            delay={0.5}
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-br from-primary/10 to-indigo-600/10 backdrop-blur-md p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-center group border border-primary/20 hover:border-primary/50 transition-all hover:-translate-y-2"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <h3 className="text-3xl font-black mb-6 relative z-10 text-white">PRO Sınıfına Geç</h3>
             <Link to="/register" className="bg-primary hover:bg-primary-light text-white font-black px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl shadow-primary/20 w-full z-10">
               Ücretsiz Başla <ChevronRight className="w-5 h-5" />
             </Link>
           </motion.div>
        </div>
      </section>

      {/* Android Download Section */}
      <section id="download-app" className="relative z-10 py-24 mb-10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="glass-card border border-accent/30 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-br from-primary/10 to-accent/10">
            
            {/* Animated Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/20 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="flex-1 relative z-10 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-light font-bold text-sm mb-6 border border-accent/20">
                  🚀 Şimdi Play Store'da
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Akıllı Telefonunuzdan<br/>Sınava Hazırlanın</h2>
                <p className="text-text-secondary text-xl mb-8 max-w-lg mx-auto md:mx-0">
                  Yoldayken, otobüste veya okulda boş vakitlerinizi değerlendirin. Ehliyet Yolu mobil uygulaması ile başarı hep yanınızda.
                </p>
                <a href="https://play.google.com/store/apps/details?id=com.ehliyetyolu.app&hl=tr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414C17.523 15.3414 16.2731 16.0371 14.5097 17.0274L14.4925 17.037L10.5186 19.3087C10.5057 19.3164 10.4907 19.3245 10.4745 19.3332L8.68307 10.4714L17.5255 15.337L17.523 15.3414ZM5.28919 4.3168V19.3524C5.28919 19.98 5.66068 20.2526 6.07921 19.9928L8.14088 18.7056L10.0215 19.8778L8.14925 10.6121L5.30252 4.30907C5.29342 4.31174 5.28919 4.3168 5.28919 4.3168ZM18.788 14.6186L17.9622 14.1506L8.68307 9.04351L18.4239 13.9113L18.788 14.6186ZM18.788 14.6186C19.068 14.7766 19.2435 15.0456 19.2435 15.338C19.2435 15.6322 19.0655 15.8996 18.788 16.0592L18.4216 16.2694L17.9622 16.5332L17.523 16.784L14.5097 18.4984L10.3204 20.8906C9.91971 21.121 9.47953 20.916 9.47953 20.45L9.47164 20.4452L8.68307 16.5375L8.14088 13.8553L6.07921 12.5694C5.66068 12.3091 5.28919 12.5833 5.28919 13.2098V20.4503L5.30252 20.4566C5.32179 20.9174 5.76307 21.122 6.16075 20.8925L10.3541 18.5202L14.5428 16.1485L17.5562 14.4363L18.0163 14.1724L18.4746 13.9103C18.8783 13.6811 19.3241 13.8967 19.3241 14.3642C19.3241 14.4442 19.2982 14.5207 19.2536 14.5828L18.788 14.6186ZM5.9892 3.86438L8.68307 9.04351L17.9404 14.1378L18.4216 14.4024C18.8252 14.6315 19.2713 14.4161 19.2713 13.9482C19.2713 13.8687 19.2458 13.7925 19.2017 13.7314L18.788 13.6816L18.3303 13.4326L14.5097 11.3435L10.3204 9.04944L6.1264 6.7554M5.9892 3.86438C5.59011 3.63372 5.14816 3.83984 5.14816 4.30561V13.21C5.14816 13.8824 5.58987 14.1166 6.04652 13.8569L8.14088 12.656L10.3541 13.9216L14.5428 16.3117L18.0163 18.3075L18.4746 18.5683C18.8783 18.7975 19.3241 18.5819 19.3241 18.1144C19.3241 18.0343 19.2982 17.9578 19.2536 17.8958L18.788 17.86L17.9622 17.3912L8.68307 12.2858L5.9892 3.86438Z" />
                  </svg>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] block font-medium uppercase tracking-wider opacity-70">Hemen İndir</span>
                    <span className="text-xl -mt-1 block">Google Play</span>
                  </div>
                </a>
              </motion.div>
            </div>

            {/* Floating Device Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 50, rotate: 5 }}
              whileInView={{ opacity: 1, y: 0, rotate: -5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="relative w-64 h-[500px] bg-[#0f0f15] rounded-[3rem] border-8 border-[#2a2a35] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden hidden lg:block"
            >
              {/* Screen Content Wrapper */}
              <div className="w-full h-full relative overflow-hidden bg-bg-dark flex flex-col items-center justify-center pt-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#2a2a35] rounded-b-xl z-20"></div>
                <img src="/logo.png" alt="Ehliyet Yolu Logo" className="w-20 h-20 object-contain mb-8 animate-pulse" />
                <h3 className="text-2xl font-black mb-2 px-6 text-center text-white">Ehliyet<span className="text-primary-light">Yolu</span></h3>
                <div className="w-4/5 h-20 bg-white/5 rounded-2xl mx-auto mb-4 border border-white/10"></div>
                <div className="w-4/5 h-32 bg-white/5 rounded-2xl mx-auto border border-white/10"></div>
                <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-primary/30 to-transparent"></div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-text-muted mt-20 bg-black/40 backdrop-blur-xl">
        <div className="flex justify-center flex-col items-center gap-6 max-w-7xl mx-auto px-6">
          <div className="flex justify-center items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 p-1.5 flex items-center justify-center grayscale opacity-50">
                <img src="/logo.png" alt="Ehliyet Yolu" className="w-full h-full object-contain filter invert" onError={(e) => e.target.style.display='none'} />
            </div>
            <span className="font-black text-white/50 tracking-widest uppercase text-base">Ehliyet Yolu</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-text-muted/60">
            <Link to="/policy" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
            <span className="opacity-30">•</span>
            <Link to="/policy" className="hover:text-white transition-colors">Kullanıcı Sözleşmesi</Link>
            <span className="opacity-30">•</span>
            <Link to="/policy" className="hover:text-white transition-colors">İletişim</Link>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">© 2026 EhliyetYolu Technologies. Tüm Hakları Saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
