import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNotifications from './AdminNotifications';
import AdminBottomNav from './AdminBottomNav';
import useAuthStore from '../../store/authStore';
import { Search, Menu } from 'lucide-react';

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
];

const getPageLabel = (pathname) => (
  pageLabels.find((item) => pathname.startsWith(item.path)) || {
    title: 'Admin Panel',
    description: 'Operasyon, içerik ve destek yönetimi',
  }
);

const AdminLayout = () => {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageLabel = getPageLabel(pathname);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0b0d12] text-text-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f1118]/90 px-3 backdrop-blur-xl sm:px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button 
              className="lg:hidden rounded-xl border border-white/10 bg-white/[0.03] p-2 text-text-muted transition-colors hover:bg-white/[0.07] hover:text-white"
              onClick={() => setSidebarOpen(true)}
              aria-label="Admin menüsünü aç"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-black text-white sm:text-lg">{pageLabel.title}</h1>
              <p className="hidden truncate text-xs font-medium text-text-muted xl:block">{pageLabel.description}</p>
            </div>
          </div>

          <div className="hidden min-w-[18rem] max-w-md flex-1 items-center rounded-2xl border border-white/10 bg-black/20 px-3.5 py-2.5 transition-colors focus-within:border-primary/40 md:mx-5 md:flex">
            <Search className="mr-2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Kullanıcı, soru veya içerik ara"
              className="w-full border-none bg-transparent text-sm text-white outline-none placeholder-text-muted"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <AdminNotifications />
            
            <Link to="/admin/profile" className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] py-1.5 pl-2 pr-3 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
              <div className="hidden text-right sm:block">
                <p className="max-w-40 truncate text-sm font-bold text-white transition-colors group-hover:text-primary-light">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs font-medium text-text-muted">Admin</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] text-sm font-black text-white">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>{user?.firstName?.charAt(0) || 'A'}</span>
                )}
              </div>
            </Link>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto p-3 pb-24 custom-scrollbar sm:p-4 sm:pb-24 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
        <AdminBottomNav />
        
      </div>
    </div>
  );
};

export default AdminLayout;
