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
  X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NavItem = ({ to, icon, label, isActive, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 ${
      isActive 
      ? 'border-primary/30 bg-primary/15 text-white'
      : 'border-transparent text-text-secondary hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
    }`}
  >
    {isActive && (
      <div className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-md bg-primary" />
    )}
    {React.createElement(icon, {
      className: `h-4 w-4 transition-colors ${isActive ? 'text-primary-light' : 'text-text-muted group-hover:text-white'}`,
    })}
    <span className="truncate font-semibold">{label}</span>
  </Link>
);

const AdminSidebar = ({ isOpen, setIsOpen }) => {
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
        fixed lg:sticky top-0 z-50 flex h-screen w-[min(86vw,260px)] flex-col border-r border-white/10 bg-[#0f1118] transition-transform duration-300 lg:w-[260px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <Link to="/admin" onClick={() => setIsOpen(false)} className="group flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-1.5 transition-all group-hover:border-primary/30 group-hover:bg-primary/5">
            <img
              src="/logo_v2.png"
              alt="Ehliyet Yolu"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black leading-none text-white">
              Ehliyet <span className="text-primary-light">Yolu</span>
            </h1>
            <span className="mt-1 block text-xs font-semibold text-text-muted">
              Admin Panel
            </span>
          </div>
        </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-text-muted transition-colors hover:bg-white/[0.07] hover:text-white lg:hidden"
            aria-label="Admin menüsünü kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 px-3 text-[11px] font-black text-text-muted">{group.title}</p>
              <div className="space-y-1">
                {group.links.map((link) => (
                  <NavItem
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    label={link.label}
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
          className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-danger transition-colors hover:border-danger/20 hover:bg-danger/10"
        >
          <LogOut className="h-4 w-4" />
          Oturumu Kapat
        </button>
      </div>
      
    </aside>
    </>
  );
};

export default AdminSidebar;
