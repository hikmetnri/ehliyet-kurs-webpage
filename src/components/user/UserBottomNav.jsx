import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  HelpCircle,
  Home,
  MessagesSquare,
  User,
} from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Ana Sayfa', icon: Home, exact: true },
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
    icon: HelpCircle,
    match: ['/dashboard/exams'],
    tab: 'short_tests',
  },
  { to: '/dashboard/feed', label: 'Akış', icon: MessagesSquare },
  { to: '/dashboard/settings', label: 'Profil', icon: User },
];

const UserBottomNav = () => {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    if (item.tab === 'short_tests') {
      const tab = new URLSearchParams(location.search).get('tab') || 'short_tests';
      return location.pathname === '/dashboard/exams' && ['short_tests', 'general', 'wrong_answers'].includes(tab);
    }
    if (item.tab === 'exam_modes') {
      const tab = new URLSearchParams(location.search).get('tab') || 'short_tests';
      return location.pathname === '/dashboard/exams' && ['real_sim_cat'].includes(tab);
    }
    if (item.match?.some((path) => location.pathname.startsWith(path))) return true;
    return location.pathname.startsWith(item.to);
  };

  return (
    <nav aria-label="Ana gezinme" className="flutter-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-border-color bg-bg-card2/95 shadow-[0_-6px_18px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:hidden">
      <div className="grid h-[calc(70px+env(safe-area-inset-bottom))] grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className="group relative flex min-w-0 flex-col items-center justify-between pt-[5px] text-[10.5px] font-semibold transition-colors"
            >
              <div className="flex flex-col items-center justify-center flex-1">
                <div
                  style={active ? {
                    color: 'var(--mobile-nav-active)',
                    borderColor: 'color-mix(in srgb, var(--mobile-nav-active) 18%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--mobile-nav-active) 18%, transparent)',
                  } : undefined}
                  className={
                    "flex items-center justify-center rounded-2xl transition-all duration-200 " +
                    (active
                      ? "h-[30px] w-11 border shadow-sm"
                      : "h-[30px] w-9 text-text-secondary group-hover:text-text-primary")
                  }
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.6 : 2.0} />
                </div>
                <span
                  style={active ? { color: 'var(--mobile-nav-active)' } : undefined}
                  className={
                    "mt-1 truncate px-1 transition-all duration-200 " +
                    (active
                      ? "text-[11px] font-extrabold"
                      : "font-semibold text-text-secondary group-hover:text-text-primary")
                  }
                >
                  {item.label}
                </span>
              </div>
              <div
                style={active ? { backgroundColor: 'var(--mobile-nav-active)' } : undefined}
                className={
                  "h-[3px] rounded-t-full transition-all duration-300 " +
                  (active ? "w-7 shadow-md" : "w-0")
                }
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default UserBottomNav;
