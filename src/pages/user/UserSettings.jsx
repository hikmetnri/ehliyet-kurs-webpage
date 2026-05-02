import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Bell, Camera, Loader2, Save, AlertCircle, CheckCircle2, ShieldAlert
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api';

const UserSettings = () => {
  const { user, setAuth, token } = useAuthStore();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Tab 1: Profile
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  // Tab 2: Account (Password)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Tab 3: Notifications
  const [notifData, setNotifData] = useState({
    notifEnabled: user?.notifEnabled ?? true,
    dailyGoal: user?.dailyGoal || 20,
    notifHour: user?.notifHour || 20,
    notifMinute: user?.notifMinute || 0,
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotifChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotifData({ ...notifData, [name]: type === 'checkbox' ? checked : value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setAuth({ ...user, ...res.data.user }, token);
        showMessage('success', 'Profil bilgileriniz başarıyla güncellendi.');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Profil güncellenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showMessage('error', 'Yeni şifreler eşleşmiyor.');
    }
    if (passwordData.newPassword.length < 6) {
      return showMessage('error', 'Yeni şifre en az 6 karakter olmalıdır.');
    }
    setLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        showMessage('success', 'Şifreniz başarıyla değiştirildi.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Şifre değiştirilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setAuth({ ...user, avatarUrl: res.data.avatarUrl }, token);
        showMessage('success', 'Profil fotoğrafı başarıyla güncellendi.');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Fotoğraf yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profil Bilgileri' },
    { id: 'account', icon: Lock, label: 'Hesap Güvenliği' },
    { id: 'notifications', icon: Bell, label: 'Tercihler' },
  ];

  return (
    <div className="space-y-8 pb-24 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-3 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(99,102,241,0.6)]"></div>
          <div>
            <h2 className="text-3xl font-black tracking-tight italic">Ayarlar</h2>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">
              Hesap detaylarını ve tercihlerini yönet
            </p>
          </div>
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="font-medium text-sm">{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 font-bold ${
                activeTab === tab.id 
                ? 'bg-primary/20 text-primary-light border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white border border-transparent'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-light' : 'opacity-50'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
                <h3 className="text-2xl font-black mb-8 relative z-10">Kişisel Bilgiler</h3>
                
                <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-primary/50 transition-colors relative z-10 bg-bg-dark">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                            <User className="w-12 h-12 text-primary-light" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full border-4 border-bg-card flex items-center justify-center z-20 shadow-lg">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                    />
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Tıkla ve Değiştir<br/>(Max 5MB)</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={saveProfile} className="flex-1 space-y-6 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Adınız</label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5"
                          placeholder="Adınız"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Soyadınız</label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5"
                          placeholder="Soyadınız"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Telefon</label>
                      <input
                        type="text"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5"
                        placeholder="555 555 55 55"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Hakkımda</label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows={4}
                        className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5 resize-none"
                        placeholder="Kendinizden kısaca bahsedin..."
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Değişiklikleri Kaydet
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none rounded-full" />
                <h3 className="text-2xl font-black mb-8 relative z-10 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-accent" />
                  Güvenlik & Şifre
                </h3>

                <div className="mb-10 bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">E-Posta Adresi</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div className="px-3 py-1 bg-success/20 text-success text-[10px] font-black uppercase tracking-widest rounded-full border border-success/30">
                    Doğrulandı
                  </div>
                </div>

                <form onSubmit={savePassword} className="space-y-6 max-w-lg relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Mevcut Şifre</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field bg-white/5 border-white/10 focus:border-accent focus:bg-accent/5"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Yeni Şifre</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field bg-white/5 border-white/10 focus:border-accent focus:bg-accent/5"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Yeni Şifre (Tekrar)</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field bg-white/5 border-white/10 focus:border-accent focus:bg-accent/5"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex justify-start pt-4">
                    <button type="submit" disabled={loading} className="btn-primary bg-gradient-to-r from-accent to-accent-light shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center gap-2">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                      Şifreyi Güncelle
                    </button>
                  </div>
                </form>
                
                {/* Hesabı Silme Alanı */}
                <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
                  <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-danger/20 rounded-full flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6 text-danger" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">Hesabımı Kalıcı Olarak Sil</h4>
                        <p className="text-sm text-text-muted">Silme işlemi resmi hesap silme sayfasından yapılır. Tüm adımları ve e-posta alternatifini orada görebilirsiniz.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/delete-account')}
                      className="px-6 py-3 bg-danger hover:bg-red-600 text-white font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 text-sm"
                    >
                      Hesap Silme Sayfasına Git
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 blur-[100px] pointer-events-none rounded-full" />
                 <h3 className="text-2xl font-black mb-8 relative z-10 flex items-center gap-3">
                   <Bell className="w-6 h-6 text-success" />
                   Tercihler ve Hedefler
                 </h3>

                 <div className="space-y-8 relative z-10 max-w-xl">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                       <div>
                          <h4 className="font-bold mb-1">Günlük Çalışma Hedefi</h4>
                          <p className="text-xs text-text-muted">Günlük çözmeniz gereken soru sayısını belirleyin.</p>
                       </div>
                       <select 
                         name="dailyGoal" 
                         value={notifData.dailyGoal} 
                         onChange={handleNotifChange}
                         className="bg-bg-dark border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-success focus:ring-2 focus:ring-success/20 font-bold"
                       >
                         <option value={10}>10 Soru</option>
                         <option value={20}>20 Soru</option>
                         <option value={30}>30 Soru</option>
                         <option value={50}>50 Soru</option>
                         <option value={100}>100 Soru</option>
                       </select>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between opacity-50 cursor-not-allowed" title="Bu özellik yakında mobil uygulamada aktif olacak">
                       <div>
                          <h4 className="font-bold mb-1">E-Posta Bildirimleri</h4>
                          <p className="text-xs text-text-muted">Önemli güncellemeler ve sınav hatırlatıcıları (Yakında).</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-not-allowed">
                         <input type="checkbox" className="sr-only peer" disabled checked={notifData.notifEnabled} />
                         <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                       </label>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                       <div>
                          <h4 className="font-bold mb-1">Hatırlatıcı Saati</h4>
                          <p className="text-xs text-text-muted">Günlük çalışmanı hatırlatmamız için bir saat seç.</p>
                       </div>
                       <div className="flex gap-2">
                          <select 
                            name="notifHour" 
                            value={notifData.notifHour} 
                            onChange={handleNotifChange}
                            className="bg-bg-dark border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-success focus:ring-2 focus:ring-success/20 font-bold"
                          >
                            {[...Array(24).keys()].map(h => (
                              <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                          <span className="flex items-center">:</span>
                          <select 
                            name="notifMinute" 
                            value={notifData.notifMinute} 
                            onChange={handleNotifChange}
                            className="bg-bg-dark border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-success focus:ring-2 focus:ring-success/20 font-bold"
                          >
                            {[0, 15, 30, 45].map(m => (
                              <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                       </div>
                    </div>

                    <div className="flex justify-start pt-4">
                       <button 
                         onClick={async () => {
                            setLoading(true);
                            try {
                              const res = await api.put('/auth/profile', { 
                                dailyGoal: notifData.dailyGoal, 
                                notifEnabled: notifData.notifEnabled,
                                notifHour: notifData.notifHour,
                                notifMinute: notifData.notifMinute
                              });
                              if (res.data.success) {
                                setAuth({ ...user, ...res.data.user }, token);
                                showMessage('success', 'Tercihleriniz başarıyla kaydedildi.');
                              }
                            } catch (error) {
                              showMessage('error', 'Tercihler kaydedilirken hata oluştu.');
                            } finally {
                              setLoading(false);
                            }
                         }} 
                         disabled={loading}
                         className="btn-primary bg-gradient-to-r from-success to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-2"
                       >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                         Değişiklikleri Kaydet
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
