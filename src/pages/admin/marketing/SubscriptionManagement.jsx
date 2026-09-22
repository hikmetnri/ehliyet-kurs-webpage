import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  RefreshCcw,
  Shield,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import api from '../../../api';

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

export default SubscriptionManagement;
