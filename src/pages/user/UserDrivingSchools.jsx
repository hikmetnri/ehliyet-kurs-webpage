import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

  const nearbyLabel = [city, district].filter(Boolean).join(' / ') || (debouncedQuery ? `"${debouncedQuery}" araması` : profileCity || 'şehir seçimi');

  return (
    <div className="space-y-6 pb-24 text-white sm:space-y-7">
      <Motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-cyan-500/15 bg-gradient-to-br from-cyan-500/10 via-white/[0.02] to-primary/10 p-6 sm:p-10 shadow-[0_0_50px_-12px_rgba(6,182,212,0.15)]"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-light">
              <Navigation className="h-3.5 w-3.5" />
              Sürücü Kursu Rehberi
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Yakındaki Sürücü Kursları</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-secondary">
              {nearbyLabel} için kayıt linki, iletişim bilgileri, adres ve ehliyet sınıflarını tek noktada inceleyin.
            </p>
          </div>
          <Link
            to="/dashboard/settings"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4.5 py-3 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 shadow-md"
          >
            <Settings className="h-4 w-4" />
            Şehrini Değiştir
          </Link>
        </div>
      </Motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm font-bold text-danger">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="rounded-[2.5rem] border border-white/5 bg-[#131522]/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl relative">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_190px_auto]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 focus-within:border-cyan-500/40 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
            <Search className="h-5 w-5 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kurs, adres veya ehliyet sınıfı ara..."
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/20"
            />
          </div>

          <div className="relative">
            <select
              value={city}
              onChange={(event) => handleCityChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4.5 py-3.5 text-sm font-black text-white outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#131522]">Şehir seç</option>
              {TURKEY_CITIES.map((item) => <option key={item} value={item} className="bg-[#131522]">{item}</option>)}
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
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4.5 py-3.5 text-sm font-black text-white outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer disabled:opacity-40"
            >
              <option value="" className="bg-[#131522]">{city ? 'Tüm ilçeler' : 'Önce şehir seç'}</option>
              {districtOptions.map((item) => <option key={item} value={item} className="bg-[#131522]">{item}</option>)}
            </select>
          </div>

          <button
            onClick={refreshSchools}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3.5 text-sm font-black text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer border border-cyan-500/20 animate-none"
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
        <div className="flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-[#131522]/40">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-xs font-black uppercase tracking-widest text-text-muted animate-pulse">Kurs rehberi hazırlanıyor...</p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-white/15" />
          <h3 className="text-lg font-black text-white">{city || debouncedQuery ? 'Bu filtreyle kurs bulunamadı' : 'Şehir seçerek veya arama yaparak kursları listele'}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-text-muted">
            {city || debouncedQuery
              ? 'İlçe alanını temizleyebilir veya profilindeki konum bilgisini güncelleyebilirsin.'
              : 'Türkiye geneli veri çok büyük olduğu için önce şehir seçebilir ya da kurs adı, ilçe veya ehliyet sınıfı arayabilirsin.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredSchools.map((school) => (
            <Motion.article
              key={school._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="group rounded-[2.25rem] border border-white/5 bg-[#131522]/60 p-6 transition-all duration-300 hover:border-cyan-500/40 hover:bg-[#131522]/90 hover:shadow-[0_0_35px_-12px_rgba(6,182,212,0.25)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 transition-colors group-hover:bg-cyan-500/20">
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
                <p className="mt-4 rounded-2xl border border-white/5 bg-black/35 p-4 text-xs font-semibold leading-relaxed text-text-muted">
                  {school.description}
                </p>
              )}

              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {school.phone ? (
                  <a href={`tel:${school.phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3.5 text-xs font-black text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 hover:shadow-md cursor-pointer">
                    <Phone className="h-3.5 w-3.5" />
                    Ara
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3.5 text-xs font-black text-text-muted">Telefon yok</span>
                )}
                {school.locationUrl ? (
                  <a href={withProtocol(school.locationUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-3.5 text-xs font-black text-cyan-light transition-all hover:bg-cyan-500/20 active:scale-95 hover:shadow-md cursor-pointer">
                    <MapPin className="h-3.5 w-3.5" />
                    Konum
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3.5 text-xs font-black text-text-muted">Konum yok</span>
                )}
                {school.websiteUrl ? (
                  <a href={withProtocol(school.websiteUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-3.5 text-xs font-black text-primary-light transition-all hover:bg-primary/20 active:scale-95 hover:shadow-md cursor-pointer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Web
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3.5 text-xs font-black text-text-muted">Web yok</span>
                )}
              </div>
            </Motion.article>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDrivingSchools;
