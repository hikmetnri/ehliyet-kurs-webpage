import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, BookOpen, ClipboardList, BarChart2, 
  MessageCircle, ChevronRight, LogOut, Menu, X, Settings
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Ana Sayfa', exact: true },
  { to: '/dashboard/lessons', icon: BookOpen, label: 'Dersler' },
  { to: '/dashboard/exams', icon: ClipboardList, label: 'Sınav Merkezi' },
  { to: '/dashboard/stats', icon: BarChart2, label: 'İstatistiklerim' },
  { to: '/dashboard/support', icon: MessageCircle, label: 'Destek Talepleri' },
  { to: '/settings', icon: Settings, label: 'Ayarlar' },
];

const UserSidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 h-screen z-30 flex flex-col
        bg-bg-card border-r border-white/5 transition-all duration-300
        ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'}
      `}>
        {/* Logo */}
        <div className={`p-5 border-b border-white/5 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <span className="text-white font-black text-lg">E</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none">
                Ehliyet<span className="text-primary-light">Yolu</span>
              </h1>
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Öğrenci Paneli</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${active
                    ? 'bg-primary/10 text-primary-light border border-primary/20'
                    : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-primary rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
                <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-primary' : ''}`} />
                {!collapsed && <span className="font-semibold text-sm">{item.label}</span>}
                {!collapsed && active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 font-black text-white text-sm">
                {user?.firstName?.charAt(0) || 'Ö'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white leading-none truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-text-muted font-medium mt-0.5 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 text-danger hover:bg-danger/10 rounded-xl transition-colors border border-transparent hover:border-danger/20 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-semibold text-sm">Çıkış Yap</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
