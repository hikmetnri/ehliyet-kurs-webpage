import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../api';

// ─── Extracted Modules (SRP) ──────────────────────────────────────────────────
import QRTool from './marketing/QRTool';
import AdManagement from './marketing/AdManagement';
import SubscriptionManagement from './marketing/SubscriptionManagement';
import CouponManagement from './marketing/CouponManagement';

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
