import React, { useEffect, useState } from 'react';
import api from '../../api';
import { 
  MessageSquare, 
  Heart, 
  MessageCircle, 
  Share2, 
  Send,
  MoreVertical,
  Plus
} from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/posts');
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      } else if (Array.isArray(response.data)) {
        setPosts(response.data);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      // Update local state for immediate feedback
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes.includes(user._id);
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== user._id)
              : [...post.likes, user._id]
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
      const response = await api.post('/posts', { content: newPost });
      setNewPost('');
      // In a real app, you might wait for admin approval if moderate is enabled
      // For now, let's assume it shows up or show a message
      alert('Gönderiniz başarıyla oluşturuldu! Moderatör onayından sonra yayınlanacaktır.');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  if (loading) return <div className="dashboard-container">Yükleniyor...</div>;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Topluluk Akışı</h2>
          <p className="text-muted">Diğer adaylarla bilgi paylaşın, sorular sorun.</p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Create Post */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 32 }}>
          <form onSubmit={handleSubmitPost}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div className="avatar-small" style={{ width: 44, height: 44 }}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="me" /> : <Plus size={20} />}
              </div>
              <textarea
                className="input-field"
                placeholder="Neler düşünüyorsun?"
                style={{ resize: 'none', height: 80, background: 'rgba(255,255,255,0.02)' }}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>
                Paylaş <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {posts.length > 0 ? posts.map(post => (
            <div key={post._id} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="avatar-small">
                    {post.user?.avatarUrl ? <img src={post.user.avatarUrl} alt="user" /> : <span>{post.user?.firstName?.[0]}</span>}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{post.user?.firstName} {post.user?.lastName}</h4>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <MoreVertical size={20} />
                </button>
              </div>

              <div style={{ padding: '0 20px 20px', fontSize: '1rem', lineHeight: 1.6 }}>
                {post.content}
                {post.media && <img src={post.media} alt="post media" style={{ width: '100%', borderRadius: 12, marginTop: 16, border: '1px solid var(--border-subtle)' }} />}
              </div>

              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 24 }}>
                <button 
                  onClick={() => handleLike(post._id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', 
                    color: post.likes?.includes(user._id) ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >
                  <Heart size={20} fill={post.likes?.includes(user._id) ? '#ef4444' : 'none'} />
                  <span>{post.likes?.length || 0}</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <MessageCircle size={20} />
                  <span>{post.comments?.length || 0}</span>
                </div>
                <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center" style={{ marginTop: 40 }}>
              <MessageSquare size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p className="text-muted">Akrışta henüz gönderi yok.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
