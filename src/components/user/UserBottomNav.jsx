import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FileQuestion,
  GraduationCap,
  Home,
  Radio,
  User,
} from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Ana Sayfa', icon: Home, exact: true },
  { to: '/dashboard/feed', label: 'Akış', icon: Radio },
  {
    to: '/dashboard/exams?tab=real_sim_cat',
    label: 'Sınavlar',
    icon: GraduationCap,
    match: ['/dashboard/exams'],
    tab: 'exam_modes',
  },
  {
    to: '/dashboard/exams?tab=short_tests',
    label: 'Sorular',
    icon: FileQuestion,
    match: ['/dashboard/exams'],
    tab: 'short_tests',
  },
  { to: '/dashboard/settings', label: 'Profil', icon: User },
];

const UserBottomNav = () => {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    if (item.tab === 'short_tests') {
      const tab = new URLSearchParams(location.search).get('tab') || 'short_tests';
      return location.pathname === '/dashboard/exams' && ['short_tests', 'wrong_answers'].includes(tab);
    }
    if (item.tab === 'exam_modes') {
      const tab = new URLSearchParams(location.search).get('tab') || 'short_tests';
      return location.pathname === '/dashboard/exams' && ['general', 'real_sim_cat'].includes(tab);
    }
    if (item.match?.some((path) => location.pathname.startsWith(path))) return true;
    return location.pathname.startsWith(item.to);
  };

  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#16161f]/95 shadow-[0_-6px_18px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="grid h-[74px] grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className="group relative flex min-w-0 flex-col items-center justify-between pt-1.5 pb-0 text-[10.5px] font-semibold transition-colors"
            >
              <div className="flex flex-col items-center justify-center flex-1">
                <div
                  className={
                    "flex items-center justify-center rounded-2xl transition-all duration-200 " +
                    (active
                      ? "w-11 h-7 bg-accent/15 border border-accent/25 text-accent-light shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "w-9 h-7 text-text-muted group-hover:text-white")
                  }
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.6 : 2.0} />
                </div>
                <span
                  className={
                    "mt-1 truncate px-1 transition-all duration-200 " +
                    (active
                      ? "font-extrabold text-accent-light text-[11px]"
                      : "text-text-muted group-hover:text-white font-medium")
                  }
                >
                  {item.label}
                </span>
              </div>
              <div
                className={
                  "h-[3px] rounded-t-full bg-accent transition-all duration-300 " +
                  (active ? "w-7 shadow-[0_0_10px_rgba(6,182,212,0.8)]" : "w-0")
                }
              />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default UserBottomNav;
