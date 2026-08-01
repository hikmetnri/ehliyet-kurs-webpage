import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNotifications from './AdminNotifications';
import AdminBottomNav from './AdminBottomNav';
import useAuthStore from '../../store/authStore';
import { LayoutDashboard, Menu, Search } from 'lucide-react';

const pageLabels = [
  { path: '/admin/users', title: 'Kullanıcı Yönetimi', description: 'Hesap, yetki ve üyelik işlemleri' },
  { path: '/admin/content', title: 'İçerik Yönetimi', description: 'Dersler, kategoriler ve konu içerikleri' },
  { path: '/admin/exams', title: 'Sınav Merkezi', description: 'Soru bankası ve sınav ayarları' },
  { path: '/admin/support', title: 'Destek Talepleri', description: 'Öğrenci mesajları ve yanıt akışı' },
  { path: '/admin/feed', title: 'Akış Yönetimi', description: 'Topluluk gönderileri ve moderasyon' },
  { path: '/admin/reports', title: 'Rapor Yönetimi', description: 'İşaretlenen içerikler ve kararlar' },
  { path: '/admin/badges', title: 'Rozetler', description: 'Başarı rozetleri ve kural setleri' },
  { path: '/admin/marketing', title: 'Pazarlama', description: 'QR, reklam ve kampanya ayarları' },
  { path: '/admin/driving-schools', title: 'Sürücü Kursları', description: 'Kurs listeleme ve konum yönetimi' },
  { path: '/admin/stats', title: 'İstatistikler', description: 'Kayıt, başarı ve kullanım analitiği' },
  { path: '/admin/profile', title: 'Profilim', description: 'Yönetici hesabı ve güvenlik bilgileri' },
  { path: '/admin/settings', title: 'Yönetim Merkezi', description: 'Sistem ayarları, metinler ve bakım modu' },
  { path: '/admin/notifications', title: 'Bildirim Yönetimi', description: 'Toplu veya hedefli anlık push bildirimleri' },
];

const getPageLabel = (pathname) => (
  pathname === '/admin'
    ? { title: 'Kontrol Merkezi', description: 'Sistem çevrimiçi', dashboard: true }
    : pageLabels.find((item) => pathname.startsWith(item.path)) || {
        title: 'Admin Panel',
        description: 'Operasyon, içerik ve destek yönetimi',
      }
);

const AdminLayout = () => {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
    try {
      localStorage.setItem('admin_sidebar_collapsed', String(collapsed));
    } catch (e) {
      console.warn('Failed to save sidebar collapsed state', e);
    }
  };

  const pageLabel = getPageLabel(pathname);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#080D18] text-[#F4F7FB]">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={handleToggleCollapse}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-2 border-b border-[#243044] bg-[#080D18]/95 px-4 backdrop-blur-xl lg:h-[72px] lg:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3 flex-1">
            <button
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border transition-colors lg:pointer-events-none ${
                pageLabel.dashboard
                  ? 'border-[#7C6CFF] bg-[#7C6CFF] text-white'
                  : 'border-[#243044] bg-[#101725] text-[#8F9BB0] hover:border-[#465672] hover:text-white'
              }`}
              onClick={() => setSidebarOpen(true)}
              aria-label="Admin menüsünü aç"
            >
              {pageLabel.dashboard ? (
                <LayoutDashboard className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-black leading-tight text-[#F4F7FB] lg:text-base">
                {pageLabel.title}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#8F9BB0]">
                {pageLabel.dashboard ? <span className="h-1.5 w-1.5 rounded-full bg-[#42D6C6]" /> : null}
                {pageLabel.description}
              </p>
            </div>
          </div>

          <div className="hidden min-w-0 w-64 shrink-0 items-center rounded-2xl border border-[#243044] bg-[#101725] px-3.5 py-2.5 transition-colors focus-within:border-[#7C6CFF] lg:flex xl:w-80">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[#8F9BB0]" />
            <input
              type="text"
              placeholder="Kullanıcı, soru veya içerik ara"
              className="min-w-0 w-full border-none bg-transparent text-xs font-medium text-[#F4F7FB] outline-none placeholder:text-[#69758A]"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <AdminNotifications />
            
            <Link to="/admin/profile" className="group flex items-center gap-2 rounded-2xl border border-[#243044] bg-[#101725] p-1.5 transition-colors hover:border-[#465672] hover:bg-[#151E2E] sm:pr-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-[#7C6CFF]/15 text-sm font-black text-[#B9B1FF]">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>{user?.firstName?.charAt(0) || 'A'}</span>
                )}
              </div>
              <div className="hidden text-left sm:block min-w-0">
                <p className="max-w-28 truncate text-xs font-bold leading-tight text-[#F4F7FB] transition-colors group-hover:text-[#B9B1FF]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] font-medium text-[#8F9BB0]">Admin</p>
              </div>
            </Link>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto bg-[#080D18] p-4 pb-24 custom-scrollbar sm:pb-24 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
        <AdminBottomNav />
        
      </div>
    </div>
  );
};

export default AdminLayout;
