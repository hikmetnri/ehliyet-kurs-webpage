import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShieldAlert, LogOut, User } from 'lucide-react';
import api from './api';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExamArea from './pages/ExamArea';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import AdminPanel from './pages/admin/AdminPanel';
import Sidebar from './components/layout/Sidebar';
import Feed from './pages/user/Feed';
import Lessons from './pages/user/Lessons';
import LessonReader from './pages/user/LessonReader';
import Mistakes from './pages/user/Mistakes';
import Videos from './pages/user/Videos';
import Profile from './pages/user/Profile';
import Favorites from './pages/user/Favorites';
import Settings from './pages/user/Settings';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => {
          const freshUser = res.data.data || res.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch(err => {
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        });
    }
  }, [token]);

  const isAdmin = user && user.role === 'admin';
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="navbar" style={{ padding: '20px 8%', maxWidth: 1400, margin: '0 auto', width: '100%', background: 'transparent', borderBottom: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', padding: '16px 32px', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: 24, border: '1px solid var(--border-subtle)', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
        <Link to="/" className="nav-brand">
          <ShieldAlert color="#3b82f6" />
          Ehliyet Yolu
        </Link>
        <div className="nav-links">
          <Link to="/privacy" className="nav-link" style={{ fontSize: '1rem' }}>Gizlilik Politikası</Link>
          <a href="mailto:admin@machacademy.com" className="nav-link" style={{ fontSize: '1rem' }}>İletişim</a>
          
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 16, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 24 }}>
              {isAdmin ? (
                <>
                  <Link to="/admin" className="nav-link" style={{ color: '#fbbf24', fontWeight: 600 }}>Admin Paneli</Link>
                  <Link to="/dashboard" className="nav-link">Sistem Önizleme</Link>
                </>
              ) : (
                <Link to="/dashboard" className="nav-link">Sınav Merkezim</Link>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                   <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</span>
                   <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAdmin ? 'Yönetici' : 'Öğrenci'}</span>
                 </div>
                 {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Profil" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                 ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} color="white" />
                    </div>
                 )}
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px', borderRadius: '50%', marginLeft: 8 }} title="Çıkış Yap">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ marginLeft: 16 }}>
              <User size={18} /> Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <div className="app-container">
        {token && <Sidebar />}
        <div className={token ? 'with-sidebar' : ''}>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/lessons/:id" element={<LessonReader />} />
              <Route path="/mistakes" element={<Mistakes />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={isAdmin ? <AdminPanel /> : <div style={{textAlign: 'center', marginTop: 100, color: 'red'}}>Bu sayfayı görüntüleme yetkiniz yok.</div>} />
              <Route path="/exam/:id" element={<ExamArea />} />
              <Route path="/exam/quick/:id" element={<ExamArea isQuickTest={true} />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
