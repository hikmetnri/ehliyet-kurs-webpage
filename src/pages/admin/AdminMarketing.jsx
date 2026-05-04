import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Megaphone,
  Monitor,
  MousePointerClick,
  QrCode,
  RefreshCcw,
  Save,
  Shield,
  ToggleLeft,
  ToggleRight,
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
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <QrCode className="w-6 h-6 text-primary-light" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Sabit Tanıtım QR Kodu</h2>
          <p className="text-xs text-text-muted font-bold mt-0.5">Basıma uygun, değişmeyen takip linki ve tıklanma ölçümü</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Sabit QR takip URL'si</p>
            <div className="flex items-center gap-2 p-4 bg-black/30 border border-white/10 rounded-2xl">
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
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Google Play yönlendirme URL'si</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={playUrl}
                onChange={e => onChangePlayUrl(e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=..."
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
              />
              <button
                onClick={() => onSavePlayUrl(playUrl)}
                disabled={savingPlayUrl}
                className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 border border-primary/20 text-primary-light rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50"
              >
                {savingPlayUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Kaydet
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-primary/15 bg-primary/5">
              <MousePointerClick className="w-5 h-5 text-primary-light mb-2" />
              <p className="text-2xl font-black text-white">{qrStats?.count || 0}</p>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Toplam tıklanma</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <CalendarClock className="w-5 h-5 text-text-muted mb-2" />
              <p className="text-sm font-black text-white">
                {qrStats?.lastScanAt ? new Date(qrStats.lastScanAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
              </p>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Son tıklama</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              disabled={!qrUrl}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              PNG İndir
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-white font-black text-sm rounded-2xl hover:bg-white/10 transition-all"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Kopyalandı' : 'Takip URL Kopyala'}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-64 h-64 bg-white border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
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
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center">
          <Megaphone className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Reklam Yönetimi</h2>
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
          adsEnabled ? 'bg-success/5 border-success/30' : 'bg-white/[0.02] border-white/5'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${adsEnabled ? 'bg-success/10' : 'bg-white/5'}`}>
            {adsEnabled ? <ToggleRight className="w-6 h-6 text-success" /> : <ToggleLeft className="w-6 h-6 text-text-muted" />}
          </div>
          <div>
            <p className={`font-black text-sm ${adsEnabled ? 'text-success' : 'text-text-secondary'}`}>
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
            className={`p-5 rounded-2xl border ${field.border} bg-white/[0.02] space-y-3`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${field.bg}`}>
                {React.createElement(field.icon, { className: `w-4 h-4 ${field.color}` })}
              </div>
              <div>
                <p className="text-sm font-black text-white">{field.label}</p>
                <p className="text-[10px] text-text-muted">{field.desc}</p>
              </div>
            </div>
            <input
              type="text"
              value={settings[field.key] || ''}
              onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
          </MotionDiv>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Geçiş reklamı sıklığı</p>
        <input
          type="number"
          min="1"
          max="15"
          value={settings.interstitial_freq || 5}
          onChange={e => setSettings(s => ({ ...s, interstitial_freq: e.target.value }))}
          className="w-32 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50"
        />
        <span className="ml-3 text-xs text-text-muted">ekran geçişinde 1 kez</span>
      </div>

      <button
        onClick={() => saveAdConfig()}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
          saved
            ? 'bg-success/10 border border-success/30 text-success'
            : 'bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20'
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
        <h1 className="text-2xl font-black text-white tracking-tight">Pazarlama & Reklam</h1>
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
          <AdManagement />
        </div>
      )}
    </div>
  );
};

export default AdminMarketing;
