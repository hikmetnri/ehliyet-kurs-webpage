import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ClipboardCheck,
  Home,
  PenTool,
  User,
  Users,
} from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Ana Sayfa', icon: Home, exact: true },
  {
    to: '/dashboard/exams?tab=short_tests',
    label: 'Sorular',
    icon: PenTool,
    match: ['/dashboard/exams'],
    tab: 'short_tests',
  },
  {
    to: '/dashboard/exams?tab=real_sim_cat',
    label: 'Sınavlar',
    icon: ClipboardCheck,
    match: ['/dashboard/exams'],
    tab: 'exam_modes',
  },
  { to: '/dashboard/feed', label: 'Akış', icon: Users },
  {
    to: '/dashboard/settings',
    label: 'Profil',
    icon: User,
    match: [
      '/dashboard/settings',
      '/dashboard/stats',
      '/dashboard/favorites',
      '/dashboard/support',
      '/dashboard/driving-schools',
    ],
  },
];

const UserBottomNav = () => {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    if (item.tab === 'short_tests') {
      const tab = new URLSearchParams(location.search).get('tab') || 'short_tests';
      return location.pathname === '/dashboard/exams' && tab === 'short_tests';
    }
    if (item.tab === 'exam_modes') {
      const tab = new URLSearchParams(location.search).get('tab') || 'short_tests';
      return location.pathname === '/dashboard/exams' && ['general', 'real_sim_cat'].includes(tab);
    }
    if (item.match?.some((path) => location.pathname.startsWith(path))) return true;
    return location.pathname.startsWith(item.to);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#1D2035]/95 shadow-[0_-2px_18px_rgba(0,0,0,0.36)] backdrop-blur-xl lg:hidden">
      <div className="grid h-16 grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className="group relative flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors"
            >
              <Icon
                className={`h-6 w-6 transition-all duration-200 ${
                  active
                    ? 'text-accent-light drop-shadow-[0_0_10px_rgba(62,207,207,0.65)]'
                    : 'text-text-muted group-hover:text-white'
                }`}
                strokeWidth={active ? 2.8 : 2.2}
              />
              <span
                className={`truncate px-1 ${
                  active
                    ? 'font-extrabold text-accent-light'
                    : 'text-text-muted group-hover:text-white'
                }`}
              >
                {item.label}
              </span>
              <span
                className={`absolute bottom-0 h-[3px] rounded-t-full bg-accent-light shadow-[0_0_12px_rgba(62,207,207,0.8)] transition-all duration-300 ${
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
