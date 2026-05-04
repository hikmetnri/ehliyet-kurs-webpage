import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Bell, Quote, ShieldAlert, Database, RefreshCw, Send, History,
  Trash2, AlertTriangle, CheckCircle2, Terminal, Plus, Edit, Save, X,
  Power, Users, Star, Smartphone, HelpCircle, GripVertical, Settings2,
  FileText, Lock, Mail, Link, Smartphone as PhoneIcon, ShieldCheck, Activity,
  ChevronRight, ToggleLeft, ToggleRight, Globe, AppWindow, User, Search
} from 'lucide-react';

// ─── Mini bileşenler ──────────────────────────────────────────────────────────

const SaveBtn = ({ loading, label = 'Kaydet' }) => (
  <button
    type="submit"
    disabled={loading}
    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
    {label}
  </button>
);

const SectionCard = ({ children, className = '' }) => (
  <div className={`glass-card rounded-3xl border border-white/5 bg-bg-card/50 shadow-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, iconColor = 'from-primary to-primary-dark', title, subtitle, action }) => (
  <div className="flex items-center justify-between p-6 lg:p-8 border-b border-white/5">
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-lg shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-base font-black text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const FieldLabel = ({ children }) => (
  <label className="text-[10px] uppercase font-black text-text-muted tracking-widest block mb-2">{children}</label>
);

const TextInput = ({ value, onChange, placeholder, ...rest }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all font-medium"
    {...rest}
  />
);

// SemVer Stepper — major.minor.patch for each part
const SemverStepper = ({ value = '1.0.0', onChange }) => {
  const parts = String(value).split('.').map(Number);
  const [major, minor, patch] = [parts[0] || 1, parts[1] || 0, parts[2] || 0];

  const update = (index, delta) => {
    const next = [major, minor, patch];
    next[index] = Math.max(0, next[index] + delta);
    onChange(next.join('.'));
  };

  const labels = ['Major', 'Minor', 'Patch'];
  const values = [major, minor, patch];
  const colors = ['text-sky-400', 'text-violet-400', 'text-emerald-400'];

  return (
    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5">
      {values.map((v, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-white/20 font-black text-lg select-none">.</span>}
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => update(i, 1)}
              className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded transition-all text-xs leading-none"
            >▲</button>
            <div className="flex flex-col items-center">
              <span className={`text-lg font-black tabular-nums leading-none ${colors[i]}`}>{v}</span>
              <span className="text-[8px] text-white/20 uppercase tracking-wider">{labels[i]}</span>
            </div>
            <button
              type="button"
              onClick={() => update(i, -1)}
              className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded transition-all text-xs leading-none"
            >▼</button>
          </div>
        </React.Fragment>
      ))}
      {/* Editable raw input */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="ml-auto text-xs text-white/40 bg-transparent border-l border-white/10 pl-3 w-16 focus:outline-none focus:text-white font-mono"
      />
    </div>
  );
};

const Toast = ({ msg, type = 'success', onClose }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold ${
          type === 'success'
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-danger/10 border-danger/30 text-danger'
        }`}
      >
        {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        {msg}
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'legal',         label: 'Hukuki Metinler',  icon: FileText,     color: 'from-emerald-500 to-teal-600' },
  { id: 'notifications', label: 'Bildirimler',       icon: Bell,         color: 'from-primary to-primary-dark' },
  { id: 'quotes',        label: 'Günün Sözleri',    icon: Quote,        color: 'from-amber-500 to-orange-600' },
  { id: 'faqs',          label: 'S.S.S.',            icon: HelpCircle,   color: 'from-violet-500 to-purple-700' },
  { id: 'system',        label: 'Sistem',            icon: Database,     color: 'from-rose-500 to-red-700' },
  { id: 'logs',          label: 'Aktivite Logları', icon: Terminal,     color: 'from-slate-500 to-gray-700' },
];

const AdminSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    TABS.some(tab => tab.id === requestedTab) ? requestedTab : 'legal'
  );

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Global loading
  const [loading, setLoading] = useState(false);

  // ── Legal State ──
  const [legalSettings, setLegalSettings] = useState({ privacy_policy: '', kvkk_text: '' });
  const [legalSaving, setLegalSaving] = useState('');

  // ── Notification State ──
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody]   = useState('');
  const [notifTarget, setNotifTarget] = useState('all');
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearchText, setUserSearchText] = useState('');

  // ── Quotes State ──
  const [quotes, setQuotes] = useState([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [quoteData, setQuoteData] = useState({ text: '', author: '' });

  // ── FAQ State ──
  const [faqs, setFaqs] = useState([]);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqData, setFaqData] = useState({ question: '', answer: '', isActive: true });

  // ── System State ──
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [systemLoading, setSystemLoading] = useState(false);

  // ── Logs State ──
  const [logs, setLogs] = useState([]);

  // ─── Data fetchers ───────────────────────────────────────────────────────────

  const fetchSettingsMap = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings-map');
      const d = res.data;
      setLegalSettings({
        privacy_policy: d.privacy_policy || '',
        kvkk_text:      d.kvkk_text      || '',
      });
    } catch (err) {
      showToast('Ayarlar yüklenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBroadcastHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/broadcast-history');
      setBroadcastHistory(res.data.data || []);
    } catch { } finally { setLoading(false); }
  }, []);

  const fetchQuotes = useCallback(async () => {
    try { setLoading(true); const res = await api.get('/quotes'); setQuotes(res.data); }
    catch { } finally { setLoading(false); }
  }, []);

  const fetchFaqs = useCallback(async () => {
    try { setLoading(true); const res = await api.get('/admin/faqs'); setFaqs(res.data); }
    catch { } finally { setLoading(false); }
  }, []);

  const fetchMaintenanceStatus = useCallback(async () => {
    try { const res = await api.get('/admin/maintenance-status'); setIsMaintenance(res.data.isMaintenance); }
    catch { }
  }, []);

  const fetchLogs = useCallback(async () => {
    try { setLoading(true); const res = await api.get('/admin/logs'); setLogs(res.data || []); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
    if (activeTab === 'legal') fetchSettingsMap();
    if (activeTab === 'notifications') fetchBroadcastHistory();
    if (activeTab === 'quotes') fetchQuotes();
    if (activeTab === 'faqs') fetchFaqs();
    if (activeTab === 'system') fetchMaintenanceStatus();
    if (activeTab === 'logs') fetchLogs();
    if (activeTab === 'notifications') {
      fetchBroadcastHistory();
      fetchUsersForSelection();
    }
  }, [activeTab]);

  const fetchUsersForSelection = async () => {
    try {
      const res = await api.get('/users?limit=1000');
      if (res.data.success) setAllUsers(res.data.users);
    } catch (err) { console.error('Kullanıcılar alınamadı', err); }
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveLegal = async (key) => {
    try {
      setLegalSaving(key);
      await api.put(`/admin/settings-map/${key}`, { value: legalSettings[key] });
      showToast(key === 'privacy_policy' ? 'Gizlilik Politikası kaydedildi!' : 'KVKK metni kaydedildi!');
    } catch { showToast('Kayıt hatası.', 'error'); }
    finally { setLegalSaving(''); }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;
    
    if (notifTarget === 'targeted' && selectedUserIds.length === 0) {
      showToast('Lütfen en az bir kullanıcı seçin.', 'error');
      return;
    }

    const targetName = notifTarget === 'pro' ? 'SADECE PREMIUM' 
                     : notifTarget === 'free' ? 'ÜCRETSİZ' 
                     : notifTarget === 'targeted' ? `${selectedUserIds.length} SEÇİLİ`
                     : 'BÜTÜN';
    
    if (!window.confirm(`Bu bildirimi ${targetName} kullanıcılara göndermek istiyor musunuz?`)) return;
    
    try {
      setLoading(true);
      if (notifTarget === 'targeted') {
        await api.post('/notifications/targeted', { 
          title: notifTitle, 
          body: notifBody, 
          userIds: selectedUserIds 
        });
      } else {
        await api.post('/notifications/broadcast', { 
          title: notifTitle, 
          body: notifBody, 
          target: notifTarget 
        });
      }
      showToast('Bildirim başarıyla gönderildi!');
      setNotifTitle(''); setNotifBody('');
      setSelectedUserIds([]);
      fetchBroadcastHistory();
    } catch { showToast('Gönderim hatası.', 'error'); }
    finally { setLoading(false); }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Bu kaydı silmek istiyor musunuz?')) return;
    try {
      await api.delete(`/notifications/broadcast-history/${id}`);
      setBroadcastHistory(prev => prev.filter(b => b._id !== id));
    } catch { showToast('Silinemedi.', 'error'); }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingQuote) { await api.put(`/quotes/${editingQuote._id}`, quoteData); }
      else              { await api.post('/quotes', quoteData); }
      setShowQuoteForm(false); setEditingQuote(null); setQuoteData({ text: '', author: '' });
      showToast('Söz kaydedildi!');
      fetchQuotes();
    } catch { showToast('Hata oluştu.', 'error'); }
    finally { setLoading(false); }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm('Bu sözü silmek istiyor musunuz?')) return;
    try { await api.delete(`/quotes/${id}`); setQuotes(prev => prev.filter(q => q._id !== id)); showToast('Silindi.'); }
    catch { showToast('Silinemedi.', 'error'); }
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingFaq) { await api.put(`/admin/faqs/${editingFaq._id}`, faqData); }
      else            { await api.post('/admin/faqs', faqData); }
      setShowFaqForm(false); setEditingFaq(null); setFaqData({ question: '', answer: '', isActive: true });
      showToast('S.S.S. kaydedildi!');
      fetchFaqs();
    } catch { showToast('Hata oluştu.', 'error'); }
    finally { setLoading(false); }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Bu S.S.S. başlığını silmek istiyor musunuz?')) return;
    try { await api.delete(`/admin/faqs/${id}`); setFaqs(prev => prev.filter(f => f._id !== id)); showToast('Silindi.'); }
    catch { showToast('Silinemedi.', 'error'); }
  };

  const handleToggleFaqActive = async (faq) => {
    try {
      await api.put(`/admin/faqs/${faq._id}`, { ...faq, isActive: !faq.isActive });
      fetchFaqs();
    } catch { showToast('Durum değiştirilemedi.', 'error'); }
  };

  const toggleMaintenance = async () => {
    const msg = isMaintenance ? 'Bakım modundan çıkılsın mı?' : 'UYARI: Bakım moduna geçilsin mi? Kullanıcılar uygulamaya giremez!';
    if (!window.confirm(msg)) return;
    try {
      setSystemLoading(true);
      const res = await api.post('/admin/maintenance', { enabled: !isMaintenance });
      setIsMaintenance(res.data.isMaintenance);
      showToast(res.data.isMaintenance ? 'Bakım modu açıldı.' : 'Bakım modu kapatıldı.');
    } catch { showToast('Hata!', 'error'); }
    finally { setSystemLoading(false); }
  };

  const handleBackup = async () => {
    try {
      setSystemLoading(true);
      const res = await api.get('/admin/backup');
      showToast(`Yedek oluşturuldu: ${res.data.filename}`);
    } catch { showToast('Yedekleme hatası!', 'error'); }
    finally { setSystemLoading(false); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  const contentVariants = {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -12 },
  };

  const activeTabMeta = TABS.find(t => t.id === activeTab);

  return (
    <div className="flex gap-6 pb-20 min-h-[80vh]">
      {/* Toast */}
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />

      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 flex flex-col gap-1 sticky top-6 self-start">
        <p className="text-[9px] font-black uppercase text-text-muted tracking-widest px-3 mb-2">Kategoriler</p>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left group relative ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.color} opacity-10`}
                  transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                />
              )}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                isActive ? `bg-gradient-to-br ${tab.color} shadow-lg` : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <tab.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="relative z-10 truncate">{tab.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto relative z-10 opacity-50" />}
            </button>
          );
        })}
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        {/* Header strip */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeTabMeta?.color} flex items-center justify-center shadow-lg`}>
            {activeTabMeta && <activeTabMeta.icon className="w-4 h-4 text-white" />}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">{activeTabMeta?.label}</h1>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ══════════ TAB: LEGAL ══════════ */}
          {activeTab === 'legal' && (
            <motion.div key="legal" variants={contentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">

              {/* Privacy Policy */}
              <SectionCard>
                <CardHeader
                  icon={Lock}
                  iconColor="from-emerald-500 to-teal-600"
                  title="Gizlilik Politikası"
                  subtitle="Landing page ve mobil uygulama tarafından okunur"
                  action={
                    <button
                      onClick={() => handleSaveLegal('privacy_policy')}
                      disabled={legalSaving === 'privacy_policy'}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                      {legalSaving === 'privacy_policy' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Kaydet
                    </button>
                  }
                />
                <div className="p-6 lg:p-8">
                  <textarea
                    rows={14}
                    value={legalSettings.privacy_policy}
                    onChange={e => setLegalSettings(p => ({ ...p, privacy_policy: e.target.value }))}
                    placeholder="Gizlilik politikası metnini buraya yazın..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/90 placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all resize-none custom-scrollbar font-mono leading-relaxed"
                  />
                  <p className="text-[10px] text-text-muted mt-2">
                    💡 Play Store onayı için bu metnin eksiksiz doldurulması zorunludur.
                  </p>
                </div>
              </SectionCard>

              {/* KVKK */}
              <SectionCard>
                <CardHeader
                  icon={ShieldCheck}
                  iconColor="from-teal-500 to-cyan-600"
                  title="KVKK Aydınlatma Metni"
                  subtitle="Kişisel Verilerin Korunması Kanunu uyarınca zorunlu bildirim"
                  action={
                    <button
                      onClick={() => handleSaveLegal('kvkk_text')}
                      disabled={legalSaving === 'kvkk_text'}
                      className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20"
                    >
                      {legalSaving === 'kvkk_text' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Kaydet
                    </button>
                  }
                />
                <div className="p-6 lg:p-8">
                  <textarea
                    rows={14}
                    value={legalSettings.kvkk_text}
                    onChange={e => setLegalSettings(p => ({ ...p, kvkk_text: e.target.value }))}
                    placeholder="KVKK aydınlatma metnini buraya yazın..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/90 placeholder-white/20 focus:outline-none focus:border-teal-500/50 transition-all resize-none custom-scrollbar font-mono leading-relaxed"
                  />
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* ══════════ TAB: NOTIFICATIONS ══════════ */}
          {activeTab === 'notifications' && (
            <motion.div key="notifications" variants={contentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Send form */}
                <div className="xl:col-span-7">
                  <SectionCard>
                    <CardHeader icon={Send} iconColor="from-primary to-primary-dark" title="Toplu Bildirim Gönder" subtitle="Cihazlara anlık Push Notification gönderin" />
                    <form onSubmit={handleSendBroadcast} className="p-6 lg:p-8 space-y-5">
                      {/* Target */}
                      <div>
                        <FieldLabel>Hedef Kitle</FieldLabel>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { id: 'all', label: 'Tümü', icon: Users }, 
                            { id: 'pro', label: 'Premium', icon: Star },
                            { id: 'free', label: 'Ücretsiz', icon: User },
                            { id: 'targeted', label: 'Seçili Kişiler', icon: CheckCircle2 }
                          ].map(t => (
                            <button
                              key={t.id} type="button"
                              onClick={() => setNotifTarget(t.id)}
                              className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                                notifTarget === t.id
                                  ? 'bg-primary/10 border-primary/40 text-primary-light shadow-inner'
                                  : 'bg-black/20 border-white/5 text-text-muted hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <t.icon className="w-4 h-4" /> {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {notifTarget === 'targeted' && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex justify-between">
                            <span>Kullanıcı Seçimi ({selectedUserIds.length} seçildi)</span>
                            <button type="button" onClick={() => setSelectedUserIds([])} className="text-primary-light hover:underline lowercase">temizle</button>
                          </label>
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input 
                              type="text"
                              value={userSearchText}
                              onChange={e => setUserSearchText(e.target.value)}
                              placeholder="İsim veya e-posta ile ara..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-primary/50 outline-none"
                            />
                          </div>
                          <div className="max-h-[160px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                            {allUsers
                              .filter(u => {
                                const search = userSearchText.toLowerCase();
                                return (u.firstName + ' ' + u.lastName).toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
                              })
                              .slice(0, 50)
                              .map(u => (
                                <button
                                  key={u._id}
                                  type="button"
                                  onClick={() => {
                                    if (selectedUserIds.includes(u._id)) setSelectedUserIds(selectedUserIds.filter(id => id !== u._id));
                                    else setSelectedUserIds([...selectedUserIds, u._id]);
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                                    selectedUserIds.includes(u._id) ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'
                                  }`}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-white">{u.firstName} {u.lastName}</span>
                                    <span className="text-[9px] text-text-muted">{u.email}</span>
                                  </div>
                                  {selectedUserIds.includes(u._id) && <CheckCircle2 className="w-3.5 h-3.5 text-primary-light" />}
                                </button>
                              ))
                            }
                          </div>
                        </motion.div>
                      )}
                      <div>
                        <FieldLabel>Başlık</FieldLabel>
                        <TextInput value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Örn: Hafta Sonu Sınav Hazırlığı Başlıyor 🚀" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <FieldLabel>Mesaj İçeriği</FieldLabel>
                          <span className={`text-[10px] font-black ${notifBody.length > 160 ? 'text-warning' : 'text-text-muted'}`}>{notifBody.length}/200</span>
                        </div>
                        <textarea
                          value={notifBody} onChange={e => setNotifBody(e.target.value)} maxLength={200} rows={4}
                          placeholder="Kullanıcının ekranına düşecek mesaj..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all resize-none custom-scrollbar"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !notifTitle || !notifBody}
                        className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:grayscale"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Şimdi Gönder</>}
                      </button>
                    </form>
                  </SectionCard>
                </div>

                {/* Preview + History */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                  {/* Preview */}
                  <div className="glass-card rounded-3xl border border-white/5 bg-gradient-to-br from-black/60 to-black/20 shadow-2xl flex flex-col items-center justify-center p-6 h-[220px] relative overflow-hidden">
                    <p className="text-[9px] font-black uppercase text-text-muted tracking-widest absolute top-4 left-4 flex items-center gap-1.5"><Smartphone className="w-3 h-3" /> Canlı Önizleme</p>
                    <div className="w-full max-w-[300px] bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 flex gap-3 mt-4 hover:scale-105 transition-transform duration-500">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-white text-[10px] font-bold">Ehliyet Yolu</span>
                          <span className="text-white/40 text-[9px]">şimdi</span>
                        </div>
                        <p className="text-white font-black text-[11px] truncate">{notifTitle || 'Bildirim Başlığı'}</p>
                        <p className="text-white/70 text-[10px] line-clamp-2">{notifBody || 'Mesaj içeriği burada görünür...'}</p>
                      </div>
                    </div>
                  </div>

                  {/* History */}
                  <SectionCard className="flex-1">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-2"><History className="w-4 h-4 text-text-muted" /><h3 className="text-xs font-black text-white uppercase tracking-wider">Gönderim Geçmişi</h3></div>
                      <button onClick={fetchBroadcastHistory} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><RefreshCw className={`w-3.5 h-3.5 text-text-muted ${loading ? 'animate-spin' : ''}`} /></button>
                    </div>
                    <div className="divide-y divide-white/5 max-h-[340px] overflow-y-auto custom-scrollbar">
                      {broadcastHistory.length === 0
                        ? <div className="p-10 text-center text-text-muted text-xs">Geçmiş bulunamadı</div>
                        : broadcastHistory.map(item => (
                          <div key={item._id} className="p-4 flex gap-3 items-start group hover:bg-white/[0.02] transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{item.title}</p>
                              <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">"{item.messageBody || item.body}"</p>
                              <p className="text-[9px] text-text-muted/60 mt-1">{new Date(item.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <button onClick={() => handleDeleteHistory(item._id)} className="p-1.5 opacity-0 group-hover:opacity-100 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all shrink-0">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  </SectionCard>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════ TAB: QUOTES ══════════ */}
          {activeTab === 'quotes' && (
            <motion.div key="quotes" variants={contentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <SectionCard>
                <CardHeader
                  icon={Quote}
                  iconColor="from-amber-500 to-orange-600"
                  title="Motivasyon Sözleri"
                  subtitle="Flutter uygulamasında gösterilecek günlük sözler"
                  action={
                    <button
                      onClick={() => { setShowQuoteForm(true); setEditingQuote(null); setQuoteData({ text: '', author: '' }); }}
                      className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                    >
                      <Plus className="w-4 h-4" /> Yeni Ekle
                    </button>
                  }
                />
                <div className="p-6 lg:p-8 space-y-6">
                  <AnimatePresence>
                    {showQuoteForm && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <form onSubmit={handleQuoteSubmit} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-4">
                          <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">{editingQuote ? 'Sözü Güncelle' : 'Yeni Söz Ekle'}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><FieldLabel>Söz / İçerik</FieldLabel><TextInput required value={quoteData.text} onChange={e => setQuoteData(p => ({ ...p, text: e.target.value }))} placeholder="Motivasyonel söz..." /></div>
                            <div><FieldLabel>Yazar / Kaynak</FieldLabel><TextInput required value={quoteData.author} onChange={e => setQuoteData(p => ({ ...p, author: e.target.value }))} placeholder="Atatürk, Einstein..." /></div>
                          </div>
                          <div className="flex gap-3">
                            <SaveBtn loading={loading} />
                            <button type="button" onClick={() => setShowQuoteForm(false)} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white rounded-xl text-xs font-black"><X className="w-4 h-4" /></button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {loading
                    ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
                    : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quotes.map(q => (
                          <div key={q._id} className="bg-black/30 border border-white/5 rounded-2xl p-5 relative group hover:border-amber-500/20 transition-all">
                            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => { setEditingQuote(q); setQuoteData({ text: q.text, author: q.author }); setShowQuoteForm(true); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-text-muted hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteQuote(q._id)} className="p-1.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <Quote className="w-7 h-7 text-amber-500/20 mb-3" />
                            <p className="text-sm text-white/90 italic leading-relaxed mb-3">"{q.text}"</p>
                            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-amber-500"></div><span className="text-[10px] font-black uppercase tracking-widest text-amber-500/70">{q.author}</span></div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* ══════════ TAB: FAQS ══════════ */}
          {activeTab === 'faqs' && (
            <motion.div key="faqs" variants={contentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <SectionCard>
                <CardHeader
                  icon={HelpCircle}
                  iconColor="from-violet-500 to-purple-700"
                  title="S.S.S. Yönetimi"
                  subtitle="Landing page ve Flutter uygulaması için sıkça sorulan sorular"
                  action={
                    <button
                      onClick={() => { setShowFaqForm(true); setEditingFaq(null); setFaqData({ question: '', answer: '', isActive: true }); }}
                      className="flex items-center gap-2 px-5 py-2 bg-violet-500 hover:bg-violet-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20"
                    >
                      <Plus className="w-4 h-4" /> Yeni Ekle
                    </button>
                  }
                />
                <div className="p-6 lg:p-8 space-y-4">
                  <AnimatePresence>
                    {showFaqForm && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <form onSubmit={handleFaqSubmit} className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5 space-y-4 mb-4">
                          <h3 className="text-xs font-black text-violet-400 uppercase tracking-widest">{editingFaq ? 'S.S.S. Güncelle' : 'Yeni S.S.S. Ekle'}</h3>
                          <div><FieldLabel>Soru</FieldLabel><TextInput required value={faqData.question} onChange={e => setFaqData(p => ({ ...p, question: e.target.value }))} placeholder="Örn: Bu platform tamamen ücretsiz mi?" /></div>
                          <div>
                            <FieldLabel>Cevap</FieldLabel>
                            <textarea required rows={3} value={faqData.answer} onChange={e => setFaqData(p => ({ ...p, answer: e.target.value }))} placeholder="Net ve anlaşılır bir cevap yazın..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all resize-none" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-text-muted text-xs font-bold">Aktif mi?</span>
                            <button type="button" onClick={() => setFaqData(p => ({ ...p, isActive: !p.isActive }))} className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${faqData.isActive ? 'bg-success' : 'bg-white/10'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${faqData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          <div className="flex gap-3">
                            <SaveBtn loading={loading} />
                            <button type="button" onClick={() => setShowFaqForm(false)} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white rounded-xl text-xs font-black"><X className="w-4 h-4" /></button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {loading
                    ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>
                    : faqs.length === 0
                      ? (
                        <div className="text-center py-16 text-text-muted">
                          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="font-bold text-sm">Henüz S.S.S. eklenmemiş.</p>
                        </div>
                      )
                      : (
                        <div className="space-y-2">
                          {faqs.map((faq, i) => (
                            <motion.div key={faq._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${faq.isActive ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]' : 'border-white/5 bg-black/20 opacity-50'}`}
                            >
                              <GripVertical className="w-4 h-4 text-white/20 mt-1 shrink-0 cursor-grab" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm mb-0.5">S: {faq.question}</p>
                                <p className="text-text-muted text-xs line-clamp-2">C: {faq.answer}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${faq.isActive ? 'bg-success/10 text-success' : 'bg-white/5 text-text-muted'}`}>{faq.isActive ? 'Aktif' : 'Pasif'}</span>
                                <button onClick={() => handleToggleFaqActive(faq)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors" title={faq.isActive ? 'Pasif Yap' : 'Aktif Yap'}><Power className="w-3.5 h-3.5" /></button>
                                <button onClick={() => { setEditingFaq(faq); setFaqData({ question: faq.question, answer: faq.answer, isActive: faq.isActive }); setShowFaqForm(true); }} className="p-1.5 rounded-lg hover:bg-violet-500/10 text-text-muted hover:text-violet-400 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteFaq(faq._id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )
                  }
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* ══════════ TAB: SYSTEM ══════════ */}
          {activeTab === 'system' && (
            <motion.div key="system" variants={contentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-3xl">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Maintenance */}
                <SectionCard>
                  <div className="p-8 flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 border-4 transition-all duration-500 ${isMaintenance ? 'bg-danger/10 border-danger/30 text-danger animate-pulse' : 'bg-success/10 border-success/30 text-success'}`}>
                      <Power className="w-9 h-9" />
                    </div>
                    <h2 className="text-base font-black text-white mb-2">Bakım Modu</h2>
                    <p className="text-xs text-text-muted mb-2">Durum: <span className={`font-black uppercase ${isMaintenance ? 'text-danger' : 'text-success'}`}>{isMaintenance ? 'Aktif (Kullanıcılar erişemiyor)' : 'Kapalı (Normal)'}</span></p>
                    <p className="text-xs text-text-muted mb-8 leading-relaxed">Aktifken kullanıcılar uygulamaya giremez. Kritik güncellemeler için kullanın.</p>
                    <button
                      onClick={toggleMaintenance}
                      disabled={systemLoading}
                      className={`w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all border disabled:opacity-50 ${
                        isMaintenance
                          ? 'bg-success text-white border-success shadow-xl shadow-success/20'
                          : 'bg-danger/10 text-danger border-danger/30 hover:bg-danger hover:text-white'
                      }`}
                    >
                      {systemLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isMaintenance ? <><CheckCircle2 className="w-4 h-4" /> Modu Kapat</> : <><Power className="w-4 h-4" /> Bakım Modunu Aç</>}
                    </button>
                  </div>
                </SectionCard>

                {/* Backup */}
                <SectionCard>
                  <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-[28px] bg-indigo-500/10 border-4 border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-6">
                      <Database className="w-9 h-9" />
                    </div>
                    <h2 className="text-base font-black text-white mb-2">Veritabanı Yedeği</h2>
                    <p className="text-xs text-text-muted mb-8 leading-relaxed">Tüm kullanıcı, içerik ve sınav verilerini tek tıkla yedekleyin. Yedek sunucuya kaydedilir.</p>
                    <button
                      onClick={handleBackup}
                      disabled={systemLoading}
                      className="w-full py-3.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                      {systemLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4" /> Yedekleme Başlat</>}
                    </button>
                  </div>
                </SectionCard>
              </div>

              {/* Warning */}
              <div className="p-5 bg-warning/5 border border-warning/20 rounded-2xl flex gap-4">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-warning uppercase tracking-widest">Dikkat</h4>
                  <p className="text-xs text-warning/70 mt-1 leading-relaxed">Bu alandaki değişiklikler doğrudan prodüksiyon ortamını etkiler. Operasyonları yapmadan önce doğru ayarı seçtiğinizden emin olun.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════ TAB: LOGS ══════════ */}
          {activeTab === 'logs' && (
            <motion.div key="logs" variants={contentVariants} initial="initial" animate="animate" exit="exit">
              <SectionCard>
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <div className="flex items-center gap-3"><Activity className="w-4 h-4 text-text-muted" /><h2 className="text-sm font-black text-white uppercase tracking-widest">Son Yönetici Aktiviteleri</h2></div>
                  <button onClick={fetchLogs} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} /></button>
                </div>
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {loading
                    ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-text-muted animate-spin" /></div>
                    : logs.length === 0
                      ? <div className="p-16 text-center text-text-muted text-sm italic">İşlem kaydı bulunamadı.</div>
                      : logs.map(log => (
                        <div key={log._id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${log.method === 'DELETE' ? 'bg-danger/10 text-danger' : log.method === 'POST' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                            <Terminal className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white/90 truncate">{log.action || log.url}</p>
                            <p className="text-[10px] text-text-muted font-bold mt-0.5 uppercase">{log.adminName || log.adminId?.firstName || 'Bilinmeyen'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-text-muted font-black uppercase">{new Date(log.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</p>
                            <p className="text-[10px] text-text-muted/50 font-bold mt-0.5">{new Date(log.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))
                  }
                </div>
              </SectionCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminSettings;
