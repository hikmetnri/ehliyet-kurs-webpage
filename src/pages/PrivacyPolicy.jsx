import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import api from '../api';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const [privacy, setPrivacy] = useState('');
  const [kvkk, setKvkk] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLegalTexts = async () => {
      try {
        const [privacyRes, kvkkRes] = await Promise.all([
          api.get('/legal/privacy'),
          api.get('/legal/kvkk')
        ]);
        if (privacyRes.data?.data) setPrivacy(privacyRes.data.data.content);
        if (kvkkRes.data?.data) setKvkk(kvkkRes.data.data.content);
      } catch (err) {
        console.error('Hukuki metinler yüklenemedi', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLegalTexts();
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary p-6 md:p-12 selection:bg-primary/30">
      <div className="max-w-4xl mx-auto glass-card rounded-[3rem] p-8 md:p-16 border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-10 font-bold uppercase tracking-widest text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Geri Dön
        </button>

        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight text-white">Gizlilik Politikası <span className="text-primary-light">ve KVKK Aydınlatma Metni</span></h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:text-white prose-p:text-text-secondary prose-a:text-primary-light hover:prose-a:text-white prose-li:text-text-secondary">
            
            {privacy ? (
              <div dangerouslySetInnerHTML={{ __html: privacy }} />
            ) : (
              <p>Gizlilik politikası henüz eklenmemiş.</p>
            )}

            <hr className="border-white/10 my-10" />

            <h2>KVKK Aydınlatma Metni</h2>
            {kvkk ? (
              <div dangerouslySetInnerHTML={{ __html: kvkk }} />
            ) : (
              <p>KVKK metni henüz eklenmemiş.</p>
            )}

            <hr className="border-white/10 my-10" />
            <p className="text-sm">Bu belge, Google Play ve App Store geliştirici politikaları gereği oluşturulmuş ve yayımlanmıştır.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PrivacyPolicy;
