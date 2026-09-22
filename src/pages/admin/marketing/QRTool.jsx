import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  MousePointerClick,
  QrCode,
  Save,
} from 'lucide-react';
import api from '../../../api';

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

export default QRTool;
