import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Settings2, Plus, X, Save } from 'lucide-react';

const MotionDiv = motion.div;

const CategoryModal = ({ open, cat, form, saving, categories, onChange, onClose, onSave }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
        <MotionDiv
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: form.color || '#6366f1' }}
              >
                {cat ? <Settings2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">{cat ? 'Kategori Ayarları' : 'Yeni Kategori'}</h2>
                <p className="text-[11px] text-text-muted">{cat?.name || 'Yeni öğe oluştur'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Kategori Adı *</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-primary/50 focus:bg-primary/5 focus:ring-4 focus:ring-primary/20 transition-all"
                placeholder="Kategori adı..."
                value={form.name}
                onChange={e => onChange(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Kısa Açıklama</label>
              <textarea
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:bg-primary/5 focus:ring-4 focus:ring-primary/20 transition-all resize-none placeholder:text-white/20"
                placeholder="Kısa açıklama..."
                value={form.description}
                onChange={e => onChange(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Kapak Görseli Yolu</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:bg-primary/5 focus:ring-4 focus:ring-primary/20 transition-all font-mono"
                placeholder="Örn: assets/content/motor.png"
                value={form.image}
                onChange={e => onChange(f => ({ ...f, image: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Üst Kategori</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:bg-primary/5 focus:ring-4 focus:ring-primary/20 transition-all"
                value={form.parent || ''}
                onChange={e => onChange(f => ({ ...f, parent: e.target.value || null }))}
              >
                <option value="" className="bg-bg-card">(Root — Ana Dizin)</option>
                {categories.filter(c => c._id !== cat?._id).map(c => (
                  <option key={c._id} value={c._id} className="bg-bg-card">{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Renk</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="w-12 h-10 bg-transparent cursor-pointer rounded-xl border-none"
                    value={form.color}
                    onChange={e => onChange(f => ({ ...f, color: e.target.value }))}
                  />
                  <span className="text-sm text-text-secondary font-mono">{form.color}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Durum</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onChange(f => ({ ...f, isActive: !f.isActive }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.isActive
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'bg-danger/10 border-danger/30 text-danger'}`}
                  >
                    {form.isActive ? '✓ Aktif' : '✗ Gizli'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(f => ({ ...f, isPro: !f.isPro }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.isPro
                      ? 'bg-warning/10 border-warning/30 text-warning'
                      : 'bg-white/5 border-white/10 text-text-muted'}`}
                  >
                    {form.isPro ? '💎 PRO' : '🔓 Free'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-white/10 flex items-center justify-end gap-3">
            <button onClick={onClose} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">İptal</button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-md shadow-primary/10 hover:bg-primary-dark hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {cat ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </MotionDiv>
      </div>
    )}
  </AnimatePresence>
);

export default CategoryModal;
