import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Loader2, MessageCircle, Send, Tag,
  ThumbsUp, TriangleAlert, Sparkles,
} from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';
import {
  getAvatarGrad, getPostTypeConfig, normalizeUserId, timeAgo,
} from '../../utils/feedUtils';

const DetailState = ({ icon: Icon, title, description, action }) => (
  <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.04]">
      <Icon className="h-8 w-8 text-white/25" />
    </div>
    <h2 className="text-xl font-black text-white">{title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
    {action}
  </div>
);

export default function UserFeedDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userId = normalizeUserId(user);

  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/posts/${postId}`);
      setPost(res.data?.data || res.data || null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError('Bu gönderi henüz yayında değil veya görüntüleme yetkin yok.');
      } else if (status === 404) {
        setError('Gönderi bulunamadı. Silinmiş veya bağlantı hatalı olabilir.');
      } else {
        setError('Gönderi yüklenemedi. Lütfen tekrar dene.');
      }
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (!post || actionLoading) return;

    const liked = post.likes?.includes(userId);
    setPost(prev => ({
      ...prev,
      likes: liked ? prev.likes.filter(id => id !== userId) : [...(prev.likes || []), userId],
    }));

    try {
      setActionLoading('post-like');
      await api.post(`/posts/${post._id}/like`);
    } catch (err) {
      setPost(prev => ({
        ...prev,
        likes: liked ? [...(prev.likes || []), userId] : prev.likes.filter(id => id !== userId),
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleComment = async () => {
    const text = commentText.trim();
    if (!post || !text || actionLoading) return;

    try {
      setActionLoading('comment');
      const res = await api.post(`/posts/${post._id}/comment`, { text });
      const newComment = res.data;
      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
      setCommentText('');
    } catch (err) {
      setError('Yorum gönderilemedi. Lütfen tekrar dene.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!post || actionLoading) return;

    const target = post.comments?.find(comment => comment._id === commentId);
    if (!target) return;

    const liked = target.likes?.includes(userId);
    setPost(prev => ({
      ...prev,
      comments: prev.comments.map(comment => {
        if (comment._id !== commentId) return comment;
        return {
          ...comment,
          likes: liked
            ? (comment.likes || []).filter(id => id !== userId)
            : [...(comment.likes || []), userId],
        };
      }),
    }));

    try {
      setActionLoading(`comment-like-${commentId}`);
      await api.post(`/posts/${post._id}/comment/${commentId}/like`);
    } catch (err) {
      setPost(prev => ({
        ...prev,
        comments: prev.comments.map(comment => {
          if (comment._id !== commentId) return comment;
          return {
            ...comment,
            likes: liked
              ? [...(comment.likes || []), userId]
              : (comment.likes || []).filter(id => id !== userId),
          };
        }),
      }));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Gönderi yükleniyor</span>
      </div>
    );
  }

  if (error && !post) {
    return (
      <DetailState
        icon={TriangleAlert}
        title="Gönderi açılamadı"
        description={error}
        action={(
          <button
            type="button"
            onClick={() => navigate('/dashboard/feed')}
            className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
          >
            Topluluğa dön
          </button>
        )}
      />
    );
  }

  const cfg = getPostTypeConfig(post.type);
  const TypeIcon = cfg.icon;
  const isLiked = post.likes?.includes(userId);
  const authorGrad = getAvatarGrad(post.userName);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block mx-auto max-w-3xl pb-24">
        <button
          type="button"
          onClick={() => navigate('/dashboard/feed')}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4.5 py-2.5 text-xs font-black uppercase tracking-widest text-text-muted transition-all hover:bg-white/[0.07] hover:text-white hover:border-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Topluluğa Dön
        </button>

        {error && (
          <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
            {error}
          </div>
        )}

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#131522]/80 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)]"
        >
          {/* Ambient Glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          
          <div className="p-8 sm:p-10">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${authorGrad} text-base font-black text-white shadow-lg shadow-black/35`}>
                  {(post.userName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">{post.userName || 'Kullanıcı'}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    {timeAgo(post.createdAt)}
                  </div>
                </div>
              </div>

              <div className={`flex w-fit items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${cfg.bg} ${cfg.tw} ${cfg.border}`}>
                <TypeIcon className="h-3.5 w-3.5" />
                {cfg.label}
              </div>
            </div>

            <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl tracking-tight">{post.title}</h1>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-text-secondary sm:text-base font-medium">{post.content}</p>

            {post.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="inline-flex items-center gap-1 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary-light transition-all hover:bg-primary/20">
                    <Tag className="h-3.5 w-3.5" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 flex items-center gap-3 border-t border-white/5 pt-6">
              <button
                type="button"
                onClick={handleLike}
                disabled={actionLoading === 'post-like'}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  isLiked 
                    ? 'bg-primary/20 border border-primary/40 text-primary-light' 
                    : 'bg-white/5 border border-white/5 text-text-muted hover:bg-white/10 hover:text-white'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-primary-light' : ''}`} />
                Beğen ({post.likes?.length || 0})
              </button>
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-text-muted">
                <MessageCircle className="h-4 w-4" />
                {post.comments?.length || 0} Yorum
              </div>
            </div>
          </div>
        </motion.article>

        <section className="mt-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#131522]/80 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)]">
          <div className="border-b border-white/5 p-6 sm:p-8 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-light" />
                Yorumlar
              </h2>
              <p className="mt-1 text-xs text-text-muted">Topluluk içerisindeki fikir paylaşımları ve cevaplar.</p>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted border border-white/5">
              {post.comments?.length || 0} Yorum
            </span>
          </div>

          <div className="space-y-5 p-6 sm:p-8 max-h-[500px] overflow-y-auto custom-scrollbar">
            {(post.comments?.length || 0) === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] px-5 py-12 text-center">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-white/15" />
                <p className="text-sm font-black text-white">Henüz yorum yapılmamış</p>
                <p className="mt-1 text-xs text-text-muted">İlk düşüncelerini sen paylaş!</p>
              </div>
            ) : (
              post.comments.map((comment) => {
                const isMe = comment.userId === userId;
                const liked = comment.likes?.includes(userId);
                return (
                  <div key={comment._id} className={`flex gap-3.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarGrad(comment.userName)} text-sm font-black text-white shadow-md`}>
                      {(comment.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className={`flex max-w-[80%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed font-semibold shadow-md ${
                        isMe
                          ? 'rounded-tr-none bg-gradient-to-r from-primary to-indigo-600 border border-primary/20 text-white'
                          : 'rounded-tl-none border border-white/10 bg-white/[0.04] text-white/90'
                      }`}>
                        {comment.text}
                      </div>
                      <div className="mt-2 flex items-center gap-2 px-1.5 text-[10px] font-bold text-text-muted">
                        <span>{isMe ? 'Siz' : comment.userName} · {timeAgo(comment.createdAt)}</span>
                        <span className="text-white/10">|</span>
                        <button
                          type="button"
                          onClick={() => handleCommentLike(comment._id)}
                          disabled={actionLoading === `comment-like-${comment._id}`}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-all hover:bg-white/5 hover:text-white ${liked ? 'text-primary-light' : ''}`}
                        >
                          <ThumbsUp className={`h-3 w-3 ${liked ? 'fill-primary-light' : ''}`} />
                          {comment.likes?.length || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex gap-3 border-t border-white/5 p-4 sm:p-5 bg-black/20">
            <input
              type="text"
              value={commentText}
              onChange={event => setCommentText(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleComment();
                }
              }}
              placeholder="Yorum yaz, Enter ile gönder..."
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-5 py-3.5 text-sm text-white placeholder-text-muted transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleComment}
              disabled={!commentText.trim() || actionLoading === 'comment'}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-indigo-600 px-6 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:hover:scale-100 shadow-md shadow-primary/20 cursor-pointer"
            >
              {actionLoading === 'comment' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </section>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden mx-auto max-w-3xl pb-24 text-white px-2 space-y-4">
        {/* Sticky-like Header */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/feed')}
            className="w-10 h-10 rounded-xl bg-[#171927]/60 border border-white/5 flex items-center justify-center text-text-muted hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-none">Gönderi</h1>
            <p className="text-[10px] text-text-muted font-semibold mt-1">Akış detayları ve yorumlar</p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-200">
            {error}
          </div>
        )}

        {/* Post Card details */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/5 bg-[#171927]/60 p-4"
        >
          {/* Post Author info */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${authorGrad} flex items-center justify-center text-white font-black text-sm shadow`}>
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

          <h2 className="text-base font-black text-white mb-2 leading-snug">{post.title}</h2>
          <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary-light border border-primary/5">
                  <Tag className="h-3 w-3" />
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Post actions */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleLike}
              disabled={actionLoading === 'post-like'}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isLiked ? 'bg-primary/15 text-primary-light' : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-primary-light' : ''}`} />
              <span>{post.likes?.length || 0}</span>
            </button>
            <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-text-muted">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <section className="rounded-2xl border border-white/5 bg-[#171927]/60 overflow-hidden flex flex-col">
          <div className="border-b border-white/5 p-4">
            <h3 className="text-sm font-black text-white">Yorumlar</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Topluluk cevapları ve tartışmaları</p>
          </div>

          <div className="space-y-4 p-4 max-h-[35vh] overflow-y-auto custom-scrollbar">
            {(post.comments?.length || 0) === 0 ? (
              <div className="py-8 text-center bg-white/[0.01] rounded-xl border border-dashed border-white/5">
                <MessageCircle className="mx-auto mb-2 h-6 w-6 text-white/20" />
                <p className="text-xs font-bold text-white">Henüz yorum yok</p>
                <p className="text-[10px] text-text-muted mt-0.5">İlk yorumu sen yaz.</p>
              </div>
            ) : (
              post.comments.map((comment) => {
                const isMe = comment.userId === userId;
                const liked = comment.likes?.includes(userId);
                return (
                  <div key={comment._id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getAvatarGrad(comment.userName)} text-[10px] font-black text-white shadow`}>
                      {(comment.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className={`flex max-w-[85%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                        isMe
                          ? 'rounded-tr-none bg-primary text-white'
                          : 'rounded-tl-none border border-white/5 bg-black/25 text-text-secondary'
                      }`}>
                        {comment.text}
                      </div>
                      <div className="mt-1 flex items-center gap-2 px-0.5 text-[9px] font-bold text-text-muted">
                        <span>{isMe ? 'Siz' : comment.userName} · {timeAgo(comment.createdAt)}</span>
                        <button
                          type="button"
                          onClick={() => handleCommentLike(comment._id)}
                          disabled={actionLoading === `comment-like-${comment._id}`}
                          className={`inline-flex items-center gap-0.5 rounded transition hover:text-white ${liked ? 'text-primary-light' : ''}`}
                        >
                          <ThumbsUp className={`h-2.5 w-2.5 ${liked ? 'fill-primary-light' : ''}`} />
                          <span>{comment.likes?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mobile reply composer box */}
          <div className="flex gap-2 border-t border-white/5 p-2">
            <input
              type="text"
              value={commentText}
              onChange={event => setCommentText(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleComment();
                }
              }}
              placeholder="Yorum yaz..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white placeholder-text-muted focus:border-primary/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleComment}
              disabled={!commentText.trim() || actionLoading === 'comment'}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-3 text-white transition hover:bg-primary/80 disabled:opacity-40"
            >
              {actionLoading === 'comment' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
