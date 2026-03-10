import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Award, 
  Zap, 
  Target, 
  Edit2, 
  Save, 
  Camera,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import api from '../../api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [meRes, statsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/exam-results/stats')
      ]);
      
      const userData = meRes.data.data || meRes.data;
      setUser(userData);
      setStats(statsRes.data);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        bio: userData.bio || '',
        phone: userData.phone || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/auth/profile', formData);
      const updatedUser = response.data.data || response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditing(false);
      alert('Profiliniz başarıyla güncellendi!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Güncelleme sırasında bir hata oluştu.');
    }
  };

  if (loading) return <div className="dashboard-container">Yükleniyor...</div>;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: '2rem' }}>Profilim</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
        {/* Left Side - User Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 24px' }}>
              <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid var(--border-subtle)' }}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={64} color="white" />
                )}
              </div>
              <button style={{ position: 'absolute', bottom: 4, right: 4, padding: 10, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                <Camera size={18} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{user?.firstName} {user?.lastName}</h3>
            <p className="text-muted" style={{ marginBottom: 24 }}>{user?.email}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ flex: 1, padding: 12, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{user?.level || 1}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>SEVİYE</div>
              </div>
              <div style={{ flex: 1, padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>{user?.totalScore || 0}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>PUAN</div>
              </div>
            </div>

            {user?.proStatus && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: 'linear-gradient(135deg, #fbbf2433, #fbbf2466)', borderRadius: 12, border: '1px solid #fbbf2488', color: '#fbbf24', fontWeight: 800, fontSize: '0.875rem' }}>
                <Award size={20} /> MachPRO ÜYESİ
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 20 }}>Başarı İstatistikleri</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Zap size={18} className="text-muted" />
                    <span className="text-muted">Toplam Sınav</span>
                 </div>
                 <span style={{ fontWeight: 600 }}>{stats?.totalExams || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Target size={18} className="text-muted" />
                    <span className="text-muted">Doğru Cevap</span>
                 </div>
                 <span style={{ fontWeight: 600 }}>{stats?.totalCorrect || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShieldCheck size={18} className="text-muted" />
                    <span className="text-muted">Kazanılan Sınav</span>
                 </div>
                 <span style={{ fontWeight: 600 }}>{stats?.passedCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form / Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="glass-panel" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
               <h3 style={{ fontSize: '1.25rem' }}>Hesap Bilgileri</h3>
               <button 
                onClick={() => setEditing(!editing)} 
                className="btn-outline" 
                style={{ padding: '8px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border-subtle)' }}
               >
                  {editing ? <><Save size={16} /> İptal</> : <><Edit2 size={16} /> Düzenle</>}
               </button>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div className="input-group">
                    <label className="input-label">Ad</label>
                    <input 
                      className="input-field" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={!editing} 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Soyad</label>
                    <input 
                      className="input-field" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={!editing} 
                    />
                  </div>
               </div>

               <div className="input-group">
                  <label className="input-label">Biyografi</label>
                  <textarea 
                    className="input-field" 
                    style={{ height: 100, resize: 'none' }}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!editing}
                  />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div className="input-group">
                    <label className="input-label">E-posta</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                       <Mail size={18} /> {user?.email}
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Telefon</label>
                    <input 
                      className="input-field" 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!editing} 
                      placeholder="+90 5xx xxx xx xx"
                    />
                  </div>
               </div>

               {editing && (
                 <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
                    Profil Değişikliklerini Kaydet
                 </button>
               )}
            </form>
          </div>

          <div className="glass-panel" style={{ padding: 32 }}>
             <h3 style={{ fontSize: '1.25rem', marginBottom: 24 }}>Hesap Geçmişi</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                   <Calendar className="text-muted" />
                   <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Üyelik Tarihi</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}</div>
                   </div>
                </div>
                {user?.lastActiveAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                    <Zap className="text-muted" />
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Son Aktivite</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(user.lastActiveAt).toLocaleString('tr-TR')}</div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
