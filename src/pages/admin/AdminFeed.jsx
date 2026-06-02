import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, Share2, User, Filter,
  CheckCircle2, XCircle, Trash2, MessageSquare,
  ThumbsUp, Calendar, AlertCircle, Clock,
  MoreVertical, ShieldCheck, ShieldAlert, Tag,
  ExternalLink, Eye, Check, X, Inbox
} from 'lucide-react';

const AdminFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedPost && posts.length > 0) {
      const updated = posts.find(p => p._id === selectedPost._id);
      if (updated) setSelectedPost(updated);
    }
  }, [posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' ? '/posts/admin/all' : `/posts/admin/all?status=${statusFilter}`;
      const res = await api.get(url);
      setPosts(res.data);
    } catch (err) {
      console.error('Gönderiler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      setProcessingId(postId);
      await api.patch(`/posts/${postId}/approve`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'approved' } : p));
    } catch (err) {
      alert("Gönderi onaylanamadı.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (postId) => {
    const note = window.prompt("Reddetme sebebi (isteğe bağlı):");
    if (note === null) return;

    try {
      setProcessingId(postId);
      await api.patch(`/posts/${postId}/reject`, { adminNote: note });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'rejected', adminNote: note } : p));
    } catch (err) {
      alert("Gönderi reddedilemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bu gönderiyi kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      setProcessingId(postId);
      await api.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      alert("Gönderi silinemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPosts = posts.filter(p =>
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { label: 'BEKLEMEDE', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'approved': return { label: 'ONAYLANDI', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'rejected': return { label: 'REDDEDİLDİ', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      default: return { label: status, icon: AlertCircle, color: 'text-text-muted bg-white/5 border-white/10' };
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
        case 'discussion': return '💬 Tartışma';
        case 'question': return '❓ Soru';
        case 'exam_share': return '🏆 Sınav Paylaşımı';
        case 'tip': return '💡 İpucu';
        default: return '📄 Gönderi';
    }
  };

  return (
    <div className="flex flex-col md:h-[calc(100vh-120px)] gap-5 sm:gap-6">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Akış Kontrol Merkezi</h1>
          <p className="text-text-secondary text-sm mt-1">Paylaşılan tüm gönderileri denetleyin, onaylayın veya topluluk kurallarına göre silin.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-5 sm:gap-6 md:min-h-0">

        {/* Left Side: Posts List */}
        <div className="md:w-96 w-full flex flex-col gap-4 shrink-0 md:min-h-0">

          {/* Search & Filter */}
          <div className="bg-white/[0.02] p-3 rounded-3xl border border-white/10 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center bg-white/[0.02] rounded-2xl px-4 py-3 w-full border border-white/10 transition-all focus-within:border-primary/50 focus-within:bg-black/20">
              <Search className="w-5 h-5 text-primary-light mr-3" />
              <input
                type="text"
                placeholder="Gönderi Ara..."
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-text-muted font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 bg-white/[0.02] rounded-2xl border border-white/10">
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    statusFilter === f
                        ? 'bg-primary/20 text-primary-light border-primary/30'
                        : 'bg-transparent border-transparent text-text-muted hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : f === 'approved' ? 'Onaylı' : 'Red'}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          <div className="md:flex-1 max-h-[48vh] md:max-h-none overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border border-white/10 rounded-3xl">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest animate-pulse">Akış Taranıyor...</span>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border border-white/10 rounded-3xl">
                     <Inbox className="w-16 h-16 text-white/10 mb-4" />
                    <span className="text-sm font-bold text-text-muted">Gönderi bulunamadı.</span>
                </div>
            ) : (
                filteredPosts.map((post) => {
                    const statusInfo = getStatusBadge(post.status);
                    const isSelected = selectedPost?._id === post._id;

                    return (
                        <motion.button
                            key={post._id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedPost(post)}
                            className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 relative group overflow-hidden ${
                                isSelected
                                ? 'bg-primary/5 border-primary/40 shadow-sm'
                                : 'bg-white/[0.015] border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                            }`}
                        >
                            {isSelected && <div className="absolute left-0 top-[20%] bottom-[20%] w-1 rounded-r-full bg-primary"></div>}

                            <div className="flex justify-between items-start mb-3">
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${statusInfo.color}`}>
                                    <statusInfo.icon className="w-3 h-3" /> {statusInfo.label}
                                </span>
                                <span className="text-[10px] text-text-muted font-bold flex items-center gap-1 opacity-70">
                                    <Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>

                            <h3 className={`font-bold text-sm line-clamp-1 mb-2 ${isSelected ? 'text-white' : 'text-white/90'}`}>
                                {post.title}
                            </h3>

                            <div className="flex justify-between items-center gap-2 mt-3">
                                <span className="text-[9px] font-bold text-text-muted/80 uppercase tracking-widest">
                                    {getTypeBadge(post.type)}
                                </span>
                                <span className="text-xs text-text-muted font-semibold truncate flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 opacity-50" /> {post.userName}
                                </span>
                            </div>
                        </motion.button>
                    );
                })
            )}
          </div>
        </div>

        {/* Right Side: Selected Post Details */}
        <div className="flex-1 min-h-[560px] md:min-h-0 bg-white/[0.02] rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-sm">
          {selectedPost ? (
            <>
              {/* Header */}
              <div className="px-4 sm:px-8 py-5 border-b border-white/10 bg-white/[0.015] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5 text-primary-light" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white leading-tight tracking-tight truncate">{selectedPost.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs">
                        <span className="text-text-muted font-semibold flex items-center gap-1.5"><User className="w-3.5 h-3.5 opacity-50" /> {selectedPost.userName}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                        <span className="text-[9px] font-bold text-primary-light uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/25">
                            {getTypeBadge(selectedPost.type)}
                        </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls - Top Fixed Bar */}
              <div className="px-4 sm:px-8 py-4 border-b border-white/10 bg-white/[0.01] shrink-0">
                {processingId === selectedPost._id ? (
                   <div className="flex justify-center py-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                   </div>
                ) : (
                   <div className="flex flex-wrap sm:flex-nowrap gap-3">
                       {selectedPost.status !== 'approved' && (
                           <button
                               onClick={() => handleApprove(selectedPost._id)}
                               className="flex-1 min-h-[44px] justify-center flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                           >
                               <Check className="w-4 h-4" /> Gönderiyi Onayla
                           </button>
                       )}
                       {selectedPost.status !== 'rejected' && (
                           <button
                               onClick={() => handleReject(selectedPost._id)}
                               className="flex-1 min-h-[44px] justify-center flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white"
                           >
                               <ShieldAlert className="w-4 h-4" /> Gönderiyi Reddet
                           </button>
                       )}
                       <button
                           onClick={() => handleDelete(selectedPost._id)}
                           className="flex-1 min-h-[44px] justify-center flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                       >
                           <Trash2 className="w-4 h-4" /> Gönderiyi Sil
                       </button>
                   </div>
                )}
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 custom-scrollbar bg-white/[0.005]">

                {/* Post Text/Content */}
                <div className="space-y-3">
                   <h3 className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest">Gönderi Metni</h3>
                   <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 text-sm text-white/95 leading-relaxed whitespace-pre-wrap">
                       {selectedPost.content}
                   </div>
                </div>

                {/* Rejection Note if exists */}
                {selectedPost.adminNote && (
                    <div className="space-y-3">
                       <h3 className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest">Yönetici Notu</h3>
                       <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-5 text-sm text-rose-400 font-medium">
                           {selectedPost.adminNote}
                       </div>
                    </div>
                )}

                {/* Engagement Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/[0.015] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Beğeni Sayısı</p>
                         <h4 className="text-lg font-bold text-white mt-1">{selectedPost.likes?.length || 0} Beğeni</h4>
                      </div>
                      <ThumbsUp className="h-5 w-5 text-indigo-400" />
                   </div>
                   <div className="bg-white/[0.015] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Yorum Sayısı</p>
                         <h4 className="text-lg font-bold text-white mt-1">{selectedPost.comments?.length || 0} Yorum</h4>
                      </div>
                      <MessageSquare className="h-5 w-5 text-violet-400" />
                   </div>
                </div>

                {/* Yorumlar Listesi */}
                <div className="space-y-3">
                   <h3 className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest">Yorumlar ({selectedPost.comments?.length || 0})</h3>
                   <div className="bg-white/[0.015] border border-white/10 rounded-3xl p-5 space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar">
                      {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                         <p className="text-xs text-text-muted italic text-center py-4">Bu gönderiye henüz yorum yapılmamış.</p>
                      ) : (
                         selectedPost.comments.map((comment) => (
                            <div key={comment._id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-3 items-start">
                               <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                  {(comment.userName || 'U').charAt(0).toUpperCase()}
                               </div>
                               <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                     <span className="text-xs font-bold text-white">{comment.userName}</span>
                                     <span className="text-[9px] text-text-muted/60">{new Date(comment.createdAt).toLocaleDateString('tr-TR')}</span>
                                  </div>
                                  <p className="text-xs text-text-secondary mt-1 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                </div>
                            </div>
                         ))
                      )}
                   </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-transparent">
                <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6">
                    <Share2 className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Gönderi Seçilmedi</h3>
                <p className="text-text-secondary text-sm max-w-sm mt-2.5 font-medium leading-relaxed">
                    Onaylama, reddetme veya silme işlemlerini gerçekleştirmek için sol taraftaki listeden bir gönderi seçiniz.
                </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminFeed;
