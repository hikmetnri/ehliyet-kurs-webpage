import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, Link, useSearchParams } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import UserBottomNav from './UserBottomNav';
import FloatingAIChat from './FloatingAIChat';

import CategorySelectorModal from './CategorySelectorModal';
import NotificationPanel from './NotificationPanel';
import { Menu, Bell, Sun, Moon, Lock, Monitor } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api';

const pageMeta = [
  { match: /^\/dashboard\/lessons/, title: 'Dersler', kicker: 'Müfredat ve konu anlatımları' },
  { match: /^\/dashboard\/exams/, title: 'Sınav Merkezi', kicker: 'Denemeler, mini testler ve tekrarlar' },
  { match: /^\/dashboard\/favorites/, title: 'Favoriler', kicker: 'Kaydettiğin sorular' },
  { match: /^\/dashboard\/stats/, title: 'İstatistikler', kicker: 'Gelişim ve performans takibi' },
  { match: /^\/dashboard\/feed/, title: 'Topluluk', kicker: 'Duyurular ve paylaşımlar' },
  { match: /^\/dashboard\/support/, title: 'Destek', kicker: 'Talepler ve mesajlar' },
  { match: /^\/dashboard\/traffic-signs/, title: 'Levha Kütüphanesi', kicker: 'Trafik ve iş sağlığı levha pratiği' },
  { match: /^\/dashboard\/videos/, title: 'Video Dersler', kicker: 'Görsel anlatımlar' },
  { match: /^\/dashboard\/driving-schools/, title: 'Sürücü Kursları', kicker: 'Kurs arama ve karşılaştırma' },
  { match: /^\/dashboard\/settings/, title: 'Ayarlar', kicker: 'Profil, hedef ve tercihler' },
];

const getPageMeta = (pathname) => (
  pageMeta.find((item) => item.match.test(pathname)) || {
    title: 'Ana Sayfa',
    kicker: 'Çalışma planı ve hızlı erişim',
  }
);

const extractNotifications = (payload) => {
  if (Array.isArray(payload?.data?.notifications)) return payload.data.notifications;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.data)) return payload.data;
  return Array.isArray(payload) ? payload : [];
};

const UserLayout = ({ fullscreen = false }) => {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useAuthStore((state) => state.user);
  const showCategoryModal = Boolean(user && !user.selectedCategoryId);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Öğrenci';
  
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme-mode') || 'dark';
  });

  const isThemeLocked = Boolean(user?.proStatus && user?.theme && user.theme !== 'default');

  useEffect(() => {
    if (user?.proStatus && user?.theme && user.theme !== 'default') {
      document.documentElement.setAttribute('data-theme', user.theme);
      document.documentElement.setAttribute('data-theme-mode', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme-mode', isDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme-mode', themeMode);
      }
    }
  }, [user, themeMode]);

  useEffect(() => {
    if (themeMode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => {
      if (user?.proStatus && user?.theme && user.theme !== 'default') return;
      document.documentElement.setAttribute('data-theme-mode', e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [themeMode, user]);

  const changeThemeMode = (mode) => {
    if (isThemeLocked) return;
    setThemeMode(mode);
    localStorage.setItem('theme-mode', mode);
  };

  const toggleThemeMode = () => {
    if (isThemeLocked) return;
    let nextMode = 'dark';
    if (themeMode === 'dark') nextMode = 'light';
    else if (themeMode === 'light') nextMode = 'system';
    else if (themeMode === 'system') nextMode = 'dark';
    changeThemeMode(nextMode);
  };
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentPage = getPageMeta(location.pathname);
  const hideHeaderOnMobile = ['/dashboard', '/dashboard/', '/dashboard/settings', '/dashboard/settings/'].includes(location.pathname);
  const isRealExamRoute =
    location.pathname.startsWith('/dashboard/exams/real-test/') ||
    (location.pathname.startsWith('/dashboard/exams/') && searchParams.get('mode') === 'real');
  const hideFloatingAIChat = isRealExamRoute || location.pathname === '/dashboard/ai-chat';

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const list = extractNotifications(res.data);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Bildirim sayısı alınamadı:', err);
    }
  }, []);

  // İlk yükleme + her 60 saniyede bir güncelle
  useEffect(() => {
    const timeout = setTimeout(fetchUnreadCount, 0);
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  // Panel kapatıldığında sayıyı güncelle
  const handleCloseNotifications = useCallback(() => {
    setShowNotifications(false);
    // Kısa gecikme ile güncelle (API'ye zaman ver)
    setTimeout(fetchUnreadCount, 500);
  }, [fetchUnreadCount]);

  return (
    <div className="flex bg-bg-dark min-h-screen text-text-primary overflow-hidden lg:bg-bg-dark">
      
      {/* Onboarding Modals */}

      <CategorySelectorModal 
        isOpen={showCategoryModal} 
        required
      />

      <UserSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className={`h-14 lg:h-[72px] bg-bg-card/95 backdrop-blur-xl border-b border-border-color flex items-center justify-between gap-3 px-3 sm:px-4 lg:px-8 sticky top-0 z-10 shrink-0 ${hideHeaderOnMobile ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl border border-white/5 bg-white/[0.03] text-text-muted transition-colors hover:bg-white/5 hover:text-white hidden"
              aria-label="Menüyü aç"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 lg:hidden">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-light">
                Ehliyet Yolu
              </p>
              <h2 className="truncate text-sm font-black leading-tight tracking-tight text-text-primary">
                Öğrenci Paneli
              </h2>
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{currentPage.kicker}</p>
              <h2 className="mt-1 max-w-[42vw] truncate text-xl font-black leading-tight tracking-tight text-text-primary">
                {currentPage.title}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Tema Değiştirici */}
            <div className="relative flex items-center">
              <button
                onClick={toggleThemeMode}
                className={`relative w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 border ${
                  isThemeLocked
                    ? 'bg-white/[0.02] border-border-color cursor-not-allowed opacity-60'
                    : themeMode === 'dark'
                      ? 'bg-[#2d2f4e]/80 border-primary/20 hover:border-primary/45'
                      : themeMode === 'system'
                        ? 'bg-teal-500/10 border-teal-500/25 hover:border-teal-500/45'
                        : 'bg-primary/10 border-primary/25 hover:border-primary/45'
                }`}
                title={isThemeLocked ? "Özel tema etkinken renk modu değiştirilemez" : "Temayı Değiştir (Koyu - Açık - Sistem)"}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                    isThemeLocked
                      ? 'translate-x-0 bg-text-muted/40'
                      : themeMode === 'dark'
                        ? 'translate-x-0 bg-gradient-to-r from-primary to-accent'
                        : themeMode === 'system'
                          ? 'translate-x-3.5 bg-gradient-to-r from-teal-500 to-indigo-400'
                          : 'translate-x-7 bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                >
                  {isThemeLocked ? (
                    <Lock className="w-2.5 h-2.5 text-text-muted" />
                  ) : themeMode === 'dark' ? (
                    <Moon className="w-2.5 h-2.5 text-white fill-white" />
                  ) : themeMode === 'system' ? (
                    <Monitor className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <Sun className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
              </button>
            </div>

            {/* Bildirim Butonu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-10 h-10 lg:h-9 lg:w-9 flex items-center justify-center rounded-[14px] lg:rounded-xl border transition-all group ${
                  showNotifications
                    ? 'bg-primary/10 border-primary/30 text-primary-light'
                    : 'bg-bg-card border-border-color text-text-muted hover:text-text-primary hover:bg-white/[0.05]'
                }`}
              >
                <Bell className={`w-5 h-5 transition-transform ${showNotifications ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-bg-dark shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Bildirim Paneli */}
              <NotificationPanel
                isOpen={showNotifications}
                onClose={handleCloseNotifications}
              />
            </div>

            {/* User XP Badge */}
            <Link to="/dashboard/settings" className="flex items-center gap-2 border-l border-border-color pl-2 sm:gap-3 sm:pl-3 lg:pl-4 hover:opacity-85 transition-opacity cursor-pointer">
              <div className="hidden max-w-[180px] text-right sm:block lg:max-w-[220px]">
                <p className="truncate text-xs font-bold leading-none text-text-primary">{fullName}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                    Seviye {user?.level || 1} • {user?.totalScore || 0} XP
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="h-9 w-9 rounded-[13px] bg-gradient-to-br from-primary to-accent p-[2px] shadow-lg shadow-primary/20 sm:h-10 sm:w-10 sm:rounded-[14px] lg:bg-white/10 lg:shadow-none">
                  <div className="w-full h-full bg-bg-dark rounded-[12px] flex items-center justify-center overflow-hidden lg:bg-bg-card">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-text-primary text-sm">
                        {user?.firstName?.charAt(0) || 'Ö'}
                      </span>
                    )}
                  </div>
                </div>
                {user?.proStatus && (
                  <div className="absolute -bottom-1 -right-1 bg-warning text-bg-dark text-[8px] font-black px-1.5 py-0.5 rounded-full border border-bg-card">
                    PRO
                  </div>
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-hidden relative z-0 ${fullscreen ? 'p-0' : 'overflow-y-auto px-4 py-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:p-6 lg:p-8 lg:pb-8 custom-scrollbar'}`}>
          <Outlet context={{ themeMode, toggleThemeMode, changeThemeMode, isThemeLocked }} />
        </main>
        {!hideFloatingAIChat && <FloatingAIChat />}
        {!fullscreen && <UserBottomNav />}
      </div>
    </div>
  );
};

export default UserLayout;
