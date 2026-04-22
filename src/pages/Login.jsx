import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorObj(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const response = await api.post('/auth/google', { idToken });
      const { user, token } = response.data;
      
      setAuth(user, token);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);
      // Firebase specific errors
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorObj('Google ile giriş iptal edildi.');
      } else {
        setErrorObj(err.response?.data?.error || 'Google ile giriş başarısız oldu. Lütfen ayarlarınızı kontrol edin.');
      }
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

            <div className="pt-4 space-y-3">
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

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-text-muted text-xs font-semibold">VEYA</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-3.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors font-semibold text-text-primary group disabled:opacity-50"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google ile Devam Et
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
