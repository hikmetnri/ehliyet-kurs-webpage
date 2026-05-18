import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Loader2, MessageCircle, Send, Tag,
  ThumbsUp, TriangleAlert,
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
    <div className="mx-auto max-w-3xl pb-24">
      <button
        type="button"
        onClick={() => navigate('/dashboard/feed')}
        className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-text-muted transition hover:bg-white/[0.07] hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Topluluk
      </button>

      {error && (
        <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
          {error}
        </div>
      )}

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/5 bg-bg-card"
      >
        <div className="p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${authorGrad} text-base font-black text-white shadow-lg`}>
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

          <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">{post.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-text-secondary sm:text-base">{post.content}</p>

          {post.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary-light">
                  <Tag className="h-3.5 w-3.5" />
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-7 flex items-center gap-2 border-t border-white/5 pt-5">
            <button
              type="button"
              onClick={handleLike}
              disabled={actionLoading === 'post-like'}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                isLiked ? 'bg-primary/15 text-primary-light' : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-primary-light' : ''}`} />
              {post.likes?.length || 0}
            </button>
            <div className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-text-muted">
              <MessageCircle className="h-4 w-4" />
              {post.comments?.length || 0} Yorum
            </div>
          </div>
        </div>
      </motion.article>

      <section className="mt-5 overflow-hidden rounded-3xl border border-white/5 bg-bg-card">
        <div className="border-b border-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-black text-white">Yorumlar</h2>
          <p className="mt-1 text-sm text-text-muted">Sohbeti burada takip edebilirsin.</p>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          {(post.comments?.length || 0) === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-10 text-center">
              <MessageCircle className="mx-auto mb-3 h-8 w-8 text-white/20" />
              <p className="text-sm font-bold text-white">Henüz yorum yok</p>
              <p className="mt-1 text-xs text-text-muted">İlk yorumu sen yaz.</p>
            </div>
          ) : (
            post.comments.map((comment) => {
              const isMe = comment.userId === userId;
              const liked = comment.likes?.includes(userId);
              return (
                <div key={comment._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarGrad(comment.userName)} text-xs font-black text-white`}>
                    {(comment.userName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className={`flex max-w-[84%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isMe
                        ? 'rounded-tr-sm bg-primary text-white'
                        : 'rounded-tl-sm border border-white/5 bg-white/[0.03] text-text-secondary'
                    }`}>
                      {comment.text}
                    </div>
                    <div className="mt-1 flex items-center gap-2 px-1 text-[10px] font-bold text-text-muted">
                      <span>{isMe ? 'Siz' : comment.userName} · {timeAgo(comment.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => handleCommentLike(comment._id)}
                        disabled={actionLoading === `comment-like-${comment._id}`}
                        className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-1 transition hover:bg-white/5 hover:text-white ${liked ? 'text-primary-light' : ''}`}
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

        <div className="flex gap-2 border-t border-white/5 p-3 sm:p-4">
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
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder-text-muted transition focus:border-primary/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleComment}
            disabled={!commentText.trim() || actionLoading === 'comment'}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 text-white transition hover:bg-primary/80 disabled:opacity-40"
          >
            {actionLoading === 'comment' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </section>
    </div>
  );
}
