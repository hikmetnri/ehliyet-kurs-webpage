import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Library, 
  FileEdit, 
  BarChart, 
  Settings, 
  LogOut,
  Users,
  MessageCircle,
  Share2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
      isActive 
      ? 'bg-primary/10 text-primary-light border border-primary/20' 
      : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
    }`}
  >
    {isActive && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
    )}
    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
    <span className="font-medium">{label}</span>
  </Link>
);

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const navLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Ana Sayfa' },
    { to: '/admin/users', icon: Users, label: 'Kullanıcı Yönetimi' },
    { to: '/admin/content', icon: Library, label: 'İçerik Yönetimi' },
    { to: '/admin/exams', icon: FileEdit, label: 'Sınav Merkezi' },
    { to: '/admin/support', icon: MessageCircle, label: 'Destek Talepleri' },
    { to: '/admin/feed', icon: Share2, label: 'Akış Yönetimi' },
    { to: '/admin/stats', icon: BarChart, label: 'İstatistikler' },
    { to: '/admin/settings', icon: Settings, label: 'Yönetim Merkezi' },
  ];

  return (
    <aside className="w-72 bg-bg-card border-r border-white/5 h-screen flex flex-col sticky top-0">
      
      {/* Logo Area */}
      <div className="p-6 pb-8 border-b border-white/5">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 p-2">
            <img src="/logo.png" alt="Ehliyet Yolu" className="w-full h-full object-contain filter drop-shadow-md brightness-200 contrast-200 invert" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">Ehliyet<span className="text-primary-light">Yolu</span></h1>
            <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {navLinks.map((link) => (
          <NavItem 
            key={link.to} 
            to={link.to} 
            icon={link.icon} 
            label={link.label} 
            isActive={pathname === link.to || (link.to !== '/admin' && pathname.startsWith(link.to))} 
          />
        ))}
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-danger/10 rounded-xl transition-colors font-medium border border-transparent hover:border-danger/20"
        >
          <LogOut className="w-5 h-5" />
          Oturumu Kapat
        </button>
      </div>
      
    </aside>
  );
};

export default AdminSidebar;
