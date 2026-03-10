import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Video, 
  FileText, 
  ChevronRight,
  PlayCircle,
  Download
} from 'lucide-react';
import api from '../../api';

const LessonReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await api.get(`/categories/${id}`);
        const catData = catRes.data.data || catRes.data;
        setCategory(catData);

        // Extract video URL if exists: @[video](url)
        const videoMatch = catData.content?.match(/@\[video\]\((.*?)\)/);
        if (videoMatch && videoMatch[1]) {
          setVideoUrl(videoMatch[1]);
        } else {
          setVideoUrl(null);
        }

        // Fetch children (subcategories)
        const childRes = await api.get(`/categories?parent=${id}`);
        setChildren(childRes.data.data || childRes.data);
      } catch (err) {
        console.error('Error fetching category detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Function to get clean content without the video tag
  const getCleanContent = (content) => {
    if (!content) return '';
    return content.replace(/@\[video\]\((.*?)\)/g, '').trim();
  };

  if (loading) return <div className="dashboard-container">Yükleniyor...</div>;
  if (!category) return <div className="dashboard-container">Kategori bulunamadı.</div>;

  return (
    <div className="dashboard-container animate-fade-in">
      <div style={{ marginBottom: 32 }}>
         <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: 12, marginBottom: 20 }}>
            <ArrowLeft size={18} /> Geri Dön
         </button>
         
         <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div 
              style={{ 
                width: 64, height: 64, borderRadius: 16, background: category.color || 'var(--primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                boxShadow: `0 8px 24px ${category.color}44`
              }}
            >
               <BookOpen size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '2.5rem' }}>{category.name}</h2>
              <p className="text-muted">{category.description}</p>
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32 }}>
        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
           <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              {videoUrl && (
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}>
                   <video 
                     src={videoUrl} 
                     controls 
                     style={{ width: '100%', height: '100%' }}
                   />
                </div>
              )}

              <div style={{ padding: 40 }}>
                 <div className="reader-header" style={{ marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <FileText color="var(--primary)" />
                       <h3 style={{ fontSize: '1.5rem' }}>Konu Anlatımı</h3>
                    </div>
                 </div>

                 <div className="lesson-content" style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    {category.content ? (
                      <div dangerouslySetInnerHTML={{ __html: getCleanContent(category.content) }} />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                         <p>Bu kategori için henüz detaylı konu anlatımı eklenmemiş.</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>

           <div style={{ display: 'flex', gap: 16 }}>
               <button 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => {
                  if (videoUrl) {
                    document.querySelector('video')?.scrollIntoView({ behavior: 'smooth' });
                    document.querySelector('video')?.play();
                  } else {
                    alert('Bu ders için henüz video eklenmemiş.');
                  }
                }}
               >
                  <Video size={18} /> Video Dersi İzle
               </button>
               <button 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => alert('PDF indirme özelliği yakında eklenecektir.')}
               >
                  <Download size={18} /> PDF İndir
               </button>
           </div>
        </div>

        {/* Sidebar Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
           <div className="glass-panel" style={{ padding: 24 }}>
              <h4 style={{ marginBottom: 20, fontSize: '1.1rem' }}>Alt Başlıklar</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {children.length > 0 ? children.map(child => (
                   <Link 
                    key={child._id} 
                    to={`/lessons/${child._id}`} 
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, padding: 14, 
                      background: 'rgba(255,255,255,0.03)', borderRadius: 12, 
                      textDecoration: 'none', color: 'var(--text-main)', border: '1px solid var(--border-subtle)',
                      transition: 'all 0.2s'
                    }}
                   >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: child.color || 'var(--primary)' }} />
                      <span style={{ flex: 1, fontSize: '0.95rem' }}>{child.name}</span>
                      <ChevronRight size={16} className="text-muted" />
                   </Link>
                 )) : (
                   <div className="text-muted" style={{ textAlign: 'center', padding: 20 }}>Alt başlık bulunmuyor.</div>
                 )}
              </div>
           </div>

           <div className="glass-panel" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))' }}>
              <h4 style={{ marginBottom: 12 }}>Hızlı Test</h4>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 20 }}>Bu konuyu pekiştirmek için hazırladığımız özel testi çözün.</p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', borderRadius: 12 }}
                onClick={() => navigate(`/exam/quick/${id}`)}
              >
                 Teste Başla <PlayCircle size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LessonReader;
