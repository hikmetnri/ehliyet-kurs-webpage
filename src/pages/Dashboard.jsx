import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, AlertCircle, PlayCircle, Trophy, Flame, Target } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [examRes, statsRes] = await Promise.all([
          api.get('/exams'),
          api.get('/exam-results/stats')
        ]);

        // Handle Exams
        if (Array.isArray(examRes.data)) {
          setExams(examRes.data);
        } else if (examRes.data && examRes.data.data) {
          setExams(examRes.data.data);
        }

        // Handle Stats
        setStats(statsRes.data);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Fallback mockup exams if backend is offline or empty
        setExams([
          { _id: 'mock-1', title: 'Ehliyet Çıkmış Sorular 1', questionCount: 50, duration: 45, type: 'exam' },
          { _id: 'mock-2', title: 'Ehliyet Çıkmış Sorular 2', questionCount: 50, duration: 45, type: 'exam' },
          { _id: 'mock-3', title: 'İlk Yardım Testi', questionCount: 20, duration: 20, type: 'quiz' },
          { _id: 'mock-4', title: 'Trafik ve Çevre Bilgisi', questionCount: 25, duration: 25, type: 'quiz' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleStartExam = (id) => {
    navigate(`/exam/${id}`);
  };

  if (loading) {
    return <div className="dashboard-container" style={{ textAlign: 'center', marginTop: 100 }}>Yükleniyor...</div>;
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Sınav Merkezi</h2>
          <p className="text-muted">Gelişiminizi görmek için sınav çözmeye başlayın.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ padding: 12, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, color: 'var(--primary)' }}>
            <Trophy size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.successRate || 0}%</div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Başarı Oranı</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, color: 'var(--secondary)' }}>
            <Flame size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.streak || 0} Gün</div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Çalışma Serisi</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, color: '#ef4444' }}>
            <Target size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalCorrect || 0} / {stats?.totalQuestions || 0}</div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Toplam Doğru</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.5rem' }}>Deneme Sınavları</h3>
      </div>

      <div className="exam-grid">
        {exams.length > 0 ? exams.map(exam => (
          <div key={exam._id} className="exam-card glass-panel" onClick={() => handleStartExam(exam._id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, color: 'var(--primary)' }}>
                 {exam.isPro ? <AlertCircle size={24} /> : <BookOpen size={24} />}
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>{exam.name || exam.title}</h3>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
              {exam.description || (exam.isPro ? 'Pro deneme sınavı.' : 'Standart deneme sınavı')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              <div className="exam-info" style={{ marginTop: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={16}/> {exam.questionCount || 50} Soru</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16 }}><Clock size={16}/> {exam.duration || 45} Dk.</span>
              </div>
              {exam.isPro && <span style={{ color: '#fbbf24', fontSize: '12px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>PRO</span>}
              <PlayCircle color="var(--primary)" size={24} />
            </div>
          </div>
        )) : (
          <p>Henüz sistemde hiç sınav bulunmuyor.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
