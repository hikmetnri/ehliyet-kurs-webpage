import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Library, 
  FileEdit, 
  BarChart, 
  Settings, 
  LogOut,
  Users,
  MessageCircle,
  Share2,
  ShieldAlert,
  Award,
  QrCode,
  UserCircle,
  MapPinned,
  X,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NavItem = ({ to, icon, label, isActive, onClick, isCollapsed }) => (
  <Link 
    to={to} 
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={`group relative flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl border transition-all duration-200 ${
      isActive 
      ? 'border-primary/30 bg-primary/15 text-white'
      : 'border-transparent text-text-secondary hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
    }`}
  >
    {isActive && (
      <div className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-md bg-primary" />
    )}
    {React.createElement(icon, {
      className: `h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-primary-light' : 'text-text-muted group-hover:text-white'}`,
    })}
    {!isCollapsed && <span className="truncate font-semibold">{label}</span>}
  </Link>
);

const AdminSidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { pathname } = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const navGroups = [
    {
      title: 'Genel',
      links: [
        { to: '/admin', icon: LayoutDashboard, label: 'Ana Sayfa' },
        { to: '/admin/stats', icon: BarChart, label: 'İstatistikler' },
      ],
    },
    {
      title: 'Operasyon',
      links: [
        { to: '/admin/users', icon: Users, label: 'Kullanıcı Yönetimi' },
        { to: '/admin/notifications', icon: Bell, label: 'Bildirim Yönetimi' },
        { to: '/admin/support', icon: MessageCircle, label: 'Destek Talepleri' },
        { to: '/admin/feed', icon: Share2, label: 'Akış Yönetimi' },
        { to: '/admin/reports', icon: ShieldAlert, label: 'Rapor Yönetimi' },
      ],
    },
    {
      title: 'İçerik',
      links: [
        { to: '/admin/content', icon: Library, label: 'İçerik Yönetimi' },
        { to: '/admin/exams', icon: FileEdit, label: 'Sınav Merkezi' },
        { to: '/admin/badges', icon: Award, label: 'Rozetler' },
        { to: '/admin/driving-schools', icon: MapPinned, label: 'Sürücü Kursları' },
      ],
    },
    {
      title: 'Sistem',
      links: [
        { to: '/admin/marketing', icon: QrCode, label: 'Pazarlama' },
        { to: '/admin/profile', icon: UserCircle, label: 'Profilim' },
        { to: '/admin/settings', icon: Settings, label: 'Yönetim Merkezi' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 z-50 flex h-screen flex-col border-r border-white/10 bg-[#0f1118] transition-[width,transform] duration-300 ease-in-out
        w-[260px]
        ${isCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px]'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      
        {/* Toggle Collapse Button for Desktop */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute top-5 -right-3.5 z-50 h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0f1118] text-text-muted shadow-md hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className={`border-b border-white/10 p-4 ${isCollapsed ? 'flex justify-center h-16' : ''}`}>
          <div className="flex items-center justify-between gap-3 min-w-0 w-full">
            <Link to="/admin" onClick={() => setIsOpen(false)} className={`group flex min-w-0 items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-1.5 transition-all group-hover:border-primary/30 group-hover:bg-primary/5">
                <img
                  src="/logo_v2.png"
                  alt="Ehliyet Yolu"
                  className="h-full w-full object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-black leading-none text-white">
                    Ehliyet <span className="text-primary-light">Yolu</span>
                  </h1>
                  <span className="mt-1 block text-xs font-semibold text-text-muted">
                    Admin Panel
                  </span>
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-text-muted transition-colors hover:bg-white/[0.07] hover:text-white lg:hidden"
                aria-label="Admin menüsünü kapat"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="space-y-4">
            {navGroups.map((group, idx) => (
              <div key={group.title}>
                {!isCollapsed ? (
                  <p className="mb-1.5 px-3 text-[11px] font-black text-text-muted uppercase tracking-wider">{group.title}</p>
                ) : (
                  idx > 0 && <div className="my-2.5 border-t border-white/5" />
                )}
                <div className="space-y-1">
                  {group.links.map((link) => (
                    <NavItem
                      key={link.to}
                      to={link.to}
                      icon={link.icon}
                      label={link.label}
                      isCollapsed={isCollapsed}
                      isActive={pathname === link.to || (link.to !== '/admin' && pathname.startsWith(link.to))}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 p-3">
          <button 
            onClick={logout}
            title={isCollapsed ? "Oturumu Kapat" : undefined}
            className={`flex w-full items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl border border-transparent text-sm font-semibold text-danger transition-colors hover:border-danger/20 hover:bg-danger/10 cursor-pointer`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Oturumu Kapat</span>}
          </button>
        </div>
      
      </aside>
    </>
  );
};

export default AdminSidebar;
