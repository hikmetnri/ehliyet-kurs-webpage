import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, UserPlus } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const GuestBlocker = ({ title = 'Uye Olmanız Gerekiyor', description = 'Bu sayfaya ve tüm özelliklere erişebilmek için lütfen giriş yapın veya yeni bir hesap oluşturun.' }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogin = () => {
    logout();
    navigate('/login');
  };

  const handleRegister = () => {
    logout();
    navigate('/register');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12]/60 p-8 text-center backdrop-blur-xl shadow-2xl">
        {/* Glow decoration */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Icon dial */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 mb-6 animate-pulse">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-3">
            {title}
          </h2>
          
          <p className="text-sm text-text-muted leading-relaxed mb-8 px-2">
            {description}
          </p>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleLogin}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              <LogIn className="w-4 h-4" />
              Giriş Yap
            </button>
            
            <button
              onClick={handleRegister}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <UserPlus className="w-4 h-4" />
              Kayıt Ol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestBlocker;
