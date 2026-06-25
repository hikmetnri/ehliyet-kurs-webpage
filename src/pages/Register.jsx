import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { UserPlus, ChevronLeft, ChevronRight, Loader2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirebaseAuthErrorMessage } from '../utils/firebaseAuthError';
import { getAcquisitionContext } from '../utils/analytics';
import MaintenanceScreen from '../components/MaintenanceScreen';

const MotionDiv = motion.div;

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [errorObj, setErrorObj] = useState(null);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    api.get('/status')
      .then((res) => {
        if (active) setMaintenanceActive(Boolean(res.data?.maintenance));
      })
      .catch(() => {
        if (active) setMaintenanceActive(false);
      })
      .finally(() => {
        if (active) setCheckingMaintenance(false);
      });

    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorObj(null);

    if (formData.password !== formData.passwordConfirm) {
      setErrorObj('Şifreler birbiriyle uyuşmuyor.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorObj('Şifre en az 6 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    try {
      const acquisition = getAcquisitionContext();
      // Backend api endpoint to register
      const response = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        source: acquisition.source,
        platform: 'web',
        analytics: acquisition,
      });

      const { user, token } = response.data;
      
      // Kayıt başarılıysa otomatik giriş yap
      setAuth(user, token);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Register error:', err);
      if (err.response?.status === 503 || err.response?.data?.maintenance) {
        setMaintenanceActive(true);
        return;
      }
      const message = err.response?.data?.message || err.response?.data?.error || 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.';
      setErrorObj(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorObj(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const acquisition = getAcquisitionContext();
      
      const response = await api.post('/auth/google', {
        idToken,
        source: acquisition.source,
        platform: 'web',
        analytics: acquisition,
      });
      const { user, token } = response.data;
      
      setAuth(user, token);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      if (err.response?.status === 503 || err.response?.data?.maintenance) {
        setMaintenanceActive(true);
        return;
      }
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      setErrorObj(backendMessage || getFirebaseAuthErrorMessage(
        err,
        'Google ile işlem başarısız oldu. Lütfen ayarlarınızı kontrol edin.',
      ));
    } finally {
      setLoading(false);
    }
  };

  if (checkingMaintenance) {
    return <div className="min-h-screen bg-bg-dark" aria-label="Sayfa yükleniyor" />;
  }

  if (maintenanceActive) {
    return <MaintenanceScreen onAdminAccess={() => navigate('/login?admin=1')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark relative overflow-hidden px-4 py-8 md:py-12 text-text-primary">
      {/* Background Animated Assets */}
      <div className="absolute inset-0 animated-bg z-0 pointer-events-none opacity-60"></div>
      <div className="absolute inset-0 noise z-0 pointer-events-none"></div>

      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#6C63FF]/15 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#3ECFCF]/12 blur-[120px] rounded-full pointer-events-none z-0"></div>
      
      <Link to="/login" className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-sm md:text-base text-text-secondary hover:text-white transition-colors z-20 font-medium">
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /> Giriş Ekranına Dön
      </Link>

      <button
        type="button"
        onClick={() => {
          const startGuestMode = useAuthStore.getState().startGuestMode;
          startGuestMode();
          navigate('/dashboard');
        }}
        className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-1.5 text-sm font-semibold text-text-primary hover:text-white transition-all duration-200 cursor-pointer z-20"
      >
        Geç <ChevronRight className="w-3.5 h-3.5" />
      </button>

      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[500px] z-10 mt-12 md:mt-0"
      >
        <div className="glass-card rounded-[2rem] p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-black/50 border-white/10">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent-light to-transparent opacity-80"></div>
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white shadow-2xl shadow-accent/20 ring-1 ring-white/70 flex items-center justify-center overflow-hidden p-1">
              <img src="/logo_v2.png" alt="Ehliyet Yolu Logo" className="w-full h-full object-contain rounded-full drop-shadow-sm animate-pulse" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Hemen Katılın</h2>
            <p className="text-text-muted font-medium">Ehliyet Yolu ile başarıya ilk adımı atın</p>
          </div>

          <AnimatePresence>
            {errorObj && (
              <MotionDiv
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{errorObj}</p>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5 ml-1">Ad</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Ahmet"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/20 focus:bg-[#6C63FF]/5 rounded-xl px-5 py-3 text-white placeholder-text-muted transition-all duration-300 focus:outline-none"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5 ml-1">Soyad</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Yılmaz"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/20 focus:bg-[#6C63FF]/5 rounded-xl px-5 py-3 text-white placeholder-text-muted transition-all duration-300 focus:outline-none"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5 ml-1">E-posta Adresi</label>
              <input
                type="email"
                name="email"
                placeholder="isim@ornek.com"
                className="w-full bg-white/5 border border-white/10 focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/20 focus:bg-[#6C63FF]/5 rounded-xl px-5 py-3 text-white placeholder-text-muted transition-all duration-300 focus:outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5 ml-1">
                Telefon Numarası
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="05xx xxx xx xx"
                className="w-full bg-white/5 border border-white/10 focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/20 focus:bg-[#6C63FF]/5 rounded-xl px-5 py-3 text-white placeholder-text-muted transition-all duration-300 focus:outline-none"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5 ml-1">Şifre</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/20 focus:bg-[#6C63FF]/5 rounded-xl px-5 py-3 text-white placeholder-text-muted transition-all duration-300 focus:outline-none"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5 ml-1">Şifreniz (Tekrar)</label>
                <input
                  type="password"
                  name="passwordConfirm"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/20 focus:bg-[#6C63FF]/5 rounded-xl px-5 py-3 text-white placeholder-text-muted transition-all duration-300 focus:outline-none"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-xs text-text-muted mt-1 ml-1 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-accent-light shrink-0 mt-0.5" />
              <span>Şifre en az 6 karakter olmalıdır.</span>
            </div>

            <div className="pt-6 space-y-3">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 bg-gradient-to-r from-[#6C63FF] to-[#8A30FF] hover:from-[#5b52f2] hover:to-[#7924eb] text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_6px_20px_rgba(108,99,255,0.35)] hover:shadow-[0_8px_25px_rgba(108,99,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Ücretsiz Kayıt Ol <UserPlus className="w-5 h-5" />
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
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-3.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors font-semibold text-text-primary group disabled:opacity-50"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google ile Kayıt Ol
              </button>

              <button 
                type="button"
                onClick={() => {
                  const startGuestMode = useAuthStore.getState().startGuestMode;
                  startGuestMode();
                  navigate('/dashboard');
                }}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary-light rounded-xl transition-colors font-semibold disabled:opacity-50"
              >
                Giriş Yapmadan Devam Et (Misafir Girişi)
              </button>
            </div>
            
            <p className="text-xs text-text-muted text-center mt-4">
              Kayıt olarak Kullanım Koşulları ve Gizlilik Politikasını kabul etmiş sayılırsınız.
            </p>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-text-muted font-medium">
          Zaten bir hesabınız var mı? <Link to="/login" className="text-accent-light hover:text-white transition-colors">Giriş Yapın</Link>
        </p>
      </MotionDiv>
    </div>
  );
};

export default Register;
