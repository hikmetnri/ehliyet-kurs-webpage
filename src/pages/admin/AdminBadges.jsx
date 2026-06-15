import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Plus, Award, Edit, Trash2, X, Save,
  Settings2, Target, Flame, CheckCircle2, History,
  LayoutGrid, List, Search, Info, Palette, Type,
  BarChart3, Star, Trophy, Zap, Crown, Shield, Gem, Medal, Rocket, Heart,
  Users, CalendarDays, AtSign
} from 'lucide-react';

const ICON_MAP = { Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart };

const BadgeIcon = ({ name, ...props }) => {
  const Icon = ICON_MAP[name] || Award;
  return <Icon {...props} />;
};

const AdminBadges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [earnedUsersModal, setEarnedUsersModal] = useState({ open: false, badge: null, users: [], loading: false });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Award',
    type: 'exam_count',
    requiredValue: 0,
    color: '#6366f1'
  });

  const badgeTypes = [
    { id: 'exam_count', label: 'Sınav Tamamlama', icon: History, desc: 'Belirli sayıda sınav çözenler' },
    { id: 'question_count', label: 'Çözülen Soru', icon: Target, desc: 'Belirli sayıda soru çözenler' },
    { id: 'correct_count', label: 'Doğru Soru', icon: Target, desc: 'Belirli sayıda doğru yapanlar' },
    { id: 'streak', label: 'Seri (Gün)', icon: Flame, desc: 'Arka arkaya gün serisi' },
    { id: 'daily_goal', label: 'Günlük Hedef', icon: CheckCircle2, desc: 'Günlük hedefini tuturanlar' },
    { id: 'success_rate', label: 'Başarı Oranı', icon: BarChart3, desc: 'Global başarı oranı (%)' },
  ];

  const lucideIcons = ['Award', 'Star', 'Trophy', 'Zap', 'Crown', 'Target', 'Flame', 'Shield', 'Gem', 'Medal', 'Rocket', 'Heart'];

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/badges');
      // Backend return simple array or { success: true, data: [] }
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setBadges(data);
    } catch (err) {
      console.error('Rozetler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEarnedUsers = async (badge) => {
    setEarnedUsersModal({ open: true, badge, users: [], loading: true });
    try {
      const res = await api.get(`/badges/${badge._id}/earned-users`);
      setEarnedUsersModal(prev => ({ ...prev, users: res.data, loading: false }));
    } catch (err) {
      console.error('Kullanıcılar alınamadı:', err);
      setEarnedUsersModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOpenModal = (badge = null) => {
    if (badge) {
      setEditingBadge(badge);
      setFormData({
        name: badge.name,
        description: badge.description,
        icon: badge.icon || 'Award',
        type: badge.type || 'exam_count',
        requiredValue: badge.requiredValue || 0,
        color: badge.color || '#6366f1'
      });
    } else {
      setEditingBadge(null);
      setFormData({
        name: '',
        description: '',
        icon: 'Award',
        type: 'exam_count',
        requiredValue: 0,
        color: '#6366f1'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (editingBadge) {
        await api.put(`/badges/${editingBadge._id}`, formData);
      } else {
        await api.post('/badges', formData);
      }
      setIsModalOpen(false);
      fetchBadges();
    } catch {
      alert("Rozet kaydedilirken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu rozeti silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/badges/${id}`);
      fetchBadges();
    } catch {
      alert("Rozet silinemedi.");
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kazanım & Rozet Yönetimi</h1>
          <p className="text-text-secondary text-sm mt-1">Öğrencilerin gelişimini ödüllendiren sistem rozetlerini tasarlayın.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary-light transition-all"
        >
          <Plus className="w-4 h-4" /> Yeni Rozet Ekle
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest animate-pulse">Rozetler Yükleniyor...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <motion.div
              key={badge._id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 relative group overflow-hidden hover:border-white/20 transition-all"
            >
              <div className="absolute -right-4 -top-4 w-32 h-32 opacity-10 blur-2xl rounded-full" style={{ backgroundColor: badge.color }}></div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div
                   className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative"
                   style={{ backgroundColor: `${badge.color}10`, border: `1px solid ${badge.color}30` }}
                >
                   <div className="absolute inset-0 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: badge.color }}></div>
                   <BadgeIcon name={badge.icon} className="w-10 h-10 relative z-10" style={{ color: badge.color }} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 leading-none">{badge.name}</h3>
                <p className="text-xs text-text-muted font-medium line-clamp-2 mb-6 h-8">{badge.description}</p>

                <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-6">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white/50 uppercase tracking-widest border border-white/5">
                        {badgeTypes.find(t => t.id === badge.type)?.label || badge.type}
                    </span>
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary-light uppercase tracking-widest border border-primary/20">
                        {badge.requiredValue} Hedef
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                        {badge.earnedCount || 0} Kişi aldı
                    </span>
                </div>

                <div className="flex flex-col gap-2 w-full mt-auto">
                    <button
                        onClick={() => handleViewEarnedUsers(badge)}
                        className="w-full py-3 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-emerald-500/20"
                    >
                        <Users className="w-3.5 h-3.5" /> Kimlerin Aldığını Gör
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleOpenModal(badge)}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            Düzenle
                        </button>
                        <button
                            onClick={() => handleDelete(badge._id)}
                            className="p-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-xl"
               onClick={() => setIsModalOpen(false)}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-bg-card border border-white/10 rounded-3xl overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Settings2 className="w-6 h-6 text-primary-light" />
                        </div>
                        <h2 className="text-xl font-bold text-white">{editingBadge ? 'Rozeti Güncelle' : 'Yeni Rozet Oluştur'}</h2>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-text-muted" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Rozet İsmi</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Örn: Hız Tutkunu"
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 focus:border-primary/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Açıklama</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Bu rozet neden veriliyor?"
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 focus:border-primary/50 outline-none resize-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Preview and Visuals */}
                        <div className="flex flex-col items-center justify-center bg-white/[0.01] rounded-3xl border border-white/10 p-6 space-y-6">
                            <div
                                className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                                style={{ backgroundColor: `${formData.color}10`, border: `1px solid ${formData.color}30` }}
                            >
                                <BadgeIcon name={formData.icon} className="w-12 h-12 relative z-10" style={{ color: formData.color }} />
                                <div className="absolute inset-0 blur-xl opacity-20" style={{ backgroundColor: formData.color }}></div>
                            </div>

                            <div className="w-full space-y-4">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Simge Seçimi</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {lucideIcons.map(iconName => (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setFormData({...formData, icon: iconName})}
                                                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${formData.icon === iconName ? 'bg-primary/20 border-primary/50 text-white' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white'}`}
                                            >
                                                <BadgeIcon name={iconName} className="w-4 h-4" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Renk Seçimi</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#8b5cf6', '#0ea5e9'].map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData({...formData, color: c})}
                                                className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'scale-125 border-white' : 'border-transparent scale-100'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-primary-light uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-4 h-4" /> Kazanım Kriterleri
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Kriter Türü</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-primary/50 transition-all select-dark-options"
                                >
                                    {badgeTypes.map(t => <option key={t.id} value={t.id} className="bg-bg-card">{t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Gerekli Değer / Hedef</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.requiredValue}
                                    onChange={(e) => setFormData({...formData, requiredValue: parseInt(e.target.value)})}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-primary/50 transition-all"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-text-muted font-bold italic leading-relaxed">
                            * {badgeTypes.find(t => t.id === formData.type)?.desc}. Sistem bu değere ulaşıldığında rozeti otomatik olarak verir.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={isSaving}
                            className="w-full py-4.5 bg-primary hover:bg-primary-light text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
                        >
                            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Değişiklikleri Kaydet</>}
                        </button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Earned Users Modal */}
      <AnimatePresence>
        {earnedUsersModal.open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xl"
              onClick={() => setEarnedUsersModal(prev => ({ ...prev, open: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-bg-card border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
                <div className="flex items-center gap-4">
                  {earnedUsersModal.badge && (
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${earnedUsersModal.badge.color}15`,
                        border: `1px solid ${earnedUsersModal.badge.color}30`
                      }}
                    >
                      <BadgeIcon name={earnedUsersModal.badge.icon} className="w-6 h-6" style={{ color: earnedUsersModal.badge.color }} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white">{earnedUsersModal.badge?.name}</h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Bu rozeti kazanan <span className="text-emerald-400 font-bold">{earnedUsersModal.users.length}</span> kullanıcı
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEarnedUsersModal(prev => ({ ...prev, open: false }))}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-text-muted" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {earnedUsersModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="text-xs text-text-muted font-bold uppercase tracking-widest animate-pulse">Yükleniyor...</span>
                  </div>
                ) : earnedUsersModal.users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-sm font-bold text-white/30">Bu rozeti henüz kimse kazanmadı</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {earnedUsersModal.users.map((user, idx) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-center gap-4 px-8 py-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary-light">
                            {(user.firstName?.[0] || '?').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <AtSign className="w-3 h-3 text-text-muted" />
                            <span className="text-xs text-text-muted truncate">{user.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                            {user.earnedAt ? new Date(user.earnedAt).toLocaleDateString('tr-TR') : '-'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
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

export default AdminBadges;
