import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Trash2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api';

const Mistakes = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    try {
      const response = await api.get('/wrong-answers');
      if (response.data && response.data.data) {
        setMistakes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching mistakes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (questionId) => {
    if (!window.confirm('Bu soruyu havuzdan çıkarmak istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/wrong-answers/${questionId}`);
      setMistakes(mistakes.filter(m => m.questionId !== questionId));
    } catch (err) {
      console.error('Error removing mistake:', err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="dashboard-container">Yükleniyor...</div>;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Yanlış Sorularım</h2>
          <p className="text-muted">Daha önce yanlış cevapladığınız soruları burada tekrar inceleyebilirsiniz.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {mistakes.length > 0 ? mistakes.map((item, idx) => (
          <div key={item._id} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div 
              style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
              onClick={() => toggleExpand(item._id)}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <AlertCircle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.questionText.substring(0, 80)}...</h4>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{item.categoryName || 'Genel'} • {item.wrongCount} kez yanlış yapıldı</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <button 
                  onClick={(e) => { e.stopPropagation(); handleRemove(item.questionId); }}
                  className="btn-outline" 
                  style={{ padding: 8, borderRadius: 8, border: 'none', color: 'var(--text-muted)' }}
                 >
                    <Trash2 size={18} />
                 </button>
                 {expandedId === item._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {expandedId === item._id && (
              <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ padding: '24px 0', fontSize: '1.1rem', lineHeight: 1.6 }}>
                   {item.questionText}
                </div>
                
                <div className="options-list" style={{ pointerEvents: 'none' }}>
                  {item.options.map((option, oIdx) => {
                    const isCorrect = oIdx === item.correctAnswer;
                    const isUserChoice = oIdx === item.userAnswer;
                    
                    return (
                      <div 
                        key={oIdx} 
                        className={`option-btn ${isCorrect ? 'correct' : ''} ${isUserChoice && !isCorrect ? 'wrong' : ''}`}
                        style={{ background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : isUserChoice ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)' }}
                      >
                         <span className="option-letter">{['A', 'B', 'C', 'D'][oIdx]}</span>
                         <span style={{ flex: 1 }}>{option}</span>
                         {isCorrect && <CheckCircle2 size={18} color="var(--secondary)" />}
                         {isUserChoice && !isCorrect && <XCircle size={18} color="#ef4444" />}
                      </div>
                    );
                  })}
                </div>

                {item.explanation && (
                  <div style={{ marginTop: 24, padding: 20, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 12, borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>Çözüm Açıklaması</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', opacity: 0.9 }}>{item.explanation}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="glass-panel text-center" style={{ padding: '80px 40px' }}>
            <CheckCircle2 size={48} color="var(--secondary)" style={{ margin: '0 auto 24px', opacity: 0.3 }} />
            <h3>Harika Gidiyorsunuz!</h3>
            <p className="text-muted">Henüz havuzda hiç yanlış cevabınız bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mistakes;
