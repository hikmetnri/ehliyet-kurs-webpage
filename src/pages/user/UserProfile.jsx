import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as UserIcon, Award, Target, Zap, Calendar, ChevronLeft, Trophy, MessageSquare } from 'lucide-react';
import api from '../../api';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [userRes, statsRes, postsRes] = await Promise.allSettled([
        api.get(`/users/${userId}`),
        api.get(`/exam-results/stats?userId=${userId}`),
        api.get(`/posts?userId=${userId}`),
      ]);

      if (userRes.status === 'fulfilled') {
        setProfileUser(userRes.value.data?.data || userRes.value.data);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }
      if (postsRes.status === 'fulfilled') {
        const p = postsRes.value.data?.posts || postsRes.value.data;
        setPosts(Array.isArray(p) ? p : []);
      }
    } catch (err) {
      console.error('UserProfile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: 100 }}>
        <UserIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
        <p className="text-muted">Yükleniyor...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: 100 }}>
        <UserIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
        <h3>Kullanıcı bulunamadı</h3>
        <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => navigate(-1)}>
          <ChevronLeft size={18} /> Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 32, fontSize: '0.9rem' }}
      >
        <ChevronLeft size={18} /> Geri
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32 }}>
        {/* Left: Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%', margin: '0 auto 20px',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '4px solid var(--border-subtle)'
            }}>
              {profileUser.avatarUrl
                ? <img src={profileUser.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <UserIcon size={52} color="white" />
              }
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{profileUser.firstName} {profileUser.lastName}</h3>
            <p className="text-muted" style={{ marginBottom: 20, fontSize: '0.9rem' }}>{profileUser.bio || 'Henüz biyografi eklenmemiş.'}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, padding: 12, background: 'rgba(59,130,246,0.1)', borderRadius: 12 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{profileUser.level || 1}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>SEVİYE</div>
              </div>
              <div style={{ flex: 1, padding: 12, background: 'rgba(16,185,129,0.1)', borderRadius: 12 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>{profileUser.totalScore || 0}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>PUAN</div>
              </div>
            </div>

            {profileUser.proStatus && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', background: 'linear-gradient(135deg, #fbbf2420, #fbbf2440)', borderRadius: 12, border: '1px solid #fbbf2460', color: '#fbbf24', fontWeight: 800, fontSize: '0.875rem' }}>
                <Award size={18} /> MachPRO ÜYESİ
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={18} color="#fbbf24" /> İstatistikler
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: <Zap size={16} />, label: 'Toplam Sınav', value: stats?.totalExams || 0 },
                { icon: <Target size={16} />, label: 'Doğru Cevap', value: stats?.totalCorrect || 0 },
                { icon: <Trophy size={16} />, label: 'Başarı Oranı', value: `%${stats?.successRate || 0}` },
                {
                  icon: <Calendar size={16} />, label: 'Üyelik Tarihi',
                  value: profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('tr-TR') : '-'
                },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
                    {icon} {label}
                  </div>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Posts */}
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={22} /> Gönderileri
          </h3>
          {posts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {posts.map(post => (
                <div key={post._id} className="glass-panel" style={{ padding: 24 }}>
                  <p style={{ lineHeight: 1.6, marginBottom: 16 }}>{post.content}</p>
                  {post.media && (
                    <img src={post.media} alt="media" style={{ width: '100%', borderRadius: 12, marginBottom: 16, border: '1px solid var(--border-subtle)' }} />
                  )}
                  <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <span>❤️ {post.likes?.length || 0} beğeni</span>
                    <span>💬 {post.comments?.length || 0} yorum</span>
                    <span style={{ marginLeft: 'auto' }}>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel text-center" style={{ padding: '60px 40px' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p className="text-muted">Bu kullanıcının henüz paylaşımı yok.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
