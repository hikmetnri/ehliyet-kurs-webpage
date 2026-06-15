import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Send, MessageCircle, Plus, ChevronLeft,
  Inbox, HeadphonesIcon, CheckCircle2, Clock,
  AlertCircle, Lock, Sparkles, ChevronRight, Search
} from 'lucide-react';

const MotionDiv = motion.div;

const STATUS_MAP = {
  new:     { label: 'Yeni',        color: 'text-primary-light bg-primary/10 border-primary/30',    icon: Sparkles },
  read:    { label: 'Okundu',      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', icon: CheckCircle2 },
  replied: { label: 'Cevaplandı', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: MessageCircle },
  closed:  { label: 'Kapatıldı',  color: 'text-text-muted bg-white/5 border-white/10',            icon: Lock },
};

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.new;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function UserSupport() {
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState('list'); // 'list' | 'detail' | 'new'
  const [selected, setSelected]   = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending]     = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const messagesEndRef = useRef(null);
  const desktopMessagesEndRef = useRef(null);

  useEffect(() => { fetchTickets(); }, []);
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    desktopMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected, selected?.messages]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contact/my');
      setTickets(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const res = await api.post('/contact', { subject: newSubject, message: newMessage });
      setTickets(prev => [res.data.data, ...prev]);
      setNewSubject(''); setNewMessage('');
      setView('list');
    } catch {
      alert('Talep gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setSending(true);
      const res = await api.post(`/contact/${selected._id}/user-reply`, { text: replyText });
      setSelected(res.data.data);
      setTickets(prev => prev.map(t => t._id === selected._id ? res.data.data : t));
      setReplyText('');
    } catch {
      alert('Yanıt gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  const goBack = () => { setView('list'); setSelected(null); };

  const pending = tickets.filter(t => t.status !== 'closed').length;
  const replied = tickets.filter(t => t.status === 'replied').length;
  const closed = tickets.filter(t => t.status === 'closed').length;
  const filteredTickets = tickets.filter((ticket) => {
    const query = ticketSearch.trim().toLocaleLowerCase('tr-TR');
    const statusMatches = statusFilter === 'all' || ticket.status === statusFilter;
    const lastMsg = ticket.messages?.[ticket.messages.length - 1];
    const searchable = `${ticket.subject || ''} ${ticket.message || ''} ${lastMsg?.text || ''}`.toLocaleLowerCase('tr-TR');
    return statusMatches && (!query || searchable.includes(query));
  });

  return (
    <div className="mx-auto max-w-7xl pb-24 px-4">

      {/* ── Desktop View (Dual Pane) ── */}
      <div className="hidden lg:grid grid-cols-12 gap-6 h-[calc(100vh-160px)] min-h-[600px] pb-6">
        
        {/* Left Side: Ticket List & Stats */}
        <div className="col-span-5 flex flex-col gap-4 min-h-0">
          
          {/* Header & New Ticket Button */}
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
                <HeadphonesIcon className="w-3.5 h-3.5 text-primary-light" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary-light">Destek Merkezi</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Destek Talepleri</h1>
              <p className="text-text-muted text-xs mt-1 font-semibold">Sorularınız ve mesaj geçmişiniz tek ekranda.</p>
            </div>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black text-white transition hover:bg-primary-light"
            >
              <Plus className="w-4 h-4" />
              Yeni Talep
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            {[
              { label: 'Toplam', value: tickets.length, color: 'text-primary-light', bg: 'bg-primary/10 border-primary/20' },
              { label: 'Bekleyen', value: pending, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
              { label: 'Cevaplanan', value: replied, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-center">
                <p className={`text-lg font-black ${stat.color} leading-none`}>{stat.value}</p>
                <p className="text-[9px] font-bold text-text-muted mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-3">
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
              <Search className="mr-3 h-5 w-5 text-primary-light" />
              <input
                value={ticketSearch}
                onChange={(event) => setTicketSearch(event.target.value)}
                placeholder="Konu veya mesaj ara..."
                className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-text-muted"
              />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {[
                ['all', 'Tümü', tickets.length],
                ['new', 'Yeni', tickets.filter(t => t.status === 'new').length],
                ['replied', 'Cevaplı', replied],
                ['closed', 'Kapalı', closed],
              ].map(([id, label, count]) => {
                const active = statusFilter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStatusFilter(id)}
                    className={`shrink-0 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                      active
                        ? 'border-primary/35 bg-primary/15 text-primary-light'
                        : 'border-white/10 bg-white/[0.03] text-text-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {label}
                    <span className="ml-2 opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tickets Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white/[0.025] border border-dashed border-white/10 rounded-3xl text-center px-4">
                <Inbox className="w-8 h-8 text-white/10 mb-3" />
                <p className="text-white font-bold text-sm">{tickets.length === 0 ? 'Henüz talep yok' : 'Filtreye uygun talep yok'}</p>
                <p className="text-text-muted text-xs mt-1">{tickets.length === 0 ? 'Yeni bir destek talebi oluşturabilirsiniz.' : 'Arama metnini veya durum filtresini değiştirin.'}</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selected?._id === ticket._id;
                const lastMsg = ticket.messages?.[ticket.messages.length - 1];
                return (
                  <button
                    key={ticket._id}
                    onClick={() => setSelected(ticket)}
                    className={`w-full text-left border rounded-2xl p-4.5 transition-all duration-300 group cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 border-primary-light'
                        : 'bg-white/[0.025] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="font-bold text-white text-sm truncate">{ticket.subject}</h3>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <p className="text-xs text-text-muted line-clamp-1 italic">
                          "{lastMsg?.text || ticket.message}"
                        </p>
                        <p className="text-[10px] text-text-muted mt-2.5 font-medium">{formatDate(ticket.updatedAt)}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-text-muted group-hover:text-white transition-all shrink-0 mt-1.5 ${
                        isSelected ? 'translate-x-1 text-white' : ''
                      }`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Pane */}
        <div className="col-span-7 bg-white/[0.025] border border-white/10 rounded-3xl flex flex-col min-h-0 relative overflow-hidden">
          {selected ? (
            <div className="flex flex-col h-full min-h-0">
              {/* Chat Header */}
              <div className="border-b border-white/10 bg-white/[0.025] px-6 py-5 shrink-0 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white truncate max-w-[280px]">{selected.subject}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selected.status} />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{formatDate(selected.createdAt)}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <HeadphonesIcon className="w-5 h-5 text-primary-light" />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-0">
                {(!selected.messages || selected.messages.length === 0) ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <AlertCircle className="w-10 h-10 text-white/15 mb-3" />
                    <p className="text-text-muted text-sm font-semibold">Henüz mesaj yok. Destek ekibinin yanıtı bekleniyor.</p>
                  </div>
                ) : (
                  selected.messages.map((m, i) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                      <div key={i} className={`flex gap-3 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                          isAdmin ? 'bg-primary/20 text-primary-light' : 'bg-white/10 text-white'
                        }`}>
                          {isAdmin ? <HeadphonesIcon className="w-4 h-4" /> : 'S'}
                        </div>
                        <div className={`flex max-w-[80%] flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                          <div className={`px-4.5 py-3 rounded-2xl text-sm leading-relaxed font-semibold ${
                            isAdmin
                              ? 'bg-white/[0.04] border border-white/5 text-white/90 rounded-tl-none'
                              : 'bg-primary border border-primary/20 text-white rounded-tr-none'
                          }`}>
                            {m.text}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 px-1">
                            <span className="text-[10px] text-text-muted font-bold">
                              {isAdmin ? '🎧 Destek Ekibi' : '👤 Siz'}
                            </span>
                            <span className="text-[9px] text-text-muted">·</span>
                            <span className="text-[10px] text-text-muted">{formatTime(m.sentAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={desktopMessagesEndRef} />
              </div>

              {/* Chat Reply Composer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.025] shrink-0">
                {selected.status === 'closed' ? (
                  <div className="flex items-center justify-center gap-2 py-3 bg-white/[0.01] rounded-2xl border border-white/5">
                    <Lock className="w-4 h-4 text-text-muted" />
                    <p className="text-text-muted text-xs font-bold uppercase tracking-wider">Bu talep kapatılmıştır.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReply} className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Yanıtınızı yazın..."
                      className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.035] px-4.5 py-3.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition placeholder:text-text-muted"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || sending}
                      className="px-6 py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition bg-primary hover:bg-primary-light"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-24 h-24 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
                <HeadphonesIcon className="w-10 h-10 text-primary-light" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Talep Seçilmedi</h3>
              <p className="text-text-secondary text-sm max-w-xs mt-2 font-medium">
                Mesaj geçmişini görmek ve yanıt yazmak için sol taraftaki listeden bir talep seçin ya da yeni bir tane oluşturun.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── New Ticket Modal (Desktop Only) ── */}
      <AnimatePresence>
        {showNewTicketModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#131522] shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <HeadphonesIcon className="w-5 h-5 text-primary-light" />
                    </div>
                    <div>
                      <h2 className="font-black text-white text-lg">Destek Talebi Oluştur</h2>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Destek ekibimiz en kısa sürede dönüş sağlayacak</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewTicketModal(false)}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-black text-text-muted hover:text-white transition-all cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  await handleCreate(e);
                  setShowNewTicketModal(false);
                }} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Konu Başlığı</label>
                    <input
                      required
                      type="text"
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      placeholder="Sorununuzu kısaca özetleyin..."
                      className="w-full bg-white/[0.035] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition placeholder:text-text-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Mesajınız</label>
                    <textarea
                      required
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      rows={4}
                      placeholder="Lütfen sorununuzu detaylı açıklayın. Hangi sayfada, ne zaman yaşandığını belirtmeniz süreci hızlandıracaktır."
                      className="w-full bg-white/[0.035] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition resize-none placeholder:text-text-muted"
                    />
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                    <p className="text-xs font-black text-primary-light mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> İPUÇLARI
                    </p>
                    <ul className="space-y-1 text-xs text-text-muted font-medium">
                      <li>• Hata mesajları varsa tam halini ekleyin</li>
                      <li>• Adım adım sorunun nasıl ortaya çıktığını anlatın</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={sending || !newSubject.trim() || !newMessage.trim()}
                    className="w-full h-14 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition bg-primary hover:bg-primary-light"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Talebi Gönder</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile View (Original Single Column layout) ── */}
      <div className="block lg:hidden max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {(view === 'detail' || view === 'new') && (
              <button onClick={goBack} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {view === 'list' ? 'Destek Merkezi' : view === 'new' ? 'Yeni Talep' : (selected?.subject || 'Talep Detayı')}
              </h1>
              <p className="text-text-muted text-sm mt-0.5">
                {view === 'list' ? 'Sorularınız için buradayız' : view === 'new' ? 'Talebinizi detaylı açıklayın' : 'Konuşma geçmişi'}
              </p>
            </div>
          </div>
          {view === 'list' && (
            <button
              onClick={() => setView('new')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 sm:w-auto"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              <Plus className="w-4 h-4" />
              Yeni Talep
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* ─── LIST VIEW ─── */}
          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Toplam', value: tickets.length, icon: MessageCircle, color: 'text-primary-light', bg: 'bg-primary/10' },
                  { label: 'Bekleyen', value: pending, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                  { label: 'Cevaplanan', value: replied, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-[#171927]/60 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xl font-black text-white leading-none">{stat.value}</p>
                        <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tickets */}
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-[#171927]/60 border border-white/5 rounded-3xl">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-5">
                    <Inbox className="w-10 h-10 text-white/20" />
                  </div>
                  <p className="text-white font-black text-lg mb-2">Henüz talep yok</p>
                  <p className="text-text-muted text-sm mb-6">Yeni bir destek talebi oluşturabilirsiniz.</p>
                  <button onClick={() => setView('new')} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-colors">
                    <Plus className="w-4 h-4" /> Talep Oluştur
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket, i) => {
                    const lastMsg = ticket.messages?.[ticket.messages.length - 1];
                    return (
                      <motion.button
                        key={ticket._id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => { setSelected(ticket); setView('detail'); }}
                        className="w-full text-left bg-[#171927]/60 border border-white/5 hover:border-white/15 rounded-2xl p-5 transition-all group hover:bg-[#202235]/80"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <HeadphonesIcon className="w-5 h-5 text-primary-light" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="font-bold text-white text-sm truncate">{ticket.subject}</h3>
                              <StatusBadge status={ticket.status} />
                            </div>
                            <p className="text-xs text-text-muted line-clamp-1 italic">
                              "{lastMsg?.text || ticket.message}"
                            </p>
                            <p className="text-[10px] text-text-muted mt-2 font-medium">{formatDate(ticket.updatedAt)}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-3" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── NEW TICKET ─── */}
          {view === 'new' && (
            <motion.div key="new" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="bg-[#171927]/60 border border-white/5 rounded-3xl overflow-hidden">
                {/* Top accent */}
                <div className="h-1" style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }} />
                <div className="p-5 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <HeadphonesIcon className="w-5 h-5 text-primary-light" />
                    </div>
                    <div>
                      <h2 className="font-black text-white">Destek Talebi Oluştur</h2>
                      <p className="text-xs text-text-muted">Ekibimiz en kısa sürede yanıt verecek</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Konu Başlığı</label>
                      <input
                        required type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)}
                        placeholder="Sorununuzu kısaca özetleyin..."
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Mesajınız</label>
                      <textarea
                        required value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={5}
                        placeholder="Lütfen sorununuzu detaylı açıklayın. Ne zaman ve nasıl yaşandığını belirtirseniz daha hızlı yardım edebiliriz."
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>

                    {/* Tips */}
                    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
                      <p className="text-xs font-bold text-primary-light mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> İpuçları</p>
                      <ul className="space-y-1 text-xs text-text-muted">
                        <li>• Hata mesajlarını ve ekran görüntüsünü belirtin</li>
                        <li>• Hangi cihaz ve tarayıcı kullandığınızı yazın</li>
                        <li>• Adım adım ne yaptığınızı açıklayın</li>
                      </ul>
                    </div>

                    <button
                      type="submit" disabled={sending || !newSubject || !newMessage}
                      className="w-full h-14 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Talebi Gönder</>}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── DETAIL / CHAT ─── */}
          {view === 'detail' && selected && (
            <motion.div key="detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="bg-[#171927]/60 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                {/* Chat Header */}
                <div className="border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="mb-1.5 truncate font-black text-white">{selected.subject}</h2>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <StatusBadge status={selected.status} />
                        <span className="text-xs text-text-muted">{formatDate(selected.createdAt)}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <HeadphonesIcon className="w-5 h-5 text-primary-light" />
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="max-h-[60vh] flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar sm:max-h-[460px] sm:p-6">
                  {(!selected.messages || selected.messages.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="w-10 h-10 text-white/10 mb-3" />
                      <p className="text-text-muted text-sm">Henüz mesaj yok. Yanıt bekliyorsunuz.</p>
                    </div>
                  ) : (
                    selected.messages.map((m, i) => {
                      const isAdmin = m.sender === 'admin';
                      return (
                        <div key={i} className={`flex gap-3 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                          <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold ${
                            isAdmin ? 'bg-primary/20 text-primary-light' : 'bg-white/10 text-white'
                          }`}>
                            {isAdmin ? <HeadphonesIcon className="w-4 h-4" /> : 'S'}
                          </div>
                          <div className={`flex max-w-[84%] flex-col sm:max-w-[78%] ${isAdmin ? 'items-start' : 'items-end'}`}>
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                              isAdmin
                                ? 'bg-[#202235] border border-white/5 text-white/90 rounded-tl-sm'
                                : 'text-white rounded-tr-sm'
                            }`}
                            style={!isAdmin ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' } : {}}>
                              {m.text}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 px-1">
                              <span className="text-[10px] text-text-muted font-medium">
                                {isAdmin ? '🎧 Destek Ekibi' : '👤 Siz'}
                              </span>
                              <span className="text-[10px] text-text-muted">·</span>
                              <span className="text-[10px] text-text-muted">{formatTime(m.sentAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-white/5 bg-black/10">
                  {selected.status === 'closed' ? (
                    <div className="flex items-center justify-center gap-2 py-3">
                      <Lock className="w-4 h-4 text-text-muted" />
                      <p className="text-text-muted text-sm">Bu talep kapatılmıştır.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReply} className="flex gap-2">
                      <input
                        type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                        placeholder="Yanıtınızı yazın..."
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-bg-card px-4 py-3 text-sm text-white transition-colors focus:border-primary/50 focus:outline-none"
                      />
                      <button
                        type="submit" disabled={!replyText.trim() || sending}
                        className="px-5 py-3 rounded-2xl font-bold text-white flex items-center gap-2 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
