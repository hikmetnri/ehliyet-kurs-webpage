import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, MessageSquare, User, Send,
  CheckCircle2, Clock, XCircle, AlertCircle,
  Inbox, Trash2, Mail, RefreshCw, RotateCcw,
  MessageCircle, ChevronRight
} from 'lucide-react';

const statusConfig = {
  new:     { label: 'YENİ',       color: 'bg-primary/10 text-primary-light border-primary/20',       dot: 'bg-primary-light animate-pulse' },
  read:    { label: 'OKUNDU',     color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',    dot: 'bg-indigo-400' },
  replied: { label: 'YANITLANDI', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  closed:  { label: 'KAPATILDI', color: 'bg-white/5 text-text-muted border-white/10',               dot: 'bg-white/30' },
};

const FILTERS = [
  { id: 'all',     label: 'Tümü' },
  { id: 'new',     label: 'Yeni' },
  { id: 'replied', label: 'Yanıtlı' },
  { id: 'closed',  label: 'Geçmiş' },
];

const AdminSupport = () => {
  const [tickets, setTickets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedTicket, setSelected]   = useState(null);
  const [replyText, setReplyText]       = useState('');
  const [sending, setSending]           = useState(false);
  const [actionLoading, setActionLoad]  = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const chatEndRef = useRef(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/contact');
      if (res.data.success) setTickets(res.data.data);
    } catch (err) {
      console.error('Destek talepleri alınamadı:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const handleSelectTicket = async (ticket) => {
    setSelected(ticket);
    setReplyText('');
    if (ticket.status === 'new') {
      try {
        await api.put(`/contact/${ticket._id}`, { status: 'read' });
        setTickets(prev => prev.map(t => t._id === ticket._id ? { ...t, status: 'read' } : t));
      } catch (err) {
        console.error('Ticket durumu güncellenemedi:', err);
      }
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket || sending) return;
    try {
      setSending(true);
      const res = await api.post(`/contact/${selectedTicket._id}/reply`, { text: replyText });
      if (res.data.success) {
        setSelected(res.data.data);
        setTickets(prev => prev.map(t => t._id === selectedTicket._id ? res.data.data : t));
        setReplyText('');
      }
    } catch {
      alert('Yanıt gönderilirken hata oluştu.');
    } finally {
      setSending(false);
    }
  };

  const handleSetStatus = async (ticketId, status) => {
    const confirmMsg = status === 'closed'
      ? 'Bu talebi kapatmak istediğinize emin misiniz?'
      : 'Bu talebi yeniden açmak istiyor musunuz?';
    if (!window.confirm(confirmMsg)) return;
    try {
      setActionLoad(true);
      const res = await api.put(`/contact/${ticketId}`, { status });
      if (res.data.success) {
        setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status } : t));
        if (selectedTicket?._id === ticketId) setSelected(prev => ({ ...prev, status }));
      }
    } catch {
      alert('Talep durumu güncellenemedi.');
    } finally {
      setActionLoad(false);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Bu talebi kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      setActionLoad(true);
      await api.delete(`/contact/${ticketId}`);
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      if (selectedTicket?._id === ticketId) setSelected(null);
    } catch {
      alert('Talep silinemedi.');
    } finally {
      setActionLoad(false);
    }
  };

  const filtered = tickets.filter(t => {
    const term = searchTerm.toLowerCase();
    const match =
      (t.subject || '').toLowerCase().includes(term) ||
      (t.userId?.email || '').toLowerCase().includes(term) ||
      (t.userId?.firstName || '').toLowerCase().includes(term);
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    return match && statusMatch;
  });

  const counts = {
    all:     tickets.length,
    new:     tickets.filter(t => t.status === 'new').length,
    replied: tickets.filter(t => t.status === 'replied').length,
    closed:  tickets.filter(t => t.status === 'closed').length,
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pb-8">

      {/* Page Header */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-primary-light uppercase tracking-widest">Operasyonel İşlemler</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">Destek & Bilet Merkezi</h1>
            <p className="mt-1 text-sm text-text-muted max-w-2xl">
              Öğrencilerden gelen sorunları sıraya alın ve anında çözün.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                <p className="text-lg font-black text-white">{counts.new}</p>
                <p className="text-[9px] font-bold text-primary-light uppercase tracking-widest">Yeni</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
                <p className="text-lg font-black text-white">{counts.all}</p>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Toplam</p>
              </div>
            </div>
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] text-text-muted hover:text-white hover:bg-white/[0.05] transition-all"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row flex-1 gap-5 sm:gap-6 md:min-h-[calc(100vh-300px)]">

        {/* Left: Ticket List */}
        <div className="md:w-[380px] w-full flex flex-col gap-3 shrink-0">

          {/* Search + Filter */}
          <div className="bg-white/[0.02] p-3 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center gap-3 bg-black/20 rounded-2xl px-4 py-3 border border-white/10 focus-within:border-primary/40 transition-all">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Öğrenci / Talep Ara..."
                className="bg-transparent outline-none text-sm w-full text-white placeholder:text-white/25 font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-1 p-1 bg-black/20 rounded-2xl border border-white/10">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    statusFilter === f.id
                      ? 'bg-primary/20 text-primary-light'
                      : 'text-text-muted hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {f.label}
                  {f.id !== 'all' && counts[f.id] > 0 && (
                    <span className="ml-1 text-[8px]">({counts[f.id]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar max-h-[60vh] md:max-h-none pr-0.5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-white/10 bg-white/[0.015]">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <span className="text-xs font-bold text-primary-light uppercase tracking-widest">Yükleniyor...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                <Inbox className="w-12 h-12 text-white/10 mb-3" />
                <span className="text-sm font-bold text-text-muted">Talep bulunamadı</span>
              </div>
            ) : (
              filtered.map(ticket => {
                const cfg = statusConfig[ticket.status] || statusConfig.read;
                const isSelected = selectedTicket?._id === ticket._id;
                const lastMsg = ticket.messages?.[ticket.messages.length - 1];
                const initials = ((ticket.userId?.firstName?.[0] || '') + (ticket.userId?.lastName?.[0] || '')).toUpperCase() || '?';

                return (
                  <motion.button
                    key={ticket._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all relative group ${
                      isSelected
                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                        : 'bg-white/[0.015] border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    {isSelected && <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-primary" />}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-black text-primary-light">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          <span className="text-[9px] text-text-muted/60 shrink-0">
                            {new Date(ticket.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className={`text-sm font-bold leading-snug truncate ${isSelected ? 'text-white' : 'text-white/90'}`}>
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 truncate">
                          {ticket.userId?.firstName} {ticket.userId?.lastName}
                        </p>
                        {lastMsg && (
                          <p className="text-[10px] text-text-muted/70 mt-1.5 line-clamp-1 italic">
                            "{lastMsg.text}"
                          </p>
                        )}
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-text-muted shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90 text-primary-light' : ''}`} />
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Chat Area */}
        <div className="flex-1 min-h-[480px] md:min-h-0 bg-white/[0.02] rounded-3xl border border-white/10 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-white/10 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary-light" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-white leading-tight truncate">{selectedTicket.subject}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                      <span className="text-text-muted flex items-center gap-1">
                        <User className="w-3 h-3 opacity-50" />
                        {selectedTicket.userId?.firstName} {selectedTicket.userId?.lastName}
                      </span>
                      <span className="text-[9px] font-bold text-primary-light bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        #{selectedTicket._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${(statusConfig[selectedTicket.status] || statusConfig.read).color}`}>
                        {(statusConfig[selectedTicket.status] || statusConfig.read).label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedTicket.status === 'closed' ? (
                    <button
                      onClick={() => handleSetStatus(selectedTicket._id, 'read')}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Yeniden Aç
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSetStatus(selectedTicket._id, 'closed')}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Kapat
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedTicket._id)}
                    disabled={actionLoading}
                    className="p-2 bg-white/[0.02] border border-white/10 text-text-muted rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all disabled:opacity-50"
                    title="Talebi sil"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-black/10">
                {selectedTicket.messages.map((m, idx) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isAdmin && (
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mr-2 mt-1 shrink-0 text-[10px] font-black text-white/50">
                          {(selectedTicket.userId?.firstName?.[0] || '?').toUpperCase()}
                        </div>
                      )}
                      <div className={`max-w-[75%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 text-sm leading-relaxed font-medium rounded-2xl ${
                          isAdmin
                            ? 'bg-primary text-white rounded-tr-sm'
                            : 'bg-white/[0.04] border border-white/10 text-white/90 rounded-tl-sm'
                        }`}>
                          {m.text}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[9px] text-text-muted/60 font-medium">
                            {isAdmin ? 'Yönetici' : (selectedTicket.userId?.firstName || 'Kullanıcı')}
                          </span>
                          <span className="text-text-muted/40">·</span>
                          <span className="text-[9px] text-text-muted/50">
                            {new Date(m.sentAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center ml-2 mt-1 shrink-0">
                          <User className="w-3.5 h-3.5 text-primary-light" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-black/20">
                {selectedTicket.status === 'closed' ? (
                  <div className="flex items-center justify-center gap-3 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/15">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-sm font-bold text-rose-400">Bu bilet kapatıldı.</span>
                    <button
                      onClick={() => handleSetStatus(selectedTicket._id, 'read')}
                      className="ml-auto text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                    >
                      Yeniden aç
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Yanıtınızı buraya yazın..."
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-all"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || sending}
                      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                        !replyText.trim() || sending
                          ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                          : 'bg-primary text-white hover:bg-primary-light border border-primary/50'
                      }`}
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span className="hidden sm:inline">Gönder</span>
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-5">
                <MessageCircle className="w-7 h-7 text-white/15" />
              </div>
              <h3 className="text-base font-bold text-white">Talep Seçilmedi</h3>
              <p className="text-text-secondary text-sm max-w-xs mt-2 leading-relaxed">
                Sol taraftaki listeden bir destek talebi seçerek yanıtlamaya başlayın.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminSupport;
