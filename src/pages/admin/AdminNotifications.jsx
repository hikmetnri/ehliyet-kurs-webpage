import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Bell, Send, History, Trash2,
  AlertTriangle, CheckCircle2, Users, Star,
  Smartphone, Search, X, User, RefreshCw,
  Clock, MessageSquare
} from 'lucide-react';

const TARGETS = [
  { id: 'all',                label: 'Tümü',                   icon: Users,        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'pro',                label: 'Premium',                icon: Star,         color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'free',               label: 'Ücretsiz',               icon: User,         color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  { id: 'waiting_first_test', label: 'İlk Testi Bekleyenler',  icon: Clock,        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { id: 'targeted',           label: 'Seçili Kişiler',         icon: CheckCircle2, color: 'text-primary-light bg-primary/10 border-primary/20' },
];

const targetLabel = (id) => {
  const found = TARGETS.find(t => t.id === id);
  return found ? found.label : id;
};

const Toast = ({ msg, type = 'success', onClose }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-bold shadow-xl shadow-black/40 ${
          type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}
      >
        {type === 'success'
          ? <CheckCircle2 className="w-4 h-4" />
          : <AlertTriangle className="w-4 h-4" />
        }
        {msg}
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

const AdminNotifications = () => {
  const [toast, setToast]                   = useState(null);
  const [loading, setLoading]               = useState(false);
  const [notifTitle, setTitle]              = useState('');
  const [notifBody, setBody]                = useState('');
  const [notifImageUrl, setImageUrl]        = useState('');
  const [notifTarget, setTarget]            = useState('all');
  const [broadcastHistory, setHistory]      = useState([]);
  const [allUsers, setAllUsers]             = useState([]);
  const [selectedUserIds, setSelectedUsers] = useState([]);
  const [userSearchText, setUserSearch]     = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBroadcastHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/broadcast-history');
      setHistory(res.data.data || []);
    } catch {
      showToast('Geçmiş yüklenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsersForSelection = useCallback(async () => {
    try {
      const res = await api.get('/users?limit=1000');
      if (res.data.success) setAllUsers(res.data.users);
    } catch (err) {
      console.error('Kullanıcılar alınamadı', err);
    }
  }, []);

  useEffect(() => {
    fetchBroadcastHistory();
    fetchUsersForSelection();
  }, [fetchBroadcastHistory, fetchUsersForSelection]);

  const audienceCount = () => {
    if (notifTarget === 'all') return allUsers.length;
    if (notifTarget === 'pro') return allUsers.filter(u => u.proStatus).length;
    if (notifTarget === 'free') return allUsers.filter(u => !u.proStatus).length;
    if (notifTarget === 'waiting_first_test') return allUsers.filter(u => u.hasSolvedExam === false).length;
    if (notifTarget === 'targeted') return selectedUserIds.length;
    return 0;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;
    if (notifTarget === 'targeted' && selectedUserIds.length === 0) {
      showToast('Lütfen en az bir kullanıcı seçin.', 'error');
      return;
    }

    const targetName = targetLabel(notifTarget);
    if (!window.confirm(`Bu bildirimi "${targetName}" grubuna göndermek istiyor musunuz?`)) return;

    try {
      setLoading(true);
      if (notifTarget === 'targeted') {
        await api.post('/notifications/targeted', {
          title: notifTitle, body: notifBody,
          userIds: selectedUserIds, imageUrl: notifImageUrl
        });
      } else {
        await api.post('/notifications/broadcast', {
          title: notifTitle, body: notifBody,
          target: notifTarget, imageUrl: notifImageUrl
        });
      }
      showToast('Bildirim başarıyla gönderildi!');
      setTitle(''); setBody(''); setImageUrl(''); setSelectedUsers([]);
      fetchBroadcastHistory();
    } catch {
      showToast('Gönderim sırasında hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Bu kaydı silmek istiyor musunuz?')) return;
    try {
      await api.delete(`/notifications/broadcast-history/${id}`);
      setHistory(prev => prev.filter(b => b._id !== id));
      showToast('Geçmiş kaydı silindi.');
    } catch {
      showToast('Silinemedi.', 'error');
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const s = userSearchText.toLowerCase();
    return (u.firstName + ' ' + u.lastName).toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
  }).slice(0, 50);

  const broadcastItems = broadcastHistory.filter(i => i.target !== 'targeted');
  const targetedItems  = broadcastHistory.filter(i => i.target === 'targeted');

  return (
    <div className="space-y-6 pb-20">
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />

      {/* Page Header */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-primary-light uppercase tracking-widest">Operasyonel İşlemler</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">Bildirim Yönetimi</h1>
            <p className="mt-1 text-sm text-text-muted max-w-2xl">
              Uygulama genelinde tüm kullanıcılara veya belirli segmentlere anlık bildirimler gönderin.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
                <p className="text-lg font-black text-white">{allUsers.length}</p>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Kullanıcı</p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                <p className="text-lg font-black text-white">{broadcastHistory.length}</p>
                <p className="text-[9px] font-bold text-primary-light uppercase tracking-widest">Gönderim</p>
              </div>
            </div>
            <button
              onClick={fetchBroadcastHistory}
              disabled={loading}
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] text-text-muted hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Send Form */}
        <div className="xl:col-span-7">
          <div className="bg-white/[0.02] rounded-3xl border border-white/10 overflow-hidden">
            {/* Form Header */}
            <div className="flex items-center gap-4 p-5 sm:p-6 border-b border-white/10 bg-black/20">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-primary-light" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Toplu Bildirim Gönder</h2>
                <p className="text-xs text-text-muted mt-0.5">Cihazlara anlık Push Notification gönderin</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="p-5 sm:p-6 space-y-5">

              {/* Target Audience */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Hedef Kitle
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TARGETS.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTarget(t.id)}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl text-xs font-bold transition-all border ${
                        notifTarget === t.id
                          ? t.color + ' font-black'
                          : 'bg-white/[0.02] border-white/10 text-text-muted hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <t.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* Audience count indicator */}
                <div className="flex items-center gap-2.5 rounded-2xl bg-white/[0.015] border border-white/5 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="text-xs text-text-secondary">
                    Seçilen hedefte{' '}
                    <strong className="text-white font-black">{audienceCount()}</strong>
                    {' '}kullanıcı bulunuyor
                  </span>
                </div>
              </div>

              {/* User selection for targeted */}
              <AnimatePresence>
                {notifTarget === 'targeted' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          Kullanıcı Seçimi
                          {selectedUserIds.length > 0 && (
                            <span className="ml-2 text-primary-light">({selectedUserIds.length} seçildi)</span>
                          )}
                        </span>
                        {selectedUserIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedUsers([])}
                            className="text-[10px] font-bold text-primary-light hover:underline"
                          >
                            Temizle
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type="text"
                          value={userSearchText}
                          onChange={e => setUserSearch(e.target.value)}
                          placeholder="İsim veya e-posta ile ara..."
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:border-primary/50 outline-none"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
                        {filteredUsers.map(u => (
                          <button
                            key={u._id}
                            type="button"
                            onClick={() => {
                              if (selectedUserIds.includes(u._id)) {
                                setSelectedUsers(selectedUserIds.filter(id => id !== u._id));
                              } else {
                                setSelectedUsers([...selectedUserIds, u._id]);
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                              selectedUserIds.includes(u._id)
                                ? 'bg-primary/20 border border-primary/30'
                                : 'hover:bg-white/[0.04] border border-transparent'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-bold text-white">{u.firstName} {u.lastName}</span>
                              <span className="block text-[9px] text-text-muted">{u.email}</span>
                            </div>
                            {selectedUserIds.includes(u._id) && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary-light shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">Başlık</label>
                <input
                  value={notifTitle}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Örn: Hafta sonu sınav hazırlığı başlıyor"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Görsel URL <span className="normal-case font-normal">(İsteğe bağlı)</span>
                </label>
                <input
                  value={notifImageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://ornek.com/gorsel.jpg"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                />
                <p className="text-[10px] text-text-muted leading-normal">
                  Önerilen: 1024×512px, 2:1 oran, JPG/PNG/WEBP, 1MB altı
                </p>
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">Mesaj</label>
                  <span className={`text-[10px] font-bold ${notifBody.length > 160 ? 'text-amber-400' : 'text-text-muted'}`}>
                    {notifBody.length}/200
                  </span>
                </div>
                <textarea
                  value={notifBody}
                  onChange={e => setBody(e.target.value)}
                  maxLength={200}
                  rows={4}
                  placeholder="Kullanıcının ekranına düşecek mesaj..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all resize-none custom-scrollbar"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !notifTitle || !notifBody}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-white transition-all hover:bg-primary-light disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                  : <><Send className="w-4 h-4" /> Şimdi Gönder</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* Right: Preview + History */}
        <div className="xl:col-span-5 flex flex-col gap-5">

          {/* Phone Preview */}
          <div className="bg-white/[0.02] rounded-3xl border border-white/10 p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-3.5 h-3.5 text-text-muted" />
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Canlı önizleme</p>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-[300px] bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex gap-3 items-start hover:scale-[1.02] transition-transform duration-300">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-white text-[10px] font-bold">Ehliyet Yolu</span>
                    <span className="text-white/40 text-[9px]">şimdi</span>
                  </div>
                  <p className="text-white font-bold text-xs truncate">
                    {notifTitle || 'Bildirim Başlığı'}
                  </p>
                  <p className="text-white/70 text-[10px] line-clamp-2 leading-relaxed mt-0.5">
                    {notifBody || 'Mesaj içeriği burada görünür...'}
                  </p>
                </div>
                {notifImageUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/20 self-center">
                    <img
                      src={notifImageUrl}
                      alt="Görsel"
                      className="w-full h-full object-cover"
                      onError={e => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Broadcast History */}
          <div className="bg-white/[0.02] rounded-3xl border border-white/10 overflow-hidden flex-1">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-text-muted" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Toplu Bildirim Geçmişi</h3>
              </div>
              <span className="text-[10px] font-bold text-text-muted">{broadcastItems.length} kayıt</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[280px] overflow-y-auto custom-scrollbar">
              {broadcastItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <MessageSquare className="w-8 h-8 text-white/10 mb-2" />
                  <p className="text-xs text-text-muted">Toplu gönderim bulunmuyor</p>
                </div>
              ) : (
                broadcastItems.map(item => (
                  <div key={item._id} className="flex gap-3 items-start p-4 group hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary-light border border-primary/20 uppercase">
                          {targetLabel(item.target)}
                        </span>
                        <span className="text-[9px] text-text-muted">{item.sentCount || 0} alıcı</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-1">{item.title}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1 italic">
                        "{item.messageBody || item.body}"
                      </p>
                      <p className="text-[9px] text-text-muted/60 mt-1">
                        {new Date(item.createdAt).toLocaleString('tr-TR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteHistory(item._id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Targeted History */}
          <div className="bg-white/[0.02] rounded-3xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-text-muted" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bireysel Bildirim Geçmişi</h3>
              </div>
              <span className="text-[10px] font-bold text-text-muted">{targetedItems.length} kayıt</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[200px] overflow-y-auto custom-scrollbar">
              {targetedItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted">Bireysel gönderim bulunmuyor</div>
              ) : (
                targetedItems.map(item => (
                  <div key={item._id} className="flex gap-3 items-start p-4 group hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase">
                          Kişiye Özel
                        </span>
                        <span className="text-[9px] text-text-muted">{item.sentCount || 0} alıcı</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-1">{item.title}</p>
                      <p className="text-[9px] text-text-muted/60 mt-0.5">
                        {new Date(item.createdAt).toLocaleString('tr-TR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteHistory(item._id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
