import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, HelpCircle, Lightbulb, MessageCircle, Sparkles
} from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';
import { normalizeUserId, POST_TYPES } from '../../utils/feedUtils';
import ReportPostModal from '../../components/user/ReportPostModal';

// ─── Extracted Modules (SRP) ─────────────────────────────────────
import { DesktopFeed, MobileFeed, CreatePostModal } from './feed/FeedViews';
import { useFeedPosts } from './feed/useFeedPosts';

export default function UserFeed() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userId = normalizeUserId(user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const { posts, setPosts, loading, loadingMore, hasMore, total, fetchPosts, handleLoadMore } = useFeedPosts(activeFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportPost, setReportPost] = useState(null);

  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'discussion', tags: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const commentsEndRef = useRef(null);

  // Tür sunucuda, arama yüklenmiş gönderiler üzerinde filtrelenir.
  const filtered = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q) ||
      p.userName?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount ?? p.comments?.length ?? 0), 0);
  const questionCount = posts.filter(p => p.type === 'question').length;
  const tipCount = posts.filter(p => p.type === 'tip').length;
  const desktopStats = [
    { label: 'Gönderi', value: total || posts.length, icon: MessageSquare, tone: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { label: 'Yorum', value: totalComments, icon: MessageCircle, tone: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Soru', value: questionCount, icon: HelpCircle, tone: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'İpucu', value: tipCount, icon: Lightbulb, tone: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  ];
  const filterOptions = [
    { key: 'all', label: 'Tümü', icon: Sparkles },
    ...Object.entries(POST_TYPES).map(([key, value]) => ({ key, label: value.label, icon: value.icon })),
  ];
  const activeFilterLabel = filterOptions.find(option => option.key === activeFilter)?.label || 'Tümü';
  const typeSummary = Object.entries(POST_TYPES).map(([key, value]) => ({
    key,
    label: value.label,
    icon: value.icon,
    count: posts.filter(post => post.type === key).length,
  }));

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    try {
      setSubmitting(true);
      await api.post('/posts', { ...newPost, tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean) });
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setNewPost({ title: '', content: '', type: 'discussion', tags: '' });
        // Yeni post sonrası ilk sayfadan yenile
        fetchPosts(1, true);
      }, 1800);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const expandComments = async (postId, expanded) => {
    if (expanded) { setExpandedPostId(null); return; }
    try {
      const response = await api.get(`/posts/${postId}`);
      setPosts(previous => previous.map(post => post._id === postId ? response.data : post));
      setExpandedPostId(postId);
    } catch { window.alert('Yorumlar alınamadı. Tekrar dene.'); }
  };
  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      setPosts(previous => previous.map(post => post._id === postId ? {
        ...post, likesCount: response.data.likesCount,
        likes: response.data.isLiked ? [userId] : [],
      } : post));
    } catch (e) { console.error(e); }
  };

  const handleComment = async (postId) => {
    const text = commentTexts[postId] || '';
    if (!text.trim()) return;
    try {
      await api.post(`/posts/${postId}/comment`, { text });
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      await expandComments(postId, false);
    } catch (e) { console.error(e); }
  };

  return (
    <>
      {/* Desktop View */}
      <DesktopFeed
        activeFilter={activeFilter}
        activeFilterLabel={activeFilterLabel}
        commentTexts={commentTexts}
        commentsEndRef={commentsEndRef}
        desktopStats={desktopStats}
        expandComments={expandComments}
        expandedPostId={expandedPostId}
        filterOptions={filterOptions}
        filtered={filtered}
        handleComment={handleComment}
        handleLike={handleLike}
        handleLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
        loadingMore={loadingMore}
        navigate={navigate}
        posts={posts}
        searchQuery={searchQuery}
        setActiveFilter={setActiveFilter}
        setCommentTexts={setCommentTexts}
        setIsModalOpen={setIsModalOpen}
        setReportPost={setReportPost}
        setSearchQuery={setSearchQuery}
        setShowReport={setShowReport}
        total={total}
        typeSummary={typeSummary}
        userId={userId}
      />

      {/* Mobile View */}
      <MobileFeed
        activeFilter={activeFilter}
        commentTexts={commentTexts}
        expandComments={expandComments}
        expandedPostId={expandedPostId}
        filtered={filtered}
        handleComment={handleComment}
        handleLike={handleLike}
        handleLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
        loadingMore={loadingMore}
        navigate={navigate}
        posts={posts}
        searchQuery={searchQuery}
        setActiveFilter={setActiveFilter}
        setCommentTexts={setCommentTexts}
        setIsModalOpen={setIsModalOpen}
        setReportPost={setReportPost}
        setSearchQuery={setSearchQuery}
        setShowReport={setShowReport}
        total={total}
        user={user}
        userId={userId}
      />

      {/* ── Create Post Modal ── */}
      <CreatePostModal
        handleCreatePost={handleCreatePost}
        isModalOpen={isModalOpen}
        newPost={newPost}
        setIsModalOpen={setIsModalOpen}
        setNewPost={setNewPost}
        submitSuccess={submitSuccess}
        submitting={submitting}
      />

      {/* Report Modal */}
      <ReportPostModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        post={reportPost}
      />
    </>
  );
}
