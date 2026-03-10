import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Video as VideoIcon, Clock, ChevronRight, Lock } from 'lucide-react';
import api from '../../api';

const Videos = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoCategories();
  }, []);

  const fetchVideoCategories = async () => {
    try {
      const response = await api.get('/categories/all');
      const allCats = response.data.data || response.data;
      
      // Filter categories that contain the video tag: @[video](url)
      const videoCats = allCats.filter(cat => cat.content && cat.content.includes('@[video]'));
      setCategories(videoCats);
    } catch (err) {
      console.error('Error fetching video categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = (id) => {
    navigate(`/lessons/${id}`); 
  };

  if (loading) return <div className="dashboard-container">Yükleniyor...</div>;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Video Eğitimler</h2>
          <p className="text-muted">Uzman eğitmenlerimizden detaylı video dersleri izleyin.</p>
        </div>
      </div>

      {categories.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {categories.map((cat) => (
            <div 
              key={cat._id} 
              className="glass-panel" 
              style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => handleWatch(cat._id)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Thumbnail Area */}
              <div 
                style={{ 
                  height: 180, 
                  background: `linear-gradient(135deg, ${cat.color}88, ${cat.color})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                   <Play size={28} fill={cat.color} color={cat.color} style={{ marginLeft: 4 }} />
                </div>
                
                {cat.isPro && (
                  <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 8px', background: '#fbbf24', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800, color: '#000', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={12} /> PRO
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{cat.name}</h3>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.5, height: 40, overflow: 'hidden' }}>
                  {cat.description || 'Bu konuyla ilgili video dersi izleyerek öğreniminizi pekiştirin.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <VideoIcon size={14} /> Video Ders
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} /> 15-20 dk
                  </div>
                  <ChevronRight size={18} className="text-muted" style={{ marginLeft: 'auto' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel text-center" style={{ padding: '80px 40px' }}>
          <VideoIcon size={48} className="text-muted" style={{ margin: '0 auto 24px', opacity: 0.3 }} />
          <h3>Henüz Video Bulunmuyor</h3>
          <p className="text-muted">Yüklenen video eğitimler burada listelenecektir.</p>
        </div>
      )}
    </div>
  );
};

export default Videos;
