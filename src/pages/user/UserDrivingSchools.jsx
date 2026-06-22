import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Search,
  Send,
  Settings,
  Sparkles,
} from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';
import { TURKEY_CITIES, getDistrictsForCity } from '../../data/turkeyLocations';

const readList = (payload) => {
  const data = payload?.data?.data || payload?.data?.schools || payload?.data;
  return Array.isArray(data) ? data : [];
};

const withProtocol = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const normalize = (value) => (value || '').toLocaleLowerCase('tr-TR').trim();

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

const sortSponsoredFirst = (a, b) => {
  const aSponsored = isSponsorActive(a);
  const bSponsored = isSponsorActive(b);
  if (aSponsored !== bSponsored) return aSponsored ? -1 : 1;
  if (aSponsored && bSponsored) {
    const priorityDiff = Number(b.sponsorPriority || 0) - Number(a.sponsorPriority || 0);
    if (priorityDiff !== 0) return priorityDiff;
    return (sponsorDateTime(a.sponsorEndAt, 'end') || Infinity) - (sponsorDateTime(b.sponsorEndAt, 'end') || Infinity);
  }
  return normalize(a.name).localeCompare(normalize(b.name), 'tr');
};

const findByTurkishName = (items, value) => {
  const normalizedValue = normalize(value);
  return items.find((item) => normalize(item) === normalizedValue) || '';
};

const getProfileLocation = (user) => {
  const profileCity = findByTurkishName(TURKEY_CITIES, user?.city);
  const profileDistrict = findByTurkishName(getDistrictsForCity(profileCity), user?.district);
  return { profileCity, profileDistrict };
};

const UserDrivingSchools = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { profileCity, profileDistrict } = useMemo(() => getProfileLocation(user), [user]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [city, setCity] = useState(profileCity);
  const [district, setDistrict] = useState(profileDistrict);
  const [useProfileLocation, setUseProfileLocation] = useState(true);

  const fetchSchools = useCallback(async () => {
    const search = debouncedQuery.trim();
    if (!city && !search) {
      setSchools([]);
      setError('');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const params = { limit: 1000 };
      if (city) params.city = city;
      if (district) params.district = district;
      if (search) params.q = search;
      const res = await api.get('/driving-schools', { params });
      setSchools(readList(res));
    } catch (err) {
      if (err.response?.status === 404) {
        setSchools([]);
        setError('Kurs rehberi API rotası bu sunucuda henüz aktif değil. Local test için backend ve web dev sunucusunu yeniden başlatın; canlı web için backend deploy gerekiyor.');
        return;
      }
      setError(err.response?.data?.error || 'Sürücü kursları alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [city, district, debouncedQuery]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!useProfileLocation) return;
    setCity(profileCity);
    setDistrict(profileDistrict);
  }, [profileCity, profileDistrict, useProfileLocation]);

  const districtOptions = useMemo(() => getDistrictsForCity(city), [city]);

  const handleCityChange = (nextCity) => {
    setUseProfileLocation(false);
    setCity(nextCity);
    setDistrict('');
  };

  const useProfileFilters = () => {
    setUseProfileLocation(true);
    setCity(profileCity);
    setDistrict(profileDistrict);
  };

  const refreshSchools = () => {
    const search = query.trim();
    if (search !== debouncedQuery) {
      setDebouncedQuery(search);
      return;
    }
    fetchSchools();
  };

  const filteredSchools = useMemo(() => {
    const search = normalize(query);
    const selectedCity = normalize(city);
    const selectedDistrict = normalize(district);

    return schools.filter((school) => {
      const matchesCity = !selectedCity || normalize(school.city) === selectedCity;
      const matchesDistrict = !selectedDistrict || normalize(school.district) === selectedDistrict;
      const text = [
        school.name,
        school.city,
        school.district,
        school.address,
        school.phone,
        school.description,
        ...(school.licenseClasses || []),
      ].join(' ');
      return matchesCity && matchesDistrict && (!search || normalize(text).includes(search));
    });
  }, [schools, city, district, query]);

  const featuredSchool = useMemo(
    () => [...filteredSchools]
      .filter(isSponsorActive)
      .sort(sortSponsoredFirst)[0],
    [filteredSchools],
  );

  const visibleSchools = useMemo(
    () => [...filteredSchools]
      .filter((school) => school._id !== featuredSchool?._id)
      .sort(sortSponsoredFirst),
    [filteredSchools, featuredSchool],
  );

  const stats = useMemo(() => ({
    total: schools.length,
    shown: filteredSchools.length,
    withPhone: filteredSchools.filter((school) => Boolean(school.phone)).length,
    withLocation: filteredSchools.filter((school) => Boolean(school.locationUrl)).length,
  }), [schools, filteredSchools]);

  const nearbyLabel = [city, district].filter(Boolean).join(' / ') || (debouncedQuery ? `"${debouncedQuery}" araması` : profileCity || 'şehir seçimi');

  return (
    <div className="space-y-6 pb-24 text-white sm:space-y-7">
      <Motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-light">
              <Navigation className="h-3.5 w-3.5" />
              Sürücü Kursu Rehberi
            </div>
            <h1 className="text-3xl font-black tracking-tight">Yakındaki Sürücü Kursları</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-secondary">
              {nearbyLabel} için kayıt linki, iletişim bilgileri, adres ve ehliyet sınıflarını tek noktada inceleyin.
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="grid grid-cols-4 gap-2 rounded-3xl border border-white/10 bg-white/[0.025] p-2">
              {[
                ['Toplam', stats.total],
                ['Gösterilen', stats.shown],
                ['Telefon', stats.withPhone],
                ['Konum', stats.withLocation],
              ].map(([label, value]) => (
                <div key={label} className="min-w-20 rounded-2xl bg-white/[0.035] px-3 py-3 text-center">
                  <p className="text-lg font-black text-white">{value}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
                </div>
              ))}
            </div>

            <Link
              to="/dashboard/settings"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
              Şehrini Değiştir
            </Link>
          </div>
        </div>
      </Motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm font-bold text-danger">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_190px_auto]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 transition focus-within:border-cyan-500/40 focus-within:ring-4 focus-within:ring-cyan-500/10">
            <Search className="h-5 w-5 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kurs, adres veya ehliyet sınıfı ara..."
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-text-muted"
            />
          </div>

          <div className="relative">
            <select
              value={city}
              onChange={(event) => handleCityChange(event.target.value)}
              className="w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm font-black text-white outline-none transition focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10"
            >
              <option value="" className="bg-bg-card">Şehir seç</option>
              {TURKEY_CITIES.map((item) => <option key={item} value={item} className="bg-bg-card">{item}</option>)}
            </select>
          </div>

          <div className="relative">
            <select
              value={district}
              onChange={(event) => {
                setUseProfileLocation(false);
                setDistrict(event.target.value);
              }}
              disabled={!city}
              className="w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm font-black text-white outline-none transition focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 disabled:opacity-40"
            >
              <option value="" className="bg-bg-card">{city ? 'Tüm ilçeler' : 'Önce şehir seç'}</option>
              {districtOptions.map((item) => <option key={item} value={item} className="bg-bg-card">{item}</option>)}
            </select>
          </div>

          <button
            onClick={refreshSchools}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3.5 text-sm font-black text-white transition hover:bg-cyan-400"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold text-text-muted">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {filteredSchools.length} kurs gösteriliyor
          </span>
          {profileCity && (
            <button
              type="button"
              onClick={useProfileFilters}
              className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-light transition hover:bg-cyan-500/20 cursor-pointer"
            >
              Profil konumum: {[profileCity, profileDistrict].filter(Boolean).join(' / ')}
            </button>
          )}
          {city && (
            <button
              type="button"
              onClick={() => {
                setUseProfileLocation(false);
                setCity('');
                setDistrict('');
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              Şehir filtresini temizle
            </button>
          )}
          {district && (
            <button
              type="button"
              onClick={() => {
                setUseProfileLocation(false);
                setDistrict('');
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              Tüm ilçeleri göster
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-xs font-black uppercase tracking-widest text-text-muted animate-pulse">Kurs rehberi hazırlanıyor...</p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-12 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-white/15" />
          <h3 className="text-lg font-black text-white">{city || debouncedQuery ? 'Bu filtreyle kurs bulunamadı' : 'Şehir seçerek veya arama yaparak kursları listele'}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-text-muted">
            {city || debouncedQuery
              ? 'İlçe alanını temizleyebilir veya profilindeki konum bilgisini güncelleyebilirsin.'
              : 'Türkiye geneli veri çok büyük olduğu için önce şehir seçebilir ya da kurs adı, ilçe veya ehliyet sınıfı arayabilirsin.'}
          </p>
        </div>
      ) : (
        <>
          {featuredSchool && (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[2rem] border border-amber-400/20 bg-gradient-to-r from-[#1a1430] via-[#111827] to-[#10203a] p-[1px] shadow-2xl shadow-amber-500/10"
            >
              <div className="rounded-[2rem] bg-white/[0.03] p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      {featuredSchool.sponsorLabel || 'Sponsorlu'}
                    </div>
                    <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
                      {featuredSchool.name}
                    </h2>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-text-muted">
                      {featuredSchool.sponsorNote || 'Bu kurs bulunduğun şehir için öne çıkarılmış sponsorlu karttır.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/70">
                        <MapPin className="h-3 w-3 text-amber-300" />
                        {[featuredSchool.city, featuredSchool.district].filter(Boolean).join(' / ') || 'Konum yok'}
                      </span>
                      {featuredSchool.sponsorEndAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                          Sponsorlu süreli
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[280px]">
                    {featuredSchool.phone ? (
                      <a href={`tel:${featuredSchool.phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-black text-white transition hover:bg-white/[0.12]">
                        <Phone className="h-3.5 w-3.5" />
                        Ara
                      </a>
                    ) : null}
                    {featuredSchool.locationUrl ? (
                      <a href={withProtocol(featuredSchool.locationUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs font-black text-amber-300 transition hover:bg-amber-400/20">
                        <MapPin className="h-3.5 w-3.5" />
                        Konum
                      </a>
                    ) : null}
                    {featuredSchool.websiteUrl ? (
                      <a href={withProtocol(featuredSchool.websiteUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-black text-cyan-light transition hover:bg-cyan-400/20">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Başvuru
                      </a>
                    ) : null}
                  </div>
                </div>

                {/* Kayıt Başvuru Butonu */}
                <div className="mt-6 border-t border-white/10 pt-5">
                  <button
                    onClick={() => navigate(`/dashboard/driving-schools/${featuredSchool._id}/apply`)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-sm font-bold text-amber-300 transition hover:bg-amber-400/20 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    Başvur
                  </button>
                </div>
              </div>
            </Motion.div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {visibleSchools.map((school) => (
            <Motion.article
              key={school._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-3xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-cyan-500/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                  <Building2 className="h-6 w-6 text-cyan-light" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-xl font-black text-white group-hover:text-cyan-light transition-colors">{school.name}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-text-secondary">
                    <MapPin className="h-4 w-4 shrink-0 text-cyan-light" />
                    {[school.city, school.district].filter(Boolean).join(' / ') || 'Konum bilgisi yok'}
                  </p>
                </div>
              </div>

              {school.address && <p className="mt-4 text-sm font-semibold leading-relaxed text-text-secondary">{school.address}</p>}

              {isSponsorActive(school) && (
                <div className="mt-4 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-400/10 via-fuchsia-500/10 to-cyan-400/10 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300">
                    <Sparkles className="h-4 w-4" />
                    {school.sponsorLabel || 'Sponsorlu'}
                  </div>
                  {school.sponsorNote && (
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-text-muted">{school.sponsorNote}</p>
                  )}
                </div>
              )}

              {school.licenseClasses?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {school.licenseClasses.map((item) => (
                    <span key={`${school._id}-${item}`} className="rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-black text-primary-light transition-all hover:bg-primary/20">
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {school.description && (
                <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs font-semibold leading-relaxed text-text-muted">
                  {school.description}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {school.phone ? (
                  <a href={`tel:${school.phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3.5 text-xs font-black text-white transition hover:bg-white/10">
                    <Phone className="h-3.5 w-3.5" />
                    Ara
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3.5 text-xs font-black text-text-muted">Telefon yok</span>
                )}
                {school.locationUrl ? (
                  <a href={withProtocol(school.locationUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-3.5 text-xs font-black text-cyan-light transition hover:bg-cyan-500/20">
                    <MapPin className="h-3.5 w-3.5" />
                    Konum
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3.5 text-xs font-black text-text-muted">Konum yok</span>
                )}
                {school.websiteUrl ? (
                  <a href={withProtocol(school.websiteUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-3.5 text-xs font-black text-primary-light transition hover:bg-primary/20">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Web
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3.5 text-xs font-black text-text-muted">Web yok</span>
                )}
                <button
                  onClick={() => navigate(`/dashboard/driving-schools/${school._id}/apply`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-3.5 text-xs font-black text-cyan-light transition hover:bg-cyan-500/20 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  Başvur
                </button>
              </div>
            </Motion.article>
          ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserDrivingSchools;
