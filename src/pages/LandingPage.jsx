import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Brain, Star } from 'lucide-react';

import api from '../api';

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Sadece ana kategorileri getirir
    api.get('/categories').then(res => {
      if (res.data && res.data.data) {
        setCategories(res.data.data.filter(c => !c.parent)); // Only parent categories
      }
    }).catch(err => console.error("Could not fetch categories", err));
  }, []);

  const goToApp = () => {
    if (token) navigate('/dashboard');
    else navigate('/login');
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Sınavlara Hazırlanmanın <br />
          <span className="text-gradient">En Akıllı Yolu</span>
        </motion.h1>
        
        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Binlerce MEB onaylı çıkmış soru, videolu konu anlatımları ve detaylı başarı analiziniz ile ehliyet sınavını ilk girişinizde kazanın.
        </motion.p>
        
        <motion.div 
          className="hero-buttons"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button className="btn btn-primary" onClick={goToApp} style={{ padding: '16px 32px', fontSize: '1.125rem' }}>
            Hemen Soru Çöz <CheckCircle size={20} />
          </button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 40, width: '100%', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Sizin İçin Geliştirilmiş Özellikler</h2>
          <p className="text-muted">Projenin tüm platformlarında olan entegre yapımızı keşfedin.</p>
        </div>

        <div className="feature-card glass-panel" style={{ '--border-subtle': 'rgba(59, 130, 246, 0.2)' }}>
          <div className="feature-icon">
            <Shield size={24} />
          </div>
          <h3 className="feature-title">Güncel Çıkmış Sorular</h3>
          <p className="feature-desc">Milli Eğitim Bakanlığı'nın en son havuzunda yer alan, güncel ve birebir çıkmış ehliyet sorularıyla pratik yapın.</p>
        </div>

        <div className="feature-card glass-panel" style={{ '--border-subtle': 'rgba(16, 185, 129, 0.2)' }}>
          <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)' }}>
            <Brain size={24} />
          </div>
          <h3 className="feature-title">Yapay Zeka Destekli Analiz</h3>
          <p className="feature-desc">Yanlış yaptığınız soruları hafızaya alır, başarı yüzdenizi detaylı grafiklerle göstererek eksiklerinizi anında kapatır.</p>
        </div>

        <div className="feature-card glass-panel" style={{ '--border-subtle': 'rgba(239, 68, 68, 0.2)' }}>
          <div className="feature-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Star size={24} />
          </div>
          <h3 className="feature-title">Web ve Mobil Uyumlu</h3>
          <p className="feature-desc">İster bilgisayardan masaüstü rahatlığında çözün, ister arayüz sayesinde molalarınızda telefondan tekrar edin.</p>
        </div>

        <div className="feature-card glass-panel" style={{ '--border-subtle': 'rgba(245, 158, 11, 0.2)' }}>
          <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </div>
          <h3 className="feature-title">Video Dersler</h3>
          <p className="feature-desc">Sadece soru çözmekle kalmayın, konuları özel video anlatımlı derslerle sıfırdan öğrenin.</p>
        </div>

        <div className="feature-card glass-panel" style={{ '--border-subtle': 'rgba(168, 85, 247, 0.2)' }}>
          <div className="feature-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h3 className="feature-title">PDF Ders Notları</h3>
          <p className="feature-desc">Ders notlarını yüksek kaliteli PDF formatında cihazınıza indirin ve çevrimdışı çalışın.</p>
        </div>

        <div className="feature-card glass-panel" style={{ '--border-subtle': 'rgba(14, 165, 233, 0.2)' }}>
          <div className="feature-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h3 className="feature-title">Topluluk Akışı</h3>
          <p className="feature-desc">Aklınıza takılan soruları toplulukla paylaşın, tartışmalara katılın ve deneyimlerinizi aktarın.</p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="features" style={{ paddingTop: 40, background: 'rgba(0,0,0,0.2)' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 40, width: '100%', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Test Kategorileri</h2>
          <p className="text-muted">Hangi sınıfta ehliyet alacaksanız o alanda test çözmeye başlayın.</p>
        </div>

        {categories.map((cat, index) => (
          <motion.div 
            key={cat._id} 
            className="feature-card glass-panel" 
            style={{ cursor: 'pointer', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}
            onClick={goToApp}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="feature-icon" style={{ background: cat.color ? `${cat.color}20` : 'rgba(255,255,255,0.1)', color: cat.color || 'white', width: 64, height: 64, borderRadius: '50%' }}>
               {/* Replace with dynamic icon if necessary, using default for now */}
               <CheckCircle size={32} />
            </div>
            <h3 className="feature-title" style={{ marginTop: 16 }}>{cat.name}</h3>
            <p className="feature-desc" style={{ marginTop: 8 }}>{cat.description || `${cat.name} sınavına hazırlık testleri`}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer / Contact */}
      <footer style={{ padding: '60px 5%', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: 24, fontFamily: 'Outfit, sans-serif' }}>MachAcademy</h3>
        <p className="text-muted" style={{ marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
          Sürücü belgesi alma sürecinizdeki en büyük destekçiniz. Hemen kendi çalışma planınızı oluşturun ve öğrenmeye başlayın.
        </p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 24 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Gizlilik Politikası</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Kullanım Koşulları</a>
          <a href="mailto:admin@machacademy.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>İletişim</a>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>© 2026 MachAcademy (Ehliyet Yolu). Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
