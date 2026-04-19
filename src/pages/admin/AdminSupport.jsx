import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Search, MessageSquare, User, Filter, 
  Send, ChevronRight, CheckCircle2, Clock, XCircle,
  AlertCircle, History, Inbox, MoreVertical, Trash2, Mail
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const chatEndRef = useRef(null);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contact');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error('Destek talepleri alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
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
        setSelectedTicket(res.data.data);
        setTickets(prev => prev.map(t => t._id === selectedTicket._id ? res.data.data : t));
        setReplyText('');
      }
    } catch (err) {
      alert("Yanıt gönderilirken hata oluştu.");
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async (ticketId) => {
      if (!window.confirm("Bu talebi kapatmak istediğinize emin misiniz?")) return;
      try {
          const res = await api.put(`/contact/${ticketId}`, { status: 'closed' });
          if (res.data.success) {
              setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status: 'closed' } : t));
              if (selectedTicket?._id === ticketId) {
                  setSelectedTicket(prev => ({ ...prev, status: 'closed' }));
              }
          }
      } catch (err) {
          alert("Talep kapatılamadı.");
      }
  };

  const filteredTickets = tickets.filter(t => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = t.subject.toLowerCase().includes(term) || 
                          (t.userId?.email || '').toLowerCase().includes(term) ||
                          (t.userId?.firstName || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return { label: 'YENİ TALEP', color: 'bg-primary/20 text-primary-light border-primary/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]', dot: 'bg-primary-light' };
      case 'read': return { label: 'OKUNDU', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', dot: 'bg-indigo-400' };
      case 'replied': return { label: 'YANITLANDI', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]', dot: 'bg-emerald-400' };
      case 'closed': return { label: 'KAPATILDI', color: 'bg-white/5 text-text-muted border-white/10 opacity-70', dot: 'bg-white/30' };
      default: return { label: status, color: 'bg-white/5 text-text-muted border-white/10', dot: 'bg-white/50' };
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-6">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Destek & Bilet Merkezi</h1>
          <p className="text-text-secondary text-sm mt-1">Öğrencilerden gelen sorunları sıraya alın ve anında çözün.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 min-h-0">
        
        {/* Left Side: Ticket List */}
        <div className="md:w-96 w-full flex flex-col gap-4 shrink-0">
          
          {/* Search & Filter */}
          <div className="glass-card p-2 rounded-[24px] border border-white/5 flex flex-col gap-2">
            <div className="flex items-center bg-black/40 rounded-[18px] px-4 py-3 w-full border border-white/5 transition-all focus-within:border-primary/50 focus-within:bg-black/60">
              <Search className="w-5 h-5 text-primary-light mr-3" />
              <input 
                type="text" 
                placeholder="Öğrenci / Talep Ara..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-text-muted font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-1.5 p-1 bg-black/40 rounded-[20px] border border-white/5">
              {['all', 'new', 'replied', 'closed'].map(f => (
                <button 
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex-1 px-3 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all border ${
                    statusFilter === f 
                        ? 'bg-primary text-white border-primary/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                        : 'bg-transparent border-transparent text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f === 'all' ? 'Tümü' : f === 'new' ? 'Açık' : f === 'replied' ? 'Yanıtlı' : 'Geçmiş'}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-bg-card border border-white/5 rounded-[24px]">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <span className="text-[10px] font-black text-primary-light uppercase tracking-widest animate-pulse">Merkez Taranıyor...</span>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-bg-card border border-white/5 rounded-[24px]">
                     <Inbox className="w-16 h-16 text-white/5 mb-4" />
                    <span className="text-sm font-bold text-text-muted">Arama sonucunda talep bulunamadı.</span>
                </div>
            ) : (
                filteredTickets.map((ticket) => {
                    const statusInfo = getStatusBadge(ticket.status);
                    const lastMsg = ticket.messages[ticket.messages.length - 1];
                    const isSelected = selectedTicket?._id === ticket._id;
                    
                    return (
                        <motion.button
                            key={ticket._id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            onClick={() => handleSelectTicket(ticket)}
                            className={`w-full text-left p-5 rounded-[24px] border transition-all duration-300 relative group overflow-hidden ${
                                isSelected 
                                ? 'bg-primary/[0.03] border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
                                : 'bg-bg-card border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                            }`}
                        >
                            {isSelected && <div className="absolute left-0 top-[20%] bottom-[20%] w-1.5 rounded-r-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>}
                            
                            <div className="flex justify-between items-start mb-3">
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusInfo.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span> {statusInfo.label}
                                </span>
                                <span className="text-[10px] text-text-muted font-bold flex items-center gap-1 opacity-70">
                                    <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                            
                            <h3 className={`font-black text-[15px] line-clamp-1 mb-2 tracking-tight ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                {ticket.subject}
                            </h3>
                            
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-white/50" />
                                </div>
                                <span className="text-xs text-text-muted font-semibold truncate">
                                    {ticket.userId?.firstName || 'Bilinmeyen'}
                                </span>
                            </div>
                            
                            <div className="text-xs text-text-muted line-clamp-2 italic bg-black/30 px-3 py-2.5 rounded-xl border border-white/5">
                                "{lastMsg?.text || ticket.message}"
                            </div>
                        </motion.button>
                    );
                })
            )}
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <div className="flex-1 glass-card rounded-[32px] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
          {selectedTicket ? (
            <>
              {/* Active Chat Header */}
              <div className="px-8 py-5 border-b border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[20px] bg-primary/10 border border-primary/20 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <MessageSquare className="w-6 h-6 text-primary-light relative z-10" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white leading-none tracking-tight">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-text-muted font-semibold flex items-center gap-1.5"><User className="w-3.5 h-3.5 opacity-50" /> {selectedTicket.userId?.firstName} {selectedTicket.userId?.lastName}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                        <span className="text-[10px] font-black text-primary-light/70 uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                            #{selectedTicket._id.substring(selectedTicket._id.length - 6)}
                        </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {selectedTicket.status !== 'closed' && (
                        <button 
                            onClick={() => handleCloseTicket(selectedTicket._id)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-wider"
                        >
                            <XCircle className="w-4 h-4" /> Kapat
                        </button>
                    )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-black to-black">
                {selectedTicket.messages.map((m, idx) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                <div className="text-[10px] text-text-muted font-black mb-1.5 uppercase tracking-widest opacity-60">
                                    {isAdmin ? 'YÖNETİCİ' : selectedTicket.userId?.firstName || 'ÖĞRENCİ'} • {new Date(m.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className={`px-5 py-3.5 shadow-xl text-sm leading-relaxed overflow-hidden relative group font-medium ${
                                    isAdmin 
                                    ? 'bg-primary text-white rounded-[24px] rounded-tr-sm shadow-[0_5px_20px_rgba(99,102,241,0.2)]' 
                                    : 'bg-bg-card2 border border-white/10 text-white/90 rounded-[24px] rounded-tl-sm'
                                }`}>
                                    {isAdmin && <div className="absolute top-0 right-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                    {m.text}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-5 bg-black/60 border-t border-white/5 backdrop-blur-md">
                {selectedTicket.status === 'closed' ? (
                    <div className="p-5 bg-rose-500/5 rounded-[20px] border border-dashed border-rose-500/20 flex items-center justify-center gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                        <span className="text-sm font-bold text-rose-400">Bu bilet kalıcı olarak kapatıldı.</span>
                    </div>
                ) : (
                    <form onSubmit={handleSendReply} className="flex gap-4">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                placeholder="Yanıt mermisini namluya sür..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-[20px] px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!replyText.trim() || sending}
                            className={`flex items-center justify-center gap-3 w-[140px] rounded-[20px] font-black uppercase tracking-widest text-xs transition-all ${
                                !replyText.trim() || sending 
                                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                                : 'bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95 border border-primary/50'
                            }`}
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Gönder</>}
                        </button>
                    </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent">
                <div className="w-32 h-32 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full"></div>
                    <MessageSquare className="w-12 h-12 text-white/20 relative z-10" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Kanal Kapalı</h3>
                <p className="text-text-secondary text-sm max-w-sm mt-3 font-medium leading-relaxed">
                    Operasyon başlatmak için sol taraftaki merkezden bir destek bileti (ticket) seçiniz.
                </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminSupport;
