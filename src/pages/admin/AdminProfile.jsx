import React, { useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
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

  const displayName = `${user?.firstName || profileData.firstName || 'Admin'} ${user?.lastName || profileData.lastName || ''}`.trim();
  const completionItems = [profileData.firstName, profileData.lastName, profileData.phone, profileData.bio];
  const profileCompletion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  return (
    <div className="space-y-6 pb-16 text-white">
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold text-primary-light">Yönetici hesabı</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Profilim</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
              Panelde görünen kimlik bilgilerini ve giriş güvenliğini buradan yönet.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3">
              <p className="text-xs font-semibold text-success/80">Yetki</p>
              <p className="mt-1 text-sm font-bold text-white">{user?.role === 'admin' ? 'Admin' : 'Yönetici'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs font-semibold text-text-muted">Profil doluluğu</p>
              <p className="mt-1 text-sm font-bold text-white">%{profileCompletion}</p>
            </div>
          </div>
        </div>
      </section>

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative"
                aria-label="Profil fotoğrafını değiştir"
              >
                <div className="h-32 w-32 overflow-hidden rounded-3xl border border-white/10 bg-bg-dark transition-colors group-hover:border-primary/50">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Admin profil" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                      <User className="h-12 w-12 text-primary-light" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-7 w-7 text-white" />
                  </div>
                </div>
                <span className="absolute -right-2 -bottom-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-primary text-white shadow-lg shadow-black/30 transition-colors hover:bg-primary-light">
                  <Camera className="h-4 w-4" />
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

              <h3 className="mt-5 text-xl font-bold text-white">{displayName}</h3>
              <p className="mt-1 max-w-full truncate text-sm font-semibold text-text-muted">{user?.email}</p>

              <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-success">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-bold">Panel erişimi aktif</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Profil tamlığı</p>
                <p className="mt-1 text-xs text-text-muted">Temel iletişim alanları</p>
              </div>
              <span className="text-xl font-bold text-white">%{profileCompletion}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${profileCompletion}%` }} />
            </div>
            <div className="mt-5 space-y-2 text-xs font-semibold text-text-muted">
              <div className="flex items-center justify-between"><span>Ad soyad</span><span className={profileData.firstName && profileData.lastName ? 'text-success' : 'text-warning'}>{profileData.firstName && profileData.lastName ? 'Tamam' : 'Eksik'}</span></div>
              <div className="flex items-center justify-between"><span>Telefon</span><span className={profileData.phone ? 'text-success' : 'text-warning'}>{profileData.phone ? 'Tamam' : 'Eksik'}</span></div>
              <div className="flex items-center justify-between"><span>Yönetici notu</span><span className={profileData.bio ? 'text-success' : 'text-warning'}>{profileData.bio ? 'Tamam' : 'Eksik'}</span></div>
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <Motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
          >
            <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Hesap bilgileri</h3>
                <p className="mt-1 text-sm text-text-muted">Panelde kullanılan yönetici adı, telefon ve kısa not.</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-text-muted">
                <Mail className="h-4 w-4" />
                <span className="max-w-[220px] truncate">{user?.email}</span>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-bold text-text-muted">Ad</span>
                  <input name="firstName" value={profileData.firstName} onChange={handleProfileChange} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-white/20 focus:border-primary/50 focus:bg-transparent" placeholder="Ad" />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-bold text-text-muted">Soyad</span>
                  <input name="lastName" value={profileData.lastName} onChange={handleProfileChange} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-white/20 focus:border-primary/50 focus:bg-transparent" placeholder="Soyad" />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-bold text-text-muted">Telefon</span>
                <input name="phone" value={profileData.phone} onChange={handleProfileChange} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-white/20 focus:border-primary/50 focus:bg-transparent" placeholder="555 555 55 55" />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold text-text-muted">Yönetici notu</span>
                <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows={5} className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-white/20 focus:border-primary/50 focus:bg-transparent custom-scrollbar" placeholder="Kısa bir yönetici notu..." />
              </label>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="flex h-11 items-center gap-2 rounded-2xl border border-primary/30 bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Bilgileri kaydet
                </button>
              </div>
            </form>
          </Motion.section>

          <Motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
          >
            <div className="mb-6 flex items-start gap-4 border-b border-white/10 pb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary-light">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Şifre ve güvenlik</h3>
                <p className="mt-1 text-sm text-text-muted">Giriş şifresini değiştirirken en az 6 karakter kullan.</p>
              </div>
            </div>

            <form onSubmit={savePassword} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <label className="block space-y-2">
                  <span className="text-xs font-bold text-text-muted">Mevcut şifre</span>
                  <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-white/20 focus:border-primary/50 focus:bg-transparent" placeholder="••••••••" />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-bold text-text-muted">Yeni şifre</span>
                  <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-white/20 focus:border-primary/50 focus:bg-transparent" placeholder="••••••••" />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-bold text-text-muted">Tekrar</span>
                  <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-white/20 focus:border-primary/50 focus:bg-transparent" placeholder="••••••••" />
                </label>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="flex h-11 items-center gap-2 rounded-2xl border border-primary/30 bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                  Şifreyi güncelle
                </button>
              </div>
            </form>
          </Motion.section>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
