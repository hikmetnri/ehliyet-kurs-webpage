import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Shield, 
  Brain, 
  Star, 
  Download, 
  Smartphone, 
  Globe, 
  Zap, 
  Award,
  ArrowRight,
  Video,
  FileText,
  Users,
  Bell,
  Lock,
  BarChart3,
  ChevronDown,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

import api from '../api';

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api.get('/categories').then(res => {
      if (res.data && res.data.data) {
        setCategories(res.data.data.filter(c => !c.parent));
      }
    }).catch(err => console.error("Could not fetch categories", err));
  }, []);

  const goToApp = () => {
    if (token) navigate('/dashboard');
    else navigate('/login');
  };

  const faqs = [
    { q: "Ehliyet Yolu sınav soruları güncel mi?", a: "Evet, sorularımız her hafta MEB havuzuyla senkronize edilerek güncellenir. En son 2026 müfredatına tam uyumludur." },
    { q: "Video dersleri internetsiz izleyebilir miyim?", a: "İnternet bağlantınız varken dökümanları ve ders notlarını indirebilir, çevrimdışı çalışma modundan faydalanabilirsiniz." },
    { q: "Android uygulaması paralı mı?", a: "Uygulamamızı Play Store'dan ücretsiz indirebilirsiniz. Bazı gelişmiş özellikler ve tam deneme sınavları için Pro üyelik gerekmektedir." },
    { q: "Hesabıma farklı cihazlardan girebilir miyim?", a: "Kesinlikle! Bilgisayar, tablet veya telefondan aynı kullanıcı bilgileriyle girerek ilerlemenizi kaldığınız yerden sürdürebilirsiniz." }
  ];

  return (
    <div className="landing-wrapper" style={{ overflowX: 'hidden' }}>
      {/* Background Decor */}
      <div className="bg-decor" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.15), transparent 70%), radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.05), transparent 50%)',
        pointerEvents: 'none'
      }} />

      {/* Hero Section */}
      <section className="hero-split" style={{ padding: '140px 8% 80px', display: 'flex', alignItems: 'center', minHeight: '90vh', gap: 60, flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: 350 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}
          >
            <Zap size={16} /> 2026 Müfredatına Tam Uyumlu
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24, lineHeight: 1.1 }}
          >
            Ehliyet Sınavında <br />
            <span className="text-gradient">Başarıya Giden Yol</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 48, lineHeight: 1.6 }}
          >
            MEB'in dijital çağına ayak uydurun. Yapay zeka destekli analizler, profesyonel video eğitimler ve güncel soru havuzuyla ilk girişinizde kazanın.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}
          >
            <button className="btn btn-primary" onClick={goToApp} style={{ padding: '20px 48px', fontSize: '1.2rem' }}>
              Hemen Başla <ArrowRight size={20} />
            </button>
            <button className="btn btn-outline" style={{ padding: '20px 40px', fontSize: '1.125rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <Download size={20} /> Uygulamayı İndir
            </button>
          </motion.div>
        </div>

        <motion.div 
          style={{ flex: '1', minWidth: 350, display: 'flex', justifyContent: 'center', position: 'relative' }}
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          {/* Main Visual */}
          <div className="hero-mockup-container" style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
             <img 
               src="/assets/mockup.png" 
               alt="App Mockup" 
               style={{ width: '100%', borderRadius: 40, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5), 0 30px 60px -30px rgba(59, 130, 246, 0.3)', border: '12px solid #111' }} 
             />
             {/* Floating Badge 1 */}
             <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
               className="glass-panel"
               style={{ position: 'absolute', top: '15%', right: '-30px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 20 }}
             >
                <div style={{ background: 'var(--secondary)', padding: 10, borderRadius: 12 }}><CheckCircle size={20} color="white" /></div>
                <div>
                   <div style={{ fontWeight: 700, fontSize: '1rem' }}>Sınav Geçildi!</div>
                   <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>94 Puan, Yeni Rozet</div>
                </div>
             </motion.div>
             {/* Floating Badge 2 */}
             <motion.div 
               animate={{ y: [0, 15, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
               className="glass-panel"
               style={{ position: 'absolute', bottom: '10%', left: '-30px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 20 }}
             >
                <div style={{ background: '#f59e0b', padding: 10, borderRadius: 12 }}><Star size={20} color="white" /></div>
                <div>
                   <div style={{ fontWeight: 700, fontSize: '1rem' }}>450+ Soru</div>
                   <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Bugün Çözüldü</div>
                </div>
             </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section" style={{ padding: '100px 8%' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: '3rem', marginBottom: 20 }}>Neden Ehliyet Yolu?</h2>
          <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: 700, margin: '0 auto' }}>
            Klasik kursların ötesindeki dijital ekosistemimizle sınava sadece hazırlanmaz, konularda uzmanlaşırsınız.
          </p>
        </div>

        <div className="features-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: 32 
        }}>
          {[
            { 
              icon: <Brain size={28} />, 
              title: "Yapay Zeka Destekli Öğrenme", 
              desc: "Hatalarınızı analiz eden sistem, zayıf olduğunuz konuları öngörür ve sizi o alanlarda geliştirir.",
              color: 'var(--primary)'
            },
            { 
              icon: <Video size={28} />, 
              title: "4K Video Eğitimler", 
              desc: "MEB müfredatına uygun, her biri 10-15 dakikalık konsantre konu anlatım videoları.",
              color: 'var(--secondary)'
            },
            { 
              icon: <FileText size={28} />, 
              title: "İnteraktif Ders Notları", 
              desc: "Önemli noktaları vurgulanmış, indirilebilir ve aranabilir dijital döküman arşivi.",
              color: '#f97316'
            },
            { 
              icon: <BarChart3 size={28} />, 
              title: "Gelişmiş Başarı Analizi", 
              desc: "Hangi derste yüzde kaç başarı sağladığınıza göre 'Sınavı Geçme Olasılığınızı' hesaplıyoruz.",
              color: '#0ea5e9'
            },
            { 
              icon: <Zap size={28} />, 
              title: "Anlık Mod Seçimi", 
              desc: "Hızlı Tekrar, Deneme Sınavı veya Konu Bazlı Çözüm modları arasında saniyeler içinde geçiş yapın.",
              color: '#ebca00'
            },
            { 
              icon: <Users size={28} />, 
              title: "Topluluk ve Moderasyon", 
              desc: "Binlerce aday ve eğitmenle etkileşim kurun, çözülemeyen soruları birlikte sonuca ulaştırın.",
              color: '#a855f7'
            }
          ].map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="feature-card glass-panel" 
              style={{ padding: 40, border: `1px solid ${f.color}20` }}
            >
              <div style={{ width: 64, height: 64, background: `${f.color}15`, color: f.color, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: 16 }}>{f.title}</h3>
              <p className="text-muted" style={{ fontSize: '1rem', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Grid (Centered) */}
      <section style={{ padding: '120px 8%', background: 'rgba(15, 23, 42, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: '3rem', marginBottom: 20 }}>Sınav Kategorileri</h2>
          <p className="text-muted" style={{ fontSize: '1.25rem' }}>Eğitimlerimizi ehliyet sınıflarına göre özelleştirdik.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 320px))', 
          gap: 24, 
          maxWidth: 1200, 
          margin: '0 auto',
          justifyContent: 'center' 
        }}>
          {categories.map((cat, index) => (
            <motion.div 
              key={cat._id} 
              className="glass-panel" 
              style={{ padding: 40, cursor: 'pointer', textAlign: 'center' }}
              whileHover={{ scale: 1.05, borderColor: 'var(--primary)' }}
              onClick={goToApp}
            >
              <div style={{ 
                width: 80, 
                height: 80, 
                margin: '0 auto 24px', 
                background: cat.color ? `${cat.color}20` : 'rgba(255,255,255,0.1)', 
                color: cat.color || 'white', 
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>{cat.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{cat.description || `${cat.name} Eğitim Paketi`}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '120px 8%', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 16 }}>Sıkça Sorulan Sorular</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="glass-panel" 
              style={{ overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{faq.q}</span>
                <ChevronDown size={20} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </div>
              <motion.div 
                initial={false}
                animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '0 32px 32px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '120px 8%' }}>
        <div className="glass-panel" style={{ 
          maxWidth: 1100, 
          margin: '0 auto', 
          padding: '80px 40px', 
          borderRadius: 40,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.2))',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -30, left: -30, opacity: 0.1 }}>
             <MessageCircle size={200} />
          </div>
          <h2 style={{ fontSize: '3rem', marginBottom: 24, position: 'relative' }}>Hayallerindeki Ehliyet Sadece Bir Uygulama Uzağında</h2>
          <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: 650, margin: '0 auto 48px' }}>
            Hemen ücretsiz denemeye başla, farkı kendin gör. Memnun kalmazsan saniyeler içinde hesabını silebilirsin.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
             <button className="btn btn-primary" onClick={goToApp} style={{ padding: '20px 48px', fontSize: '1.25rem' }}>Ücretsiz Başla</button>
             <button className="btn btn-outline" style={{ padding: '20px 48px', fontSize: '1.25rem' }}>Fiyatları Gör</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '100px 8% 40px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Shield size={40} color="var(--primary)" /> Ehliyet Yolu
        </div>
        <p className="text-muted" style={{ marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
          2026 yılının en kapsamlı sürücü aday platformu. Ehliyet sınavını kazandırıyoruz.
        </p>
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginBottom: 48 }}>
          <a href="#" className="footer-link">Gizlilik</a>
          <a href="#" className="footer-link">Şartlar</a>
          <a href="#" className="footer-link">Yardım Merkezi</a>
          <a href="#" className="footer-link">Blog</a>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem' }}>
          © 2026 Ehliyet Yolu. Tasarım ve Teknoloji: MachAcademy Team.
        </div>
      </footer>

      <style>{`
        .footer-link {
          color: var(--text-muted);
          text-decoration: none;
          transition: 0.2s;
        }
        .footer-link:hover { color: white; }
        .hero-title { line-height: 1 !important; }
        .text-gradient {
          background: linear-gradient(135deg, #3b82f6, #60a5fa, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @media (max-width: 768px) {
           .hero-split { padding-top: 100px; text-align: center; }
           .hero-buttons { justify-content: center; }
           .hero-mockup-container { margin-top: 40px; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
