import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Search, User, Shield, Star, Crown, 
  Trash2, Mail, Phone, Calendar, RefreshCw, 
  CheckCircle2, XCircle, AlertTriangle, UserX, UserCheck,
  BarChart2, X, Target, TrendingUp, PieChart, Activity, Flame
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'user'
  
  // Analytics Modal States
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState(null);

  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Backend'deki varsayılan 20 limit sınırını aşıp eski kullanıcıları (Admin/PRO) görebilmek için limit=1000 eklendi.
      const res = await api.get('/users?limit=1000');
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
      const res = await api.get(`/exam-results/user/${userId}/stats`);
      if (res.data.success) {
        setSelectedUserStats(res.data);
      }
    } catch (err) {
      alert("İstatistikler yüklenirken hata oluştu.");
      setStatsModalOpen(false);
    } finally {
      setLoadingStats(false);
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

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const proCount = users.filter(u => u.proStatus).length;
  const inactiveCount = users.filter(u => u.isActive === false).length;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Kullanıcı & Hesap Yönetimi</h1>
          <p className="text-text-secondary text-sm mt-1">Öğrenci hesaplarını, yetkilerini ve abonelik durumlarını tek merkezden yönet.</p>
        </div>
        <button 
          onClick={() => fetchUsers()} 
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/10 transition-all shadow-lg"
        >
          <RefreshCw className="w-4 h-4 text-primary-light" /> Canlı Veri Yenile
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatsCard icon={User} label="Toplam Hesap" value={totalUsers} color="text-primary-light" bg="bg-primary/20" />
         <StatsCard icon={Shield} label="Root Yetkililer" value={adminCount} color="text-emerald-400" bg="bg-emerald-500/20" />
         <StatsCard icon={Crown} label="Premium (PRO)" value={proCount} color="text-amber-400" bg="bg-amber-500/20" />
         <StatsCard icon={UserX} label="Askıya Alınanlar" value={inactiveCount} color="text-rose-400" bg="bg-rose-500/20" />
      </div>

      {/* Search & Filter Bar */}
      <div className="p-2 bg-bg-card border border-white/5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-2">
        <div className="flex-1 flex items-center bg-black/40 rounded-2xl px-5 py-3 w-full border border-white/5 transition-all focus-within:border-primary/50 focus-within:bg-black/60">
          <Search className="w-5 h-5 text-primary-light mr-3" />
          <input 
            type="text" 
            placeholder="İsim veya E-posta ile ara..." 
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-text-muted font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <XCircle className="w-4 h-4 text-text-muted" />
            </button>
          )}
        </div>
        
        <div className="flex bg-black/40 border border-white/5 p-1.5 rounded-2xl w-full xl:w-auto h-full overflow-x-auto custom-scrollbar shrink-0">
          {['all', 'admin', 'pro', 'active', 'online'].map(role => (
            <button 
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`flex-none px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                roleFilter === role 
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {role === 'all' ? 'Tümü' : role === 'admin' ? 'Yönetici' : role === 'pro' ? 'PRO Üye' : role === 'active' ? 'Aktif Hesap' : 'Çevrimiçi'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="glass-card rounded-[32px] border border-white/5 overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-text-secondary min-w-[900px]">
            <thead className="bg-black/40 text-white/40 font-black uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-5 rounded-tl-[32px] border-b border-white/5">Profil</th>
                <th className="px-6 py-5 border-b border-white/5">Bağlantı Bilgisi</th>
                <th className="px-6 py-5 border-b border-white/5">Erişim Düzeyi</th>
                <th className="px-6 py-5 border-b border-white/5">Güvenlik Durumu</th>
                <th className="px-6 py-5 text-right rounded-tr-[32px] border-b border-white/5">Aksiyonlar</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/[0.02]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-32 text-center relative overflow-hidden">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <span className="text-text-muted font-bold text-xs uppercase tracking-widest">Sistem Ağacı Taranıyor...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-32 text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mx-auto mb-6 bg-white/[0.01]">
                      <User className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-text-muted font-bold tracking-wide">Eşleşen herhangi bir kullanıcı bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuspended = user.isActive === false;
                  const isMe = user._id === currentUser?._id;
                  
                  return (
                    <tr key={user._id} className={`group transition-all duration-300 ${isSuspended ? 'bg-rose-500/[0.02] hover:bg-rose-500/[0.05]' : 'hover:bg-white/[0.02]'} ${isMe ? 'bg-primary/[0.02]' : ''}`}>
                      
                      {/* PROFILE COLUMN */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                                isSuspended ? 'border-rose-500/30 bg-rose-500/10' : 
                                user.role === 'admin' ? 'border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                'border-white/10 bg-white/5'
                              }`}>
                                {user.role === 'admin' ? <Shield className={`w-5 h-5 ${isSuspended ? 'text-rose-400' : 'text-emerald-400'}`} /> : <User className={`w-5 h-5 ${isSuspended ? 'text-rose-400' : 'text-white/70'}`} />}
                              </div>
                              {user.proStatus && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 border-[3px] border-[#0a0a0a] flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.5)] z-10">
                                      <Crown className="w-3 h-3 text-black" />
                                  </div>
                              )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                                <div className={`font-black text-sm tracking-tight ${isSuspended ? 'text-rose-400' : 'text-white'}`}>
                                  {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : 'İsimsiz Öğrenci'}
                                </div>
                                {user.isOnline && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" title="Şu an çevrimiçi"></div>}
                                {isMe && <span className="px-1.5 py-0.5 rounded bg-primary/20 text-[9px] font-black tracking-widest text-primary-light uppercase">Ben</span>}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1.5">
                              <Calendar className="w-3 h-3 opacity-50" />
                              {new Date(user.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })} kayıt
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* CONTACT COLUMN */}
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 text-xs font-semibold text-white/70 bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                            <Mail className="w-3.5 h-3.5 text-primary-light" /> {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-white/70 bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                              <Phone className="w-3.5 h-3.5 text-emerald-400" /> {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* ROLES COLUMN */}
                      <td className="px-6 py-5">
                          <div className="flex flex-col gap-2 items-start">
                            <button 
                              onClick={() => handleRoleToggle(user._id, user.role)}
                              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                user.role === 'admin' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                  : 'bg-white/5 text-text-muted border-white/10 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5'
                              }`}
                            >
                              {user.role === 'admin' ? <span className="flex items-center gap-1.5"><Shield className="w-3 h-3"/> YÖNETİCİ (KALDIR)</span> : '+ YÖNETİCİ YAP'}
                            </button>
                            <button 
                              onClick={() => handleProToggle(user._id)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                user.proStatus 
                                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 hover:from-amber-500 hover:to-orange-500 hover:text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                                  : 'bg-white/5 text-text-muted border-white/10 hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/5'
                              }`}
                            >
                              {user.proStatus ? <><Crown className="w-3.5 h-3.5" /> PRO İPTAL ET</> : <><Star className="w-3.5 h-3.5 opacity-60" /> + PRO ÜYELİK VER</>}
                            </button>
                         </div>
                      </td>

                      {/* STATUS COLUMN */}
                      <td className="px-6 py-5">
                        <button 
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          disabled={isMe}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            isMe ? 'opacity-30 cursor-not-allowed border-transparent bg-white/5 text-white' :
                            isSuspended 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          }`}
                        >
                          {isSuspended ? <><UserX className="w-3.5 h-3.5" /> BANLANDI</> : <><UserCheck className="w-3.5 h-3.5" /> GÜVENLİ</>}
                        </button>
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {user.role === 'user' && (
                            <button 
                              onClick={() => handleOpenStats(user._id)}
                              className="p-2.5 bg-primary/10 border border-primary/20 text-primary-light rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg"
                              title="Detaylı Analiz Gör"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                           )}

                           <button 
                             onClick={() => handleDelete(user._id)}
                             disabled={isMe}
                             className={`p-2.5 rounded-xl transition-all border ${
                               isMe 
                               ? 'opacity-30 cursor-not-allowed bg-transparent border-transparent text-text-muted'
                               : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white shadow-lg'
                             }`}
                             title="Hesabı Yokol"
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
        
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex justify-between items-center text-[10px] font-black text-text-muted uppercase tracking-widest">
            <span>Toplam {filteredUsers.length} Bağlantı Tespiti</span>
            <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/10">Engine v2.1</span>
          </div>
        )}
      </motion.div>

      {/* USER ANALYSIS MODAL (PREMIUM UI) */}
      <AnimatePresence>
        {statsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
              animate={{ opacity: 1, backdropFilter: "blur(10px)" }} 
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setStatsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-bg-card border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 flex items-center justify-between bg-black/40 border-b border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[20px] bg-primary/20 border-2 border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <Activity className="w-7 h-7 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Kullanıcı Derin Analizi</h2>
                    <p className="text-xs text-primary-light uppercase tracking-widest font-bold mt-1">Simülasyon Motoru Raporu</p>
                  </div>
                </div>
                <button onClick={() => setStatsModalOpen(false)} className="p-2.5 bg-white/5 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                {loadingStats ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <span className="text-primary-light font-black text-xs uppercase tracking-widest animate-pulse">Sinir Ağları Taranıyor...</span>
                  </div>
                ) : selectedUserStats ? (
                  <div className="space-y-8">
                     
                     {/* Identity Card */}
                     <div className="flex items-center justify-between bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 p-6 rounded-[24px]">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-full bg-black/50 border-2 border-white/10 flex items-center justify-center">
                            <User className="text-white/40 w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-black text-white text-xl tracking-tight flex items-center gap-3">
                              {selectedUserStats.user.firstName} {selectedUserStats.user.lastName} 
                              {selectedUserStats.user.proStatus && <span className="px-2.5 py-0.5 bg-amber-400 text-black rounded uppercase text-[10px] font-black shadow-[0_0_10px_rgba(251,191,36,0.4)]">PRO</span>}
                            </div>
                            <div className="text-sm font-medium text-white/50 flex items-center gap-2 mt-1">
                                <Mail className="w-3.5 h-3.5" /> {selectedUserStats.user.email}
                            </div>
                          </div>
                        </div>
                        <div className="text-right bg-black/40 px-6 py-3 rounded-[20px] border border-white/5">
                           <div className="text-[10px] text-text-muted uppercase tracking-widest font-black">Algoritma XP</div>
                           <div className="text-3xl font-black text-primary-light">{selectedUserStats.user.totalScore}</div>
                        </div>
                     </div>

                     {/* Stat Cards */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ReportCard title="Yapay Zeka Onayı" value={`%${selectedUserStats.stats.successRate}`} icon={Target} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                        <ReportCard title="Simülasyon" value={selectedUserStats.stats.totalExams} icon={Activity} color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />
                        <ReportCard title="Çözülen Düğüm" value={selectedUserStats.stats.totalQuestions} icon={PieChart} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
                        <ReportCard title="Ateş Serisi" value={`${selectedUserStats.stats.streak} Gün`} icon={Flame} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20" />
                     </div>

                     {/* Progress Visualizer */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/30 border border-white/5 rounded-[24px] p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] group-hover:bg-emerald-500/10 transition-all"></div>
                            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Geçme Garantisi Analizi</h3>
                            <div className="space-y-5 relative z-10">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Tamamlanan Sınavlar</span>
                                    <span className="font-black text-emerald-400 text-lg">{selectedUserStats.stats.passedCount}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(selectedUserStats.stats.passedCount / Math.max(selectedUserStats.stats.totalExams, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Başarısız Simülasyonlar</span>
                                    <span className="font-black text-rose-400 text-lg">{selectedUserStats.stats.failedCount}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full bg-rose-400 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${(selectedUserStats.stats.failedCount / Math.max(selectedUserStats.stats.totalExams, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-[24px] p-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-all"></div>
                            <h3 className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-6 flex items-center gap-2"><PieChart className="w-4 h-4" /> Soru Algoritması Performansı</h3>
                            <div className="space-y-5 relative z-10">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Kusursuz Kararlar</span>
                                    <span className="font-black text-primary-light text-lg">{selectedUserStats.stats.totalCorrect}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${(selectedUserStats.stats.totalCorrect / Math.max(selectedUserStats.stats.totalQuestions, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/80">Kritik Hatalar</span>
                                    <span className="font-black text-amber-400 text-lg">{selectedUserStats.stats.totalWrong}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                     <div className="h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${(selectedUserStats.stats.totalWrong / Math.max(selectedUserStats.stats.totalQuestions, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                            </div>
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

    </div>
  );
};

// Top KPIs Components
const StatsCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="glass-card p-6 rounded-[24px] border border-white/5 flex items-center gap-5 hover:bg-white/[0.02] hover:border-white/10 transition-all relative overflow-hidden group">
    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 border border-white/5 ${bg} ${color} relative z-10`}>
      <Icon className="w-7 h-7" />
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-white leading-none mt-1">{value}</p>
    </div>
    <div className={`absolute -right-6 -bottom-6 opacity-[0.03] scale-150 rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110 ${color}`}>
        <Icon className="w-32 h-32" />
    </div>
  </div>
);

// Detail Cards inside Modal
const ReportCard = ({ title, value, icon: Icon, color, bg, border }) => (
  <div className={`bg-black/20 border ${border} rounded-[20px] p-5 flex flex-col items-start gap-3 relative overflow-hidden group hover:bg-white/[0.02] transition-colors`}>
    <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-bl-[100px] opacity-20 transition-all group-hover:scale-110`}></div>
    <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${bg} ${color} relative z-10`}>
       <Icon className="w-5 h-5" />
    </div>
    <div className="relative z-10">
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-widest text-white/50 mt-1">{title}</div>
    </div>
  </div>
);

export default AdminUsers;
