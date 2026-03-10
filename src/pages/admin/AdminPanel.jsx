import React, { useState, useEffect } from 'react';
import { Users, BookOpen, AlertCircle, TrendingUp, Search, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import api from '../../api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, exams: 0, questions: 0 });
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Basic parallel fetch for admin stats
      const [uRes, eRes, qRes] = await Promise.all([
        api.get('/users'), // Adjust according to your backend's admin user list endpoint
        api.get('/exams'),
        api.get('/questions') // Used to get total content count
      ]);
      
      const userList = uRes.data?.data || uRes.data || [];
      const examList = eRes.data?.data || eRes.data || [];
      const qList = qRes.data?.data || qRes.data || [];

      setUsers(Array.isArray(userList) ? userList : []);
      setExams(Array.isArray(examList) ? examList : []);
      
      setStats({
        users: Array.isArray(userList) ? userList.length : 0,
        exams: Array.isArray(examList) ? examList.length : 0,
        questions: qList.length ? qList.length : (qList.total || 0)
      });
    } catch (error) {
      console.error("Admin data fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.75rem', marginBottom: 24 }}>Sistem Özeti</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 40 }}>
        
        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: 16, borderRadius: 12 }}>
            <Users size={32} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Toplam Kullanıcı</p>
            <h3 style={{ fontSize: '1.5rem' }}>{stats.users}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', padding: 16, borderRadius: 12 }}>
            <BookOpen size={32} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Aktif Sınav / Test</p>
            <h3 style={{ fontSize: '1.5rem' }}>{stats.exams}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: 16, borderRadius: 12 }}>
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Soru Havuzu</p>
            <h3 style={{ fontSize: '1.5rem' }}>{stats.questions}</h3>
          </div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
          Son Kayıt Olan Kullanıcılar
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 8px' }}>E-Posta</th>
                <th style={{ padding: '12px 8px' }}>İsim</th>
                <th style={{ padding: '12px 8px' }}>Rol</th>
                <th style={{ padding: '12px 8px' }}>Seviye</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((u, i) => (
                <tr key={u._id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px' }}>{u.email}</td>
                  <td style={{ padding: '12px 8px' }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 12, 
                      fontSize: '0.75rem', 
                      background: u.role === 'admin' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: u.role === 'admin' ? '#fbbf24' : 'var(--primary)'
                    }}>
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>Lvl {u.level || 1}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="4" style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--text-muted)' }}>Veri bulunamadı veya yetkiniz yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 90px)' }}>
      {/* Admin Sidebar */}
      <div style={{ width: 250, background: 'var(--bg-card)', borderRight: '1px solid var(--border-subtle)', padding: 24 }}>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Yönetim</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`option-btn ${activeTab === 'dashboard' ? 'selected' : ''}`}
            style={{ padding: '12px 16px', borderRadius: 8 }}
          >
            <TrendingUp size={18} /> Özet
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`option-btn ${activeTab === 'users' ? 'selected' : ''}`}
            style={{ padding: '12px 16px', borderRadius: 8 }}
          >
            <Users size={18} /> Kullanıcılar
          </button>
          <button 
            onClick={() => setActiveTab('exams')}
            className={`option-btn ${activeTab === 'exams' ? 'selected' : ''}`}
            style={{ padding: '12px 16px', borderRadius: 8 }}
          >
            <BookOpen size={18} /> Sınavlar
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`option-btn ${activeTab === 'questions' ? 'selected' : ''}`}
            style={{ padding: '12px 16px', borderRadius: 8 }}
          >
            <AlertCircle size={18} /> Soru Havuzu
          </button>
        </div>
      </div>

      {/* Admin Content Area */}
      <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 100 }}>Yükleniyor...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && <div className="animate-fade-in"><h2>Kullanıcı Yönetimi</h2><p className="text-muted" style={{marginTop: 16}}>Gelişmiş kullanıcı yönetimi (Mobil ile eşzamanlı) buraya eklenecektir.</p></div>}
            {activeTab === 'exams' && <div className="animate-fade-in"><h2>Sınav Yönetimi</h2><p className="text-muted" style={{marginTop: 16}}>{exams.length} adet sınav listelendi.</p></div>}
            {activeTab === 'questions' && <div className="animate-fade-in"><h2>Soru Havuzu</h2><p className="text-muted" style={{marginTop: 16}}>Soruları düzenleme modülü yapım aşamasında.</p></div>}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
