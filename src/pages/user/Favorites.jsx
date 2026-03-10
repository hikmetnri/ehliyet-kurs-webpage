import React, { useState, useEffect } from 'react';
import { Star, Trash2, ExternalLink, ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favorite_questions') || '[]');
    setFavorites(savedFavs);
  }, []);

  const removeFavorite = (id) => {
    const newFavs = favorites.filter(f => f.id !== id);
    setFavorites(newFavs);
    localStorage.setItem('favorite_questions', JSON.stringify(newFavs));
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Favorilerim</h2>
          <p className="text-muted">Önemli bulduğunuz ve tekrar çözmek istediğiniz sorular.</p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {favorites.map((fav) => (
            <div key={fav.id} className="glass-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ padding: 8, background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', borderRadius: 8 }}>
                    <Star size={20} fill="#fbbf24" />
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>{fav.category || 'Genel'}</span>
                </div>
                <button 
                  onClick={() => removeFavorite(fav.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 20 }}>{fav.text}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600 }}>
                   Doğru Cevap: {fav.correctAnswerText}
                </div>
                {fav.examId && (
                  <Link to={`/exam/${fav.examId}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>
                    Sınava Git <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel text-center" style={{ padding: '80px 40px' }}>
          <Star size={48} className="text-muted" style={{ margin: '0 auto 24px', opacity: 0.2 }} />
          <h3>Henüz Favori Yok</h3>
          <p className="text-muted">Sınav çözerken soruların yanındaki yıldız ikonuna tıklayarak buraya ekleyebilirsiniz.</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
