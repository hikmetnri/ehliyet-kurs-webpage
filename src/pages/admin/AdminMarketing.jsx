import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Hash,
  Loader2,
  Megaphone,
  Monitor,
  MousePointerClick,
  Pencil,
  Percent,
  Plus,
  QrCode,
  RefreshCcw,
  Save,
  Shield,
  Tag,
  Ticket,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Zap,
} from 'lucide-react';
import api from '../../api';

const MotionDiv = motion.div;

const generateQRDataURL = async (text) => {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(text, {
    width: 512,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
};

const QRTool = ({ settings, qrStats, onChangePlayUrl, onSavePlayUrl, savingPlayUrl }) => {
  const playUrl = settings?.playstore_url || '';
  const trackUrl = useMemo(() => {
    const base = (api.defaults.baseURL || '').replace(/\/$/, '');
    return `${base}/admin/stats/qr/track`;
  }, []);

  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRDataURL(trackUrl).then(setQrUrl).catch(() => setQrUrl(''));
  }, [trackUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(trackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'ehliyet-yolu-sabit-qr.png';
    a.click();
  };

  return (
    <div className="bg-white/[0.02] p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <QrCode className="w-6 h-6 text-primary-light" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sabit Tanıtım QR Kodu</h2>
          <p className="text-xs text-text-muted font-bold mt-0.5">Basıma uygun, değişmeyen takip linki ve tıklanma ölçümü</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Sabit QR takip URL'si</p>
            <div className="flex items-center gap-2 p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
              <p className="flex-1 text-xs text-white font-mono truncate">{trackUrl}</p>
              <button onClick={handleCopy} className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all">
                {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
              <a href={trackUrl} target="_blank" rel="noreferrer" className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              Bu QR değişmez. Hedef Play Store linki değişirse sadece aşağıdaki URL güncellenir; basılı QR aynı kalır.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Google Play yönlendirme URL'si</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={playUrl}
                onChange={e => onChangePlayUrl(e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=..."
                className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white font-mono outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
              />
              <button
                onClick={() => onSavePlayUrl(playUrl)}
                disabled={savingPlayUrl}
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-3.5 bg-primary/10 border border-primary/20 text-primary-light rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50"
              >
                {savingPlayUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Kaydet
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-primary/15 bg-primary/5">
              <MousePointerClick className="w-5 h-5 text-primary-light mb-2" />
              <p className="text-2xl font-bold text-white">{qrStats?.count || 0}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Toplam tıklanma</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <CalendarClock className="w-5 h-5 text-text-muted mb-2" />
              <p className="text-sm font-bold text-white">
                {qrStats?.lastScanAt ? new Date(qrStats.lastScanAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
              </p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Son tıklama</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              disabled={!qrUrl}
              className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-light transition-all disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              PNG İndir
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-2xl hover:bg-white/10 transition-all"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Kopyalandı' : 'Takip URL Kopyala'}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-64 h-64 bg-white border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden">
            {qrUrl ? (
              <img src={qrUrl} alt="Sabit QR Kod" className="w-full h-full object-contain p-4" />
            ) : (
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            )}
          </div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-3 text-center">
            Kartvizit, afiş ve broşürde bu QR'ı kullan
          </p>
        </div>
      </div>
    </div>
  );
};

const AdManagement = () => {
  const [settings, setSettings] = useState({
    admob_banner_id: '',
    admob_interstitial_id: '',
    admob_rewarded_id: '',
    interstitial_freq: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, configRes] = await Promise.all([
        api.get('/admin/settings-map'),
        api.get('/auth/config'),
      ]);
      const ads = configRes.data?.ads || {};
      setSettings({
        ...settingsRes.data,
        admob_banner_id: ads.bannerId || settingsRes.data.admob_banner_id || '',
        admob_interstitial_id: ads.interstitialId || settingsRes.data.admob_interstitial_id || '',
        admob_rewarded_id: ads.rewardedId || settingsRes.data.admob_rewarded_id || '',
        interstitial_freq: ads.interstitialFreq || 5,
      });
      setAdsEnabled(
        ads.bannerEnabled === true ||
        ads.interstitialEnabled === true ||
        ads.rewardedEnabled === true ||
        settingsRes.data.ads_enabled === 'true'
      );
    } catch (err) {
      console.error('Ayarlar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const saveAdConfig = async (nextSettings = settings, enabled = adsEnabled) => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/auth/config', {
          ads: {
            bannerEnabled: enabled,
            bannerId: nextSettings.admob_banner_id || '',
            interstitialEnabled: enabled,
            interstitialId: nextSettings.admob_interstitial_id || '',
            interstitialFreq: Number(nextSettings.interstitial_freq || 5),
            rewardedEnabled: enabled,
            rewardedId: nextSettings.admob_rewarded_id || '',
          },
        }),
        api.put('/admin/settings-map/ads_enabled', { value: String(enabled) }),
        api.put('/admin/settings-map/admob_banner_id', { value: nextSettings.admob_banner_id || '' }),
        api.put('/admin/settings-map/admob_interstitial_id', { value: nextSettings.admob_interstitial_id || '' }),
        api.put('/admin/settings-map/admob_rewarded_id', { value: nextSettings.admob_rewarded_id || '' }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Reklam ayarları kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAds = async () => {
    const next = !adsEnabled;
    setAdsEnabled(next);
    await saveAdConfig(settings, next);
  };

  const adFields = [
    {
      key: 'admob_banner_id',
      label: 'Banner Reklam ID',
      icon: Monitor,
      desc: 'Uygulama içinde sabit banner reklamlar için AdMob birim IDsi',
      placeholder: 'ca-app-pub-XXXXXXXX/XXXXXXXX',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      key: 'admob_interstitial_id',
      label: 'Geçiş Reklamı ID',
      icon: Zap,
      desc: 'Ekran geçişlerinde gösterilen tam ekran reklam IDsi',
      placeholder: 'ca-app-pub-XXXXXXXX/XXXXXXXX',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      key: 'admob_rewarded_id',
      label: 'Ödüllü Reklam ID',
      icon: Shield,
      desc: 'Kullanıcının ödül karşılığı izlediği reklam IDsi',
      placeholder: 'ca-app-pub-XXXXXXXX/XXXXXXXX',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center">
          <Megaphone className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reklam Yönetimi</h2>
          <p className="text-xs text-text-muted font-bold mt-0.5">Veritabanındaki AdMob config kaydından okunur ve Flutter uygulamasına yayınlanır</p>
        </div>
        <button
          onClick={fetchSettings}
          className="ml-auto p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <div
        onClick={handleToggleAds}
        className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
          adsEnabled ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.015] border-white/10'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${adsEnabled ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
            {adsEnabled ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-text-muted" />}
          </div>
          <div>
            <p className={`font-bold text-sm ${adsEnabled ? 'text-emerald-400' : 'text-text-secondary'}`}>
              Reklamlar {adsEnabled ? 'Aktif' : 'Pasif'}
            </p>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
              {adsEnabled ? 'Banner, geçiş ve ödüllü reklamlar açık' : 'Tüm reklamlar kapalı'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {adFields.map(field => (
          <MotionDiv
            key={field.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border ${field.border} bg-white/[0.015] space-y-3`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${field.bg}`}>
                {React.createElement(field.icon, { className: `w-4 h-4 ${field.color}` })}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{field.label}</p>
                <p className="text-[10px] text-text-muted">{field.desc}</p>
              </div>
            </div>
            <input
              type="text"
              value={settings[field.key] || ''}
              onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
          </MotionDiv>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Geçiş reklamı sıklığı</p>
        <input
          type="number"
          min="1"
          max="15"
          value={settings.interstitial_freq || 5}
          onChange={e => setSettings(s => ({ ...s, interstitial_freq: e.target.value }))}
          className="w-32 bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50"
        />
        <span className="ml-3 text-xs text-text-muted">ekran geçişinde 1 kez</span>
      </div>

      <button
        onClick={() => saveAdConfig()}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
          saved
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-primary text-white hover:bg-primary-light'
        } disabled:opacity-50`}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? 'Reklam ayarları yayınlandı' : 'AdMob Ayarlarını Uygulamaya Yayınla'}
      </button>

      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/15 rounded-2xl">
        <AlertCircle className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary font-medium leading-relaxed">
          Bu ekran hem eski `ad_config` kaydını hem de yeni settings-map alanlarını günceller. Bu yüzden Flutter uygulaması `/auth/config` üzerinden güncel AdMob IDlerini görmeye devam eder.
        </p>
      </div>
    </div>
  );
};

const SubscriptionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [purchaseVerificationEnabled, setPurchaseVerificationEnabled] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/settings');
      const data = res.data?.data || {};
      setEnabled(data.subscriptionsEnabled === true || data.subscriptionsEnabled === 'true');
      setPurchaseVerificationEnabled(
        data.purchaseVerificationEnabled === true || data.purchaseVerificationEnabled === 'true'
      );
    } catch (err) {
      console.error('Abonelik ayarı alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleToggle = async () => {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    try {
      const res = await api.put('/subscriptions/settings', { enabled: next });
      const data = res.data?.data || {};
      setEnabled(data.subscriptionsEnabled === true || data.subscriptionsEnabled === 'true');
      setPurchaseVerificationEnabled(
        data.purchaseVerificationEnabled === true || data.purchaseVerificationEnabled === 'true'
      );
    } catch (err) {
      setEnabled(!next);
      console.error('Abonelik ayarı kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/[0.02] p-6 md:p-8 rounded-3xl border border-white/10 space-y-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
          enabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <Shield className={`w-6 h-6 ${enabled ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Abonelik Satış Durumu</h2>
          <p className="text-xs text-text-muted font-bold mt-0.5">
            Mobil uygulamadaki PRO satış ekranını ve plan görünürlüğünü yönetir
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="ml-auto p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || saving}
        className={`w-full flex items-center justify-between p-5 rounded-2xl border text-left transition-all disabled:opacity-60 ${
          enabled ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.015] border-white/10'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
            {loading || saving ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : enabled ? (
              <ToggleRight className="w-6 h-6 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-text-muted" />
            )}
          </div>
          <div>
            <p className={`font-bold text-sm ${enabled ? 'text-emerald-400' : 'text-text-secondary'}`}>
              Abonelik satış ekranı {enabled ? 'aktif' : 'kapalı'}
            </p>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
              {enabled ? 'Planlar kullanıcılara gösterilir' : 'Kullanıcılar satın alma başlatamaz'}
            </p>
          </div>
        </div>
      </button>

      <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/15 rounded-2xl">
        <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary font-medium leading-relaxed">
          Satın alma doğrulaması {purchaseVerificationEnabled ? 'aktif' : 'henüz aktif değil'}. Bu yüzden şu an en güvenli akış PRO üyeliği Kullanıcı Yönetimi ekranından manuel vermek.
        </p>
      </div>
    </div>
  );
};

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

const AdminMarketing = () => {
  const [settings, setSettings] = useState(null);
  const [qrStats, setQrStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPlayUrl, setSavingPlayUrl] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/admin/settings-map'),
      api.get('/admin/stats/qr'),
    ])
      .then(([settingsRes, qrRes]) => {
        setSettings(settingsRes.data);
        setQrStats(qrRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSavePlayUrl = async (value) => {
    try {
      setSavingPlayUrl(true);
      await api.put('/admin/settings-map/playstore_url', { value });
      setSettings(prev => ({ ...prev, playstore_url: value }));
    } catch (err) {
      console.error('Play Store URL kaydedilemedi:', err);
    } finally {
      setSavingPlayUrl(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pazarlama & Reklam</h1>
        <p className="text-text-secondary text-sm mt-1">
          Sabit QR takip linki, tıklanma ölçümü ve AdMob reklam yönetimi
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          <QRTool
            settings={settings}
            qrStats={qrStats}
            onChangePlayUrl={(value) => setSettings(prev => ({ ...prev, playstore_url: value }))}
            onSavePlayUrl={handleSavePlayUrl}
            savingPlayUrl={savingPlayUrl}
          />
          <SubscriptionManagement />
          <CouponManagement />
          <AdManagement />
        </div>
      )}
    </div>
  );
};

export default AdminMarketing;
