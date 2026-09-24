import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import {
  Loader2, Search, User, Shield, Crown,
  Trash2, Mail, Phone, Calendar, RefreshCw,
  XCircle, UserX, UserCheck, Bell,
  Activity, ArrowUpDown, Star,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// ─── Extracted Modules (SRP) ─────────────────────────────────────
import { StatsCard } from './users/userBits';
import UserAnalysisModal from './users/UserAnalysisModal';
import NotificationModal from './users/NotificationModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'user'
  const [sortMode, setSortMode] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [matchingTotal, setMatchingTotal] = useState(0);
  const [summary, setSummary] = useState({ totalUsers: 0, adminCount: 0, proCount: 0, suspendedCount: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, sortMode]);

  // Analytics Modal States
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [expandedResultIds, setExpandedResultIds] = useState(new Set());

  // Notification Modal States
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifData, setNotifData] = useState({ title: '', body: '' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]); // Multiple selection

  const currentUser = useAuthStore((state) => state.user);

  const fetchUsers = useCallback(async (signal) => {
    try {
      setLoading(true);
      const res = await api.get('/users', { signal, params: { limit: 50, page, sort: sortMode, filter: roleFilter, search: debouncedSearch } });
      if (signal?.aborted) return;
      if (res.data.success) {
        setUsers(res.data.users);
        setPages(res.data.pages || 1);
        if (page > (res.data.pages || 1)) setPage(res.data.pages || 1);
        setMatchingTotal(res.data.total || 0);
        setSummary(res.data.summary || { totalUsers: 0, adminCount: 0, proCount: 0, suspendedCount: 0 });
      }
    } catch (err) {
      if (!signal?.aborted) console.error('Kullanıcılar alınamadı:', err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [sortMode, roleFilter, debouncedSearch, page]);

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, [fetchUsers]);

  const handleRoleToggle = async (userId, currentRole) => {
    if (userId === currentUser?._id) {
      alert("Kendi hesabınızın rolünü değiştiremezsiniz!");
      return;
    }
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await api.put(`/users/${userId}/role`, { role: newRole });
      await fetchUsers();
    } catch {
      alert("Rol güncellenirken hata oluştu.");
    }
  };

  const handleProToggle = async (userId) => {
    try {
      await api.put(`/users/${userId}/pro`);
      await fetchUsers();
    } catch {
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
      await api.put(`/users/${userId}/status`);
      await fetchUsers();
    } catch {
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
      await fetchUsers();
    } catch {
      alert("Kullanıcı silinirken hata oluştu.");
    }
  };

  const handleOpenStats = async (userId) => {
    setStatsModalOpen(true);
    setLoadingStats(true);
    setSelectedUserStats(null);
    setExpandedResultIds(new Set());
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
    } catch {
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
    } catch {
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

  const sortedUsers = users;

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

  const totalUsers = summary.totalUsers;
  const adminCount = summary.adminCount;
  const proCount = summary.proCount;
  const inactiveCount = summary.suspendedCount;
  const filterOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'admin', label: 'Yönetici' },
    { value: 'pro', label: 'PRO' },
    { value: 'active', label: 'Aktif' },
    { value: 'online', label: 'Çevrimiçi' },
    { value: 'waiting_first_test', label: 'İlk Testi Bekleyenler' },
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
                      {isSuspended ? 'Askıda' : 'Aktif'}
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
            <span>{matchingTotal} eşleşmeden {sortedUsers.length} kullanıcı • {sortOptions.find(option => option.value === sortMode)?.label}</span>
            <span>{selectedUserIds.length} seçili</span>
          </div>
        )}
      </motion.div>

      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3 text-sm text-white" aria-label="Kullanıcı sayfaları">
          <button type="button" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-xl border border-white/10 px-4 py-2 disabled:opacity-40">Önceki</button>
          <span>{page} / {pages}</span>
          <button type="button" disabled={loading || page >= pages} onClick={() => setPage(value => value + 1)} className="rounded-xl border border-white/10 px-4 py-2 disabled:opacity-40">Sonraki</button>
        </nav>
      )}

      <UserAnalysisModal
        statsModalOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        loadingStats={loadingStats}
        selectedUserStats={selectedUserStats}
        expandedResultIds={expandedResultIds}
        setExpandedResultIds={setExpandedResultIds}
      />

      <NotificationModal
        notifModalOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        notifData={notifData}
        setNotifData={setNotifData}
        sendingNotif={sendingNotif}
        handleSendNotif={handleSendNotif}
        selectedUserIds={selectedUserIds}
      />

    </div>
  );
};

export default AdminUsers;
