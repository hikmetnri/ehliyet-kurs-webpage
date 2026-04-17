import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import { Menu, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const UserLayout = ({ fullscreen = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex bg-bg-dark min-h-screen text-text-primary overflow-hidden">
      
      <UserSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-bg-card/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-5 sticky top-0 z-10 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-text-muted hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-bg-dark" />
            </button>

            {/* User XP Badge */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-black text-white leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-primary-light font-bold uppercase tracking-wider mt-0.5">
                  Seviye {user?.level || 1} · {user?.totalScore || 0} XP
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-white text-sm shrink-0">
                {user?.firstName?.charAt(0) || 'Ö'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-hidden ${fullscreen ? 'p-0' : 'overflow-y-auto p-5 md:p-8'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
