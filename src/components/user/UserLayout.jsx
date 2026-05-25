import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import UserBottomNav from './UserBottomNav';

import CategorySelectorModal from './CategorySelectorModal';
import NotificationPanel from './NotificationPanel';
import { Menu, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api';

const pageMeta = [
  { match: /^\/dashboard\/lessons/, title: 'Dersler', kicker: 'Müfredat ve konu anlatımları' },
  { match: /^\/dashboard\/exams/, title: 'Sınav Merkezi', kicker: 'Denemeler, mini testler ve tekrarlar' },
  { match: /^\/dashboard\/favorites/, title: 'Favoriler', kicker: 'Kaydettiğin sorular' },
  { match: /^\/dashboard\/stats/, title: 'İstatistikler', kicker: 'Gelişim ve performans takibi' },
  { match: /^\/dashboard\/feed/, title: 'Topluluk', kicker: 'Duyurular ve paylaşımlar' },
  { match: /^\/dashboard\/support/, title: 'Destek', kicker: 'Talepler ve mesajlar' },
  { match: /^\/dashboard\/traffic-signs/, title: 'Trafik İşaretleri', kicker: 'Levha pratiği' },
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
  const location = useLocation();
  const currentPage = getPageMeta(location.pathname);
  const hideHeaderOnMobile = ['/dashboard', '/dashboard/', '/dashboard/settings', '/dashboard/settings/'].includes(location.pathname);

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
    <div className="flex bg-bg-dark min-h-screen text-text-primary overflow-hidden lg:bg-[#07080c]">
      
      {/* Onboarding Modals */}

      <CategorySelectorModal 
        isOpen={showCategoryModal} 
        required
      />

      <UserSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className={`h-14 lg:h-[72px] bg-[#121212]/95 lg:bg-[#090b10]/95 backdrop-blur-xl border-b border-white/10 lg:border-white/10 flex items-center justify-between gap-3 px-3 sm:px-4 lg:px-8 sticky top-0 z-10 shrink-0 ${hideHeaderOnMobile ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl border border-white/5 bg-white/[0.03] text-text-muted transition-colors hover:bg-white/5 hover:text-white hidden"
              aria-label="Menüyü aç"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 lg:hidden">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-light">
                Ehliyet Yolu
              </p>
              <h2 className="truncate text-sm font-black leading-tight tracking-tight text-white">
                Öğrenci Paneli
              </h2>
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{currentPage.kicker}</p>
              <h2 className="mt-1 max-w-[42vw] truncate text-xl font-black leading-tight tracking-tight text-white">
                {currentPage.title}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Bildirim Butonu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-10 h-10 lg:h-9 lg:w-9 flex items-center justify-center rounded-[14px] lg:rounded-xl border transition-all group ${
                  showNotifications
                    ? 'bg-primary/10 border-primary/30 text-primary-light'
                    : 'bg-white/[0.02] border-white/5 lg:border-white/10 text-text-muted hover:text-white hover:bg-white/[0.05]'
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
            <div className="flex items-center gap-2 border-l border-white/10 pl-2 sm:gap-3 sm:pl-3 lg:pl-4">
              <div className="hidden max-w-[180px] text-right sm:block lg:max-w-[220px]">
                <p className="truncate text-xs font-bold leading-none text-white">{fullName}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                    Seviye {user?.level || 1} • {user?.totalScore || 0} XP
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="h-9 w-9 rounded-[13px] bg-gradient-to-br from-primary to-accent p-[2px] shadow-lg shadow-primary/20 sm:h-10 sm:w-10 sm:rounded-[14px] lg:bg-white/10 lg:shadow-none">
                  <div className="w-full h-full bg-bg-dark rounded-[12px] flex items-center justify-center overflow-hidden lg:bg-[#090b10]">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-white text-sm">
                        {user?.firstName?.charAt(0) || 'Ö'}
                      </span>
                    )}
                  </div>
                </div>
                {user?.proStatus && (
                  <div className="absolute -bottom-1 -right-1 bg-warning text-bg-dark text-[8px] font-black px-1.5 py-0.5 rounded-full border border-bg-dark">
                    PRO
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-hidden relative z-0 ${fullscreen ? 'p-0' : 'overflow-y-auto px-4 py-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:p-6 lg:p-8 lg:pb-8 custom-scrollbar'}`}>
          <Outlet />
        </main>
        {!fullscreen && <UserBottomNav />}
      </div>
    </div>
  );
};

export default UserLayout;
