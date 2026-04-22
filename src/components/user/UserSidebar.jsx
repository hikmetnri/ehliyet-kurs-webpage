import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, BookOpen, ClipboardList, BarChart2, 
  MessageCircle, ChevronRight, LogOut, Settings, Star, TriangleAlert
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Ana Sayfa', exact: true },
  { to: '/dashboard/lessons', icon: BookOpen, label: 'Dersler' },
  { to: '/dashboard/exams', icon: ClipboardList, label: 'Sınav Merkezi' },
  { to: '/dashboard/favorites', icon: Star, label: 'Favori Sorular' },
  { to: '/dashboard/stats', icon: BarChart2, label: 'İstatistiklerim' },
  { to: '/dashboard/feed', icon: MessageCircle, label: 'Topluluk' },
  { to: '/dashboard/support', icon: MessageCircle, label: 'Destek Talepleri' },
  { to: '/dashboard/traffic-signs', icon: TriangleAlert, label: 'Trafik İşaretleri' },
  { to: '/dashboard/settings', icon: Settings, label: 'Ayarlar' },
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 h-screen z-50 flex flex-col
        bg-bg-card border-r border-white/5 transition-all duration-300
        ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-24' : 'translate-x-0 w-72 lg:w-72'}
      `}>
        {/* Glow effect back */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] pointer-events-none rounded-full" />

        {/* Logo */}
        <div className={`p-6 border-b border-white/5 flex items-center gap-4 ${collapsed ? 'lg:justify-center' : ''} relative z-10`}>
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] shadow-lg shadow-primary/20">
              <div className="w-full h-full bg-bg-dark rounded-[14px] flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 font-black text-xl">E</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-bg-dark" />
          </div>
          
          <div className={`transition-opacity duration-300 ${collapsed ? 'lg:hidden' : 'block'}`}>
            <h1 className="text-xl font-black text-white tracking-tight leading-none mb-1">
              Ehliyet<span className="text-primary-light">Yolu</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-accent animate-ping" />
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Öğrenci Paneli</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
          <p className={`text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-2 ${collapsed ? 'lg:hidden' : ''}`}>
            Menü
          </p>
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                  ${active
                    ? 'bg-primary/10 text-primary-light border-transparent shadow-[0_4px_20px_rgba(99,102,241,0.1)]'
                    : 'text-text-secondary hover:bg-white/[0.03] hover:text-white border-transparent'
                  }
                  ${collapsed ? 'lg:justify-center lg:px-0 lg:w-14 lg:mx-auto' : ''}
                `}
                title={collapsed ? item.label : ''}
              >
                {active && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
                
                <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`} />
                
                <span className={`font-semibold text-sm transition-opacity duration-300 ${collapsed ? 'lg:hidden' : ''}`}>
                  {item.label}
                </span>

                {active && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-primary opacity-50" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-white/5 space-y-3 relative z-10">
          {!collapsed && (
            <div className="bg-gradient-to-br from-white/[0.05] to-transparent p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-xs font-medium text-text-secondary leading-relaxed relative z-10">
                <span className="text-white font-bold block mb-1">PRO'ya Yüksel</span>
                Tüm testlere sınırsız erişim kazan.
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-4 px-4 py-3.5 text-danger/80 hover:text-danger 
              hover:bg-danger/10 rounded-2xl transition-all duration-300 border border-transparent 
              hover:border-danger/20 group
              ${collapsed ? 'lg:justify-center lg:px-0 lg:w-14 lg:mx-auto' : ''}
            `}
            title={collapsed ? "Çıkış Yap" : ""}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`font-bold text-sm ${collapsed ? 'lg:hidden' : ''}`}>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
