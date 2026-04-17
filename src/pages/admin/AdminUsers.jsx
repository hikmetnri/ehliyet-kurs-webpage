import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Search, User, Shield, Star, Crown, 
  Trash2, Mail, Phone, Calendar, RefreshCw, 
  MoreVertical, CheckCircle2, XCircle, AlertTriangle, UserX, UserCheck,
  BarChart2, X, Target, TrendingUp, PieChart, Activity, Flame
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'user'
  
  // Analiz/İstatistik Modeli States
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
      const res = await api.get('/users');
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

  // Kullanıcı İstatistiklerini Getir
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
    const matchesSearch = (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // İstatistikler
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const proCount = users.filter(u => u.proStatus).length;
  const inactiveCount = users.filter(u => u.isActive === false).length;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-text-secondary text-sm mt-1">Sisteme kayıtlı öğrencileri ve yöneticileri detaylı olarak kontrol edin.</p>
        </div>
        <button 
          onClick={() => fetchUsers()} 
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatsCard icon={User} label="Toplam Kullanıcı" value={totalUsers} color="text-primary-light" bg="bg-primary/20" border="border-primary/30" />
         <StatsCard icon={Shield} label="Yönetici Sayısı" value={adminCount} color="text-warning" bg="bg-warning/20" border="border-warning/30" />
         <StatsCard icon={Crown} label="PRO Üyeler" value={proCount} color="text-indigo-400" bg="bg-indigo-500/20" border="border-indigo-500/30" />
         <StatsCard icon={UserX} label="Askıda (Pasif)" value={inactiveCount} color="text-danger" bg="bg-danger/20" border="border-danger/30" />
      </div>

      {/* Filtre ve Arama Alanı */}
      <div className="p-4 bg-bg-card2 border border-white/5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-full">
          <Search className="w-5 h-5 text-text-muted mr-3" />
          <input 
            type="text" 
            placeholder="Kullanıcı adı, e-posta veya telefon ara..." 
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-text-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button onClick={() => setSearchTerm('')}><XCircle className="w-4 h-4 text-text-muted" /></button>}
        </div>
        
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl w-full md:w-auto">
          {['all', 'user', 'admin'].map(role => (
            <button 
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                roleFilter === role ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'
              }`}
            >
              {role === 'all' ? 'Tümü' : role === 'user' ? 'Öğrenci' : 'Yönetici'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-bg-card/50"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary min-w-[800px]">
            <thead className="bg-black/20 text-white/40 font-black uppercase text-[10px] tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-4 rounded-tl-3xl">Kullanıcı Bilgileri</th>
                <th className="px-6 py-4">İletişim</th>
                <th className="px-6 py-4">Statü Seçimi</th>
                <th className="px-6 py-4">Hesap Durumu</th>
                <th className="px-6 py-4 text-right rounded-tr-3xl">İşlemler</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <span className="text-text-muted font-bold text-xs uppercase tracking-widest">Veriler Yükleniyor...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-text-muted font-medium">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuspended = user.isActive === false;
                  
                  return (
                    <tr key={user._id} className={`group transition-all ${isSuspended ? 'bg-danger/5 hover:bg-danger/10' : 'hover:bg-white/[0.02]'}`}>
                      {/* Kullanıcı Bilgisi */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center border-2 shrink-0 ${isSuspended ? 'border-danger/30 bg-danger/10' : 'border-white/10 bg-white/5'}`}>
                            {user.role === 'admin' ? <Shield className={`w-5 h-5 ${isSuspended ? 'text-danger' : 'text-primary-light'}`} /> : <User className={`w-5 h-5 ${isSuspended ? 'text-danger' : 'text-white/70'}`} />}
                            {user.proStatus && <Crown className="w-3.5 h-3.5 text-warning absolute -top-1.5 -right-1.5 drop-shadow-md" />}
                          </div>
                          <div>
                            <div className={`font-black text-sm tracking-tight ${isSuspended ? 'text-danger' : 'text-white'}`}>
                              {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : 'İsimsiz Kullanıcı'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* İletişim */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                            <Mail className="w-3.5 h-3.5 opacity-50" /> {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                              <Phone className="w-3.5 h-3.5 opacity-50" /> {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Rol ve Statü */}
                      <td className="px-6 py-4">
                         <div className="flex flex-col gap-2 items-start">
                            <button 
                              onClick={() => handleRoleToggle(user._id, user.role)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                user.role === 'admin' 
                                  ? 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20' 
                                  : 'bg-white/5 text-text-muted border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/30'
                              }`}
                            >
                              {user.role === 'admin' ? 'YÖNETİCİ' : 'ÖĞRENCİ'}
                            </button>
                            <button 
                              onClick={() => handleProToggle(user._id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                user.proStatus 
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20' 
                                  : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {user.proStatus ? <><Crown className="w-3.5 h-3.5" /> PRO ÜYE</> : <><Star className="w-3.5 h-3.5 opacity-40" /> FREE ÜYE</>}
                            </button>
                         </div>
                      </td>

                      {/* Aktif/Pasif Durumu */}
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          disabled={user._id === currentUser?._id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            user._id === currentUser?._id ? 'opacity-50 cursor-not-allowed border-transparent bg-transparent text-text-muted' :
                            isSuspended 
                              ? 'bg-danger/10 text-danger border-danger/30 hover:shadow-lg hover:shadow-danger/20' 
                              : 'bg-success/10 text-success border-success/30 hover:shadow-lg hover:shadow-success/20'
                          }`}
                        >
                          {isSuspended ? <><UserX className="w-3.5 h-3.5" /> ASKIYA ALINDI</> : <><UserCheck className="w-3.5 h-3.5" /> AKTİF DURUMDA</>}
                        </button>
                      </td>

                      {/* İşlemler */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {/* Öğrenci Analizi Butonu */}
                           {user.role === 'user' && (
                            <button 
                              onClick={() => handleOpenStats(user._id)}
                              className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 text-primary-light rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                              title="Detaylı Analiz Gör"
                            >
                              <BarChart2 className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-wider">Analiz Et</span>
                            </button>
                           )}

                           {/* Sil Butonu */}
                           <button 
                             onClick={() => handleDelete(user._id)}
                             disabled={user._id === currentUser?._id}
                             className={`p-2.5 rounded-xl transition-all border ${
                               user._id === currentUser?._id 
                               ? 'opacity-30 cursor-not-allowed bg-transparent border-transparent text-text-muted'
                               : 'bg-danger/10 text-danger border-danger/30 hover:bg-danger hover:text-white shadow-lg shadow-danger/10'
                             }`}
                             title="Kullanıcıyı Sil"
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
          <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex justify-between items-center text-[11px] font-bold text-text-muted uppercase tracking-widest">
            <span>Toplam {filteredUsers.length} kullanıcı</span>
            <span>Gösterilen: Tümü</span>
          </div>
        )}
      </motion.div>

      {/* KULLANICI ANALİZ MODALI */}
      <AnimatePresence>
        {statsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setStatsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                    <BarChart2 className="w-6 h-6 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Öğrenci Analiz Raporu</h2>
                    <p className="text-sm text-text-muted">Kullanıcının sistemdeki tüm deneme ve soru geçmişi verileri.</p>
                  </div>
                </div>
                <button onClick={() => setStatsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-white/50" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                {loadingStats ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <span className="text-text-muted font-bold text-sm uppercase tracking-widest">Veriler İşleniyor...</span>
                  </div>
                ) : selectedUserStats ? (
                  <div className="space-y-6">
                     
                     {/* Kullanıcı Kartı (Minimal) */}
                     <div className="flex items-center justify-between bg-black/20 border border-white/5 p-4 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <User className="text-white/50 w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-base">
                              {selectedUserStats.user.firstName} {selectedUserStats.user.lastName} 
                              {selectedUserStats.user.proStatus && <span className="ml-2 px-2 py-0.5 bg-warning/20 text-warning rounded text-[10px] uppercase">PRO ÜYE</span>}
                            </div>
                            <div className="text-xs text-text-muted">{selectedUserStats.user.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Kullanıcı Puanı</div>
                           <div className="text-xl font-black text-primary-light">{selectedUserStats.user.totalScore} <span className="text-sm text-white/50">XP</span></div>
                        </div>
                     </div>

                     {/* İstatistik Göstergeleri */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ReportCard title="Başarı Oranı" value={`%${selectedUserStats.stats.successRate}`} icon={Target} color="text-success" bg="bg-success/20" />
                        <ReportCard title="Çözülen Sınav" value={selectedUserStats.stats.totalExams} icon={Activity} color="text-primary-light" bg="bg-primary/20" />
                        <ReportCard title="Toplam Soru" value={selectedUserStats.stats.totalQuestions} icon={PieChart} color="text-indigo-400" bg="bg-indigo-500/20" />
                        <ReportCard title="Seri (Streak)" value={`${selectedUserStats.stats.streak} Gün`} icon={Flame} color="text-warning" bg="bg-warning/20" />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-bg-card2 border border-white/5 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Sınav Durumları</h3>
                            <div className="flex items-center gap-6">
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white">Geçilen Sınavlar</span>
                                    <span className="font-black text-success">{selectedUserStats.stats.passedCount}</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                                     <div className="h-full bg-success rounded-full" style={{ width: `${(selectedUserStats.stats.passedCount / Math.max(selectedUserStats.stats.totalExams, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white">Kaldığı Sınavlar</span>
                                    <span className="font-black text-danger">{selectedUserStats.stats.failedCount}</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                                     <div className="h-full bg-danger rounded-full" style={{ width: `${(selectedUserStats.stats.failedCount / Math.max(selectedUserStats.stats.totalExams, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-bg-card2 border border-white/5 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Soru Cevaplama Grafiği</h3>
                            <div className="flex items-center gap-6">
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white">Doğru Cevaplar</span>
                                    <span className="font-black text-primary-light">{selectedUserStats.stats.totalCorrect}</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                                     <div className="h-full bg-primary rounded-full" style={{ width: `${(selectedUserStats.stats.totalCorrect / Math.max(selectedUserStats.stats.totalQuestions, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white">Yanlış Cevaplar</span>
                                    <span className="font-black text-warning">{selectedUserStats.stats.totalWrong}</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                                     <div className="h-full bg-warning rounded-full" style={{ width: `${(selectedUserStats.stats.totalWrong / Math.max(selectedUserStats.stats.totalQuestions, 1)) * 100}%` }}></div>
                                  </div>
                                </div>
                            </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-text-muted">Kullanıcı verisi bulunamadı.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Basit istatistik kartı componenti (Tepe Alanı İçin)
const StatsCard = ({ icon: Icon, label, value, color, bg, border }) => (
  <div className="glass-card p-5 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${bg} ${color} ${border}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  </div>
);

// Report Modal İçi Kart Componenti
const ReportCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-bg-card2 border border-white/5 rounded-2xl p-4 flex flex-col items-start gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color}`}>
       <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">{title}</div>
    </div>
  </div>
);

export default AdminUsers;
