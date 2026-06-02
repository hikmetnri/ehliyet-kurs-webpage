import React, { useRef, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';

const AdminProfile = () => {
  const { user, setAuth, token } = useAuthStore();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setAuth({ ...user, ...res.data.user }, token);
        showMessage('success', 'Admin profil bilgileri güncellendi.');
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
        newPassword: passwordData.newPassword,
      });

      if (res.data.success) {
        showMessage('success', 'Şifre başarıyla güncellendi.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Şifre değiştirilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    setLoading(true);

    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setAuth({ ...user, avatarUrl: res.data.avatarUrl }, token);
        showMessage('success', 'Profil fotoğrafı güncellendi.');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Fotoğraf yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'security', icon: Lock, label: 'Şifre' },
  ];

  return (
    <div className="space-y-8 pb-16 text-white">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-3 h-10 bg-primary rounded-full" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Admin Profili</h2>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">
              Hesap bilgileri, profil fotoğrafı ve güvenlik ayarları
            </p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center border border-success/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Yetki</p>
            <p className="text-sm font-bold text-white">Super Admin</p>
          </div>
        </div>
      </div>

      {message.text && (
        <Motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-danger/10 border-danger/20 text-danger'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="text-sm font-bold">{message.text}</p>
        </Motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full h-12 flex items-center gap-3 px-4 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary-light border-primary/30'
                  : 'bg-white/[0.02] text-text-muted border-white/10 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <Motion.section
              key="profile"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col xl:flex-row gap-8">
                <div className="xl:w-72 flex flex-col items-center gap-5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group"
                    aria-label="Profil fotoğrafını değiştir"
                  >
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/10 bg-bg-dark group-hover:border-primary/50 transition-colors">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Admin profil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <User className="w-14 h-14 text-primary-light" />
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <span className="absolute -right-1 bottom-3 w-11 h-11 rounded-full bg-primary border-4 border-white/10 flex items-center justify-center transition-colors hover:bg-primary-light shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                    </span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{user?.firstName || 'Admin'} {user?.lastName || ''}</p>
                    <p className="text-xs text-text-muted font-bold mt-1">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="space-y-2 block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Ad</span>
                      <input name="firstName" value={profileData.firstName} onChange={handleProfileChange} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="Ad" />
                    </label>
                    <label className="space-y-2 block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Soyad</span>
                      <input name="lastName" value={profileData.lastName} onChange={handleProfileChange} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="Soyad" />
                    </label>
                  </div>

                  <label className="space-y-2 block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Telefon</span>
                    <input name="phone" value={profileData.phone} onChange={handleProfileChange} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="555 555 55 55" />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Hakkımda</span>
                    <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows={5} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all resize-none custom-scrollbar font-medium" placeholder="Kısa bir yönetici notu..." />
                  </label>

                  <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-light text-white border border-primary/30 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Kaydet
                    </button>
                  </div>
                </form>
              </div>
            </Motion.section>
          )}

          {activeTab === 'security' && (
            <Motion.section
              key="security"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 relative overflow-hidden"
            >
              <div className="relative z-10 max-w-2xl space-y-8">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Lock className="w-6 h-6 text-primary-light" />
                    Şifre ve Güvenlik
                  </h3>
                  <p className="text-sm text-text-muted font-medium mt-2">
                    Admin giriş şifreni buradan güncelleyebilirsin.
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center border border-primary/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Giriş E-postası</p>
                    <p className="font-bold text-white truncate">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={savePassword} className="space-y-5">
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Mevcut Şifre</span>
                    <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="••••••••" />
                  </label>
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Yeni Şifre</span>
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="••••••••" />
                  </label>
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Yeni Şifre Tekrar</span>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium" placeholder="••••••••" />
                  </label>

                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-light text-white border border-primary/30 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                    Şifreyi Güncelle
                  </button>
                </form>
              </div>
            </Motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminProfile;
