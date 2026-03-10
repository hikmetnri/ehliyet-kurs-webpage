import React, { useEffect, useState, useRef } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Heart, 
  MessageCircle, 
  Send,
  MoreVertical,
  Plus,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  User as UserIcon
} from 'lucide-react';

const TAGS = ['Genel', 'Trafik', 'İlk Yardım', 'Motor', 'Sınav'];

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [newTags, setNewTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/posts');
      const data = response.data?.posts || response.data;
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes?.includes(user?._id);
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter(id => id !== user?._id)
              : [...(post.likes || []), user?._id]
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      await api.post('/posts', { content: newPost, tags: newTags });
      setNewPost('');
      setNewTags([]);
      alert('Gönderiniz başarıyla oluşturuldu! Moderatör onayından sonra yayınlanacaktır.');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await api.post(`/posts/${postId}/comments`, { text });
      const newComment = res.data?.comment || res.data;
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, comments: [...(post.comments || []), newComment] };
        }
        return post;
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleTag = (tag) => {
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const formatDate = (dateString) => {
    const options = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !activeTag || post.tags?.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  if (loading) return (
    <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: 100 }}>
      <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
      <p className="text-muted">Yükleniyor...</p>
    </div>
  );

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Topluluk Akışı</h2>
          <p className="text-muted">Diğer adaylarla bilgi paylaşın, sorular sorun.</p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Search & Filter Bar */}
        <div className="glass-panel" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-field"
              placeholder="Akışta ara..."
              style={{ paddingLeft: 44, background: 'rgba(255,255,255,0.03)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTag('')}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                background: !activeTag ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: !activeTag ? 'white' : 'var(--text-muted)',
              }}
            >
              Tümü
            </button>
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                  background: activeTag === tag ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: activeTag === tag ? 'white' : 'var(--text-muted)',
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Create Post */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
          <form onSubmit={handleSubmitPost}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div className="avatar-small" style={{ width: 44, height: 44, flexShrink: 0 }}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="me" /> : <UserIcon size={20} />}
              </div>
              <textarea
                className="input-field"
                placeholder="Neler düşünüyorsun?"
                style={{ resize: 'none', height: 80, background: 'rgba(255,255,255,0.02)' }}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
            </div>

            {/* Tag selector */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, marginLeft: 58 }}>
              {TAGS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '4px 10px', borderRadius: 14, border: '1px solid',
                    borderColor: newTags.includes(tag) ? 'var(--primary)' : 'var(--border-subtle)',
                    background: newTags.includes(tag) ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: newTags.includes(tag) ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s'
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 12 }}>
                Paylaş <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredPosts.length > 0 ? filteredPosts.map(post => (
            <div key={post._id} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Post header */}
              <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div
                    className="avatar-small"
                    style={{ cursor: 'pointer' }}
                    onClick={() => post.user?._id && navigate(`/profile/${post.user._id}`)}
                  >
                    {post.user?.avatarUrl
                      ? <img src={post.user.avatarUrl} alt="user" />
                      : <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{post.user?.firstName?.[0]}</span>
                    }
                  </div>
                  <div>
                    <h4
                      style={{ fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => post.user?._id && navigate(`/profile/${post.user._id}`)}
                    >
                      {post.user?.firstName} {post.user?.lastName}
                    </h4>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Post content */}
              <div style={{ padding: '0 20px 16px', fontSize: '1rem', lineHeight: 1.6 }}>
                {post.content}
                {post.media && (
                  <img src={post.media} alt="post media" style={{ width: '100%', borderRadius: 12, marginTop: 14, border: '1px solid var(--border-subtle)' }} />
                )}
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div style={{ padding: '0 20px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{ padding: '3px 10px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => setActiveTag(tag)}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 24, alignItems: 'center' }}>
                <button
                  onClick={() => handleLike(post._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                    color: post.likes?.includes(user?._id) ? '#ef4444' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600
                  }}
                >
                  <Heart size={20} fill={post.likes?.includes(user?._id) ? '#ef4444' : 'none'} />
                  <span>{post.likes?.length || 0}</span>
                </button>

                <button
                  onClick={() => toggleComments(post._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
                >
                  <MessageCircle size={20} />
                  <span>{post.comments?.length || 0}</span>
                  {expandedComments[post._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments[post._id] && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 20px', background: 'rgba(0,0,0,0.15)' }}>
                  {/* Existing comments */}
                  {post.comments?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                      {post.comments.map((comment, idx) => (
                        <div key={comment._id || idx} style={{ display: 'flex', gap: 10 }}>
                          <div className="avatar-small" style={{ width: 30, height: 30, flexShrink: 0 }}>
                            {comment.user?.avatarUrl
                              ? <img src={comment.user.avatarUrl} alt="commenter" />
                              : <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{comment.user?.firstName?.[0] || '?'}</span>
                            }
                          </div>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '8px 12px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{comment.user?.firstName} {comment.user?.lastName}</span>
                            <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: 8 }}>
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('tr-TR') : ''}
                            </span>
                            <p style={{ marginTop: 4, fontSize: '0.9rem', lineHeight: 1.5 }}>{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 14 }}>Henüz yorum yok. İlk yorumu sen yaz!</p>
                  )}

                  {/* Add comment */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="avatar-small" style={{ width: 30, height: 30, flexShrink: 0 }}>
                      {user?.avatarUrl ? <img src={user.avatarUrl} alt="me" /> : <UserIcon size={14} />}
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                      <input
                        className="input-field"
                        placeholder="Yorum yaz..."
                        style={{ padding: '8px 14px', fontSize: '0.875rem', background: 'rgba(255,255,255,0.03)' }}
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        disabled={submittingComment[post._id]}
                        style={{ padding: '8px 14px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="glass-panel text-center" style={{ padding: '60px 40px' }}>
              <MessageSquare size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p className="text-muted">
                {searchQuery || activeTag ? 'Arama kriterlerine uygun gönderi bulunamadı.' : 'Akışta henüz gönderi yok.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
