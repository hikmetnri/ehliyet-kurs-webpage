import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api';
import { LogIn, CarFront, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorObj, setErrorObj] = useState(null);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorObj(null);

    try {
      // Backend API'ye gerçek istek atıyoruz
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      // Zustand Store'a kaydet (Aynı zamanda localStorage'a yazılır)
      setAuth(user, token);
      
      // Gelen user rolüne göre dinamik yönlendirme
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Backend'den dönen hata mesajı varsa göster, yoksa varsayılan hata.
      const message = err.response?.data?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.';
      setErrorObj(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark relative overflow-hidden px-4 text-text-primary">
      {/* Background Animated Assets */}
      <div className="absolute inset-0 animated-bg z-0 pointer-events-none opacity-60"></div>
      <div className="absolute inset-0 noise z-0 pointer-events-none"></div>

      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/20 blur-[120px] rounded-full"></div>
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-text-secondary hover:text-white transition-colors z-20 font-medium">
        <ChevronLeft className="w-5 h-5" /> Ana Sayfaya Dön
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="glass-card rounded-[2rem] p-10 relative overflow-hidden shadow-2xl shadow-black/50 border-white/10">
          {/* Top Line Decorator */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-light to-transparent opacity-80"></div>
          
          <div className="text-center mb-10">
            <img src="/logo.png" alt="Ehliyet Yolu Logo" className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse" />
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Hoş Geldiniz</h2>
            <p className="text-text-muted font-medium">Ehliyet Yolu eğitim platformuna giriş yapın</p>
          </div>

          {/* Hata Mesajı Gösterimi */}
          <AnimatePresence>
            {errorObj && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-danger/10 border border-danger/30 text-danger-light px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{errorObj}</p>
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
            
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-semibold text-text-secondary">Şifre</label>
                <a href="#" className="text-xs text-primary-light hover:text-white transition-colors">Şifremi Unuttum</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2 py-4 shadow-primary/20"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" /> Sisteme Giriş
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-text-muted font-medium">
          Hesabınız yok mu? <Link to="/register" className="text-primary-light hover:text-white transition-colors">Hemen Kayıt Olun</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
