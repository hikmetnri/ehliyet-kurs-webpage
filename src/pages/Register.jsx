import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api';
import { UserPlus, CarFront, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorObj, setErrorObj] = useState(null);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

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

    try {
      // Backend api endpoint to register
      const response = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
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
      const message = err.response?.data?.message || 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.';
      setErrorObj(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark relative overflow-hidden px-4 text-text-primary py-12">
      {/* Background Animated Assets */}
      <div className="absolute inset-0 animated-bg z-0 pointer-events-none opacity-60"></div>
      <div className="absolute inset-0 noise z-0 pointer-events-none"></div>

      <div className="absolute top-10 right-10 w-96 h-96 bg-accent/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
      
      <Link to="/login" className="absolute top-8 left-8 flex items-center gap-2 text-text-secondary hover:text-white transition-colors z-20 font-medium">
        <ChevronLeft className="w-5 h-5" />Giriş Ekranına Dön
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[500px] z-10"
      >
        <div className="glass-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-black/50 border-white/10">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent-light to-transparent opacity-80"></div>
          
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Ehliyet Yolu Logo" className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse" />
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Hemen Katılın</h2>
            <p className="text-text-muted font-medium">Ehliyet Yolu ile başarıya ilk adımı atın</p>
          </div>

          <AnimatePresence>
            {errorObj && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{errorObj}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5 ml-1">Ad</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Ahmet"
                  className="input-field py-3"
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
                  className="input-field py-3"
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
                className="input-field py-3"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5 ml-1">Şifre</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="input-field py-3"
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
                  className="input-field py-3"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2 py-4 shadow-primary/20 bg-gradient-to-br from-accent to-primary"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Ücretsiz Kayıt Ol <UserPlus className="w-5 h-5" />
                  </>
                )}
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
      </motion.div>
    </div>
  );
};

export default Register;
