import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Mail, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api';
import useAuthStore from '../store/authStore';

const AccountDeletion = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const canDelete = !!token && confirmText.trim().toUpperCase() === 'SIL';

  const handleDeleteAccount = async () => {
    if (!canDelete || deleting) return;
    const approved = window.confirm('Hesabınız ve hesabınıza bağlı veriler kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?');
    if (!approved) return;

    setDeleting(true);
    setMessage('');
    try {
      await api.delete('/auth/me');
      logout();
      setMessage('Hesabınız kalıcı olarak silindi. Giriş sayfasına yönlendiriliyorsunuz.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setMessage(err.response?.data?.error || err.response?.data?.message || 'Hesap silinemedi. Lütfen tekrar deneyin.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary p-6 md:p-12 selection:bg-red-500/30">
      <div className="max-w-3xl mx-auto glass-card rounded-[3rem] p-8 md:p-16 border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-10 font-bold uppercase tracking-widest text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Ana Sayfaya Dön
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white italic">Hesap Silme <span className="text-red-400 block not-italic text-2xl font-bold">Account Deletion</span></h1>
        </div>

        <div className="space-y-10">
          <section className="space-y-4">
            <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
              <ShieldAlert className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Önemli Bilgilendirme</h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  Hesabınızı sildiğinizde; çözdüğünüz sınavlar, başarı istatistikleriniz, favori sorularınız ve kazandığınız tüm dijital başarılar (XP, seviye vb.) kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white decoration-red-500/50 decoration-4 underline-offset-8 underline">Nasıl Silebilirim?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6 text-primary-light" />
                </div>
                <h3 className="font-bold text-white mb-3">Uygulama İçi</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Ehliyet Yolu mobil uygulamasında <strong>Profil - Ayarlar - Hesabımı Sil</strong> yolunu izleyerek saniyeler içinde hesabınızı silebilirsiniz.
                </p>
              </div>

              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-red-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="font-bold text-white mb-3">E-posta ile Talep</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Uygulama cihazınızda yüklü değilse, <strong>destek@ehliyetyolu.com</strong> adresine kayıtlı e-postanızla bir talep göndermeniz yeterlidir.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5 p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20">
            <div>
              <h2 className="text-2xl font-black text-white">Web Üzerinden Hesabı Sil</h2>
              <p className="text-text-secondary text-sm leading-relaxed mt-3">
                Hesabınızla giriş yaptıysanız bu sayfadan doğrudan silme işlemini başlatabilirsiniz. Güvenlik için onay alanına <strong>SIL</strong> yazmanız gerekir.
              </p>
            </div>

            {token ? (
              <div className="space-y-4">
                <div className="text-xs text-text-muted">
                  Giriş yapan hesap: <span className="text-white font-bold">{user?.email || 'Kullanıcı'}</span>
                </div>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SIL"
                  className="w-full bg-bg-dark/80 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-text-muted focus:outline-none focus:border-red-400"
                />
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={!canDelete || deleting}
                  className="w-full inline-flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-xs py-4 px-8 bg-red-500 rounded-2xl hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? 'Hesap Siliniyor' : 'Hesabımı Kalıcı Olarak Sil'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center text-white font-black uppercase tracking-widest text-xs py-4 px-8 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"
                >
                  Giriş Yap
                </Link>
                <a
                  href="mailto:destek@ehliyetyolu.com"
                  className="inline-flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-xs py-4 px-8 bg-red-500/20 border border-red-500/30 rounded-2xl hover:bg-red-500/30 transition-all"
                >
                  E-posta ile Talep <Mail className="w-4 h-4" />
                </a>
              </div>
            )}

            {message && (
              <p className={`text-sm font-bold ${message.includes('silindi') ? 'text-green-400' : 'text-red-300'}`}>
                {message}
              </p>
            )}
          </section>

          <section className="p-8 rounded-[2rem] border border-dashed border-white/20 text-center">
            <p className="text-text-secondary text-sm italic mb-4">"Verileriniz, Google Play Veri Güvenliği politikaları kapsamında korunur ve talebiniz üzerine 7 iş günü içerisinde sunucularımızdan tamamen temizlenir."</p>
            <a 
              href="mailto:destek@ehliyetyolu.com" 
              className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs py-4 px-8 bg-white/10 rounded-full hover:bg-white/20 transition-all"
            >
              Silme Talebi Gönder <Mail className="w-4 h-4" />
            </a>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-4 justify-between items-center text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">
          <span>© 2026 Ehliyet Yolu</span>
          <span className="text-red-500/50">Data Safety Compliance</span>
        </div>

      </div>
    </div>
  );
};

export default AccountDeletion;
