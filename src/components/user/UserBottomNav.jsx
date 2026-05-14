import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, ClipboardList, Home, User, Users } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Ana Sayfa', icon: Home, exact: true },
  { to: '/dashboard/lessons', label: 'Dersler', icon: BookOpen },
  { to: '/dashboard/exams', label: 'Sınavlar', icon: ClipboardList },
  { to: '/dashboard/feed', label: 'Akış', icon: Users },
  { to: '/dashboard/settings', label: 'Profil', icon: User, match: ['/dashboard/settings', '/dashboard/stats', '/dashboard/favorites', '/dashboard/support', '/dashboard/driving-schools'] },
];

const UserBottomNav = () => {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    if (item.match?.some((path) => location.pathname.startsWith(path))) return true;
    return location.pathname.startsWith(item.to);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-bg-card2/95 shadow-[0_-12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden">
      <div className="grid h-16 grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className="group relative flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors"
            >
              <Icon
                className={`h-5 w-5 transition-all ${
                  active
                    ? 'text-accent-light drop-shadow-[0_0_10px_rgba(34,211,238,0.65)]'
                    : 'text-text-muted group-hover:text-white'
                }`}
              />
              <span className={`truncate px-1 ${active ? 'text-accent-light' : 'text-text-muted group-hover:text-white'}`}>
                {item.label}
              </span>
              <span
                className={`absolute bottom-0 h-[3px] rounded-t-full bg-accent-light shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-all duration-300 ${
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

export default UserBottomNav;
