import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';

const withProtocol = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const OPERATOR_TYPES = [
  'Forklift (Portif)',
  'Kazıcı-Yükleyici (Beko Loder)',
  'Ekskavatör (Kanal Kazıyıcı)',
  'Mobil Vinç',
  'Kule Vinç',
  'Tavan Vinci',
  'Greyder',
  'Loder (Yükleyici)',
  'Silindir (Yol Silindiri)',
  'Sepetli Platform (Manlift / Platform)',
  'Dozer (Buldozer)',
  'Mini Yükleyici (Bobcat)',
  'Teleskopik Yükleyici (Manitou)',
  'Beton Pompası',
  'Zemin Süpürme Makinesi',
  'Transpalet (Elektrikli / Akülü)',
  'Sondaj Makinesi',
  'Asfalt Serici (Finişer)',
];

const UserDrivingSchoolApply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLicenseClass, setFormLicenseClass] = useState('');
  const [formOperatorType, setFormOperatorType] = useState('');
  const [formPeriod, setFormPeriod] = useState('En yakın dönem');
  const [formMessage, setFormMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/driving-schools/${id}`);
        const schoolData = res.data?.data || res.data;
        setSchool(schoolData);

        // Pre-fill fields
        const initialName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '';
        setFormName(initialName);
        setFormPhone(user?.phone || '');
        setFormLicenseClass(schoolData?.licenseClasses?.[0] || 'B');
      } catch (err) {
        setError(err.response?.data?.error || 'Sürücü kursu bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formPhone.trim()) {
      alert('Lütfen telefon numaranızı girin.');
      return;
    }
    if (!formName.trim()) {
      alert('Lütfen adınızı ve soyadınızı girin.');
      return;
    }
    if (formLicenseClass === 'G' && !formOperatorType) {
      alert('Lütfen iş makinesi türünü seçin.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.post(`/driving-schools/${id}/apply`, {
        fullName: formName.trim(),
        phone: formPhone.trim(),
        requestedLicenseClass: formLicenseClass,
        preferredPeriod: formPeriod,
        message: formLicenseClass === 'G' && formOperatorType
          ? `[İş Makinesi: ${formOperatorType}] ${formMessage.trim()}`.trim()
          : formMessage.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Başvuru gönderilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-bold text-white outline-none transition-all placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10';
  const selectClass = 'w-full rounded-2xl border border-white/10 bg-[#1e2038] px-4 py-3.5 text-sm font-bold text-white outline-none transition-all focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 select-dark-options cursor-pointer';
  const labelClass = 'mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-muted';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-cyan-400" />
        <p className="text-xs font-black uppercase tracking-widest text-text-muted animate-pulse">Kurs bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (error && !school) {
    return (
      <div className="mx-auto max-w-xl text-center py-12">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 mb-4">
          <ArrowLeft className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-black text-white">Bir Hata Oluştu</h3>
        <p className="mt-2 text-sm font-medium text-text-muted leading-relaxed">{error}</p>
        <button
          onClick={() => navigate('/dashboard/driving-schools')}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
        >
          Rehbere Geri Dön
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-8 sm:p-10 shadow-2xl shadow-emerald-500/5"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-2xl font-black tracking-tight text-white sm:text-3xl">Başvurunuz İletildi!</h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-text-secondary">
            Bilgileriniz <strong className="text-white">{school?.name}</strong> sürücü kursuna e-posta olarak başarıyla gönderildi. Kurs yetkilileri sizinle en kısa sürede iletişime geçecektir.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/dashboard/driving-schools"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-cyan-400"
            >
              Rehbere Geri Dön
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-text-muted transition hover:bg-white/10 hover:text-white"
            >
              Ana Sayfaya Git
            </Link>
          </div>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24 text-white">
      {/* Header / Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/driving-schools')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-text-muted transition hover:bg-white/10 hover:text-white"
          title="Geri Dön"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Kayıt Başvurusu</p>
          <h1 className="text-xl font-black text-white">Sürücü Kursu Başvuru Formu</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Form Panel */}
        <Motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-5"
        >
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-cyan-light" />
            Öğrenci Kayıt Formu
          </h2>
          <p className="text-xs font-medium text-text-muted leading-relaxed">
            Aşağıdaki bilgileri doldurarak doğrudan Ehliyet Yolu üzerinden sürücü kursuna resmi kayıt ön-başvurusu gönderebilirsiniz.
          </p>

          <div>
            <label className={labelClass}>Ad Soyad *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Adınız ve Soyadınız"
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>E-posta</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
            </div>
            <div>
              <label className={labelClass}>Telefon Numarası *</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Ehliyet Sınıfı *</label>
              <select
                value={formLicenseClass}
                onChange={(e) => {
                  setFormLicenseClass(e.target.value);
                  if (e.target.value !== 'G') {
                    setFormOperatorType('');
                  }
                }}
                className={selectClass}
              >
                <option value="" className="bg-[#1e2038]">Sınıf Seçin</option>
                {(school?.licenseClasses && school.licenseClasses.length > 0
                  ? school.licenseClasses
                  : ['A', 'B', 'C', 'D', 'G']
                ).map((cls) => (
                  <option key={cls} value={cls} className="bg-[#1e2038]">
                    {cls === 'G' ? 'G Sınıfı (İş Makinesi)' : `${cls} Sınıfı`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Kayıt Olunacak Dönem *</label>
              <select
                value={formPeriod}
                onChange={(e) => setFormPeriod(e.target.value)}
                className={selectClass}
              >
                <option value="En yakın dönem" className="bg-[#1e2038]">En yakın dönem</option>
                <option value="Gelecek ay" className="bg-[#1e2038]">Gelecek ay</option>
                <option value="3 ay içinde" className="bg-[#1e2038]">3 ay içinde</option>
              </select>
            </div>
          </div>

          {formLicenseClass === 'G' && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.02] p-5 space-y-3 overflow-hidden"
            >
              <label className={labelClass}>İş Makinesi Operatörlük Belgesi Türü *</label>
              <select
                value={formOperatorType}
                onChange={(e) => setFormOperatorType(e.target.value)}
                required
                className={selectClass}
              >
                <option value="" className="bg-[#1e2038]">İş Makinesi Seçin</option>
                {OPERATOR_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-[#1e2038]">{type}</option>
                ))}
                <option value="Diğer" className="bg-[#1e2038]">Diğer (Açıklamada Belirtin)</option>
              </select>
            </Motion.div>
          )}

          <div>
            <label className={labelClass}>Mesaj / Ek Talep (İsteğe Bağlı)</label>
            <textarea
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              placeholder="Fiyat bilgisi, taksit imkanları veya ders saatleri hakkında sormak istedikleriniz..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
              <CheckCircle2 className="h-4.5 w-4.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-cyan-400 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            Başvuruyu Gönder
          </button>
        </Motion.form>

        {/* School Info Panel */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.015] p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
              <Building2 className="h-6 w-6 text-cyan-light" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{school?.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                <MapPin className="h-3.5 w-3.5 text-cyan-light" />
                {[school?.city, school?.district].filter(Boolean).join(' / ') || 'Konum bilgisi yok'}
              </p>
            </div>

            {school?.description && (
              <p className="text-xs font-medium leading-relaxed text-text-muted border-t border-white/5 pt-4">
                {school.description}
              </p>
            )}

            {school?.address && (
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Açık Adres</span>
                  <p className="mt-1.5 text-xs font-semibold text-text-secondary leading-relaxed">{school.address}</p>
                </div>
                {school?.locationUrl && (
                  <a
                    href={withProtocol(school.locationUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-xs font-black text-cyan-light transition hover:bg-cyan-500/20"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-cyan-light" />
                    Haritada Göster
                  </a>
                )}
              </div>
            )}

            {(school?.phone || school?.contactEmail || school?.websiteUrl) && (
              <div className="border-t border-white/5 pt-4 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">İletişim & Bağlantılar</span>
                <div className="space-y-2.5">
                  {school.phone && (
                    <a
                      href={`tel:${school.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2.5 text-xs font-bold text-text-secondary hover:text-white transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 text-cyan-light">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                      </span>
                      {school.phone}
                    </a>
                  )}
                  {school.contactEmail && (
                    <a
                      href={`mailto:${school.contactEmail}`}
                      className="flex items-center gap-2.5 text-xs font-bold text-text-secondary hover:text-white transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 text-cyan-light">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                      </span>
                      {school.contactEmail}
                    </a>
                  )}
                  {school.websiteUrl && (
                    <a
                      href={withProtocol(school.websiteUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 text-xs font-bold text-text-secondary hover:text-white transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 text-cyan-light">
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </span>
                      Web Sitesini Ziyaret Et
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {school?.isSponsored && (
            <div className="rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-fuchsia-500/10 to-cyan-400/10 p-6 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300">
                <Sparkles className="h-4 w-4" />
                {school.sponsorLabel || 'Öne Çıkan Sponsor'}
              </div>
              <p className="text-sm font-black text-white">Bu kurs Ehliyet Yolu tarafından tavsiye edilmektedir.</p>
              {school.sponsorNote && (
                <p className="text-xs font-semibold text-amber-100/70 leading-relaxed">{school.sponsorNote}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDrivingSchoolApply;
