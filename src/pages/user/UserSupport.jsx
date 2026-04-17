import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, MessageCircle, Clock, CheckCircle2, XCircle, Plus, ChevronLeft, X, Inbox } from 'lucide-react';

const UserSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // New ticket form
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contact/my');
      setTickets(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const res = await api.post('/contact', { subject: newSubject, message: newMessage });
      setTickets(prev => [res.data.data, ...prev]);
      setNewSubject(''); setNewMessage('');
      setView('list');
    } catch (err) {
      alert("Talep gönderilemedi.");
    } finally {
      setSending(false);
    }
  };

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setView('detail');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setSending(true);
      const res = await api.post(`/contact/${selectedTicket._id}/user-reply`, { text: replyText });
      setSelectedTicket(res.data.data);
      setTickets(prev => prev.map(t => t._id === selectedTicket._id ? res.data.data : t));
      setReplyText('');
    } catch (err) {
      alert("Yanıt gönderilemedi.");
    } finally {
      setSending(false);
    }
  };

  const getStatusStyle = (status) => ({
    new: { label: 'Yeni', color: 'bg-primary/10 text-primary-light border-primary/20' },
    read: { label: 'Okundu', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    replied: { label: 'Cevaplandı', color: 'bg-success/10 text-success border-success/20' },
    closed: { label: 'Kapatıldı', color: 'bg-white/5 text-text-muted border-white/10' },
  }[status] || { label: status, color: 'bg-white/5 text-text-muted' });

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Destek Talepleri</h1>
          <p className="text-text-secondary text-sm mt-1">Sorunlarınızı ve sorularınızı bize iletin.</p>
        </div>
        {view === 'list' && (
          <button
            onClick={() => setView('new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Yeni Talep
          </button>
        )}
        {(view === 'detail' || view === 'new') && (
          <button onClick={() => { setView('list'); setSelectedTicket(null); }} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Geri
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* LIST VIEW */}
        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Inbox className="w-16 h-16 text-white/10 mb-4" />
                <h3 className="text-lg font-black text-white/60">Henüz bir talebiniz yok</h3>
                <p className="text-text-muted text-sm mt-2 font-medium">Yeni Talep butonuyla ekibimize ulaşabilirsiniz.</p>
              </div>
            ) : (
              tickets.map((ticket, i) => {
                const statusStyle = getStatusStyle(ticket.status);
                const lastMsg = ticket.messages?.[ticket.messages.length - 1];
                return (
                  <motion.button
                    key={ticket._id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => handleOpenTicket(ticket)}
                    className="w-full text-left glass-card p-5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all flex items-start gap-5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-black text-sm text-white truncate">{ticket.subject}</h3>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shrink-0 ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted italic line-clamp-1">"{lastMsg?.text || ticket.message}"</p>
                      <p className="text-[10px] text-text-muted mt-2 font-bold">
                        {new Date(ticket.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-text-muted rotate-180 group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                  </motion.button>
                );
              })
            )}
          </motion.div>
        )}

        {/* NEW TICKET FORM */}
        {view === 'new' && (
          <motion.div key="new" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl">
              <h2 className="text-lg font-black text-white mb-6">Yeni Destek Talebi Oluştur</h2>
              <form onSubmit={handleCreateTicket} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-widest">Konu Başlığı</label>
                  <input 
                    required type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)}
                    placeholder="Sorununuzu özetleyin..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-widest">Mesajınız</label>
                  <textarea 
                    required value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    placeholder="Sorununuzu veya talebinizi detaylı olarak açıklayın..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all h-40 resize-none"
                  />
                </div>
                <button 
                  type="submit" disabled={sending || !newSubject || !newMessage}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Talebi Gönder</>}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* DETAIL / CHAT VIEW */}
        {view === 'detail' && selectedTicket && (
          <motion.div key="detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex flex-col">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <h2 className="font-black text-white">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(selectedTicket.status).color}`}>
                    {getStatusStyle(selectedTicket.status).label}
                  </span>
                  <span className="text-[10px] text-text-muted font-bold">
                    {new Date(selectedTicket.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {selectedTicket.messages?.map((m, idx) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div key={idx} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          isAdmin 
                          ? 'bg-bg-card2 border border-white/10 text-white/90 rounded-tl-none' 
                          : 'bg-primary text-white rounded-tr-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[10px] text-text-muted font-bold mt-1.5 uppercase tracking-widest">
                          {isAdmin ? 'Destek Ekibi' : 'Siz'} · {new Date(m.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply */}
              <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                {selectedTicket.status === 'closed' ? (
                  <p className="text-center text-text-muted text-sm italic py-2">Bu talep kapatılmıştır.</p>
                ) : (
                  <form onSubmit={handleSendReply} className="flex gap-3">
                    <input 
                      type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                      placeholder="Yanıtınızı yazın..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <button type="submit" disabled={!replyText.trim() || sending}
                      className="px-6 py-3 bg-primary text-white rounded-xl font-black flex items-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
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
  );
};

export default UserSupport;
