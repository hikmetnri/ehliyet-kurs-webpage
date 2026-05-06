import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNotifications from './AdminNotifications';
import useAuthStore from '../../store/authStore';
import { Search, Menu } from 'lucide-react';

const AdminLayout = () => {
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-bg-dark min-h-screen text-text-primary overflow-hidden">
      
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 md:h-20 bg-bg-card/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-3 sm:px-4 md:px-8 sticky top-0 z-10">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden md:flex items-center bg-bg-card2 border border-white/5 rounded-xl px-4 py-2 w-96 focus-within:border-primary/50 transition-colors">
              <Search className="w-5 h-5 text-text-muted mr-2" />
            <input 
              type="text" 
              placeholder="Kullanıcı, soru veya içerik ara..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-text-muted"
            />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <AdminNotifications />
            
            <Link to="/admin/profile" className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-white/5 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-primary-light font-medium uppercase tracking-wider">Profili Düzenle</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center p-0.5 group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow">
                <div className="w-full h-full bg-bg-card rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm">{user?.firstName?.charAt(0) || 'A'}</span>
                  )}
                </div>
              </div>
            </Link>
          </div>
          
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 relative custom-scrollbar">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default AdminLayout;
