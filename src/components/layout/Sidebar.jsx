import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  Star, 
  XCircle, 
  Video, 
  User,
  Settings,
  Trophy,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Topluluk Akışı', path: '/feed', icon: <MessageSquare size={20} /> },
    { name: 'Dersler & Konular', path: '/lessons', icon: <BookOpen size={20} /> },
    { name: 'Video Eğitimler', path: '/videos', icon: <Video size={20} /> },
    { name: 'Favorilerim', path: '/favorites', icon: <Star size={20} /> },
    { name: 'Yanlışlarım', path: '/mistakes', icon: <XCircle size={20} /> },
    { name: 'Liderlik', path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: 'Profil', path: '/profile', icon: <User size={20} /> },
  ];

  if (user && user.role === 'admin') {
    menuItems.push({ name: 'Admin Paneli', path: '/admin', icon: <ShieldCheck size={20} color="#fbbf24" /> });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar fixed-sidebar">
      <div className="sidebar-header">
        <Link to="/" className="nav-brand no-margin">
           <img src="/vite.svg" alt="logo" style={{ width: 32 }} />
           <span>Ehliyet Yolu</span>
        </Link>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
              {isActive(item.path) && <div className="active-dot" />}
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-mini-card glass-panel">
            <div className="avatar-small">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" />
              ) : (
                <User size={16} />
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.firstName || 'Kullanıcı'}</span>
              <span className="user-role">{user?.proStatus ? '✨ Pro Üye' : 'Standart'}</span>
            </div>
            <Link to="/settings" className="settings-btn">
              <Settings size={18} />
            </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
