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
  const [city, setCity] = useState(profileCity);
  const [district, setDistrict] = useState(profileDistrict);
  const [useProfileLocation, setUseProfileLocation] = useState(true);

  const fetchSchools = useCallback(async () => {
    if (!city) {
      setSchools([]);
      setError('');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const params = { city, limit: 1000 };
      if (district) params.district = district;
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
  }, [city, district]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

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

  const nearbyLabel = [city, district].filter(Boolean).join(' / ') || profileCity || 'şehir seçimi';

  return (
    <div className="space-y-5 pb-24 text-white sm:space-y-6">
      <Motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-accent/15 bg-gradient-to-br from-accent/15 via-white/[0.035] to-primary/10 p-5 sm:p-8"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent-light">
              <Navigation className="h-3.5 w-3.5" />
              Profilinden ulaşılan kurs rehberi
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Yakındaki Sürücü Kursları</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-secondary">
              {nearbyLabel} için kayıt linki, telefon, konum ve verilen ehliyet sınıflarını tek yerde gör.
            </p>
          </div>
          <Link
            to="/dashboard/settings"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
            Profil Şehrini Düzenle
          </Link>
        </div>
      </Motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm font-bold text-danger">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="rounded-[2rem] border border-white/5 bg-bg-card/70 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_190px_auto]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <Search className="h-5 w-5 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kurs, adres veya ehliyet sınıfı ara..."
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25"
            />
          </div>

          <div className="relative">
            <select
              value={city}
              onChange={(event) => handleCityChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-white outline-none focus:border-accent/50"
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
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-white outline-none focus:border-accent/50 disabled:opacity-50"
            >
              <option value="" className="bg-bg-card">{city ? 'Tüm ilçeler' : 'Önce şehir seç'}</option>
              {districtOptions.map((item) => <option key={item} value={item} className="bg-bg-card">{item}</option>)}
            </select>
          </div>

          <button
            onClick={fetchSchools}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
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
              className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-accent-light transition hover:bg-accent/20"
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
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10 hover:text-white"
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
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10 hover:text-white"
            >
              Tüm ilçeleri göster
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-white/[0.02]">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-accent" />
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">Kurs rehberi hazırlanıyor...</p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <Building2 className="mx-auto mb-4 h-10 w-10 text-white/20" />
          <h3 className="text-lg font-black text-white">{city ? 'Bu filtreyle kurs bulunamadı' : 'Şehir seçerek kursları listele'}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-text-muted">
            {city
              ? 'İlçe alanını temizleyebilir veya profilindeki konum bilgisini güncelleyebilirsin.'
              : 'Türkiye geneli veri çok büyük olduğu için önce şehir seçerek yakındaki kursları hızlıca görebilirsin.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredSchools.map((school) => (
            <Motion.article
              key={school._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-[1.75rem] border border-white/5 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-accent/20 hover:bg-white/[0.055]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
                  <Building2 className="h-6 w-6 text-accent-light" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-xl font-black text-white">{school.name}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-text-secondary">
                    <MapPin className="h-4 w-4 shrink-0 text-accent-light" />
                    {[school.city, school.district].filter(Boolean).join(' / ') || 'Konum bilgisi yok'}
                  </p>
                </div>
              </div>

              {school.address && <p className="mt-4 text-sm font-semibold leading-relaxed text-text-secondary">{school.address}</p>}

              {school.licenseClasses?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {school.licenseClasses.map((item) => (
                    <span key={`${school._id}-${item}`} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary-light">
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {school.description && (
                <p className="mt-4 rounded-2xl border border-white/5 bg-black/15 p-3 text-xs font-semibold leading-relaxed text-text-muted">
                  {school.description}
                </p>
              )}

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {school.phone ? (
                  <a href={`tel:${school.phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-black text-white transition hover:bg-white/10">
                    <Phone className="h-3.5 w-3.5" />
                    Ara
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-xs font-black text-text-muted">Telefon yok</span>
                )}
                {school.locationUrl ? (
                  <a href={withProtocol(school.locationUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-3 py-3 text-xs font-black text-accent-light transition hover:bg-accent/20">
                    <MapPin className="h-3.5 w-3.5" />
                    Konum
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-xs font-black text-text-muted">Konum yok</span>
                )}
                {school.websiteUrl ? (
                  <a href={withProtocol(school.websiteUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-3 text-xs font-black text-primary-light transition hover:bg-primary/20">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Web
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-xs font-black text-text-muted">Web yok</span>
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
