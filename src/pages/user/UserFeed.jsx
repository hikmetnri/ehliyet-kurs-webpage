import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, HelpCircle, Lightbulb, ClipboardList,
  ThumbsUp, MessageCircle, Clock, Plus, X, Tag, Send,
  Flame, TrendingUp, Sparkles, ChevronDown, Users, Search
} from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';
import { getAvatarGrad, getPostTypeConfig, normalizeUserId, POST_TYPES, timeAgo } from '../../utils/feedUtils';

export default function UserFeed() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userId = normalizeUserId(user);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'discussion', tags: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const commentsEndRef = useRef(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/posts');
      setPosts(res.data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = posts.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.type === activeFilter;
    if (!matchesFilter) return false;
    if (!searchQuery) return true;
    
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q) ||
      p.userName?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    try {
      setSubmitting(true);
      await api.post('/posts', { ...newPost, tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean) });
      setSubmitSuccess(true);
      setTimeout(() => { setIsModalOpen(false); setSubmitSuccess(false); setNewPost({ title: '', content: '', type: 'discussion', tags: '' }); fetchPosts(); }, 1800);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const liked = p.likes.includes(userId);
        return { ...p, likes: liked ? p.likes.filter(id => id !== userId) : [...p.likes, userId] };
      }));
    } catch (e) { console.error(e); }
  };

  const handleComment = async (postId) => {
    const text = commentTexts[postId] || '';
    if (!text.trim()) return;
    try {
      await api.post(`/posts/${postId}/comment`, { text });
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block mx-auto max-w-3xl pb-24">

        {/* ── Hero Banner ── */}
        <div className="relative mb-8 overflow-hidden rounded-3xl p-5 sm:p-8"
          style={{ background: 'gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(6,182,212,0.12) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
          </div>
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary-light" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary-light">Topluluk</span>
              </div>
              <h1 className="mb-2 text-2xl font-black leading-tight text-white sm:text-3xl">
                Birlikte <span className="gradient-text">öğrenelim!</span>
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
                Diğer adaylarla bilgi paylaş, soru sor, deneyimlerini aktар.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span><b className="text-white">{posts.length}</b> gönderi</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span><b className="text-white">{posts.reduce((a, p) => a + (p.comments?.length || 0), 0)}</b> yorum</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 sm:w-auto sm:flex-col"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">Paylaş</span>
            </button>
          </div>
        </div>

        {/* ── Search and Filter Area ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Gönderilerde, etiketlerde veya kullanıcılarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-card border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {[{ key: 'all', label: 'Tümü', icon: Sparkles }, ...Object.entries(POST_TYPES).map(([k, v]) => ({ key: k, label: v.label, icon: v.icon }))].map(f => {
              const active = activeFilter === f.key;
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-bg-card border border-white/5 text-text-muted hover:text-white hover:border-white/15'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Feed ── */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-bg-card border border-white/5 rounded-3xl p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5" />
                    <div className="space-y-2"><div className="h-3 w-24 bg-white/5 rounded" /><div className="h-2 w-16 bg-white/5 rounded" /></div>
                  </div>
                  <div className="h-5 w-3/4 bg-white/5 rounded mb-3" />
                  <div className="h-3 w-full bg-white/5 rounded mb-2" />
                  <div className="h-3 w-2/3 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-bg-card border border-white/5 rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white font-bold mb-1">Henüz gönderi yok</p>
              <p className="text-text-muted text-sm">İlk paylaşımı sen yap!</p>
            </div>
          ) : (
            filtered.map((post, idx) => {
              const cfg = getPostTypeConfig(post.type);
              const TypeIcon = cfg.icon;
              const isLiked = post.likes?.includes(userId);
              const isExpanded = expandedPostId === post._id;
              const grad = getAvatarGrad(post.userName);

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-bg-card border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-colors"
                >
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                          {(post.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm">{post.userName || 'Kullanıcı'}</p>
                          <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                            <Clock className="w-3 h-3" />
                            {timeAgo(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className={`flex w-fit items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${cfg.bg} ${cfg.tw} ${cfg.border}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </div>
                    </div>

                    {/* Content */}
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/feed/${post._id}`)}
                      className="mb-4 block w-full rounded-2xl pl-1 text-left transition-colors hover:bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <h3 className="text-base font-bold text-white mb-2 leading-snug">{post.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap line-clamp-3">{post.content}</p>
                    </button>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs text-primary-light bg-primary/10 px-2.5 py-1 rounded-lg">
                            <Tag className="w-3 h-3" /> #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-4 border-t border-white/5">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isLiked ? 'bg-primary/15 text-primary-light' : 'text-text-muted hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-primary-light' : ''}`} />
                        <span>{post.likes?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => setExpandedPostId(isExpanded ? null : post._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isExpanded ? 'bg-white/5 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments?.length || 0} Yorum</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/feed/${post._id}`)}
                        className="ml-auto rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest text-text-muted transition-all hover:bg-white/5 hover:text-white"
                      >
                        Aç
                      </button>
                    </div>
                  </div>

                  {/* Comments Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 bg-black/20">
                          {/* Comments List */}
                          <div className="p-4 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                            {(post.comments?.length || 0) === 0 ? (
                              <p className="text-center text-xs text-text-muted py-4">İlk yorumu sen yap ✨</p>
                            ) : (
                              post.comments.map((c, i) => {
                                const isMe = c.userId === userId;
                                return (
                                  <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${getAvatarGrad(c.userName)} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                                      {(c.userName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`flex max-w-[84%] flex-col sm:max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        isMe
                                          ? 'bg-primary text-white rounded-tr-sm'
                                          : 'bg-bg-card border border-white/5 text-text-secondary rounded-tl-sm'
                                      }`}>
                                        {c.text}
                                      </div>
                                      <span className="text-[10px] text-text-muted mt-1 px-1">
                                        {isMe ? 'Siz' : c.userName} · {timeAgo(c.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            <div ref={commentsEndRef} />
                          </div>

                          {/* Reply Box */}
                          <div className="flex gap-2 border-t border-white/5 p-3">
                            <input
                              type="text"
                              value={commentTexts[post._id] || ''}
                              onChange={e => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleComment(post._id); }}
                              placeholder="Yorum yaz, Enter ile gönder..."
                              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-bg-card px-4 py-2.5 text-sm text-white placeholder-text-muted transition-colors focus:border-primary/50 focus:outline-none"
                            />
                            <button
                              onClick={() => handleComment(post._id)}
                              disabled={!(commentTexts[post._id] || '').trim()}
                              className="p-2.5 bg-primary disabled:opacity-40 hover:bg-primary/80 text-white rounded-xl transition-all"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden mx-auto max-w-3xl pb-24 text-white px-2 space-y-5">
        {/* Header Component */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Akış</h1>
            <p className="text-xs font-semibold text-text-muted mt-0.5">Sorular, ipuçları ve sınav deneyimleri</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Share composer card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center gap-3 p-3 bg-[#171927]/60 border border-white/5 rounded-2xl shadow-md text-left transition-all active:scale-[0.99]"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-cyan-400/20 border border-primary/20 flex items-center justify-center text-primary-light font-black text-sm shrink-0">
            {user?.firstName?.charAt(0).toUpperCase() || 'H'}
          </div>
          <span className="flex-1 text-xs text-text-muted font-bold truncate">Bir soru, ipucu veya deneyim paylaş...</span>
          <span className="px-2.5 py-1 bg-primary/10 text-primary-light border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0">
            Paylaş
          </span>
        </button>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-[#171927]/60 border border-white/5 rounded-2xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary-light shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-black tracking-tight leading-none">{posts.length}</p>
              <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-1">Gönderi</p>
            </div>
          </div>
          <div className="p-3 bg-[#171927]/60 border border-white/5 rounded-2xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-black tracking-tight leading-none">
                {posts.filter(p => p.type === 'question').length}
              </p>
              <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-1">Soru</p>
            </div>
          </div>
          <div className="p-3 bg-[#171927]/60 border border-white/5 rounded-2xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-black tracking-tight leading-none">
                {posts.filter(p => p.type === 'tip').length}
              </p>
              <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-1">İpucu</p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-muted" />
          </span>
          <input
            type="text"
            placeholder="Arama yapın..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171927]/60 border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Horizontal filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {[
            { key: 'all', label: 'Hepsi', icon: Sparkles },
            ...Object.entries(POST_TYPES).map(([k, v]) => ({ key: k, label: v.label, icon: v.icon }))
          ].map(f => {
            const active = activeFilter === f.key;
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-white/5 border border-white/5 text-text-muted hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#171927]/60 border border-white/5 rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                    <div className="space-y-1.5"><div className="h-2.5 w-20 bg-white/5 rounded" /><div className="h-2 w-12 bg-white/5 rounded" /></div>
                  </div>
                  <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
                  <div className="h-2.5 w-full bg-white/5 rounded mb-1.5" />
                  <div className="h-2.5 w-2/3 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-[#171927]/60 border border-white/5 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white text-sm font-bold mb-0.5">Gönderi bulunamadı</p>
              <p className="text-text-muted text-xs">Aramanızla eşleşen veya henüz paylaşılan bir gönderi yok.</p>
            </div>
          ) : (
            filtered.map((post, idx) => {
              const cfg = getPostTypeConfig(post.type);
              const TypeIcon = cfg.icon;
              const isLiked = post.likes?.includes(userId);
              const isExpanded = expandedPostId === post._id;
              const grad = getAvatarGrad(post.userName);

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.12) }}
                  className="bg-[#171927]/60 border border-white/5 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="p-4">
                    {/* Post Card Header */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black text-xs shadow`}>
                          {(post.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs truncate">{post.userName || 'Kullanıcı'}</p>
                          <div className="flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
                            <Clock className="w-3 h-3" />
                            {timeAgo(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.tw} ${cfg.border} shrink-0`}>
                        <TypeIcon className="w-3 h-3" />
                        {cfg.label}
                      </div>
                    </div>

                    {/* Post Content Body */}
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/feed/${post._id}`)}
                      className="block w-full text-left focus:outline-none mb-3"
                    >
                      <h3 className="text-sm font-black text-white mb-1.5 leading-snug line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                    </button>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-0.5 text-[10px] text-primary-light bg-primary/10 px-2 py-0.5 rounded-md">
                            <Tag className="w-2.5 h-2.5" /> #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center gap-1.5 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isLiked ? 'bg-primary/15 text-primary-light' : 'text-text-muted hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-primary-light' : ''}`} />
                        <span>{post.likes?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => setExpandedPostId(isExpanded ? null : post._id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isExpanded ? 'bg-white/5 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/feed/${post._id}`)}
                        className="ml-auto px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-text-muted bg-white/5 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                      >
                        Aç
                      </button>
                    </div>
                  </div>

                  {/* Mobile Comments Accordion */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 bg-black/20">
                          <div className="p-3 space-y-3.5 max-h-56 overflow-y-auto custom-scrollbar">
                            {(post.comments?.length || 0) === 0 ? (
                              <p className="text-center text-[10px] text-text-muted py-3">İlk yorumu sen yaz ✨</p>
                            ) : (
                              post.comments.map((c, i) => {
                                const isMe = c.userId === userId;
                                return (
                                  <div key={i} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getAvatarGrad(c.userName)} flex items-center justify-center text-white font-bold text-[10px] shrink-0`}>
                                      {(c.userName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`flex max-w-[85%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                      <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                        isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-[#171927] border border-white/5 text-text-secondary rounded-tl-none'
                                      }`}>
                                        {c.text}
                                      </div>
                                      <span className="text-[9px] text-text-muted mt-0.5 px-0.5">
                                        {isMe ? 'Siz' : c.userName} · {timeAgo(c.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Inline Reply input */}
                          <div className="flex gap-2 border-t border-white/5 p-2">
                            <input
                              type="text"
                              value={commentTexts[post._id] || ''}
                              onChange={e => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleComment(post._id); }}
                              placeholder="Yorumunuz..."
                              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#171927] px-3 py-2 text-xs text-white placeholder-text-muted focus:border-primary/50 focus:outline-none"
                            />
                            <button
                              onClick={() => handleComment(post._id)}
                              disabled={!(commentTexts[post._id] || '').trim()}
                              className="p-2 bg-primary disabled:opacity-40 text-white rounded-xl transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Create Post Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
              style={{ background: '#101017', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary-light" />
                  </div>
                  <h2 className="font-black text-white">Yeni Gönderi</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-text-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[calc(92vh-73px)] space-y-5 overflow-y-auto p-4 custom-scrollbar sm:p-6">
                {submitSuccess ? (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="font-black text-white text-lg">Gönderildi!</p>
                    <p className="text-text-muted text-sm text-center">Gönderiniz incelemeye alındı, onaylandıktan sonra yayınlanacak.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    {/* Type Picker */}
                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Tür</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(POST_TYPES).map(([k, cfg]) => {
                          const Icon = cfg.icon;
                          const sel = newPost.type === k;
                          return (
                            <button
                              key={k}
                              type="button"
                              onClick={() => setNewPost(p => ({ ...p, type: k }))}
                              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all text-xs font-bold ${
                                sel ? `${cfg.bg} ${cfg.tw} ${cfg.border}` : 'border-white/5 bg-white/[0.03] text-text-muted hover:bg-white/[0.06]'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Başlık</p>
                      <input
                        required
                        type="text"
                        value={newPost.title}
                        onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Gönderinizin başlığı..."
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">İçerik</p>
                      <textarea
                        required
                        rows={4}
                        value={newPost.content}
                        onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                        placeholder="Düşüncelerinizi paylaşın..."
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Etiketler <span className="normal-case font-normal">(virgülle ayır)</span></p>
                      <input
                        type="text"
                        value={newPost.tags}
                        onChange={e => setNewPost(p => ({ ...p, tags: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="motor, trafik, ilk yardım..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !newPost.title.trim() || !newPost.content.trim()}
                      className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99]"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                    >
                      {submitting ? 'Gönderiliyor...' : '🚀  Paylaş'}
                    </button>
                    <p className="text-center text-xs text-text-muted">Yönetici onayından sonra yayınlanır</p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
