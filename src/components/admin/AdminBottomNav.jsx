import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Library, ClipboardList, BarChart2, User, FileEdit } from 'lucide-react';

const items = [
  { to: '/admin', label: 'Ana Sayfa', icon: Home, color: '#7C6CFF', exact: true },
  { to: '/admin/content', label: 'İçerik', icon: Library, color: '#42D6C6' },
  { to: '/admin/exams', label: 'Sınavlar', icon: ClipboardList, color: '#FFB85C' },
  { to: '/admin/stats', label: 'İstatistik', icon: BarChart2, color: '#64D98B' },
  { to: '/admin/profile', label: 'Hesap', icon: User, color: '#D585FF' },
];

const AdminBottomNav = () => {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#243044] bg-[#0B1220]/95 backdrop-blur-xl lg:hidden">
      <div className="flex h-[calc(68px+env(safe-area-inset-bottom))] items-center justify-between gap-1.5 px-2 pb-[env(safe-area-inset-bottom)]">
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
                  backgroundColor: active ? `${item.color}18` : 'transparent',
                  borderColor: active ? `${item.color}35` : 'transparent',
                }}
                className={`flex h-[54px] flex-col items-center justify-center rounded-[16px] border transition-all duration-200 ${
                  active ? 'shadow-sm' : 'border-transparent'
                }`}
              >
                <Icon
                  className="h-[19px] w-[19px] transition-colors duration-200"
                  style={{
                    color: active ? item.color : '#627089'
                  }}
                />
                <span
                  className="mt-1 truncate text-[9px] font-extrabold transition-colors duration-200"
                  style={{
                    color: active ? '#F4F7FB' : '#68758C'
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
