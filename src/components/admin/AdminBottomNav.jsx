import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Library, ClipboardList, BarChart2, User, FileEdit } from 'lucide-react';

const items = [
  { to: '/admin', label: 'Ana Sayfa', icon: Home, color: '#6C63FF', exact: true },
  { to: '/admin/content', label: 'İçerik', icon: Library, color: '#3ECFCF' },
  { to: '/admin/exams', label: 'Sınavlar', icon: ClipboardList, color: '#FFB74D' },
  { to: '/admin/stats', label: 'İstatistik', icon: BarChart2, color: '#4CAF50' },
  { to: '/admin/profile', label: 'Hesap', icon: User, color: '#E040FB' },
];

const AdminBottomNav = () => {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0f1118]/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between h-[calc(68px+env(safe-area-inset-bottom))] px-3 pb-[env(safe-area-inset-bottom)] gap-2">
        {items.map((item) => {
          const active = isActive(item);
          const Icon = item.icon || FileEdit;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className="flex-1 min-w-0"
            >
              <div
                style={{
                  backgroundColor: active ? `${item.color}24` : 'transparent',
                  borderColor: active ? `${item.color}42` : 'transparent',
                }}
                className={`flex h-14 flex-col items-center justify-center rounded-2xl border transition-all duration-200 ${
                  active ? 'shadow-sm' : 'border-transparent'
                }`}
              >
                <Icon
                  className="h-5 w-5 transition-colors duration-200"
                  style={{
                    color: active ? item.color : 'rgba(255, 255, 255, 0.36)'
                  }}
                />
                <span
                  className="mt-1 truncate text-[9px] font-black uppercase tracking-wider transition-colors duration-200"
                  style={{
                    color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.40)'
                  }}
                >
                  {item.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminBottomNav;
