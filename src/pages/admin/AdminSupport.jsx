import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Search, MessageSquare, User, Filter, 
  Send, ChevronRight, CheckCircle2, Clock, XCircle,
  AlertCircle, History, Inbox, MoreVertical, Trash2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, new, read, replied, closed

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
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.userId?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return { label: 'YENİ', color: 'bg-primary/20 text-primary-light border-primary/30', icon: Inbox };
      case 'read': return { label: 'OKUNDU', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: Clock };
      case 'replied': return { label: 'CEVAPLANDI', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle2 };
      case 'closed': return { label: 'KAPANDI', color: 'bg-white/5 text-text-muted border-white/10', icon: XCircle };
      default: return { label: status, color: 'bg-white/5 text-text-muted', icon: AlertCircle };
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Destek Talepleri</h1>
          <p className="text-text-secondary text-sm mt-1">Öğrencilerden gelen mesajları yanıtlayın ve sorunları çözün.</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Side: Ticket List */}
        <div className="w-96 flex flex-col gap-4 shrink-0">
          {/* Search & Filter */}
          <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-full focus-within:border-primary/50 transition-colors">
              <Search className="w-4 h-4 text-text-muted mr-2" />
              <input 
                type="text" 
                placeholder="Talep veya kullanıcı ara..." 
                className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-text-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['all', 'new', 'replied', 'closed'].map(f => (
                <button 
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    statusFilter === f ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-text-muted border-white/5 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'Tümü' : f === 'new' ? 'Yeni' : f === 'replied' ? 'Yanıtlı' : 'Kapalı'}
                </button>
              ))}
            </div>
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-bg-card/30 rounded-3xl border border-dashed border-white/5">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Yükleniyor...</span>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center py-20 text-text-muted text-sm italic">Talep bulunamadı.</div>
            ) : (
                filteredTickets.map((ticket) => {
                    const status = getStatusBadge(ticket.status);
                    const lastMsg = ticket.messages[ticket.messages.length - 1];
                    const isSelected = selectedTicket?._id === ticket._id;
                    
                    return (
                        <motion.button
                            key={ticket._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => handleSelectTicket(ticket)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                                isSelected 
                                ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' 
                                : 'bg-bg-card border-white/5 hover:border-white/20'
                            }`}
                        >
                            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                            
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                                    {status.label}
                                </span>
                                <span className="text-[9px] text-text-muted font-bold">
                                    {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                            
                            <h3 className={`font-black text-sm line-clamp-1 mb-1 tracking-tight ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                {ticket.subject}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                    <User className="w-3 h-3 text-white/50" />
                                </div>
                                <span className="text-xs text-text-muted font-medium truncate">
                                    {ticket.userId?.firstName || 'Öğrenci'} ({ticket.userId?.email})
                                </span>
                            </div>
                            
                            <p className="text-[11px] text-text-muted line-clamp-2 italic bg-black/20 p-2 rounded-lg">
                                "{lastMsg?.text || ticket.message}"
                            </p>
                        </motion.button>
                    );
                })
            )}
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <div className="flex-1 glass-card rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl bg-bg-card/50">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white leading-none">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-text-muted font-medium">Talep sahibi: {selectedTicket.userId?.firstName} {selectedTicket.userId?.lastName}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                        <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest">
                            #ID-{selectedTicket._id.substring(selectedTicket._id.length - 6)}
                        </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {selectedTicket.status !== 'closed' && (
                        <button 
                            onClick={() => handleCloseTicket(selectedTicket._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/20 text-danger rounded-xl hover:bg-danger hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                        >
                            <XCircle className="w-4 h-4" /> Talebi Kapat
                        </button>
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <MoreVertical className="w-5 h-5 text-text-muted" />
                    </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('/grid-dark.png')] bg-repeat">
                {selectedTicket.messages.map((m, idx) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 rounded-2xl shadow-xl text-sm leading-relaxed ${
                                    isAdmin 
                                    ? 'bg-primary text-white rounded-tr-none' 
                                    : 'bg-bg-card2 border border-white/10 text-white/90 rounded-tl-none'
                                }`}>
                                    {m.text}
                                </div>
                                <span className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">
                                    {isAdmin ? 'Siz (Yönetici)' : selectedTicket.userId?.firstName || 'Öğrenci'} • {new Date(m.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Footer */}
              <div className="p-4 bg-white/[0.02] border-t border-white/5">
                {selectedTicket.status === 'closed' ? (
                    <div className="p-4 bg-black/40 rounded-2xl border border-dashed border-white/10 flex items-center justify-center gap-3">
                        <AlertCircle className="w-5 h-5 text-text-muted" />
                        <span className="text-sm text-text-muted font-medium italic">Bu destek talebi kapatılmıştır. Yeni mesaj gönderilemez.</span>
                    </div>
                ) : (
                    <form onSubmit={handleSendReply} className="flex gap-4">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                placeholder="Yanıtınızı buraya yazın..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!replyText.trim() || sending}
                            className={`flex items-center gap-3 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                                !replyText.trim() || sending 
                                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                                : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 border border-primary/20'
                            }`}
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Gönder</>}
                        </button>
                    </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-6">
                    <Inbox className="w-12 h-12 text-white/10" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">Talep Seçilmedi</h3>
                <p className="text-text-secondary text-sm max-w-xs mt-2 font-medium">Cevaplamak veya detaylarını görmek için soldaki listeden bir destek talebi seçin.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminSupport;
