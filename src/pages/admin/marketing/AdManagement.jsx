import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Megaphone,
  Monitor,
  RefreshCcw,
  Save,
  Shield,
  ToggleLeft,
  ToggleRight,
  Zap,
} from 'lucide-react';
import api from '../../../api';

const MotionDiv = motion.div;

const AdManagement = () => {
  const [settings, setSettings] = useState({
    admob_banner_id: '',
    admob_interstitial_id: '',
    admob_rewarded_id: '',
    admob_banner_id_ios: '',
    admob_interstitial_id_ios: '',
    admob_rewarded_id_ios: '',
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
        admob_banner_id_ios: ads.bannerIdIos || settingsRes.data.admob_banner_id_ios || '',
        admob_interstitial_id_ios: ads.interstitialIdIos || settingsRes.data.admob_interstitial_id_ios || '',
        admob_rewarded_id_ios: ads.rewardedIdIos || settingsRes.data.admob_rewarded_id_ios || '',
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
            bannerIdIos: nextSettings.admob_banner_id_ios || '',
            interstitialEnabled: enabled,
            interstitialId: nextSettings.admob_interstitial_id || '',
            interstitialIdIos: nextSettings.admob_interstitial_id_ios || '',
            interstitialFreq: Number(nextSettings.interstitial_freq || 5),
            rewardedEnabled: enabled,
            rewardedId: nextSettings.admob_rewarded_id || '',
            rewardedIdIos: nextSettings.admob_rewarded_id_ios || '',
          },
        }),
        api.put('/admin/settings-map/ads_enabled', { value: String(enabled) }),
        api.put('/admin/settings-map/admob_banner_id', { value: nextSettings.admob_banner_id || '' }),
        api.put('/admin/settings-map/admob_interstitial_id', { value: nextSettings.admob_interstitial_id || '' }),
        api.put('/admin/settings-map/admob_rewarded_id', { value: nextSettings.admob_rewarded_id || '' }),
        api.put('/admin/settings-map/admob_banner_id_ios', { value: nextSettings.admob_banner_id_ios || '' }),
        api.put('/admin/settings-map/admob_interstitial_id_ios', { value: nextSettings.admob_interstitial_id_ios || '' }),
        api.put('/admin/settings-map/admob_rewarded_id_ios', { value: nextSettings.admob_rewarded_id_ios || '' }),
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
      keyIos: 'admob_banner_id_ios',
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
      keyIos: 'admob_interstitial_id_ios',
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
      keyIos: 'admob_rewarded_id_ios',
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
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Android Reklam Kimliği (Google Play)</p>
              <input
                type="text"
                value={settings[field.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">iOS Reklam Kimliği (App Store)</p>
              <input
                type="text"
                value={settings[field.keyIos] || ''}
                onChange={e => setSettings(s => ({ ...s, [field.keyIos]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
              />
            </div>
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

export default AdManagement;
