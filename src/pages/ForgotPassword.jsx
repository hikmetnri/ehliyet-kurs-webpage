import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronLeft, Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(
        response.data?.message ||
          'Eğer e-posta adresi sistemimizde kayıtlıysa şifre sıfırlama bağlantısı gönderildi.',
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Şifre sıfırlama isteği gönderilemedi. Lütfen tekrar deneyin.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark relative overflow-hidden px-4 text-text-primary">
      <div className="absolute inset-0 animated-bg z-0 pointer-events-none opacity-60"></div>
      <div className="absolute inset-0 noise z-0 pointer-events-none"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/20 blur-[120px] rounded-full"></div>

      <Link to="/login" className="absolute top-8 left-8 flex items-center gap-2 text-text-secondary hover:text-white transition-colors z-20 font-medium">
        <ChevronLeft className="w-5 h-5" /> Giriş Ekranına Dön
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="glass-card rounded-[2rem] p-10 relative overflow-hidden shadow-2xl shadow-black/50 border-white/10">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-light to-transparent opacity-80"></div>

          <div className="text-center mb-8">
            <img src="/logo/logo_v2.png" alt="Ehliyet Yolu Logo" className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse" />
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Şifremi Unuttum</h2>
            <p className="text-text-muted font-medium">E-posta adresinizi yazın, şifre yenileme bağlantısını gönderelim.</p>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="mb-6 overflow-hidden">
                <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p>{message}</p>
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="mb-6 overflow-hidden">
                <div className="bg-danger/10 border border-danger/30 text-danger-light px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2 ml-1">E-posta Adresi</label>
              <input
                type="email"
                placeholder="isim@ornek.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2 py-4 shadow-primary/20">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-5 h-5" /> Bağlantı Gönder</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
