import React, { useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  Building2,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { TURKEY_CITIES, getDistrictsForCity } from '../../../data/turkeyLocations';
import {
  addMonthsForInput,
  isSponsorActive,
  sponsorDefaults,
  toDateInput,
  todayInput,
} from './schoolHelpers';

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

export default SponsorModal;
