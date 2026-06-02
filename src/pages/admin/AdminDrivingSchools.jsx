import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Loader2,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
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
  licenseClasses: '',
  description: '',
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

          <div className="md:col-span-2">
            <label className={labelClass}>Açıklama</label>
            <textarea className={`${inputClass} min-h-24 resize-none`} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Kurs hakkında kısa not, kampanya veya kayıt bilgisi..." />
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

const AdminDrivingSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/driving-schools', { params: { includeInactive: true } });
      setSchools(readList(res));
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
  };

  useEffect(() => {
    fetchSchools();
  }, []);

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
    total: schools.length,
    active: schools.filter((school) => school.isActive).length,
    cities: new Set(schools.map((school) => school.city).filter(Boolean)).size,
  }), [schools]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
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
      licenseClasses: (school.licenseClasses || []).join(', '),
      description: school.description || '',
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
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" />
            Kurs Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Toplam Kurs', value: stats.total, tone: 'text-primary-light' },
          { label: 'Aktif Kurs', value: stats.active, tone: 'text-emerald-400' },
          { label: 'Şehir', value: stats.cities, tone: 'text-accent-light' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{item.label}</p>
            <p className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
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
          <Building2 className="mx-auto mb-4 h-10 w-10 text-white/20" />
          <h3 className="text-lg font-bold text-white">Henüz kurs bulunamadı</h3>
          <p className="mt-2 text-sm font-medium text-text-muted">Filtreleri temizleyin veya ilk sürücü kursunu ekleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredSchools.map((school) => (
            <Motion.div
              key={school._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
                school.isActive
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
              </div>
            </Motion.div>
          ))}
        </div>
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
    </div>
  );
};

export default AdminDrivingSchools;
