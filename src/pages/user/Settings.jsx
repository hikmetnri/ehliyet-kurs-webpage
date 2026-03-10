import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Moon, 
  Smartphone, 
  ShieldCheck, 
  Trash2,
  ChevronRight,
  Save
} from 'lucide-react';
import api from '../../api';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Yeni şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setSuccess('Şifreniz başarıyla güncellendi.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Ayarlar</h2>
          <p className="text-muted">Hesap güvenliğinizi ve uygulama tercihlerinizi yönetin.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* Security / Password */}
        <div className="glass-panel" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: 10, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: 12 }}>
              <Lock size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Şifre İşlemleri</h3>
          </div>

          <form onSubmit={handlePasswordChange}>
            {error && <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 12, marginBottom: 16, fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', borderRadius: 12, marginBottom: 16, fontSize: '0.9rem' }}>{success}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mevcut Şifre</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Yeni Şifre</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Yeni Şifre (Tekrar)</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                {loading ? 'Güncelleniyor...' : <>Şifreyi Güncelle <Save size={18} /></>}
              </button>
            </div>
          </form>
        </div>

        {/* Other Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Preferences */}
          <div className="glass-panel" style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 10, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: 12 }}>
                <SettingsIcon size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Uygulama Tercihleri</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Bell size={20} className="text-muted" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Bildirimler</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sınav hatırlatmaları ve duyurular</div>
                  </div>
                </div>
                {/* Simulated Switch */}
                <div style={{ width: 44, height: 24, borderRadius: 12, background: 'var(--primary)', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', right: 2, top: 2 }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ShieldCheck size={20} className="text-muted" />
                  <div>
                    <div style={{ fontWeight: 600 }}>İki Faktörlü Doğrulama</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hesabınızı daha güvenli hale getirin</div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted" />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-panel" style={{ padding: 32, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 10, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 12 }}>
                <Trash2 size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#ef4444' }}>Tehlikeli Bölge</h3>
            </div>
            
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 20 }}>Hesabınızı silmek tüm verilerinizin kalıcı olarak kaybolmasına neden olur.</p>
            <button 
              onClick={async () => {
                if (window.confirm('Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
                  try {
                    await api.delete('/auth/me');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  } catch (err) {
                    alert('Hesap silinirken bir hata oluştu.');
                  }
                }
              }}
              className="btn btn-outline" 
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', width: '100%' }}
            >
              Hesabımı Kalıcı Olarak Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
