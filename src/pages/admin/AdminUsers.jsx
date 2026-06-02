import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, User, Shield, Star, Crown,
  Trash2, Mail, Phone, Calendar, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, UserX, UserCheck,
  BarChart2, X, Target, TrendingUp, PieChart, Activity, Flame, Bell, Send, Award,
  Trophy, Zap, Gem, Medal, Rocket, Heart, ArrowUpDown
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const ICON_MAP = { Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart };

const BadgeIcon = ({ name, ...props }) => {
  const Icon = ICON_MAP[name] || Award;
  return <Icon {...props} />;
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'user'
  const [sortMode, setSortMode] = useState('newest');

  // Analytics Modal States
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState(null);

  // Notification Modal States
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifData, setNotifData] = useState({ title: '', body: '' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]); // Multiple selection

  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchUsers();
  }, [sortMode]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Backend'deki varsayılan 20 limit sınırını aşıp eski kullanıcıları (Admin/PRO) görebilmek için limit=1000 eklendi.
      const res = await api.get(`/users?limit=1000&sort=${sortMode}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Kullanıcılar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Rol güncellenirken hata oluştu.");
    }
  };

  const handleProToggle = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/pro`);
      setUsers(users.map(u => u._id === userId ? { ...u, proStatus: res.data.proStatus } : u));
    } catch (err) {
      alert("Pro statüsü güncellenirken hata oluştu.");
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    if (userId === currentUser?._id) {
      alert("Kendi hesabınızın durumunu değiştiremezsiniz!");
      return;
    }
    const action = currentStatus === false ? "aktif etmek" : "askıya almak";
    const confirm = window.confirm(`Bu kullanıcıyı ${action} istediğinize emin misiniz?`);
    if (!confirm) return;

    try {
      const res = await api.put(`/users/${userId}/status`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
    } catch (err) {
      alert("Kullanıcı durumu güncellenirken hata oluştu.");
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser?._id) {
      alert("Kendi hesabınızı silemezsiniz!");
      return;
    }
    const confirm = window.confirm("Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!");
    if (!confirm) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert("Kullanıcı silinirken hata oluştu.");
    }
  };

  const handleOpenStats = async (userId) => {
    setStatsModalOpen(true);
    setLoadingStats(true);
    setSelectedUserStats(null);
    try {
      const [statsRes, badgesRes] = await Promise.all([
        api.get(`/exam-results/user/${userId}/stats`),
        api.get(`/badges/user/${userId}`)
      ]);

      if (statsRes.data.success) {
        setSelectedUserStats({
          ...statsRes.data,
          badges: badgesRes.data // This is expected to be the result from badgeController.getUserBadges
        });
      }
    } catch (err) {
      alert("İstatistikler yüklenirken hata oluştu.");
      setStatsModalOpen(false);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleOpenNotifModal = (user = null) => {
    if (user) {
      // Single user mode
      setSelectedUserIds([user._id]);
    }
    setNotifModalOpen(true);
  };

  const handleSendNotif = async () => {
    if (!notifData.title || !notifData.body || selectedUserIds.length === 0) return;
    try {
      setSendingNotif(true);
      const res = await api.post('/notifications/targeted', {
        title: notifData.title,
        body: notifData.body,
        userIds: selectedUserIds
      });
      if (res.data.success) {
        alert(`${selectedUserIds.length} kullanıcıya bildirim gönderildi.`);
        setNotifModalOpen(false);
        setNotifData({ title: '', body: '' });
        setSelectedUserIds([]);
      }
    } catch (err) {
      alert("Bildirim gönderilirken hata oluştu.");
    } finally {
      setSendingNotif(false);
    }
  };

  const handleToggleSelect = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (sortedUsers.length === 0) return;
    if (selectedVisibleCount === sortedUsers.length) {
      const visibleIds = new Set(sortedUsers.map(u => u._id));
      setSelectedUserIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      setSelectedUserIds(prev => [...new Set([...prev, ...sortedUsers.map(u => u._id)])]);
    }
  };

  const filteredUsers = users.filter(u => {
    const searchString = searchTerm.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchString) || u.email.toLowerCase().includes(searchString);
    let matchesRole = true;
    if (roleFilter === 'admin') matchesRole = u.role === 'admin';
    else if (roleFilter === 'pro') matchesRole = u.proStatus === true;
    else if (roleFilter === 'active') matchesRole = u.isActive !== false;
    else if (roleFilter === 'online') matchesRole = u.isOnline === true;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const fullName = (user) => `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || '';
    const dateValue = (value) => value ? new Date(value).getTime() || 0 : 0;
    const boolValue = (value) => value ? 1 : 0;
    const onlineValue = (user) => {
      const lastActive = dateValue(user.lastActiveAt);
      return lastActive && Date.now() - lastActive < 2 * 60 * 1000 ? 1 : 0;
    };
    const numberValue = (value) => Number(value || 0);

    if (sortMode === 'lastActive' || sortMode === 'onlineFirst') {
      if (sortMode === 'onlineFirst') {
        const onlineDiff = onlineValue(b) - onlineValue(a);
        if (onlineDiff !== 0) return onlineDiff;
      }
      return dateValue(b.lastActiveAt) - dateValue(a.lastActiveAt);
    }

    if (sortMode === 'alphabetical') {
      return fullName(a).localeCompare(fullName(b), 'tr', { sensitivity: 'base' });
    }

    if (sortMode === 'oldest') {
      return dateValue(a.createdAt) - dateValue(b.createdAt);
    }

    if (sortMode === 'highestScore') {
      return numberValue(b.totalScore) - numberValue(a.totalScore);
    }

    if (sortMode === 'highestLevel') {
      return numberValue(b.level) - numberValue(a.level);
    }

    if (sortMode === 'proFirst') {
      return boolValue(b.proStatus) - boolValue(a.proStatus) || dateValue(b.createdAt) - dateValue(a.createdAt);
    }

    if (sortMode === 'adminFirst') {
      return boolValue(b.role === 'admin') - boolValue(a.role === 'admin') || dateValue(b.createdAt) - dateValue(a.createdAt);
    }

    if (sortMode === 'suspendedFirst') {
      return boolValue(b.isActive === false) - boolValue(a.isActive === false) || dateValue(b.createdAt) - dateValue(a.createdAt);
    }

    return dateValue(b.createdAt) - dateValue(a.createdAt);
  });

  const sortOptions = [
    { value: 'newest', label: 'En Yeni Kayıt' },
    { value: 'lastActive', label: 'Son Aktif' },
    { value: 'alphabetical', label: 'Alfabetik' },
    { value: 'highestScore', label: 'En Yüksek Puan' },
    { value: 'highestLevel', label: 'En Yüksek Seviye' },
    { value: 'proFirst', label: 'PRO Öncelikli' },
    { value: 'adminFirst', label: 'Yönetici Öncelikli' },
    { value: 'suspendedFirst', label: 'Askıya Alınanlar' },
    { value: 'onlineFirst', label: 'Çevrimiçi Öncelikli' },
    { value: 'oldest', label: 'En Eski Kayıt' },
  ];
  const selectedVisibleCount = sortedUsers.filter(u => selectedUserIds.includes(u._id)).length;

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const proCount = users.filter(u => u.proStatus).length;
  const inactiveCount = users.filter(u => u.isActive === false).length;
  const filterOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'admin', label: 'Yönetici' },
    { value: 'pro', label: 'PRO' },
    { value: 'active', label: 'Aktif' },
    { value: 'online', label: 'Çevrimiçi' },
  ];

  return (
    <div className="space-y-5 pb-20">
      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold text-primary-light uppercase tracking-wider">Kullanıcı operasyonu</p>
            <h1 className="text-2xl font-bold leading-tight text-white">Kullanıcı & Hesap Yönetimi</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-text-secondary">
              Öğrenci hesaplarını, yetkilerini, abonelik ve güvenlik durumlarını tek merkezden yönet.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedUserIds.length > 0 && (
              <button
                onClick={() => handleOpenNotifModal()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/20"
              >
                <Bell className="h-4 w-4" />
                {selectedUserIds.length} seçiliye bildirim
              </button>
            )}
            <button
              onClick={() => fetchUsers()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all"
            >
              <RefreshCw className="h-4 w-4 text-primary-light" />
              Verileri yenile
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
         <StatsCard icon={User} label="Toplam Hesap" value={totalUsers} color="text-primary-light" bg="bg-primary/10" />
         <StatsCard icon={Shield} label="Yönetici" value={adminCount} color="text-emerald-300" bg="bg-emerald-500/10" />
         <StatsCard icon={Crown} label="PRO Üye" value={proCount} color="text-amber-300" bg="bg-amber-500/10" />
         <StatsCard icon={UserX} label="Askıda" value={inactiveCount} color="text-rose-300" bg="bg-rose-500/10" />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.02] p-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5 transition-colors focus-within:border-primary/40">
          <Search className="mr-3 h-4 w-4 shrink-0 text-text-muted" />
          <input
            type="text"
            placeholder="İsim veya e-posta ile ara"
            className="w-full border-none bg-transparent text-sm font-medium text-white outline-none placeholder-text-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="rounded-lg p-1 text-text-muted transition-colors hover:bg-white/[0.07] hover:text-white">
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex w-full shrink-0 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-1.5 custom-scrollbar xl:w-auto">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setRoleFilter(option.value)}
              className={`flex-none rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                roleFilter === option.value
                ? 'bg-primary/10 border border-primary/20 text-white'
                : 'text-text-muted hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex w-full shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2 xl:w-auto">
          <ArrowUpDown className="h-4 w-4 shrink-0 text-text-muted" />
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="h-9 min-w-[170px] cursor-pointer bg-transparent text-xs font-bold text-white outline-none"
            aria-label="Kullanıcı sıralaması"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-bg-card text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]"
      >
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-text-secondary min-w-[900px]">
            <thead className="border-b border-white/10 bg-white/[0.01] text-xs font-bold text-text-muted">
              <tr>
                <th className="w-10 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={sortedUsers.length > 0 && selectedVisibleCount === sortedUsers.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-4">Profil</th>
                <th className="px-5 py-4">İletişim</th>
                <th className="px-5 py-4">Yetki</th>
                <th className="px-5 py-4">Durum</th>
                <th className="px-5 py-4 text-right">Aksiyonlar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="relative overflow-hidden px-6 py-28 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <span className="text-xs font-bold text-text-muted">Kullanıcılar yükleniyor</span>
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-28 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015]">
                      <User className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="font-bold text-text-muted">Eşleşen kullanıcı bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const isSuspended = user.isActive === false;
                  const isMe = user._id === currentUser?._id;

                  return (
                    <tr key={user._id} className={`group transition-colors ${isSuspended ? 'bg-rose-500/[0.015] hover:bg-rose-500/[0.03]' : 'hover:bg-white/[0.025]'} ${isMe ? 'bg-primary/[0.01]' : ''} ${selectedUserIds.includes(user._id) ? 'bg-primary/[0.03]' : ''}`}>

                      {/* CHECKBOX */}
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user._id)}
                          onChange={() => handleToggleSelect(user._id)}
                          className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* PROFILE COLUMN */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                                isSuspended ? 'border-rose-500/30 bg-rose-500/10' :
                                user.role === 'admin' ? 'border-emerald-500/30 bg-emerald-500/10' :
                                'border-white/10 bg-white/5'
                              }`}>
                                {user.role === 'admin' ? <Shield className={`w-5 h-5 ${isSuspended ? 'text-rose-400' : 'text-emerald-400'}`} /> : <User className={`w-5 h-5 ${isSuspended ? 'text-rose-400' : 'text-white/70'}`} />}
                              </div>
                              {user.proStatus && (
                                  <div className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#11131a] bg-amber-400">
                                      <Crown className="w-3 h-3 text-black" />
                                  </div>
                              )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                                <div className={`text-sm font-bold tracking-tight ${isSuspended ? 'text-rose-400' : 'text-white'}`}>
                                  {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : 'İsimsiz Öğrenci'}
                                </div>
                                {user.isOnline && <div className="h-2 w-2 rounded-full bg-emerald-500" title="Şu an çevrimiçi"></div>}
                                {isMe && <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary-light">Ben</span>}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                              <Calendar className="w-3 h-3 opacity-50" />
                              {new Date(user.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })} kayıt
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT COLUMN */}
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <div className="flex w-fit items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-white/70">
                            <Mail className="w-3.5 h-3.5 text-primary-light" /> {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex w-fit items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-white/70">
                              <Phone className="w-3.5 h-3.5 text-emerald-400" /> {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ROLES COLUMN */}
                      <td className="px-5 py-4">
                          <div className="flex flex-col gap-2 items-start">
                            <button
                              onClick={() => handleRoleToggle(user._id, user.role)}
                              className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                                user.role === 'admin'
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-white'
                                  : 'bg-white/[0.02] text-text-muted border-white/10 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5'
                              }`}
                            >
                              {user.role === 'admin' ? <span className="flex items-center gap-1.5"><Shield className="w-3 h-3"/> Yönetici</span> : 'Yönetici yap'}
                            </button>
                            <button
                              onClick={() => handleProToggle(user._id)}
                              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                                user.proStatus
                                  ? 'border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-white'
                                  : 'bg-white/[0.02] text-text-muted border-white/10 hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/5'
                              }`}
                            >
                              {user.proStatus ? <><Crown className="w-3.5 h-3.5" /> PRO</> : <><Star className="w-3.5 h-3.5 opacity-60" /> PRO ver</>}
                            </button>
                          </div>
                      </td>

                      {/* STATUS COLUMN */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2 items-start">
                          <button
                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                            disabled={isMe}
                            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                              isMe ? 'opacity-30 cursor-not-allowed border-transparent bg-white/5 text-white' :
                              isSuspended
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500 hover:text-white'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                            }`}
                          >
                            {isSuspended ? <><UserX className="w-3.5 h-3.5" /> Askıda</> : <><UserCheck className="w-3.5 h-3.5" /> Aktif</>}
                          </button>
                          {/* Son aktiflik zamanı */}
                          {user.lastActiveAt ? (
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-muted/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-text-muted/30"></div>
                              Son: {(() => {
                                const diff = Date.now() - new Date(user.lastActiveAt).getTime();
                                const mins = Math.floor(diff / 60000);
                                const hours = Math.floor(diff / 3600000);
                                const days = Math.floor(diff / 86400000);
                                if (mins < 2) return <span className="text-emerald-400">şimdi aktif</span>;
                                if (mins < 60) return <span>{mins} dk önce</span>;
                                if (hours < 24) return <span>{hours} saat önce</span>;
                                if (days < 7) return <span>{days} gün önce</span>;
                                return <span>{new Date(user.lastActiveAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>;
                              })()}
                            </div>
                          ) : (
                            <div className="text-[9px] text-text-muted/40 font-bold">Henüz giriş yok</div>
                          )}
                        </div>
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {user.role === 'user' && (
                             <>
                               <button
                                 onClick={() => handleOpenNotifModal(user)}
                                 className="rounded-xl border border-indigo-500/20 bg-white/[0.02] p-2.5 text-indigo-300 transition-colors hover:bg-indigo-500/10 hover:text-indigo-400"
                                 title="Bildirim Gönder"
                               >
                                 <Bell className="w-4 h-4" />
                               </button>
                               <button
                                 onClick={() => handleOpenStats(user._id)}
                                 className="rounded-xl border border-primary/20 bg-white/[0.02] p-2.5 text-primary-light transition-colors hover:bg-primary/10 hover:text-primary"
                                 title="Detaylı Analiz Gör"
                               >
                                 <Activity className="w-4 h-4" />
                               </button>
                             </>
                           )}

                           <button
                             onClick={() => handleDelete(user._id)}
                             disabled={isMe}
                             className={`rounded-xl border p-2.5 transition-colors ${
                               isMe
                               ? 'opacity-30 cursor-not-allowed bg-transparent border-transparent text-text-muted'
                               : 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500 hover:text-white'
                             }`}
                             title="Hesabı sil"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="px-6 py-20 text-center">
              <Loader2 className="w-9 h-9 animate-spin text-primary mx-auto mb-4" />
              <span className="text-text-muted font-bold text-xs uppercase tracking-widest">Kullanıcılar yükleniyor...</span>
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <User className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <p className="text-text-muted font-bold">Eşleşen kullanıcı bulunamadı.</p>
            </div>
          ) : (
            sortedUsers.map((user) => {
              const isSuspended = user.isActive === false;
              const isMe = user._id === currentUser?._id;

              return (
                <div key={user._id} className={`p-4 space-y-4 ${selectedUserIds.includes(user._id) ? 'bg-primary/[0.03]' : ''}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user._id)}
                      onChange={() => handleToggleSelect(user._id)}
                      className="mt-4 w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                      isSuspended ? 'border-rose-500/30 bg-rose-500/10' :
                      user.role === 'admin' ? 'border-emerald-500/30 bg-emerald-500/10' :
                      'border-white/10 bg-white/5'
                    }`}>
                      {user.role === 'admin' ? <Shield className="w-5 h-5 text-emerald-400" /> : <User className="w-5 h-5 text-white/70" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={`font-bold text-sm truncate ${isSuspended ? 'text-rose-400' : 'text-white'}`}>
                          {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : 'İsimsiz Öğrenci'}
                        </p>
                        {user.proStatus && <Crown className="w-4 h-4 text-amber-400 shrink-0" />}
                        {user.isOnline && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-text-muted truncate mt-1">{user.email}</p>
                      {user.phone && <p className="text-[11px] text-text-muted/80 truncate mt-0.5">{user.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleRoleToggle(user._id, user.role)} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                      user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/[0.02] text-text-muted border-white/10'
                    }`}>
                      {user.role === 'admin' ? 'Yönetici' : 'Yönetici Yap'}
                    </button>
                    <button onClick={() => handleProToggle(user._id)} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                      user.proStatus ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-white/[0.02] text-text-muted border-white/10'
                    }`}>
                      {user.proStatus ? 'PRO İptal' : 'PRO Ver'}
                    </button>
                    <button onClick={() => handleStatusToggle(user._id, user.isActive)} disabled={isMe} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                      isMe ? 'opacity-40 bg-white/5 text-white/40 border-white/5' :
                      isSuspended ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isSuspended ? 'Banlandı' : 'Güvenli'}
                    </button>
                    <div className="flex justify-end gap-2">
                      {user.role === 'user' && (
                        <>
                          <button onClick={() => handleOpenNotifModal(user)} className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl" title="Bildirim Gönder">
                            <Bell className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleOpenStats(user._id)} className="p-2.5 bg-primary/10 border border-primary/20 text-primary-light rounded-xl" title="Analiz Gör">
                            <Activity className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(user._id)} disabled={isMe} className={`p-2.5 rounded-xl border ${isMe ? 'opacity-40 border-transparent text-text-muted' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`} title="Hesabı Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && sortedUsers.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.01] px-5 py-4 text-xs font-bold text-text-muted">
            <span>{sortedUsers.length} kullanıcı gösteriliyor • {sortOptions.find(option => option.value === sortMode)?.label}</span>
            <span className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1">{selectedUserIds.length} seçili</span>
          </div>
        )}
      </motion.div>

      {/* USER ANALYSIS MODAL */}
      <AnimatePresence>
        {statsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setStatsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-bg-card shadow-xl shadow-black/40"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
                    <Activity className="h-5 w-5 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Kullanıcı Analizi</h2>
                    <p className="mt-1 text-xs font-semibold text-text-muted">Sınav performansı ve rozet özeti</p>
                  </div>
                </div>
                <button onClick={() => setStatsModalOpen(false)} className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-2 transition-all">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 custom-scrollbar">
                {loadingStats ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="text-xs font-bold text-text-muted">Analiz yükleniyor</span>
                  </div>
                ) : selectedUserStats ? (
                  <div className="space-y-6">

                     {/* Identity Card */}
                     <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                            <User className="h-5 w-5 text-white/40" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 text-lg font-bold text-white">
                              {selectedUserStats.user.firstName} {selectedUserStats.user.lastName}
                              {selectedUserStats.user.proStatus && <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">PRO</span>}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-white/50">
                                <Mail className="w-3.5 h-3.5" /> {selectedUserStats.user.email}
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3 text-right">
                           <div className="text-xs font-semibold text-text-muted">Toplam puan</div>
                           <div className="text-3xl font-bold text-primary-light">{selectedUserStats.user.totalScore}</div>
                        </div>
                     </div>

                     {/* Stat Cards */}
                     <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <ReportCard title="Başarı Oranı" value={`%${selectedUserStats.stats.successRate}`} icon={Target} color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                        <ReportCard title="Sınav" value={selectedUserStats.stats.totalExams} icon={Activity} color="text-indigo-300" bg="bg-indigo-500/10" border="border-indigo-500/20" />
                        <ReportCard title="Soru" value={selectedUserStats.stats.totalQuestions} icon={PieChart} color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
                        <ReportCard title="Seri" value={`${selectedUserStats.stats.streak} Gün`} icon={Flame} color="text-rose-300" bg="bg-rose-500/10" border="border-rose-500/20" />
                     </div>

                     {/* Progress Visualizer */}
                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                            <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-emerald-300"><CheckCircle2 className="w-4 h-4" /> Sınav Sonuçları</h3>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Tamamlanan Sınavlar</span>
                                    <span className="font-bold text-emerald-400 text-lg">{selectedUserStats.stats.passedCount}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(selectedUserStats.stats.passedCount / Math.max(selectedUserStats.stats.totalExams, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Başarısız sınavlar</span>
                                    <span className="font-bold text-rose-400 text-lg">{selectedUserStats.stats.failedCount}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full rounded-full bg-rose-400" style={{ width: `${(selectedUserStats.stats.failedCount / Math.max(selectedUserStats.stats.totalExams, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                            <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-primary-light"><PieChart className="w-4 h-4" /> Soru Performansı</h3>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Doğru cevap</span>
                                    <span className="font-bold text-primary-light text-lg">{selectedUserStats.stats.totalCorrect}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(selectedUserStats.stats.totalCorrect / Math.max(selectedUserStats.stats.totalQuestions, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Yanlış cevap</span>
                                    <span className="font-bold text-amber-400 text-lg">{selectedUserStats.stats.totalWrong}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full rounded-full bg-amber-400" style={{ width: `${(selectedUserStats.stats.totalWrong / Math.max(selectedUserStats.stats.totalQuestions, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* EARNED BADGES SECTION */}
                     <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                        <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-amber-300"><Award className="w-5 h-5" /> Kazanılan Rozetler</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 relative z-10">
                           {selectedUserStats.badges && selectedUserStats.badges.filter(b => b.isEarned).length > 0 ? (
                             selectedUserStats.badges.filter(b => b.isEarned).map((b, idx) => (
                               <motion.div
                                 key={b._id}
                                 initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                                 className="flex flex-col items-center text-center group/badge"
                               >
                                 <div
                                   className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover/badge:scale-105"
                                   style={{ backgroundColor: `${b.color}15`, border: `1px solid ${b.color}40` }}
                                 >
                                   <BadgeIcon name={b.icon} className="w-7 h-7" style={{ color: b.color }} />
                                 </div>
                                 <h4 className="text-[11px] font-bold text-white leading-tight mb-1">{b.name}</h4>
                                 <span className="text-[10px] font-bold text-text-muted">
                                   {new Date(b.earnedAt).toLocaleDateString('tr-TR')}
                                 </span>
                               </motion.div>
                             ))
                           ) : (
                             <div className="col-span-full py-10 flex flex-col items-center justify-center opacity-30">
                                 <Award className="w-12 h-12 mb-3" />
                                 <p className="text-xs font-bold">Henüz rozet kazanılmamış</p>
                             </div>
                           )}
                        </div>
                      </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                     <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mx-auto mb-4 opacity-50">
                        <AlertTriangle className="w-8 h-8 text-white" />
                     </div>
                     <p className="text-text-muted font-bold">Kullanıcıya ait rapor çekilemedi veya veritabanında henüz işlem yapmamış.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TARGETED NOTIFICATION MODAL */}
      <AnimatePresence>
        {notifModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setNotifModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-bg-card p-6 shadow-xl shadow-black/40"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
                    <Bell className="h-5 w-5 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Özel Bildirim Gönder</h2>
                    <p className="text-xs font-semibold text-text-secondary">{selectedUserIds.length} kullanıcı seçildi</p>
                  </div>
                </div>
                <button onClick={() => setNotifModalOpen(false)} className="rounded-xl p-2 transition-colors hover:bg-white/[0.07]">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-bold text-text-muted">Bildirim başlığı</label>
                  <input
                    type="text"
                    value={notifData.title}
                    onChange={(e) => setNotifData({...notifData, title: e.target.value})}
                    placeholder="Örn: Sınav Hatırlatması"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-bold text-text-muted">Mesaj içeriği</label>
                  <textarea
                    value={notifData.body}
                    onChange={(e) => setNotifData({...notifData, body: e.target.value})}
                    placeholder="Kullanıcıya özel mesajınızı yazın..."
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all resize-none custom-scrollbar font-medium"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSendNotif}
                    disabled={sendingNotif || !notifData.title || !notifData.body}
                    className="flex w-full h-12 items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {sendingNotif ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Bildirimi Gönder</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Top KPIs Components
const StatsCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${bg} ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs font-semibold text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold leading-none text-white">{value}</p>
    </div>
  </div>
);

// Detail Cards inside Modal
const ReportCard = ({ title, value, icon: Icon, color, bg, border }) => (
  <div className={`flex flex-col items-start gap-3 rounded-2xl border ${border} bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]`}>
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
       <Icon className="h-5 w-5" />
    </div>
    <div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="mt-1 text-xs font-bold text-white/50">{title}</div>
    </div>
  </div>
);

export default AdminUsers;
