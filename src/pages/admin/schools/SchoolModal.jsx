import React from 'react';
import { motion as Motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import { TURKEY_CITIES, getDistrictsForCity } from '../../../data/turkeyLocations';
import { addMonthsForInput, todayInput } from './schoolHelpers';

const SchoolModal = ({ form, setForm, editing, saving, onClose, onSubmit }) => {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const districtOptions = getDistrictsForCity(form.city);
  const handleCityChange = (city) => {
    setForm((current) => ({
      ...current,
      city,
      district: getDistrictsForCity(city).includes(current.district) ? current.district : '',
    }));
  };

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-bold text-white outline-none transition-all placeholder:text-white/20 focus:border-primary/50';
  const selectClass = `${inputClass} appearance-none`;
  const labelClass = 'mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-muted';

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xl">
      <Motion.form
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-bg-card custom-scrollbar"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/20 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <Building2 className="h-5 w-5 text-primary-light" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{editing ? 'Kursu Düzenle' : 'Yeni Sürücü Kursu'}</h2>
              <p className="text-xs font-medium text-text-muted">Kullanıcıların şehirlerine göre göreceği kurs bilgileri</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-text-muted transition hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Kurs adı *</label>
            <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Örn. Merkez Sürücü Kursu" required />
          </div>

          <div>
            <label className={labelClass}>Şehir *</label>
            <select className={selectClass} value={form.city} onChange={(e) => handleCityChange(e.target.value)} required>
              <option value="" className="bg-bg-card">Şehir seç</option>
              {TURKEY_CITIES.map((city) => (
                <option key={city} value={city} className="bg-bg-card">{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>İlçe</label>
            <select
              className={selectClass}
              value={form.district}
              onChange={(e) => update('district', e.target.value)}
              disabled={!form.city}
            >
              <option value="" className="bg-bg-card">{form.city ? 'İlçe seç' : 'Önce şehir seç'}</option>
              {districtOptions.map((district) => (
                <option key={district} value={district} className="bg-bg-card">{district}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Adres</label>
            <textarea className={`${inputClass} min-h-24 resize-none`} value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Mahalle, cadde, bina no..." />
          </div>

          <div>
            <label className={labelClass}>Telefon</label>
            <input className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="05xx xxx xx xx" />
          </div>

          <div>
            <label className={labelClass}>Ehliyet sınıfları</label>
            <input className={inputClass} value={form.licenseClasses} onChange={(e) => update('licenseClasses', e.target.value)} placeholder="A, B, C, D" />
          </div>

          <div>
            <label className={labelClass}>Konum linki</label>
            <input className={inputClass} value={form.locationUrl} onChange={(e) => update('locationUrl', e.target.value)} placeholder="Google Maps bağlantısı" />
          </div>

          <div>
            <label className={labelClass}>Web / başvuru linki</label>
            <input className={inputClass} value={form.websiteUrl} onChange={(e) => update('websiteUrl', e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className={labelClass}>Başvuru e-postası (isteğe bağlı)</label>
            <input className={inputClass} type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} placeholder="kurs@ornek.com — başvurular buraya gider" />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Açıklama</label>
            <textarea className={`${inputClass} min-h-24 resize-none`} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Kurs hakkında kısa not, kampanya veya kayıt bilgisi..." />
          </div>

          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Sponsorlu kart</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Sponsor etiketi</label>
                <input className={inputClass} value={form.sponsorLabel} onChange={(e) => update('sponsorLabel', e.target.value)} placeholder="Sponsorlu, Öne Çıkan, Tavsiye Edilen" />
              </div>
              <div>
                <label className={labelClass}>Başlangıç tarihi</label>
                <input className={inputClass} type="date" value={form.sponsorStartAt} onChange={(e) => update('sponsorStartAt', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Bitiş tarihi</label>
                <input className={inputClass} type="date" value={form.sponsorEndAt} onChange={(e) => update('sponsorEndAt', e.target.value)} />
                <p className="mt-2 text-[11px] font-medium leading-relaxed text-text-muted">
                  Bu tarih dolunca sponsorlu kart kullanıcı tarafında görünmez.
                </p>
              </div>
              <div>
                <label className={labelClass}>Sponsor notu</label>
                <input className={inputClass} value={form.sponsorNote} onChange={(e) => update('sponsorNote', e.target.value)} placeholder="Kampanya, indirim veya özel not" />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                {[1, 2, 3].map((month) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      update('sponsorStartAt', form.sponsorStartAt || todayInput());
                      update('sponsorEndAt', addMonthsForInput(month));
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-black text-text-muted transition hover:border-amber-400/30 hover:text-amber-300"
                  >
                    {month} ay
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm((current) => ({
                  ...current,
                  isSponsored: !current.isSponsored,
                  sponsorLabel: current.sponsorLabel || 'Sponsorlu',
                  sponsorStartAt: !current.isSponsored ? (current.sponsorStartAt || todayInput()) : current.sponsorStartAt,
                  sponsorEndAt: !current.isSponsored ? (current.sponsorEndAt || addMonthsForInput(2)) : current.sponsorEndAt,
                }));
              }}
              className={`mt-4 inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                form.isSponsored
                  ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                  : 'border-white/10 bg-white/[0.02] text-text-muted'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {form.isSponsored ? 'Sponsorlu aktif' : 'Sponsorlu pasif'}
            </button>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => update('isActive', !form.isActive)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                form.isActive
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                  : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
              }`}
            >
              {form.isActive ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {form.isActive ? 'Kullanıcıya Görünür' : 'Pasif'}
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-white/10 bg-black/20 p-5 backdrop-blur-xl">
          <button type="button" onClick={onClose} className="rounded-2xl px-5 py-3 text-sm font-bold text-text-muted transition hover:bg-white/5 hover:text-white">
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-light disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editing ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </Motion.form>
    </div>
  );
};

export default SchoolModal;
