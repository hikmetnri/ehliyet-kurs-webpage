import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Plus, Award, Edit, Trash2, X, Save, 
  Settings2, Target, Flame, CheckCircle2, History,
  LayoutGrid, List, Search, Info, Palette, Type,
  BarChart3, Star, Trophy, Zap, Crown, Shield, Gem, Medal, Rocket, Heart
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
    } catch (err) {
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
    } catch (err) {
      alert("Rozet silinemedi.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Kazanım & Rozet Yönetimi</h1>
          <p className="text-text-secondary text-sm mt-1">Öğrencilerin gelişimini ödüllendiren sistem rozetlerini tasarlayın.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-light transition-all shadow-xl shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Yeni Rozet Ekle
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <span className="text-[10px] font-black text-primary-light uppercase tracking-widest animate-pulse">Rozetler Yükleniyor...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <motion.div 
              key={badge._id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-bg-card border border-white/5 rounded-[32px] p-8 relative group overflow-hidden hover:border-white/20 transition-all"
            >
              <div className="absolute -right-4 -top-4 w-32 h-32 opacity-10 blur-2xl rounded-full" style={{ backgroundColor: badge.color }}></div>
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div 
                   className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-2xl relative"
                   style={{ backgroundColor: `${badge.color}20`, border: `2px solid ${badge.color}40` }}
                >
                   <div className="absolute inset-0 blur-lg opacity-40 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: badge.color }}></div>
                   <BadgeIcon name={badge.icon} className="w-10 h-10 relative z-10" style={{ color: badge.color }} />
                </div>
                
                <h3 className="text-xl font-black text-white mb-2 leading-none">{badge.name}</h3>
                <p className="text-xs text-text-muted font-medium line-clamp-2 mb-6 h-8">{badge.description}</p>
                
                <div className="w-full flex items-center justify-center gap-2 mb-6">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-white/50 uppercase tracking-widest border border-white/5">
                        {badgeTypes.find(t => t.id === badge.type)?.label || badge.type}
                    </span>
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary-light uppercase tracking-widest border border-primary/20">
                        {badge.requiredValue} Hedef
                    </span>
                </div>

                <div className="flex gap-2 w-full mt-auto">
                    <button 
                        onClick={() => handleOpenModal(badge)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
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
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
               onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-bg-card border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
                <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Settings2 className="w-6 h-6 text-primary-light" />
                        </div>
                        <h2 className="text-xl font-black text-white">{editingBadge ? 'Rozeti Güncelle' : 'Yeni Rozet Oluştur'}</h2>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-text-muted" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Rozet İsmi</label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Örn: Hız Tutkunu"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:border-primary/50 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Açıklama</label>
                                <textarea 
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Bu rozet neden veriliyor?"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:border-primary/50 outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Preview and Visuals */}
                        <div className="flex flex-col items-center justify-center bg-black/30 rounded-[32px] border border-white/5 p-6 space-y-6">
                            <div 
                                className="w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl relative"
                                style={{ backgroundColor: `${formData.color}20`, border: `2px solid ${formData.color}40` }}
                            >
                                <BadgeIcon name={formData.icon} className="w-12 h-12 relative z-10" style={{ color: formData.color }} />
                                <div className="absolute inset-0 blur-xl opacity-30" style={{ backgroundColor: formData.color }}></div>
                            </div>
                            
                            <div className="w-full space-y-4">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Simge Seçimi</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {lucideIcons.map(iconName => (
                                            <button 
                                                key={iconName}
                                                type="button"
                                                onClick={() => setFormData({...formData, icon: iconName})}
                                                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${formData.icon === iconName ? 'bg-primary/20 border-primary/50 text-white' : 'bg-black/20 border-white/5 text-white/30 hover:text-white'}`}
                                            >
                                                <BadgeIcon name={iconName} className="w-4 h-4" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Renk Seçimi</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#8b5cf6', '#0ea5e9'].map(c => (
                                            <button 
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData({...formData, color: c})}
                                                className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent scale-100'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-primary-light uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-4 h-4" /> Kazanım Kriterleri
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Kriter Türü</label>
                                <select 
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary/50"
                                >
                                    {badgeTypes.map(t => <option key={t.id} value={t.id} className="bg-bg-card">{t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Gerekli Değer / Hedef</label>
                                <input 
                                    required
                                    type="number" 
                                    value={formData.requiredValue}
                                    onChange={(e) => setFormData({...formData, requiredValue: parseInt(e.target.value)})}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary/50"
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
                            className="w-full py-5 bg-gradient-to-r from-primary to-accent text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center gap-3"
                        >
                            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Değişiklikleri Kaydet</>}
                        </button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminBadges;
