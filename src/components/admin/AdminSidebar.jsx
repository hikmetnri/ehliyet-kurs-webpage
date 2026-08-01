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
    title={label}
    className={`group relative flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl border transition-all duration-200 ${
      isActive
      ? 'border-[#7C6CFF]/35 bg-[#7C6CFF]/15 text-white'
      : 'border-transparent text-[#AAB5C7] hover:border-[#243044] hover:bg-[#151E2E] hover:text-white'
    }`}
  >
    {isActive && (
      <div className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-md bg-[#7C6CFF]" />
    )}
    {React.createElement(icon, {
      className: `h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-[#AFA5FF]' : 'text-[#78869D] group-hover:text-white'}`,
    })}
    {!isCollapsed && <span className="truncate text-sm font-semibold min-w-0">{label}</span>}
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
        fixed lg:sticky top-0 z-50 flex h-screen flex-col border-r border-[#243044] bg-[#0D1422] transition-[width,transform] duration-300 ease-in-out
        w-[260px]
        ${isCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px]'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      
        {/* Toggle Collapse Button for Desktop */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-5 z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-[#243044] bg-[#101725] text-[#8F9BB0] shadow-md transition-all hover:border-[#465672] hover:text-white lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className={`border-b border-[#243044] p-4 ${isCollapsed ? 'flex justify-center h-[72px]' : ''}`}>
          <div className="flex items-center justify-between gap-3 min-w-0 w-full">
            <Link to="/admin" onClick={() => setIsOpen(false)} className={`group flex min-w-0 items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[#243044] bg-[#151E2E] p-1.5 transition-all group-hover:border-[#7C6CFF]/40 group-hover:bg-[#7C6CFF]/10">
                <img
                  src="/logo_v2.png"
                  alt="Ehliyet Yolu"
                  className="h-full w-full object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-black leading-none text-white">
                    Ehliyet <span className="text-[#AFA5FF]">Yolu</span>
                  </h1>
                  <span className="mt-1 block text-xs font-semibold text-[#8F9BB0]">
                    Admin Panel
                  </span>
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-[#243044] bg-[#151E2E] p-2 text-[#8F9BB0] transition-colors hover:border-[#465672] hover:text-white lg:hidden"
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
                  <p className="mb-1.5 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#69758A]">{group.title}</p>
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

        <div className="border-t border-[#243044] p-3">
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
