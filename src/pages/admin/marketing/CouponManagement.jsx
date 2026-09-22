import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Hash,
  Loader2,
  Pencil,
  Percent,
  Plus,
  RefreshCcw,
  Save,
  Tag,
  Ticket,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../../api';

const MotionDiv = motion.div;

const EMPTY_FORM = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  maxUsage: '',
  maxUsagePerUser: 1,
  expiresAt: '',
  description: '',
};

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/coupons');
      setCoupons(res.data?.data || []);
    } catch {
      setError('Kuponlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percent',
      discountValue: coupon.discountValue ?? '',
      maxUsage: coupon.maxUsage ?? '',
      maxUsagePerUser: coupon.maxUsagePerUser ?? 1,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      description: coupon.description || '',
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { setError('Kupon kodu zorunludur.'); return; }
    if (!form.discountValue || Number(form.discountValue) <= 0) { setError('İndirim değeri 0\'dan büyük olmalıdır.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        maxUsage: form.maxUsage === '' ? 0 : Number(form.maxUsage),
        maxUsagePerUser: Number(form.maxUsagePerUser) || 1,
        expiresAt: form.expiresAt || null,
      };
      if (editingId) {
        await api.put(`/subscriptions/coupons/${editingId}`, payload);
      } else {
        await api.post('/subscriptions/coupons', payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await fetchCoupons();
    } catch (err) {
      setError(err?.response?.data?.error || 'Kayıt sırasında hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await api.put(`/subscriptions/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
    } catch {
      setError('Durum güncellenemedi.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try {
      await api.delete(`/subscriptions/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch {
      setError('Kupon silinemedi.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDiscount = (c) =>
    c.discountType === 'percent' ? `%${c.discountValue}` : `₺${c.discountValue}`;

  const isExpired = (c) => c.expiresAt && new Date(c.expiresAt) < new Date();

  return (
    <div className="bg-white/[0.02] p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <Ticket className="w-6 h-6 text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white tracking-tight">Kupon Yönetimi</h2>
          <p className="text-xs text-text-muted font-bold mt-0.5">
            İndirim kuponları oluştur, düzenle ve kullanım istatistiklerini takip et
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-teal-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni Kupon
          </button>
        </div>
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 font-medium">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Form (oluştur / düzenle) */}
      {showForm && (
        <MotionDiv
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">
              {editingId ? 'Kuponu Düzenle' : 'Yeni Kupon Oluştur'}
            </p>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kod */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Kupon Kodu *
              </label>
              <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-teal-500/50 transition-all">
                <Hash className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="YENIYIL25"
                  className="flex-1 bg-transparent text-sm text-white font-mono outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {/* İndirim tipi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                İndirim Tipi *
              </label>
              <select
                value={form.discountType}
                onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all cursor-pointer"
              >
                <option value="percent">Yüzde (%)</option>
                <option value="fixed">Sabit Tutar (₺)</option>
              </select>
            </div>

            {/* İndirim değeri */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                İndirim Değeri *
              </label>
              <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-teal-500/50 transition-all">
                {form.discountType === 'percent'
                  ? <Percent className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  : <span className="text-text-muted text-sm font-bold shrink-0">₺</span>
                }
                <input
                  type="number"
                  min="1"
                  max={form.discountType === 'percent' ? 100 : undefined}
                  value={form.discountValue}
                  onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                  placeholder={form.discountType === 'percent' ? '20' : '50'}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Maks kullanım */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Toplam Kullanım Limiti
              </label>
              <input
                type="number"
                min="0"
                value={form.maxUsage}
                onChange={e => setForm(f => ({ ...f, maxUsage: e.target.value }))}
                placeholder="0 = sınırsız"
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all placeholder:text-white/20"
              />
            </div>

            {/* Kullanıcı başına limit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Kullanıcı Başına Limit
              </label>
              <input
                type="number"
                min="1"
                value={form.maxUsagePerUser}
                onChange={e => setForm(f => ({ ...f, maxUsagePerUser: e.target.value }))}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all"
              />
            </div>

            {/* Son kullanım tarihi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Son Kullanım Tarihi
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all"
              />
            </div>
          </div>

          {/* Açıklama */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Açıklama
            </label>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Yılbaşı indirimi — sadece yeni üyeler için"
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-teal-500/30 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editingId ? 'Güncelle' : 'Oluştur'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-white/5 border border-white/10 text-text-muted rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
            >
              İptal
            </button>
          </div>
        </MotionDiv>
      )}

      {/* Kupon listesi */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-teal-400" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Tag className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-sm font-bold text-white">Henüz kupon yok</p>
          <p className="text-xs text-text-muted mt-1">İlk indirimi oluşturmak için "Yeni Kupon" butonuna tıkla</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map(coupon => {
            const expired = isExpired(coupon);
            return (
              <MotionDiv
                key={coupon._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all ${
                  !coupon.isActive || expired
                    ? 'border-white/5 bg-white/[0.01] opacity-60'
                    : 'border-white/10 bg-white/[0.025] hover:border-white/20'
                }`}
              >
                {/* Sol: kod + bilgi */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white font-mono">{coupon.code}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset ${
                        expired
                          ? 'bg-red-500/10 text-red-400 ring-red-500/20'
                          : coupon.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20'
                      }`}>
                        {expired ? 'Süresi doldu' : coupon.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs font-bold text-teal-400">{formatDiscount(coupon)} indirim</span>
                      <span className="text-[10px] text-text-muted">
                        {coupon.usedCount} / {coupon.maxUsage > 0 ? coupon.maxUsage : '∞'} kullanım
                      </span>
                      {coupon.expiresAt && (
                        <span className="text-[10px] text-text-muted">
                          {new Date(coupon.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {coupon.description && (
                      <p className="text-[10px] text-text-muted mt-0.5 truncate max-w-xs">{coupon.description}</p>
                    )}
                  </div>
                </div>

                {/* Sağ: aksiyonlar */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    disabled={expired}
                    title={coupon.isActive ? 'Pasife al' : 'Aktif et'}
                    className={`p-2 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      coupon.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {coupon.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(coupon)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    disabled={deleting === coupon._id}
                    className="p-2 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-50"
                  >
                    {deleting === coupon._id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </MotionDiv>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
