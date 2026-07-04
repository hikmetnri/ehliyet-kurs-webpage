import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import {
  Loader2, Search, Share2, User, RefreshCw,
  CheckCircle2, XCircle, Trash2, MessageSquare,
  ThumbsUp, Calendar, AlertCircle, Clock,
  ShieldCheck, ShieldAlert, Inbox, Check, X,
  Image as ImageIcon, ChevronRight
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { label: 'BEKLEMEDE', icon: Clock,       color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  approved: { label: 'ONAYLANDI', icon: ShieldCheck,  color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  rejected: { label: 'REDDEDİLDİ', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

const TYPE_CONFIG = {
  discussion: { emoji: '💬', label: 'Tartışma' },
  question:   { emoji: '❓', label: 'Soru' },
  exam_share: { emoji: '🏆', label: 'Sınav Paylaşımı' },
  tip:        { emoji: '💡', label: 'İpucu' },
};

const FILTERS = [
  { id: 'all',      label: 'Tümü' },
  { id: 'pending',  label: 'Bekleyen' },
  { id: 'approved', label: 'Onaylı' },
  { id: 'rejected', label: 'Reddedilen' },
];

const AdminFeed = () => {
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setFilter]   = useState('all');
  const [searchTerm, setSearch]     = useState('');
  const [processingId, setProc]     = useState(null);
  const [selectedPost, setSelected] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all'
        ? '/posts/admin/all'
        : `/posts/admin/all?status=${statusFilter}`;
      const res = await api.get(url);
      setPosts(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error('Gönderiler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    if (selectedPost && posts.length > 0) {
      const updated = posts.find(p => p._id === selectedPost._id);
      if (updated) setSelected(updated);
    }
  }, [posts]);

  const handleApprove = async (postId) => {
    try {
      setProc(postId);
      await api.patch(`/posts/${postId}/approve`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'approved' } : p));
    } catch {
      alert('Gönderi onaylanamadı.');
    } finally {
      setProc(null);
    }
  };

  const handleReject = async (postId) => {
    const note = window.prompt('Reddetme sebebi (isteğe bağlı):');
    if (note === null) return;
    try {
      setProc(postId);
      await api.patch(`/posts/${postId}/reject`, { adminNote: note });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'rejected', adminNote: note } : p));
    } catch {
      alert('Gönderi reddedilemedi.');
    } finally {
      setProc(null);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Bu gönderiyi kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      setProc(postId);
      await api.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
      if (selectedPost?._id === postId) setSelected(null);
    } catch {
      alert('Gönderi silinemedi.');
    } finally {
      setProc(null);
    }
  };

  const filtered = posts.filter(p =>
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const counts = {
    all:      posts.length,
    pending:  posts.filter(p => p.status === 'pending').length,
    approved: posts.filter(p => p.status === 'approved').length,
    rejected: posts.filter(p => p.status === 'rejected').length,
  };

  const typeCfg = (type) => TYPE_CONFIG[type] || { emoji: '📄', label: 'Gönderi' };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pb-8">

      {/* Page Header */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-primary-light uppercase tracking-widest">Moderasyon</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">Akış Kontrol Merkezi</h1>
            <p className="mt-1 text-sm text-text-muted max-w-2xl">
              Paylaşılan tüm gönderileri denetleyin, onaylayın veya topluluk kurallarına göre silin.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-lg font-black text-white">{counts.pending}</p>
                <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Bekleyen</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                <p className="text-lg font-black text-white">{counts.approved}</p>
                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Onaylı</p>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                <p className="text-lg font-black text-white">{counts.rejected}</p>
                <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Reddedilen</p>
              </div>
            </div>
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] text-text-muted hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row flex-1 gap-5 sm:gap-6 md:min-h-[calc(100vh-300px)]">

        {/* Left: Posts List */}
        <div className="md:w-[380px] w-full flex flex-col gap-3 shrink-0">

          {/* Search + Filter */}
          <div className="bg-white/[0.02] p-3 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center gap-3 bg-black/20 rounded-2xl px-4 py-3 border border-white/10 focus-within:border-primary/40 transition-all">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Gönderi / Kullanıcı Ara..."
                className="bg-transparent outline-none text-sm w-full text-white placeholder:text-white/25 font-medium"
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearch('')} className="text-text-muted hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-1 p-1 bg-black/20 rounded-2xl border border-white/10">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
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
                <span className="text-xs font-bold text-primary-light uppercase tracking-widest">Taranıyor...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                <Inbox className="w-12 h-12 text-white/10 mb-3" />
                <span className="text-sm font-bold text-text-muted">Gönderi bulunamadı</span>
              </div>
            ) : (
              filtered.map(post => {
                const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.pending;
                const tc  = typeCfg(post.type);
                const isSelected = selectedPost?._id === post._id;

                return (
                  <motion.button
                    key={post._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelected(post)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all relative ${
                      isSelected
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-white/[0.015] border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    {isSelected && <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-primary" />}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-sm">
                        {tc.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${cfg.color}`}>
                            <cfg.icon className="w-2.5 h-2.5" /> {cfg.label}
                          </span>
                          <span className="text-[9px] text-text-muted/60">
                            {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className={`text-sm font-bold leading-snug line-clamp-2 ${isSelected ? 'text-white' : 'text-white/90'}`}>
                          {post.title || post.content}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <User className="w-3 h-3 opacity-50" /> {post.userName}
                          </span>
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 opacity-50" /> {post.likes?.length || 0}
                          </span>
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 opacity-50" /> {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-text-muted shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90 text-primary-light' : ''}`} />
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detail */}
        <div className="flex-1 min-h-[480px] md:min-h-0 bg-white/[0.02] rounded-3xl border border-white/10 flex flex-col overflow-hidden">
          {selectedPost ? (
            <>
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-white/10 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-base">
                    {typeCfg(selectedPost.type).emoji}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-white leading-tight truncate">{selectedPost.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <User className="w-3 h-3 opacity-50" /> {selectedPost.userName}
                      </span>
                      <span className="text-[9px] font-bold text-primary-light bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        {typeCfg(selectedPost.type).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-5 sm:px-6 py-3 border-b border-white/10 bg-white/[0.01]">
                {processingId === selectedPost._id ? (
                  <div className="flex justify-center py-1.5">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(selectedPost._id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                      >
                        <Check className="w-3.5 h-3.5" /> Onayla
                      </button>
                    )}
                    {selectedPost.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(selectedPost._id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reddet
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedPost._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Sil
                    </button>
                    <div className="ml-auto flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" /> {selectedPost.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> {selectedPost.comments?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(selectedPost.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">

                {/* Rejection note */}
                {selectedPost.adminNote && (
                  <div className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/15 rounded-2xl">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Yönetici Notu</p>
                      <p className="text-sm text-rose-300/80">{selectedPost.adminNote}</p>
                    </div>
                  </div>
                )}

                {/* Post text */}
                <div>
                  <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest mb-2">Gönderi İçeriği</p>
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </div>
                </div>

                {/* Post image if exists */}
                {selectedPost.imageUrl && (
                  <div>
                    <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest mb-2">Ek Görsel</p>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                      <img
                        src={selectedPost.imageUrl}
                        alt="Gönderi görseli"
                        className="w-full max-h-64 object-cover"
                        onError={e => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div>
                  <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest mb-3">
                    Yorumlar ({selectedPost.comments?.length || 0})
                  </p>
                  {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                    <div className="flex items-center justify-center py-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                      <p className="text-xs text-text-muted italic">Henüz yorum yapılmamış.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                      {selectedPost.comments.map(comment => (
                        <div key={comment._id} className="flex gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-black text-white/50">
                            {(comment.userName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white">{comment.userName}</span>
                              <span className="text-[9px] text-text-muted/60">
                                {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary mt-1 leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-5">
                <Share2 className="w-7 h-7 text-white/15" />
              </div>
              <h3 className="text-base font-bold text-white">Gönderi Seçilmedi</h3>
              <p className="text-text-secondary text-sm max-w-xs mt-2 leading-relaxed">
                Sol taraftaki listeden bir gönderi seçerek onaylayın, reddedin veya silin.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminFeed;
