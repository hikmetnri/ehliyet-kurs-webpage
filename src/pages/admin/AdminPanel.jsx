import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare, 
  User as UserIcon,
  ShieldCheck,
  Trash2,
  ExternalLink,
  ChevronRight,
  Bell,
  FileQuestion,
  Search,
  Copy,
  BarChart2,
  CheckCircle,
  X
} from 'lucide-react';
import api from '../../api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, exams: 0, questions: 0 });
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifForm, setNotifForm] = useState({ title: '', body: '' });
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'questions' && questions.length === 0) {
      fetchQuestions();
    }
  }, [activeTab]);

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
      setQuestions(Array.isArray(qList) ? qList : []);
      setPosts(Array.isArray(postList) ? postList : []);
      
      setStats({
        users: Array.isArray(userList) ? userList.length : 0,
        exams: Array.isArray(examList) ? examList.length : 0,
        questions: Array.isArray(qList) ? qList.length : (qList.total || 0)
      });
    } catch (error) {
      console.error("Admin data fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions');
      const qList = res.data?.data || res.data || [];
      setQuestions(Array.isArray(qList) ? qList : []);
    } catch (err) {
      console.error('Questions fetch error:', err);
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
    if (!window.confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Kullanıcı silinemedi.');
    }
  };

  const handleDuplicateQuestion = async (questionId) => {
    try {
      await api.post(`/questions/${questionId}/duplicate`);
      fetchQuestions();
      alert('Soru başarıyla kopyalandı!');
    } catch (err) {
      alert('Soru kopyalanırken hata oluştu.');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/questions/${questionId}`);
      setQuestions(questions.filter(q => q._id !== questionId));
    } catch (err) {
      alert('Soru silinemedi.');
    }
  };

  // ─── Render: Dashboard ──────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.75rem', marginBottom: 24 }}>Sistem Özeti</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 40 }}>
        {[
          { label: 'Toplam Kullanıcı', value: stats.users, icon: <Users size={32} />, color: 'var(--primary)', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Aktif Sınav', value: stats.exams, icon: <BookOpen size={32} />, color: 'var(--secondary)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Soru Havuzu', value: stats.questions, icon: <FileQuestion size={32} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Onay Bekleyen', value: posts.length, icon: <MessageSquare size={32} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: bg, color, padding: 14, borderRadius: 12 }}>{icon}</div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>{label}</p>
              <h3 style={{ fontSize: '1.5rem' }}>{value}</h3>
            </div>
          </div>
        ))}
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
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12, background: u.role === 'admin' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)', color: u.role === 'admin' ? 'var(--primary)' : 'inherit' }}>
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
            <button onClick={() => setActiveTab('posts')} className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Gönderileri Yönet <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Render: Users ──────────────────────────────────────────────────────────
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
                  <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'white', padding: '4px 8px', borderRadius: 4 }}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: 16, textAlign: 'center' }}>
                  <button
                    onClick={() => handleProToggle(u._id)}
                    style={{ background: u.proStatus ? 'rgba(251,191,36,0.1)' : 'transparent', border: '1px solid', borderColor: u.proStatus ? '#fbbf24' : 'var(--border-subtle)', color: u.proStatus ? '#fbbf24' : 'var(--text-muted)', padding: '4px 12px', borderRadius: 12, fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    {u.proStatus ? 'PRO' : 'Standart'}
                  </button>
                </td>
                <td style={{ padding: 16, textAlign: 'right' }}>
                  <button onClick={() => handleUserDelete(u._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Kullanıcıyı Sil">
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

  // ─── Render: Exams ──────────────────────────────────────────────────────────
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
            <button onClick={() => window.open(`/exam/${exam._id}`, '_blank')} style={{ padding: 8, background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              <ExternalLink size={18} />
            </button>
          </div>
        ))}
        {exams.length === 0 && <p className="text-muted">Aktif sınav bulunamadı.</p>}
      </div>
    </div>
  );

  // ─── Render: Questions ──────────────────────────────────────────────────────
  const renderQuestions = () => {
    const filtered = questions.filter(q =>
      !questionSearch || q.text?.toLowerCase().includes(questionSearch.toLowerCase())
    );

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2>Soru Yönetimi ({questions.length} soru)</h2>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            placeholder="Soru metni ile ara..."
            style={{ paddingLeft: 44 }}
            value={questionSearch}
            onChange={(e) => setQuestionSearch(e.target.value)}
          />
          {questionSearch && (
            <button onClick={() => setQuestionSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.slice(0, 50).map((q, idx) => {
            const successRate = q.stats ? Math.round((q.stats.correct / q.stats.total) * 100) : null;
            return (
              <div key={q._id || idx} className="glass-panel" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <p style={{ flex: 1, lineHeight: 1.5, fontSize: '0.95rem', paddingRight: 16 }}>
                    {q.text?.substring(0, 150)}{q.text?.length > 150 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleDuplicateQuestion(q._id)}
                      title="Soruyu Kopyala"
                      style={{ padding: 8, background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      title="Soruyu Sil"
                      style={{ padding: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {q.category && (
                    <span style={{ fontSize: '0.75rem', padding: '3px 10px', background: 'rgba(168,85,247,0.1)', color: '#a855f7', borderRadius: 12, fontWeight: 600 }}>
                      {typeof q.category === 'string' ? q.category : q.category?.name || 'Kategorisiz'}
                    </span>
                  )}
                  {q.difficulty && (
                    <span style={{
                      fontSize: '0.75rem', padding: '3px 10px', borderRadius: 12, fontWeight: 600,
                      background: q.difficulty === 'easy' ? 'rgba(16,185,129,0.1)' : q.difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                      color: q.difficulty === 'easy' ? 'var(--secondary)' : q.difficulty === 'hard' ? '#ef4444' : '#fbbf24'
                    }}>
                      {q.difficulty === 'easy' ? '🟢 Kolay' : q.difficulty === 'hard' ? '🔴 Zor' : '🟡 Orta'}
                    </span>
                  )}
                  {q.stats?.total > 0 && (
                    <span style={{ fontSize: '0.75rem', padding: '3px 10px', background: 'rgba(59,130,246,0.08)', borderRadius: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BarChart2 size={12} /> {q.stats.total} kez çözüldü
                    </span>
                  )}
                  {successRate !== null && (
                    <span style={{ fontSize: '0.75rem', padding: '3px 10px', background: successRate >= 60 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 12, color: successRate >= 60 ? 'var(--secondary)' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                      <CheckCircle size={12} /> %{successRate} başarı
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="glass-panel text-center" style={{ padding: '60px 40px' }}>
              <FileQuestion size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p className="text-muted">Aramanızla eşleşen soru bulunamadı.</p>
            </div>
          )}
          {filtered.length > 50 && (
            <p className="text-muted" style={{ textAlign: 'center' }}>İlk 50 sonuç gösteriliyor. Aramayı daraltın.</p>
          )}
        </div>
      </div>
    );
  };

  // ─── Render: Posts ──────────────────────────────────────────────────────────
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
                  onClick={async () => { await api.patch(`/posts/${post._id}/approve`); setPosts(posts.filter(p => p._id !== post._id)); }}
                  className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <CheckCircle size={14} /> Onayla
                </button>
                <button
                  onClick={async () => { if (window.confirm('Reddetmek istediğinize emin misiniz?')) { await api.patch(`/posts/${post._id}/reject`); setPosts(posts.filter(p => p._id !== post._id)); } }}
                  className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <X size={14} /> Reddet
                </button>
              </div>
            </div>
            <p style={{ marginBottom: post.media ? 16 : 0, lineHeight: 1.5 }}>{post.content}</p>
            {post.media && <img src={post.media} alt="post" style={{ width: '100%', borderRadius: 12, maxHeight: 400, objectFit: 'cover', marginTop: 12 }} />}
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

  // ─── Render: Notifications ──────────────────────────────────────────────────
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
          Buradan yazacağınız mesaj tüm kayıtlı kullanıcıların cihazlarına bildirim olarak gidecektir.
        </p>
        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Duyuru Başlığı</label>
            <input className="input-field" placeholder="Örn: Yeni Sınav Havuzu Eklendi!" value={notifForm.title} onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Duyuru Metni</label>
            <textarea className="input-field" placeholder="Kullanıcılara iletmek istediğiniz mesaj..." style={{ minHeight: 120, resize: 'none' }} value={notifForm.body} onChange={e => setNotifForm({ ...notifForm, body: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={sendingNotif}>
            {sendingNotif ? 'Gönderiliyor...' : <><Bell size={18} /> Duyuruyu Yayınla</>}
          </button>
        </form>
      </div>
    </div>
  );

  // ─── Sidebar tabs ───────────────────────────────────────────────────────────
  const tabs = [
    { key: 'dashboard', label: 'Özet', icon: <TrendingUp size={18} /> },
    { key: 'users', label: 'Kullanıcılar', icon: <Users size={18} /> },
    { key: 'exams', label: 'Sınavlar', icon: <BookOpen size={18} /> },
    { key: 'questions', label: 'Sorular', icon: <FileQuestion size={18} /> },
    { key: 'posts', label: 'Topluluk', icon: <MessageSquare size={18} />, badge: posts.length },
    { key: 'notifications', label: 'Duyurular', icon: <Bell size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 90px)' }}>
      {/* Admin Sidebar */}
      <div style={{ width: 240, background: 'var(--bg-card)', borderRight: '1px solid var(--border-subtle)', padding: 24, flexShrink: 0 }}>
        <div style={{ paddingBottom: 24, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
          <h4 style={{ color: 'var(--primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} /> Yönetim Paneli
          </h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map(({ key, label, icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`sidebar-link ${activeTab === key ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', justifyContent: 'flex-start' }}
            >
              <span style={{ marginRight: 10 }}>{icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              {badge > 0 && (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
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
            {activeTab === 'questions' && renderQuestions()}
            {activeTab === 'posts' && renderPosts()}
            {activeTab === 'notifications' && renderNotifications()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
