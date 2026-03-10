import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  Lock,
  Play
} from 'lucide-react';

const Lessons = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/all');
      const allData = response.data.data || response.data;
      
      if (Array.isArray(allData)) {
        // Main categories (those without a parent)
        const main = allData.filter(c => !c.parent);
        
        // Add subCategories field to each main category
        const mapped = main.map(parent => ({
          ...parent,
          subCategories: allData.filter(c => c.parent && (c.parent._id === parent._id || c.parent === parent._id))
        }));
        
        setCategories(mapped);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-container">Yükleniyor...</div>;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Eğitim İçerikleri</h2>
          <p className="text-muted">Konulara göre ayrılmış ders notları ve videolar.</p>
        </div>
      </div>

      <div className="features" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', padding: 0, gap: 24, maxWidth: '100%' }}>
        {categories.map((category) => (
          <div key={category._id} className="glass-panel" style={{ padding: 24, transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div 
                style={{ 
                  width: 52, height: 52, borderRadius: 14, background: category.color || 'var(--primary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' 
                }}
              >
                 <BookOpen size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem' }}>{category.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                   <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', flex: 1, borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${category.progress || 0}%`, background: category.color || 'var(--primary)', borderRadius: 3 }} />
                   </div>
                   <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>%{category.progress || 0}</span>
                </div>
              </div>
            </div>

            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 20, lineHeight: 1.5 }}>
              {category.description || 'Bu kategori altındaki ders notlarını inceleyerek sınavlara hazırlanın.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {category.subCategories?.length > 0 ? category.subCategories.slice(0, 3).map(sub => (
                 <div 
                    key={sub._id} 
                    onClick={() => navigate(`/lessons/${sub._id}`)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, padding: 12, 
                      background: 'rgba(255,255,255,0.02)', borderRadius: 10, fontSize: '0.875rem',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    className="subcategory-item"
                 >
                    <div style={{ color: sub.isCompleted ? 'var(--secondary)' : 'var(--text-muted)' }}>
                      {sub.isCompleted ? <CheckCircle2 size={16} /> : <Play size={16} />}
                    </div>
                    <span>{sub.name}</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                 </div>
               )) : (
                 <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10, fontSize: '0.875rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Henüz alt konu eklenmemiş.
                 </div>
               )}
            </div>

            <button 
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: 24, borderRadius: 12 }}
              onClick={() => navigate(`/lessons/${category._id}`)}
            >
              Derslere Başla <ChevronRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lessons;
