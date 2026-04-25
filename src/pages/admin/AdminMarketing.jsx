import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import {
  QrCode, Download, Loader2, CheckCircle2, AlertCircle,
  Monitor, Smartphone, Megaphone, ToggleLeft, ToggleRight,
  Save, RefreshCcw, Copy, ExternalLink, Shield, Zap, Play
} from 'lucide-react';

// ─── QR Oluşturucu (qrcode kütüphanesi olmadan SVG tabanlı) ───────────────────
// qrcode.js CDN yükü yerine hafif bir QR placeholder — gerçek proje için
// "npm install qrcode" sonra import QRCode from 'qrcode' ile kullanılabilir.
// Burada üçüncü parti bağımlılık olmadan görsel gösterim yapıyoruz.
const generateQRDataURL = async (text) => {
  // Dinamik import ile qrcode paketini dene
  try {
    const QRCode = (await import('qrcode')).default;
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: { dark: '#ffffff', light: '#0d0d14' },
    });
  } catch {
    // Fallback: Google Charts API (internet bağlantısı gerektirir)
    return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(text)}&bgcolor=0d0d14&color=ffffff&margin=10`;
  }
};

// ─── QR Tool ──────────────────────────────────────────────────────────────────
const QRTool = ({ settings }) => {
  const playUrl = settings?.playstore_url || '';
  const appUrl = settings?.appstore_url || '';

  const [activeStore, setActiveStore] = useState('play');
  const [qrUrl, setQrUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const imgRef = useRef();

  const currentUrl = activeStore === 'play' ? playUrl : appUrl;

  useEffect(() => {
    if (!currentUrl) { setQrUrl(''); return; }
    setQrLoading(true);
    generateQRDataURL(currentUrl).then(url => {
      setQrUrl(url);
      setQrLoading(false);
    });
  }, [currentUrl]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `qr-${activeStore === 'play' ? 'playstore' : 'appstore'}.png`;
    a.click();
  };

  const handleCopy = async () => {
    if (!currentUrl) return;
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <QrCode className="w-6 h-6 text-primary-light" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">QR Kod Oluşturucu</h2>
          <p className="text-xs text-text-muted font-bold mt-0.5">Uygulama mağaza linkiniz için anlık QR kod</p>
        </div>
      </div>

      {/* Store Switcher */}
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        {[
          { id: 'play', label: 'Google Play', icon: Play },
          { id: 'apple', label: 'App Store', icon: Smartphone },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveStore(s.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeStore === s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: URL info + actions */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">
              {activeStore === 'play' ? 'Google Play Store URL' : 'Apple App Store URL'}
            </p>
            <div className="flex items-center gap-2 p-4 bg-black/30 border border-white/10 rounded-2xl">
              {currentUrl ? (
                <>
                  <p className="flex-1 text-xs text-white font-mono truncate">{currentUrl}</p>
                  <button onClick={handleCopy} className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a href={currentUrl} target="_blank" rel="noreferrer" className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              ) : (
                <p className="text-text-muted text-xs italic">
                  URL bulunamadı. Lütfen <strong className="text-white">Yönetim Merkezi → Uygulama Ayarları</strong>'ndan mağaza linkini girin.
                </p>
              )}
            </div>
          </div>

          {currentUrl && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">QR Kod İşlemleri</p>
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
                  {copied ? 'Kopyalandı!' : 'URL Kopyala'}
                </button>
              </div>
            </div>
          )}

          {!playUrl && !appUrl && (
            <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning font-bold">
                QR kod oluşturmak için önce <strong>Yönetim Merkezi → Uygulama Ayarları</strong> kısmından Play Store veya App Store URL'ini girmeniz gerekiyor.
              </p>
            </div>
          )}
        </div>

        {/* Right: QR Preview */}
        <div className="flex flex-col items-center">
          <div className="w-52 h-52 bg-[#0d0d14] border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
            {!currentUrl ? (
              <div className="flex flex-col items-center gap-3 text-center p-4">
                <QrCode className="w-12 h-12 text-white/10" />
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">URL girilmedi</p>
              </div>
            ) : qrLoading ? (
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            ) : qrUrl ? (
              <img ref={imgRef} src={qrUrl} alt="QR Kod" className="w-full h-full object-contain p-2" />
            ) : null}
          </div>
          {currentUrl && !qrLoading && (
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-3 text-center">
              {activeStore === 'play' ? 'Google Play' : 'App Store'} QR Kod
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Reklam Yönetimi ──────────────────────────────────────────────────────────
const AdManagement = () => {
  const [settings, setSettings] = useState({
    ads_enabled: 'false',
    admob_banner_id: '',
    admob_interstitial_id: '',
    admob_rewarded_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [adsEnabled, setAdsEnabled] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings-map');
      setSettings(res.data);
      setAdsEnabled(res.data.ads_enabled === 'true');
    } catch (err) {
      console.error('Ayarlar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key, value) => {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await api.put(`/admin/settings-map/${key}`, { value });
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2500);
    } catch (err) {
      console.error(`${key} kaydedilemedi:`, err);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const handleToggleAds = async () => {
    const newVal = !adsEnabled;
    setAdsEnabled(newVal);
    await handleSave('ads_enabled', String(newVal));
  };

  const adFields = [
    {
      key: 'admob_banner_id',
      label: 'Banner Reklam ID',
      icon: Monitor,
      desc: 'Uygulama içinde sabit banner reklamlar için AdMob birim ID\'si',
      placeholder: 'ca-app-pub-XXXXXXXX/XXXXXXXX',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      key: 'admob_interstitial_id',
      label: 'Geçiş Reklamı ID',
      icon: Zap,
      desc: 'Ekran geçişlerinde gösterilen tam ekran interstitial reklam ID\'si',
      placeholder: 'ca-app-pub-XXXXXXXX/XXXXXXXX',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      key: 'admob_rewarded_id',
      label: 'Ödüllü Reklam ID',
      icon: Shield,
      desc: 'Kullanıcının ödül karşılığı izlediği rewarded reklam ID\'si',
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
          <p className="text-xs text-text-muted font-bold mt-0.5">Google AdMob reklam birimlerini yönetin</p>
        </div>
        <button
          onClick={fetchSettings}
          className="ml-auto p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Master Toggle */}
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
              {adsEnabled ? 'Kullanıcılar reklam görüyor' : 'Tüm reklamlar kapalı'}
            </p>
          </div>
        </div>
        <div className={`w-14 h-7 rounded-full transition-all relative ${adsEnabled ? 'bg-success' : 'bg-white/10'}`}>
          <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-md ${adsEnabled ? 'left-8' : 'left-1'}`} />
        </div>
      </div>

      {/* Ad ID Fields */}
      <div className="space-y-4">
        {adFields.map(field => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border ${field.border} bg-white/[0.02] space-y-3`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${field.bg}`}>
                <field.icon className={`w-4 h-4 ${field.color}`} />
              </div>
              <div>
                <p className="text-sm font-black text-white">{field.label}</p>
                <p className="text-[10px] text-text-muted">{field.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={settings[field.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
              />
              <button
                onClick={() => handleSave(field.key, settings[field.key])}
                disabled={saving[field.key]}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  saved[field.key]
                    ? 'bg-success/10 border border-success/30 text-success'
                    : 'bg-primary/10 border border-primary/20 text-primary-light hover:bg-primary/20'
                } disabled:opacity-50`}
              >
                {saving[field.key] ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saved[field.key] ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saved[field.key] ? 'Kaydedildi' : 'Kaydet'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/15 rounded-2xl">
        <AlertCircle className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary font-medium leading-relaxed">
          Reklam ID'leri Google AdMob konsolundan alınmalıdır. Test cihazlarında gerçek ID yerine AdMob test ID'leri kullanın.
          Değişiklikler Flutter uygulaması yeniden başlatıldığında veya remote config çekildiğinde aktif olur.
        </p>
      </div>
    </div>
  );
};

// ─── Ana Sayfa ─────────────────────────────────────────────────────────────────
const AdminMarketing = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/settings-map')
      .then(res => setSettings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Pazarlama & Reklam</h1>
        <p className="text-text-secondary text-sm mt-1">
          QR kod oluşturucu ve AdMob reklam yönetimi
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          <QRTool settings={settings} />
          <AdManagement />
        </div>
      )}
    </div>
  );
};

export default AdminMarketing;
