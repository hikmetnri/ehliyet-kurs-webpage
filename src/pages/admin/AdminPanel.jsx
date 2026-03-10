import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare, 
  User as UserIcon,
  ShieldCheck,
  Star,
  Trash2,
  ExternalLink,
  ChevronRight,
  Settings,
  Bell
} from 'lucide-react';
import api from '../../api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, exams: 0, questions: 0 });
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifForm, setNotifForm] = useState({ title: '', body: '' });
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [uRes, eRes, qRes, pRes] = await Promise.all([
        api.get('/users'),
        api.get('/exams'),
        api.get('/questions'),
        api.get('/posts/admin/pending')
      ]);
      
      const userList = uRes.data?.users || uRes.data?.data || uRes.data || [];
      const examList = eRes.data?.data || eRes.data || [];
      const qList = qRes.data?.data || qRes.data || [];
      const postList = pRes.data?.data || pRes.data || [];

      setUsers(Array.isArray(userList) ? userList : []);
      setExams(Array.isArray(examList) ? examList : []);
      setPosts(Array.isArray(postList) ? postList : []);
      
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Rol güncellenirken hata oluştu.');
    }
  };

  const handleProToggle = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/pro`);
      setUsers(users.map(u => u._id === userId ? { ...u, proStatus: res.data.proStatus } : u));
    } catch (err) {
      alert('Pro durumu güncellenirken hata oluştu.');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Kullanıcı silinemedi.');
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
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Aktif Sınav</p>
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
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Son Kayıtlar</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 8px' }}>E-Posta</th>
                  <th style={{ padding: '12px 8px' }}>İsim</th>
                  <th style={{ padding: '12px 8px' }}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px' }}>{u.email}</td>
                    <td style={{ padding: '12px 8px' }}>{u.firstName} {u.lastName}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12, background: u.role === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)', color: u.role === 'admin' ? 'var(--primary)' : 'inherit' }}>
                        {u.role === 'admin' ? 'Yönetici' : 'Öğrenci'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: 24 }}>
           <h3 style={{ marginBottom: 16 }}>Topluluk Özeti</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Onay Bekleyenler</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{posts.length}</div>
              </div>
              <button 
                onClick={() => setActiveTab('posts')} 
                className="btn btn-outline" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Gönderileri Yönet <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: 24 }}>Kullanıcı Yönetimi</h2>
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: 16, textAlign: 'left' }}>Kullanıcı</th>
              <th style={{ padding: 16, textAlign: 'left' }}>E-Posta</th>
              <th style={{ padding: 16, textAlign: 'center' }}>Rol</th>
              <th style={{ padding: 16, textAlign: 'center' }}>Pro</th>
              <th style={{ padding: 16, textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: 16 }}>{u.firstName} {u.lastName}</td>
                <td style={{ padding: 16 }}>{u.email}</td>
                <td style={{ padding: 16, textAlign: 'center' }}>
                  <select 
                    value={u.role} 
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'white', padding: '4px 8px', borderRadius: 4 }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: 16, textAlign: 'center' }}>
                  <button 
                    onClick={() => handleProToggle(u._id)}
                    style={{ 
                      background: u.proStatus ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                      border: '1px solid',
                      borderColor: u.proStatus ? '#fbbf24' : 'var(--border-subtle)',
                      color: u.proStatus ? '#fbbf24' : 'var(--text-muted)',
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {u.proStatus ? 'PRO' : 'Standart'}
                  </button>
                </td>
                <td style={{ padding: 16, textAlign: 'right' }}>
                   <button 
                    onClick={() => handleUserDelete(u._id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    title="Kullanıcıyı Sil"
                   >
                     <Trash2 size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExams = () => (
    <div className="animate-fade-in">
       <h2 style={{ marginBottom: 24 }}>Sınav Yönetimi</h2>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {exams.map(exam => (
            <div key={exam._id} className="glass-panel" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{exam.name || exam.title}</h4>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{exam.type || 'Deneme Sınavı'} • {exam.duration} Dakika</div>
               </div>
               <button 
                onClick={() => window.open(`/exam/${exam._id}`, '_blank')}
                style={{ padding: 8, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: 8, border: 'none', cursor: 'pointer' }}
               >
                 <ExternalLink size={18} />
               </button>
            </div>
          ))}
          {exams.length === 0 && <p className="text-muted">Aktif sınav bulunamadı.</p>}
       </div>
    </div>
  );

  const renderPosts = () => (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: 24 }}>Topluluk Yönetimi</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.map(post => (
          <div key={post._id} className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={16} color="white" />
                </div>
                <div>
                   <div style={{ fontWeight: 600 }}>{post.user?.firstName} {post.user?.lastName}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleString('tr-TR')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={async () => {
                    await api.patch(`/posts/${post._id}/approve`);
                    setPosts(posts.filter(p => p._id !== post._id));
                  }}
                  className="btn btn-primary" 
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  Onayla
                </button>
                <button 
                  onClick={async () => {
                    if (window.confirm('Reddetmek istediğinize emin misiniz?')) {
                      await api.patch(`/posts/${post._id}/reject`);
                      setPosts(posts.filter(p => p._id !== post._id));
                    }
                  }}
                  className="btn btn-outline" 
                  style={{ padding: '6px 16px', fontSize: '0.85rem', color: '#ef4444' }}
                >
                  Reddet
                </button>
              </div>
            </div>
            <p style={{ marginBottom: post.media ? 16 : 0, lineHeight: 1.5 }}>{post.content}</p>
            {post.media && (
               <img src={post.media} alt="post" style={{ width: '100%', borderRadius: 12, maxHeight: 400, objectFit: 'cover', marginTop: 12 }} />
            )}
          </div>
        ))}
        {posts.length === 0 && (
          <div className="glass-panel text-center" style={{ padding: 40 }}>
            <MessageSquare size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p className="text-muted">Şu an onay bekleyen herhangi bir gönderi bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.body) return;
    setSendingNotif(true);
    try {
      await api.post('/notifications/send-to-all', notifForm);
      alert('Duyuru başarıyla tüm kullanıcılara gönderildi.');
      setNotifForm({ title: '', body: '' });
    } catch (err) {
      alert('Bildirim gönderilirken hata oluştu.');
    } finally {
      setSendingNotif(false);
    }
  };

  const renderNotifications = () => (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: 24 }}>Sistem Bildirimleri</h2>
      <div className="glass-panel" style={{ padding: 32, maxWidth: 600 }}>
        <h3 style={{ marginBottom: 16 }}>Yeni Duyuru Gönder</h3>
        <p className="text-muted" style={{ marginBottom: 24, fontSize: '0.9rem' }}>
          Buradan yazacağınız mesaj tüm kayıtlı kullanıcıların cihazlarına (mobil & web) bildirim olarak gidecektir.
        </p>
        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Duyuru Başlığı</label>
            <input 
              className="input-field" 
              placeholder="Örn: Yeni Sınav Havuzu Eklendi!"
              value={notifForm.title}
              onChange={e => setNotifForm({...notifForm, title: e.target.value})}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Duyuru Metni</label>
            <textarea 
              className="input-field" 
              placeholder="Kullanıcılara iletmek istediğiniz mesaj..."
              style={{ minHeight: 120, resize: 'none' }}
              value={notifForm.body}
              onChange={e => setNotifForm({...notifForm, body: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={sendingNotif}>
            {sendingNotif ? 'Gönderiliyor...' : <>Duyuruyu Yayınla <Bell size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 90px)' }}>
      <div style={{ width: 250, background: 'var(--bg-card)', borderRight: '1px solid var(--border-subtle)', padding: 24 }}>
        <div style={{ paddingBottom: 24, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
           <h4 style={{ color: 'var(--primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={20} /> Yönetim Paneli
           </h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setActiveTab('dashboard')} className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} style={{ width: '100%', border: 'none' }}>
             <TrendingUp size={18} /> Özet
          </button>
          <button onClick={() => setActiveTab('users')} className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`} style={{ width: '100%', border: 'none' }}>
             <Users size={18} /> Kullanıcılar
          </button>
          <button onClick={() => setActiveTab('exams')} className={`sidebar-link ${activeTab === 'exams' ? 'active' : ''}`} style={{ width: '100%', border: 'none' }}>
             <BookOpen size={18} /> Sınavlar
          </button>
          <button onClick={() => setActiveTab('posts')} className={`sidebar-link ${activeTab === 'posts' ? 'active' : ''}`} style={{ width: '100%', border: 'none' }}>
             <MessageSquare size={18} /> Topluluk
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`sidebar-link ${activeTab === 'notifications' ? 'active' : ''}`} style={{ width: '100%', border: 'none' }}>
             <Bell size={18} /> Duyurular
          </button>
        </div>
      </div>
      <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center" style={{ paddingTop: 100 }}>
             <div className="animate-pulse">Veriler hazırlanıyor...</div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'exams' && renderExams()}
            {activeTab === 'posts' && renderPosts()}
            {activeTab === 'notifications' && renderNotifications()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
