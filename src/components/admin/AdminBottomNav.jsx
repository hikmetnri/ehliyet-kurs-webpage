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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-[#0D1128]/95 shadow-[0_-8px_24px_rgba(0,0,0,0.38)] backdrop-blur-xl lg:hidden">
      <div className="flex h-[calc(74px+env(safe-area-inset-bottom))] items-center justify-between gap-1.5 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
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
                className={`flex h-[58px] flex-col items-center justify-center rounded-[18px] border transition-all duration-200 ${
                  active ? 'shadow-sm' : 'border-transparent'
                }`}
              >
                <Icon
                  className={`transition-all duration-200 ${active ? 'h-[22px] w-[22px]' : 'h-[21px] w-[21px]'}`}
                  style={{
                    color: active ? item.color : 'rgba(255,255,255,0.36)'
                  }}
                />
                <span
                  className="mt-[5px] truncate text-[10px] font-extrabold transition-colors duration-200"
                  style={{
                    color: active ? item.color : 'rgba(255,255,255,0.36)'
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
