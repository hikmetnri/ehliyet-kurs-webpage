import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Plus, Award, Trash2, X, Save,
  Settings2, Target, Flame, CheckCircle2,
  Search, RefreshCw, Users, CalendarDays,
  AtSign, Star, Trophy, Zap, Crown, Shield,
  Gem, Medal, Rocket, Heart, Inbox
} from 'lucide-react';

const ICON_MAP = { Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart };
const BadgeIcon = ({ name, ...props }) => {
  const Icon = ICON_MAP[name] || Award;
  return <Icon {...props} />;
};

const BADGE_TYPES = [
  { id: 'exam_count',    label: 'Sınav Tamamlama', icon: CheckCircle2, desc: 'Belirli sayıda sınav çözenler' },
  { id: 'question_count', label: 'Çözülen Soru',  icon: Target,       desc: 'Belirli sayıda soru çözenler' },
  { id: 'correct_count', label: 'Doğru Soru',     icon: Target,       desc: 'Belirli sayıda doğru yapanlar' },
  { id: 'streak',        label: 'Seri (Gün)',      icon: Flame,        desc: 'Arka arkaya gün serisi' },
  { id: 'daily_goal',   label: 'Günlük Hedef',    icon: CheckCircle2, desc: 'Günlük hedefini tuturanlar' },
  { id: 'success_rate', label: 'Başarı Oranı',    icon: Star,         desc: 'Global başarı oranı (%)' },
];

const LUCIDE_ICONS = ['Award', 'Star', 'Trophy', 'Zap', 'Crown', 'Target', 'Flame', 'Shield', 'Gem', 'Medal', 'Rocket', 'Heart'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#8b5cf6', '#0ea5e9', '#14b8a6'];

const EMPTY_FORM = { name: '', description: '', icon: 'Award', type: 'exam_count', requiredValue: 1, color: '#6366f1' };

const AdminBadges = () => {
  const [badges, setBadges]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [isModalOpen, setModal]   = useState(false);
  const [editingBadge, setEditing] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [earnedModal, setEarned]  = useState({ open: false, badge: null, users: [], loading: false });

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/badges');
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setBadges(data);
    } catch (err) {
      console.error('Rozetler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBadges(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (badge) => {
    setEditing(badge);
    setForm({
      name: badge.name,
      description: badge.description,
      icon: badge.icon || 'Award',
      type: badge.type || 'exam_count',
      requiredValue: badge.requiredValue || 1,
      color: badge.color || '#6366f1',
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingBadge) {
        await api.put('/badges/' + editingBadge._id, form);
      } else {
        await api.post('/badges', form);
      }
      setModal(false);
      fetchBadges();
    } catch {
      alert('Rozet kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu rozeti silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete('/badges/' + id);
      fetchBadges();
    } catch {
      alert('Rozet silinemedi.');
    }
  };

  const handleViewEarned = async (badge) => {
    setEarned({ open: true, badge, users: [], loading: true });
    try {
      const res = await api.get('/badges/' + badge._id + '/earned-users');
      setEarned(prev => ({ ...prev, users: res.data, loading: false }));
    } catch {
      setEarned(prev => ({ ...prev, loading: false }));
    }
  };

  const filtered = badges.filter(b =>
    (b.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const typeLabel = (type) => BADGE_TYPES.find(t => t.id === type)?.label || type;
  const typeDesc  = (type) => BADGE_TYPES.find(t => t.id === type)?.desc || '';

  return (
    <div className="space-y-6 pb-10">

      {/* Page Header */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-primary-light uppercase tracking-widest">Gamification</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">Kazanım & Rozet Yönetimi</h1>
            <p className="mt-1 text-sm text-text-muted">
              Öğrencilerin gelişimini ödüllendiren sistem rozetlerini tasarlayın.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-center">
              <p className="text-lg font-black text-white">{badges.length}</p>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Rozet</p>
            </div>
            <button
              onClick={fetchBadges}
              disabled={loading}
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] text-text-muted hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <RefreshCw className={"w-4 h-4 " + (loading ? 'animate-spin' : '')} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-light transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Rozet
            </button>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white/[0.02] rounded-2xl px-4 py-3 border border-white/10 focus-within:border-primary/40 transition-all max-w-sm">
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input
          type="text"
          placeholder="Rozet ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm w-full text-white placeholder:text-white/25 font-medium"
        />
      </div>

      {/* Badge Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <span className="text-xs font-bold text-primary-light uppercase tracking-widest">Yükleniyor...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
          <Inbox className="w-14 h-14 text-white/10 mb-4" />
          <p className="text-base font-bold text-white">Rozet bulunamadı</p>
          <p className="text-sm text-text-muted mt-1">İlk rozeti oluşturmak için "Yeni Rozet" butonuna tıklayın.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(badge => (
            <motion.div
              key={badge._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-white/[0.025] border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-white/20 transition-all"
            >
              {/* Glow background */}
              <div
                className="absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: badge.color }}
              />

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative"
                  style={{ backgroundColor: badge.color + '15', border: '1px solid ' + badge.color + '30' }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: badge.color }}
                  />
                  <BadgeIcon name={badge.icon} className="w-8 h-8 relative z-10" style={{ color: badge.color }} />
                </div>

                <h3 className="text-base font-bold text-white mb-1 leading-tight">{badge.name}</h3>
                <p className="text-xs text-text-muted line-clamp-2 mb-4 min-h-[32px]">{badge.description}</p>

                {/* Meta badges */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
                  <span className="px-2.5 py-1 bg-white/5 rounded-full text-[9px] font-bold text-white/50 uppercase tracking-widest border border-white/5">
                    {typeLabel(badge.type)}
                  </span>
                  <span className="px-2.5 py-1 bg-primary/10 rounded-full text-[9px] font-bold text-primary-light uppercase tracking-widest border border-primary/20">
                    {badge.requiredValue} Hedef
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 rounded-full text-[9px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                    {badge.earnedCount || 0} Kişi
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => handleViewEarned(badge)}
                    className="w-full py-2.5 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-emerald-500/20"
                  >
                    <Users className="w-3.5 h-3.5" /> Kazananları Gör
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(badge)}
                      className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(badge._id)}
                      className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0d1017] border border-white/10 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-primary-light" />
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {editingBadge ? 'Rozeti Güncelle' : 'Yeni Rozet Oluştur'}
                  </h2>
                </div>
                <button onClick={() => setModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSave} className="overflow-y-auto custom-scrollbar flex-1">
                <div className="p-6 space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Form fields */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Rozet İsmi *</label>
                        <input
                          required
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Örn: Hız Tutkunu"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Açıklama *</label>
                        <textarea
                          required
                          rows={3}
                          value={form.description}
                          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Bu rozet neden veriliyor?"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-primary/50 outline-none resize-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="flex flex-col items-center justify-center bg-white/[0.015] rounded-3xl border border-white/10 p-5 gap-4">
                      <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
                        style={{ backgroundColor: form.color + '15', border: '1px solid ' + form.color + '30' }}
                      >
                        <div className="absolute inset-0 rounded-3xl blur-xl opacity-20" style={{ backgroundColor: form.color }} />
                        <BadgeIcon name={form.icon} className="w-10 h-10 relative z-10" style={{ color: form.color }} />
                      </div>
                      <p className="text-sm font-bold text-white text-center">{form.name || 'Rozet Adı'}</p>

                      {/* Icon picker */}
                      <div className="w-full space-y-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Simge</p>
                        <div className="grid grid-cols-6 gap-1.5">
                          {LUCIDE_ICONS.map(name => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, icon: name }))}
                              className={"w-8 h-8 rounded-xl border flex items-center justify-center transition-all " + (form.icon === name ? 'bg-primary/20 border-primary/50 text-white' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white')}
                            >
                              <BadgeIcon name={name} className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color picker */}
                      <div className="w-full space-y-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Renk</p>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, color: c }))}
                              className={"w-7 h-7 rounded-full border-2 transition-transform " + (form.color === c ? 'scale-125 border-white' : 'border-transparent scale-100')}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Criteria */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-primary-light uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-3.5 h-3.5" /> Kazanım Kriterleri
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Kriter Türü</label>
                        <select
                          value={form.type}
                          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-all cursor-pointer"
                        >
                          {BADGE_TYPES.map(t => (
                            <option key={t.id} value={t.id} className="bg-[#0d1017]">{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Hedef Değer</label>
                        <input
                          required
                          type="number"
                          min="1"
                          value={form.requiredValue}
                          onChange={e => setForm(f => ({ ...f, requiredValue: parseInt(e.target.value) || 1 }))}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-text-muted italic">
                      * {typeDesc(form.type)}. Sistem bu değere ulaşıldığında rozeti otomatik verir.
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 pb-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingBadge ? 'Güncelle' : 'Rozeti Oluştur'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Earned Users Modal */}
      <AnimatePresence>
        {earnedModal.open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setEarned(p => ({ ...p, open: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-lg bg-[#0d1017] border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/30 shrink-0">
                <div className="flex items-center gap-3">
                  {earnedModal.badge && (
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: earnedModal.badge.color + '15', border: '1px solid ' + earnedModal.badge.color + '30' }}
                    >
                      <BadgeIcon name={earnedModal.badge.icon} className="w-5 h-5" style={{ color: earnedModal.badge.color }} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-white">{earnedModal.badge?.name}</h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      <span className="text-emerald-400 font-bold">{earnedModal.users.length}</span> kullanıcı kazandı
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEarned(p => ({ ...p, open: false }))}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {earnedModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs text-text-muted font-bold uppercase tracking-widest">Yükleniyor...</span>
                  </div>
                ) : earnedModal.users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                      <Users className="w-7 h-7 text-white/15" />
                    </div>
                    <p className="text-sm font-bold text-white/30">Bu rozeti henüz kimse kazanmadı</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {earnedModal.users.map((user, idx) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-black text-primary-light">
                            {(user.firstName?.[0] || '?').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <AtSign className="w-3 h-3 text-text-muted" />
                            <span className="text-xs text-text-muted truncate">{user.email}</span>
                          </div>
                        </div>
                        {user.earnedAt && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400">
                              {new Date(user.earnedAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        )}
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
