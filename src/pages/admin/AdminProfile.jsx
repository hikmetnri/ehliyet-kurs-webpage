import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle, Camera, CheckCircle2, Loader2,
  Lock, Mail, Save, ShieldCheck, User,
  Eye, EyeOff, KeyRound, Phone, FileText,
} from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';

const StrengthBar = ({ password }) => {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const levels = [
    { label: 'Çok Zayıf', color: 'bg-rose-500' },
    { label: 'Zayıf',     color: 'bg-orange-500' },
    { label: 'Orta',      color: 'bg-amber-400' },
    { label: 'İyi',       color: 'bg-teal-400' },
    { label: 'Güçlü',     color: 'bg-emerald-500' },
  ];

  if (!password) return null;
  const lvl = levels[Math.min(score - 1, 4)] || levels[0];

  return (
    <div className="space-y-1 mt-2">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? lvl.color : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className="text-[10px] font-bold text-text-muted">{lvl.label}</p>
    </div>
  );
};

const FormField = ({ label, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-white/20 focus:border-primary/50 focus:bg-black/10";

const AdminProfile = () => {
  const { user, setAuth, token } = useAuthStore();
  const fileInputRef = useRef(null);

  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState({ type: '', text: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    bio:       user?.bio       || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setAuth({ ...user, ...res.data.user }, token);
        showMessage('success', 'Profil bilgileri güncellendi.');
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
        newPassword:     passwordData.newPassword,
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
    <div className="space-y-6 pb-16">

      {/* Page Header */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-primary-light uppercase tracking-widest">Yönetici Hesabı</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">Profilim</h1>
            <p className="mt-1 text-sm text-text-muted">
              Panelde görünen kimlik bilgilerini ve giriş güvenliğini buradan yönet.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-center">
              <p className="text-sm font-bold text-white">{user?.role === 'admin' ? 'Admin' : 'Yönetici'}</p>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Yetki</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-center">
              <p className="text-sm font-bold text-white">%{profileCompletion}</p>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Doluluk</p>
            </div>
          </div>
        </div>
      </section>

      {/* Status Message */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
          }`}
        >
          {message.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />
          }
          <p className="text-sm font-bold">{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_1fr]">

        {/* Left: Avatar + Summary */}
        <div className="space-y-4">

          {/* Avatar Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative mb-5"
                aria-label="Profil fotoğrafını değiştir"
              >
                <div className="w-28 h-28 rounded-3xl border-2 border-white/10 bg-black/20 overflow-hidden transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Admin profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                      <User className="h-11 w-11 text-primary-light" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <span className="absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-primary text-white shadow-md transition-colors hover:bg-primary-light">
                  <Camera className="h-3.5 w-3.5" />
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

              <h3 className="text-lg font-bold text-white">{displayName}</h3>
              <p className="mt-1 text-xs text-text-muted truncate max-w-full">{user?.email}</p>

              <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">Panel erişimi aktif</span>
              </div>
            </div>
          </div>

          {/* Completion Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-bold text-white">Profil tamlığı</p>
                <p className="text-xs text-text-muted mt-0.5">Temel alanları doldurun</p>
              </div>
              <span className="text-xl font-black text-white">%{profileCompletion}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10 mb-4">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <div className="space-y-2">
              {[
                { label: 'Ad',           done: !!profileData.firstName },
                { label: 'Soyad',        done: !!profileData.lastName },
                { label: 'Telefon',      done: !!profileData.phone },
                { label: 'Yönetici notu', done: !!profileData.bio },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{item.label}</span>
                  <span className={item.done ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {item.done ? 'Tamam' : 'Eksik'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="space-y-5">

          {/* Profile Info Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/[0.025] overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-light" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Hesap bilgileri</h3>
                  <p className="text-xs text-text-muted mt-0.5">Panelde kullanılan ad, telefon ve kısa not</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-text-muted">
                <Mail className="w-3.5 h-3.5" />
                <span className="max-w-[200px] truncate">{user?.email}</span>
              </div>
            </div>

            <form onSubmit={saveProfile} className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Ad">
                  <input
                    name="firstName"
                    value={profileData.firstName}
                    onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))}
                    placeholder="Ad"
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Soyad">
                  <input
                    name="lastName"
                    value={profileData.lastName}
                    onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))}
                    placeholder="Soyad"
                    className={inputCls}
                  />
                </FormField>
              </div>

              <FormField label="Telefon">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    name="phone"
                    value={profileData.phone}
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="555 555 55 55"
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </FormField>

              <FormField label="Yönetici Notu">
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))}
                    rows={4}
                    placeholder="Kısa bir yönetici notu..."
                    className={`${inputCls} pl-11 resize-none custom-scrollbar`}
                  />
                </div>
              </FormField>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 h-11 px-6 rounded-2xl bg-primary text-sm font-bold text-white transition-all hover:bg-primary-light disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Bilgileri Kaydet
                </button>
              </div>
            </form>
          </motion.div>

          {/* Password Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-white/10 bg-white/[0.025] overflow-hidden"
          >
            <div className="flex items-center gap-3 p-5 sm:p-6 border-b border-white/10 bg-black/20">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Şifre ve güvenlik</h3>
                <p className="text-xs text-text-muted mt-0.5">Giriş şifresini değiştirirken en az 6 karakter kullan</p>
              </div>
            </div>

            <form onSubmit={savePassword} className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current password */}
                <FormField label="Mevcut Şifre">
                  <div className="relative">
                    <input
                      type={showPass.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                      required
                      placeholder="••••••••"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => ({ ...s, current: !s.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                    >
                      {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormField>

                {/* New password */}
                <FormField label="Yeni Şifre">
                  <div className="relative">
                    <input
                      type={showPass.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                      required
                      placeholder="••••••••"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => ({ ...s, new: !s.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                    >
                      {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <StrengthBar password={passwordData.newPassword} />
                </FormField>

                {/* Confirm password */}
                <FormField label="Tekrar">
                  <div className="relative">
                    <input
                      type={showPass.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                      placeholder="••••••••"
                      className={`${inputCls} pr-10 ${
                        passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                          ? 'border-rose-500/50'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                    >
                      {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-[10px] text-rose-400 font-bold mt-1">Şifreler eşleşmiyor</p>
                  )}
                </FormField>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 h-11 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold transition-all hover:bg-amber-500 hover:text-white hover:border-amber-500 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Şifreyi Güncelle
                </button>
              </div>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
