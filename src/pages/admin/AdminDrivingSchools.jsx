import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../api';
import { TURKEY_CITIES, getDistrictsForCity } from '../../data/turkeyLocations';

const emptyForm = {
  name: '',
  city: '',
  district: '',
  address: '',
  phone: '',
  locationUrl: '',
  websiteUrl: '',
  contactEmail: '',
  licenseClasses: '',
  description: '',
  isSponsored: false,
  sponsorLabel: 'Sponsorlu',
  sponsorPriority: 0,
  sponsorStartAt: '',
  sponsorEndAt: '',
  sponsorNote: '',
  isActive: true,
};

const readList = (payload) => {
  const data = payload?.data?.data || payload?.data?.schools || payload?.data;
  return Array.isArray(data) ? data : [];
};

const withProtocol = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const sponsorDefaults = {
  sponsorLabel: 'Sponsorlu',
  sponsorStartAt: '',
  sponsorEndAt: '',
  sponsorNote: '',
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const addMonthsForInput = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
};

const todayInput = () => new Date().toISOString().slice(0, 10);

const sponsorDateTime = (value, boundary = 'start') => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const date = boundary === 'end'
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);
    return date.getTime();
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const isSponsorActive = (school) => {
  if (!school?.isSponsored) return false;
  if (school.sponsorIsActive === false) return false;
  const now = Date.now();
  const startAt = sponsorDateTime(school.sponsorStartAt, 'start');
  const endAt = sponsorDateTime(school.sponsorEndAt, 'end');
  if (startAt && startAt > now) return false;
  if (endAt && endAt < now) return false;
  return true;
};

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

const SponsorModal = ({
  schools,
  saving,
  onClose,
  onSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(sponsorDefaults);

  const districtOptions = useMemo(() => getDistrictsForCity(cityFilter), [cityFilter]);

  const handleCityChange = (city) => {
    setCityFilter(city);
    setDistrictFilter('');
  };

  const availableSchools = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr-TR');
    return schools
      .filter((school) => school.isActive !== false)
      .filter((school) => !cityFilter || school.city === cityFilter)
      .filter((school) => !districtFilter || school.district === districtFilter)
      .filter((school) => {
        if (!needle) return true;
        return [
          school.name,
          school.city,
          school.district,
          school.address,
          school.sponsorLabel,
          school.sponsorNote,
        ].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR').includes(needle);
      });
  }, [schools, query, cityFilter, districtFilter]);

  const selectedSchool = schools.find((school) => school._id === selectedId);

  const selectSchool = (school) => {
    setSelectedId(school._id);
    setForm({
      sponsorLabel: school.sponsorLabel || sponsorDefaults.sponsorLabel,
      sponsorStartAt: toDateInput(school.sponsorStartAt) || todayInput(),
      sponsorEndAt: toDateInput(school.sponsorEndAt) || addMonthsForInput(2),
      sponsorNote: school.sponsorNote || sponsorDefaults.sponsorNote,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedSchool) return;
    onSubmit(selectedSchool, form);
  };

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-bold text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/50';
  const labelClass = 'mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-muted';

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xl">
      <Motion.form
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-400/20 bg-bg-card shadow-2xl shadow-amber-500/10"
      >
        <div className="relative overflow-hidden border-b border-white/10 p-5">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sponsorlu Kurs Ekle</h2>
                <p className="text-xs font-medium text-text-muted">Listedeki mevcut bir kursu seçip öne çıkarın.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-text-muted transition hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid max-h-[70vh] grid-cols-1 overflow-y-auto custom-scrollbar lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
            <label className={labelClass}>Şehir / ilçe seç</label>
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                value={cityFilter}
                onChange={(event) => handleCityChange(event.target.value)}
                className={`${inputClass} select-dark-options`}
              >
                <option value="" className="bg-bg-card">Tüm şehirler</option>
                {TURKEY_CITIES.map((city) => (
                  <option key={city} value={city} className="bg-bg-card">{city}</option>
                ))}
              </select>
              <select
                value={districtFilter}
                onChange={(event) => setDistrictFilter(event.target.value)}
                disabled={!cityFilter}
                className={`${inputClass} select-dark-options disabled:opacity-50`}
              >
                <option value="" className="bg-bg-card">{cityFilter ? 'Tüm ilçeler' : 'Önce şehir seç'}</option>
                {districtOptions.map((district) => (
                  <option key={district} value={district} className="bg-bg-card">{district}</option>
                ))}
              </select>
            </div>

            <label className={labelClass}>Kurs ara ve seç</label>
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <Search className="h-5 w-5 text-text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Kurs adı, şehir veya ilçe ara..."
                className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/25"
              />
            </div>

            <div className="space-y-3">
              {availableSchools.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                  <Building2 className="mx-auto mb-3 h-8 w-8 text-white/20" />
                  <p className="text-sm font-bold text-white">Seçilebilir kurs bulunamadı</p>
                  <p className="mt-1 text-xs font-medium text-text-muted">Arama kelimesini değiştirin veya önce kurs ekleyin.</p>
                </div>
              ) : (
                availableSchools.map((school) => {
                  const selected = selectedId === school._id;
                  return (
                    <button
                      key={school._id}
                      type="button"
                      onClick={() => selectSchool(school)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-amber-400/40 bg-amber-400/10 shadow-lg shadow-amber-500/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-black text-white">{school.name}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                            <MapPin className="h-3.5 w-3.5 text-primary-light" />
                            {[school.city, school.district].filter(Boolean).join(' / ') || 'Konum girilmedi'}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                          isSponsorActive(school)
                            ? 'border-amber-400/25 bg-amber-400/10 text-amber-300'
                            : 'border-white/10 bg-white/5 text-text-muted'
                        }`}>
                          {isSponsorActive(school) ? 'Aktif Sponsor' : school.isSponsored ? 'Süresi doldu' : 'Normal'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-fuchsia-500/10 to-cyan-400/10 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300">
                <Sparkles className="h-4 w-4" />
                Sponsor önizleme
              </div>
              <h3 className="mt-3 text-xl font-black text-white">
                {selectedSchool?.name || 'Öne çıkarılacak kurs'}
              </h3>
              <p className="mt-1 text-xs font-bold text-text-secondary">
                {selectedSchool ? [selectedSchool.city, selectedSchool.district].filter(Boolean).join(' / ') : 'Listeden bir kurs seçin'}
              </p>
              <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-amber-200/80">
                {form.sponsorStartAt && form.sponsorEndAt
                  ? `${form.sponsorStartAt} - ${form.sponsorEndAt}`
                  : 'Sponsor süresi seçilecek'}
              </p>
              <p className="mt-3 rounded-xl border border-white/10 bg-black/15 p-3 text-xs font-medium leading-relaxed text-text-muted">
                {form.sponsorNote || 'Kampanya, avantaj veya kayıt çağrısı burada görünecek.'}
              </p>
            </div>

            <div>
              <label className={labelClass}>Sponsor etiketi</label>
              <input
                className={inputClass}
                value={form.sponsorLabel}
                onChange={(event) => setForm((current) => ({ ...current, sponsorLabel: event.target.value }))}
                placeholder="Sponsorlu, Öne Çıkan, Tavsiye Edilen"
              />
            </div>

            <div>
              <label className={labelClass}>Sponsor süresi</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  className={inputClass}
                  type="date"
                  value={form.sponsorStartAt}
                  onChange={(event) => setForm((current) => ({ ...current, sponsorStartAt: event.target.value }))}
                />
                <input
                  className={inputClass}
                  type="date"
                  value={form.sponsorEndAt}
                  onChange={(event) => setForm((current) => ({ ...current, sponsorEndAt: event.target.value }))}
                />
              </div>
              <p className="mt-2 text-[11px] font-medium leading-relaxed text-text-muted">
                Bu süre boyunca aynı şehir/ilçede tek sponsor görünür. Süre dolunca sponsorlu kart otomatik pasifleşir.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3].map((month) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => setForm((current) => ({
                      ...current,
                      sponsorStartAt: current.sponsorStartAt || todayInput(),
                      sponsorEndAt: addMonthsForInput(month),
                    }))}
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-black text-text-muted transition hover:border-amber-400/30 hover:text-amber-300"
                  >
                    {month} ay
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Sponsor notu</label>
              <textarea
                className={`${inputClass} min-h-28 resize-none`}
                value={form.sponsorNote}
                onChange={(event) => setForm((current) => ({ ...current, sponsorNote: event.target.value }))}
                placeholder="Örn. Bu ay kayıt olanlara özel ödeme kolaylığı..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-black/20 p-5 backdrop-blur-xl">
          <button type="button" onClick={onClose} className="rounded-2xl px-5 py-3 text-sm font-bold text-text-muted transition hover:bg-white/5 hover:text-white">
            İptal
          </button>
          <button
            type="submit"
            disabled={saving || !selectedSchool}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-black transition hover:bg-amber-300 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Sponsorlu Yap
          </button>
        </div>
      </Motion.form>
    </div>
  );
};

const AdminDrivingSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState('schools'); // 'schools' | 'sponsors' | 'applications'
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [appQuery, setAppQuery] = useState('');
  const [debouncedAppQuery, setDebouncedAppQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [appPage, setAppPage] = useState(1);
  const [appTotalPages, setAppTotalPages] = useState(1);
  const [appTotalCount, setAppTotalCount] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedAppQuery(appQuery.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [appQuery]);

  useEffect(() => {
    setAppPage(1);
  }, [appStatusFilter, debouncedAppQuery]);

  // Sayfalama durumları
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  // Filtreler, arama veya sekme değiştiğinde sayfayı 1'e sıfırla
  useEffect(() => {
    setPage(1);
  }, [cityFilter, districtFilter, debouncedQuery, activeTab]);

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { includeInactive: true, page, limit: 50 };
      if (cityFilter) params.city = cityFilter;
      if (districtFilter) params.district = districtFilter;
      if (debouncedQuery) params.q = debouncedQuery;
      if (activeTab === 'sponsors') params.isSponsored = true;
      const res = await api.get('/driving-schools', { params });
      setSchools(readList(res));

      const pag = res.data?.pagination || {};
      setTotalCount(pag.total || 0);
      setTotalPages(Math.ceil((pag.total || 0) / (pag.limit || 50)) || 1);
    } catch (err) {
      if (err.response?.status === 404) {
        setSchools([]);
        setError('Sürücü kursları API rotası bu sunucuda henüz aktif değil. Local test için backend ve web dev sunucusunu yeniden başlatın; canlı panel için backend deploy gerekiyor.');
        return;
      }
      setError(err.response?.data?.error || 'Sürücü kursları alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [cityFilter, districtFilter, debouncedQuery, page, activeTab]);

  const fetchApplications = useCallback(async () => {
    try {
      setApplicationsLoading(true);
      setError('');
      const params = { page: appPage, limit: 20 };
      if (appStatusFilter) params.status = appStatusFilter;
      if (debouncedAppQuery) params.q = debouncedAppQuery;

      const res = await api.get('/driving-schools/applications', { params });
      setApplications(res.data?.data || []);

      const pag = res.data?.pagination || {};
      setAppTotalCount(pag.total || 0);
      setAppTotalPages(Math.ceil((pag.total || 0) / (pag.limit || 20)) || 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Başvurular alınamadı.');
    } finally {
      setApplicationsLoading(false);
    }
  }, [appPage, appStatusFilter, debouncedAppQuery]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const cities = useMemo(() => {
    return TURKEY_CITIES;
  }, []);

  const districtFilterOptions = useMemo(() => {
    return getDistrictsForCity(cityFilter);
  }, [cityFilter]);

  const handleCityFilterChange = (city) => {
    setCityFilter(city);
    setDistrictFilter('');
  };

  const filteredSchools = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr-TR');
    return schools.filter((school) => {
      const matchesCity = !cityFilter || school.city === cityFilter;
      const matchesDistrict = !districtFilter || school.district === districtFilter;
      const text = [
        school.name,
        school.city,
        school.district,
        school.address,
        school.phone,
        school.description,
        ...(school.licenseClasses || []),
      ].join(' ').toLocaleLowerCase('tr-TR');
      return matchesCity && matchesDistrict && (!needle || text.includes(needle));
    });
  }, [schools, query, cityFilter, districtFilter]);

  const stats = useMemo(() => ({
    total: totalCount,
    active: schools.filter((school) => school.isActive !== false).length,
    sponsored: schools.filter(isSponsorActive).length,
    cities: new Set(schools.map((school) => school.city).filter(Boolean)).size,
  }), [schools, totalCount]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openSponsorCreate = () => {
    setError('');
    setSponsorModalOpen(true);
  };

  const openEdit = (school) => {
    setEditing(school);
    setForm({
      name: school.name || '',
      city: school.city || '',
      district: school.district || '',
      address: school.address || '',
      phone: school.phone || '',
      locationUrl: school.locationUrl || '',
      websiteUrl: school.websiteUrl || '',
      contactEmail: school.contactEmail || '',
      licenseClasses: (school.licenseClasses || []).join(', '),
      description: school.description || '',
      isSponsored: school.isSponsored === true,
      sponsorLabel: school.sponsorLabel || 'Sponsorlu',
      sponsorPriority: school.sponsorPriority ?? 0,
      sponsorStartAt: toDateInput(school.sponsorStartAt),
      sponsorEndAt: toDateInput(school.sponsorEndAt),
      sponsorNote: school.sponsorNote || '',
      isActive: school.isActive !== false,
    });
    setModalOpen(true);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 2500);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      licenseClasses: form.licenseClasses.split(',').map((item) => item.trim()).filter(Boolean),
    };

    try {
      if (editing?._id) {
        await api.put(`/driving-schools/${editing._id}`, payload);
        showSuccess('Sürücü kursu güncellendi.');
      } else {
        await api.post('/driving-schools', payload);
        showSuccess('Sürücü kursu eklendi.');
      }
      setModalOpen(false);
      await fetchSchools();
    } catch (err) {
      setError(err.response?.data?.error || 'Kurs kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (school) => {
    if (!window.confirm(`${school.name} silinsin mi?`)) return;
    try {
      await api.delete(`/driving-schools/${school._id}`);
      setSchools((current) => current.filter((item) => item._id !== school._id));
      showSuccess('Sürücü kursu silindi.');
    } catch (err) {
      setError(err.response?.data?.error || 'Kurs silinemedi.');
    }
  };

  const toggleSponsor = async (school) => {
    const nextSponsored = !school.isSponsored;
    try {
      const payload = {
        isSponsored: nextSponsored,
        sponsorLabel: school.sponsorLabel || 'Sponsorlu',
        sponsorPriority: nextSponsored ? (school.sponsorPriority || 10) : 0,
        sponsorStartAt: nextSponsored ? (toDateInput(school.sponsorStartAt) || todayInput()) : '',
        sponsorEndAt: nextSponsored ? (toDateInput(school.sponsorEndAt) || addMonthsForInput(2)) : '',
        sponsorNote: school.sponsorNote || '',
      };
      const res = await api.put(`/driving-schools/${school._id}`, payload);
      const updated = res.data?.data || { ...school, ...payload };
      if (activeTab === 'sponsors' && !nextSponsored) {
        setSchools((current) => current.filter((item) => item._id !== school._id));
      } else {
        setSchools((current) =>
          current.map((item) => (item._id === school._id ? updated : item)),
        );
      }
      showSuccess(nextSponsored ? 'Kurs sponsorlu yapıldı.' : 'Sponsorluğu kaldırıldı.');
    } catch (err) {
      setError(err.response?.data?.error || 'Sponsor durumu güncellenemedi.');
    }
  };

  const handleSponsorSubmit = async (school, sponsorForm) => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        isSponsored: true,
        sponsorLabel: sponsorForm.sponsorLabel || 'Sponsorlu',
        sponsorPriority: sponsorForm.sponsorPriority || 10,
        sponsorStartAt: sponsorForm.sponsorStartAt || todayInput(),
        sponsorEndAt: sponsorForm.sponsorEndAt || addMonthsForInput(2),
        sponsorNote: sponsorForm.sponsorNote || '',
      };
      await api.put(`/driving-schools/${school._id}`, payload);
      
      setSponsorModalOpen(false);
      showSuccess(`${school.name} sponsorlu yapıldı.`);
      await fetchSchools();
    } catch (err) {
      setError(err.response?.data?.error || 'Sponsorlu kurs kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };
  const handleUpdateAppStatus = async (appId, nextStatus) => {
    try {
      setError('');
      await api.put(`/driving-schools/applications/${appId}`, { status: nextStatus });
      setApplications((current) =>
        current.map((app) => (app._id === appId ? { ...app, status: nextStatus } : app)),
      );
      showSuccess('Başvuru durumu güncellendi.');
    } catch (err) {
      setError(err.response?.data?.error || 'Başvuru durumu güncellenemedi.');
    }
  };

  const handleDeleteApplication = async (app) => {
    if (!window.confirm(`${app.userName} isimli kullanıcının başvurusu silinsin mi?`)) return;
    try {
      setError('');
      await api.delete(`/driving-schools/applications/${app._id}`);
      setApplications((current) => current.filter((item) => item._id !== app._id));
      setAppTotalCount((c) => Math.max(c - 1, 0));
      showSuccess('Başvuru silindi.');
    } catch (err) {
      setError(err.response?.data?.error || 'Başvuru silinemedi.');
    }
  };
  return (
    <div className="space-y-6 pb-24 text-white">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-light">
              <MapPin className="h-3.5 w-3.5" />
              Konum tabanlı kurs rehberi
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sürücü Kursları</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-text-secondary">
              Kullanıcıların profil üzerinden göreceği şehir bazlı kursları, iletişim ve başvuru bağlantılarıyla birlikte yönetin.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={openSponsorCreate}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-3.5 text-sm font-bold text-amber-300 transition hover:bg-amber-400/20"
            >
              <Sparkles className="h-4 w-4" />
              Sponsorlu Ekle
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition hover:bg-primary-light"
            >
              <Plus className="h-4 w-4" />
              Kurs Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-1.5">
        <button
          onClick={() => setActiveTab('schools')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            activeTab === 'schools'
              ? 'bg-primary/20 text-primary-light'
              : 'text-text-muted hover:bg-white/5 hover:text-white'
          }`}
        >
          <Building2 className="mr-2 inline h-4 w-4" />
          Kurslar
        </button>
        <button
          onClick={() => setActiveTab('sponsors')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            activeTab === 'sponsors'
              ? 'bg-amber-400/15 text-amber-300'
              : 'text-text-muted hover:bg-white/5 hover:text-white'
          }`}
        >
          <Sparkles className="mr-2 inline h-4 w-4" />
          Sponsorlar
        </button>
        <button
          onClick={() => { setActiveTab('applications'); fetchApplications(); }}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            activeTab === 'applications'
              ? 'bg-cyan-500/15 text-cyan-400'
              : 'text-text-muted hover:bg-white/5 hover:text-white'
          }`}
        >
          <Inbox className="mr-2 inline h-4 w-4" />
          Başvurular ({applications.length})
        </button>
      </div>

      {(activeTab === 'schools' || activeTab === 'sponsors') && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {activeTab === 'schools' ? (
              [
                { label: 'Toplam Kurs', value: stats.total, tone: 'text-primary-light' },
                { label: 'Aktif Kurs', value: stats.active, tone: 'text-emerald-400' },
                { label: 'Sponsorlu', value: stats.sponsored, tone: 'text-amber-300' },
                { label: 'Şehir', value: stats.cities, tone: 'text-accent-light' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{item.label}</p>
                  <p className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</p>
                </div>
              ))
            ) : (
              [
                { label: 'Toplam Sponsor', value: stats.total, tone: 'text-amber-300' },
                { label: 'Aktif Sponsor', value: schools.filter(isSponsorActive).length, tone: 'text-emerald-400' },
                { label: 'Süresi Dolan Sponsor', value: schools.filter((s) => !isSponsorActive(s)).length, tone: 'text-rose-400' },
                { label: 'Sponsorlu Şehir', value: new Set(schools.map((school) => school.city).filter(Boolean)).size, tone: 'text-accent-light' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{item.label}</p>
                  <p className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</p>
                </div>
              ))
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <Search className="h-5 w-5 text-text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Kurs, adres, ehliyet sınıfı ara..."
                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/25"
                />
              </div>
              <select
                value={cityFilter}
                onChange={(event) => handleCityFilterChange(event.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 select-dark-options"
              >
                <option value="" className="bg-bg-card">Tüm şehirler</option>
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-bg-card">{city}</option>
                ))}
              </select>
              <select
                value={districtFilter}
                onChange={(event) => setDistrictFilter(event.target.value)}
                disabled={!cityFilter}
                className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 disabled:opacity-50 select-dark-options"
              >
                <option value="" className="bg-bg-card">{cityFilter ? 'Tüm ilçeler' : 'Önce şehir seç'}</option>
                {districtFilterOptions.map((district) => (
                  <option key={district} value={district} className="bg-bg-card">{district}</option>
                ))}
              </select>
              <button onClick={fetchSchools} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.04]">
                <RefreshCw className="h-4 w-4" />
                Yenile
              </button>
            </div>
          </div>

          {(error || success) && (
            <div className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-bold ${
              success ? 'border-success/20 bg-success/10 text-success' : 'border-danger/20 bg-danger/10 text-danger'
            }`}>
              {success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {success || error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Kurslar yükleniyor...</p>
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              {activeTab === 'schools' ? (
                <>
                  <Building2 className="mx-auto mb-4 h-10 w-10 text-white/20" />
                  <h3 className="text-lg font-bold text-white">Henüz kurs bulunamadı</h3>
                  <p className="mt-2 text-sm font-medium text-text-muted">Filtreleri temizleyin veya ilk sürücü kursunu ekleyin.</p>
                </>
              ) : (
                <>
                  <Sparkles className="mx-auto mb-4 h-10 w-10 text-white/20" />
                  <h3 className="text-lg font-bold text-white">Sponsorlu kurs bulunamadı</h3>
                  <p className="mt-2 text-sm font-medium text-text-muted">Filtreleri temizleyin veya yeni bir sponsor ekleyin.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredSchools.map((school) => (
                <Motion.div
                  key={school._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
                    activeTab === 'sponsors' && isSponsorActive(school)
                      ? 'border-amber-500/30 bg-white/[0.02] hover:bg-white/[0.03] hover:border-amber-500/50 shadow-lg shadow-amber-500/[0.02]'
                      : school.isActive
                        ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.03] hover:border-white/20'
                        : 'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-xl font-bold text-white">{school.name}</h2>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                          school.isActive
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                            : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                        }`}>
                          {school.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm font-bold text-text-secondary">
                        <MapPin className="h-4 w-4 text-primary-light" />
                        {[school.city, school.district].filter(Boolean).join(' / ') || 'Konum girilmedi'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => toggleSponsor(school)}
                        className={`rounded-xl p-2 transition ${
                          school.isSponsored
                            ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                            : 'text-text-muted hover:bg-amber-500/10 hover:text-amber-300'
                        }`}
                        title={school.isSponsored ? 'Sponsorluğu kaldır' : 'Sponsor yap'}
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(school)} className="rounded-xl p-2 text-text-muted transition hover:bg-primary/10 hover:text-primary-light">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(school)} className="rounded-xl p-2 text-text-muted transition hover:bg-danger/10 hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {school.address && <p className="mt-4 text-sm font-medium leading-relaxed text-text-secondary">{school.address}</p>}

                  {school.licenseClasses?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {school.licenseClasses.map((item) => (
                        <span key={`${school._id}-${item}`} className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold text-accent-light">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {school.description && <p className="mt-4 rounded-2xl border border-white/5 bg-black/15 p-3 text-xs font-medium leading-relaxed text-text-muted">{school.description}</p>}

                  {school.isSponsored && (
                    <div className={`mt-4 rounded-2xl border p-4 ${
                      isSponsorActive(school)
                        ? 'border-amber-400/20 bg-gradient-to-r from-amber-400/10 via-fuchsia-500/10 to-cyan-400/10'
                        : 'border-rose-500/20 bg-rose-500/5'
                    }`}>
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                        isSponsorActive(school) ? 'text-amber-300' : 'text-rose-400'
                      }`}>
                        <Sparkles className="h-4 w-4" />
                        {isSponsorActive(school) ? (school.sponsorLabel || 'Sponsorlu') : 'Sponsor Süresi Doldu'}
                      </div>
                      {(school.sponsorStartAt || school.sponsorEndAt) && (
                        <p className={`mt-2 text-[11px] font-black uppercase tracking-widest ${
                          isSponsorActive(school) ? 'text-amber-100/70' : 'text-rose-300/60'
                        }`}>
                          {[toDateInput(school.sponsorStartAt), toDateInput(school.sponsorEndAt)].filter(Boolean).join(' - ')}
                        </p>
                      )}
                      <p className="mt-2 text-sm font-bold text-white">
                        {isSponsorActive(school) ? 'Öne çıkarılmış kurs' : 'Sponsorluk süresi geçmiş'}
                      </p>
                      {school.sponsorNote && (
                        <p className="mt-1 text-xs font-medium leading-relaxed text-text-muted">{school.sponsorNote}</p>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {school.phone && (
                      <a href={`tel:${school.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10">
                        <Phone className="h-3.5 w-3.5" />
                        Ara
                      </a>
                    )}
                    {school.locationUrl && (
                      <a href={withProtocol(school.locationUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-bold text-primary-light transition hover:bg-primary/20">
                        <MapPin className="h-3.5 w-3.5" />
                        Konum
                      </a>
                    )}
                    {school.websiteUrl && (
                      <a href={withProtocol(school.websiteUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-bold text-accent-light transition hover:bg-accent/20">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Web
                      </a>
                    )}
                    {school.contactEmail && (
                      <a href={`mailto:${school.contactEmail}`} className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-light transition hover:bg-cyan-500/20">
                        <Mail className="h-3.5 w-3.5" />
                        {school.contactEmail}
                      </a>
                    )}
                  </div>
                </Motion.div>
              ))}
            </div>
            {/* Sayfalama Kontrolleri */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/[0.04] disabled:opacity-40 disabled:pointer-events-none"
                >
                  Önceki
                </button>
                <span className="text-xs font-bold text-text-muted">
                  Sayfa <span className="text-white">{page}</span> / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/[0.04] disabled:opacity-40 disabled:pointer-events-none"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
        </>
      )}

      {activeTab === 'applications' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-text-muted">
              Toplam <span className="text-white">{appTotalCount}</span> başvuru listelendi
            </p>
            <button
              onClick={fetchApplications}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/[0.04]"
            >
              <RefreshCw className="h-4 w-4" />
              Yenile
            </button>
          </div>

          {/* Arama ve Filtreleme */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 mb-6">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <Search className="h-5 w-5 text-text-muted" />
                <input
                  value={appQuery}
                  onChange={(event) => setAppQuery(event.target.value)}
                  placeholder="Başvuran adı, e-posta, telefon veya kurs ara..."
                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/25"
                />
              </div>
              <select
                value={appStatusFilter}
                onChange={(event) => setAppStatusFilter(event.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 select-dark-options"
              >
                <option value="" className="bg-bg-card">Tüm Durumlar</option>
                <option value="pending" className="bg-bg-card">Beklemede</option>
                <option value="contacted" className="bg-bg-card">Görüşüldü</option>
                <option value="cancelled" className="bg-bg-card">İptal Edildi</option>
              </select>
            </div>
          </div>

          {(error || success) && (
            <div className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm font-bold ${
              success ? 'border-success/20 bg-success/10 text-success' : 'border-danger/20 bg-danger/10 text-danger'
            }`}>
              {success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {success || error}
            </div>
          )}

          {applicationsLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Başvurular yükleniyor...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <Inbox className="mx-auto mb-4 h-12 w-12 text-white/15" />
              <h3 className="text-lg font-bold text-white">Başvuru bulunamadı</h3>
              <p className="mt-2 text-sm font-medium text-text-muted">Filtreleri temizleyin veya arama kelimesini değiştirin.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {applications.map((app) => (
                  <Motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-3xl border p-5 transition-all ${
                      app.status === 'contacted'
                        ? 'border-emerald-500/10 bg-emerald-500/[0.01]'
                        : app.status === 'cancelled'
                          ? 'border-rose-500/10 bg-rose-500/[0.01] opacity-70'
                          : 'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">
                            {app.schoolCity || 'Bilinmiyor'}
                          </span>
                          <h3 className="text-base font-black text-white">{app.schoolName}</h3>
                          
                          {/* Durum Rozeti */}
                          <span className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                            app.status === 'contacted'
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              : app.status === 'cancelled'
                                ? 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                                : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                          }`}>
                            {app.status === 'contacted'
                              ? 'Görüşüldü'
                              : app.status === 'cancelled'
                                ? 'İptal Edildi'
                                : 'Beklemede'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-text-muted">
                          {new Date(app.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* İşlem Butonları */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <button
                          onClick={() => handleUpdateAppStatus(app._id, 'pending')}
                          className={`rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                            app.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'text-text-muted hover:bg-white/5 border border-white/5'
                          }`}
                        >
                          Beklemede
                        </button>
                        <button
                          onClick={() => handleUpdateAppStatus(app._id, 'contacted')}
                          className={`rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                            app.status === 'contacted'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'text-text-muted hover:bg-white/5 border border-white/5'
                          }`}
                        >
                          Görüşüldü
                        </button>
                        <button
                          onClick={() => handleUpdateAppStatus(app._id, 'cancelled')}
                          className={`rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                            app.status === 'cancelled'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'text-text-muted hover:bg-white/5 border border-white/5'
                          }`}
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(app)}
                          className="rounded-xl p-2 text-text-muted hover:bg-rose-500/10 hover:text-rose-400 transition border border-white/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Ad Soyad</p>
                        <p className="mt-1 text-sm font-bold text-white">{app.userName || '-'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Telefon</p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {app.userPhone ? (
                            <a href={`tel:${app.userPhone.replace(/\s/g, '')}`} className="text-cyan-light hover:underline">{app.userPhone}</a>
                          ) : '-'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">E-posta</p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {app.userEmail ? (
                            <a href={`mailto:${app.userEmail}`} className="text-primary-light hover:underline">{app.userEmail}</a>
                          ) : '-'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Şehir</p>
                        <p className="mt-1 text-sm font-bold text-white">{app.userCity || '-'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Ehliyet Sınıfı</p>
                        <p className="mt-1 text-sm font-bold text-amber-300">{app.requestedLicenseClass || '-'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Kayıt Dönemi</p>
                        <p className="mt-1 text-sm font-bold text-cyan-light">{app.preferredPeriod || '-'}</p>
                      </div>
                    </div>

                    {app.message && (
                      <p className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3 text-xs font-medium leading-relaxed text-text-muted">
                        “{app.message}”
                      </p>
                    )}

                    {/* Mail Gönderim Durumları */}
                    {(app.adminMailSent || app.schoolMailSent) && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                        {app.adminMailSent && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Admin Maili Gönderildi
                          </span>
                        )}
                        {app.schoolMailSent && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-400">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Kurs Maili Gönderildi
                          </span>
                        )}
                      </div>
                    )}
                  </Motion.div>
                ))}
              </div>

              {/* Sayfalama Kontrolleri */}
              {appTotalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setAppPage((p) => Math.max(p - 1, 1))}
                    disabled={appPage === 1}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/[0.04] disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Önceki
                  </button>
                  <span className="text-xs font-bold text-text-muted">
                    Sayfa <span className="text-white">{appPage}</span> / {appTotalPages}
                  </span>
                  <button
                    onClick={() => setAppPage((p) => Math.min(p + 1, appTotalPages))}
                    disabled={appPage === appTotalPages}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/[0.04] disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {modalOpen && (
        <SchoolModal
          form={form}
          setForm={setForm}
          editing={editing}
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {sponsorModalOpen && (
        <SponsorModal
          schools={schools}
          saving={saving}
          onClose={() => setSponsorModalOpen(false)}
          onSubmit={handleSponsorSubmit}
        />
      )}
    </div>
  );
};

export default AdminDrivingSchools;
