import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FileEdit, Home, Library, MessageCircle, Settings, Users } from 'lucide-react';

const items = [
  { to: '/admin', label: 'Ana', icon: Home, exact: true },
  { to: '/admin/users', label: 'Kullanıcı', icon: Users },
  { to: '/admin/content', label: 'İçerik', icon: Library },
  { to: '/admin/support', label: 'Destek', icon: MessageCircle, match: ['/admin/support', '/admin/reports', '/admin/feed'] },
  { to: '/admin/settings', label: 'Yönetim', icon: Settings, match: ['/admin/settings', '/admin/stats', '/admin/exams', '/admin/badges', '/admin/marketing', '/admin/driving-schools', '/admin/profile'] },
];

const AdminBottomNav = () => {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    if (item.match?.some((path) => location.pathname.startsWith(path))) return true;
    return location.pathname.startsWith(item.to);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0f1118]/95 backdrop-blur-xl lg:hidden">
      <div className="grid h-[calc(64px+env(safe-area-inset-bottom))] grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = isActive(item);
          const Icon = item.icon || FileEdit;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className="group relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-bold transition-colors"
            >
              <Icon
                className={`h-5 w-5 transition-all ${
                  active
                    ? 'text-primary-light'
                    : 'text-text-muted group-hover:text-white'
                }`}
              />
              <span className={`truncate px-1 ${active ? 'text-primary-light' : 'text-text-muted group-hover:text-white'}`}>
                {item.label}
              </span>
              <span
                className={`absolute bottom-0 h-[3px] rounded-t-full bg-primary-light transition-all duration-300 ${
                  active ? 'w-7' : 'w-0'
                }`}
              />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminBottomNav;
