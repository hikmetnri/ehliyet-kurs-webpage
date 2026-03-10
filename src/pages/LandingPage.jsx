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
  ArrowRight
} from 'lucide-react';

import api from '../api';

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);

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
      <section className="hero" style={{ padding: '120px 5% 80px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}
        >
          <Zap size={16} /> 2026 Müfredatına Tam Uyumlu
        </motion.div>

        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}
        >
          Ehliyet Sınavında <br />
          <span className="text-gradient">Başarıya Giden Yol</span>
        </motion.h1>
        
        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: 700, margin: '0 auto 48px' }}
        >
          En güncel MEB soruları, yapay zeka destekli hata analizi ve videolu derslerle ehliyetinizi ilk girişinizde, garantili bir şekilde alın.
        </motion.p>
        
        <motion.div 
          className="hero-buttons"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button className="btn btn-primary" onClick={goToApp} style={{ padding: '18px 40px', fontSize: '1.125rem' }}>
            Hemen Başla <ArrowRight size={20} />
          </button>
          
          <button className="btn btn-outline" style={{ padding: '18px 40px', fontSize: '1.125rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <Smartphone size={20} /> Android Uygulamasını İndir
          </button>
        </motion.div>

        {/* Stats Strip */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 80, display: 'flex', gap: 60, flexWrap: 'wrap', justifyContent: 'center', opacity: 0.7 }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>50.000+</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Aktif Öğrenci</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>%98</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Başarı Oranı</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>5000+</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Güncel Soru</div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section" style={{ padding: '100px 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 16 }}>Neden Bizimle Hazırlanmalısın?</h2>
          <p className="text-muted" style={{ fontSize: '1.125rem' }}>Ehliyet Yolu, geleneksel yöntemleri modern teknolojiyle birleştirir.</p>
        </div>

        <div className="features" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
          <div className="feature-card glass-panel" style={{ padding: 40, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div className="feature-icon" style={{ width: 56, height: 56, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
              <Brain size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Yapay Zeka Destekli</h3>
            <p className="text-muted">Sistem, yanlış yaptığınız soruları analiz eder ve öğrenene kadar o soruları karşınıza çıkarmaya devam eder.</p>
          </div>

          <div className="feature-card glass-panel" style={{ padding: 40, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="feature-icon" style={{ width: 56, height: 56, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)' }}>
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Resmi Sınav Formatı</h3>
            <p className="text-muted">Tüm dijital denemelerimiz MEB'in gerçek e-sınav arayüzü ile %100 uyumlu olarak tasarlanmıştır.</p>
          </div>

          <div className="feature-card glass-panel" style={{ padding: 40, border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <div className="feature-icon" style={{ width: 56, height: 56, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              <Globe size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Her Yerden Erişim</h3>
            <p className="text-muted">İster telefonunda, ister bilgisayarında. Tüm ilerlemen bulutta saklanır ve cihazlar arasında senkronize olur.</p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section style={{ padding: '100px 5%', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 16 }}>Test Kategorileri</h2>
          <p className="text-muted">Hedeflediğin ehliyet sınıfına göre özelleştirilmiş test havuzu.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
          {categories.map((cat, index) => (
            <motion.div 
              key={cat._id} 
              className="glass-panel" 
              style={{ padding: 32, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderColor: 'var(--primary)' }}
              onClick={goToApp}
            >
              <div style={{ 
                width: 72, 
                height: 72, 
                margin: '0 auto 20px', 
                background: cat.color ? `${cat.color}20` : 'rgba(255,255,255,0.1)', 
                color: cat.color || 'white', 
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>{cat.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{cat.description || `${cat.name} uzmanlık testleri`}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Android Promo CTA */}
      <section style={{ padding: '120px 5%' }}>
        <div className="glass-panel" style={{ 
          maxWidth: 1000, 
          margin: '0 auto', 
          padding: '64px', 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.2))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', marginBottom: 32 }}>
            <Smartphone size={60} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 20 }}>Cebindeki Kurs Merkezi</h2>
          <p className="text-muted" style={{ fontSize: '1.125rem', maxWidth: 600, marginBottom: 40 }}>
            Ehliyet Yolu mobil uygulamasıyla internetin olmadığı yerlerde bile çalışmaya devam et. Hemen ücretsiz indir.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
             <button className="btn btn-primary" style={{ padding: '16px 32px' }}>
                <Download size={20} /> Play Store'dan İndir
             </button>
             <button className="btn btn-outline" style={{ padding: '16px 32px' }}>
                Yakında App Store'da
             </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 5% 40px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Shield color="var(--primary)" /> Ehliyet Yolu
        </div>
        <p className="text-muted" style={{ marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
          Sürücü belgesi alma sürecinizdeki en büyük dijital destekçiniz. 2026 yılı tüm sınav içerikleriyle hizmetinizdeyiz.
        </p>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 40 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Gizlilik Politikası</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Kullanım Şartları</a>
          <a href="mailto:admin@ehliyetyolu.com" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-white">Destek</a>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem' }}>© 2026 Ehliyet Yolu. Tüm Hakları Saklıdır.</p>
      </footer>

      <style>{`
        .hover-white:hover { color: white !important; }
        .hero-title {
           line-height:1.05 !important;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
