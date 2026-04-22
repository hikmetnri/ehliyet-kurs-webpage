import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import MotivationToast from './MotivationToast';
import CategorySelectorModal from './CategorySelectorModal';
import NotificationPanel from './NotificationPanel';
import { Menu, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api';

const UserLayout = ({ fullscreen = false }) => {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Nếu user giriş yaptıysa ve henüz bir kategori (ehliyet türü) seçmemişse modalı göster
    if (user && !user.selectedCategoryId) {
      setShowCategoryModal(true);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data?.notifications || res.data?.data || res.data;
      const list = Array.isArray(data) ? data : [];
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Bildirim sayısı alınamadı:', err);
    }
  }, []);

  // İlk yükleme + her 60 saniyede bir güncelle
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Panel kapatıldığında sayıyı güncelle
  const handleCloseNotifications = useCallback(() => {
    setShowNotifications(false);
    // Kısa gecikme ile güncelle (API'ye zaman ver)
    setTimeout(fetchUnreadCount, 500);
  }, [fetchUnreadCount]);

  return (
    <div className="flex bg-bg-dark min-h-screen text-text-primary overflow-hidden">
      
      {/* Onboarding Modals */}
      <MotivationToast />
      <CategorySelectorModal 
        isOpen={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)} 
      />

      <UserSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Dekoratif Işıklar - Sayfa Geneli */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
        
        {/* Topbar */}
        <header className="h-16 lg:h-20 bg-bg-dark/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-5 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                Merhaba, {user?.firstName}! 👋
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bildirim Butonu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-10 h-10 flex items-center justify-center rounded-xl border transition-all group ${
                  showNotifications
                    ? 'bg-primary/10 border-primary/30 text-primary-light'
                    : 'bg-white/[0.02] border-white/5 text-text-muted hover:text-white hover:bg-white/[0.05]'
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
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white leading-none">{user?.firstName} {user?.lastName}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <p className="text-[10px] text-accent-light font-bold uppercase tracking-wider">
                    Seviye {user?.level || 1} • {user?.totalScore || 0} XP
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-[2px] shadow-lg shadow-primary/20">
                  <div className="w-full h-full bg-bg-dark rounded-[10px] flex items-center justify-center overflow-hidden">
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
        <main className={`flex-1 overflow-hidden relative z-0 ${fullscreen ? 'p-0' : 'overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
