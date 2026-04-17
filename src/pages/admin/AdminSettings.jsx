import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Settings, Bell, Quote, ShieldAlert,
  Database, RefreshCw, Send, History, Trash2,
  AlertTriangle, CheckCircle2, Terminal, Info,
  Plus, Edit, Save, X, Power
} from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications'); // notifications, quotes, system, logs
  const [loading, setLoading] = useState(false);
  
  // Notification State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  
  // Quotes State
  const [quotes, setQuotes] = useState([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [quoteData, setQuoteData] = useState({ text: '', author: '' });

  // System State
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (activeTab === 'notifications') fetchBroadcastHistory();
    if (activeTab === 'quotes') fetchQuotes();
    if (activeTab === 'system') fetchMaintenanceStatus();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  // Notifications Logic
  const fetchBroadcastHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/broadcast-history');
      setBroadcastHistory(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;
    if (!window.confirm("Bu bildirimi TÜM kullanıcılara anlık olarak göndermek istediğinize emin misiniz?")) return;

    try {
      setLoading(true);
      await api.post('/notifications/broadcast', { title: notifTitle, body: notifBody });
      alert("Bildirim başarıyla kuyruğa alındı!");
      setNotifTitle(''); setNotifBody('');
      fetchBroadcastHistory();
    } catch (err) { alert("Gönderim hatası: " + err.message); } finally { setLoading(false); }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm("Bu geçmiş kaydını silmek istiyor musunuz?")) return;
    try {
      await api.delete(`/notifications/broadcast-history/${id}`);
      setBroadcastHistory(prev => prev.filter(b => b._id !== id));
    } catch (err) { alert("Silinemedi."); }
  };

  // Quotes Logic
  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quotes');
      setQuotes(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingQuote) {
        await api.put(`/quotes/${editingQuote._id}`, quoteData);
      } else {
        await api.post('/quotes', quoteData);
      }
      setShowQuoteForm(false); setEditingQuote(null); setQuoteData({ text: '', author: '' });
      fetchQuotes();
    } catch (err) { alert("Hata!"); } finally { setLoading(false); }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm("Bu sözü silmek istiyor musunuz?")) return;
    try {
      await api.delete(`/quotes/${id}`);
      setQuotes(prev => prev.filter(q => q._id !== id));
    } catch (err) { alert("Silinemedi."); }
  };

  // System Logic
  const fetchMaintenanceStatus = async () => {
    try {
      const res = await api.get('/admin/maintenance-status');
      setIsMaintenance(res.data.isMaintenance);
    } catch (err) { console.error(err); }
  };

  const toggleMaintenance = async () => {
    const msg = isMaintenance ? "Bakım modundan çıkılsın mı?" : "UYARI: Bakım moduna geçilsin mi? (Kullanıcılar uygulamaya giremez)";
    if (!window.confirm(msg)) return;
    try {
      const res = await api.post('/admin/maintenance');
      setIsMaintenance(res.data.isMaintenance);
      alert(res.data.msg);
    } catch (err) { alert("Hata!"); }
  };

  const handleBackup = async () => {
    try {
      alert("Yedekleme başlatıldı. Sunucu terminalini kontrol edin.");
      await api.get('/admin/backup');
    } catch (err) { alert("Yedekleme hatası!"); }
  };

  const fetchLogs = async () => {
      try {
          setLoading(true);
          const res = await api.get('/admin/logs');
          setLogs(res.data.data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Yönetim Merkezi</h1>
          <p className="text-text-secondary text-sm mt-1">Sistem ayarları, global bildirimler ve uygulama konfigürasyonlarını yönetin.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-bg-card/30 p-1 rounded-2xl border border-white/5 self-start">
        {[
          { id: 'notifications', label: 'Bildirim Merkezi', icon: Bell },
          { id: 'quotes', label: 'Günün Sözleri', icon: Quote },
          { id: 'system', label: 'Sistem Ayarları', icon: Database },
          { id: 'logs', label: 'İşlem Kayıtları', icon: Terminal }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* TAB: NOTIFICATIONS */}
        <AnimatePresence mode="wait">
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Send Form */}
                 <div className="glass-card p-6 lg:p-8 rounded-3xl border border-white/5 bg-bg-card/50 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <Send className="w-6 h-6 text-primary-light" />
                       </div>
                       <div>
                          <h2 className="text-lg font-black text-white">Toplu Bildirim Gönder</h2>
                          <p className="text-xs text-text-muted mt-1">Sisteme kayıtlı tüm cihazlara anlık mesaj gönderin.</p>
                       </div>
                    </div>
                    
                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-text-muted tracking-widest px-2">Bildirim Başlığı</label>
                            <input 
                                type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                                placeholder="Örn: Hafta Sonu Sınav Hazırlığı 🚀"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-text-muted tracking-widest px-2">Bildirim İçeriği</label>
                            <textarea 
                                value={notifBody} onChange={e => setNotifBody(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all h-32 resize-none"
                                placeholder="Mesaj detayını buraya yazın..."
                            />
                        </div>
                        <button 
                            disabled={loading || !notifTitle || !notifBody}
                            className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Şimdi Tümüne Gönder</>}
                        </button>
                    </form>
                 </div>

                 {/* History List */}
                 <div className="glass-card p-6 lg:p-8 rounded-3xl border border-white/5 bg-bg-card/50 shadow-2xl flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <History className="w-5 h-5 text-text-muted" />
                            <h2 className="text-base font-black text-white">Gönderim Geçmişi</h2>
                        </div>
                        <button onClick={fetchBroadcastHistory} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><RefreshCw className="w-4 h-4 text-text-muted" /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {broadcastHistory.map(item => (
                            <div key={item._id} className="p-4 rounded-2xl bg-black/20 border border-white/5 group relative">
                                <button 
                                    onClick={() => handleDeleteHistory(item._id)}
                                    className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 bg-danger/10 text-danger rounded-lg transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-white text-xs">{item.title}</h4>
                                    <span className="text-[9px] text-text-muted font-bold uppercase">{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <p className="text-[11px] text-text-secondary line-clamp-2 italic">"{item.messageBody || item.body}"</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="text-[9px] font-black text-primary-light uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Başarıyla Gönderildi</div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* TAB: QUOTES */}
          {activeTab === 'quotes' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-white">Motivasyonel Sözler</h2>
                    <button 
                        onClick={() => { setShowQuoteForm(true); setEditingQuote(null); setQuoteData({ text: '', author: '' }); }}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 border-dashed"
                    >
                        <Plus className="w-4 h-4" /> Yeni Söz Ekle
                    </button>
                </div>

                {showQuoteForm && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="glass-card p-6 rounded-3xl border border-primary/20 bg-primary/5 overflow-hidden">
                        <form onSubmit={handleQuoteSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Söz / İçerik</label>
                                    <input type="text" required value={quoteData.text} onChange={e => setQuoteData({...quoteData, text: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Yazar / Kaynak</label>
                                    <input type="text" required value={quoteData.author} onChange={e => setQuoteData({...quoteData, author: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest"><Save className="w-4 h-4" /> Kaydet</button>
                                <button type="button" onClick={() => setShowQuoteForm(false)} className="px-6 py-3 bg-white/5 text-white rounded-xl text-xs font-black uppercase tracking-widest"><X className="w-4 h-4" /></button>
                            </div>
                        </form>
                     </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quotes.map(q => (
                        <div key={q._id} className="glass-card p-6 rounded-3xl border border-white/5 bg-bg-card/50 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setEditingQuote(q); setQuoteData({ text: q.text, author: q.author }); setShowQuoteForm(true); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-white"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteQuote(q._id)} className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <Quote className="w-8 h-8 text-primary/20 mb-4" />
                            <p className="text-sm font-medium text-white italic leading-relaxed mb-4">"{q.text}"</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{q.author}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
          )}

          {/* TAB: SYSTEM */}
          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Maintenance Card */}
                    <div className="glass-card p-8 rounded-3xl border border-white/5 bg-bg-card/50 flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mb-6 border-4 transition-all duration-500 ${isMaintenance ? 'bg-danger/10 border-danger/20 text-danger animate-pulse' : 'bg-success/10 border-success/20 text-success'}`}>
                            <Power className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-black text-white">Bakım Modu</h2>
                        <p className="text-sm text-text-muted mt-2 mb-8 px-4 font-medium leading-relaxed">
                            Aktif edildiğinde, uygulama "Bakım Aşamasında" sinyali verir ve öğrenciler hizmete erişemez. Kritik güncellemeler için kullanın.
                        </p>
                        <button 
                            onClick={toggleMaintenance}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all border ${
                                isMaintenance 
                                ? 'bg-success text-white border-success shadow-xl shadow-success/20' 
                                : 'bg-danger/10 text-danger border-danger/20 hover:bg-danger hover:text-white'
                            }`}
                        >
                            {isMaintenance ? <><CheckCircle2 className="w-4 h-4" /> Bakım Modunu Kapat</> : <><Power className="w-4 h-4" /> Bakım Modunu Uygula</>}
                        </button>
                    </div>

                    {/* Database Backup Card */}
                    <div className="glass-card p-8 rounded-3xl border border-white/5 bg-bg-card/50 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-[32px] bg-indigo-500/10 border-4 border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                            <Database className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-black text-white">Sistem Yedekleme</h2>
                        <p className="text-sm text-text-muted mt-2 mb-8 px-4 font-medium leading-relaxed">
                            Tüm kullanıcı veritabanını, içerikleri ve sınav ayarlarını tek tıkla yedekleyin. Yedek dosyası sunucuda güvenli alana kaydedilir.
                        </p>
                        <button 
                            onClick={handleBackup}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all"
                        >
                            <RefreshCw className="w-4 h-4" /> Yedekleme Başlat
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-warning/10 border border-warning/20 rounded-2xl flex gap-4">
                    <AlertTriangle className="w-6 h-6 text-warning shrink-0" />
                    <div>
                        <h4 className="text-sm font-black text-warning uppercase">Dikkat Edilmesi Gerekenler</h4>
                        <p className="text-xs text-warning/80 mt-1 leading-relaxed font-medium">Bu alandaki değişiklikler doğrudan prodüksiyon veritabanını ve kullanıcı deneyimini etkiler. Operasyonel müdahaleleri yapmadan önce doğru ayarı seçtiğinizden emin olun.</p>
                    </div>
                </div>
            </motion.div>
          )}

          {/* TAB: LOGS */}
          {activeTab === 'logs' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card rounded-3xl border border-white/5 bg-bg-card/50 overflow-hidden shadow-2xl">
                 <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Son Yönetici Aktiviteleri</h2>
                    <button onClick={fetchLogs} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} /></button>
                 </div>
                 <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {logs.length === 0 ? (
                        <div className="p-10 text-center text-text-muted italic">İşlem kaydı bulunmuyor.</div>
                    ) : logs.map(log => (
                        <div key={log._id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.method === 'DELETE' ? 'bg-danger/10 text-danger' : log.method === 'POST' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                               <Terminal className="w-4 h-4" />
                           </div>
                           <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black text-white/50 bg-black/40 px-1.5 py-0.5 rounded uppercase tracking-tighter">{log.method}</span>
                                   <p className="text-sm font-bold text-white/90 truncate">{log.action || log.url}</p>
                               </div>
                               <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-text-muted font-bold uppercase">{log.adminId?.firstName || 'Bilinmeyen'}: {log.adminId?.email || '-'}</span>
                               </div>
                           </div>
                           <div className="text-right shrink-0">
                               <p className="text-[10px] text-text-muted font-black uppercase">{new Date(log.createdAt).toLocaleDateString('tr-TR')}</p>
                               <p className="text-[10px] text-text-muted font-bold mt-1 opacity-50">{new Date(log.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                        </div>
                    ))}
                 </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

    </div>
  );
};

export default AdminSettings;
