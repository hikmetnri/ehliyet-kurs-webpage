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
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-light">
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

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.015] p-5 space-y-4 shadow-inner">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3.5 transition focus-within:border-primary/45 focus-within:ring-4 focus-within:ring-primary/10">
          <Search className="h-5 w-5 text-text-muted shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kurs adı, adres veya ehliyet sınıfı ara (Örn: Motor, B sınıfı, Kadıköy...)"
            className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-text-muted"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <select
              value={city}
              onChange={(event) => handleCityChange(event.target.value)}
              className="w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3.5 text-sm font-black text-white outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
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
              className="w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3.5 text-sm font-black text-white outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:opacity-40"
            >
              <option value="" className="bg-bg-card">{city ? 'Tüm ilçeler' : 'Önce şehir seç'}</option>
              {districtOptions.map((item) => <option key={item} value={item} className="bg-bg-card">{item}</option>)}
            </select>
          </div>

          <button
            onClick={refreshSchools}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-black text-white transition hover:bg-primary-light shadow-md shadow-primary/20 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 animate-spin-slow" />
            Sonuçları Yenile
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-text-muted pt-2 border-t border-white/5">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {filteredSchools.length} kurs gösteriliyor
          </span>
          {profileCity && (
            <button
              type="button"
              onClick={useProfileFilters}
              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary-light transition hover:bg-primary/20 cursor-pointer"
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
              Tüm illeri göster
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
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.015]">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary-light" />
          <p className="text-xs font-black uppercase tracking-widest text-text-muted animate-pulse">Kurs rehberi hazırlanıyor...</p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.015] p-12 text-center">
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
              className="overflow-hidden rounded-[2.25rem] border border-amber-400/20 bg-gradient-to-r from-[#1a1430] via-[#111827] to-[#10203a] p-[1px] shadow-2xl shadow-amber-500/10"
            >
              <div className="rounded-[2.25rem] bg-white/[0.025] p-6 shadow-2xl relative">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300 shadow-sm shadow-amber-400/5">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                        {featuredSchool.sponsorLabel || 'Sponsorlu'}
                      </div>
                      <h2 className="mt-3 text-2xl font-black tracking-tight text-white leading-tight">
                        {featuredSchool.name}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm font-medium leading-relaxed text-text-muted">
                    {featuredSchool.sponsorNote || 'Bu kurs bulunduğun şehir için öne çıkarılmış sponsorlu karttır.'}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.015] px-3.5 py-1.5 text-[11px] font-black text-text-secondary">
                      <MapPin className="h-3.5 w-3.5 text-amber-300" />
                      {[featuredSchool.city, featuredSchool.district].filter(Boolean).join(' / ') || 'Konum yok'}
                    </span>
                    {featuredSchool.sponsorEndAt && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/10 bg-amber-400/5 px-3.5 py-1.5 text-[11px] font-black text-amber-300">
                        Süreli Sponsorluk
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                      {featuredSchool.phone && (
                        <a 
                          href={`tel:${featuredSchool.phone.replace(/\s/g, '')}`} 
                          title="Telefonla Ara"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-text-secondary transition hover:bg-amber-400/10 hover:text-amber-300 hover:border-amber-400/20"
                        >
                          <Phone className="h-4.5 w-4.5" />
                        </a>
                      )}
                      {featuredSchool.locationUrl && (
                        <a 
                          href={withProtocol(featuredSchool.locationUrl)} 
                          target="_blank" 
                          rel="noreferrer"
                          title="Haritada Göster"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-text-secondary transition hover:bg-amber-400/10 hover:text-amber-300 hover:border-amber-400/20"
                        >
                          <MapPin className="h-4.5 w-4.5" />
                        </a>
                      )}
                      {featuredSchool.websiteUrl && (
                        <a 
                          href={withProtocol(featuredSchool.websiteUrl)} 
                          target="_blank" 
                          rel="noreferrer"
                          title="Web Sitesini Ziyaret Et"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-text-secondary transition hover:bg-amber-400/10 hover:text-amber-300 hover:border-amber-400/20"
                        >
                          <ExternalLink className="h-4.5 w-4.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/dashboard/driving-schools/${featuredSchool._id}/apply`)}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-bg-dark transition shadow-lg shadow-amber-400/25 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5 animate-pulse" />
                      Hemen Başvur (Sponsorlu)
                    </button>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}

          <div className="mt-5 flex flex-col gap-5">
            {visibleSchools.map((school) => (
              <Motion.article
                key={school._id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-3xl border border-white/[0.08] bg-white/[0.015] p-5 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.035] hover:shadow-lg hover:shadow-black/25 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-transform duration-300 group-hover:scale-105">
                      <Building2 className="h-5.5 w-5.5 text-primary-light" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-lg font-black text-white group-hover:text-primary-light transition-colors leading-snug">{school.name}</h2>
                      <p className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                        <MapPin className="h-4 w-4 shrink-0 text-primary-light" />
                        {[school.city, school.district].filter(Boolean).join(' / ') || 'Konum bilgisi yok'}
                      </p>
                    </div>
                  </div>

                  {school.address && (
                    <p className="mt-4 text-xs font-medium leading-relaxed text-text-muted/80">{school.address}</p>
                  )}

                  {isSponsorActive(school) && (
                    <div className="mt-4 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-400/10 via-fuchsia-500/10 to-primary/10 p-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        {school.sponsorLabel || 'Sponsorlu'}
                      </div>
                      {school.sponsorNote && (
                        <p className="mt-2 text-xs font-medium leading-relaxed text-text-muted">{school.sponsorNote}</p>
                      )}
                    </div>
                  )}

                  {school.licenseClasses?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {school.licenseClasses.map((item) => (
                        <span key={`${school._id}-${item}`} className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-primary-light">
                          {item} Sınıfı
                        </span>
                      ))}
                    </div>
                  )}

                  {school.description && (
                    <p className="mt-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-[11px] font-semibold italic leading-relaxed text-text-muted/70">
                      "{school.description}"
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    {school.phone && (
                      <a 
                        href={`tel:${school.phone.replace(/\s/g, '')}`} 
                        title="Telefonla Ara"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-text-secondary transition hover:bg-primary/10 hover:text-primary-light hover:border-primary/20"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    {school.locationUrl && (
                      <a 
                        href={withProtocol(school.locationUrl)} 
                        target="_blank" 
                        rel="noreferrer"
                        title="Haritada Göster"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-text-secondary transition hover:bg-primary/10 hover:text-primary-light hover:border-primary/20"
                      >
                        <MapPin className="h-4 w-4" />
                      </a>
                    )}
                    {school.websiteUrl && (
                      <a 
                        href={withProtocol(school.websiteUrl)} 
                        target="_blank" 
                        rel="noreferrer"
                        title="Web Sitesini Ziyaret Et"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-text-secondary transition hover:bg-primary/10 hover:text-primary-light hover:border-primary/20"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/dashboard/driving-schools/${school._id}/apply`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-primary-light shadow-md shadow-primary/25 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Kurs Başvurusu
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
