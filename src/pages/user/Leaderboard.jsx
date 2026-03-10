import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Calendar, Star } from 'lucide-react';
import api from '../../api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); // 'all' | 'weekly' | 'monthly'
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/exam-results/leaderboard?period=${period}`);
      const data = res.data?.data || res.data || [];
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      // Fallback mock data
      setLeaderboard([
        { _id: '1', firstName: 'Ahmet', lastName: 'Y.', totalScore: 9850, successRate: 94, totalExams: 28, proStatus: true },
        { _id: '2', firstName: 'Elif', lastName: 'K.', totalScore: 8720, successRate: 89, totalExams: 24, proStatus: true },
        { _id: '3', firstName: 'Mehmet', lastName: 'A.', totalScore: 7940, successRate: 85, totalExams: 22, proStatus: false },
        { _id: '4', firstName: 'Ayşe', lastName: 'D.', totalScore: 7100, successRate: 82, totalExams: 19, proStatus: false },
        { _id: '5', firstName: 'Can', lastName: 'S.', totalScore: 6500, successRate: 78, totalExams: 17, proStatus: true },
        { _id: '6', firstName: 'Zeynep', lastName: 'B.', totalScore: 5800, successRate: 75, totalExams: 14, proStatus: false },
        { _id: '7', firstName: 'Emre', lastName: 'T.', totalScore: 5200, successRate: 72, totalExams: 13, proStatus: false },
        { _id: '8', firstName: 'Selin', lastName: 'M.', totalScore: 4750, successRate: 69, totalExams: 12, proStatus: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 0) return <Crown size={24} color="#FFD700" />;
    if (rank === 1) return <Medal size={22} color="#C0C0C0" />;
    if (rank === 2) return <Medal size={22} color="#CD7F32" />;
    return <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-muted)' }}>#{rank + 1}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 0) return 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))';
    if (rank === 1) return 'linear-gradient(135deg, rgba(192,192,192,0.1), rgba(192,192,192,0.03))';
    if (rank === 2) return 'linear-gradient(135deg, rgba(205,127,50,0.1), rgba(205,127,50,0.03))';
    return 'rgba(255,255,255,0.02)';
  };

  const getRankBorder = (rank) => {
    if (rank === 0) return '1px solid rgba(255,215,0,0.4)';
    if (rank === 1) return '1px solid rgba(192,192,192,0.3)';
    if (rank === 2) return '1px solid rgba(205,127,50,0.3)';
    return '1px solid var(--border-subtle)';
  };

  const isCurrentUser = (entry) =>
    currentUser && (entry._id === currentUser._id || entry.email === currentUser.email);

  const myRank = leaderboard.findIndex(e => isCurrentUser(e));

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Trophy color="#FFD700" size={32} /> Liderlik Tablosu
          </h2>
          <p className="text-muted">En başarılı adayları keşfet ve sıralamanda yüksel!</p>
        </div>
      </div>

      {/* Period Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        {[
          { key: 'all', label: 'Tüm Zamanlar', icon: <Trophy size={16} /> },
          { key: 'monthly', label: 'Bu Ay', icon: <Calendar size={16} /> },
          { key: 'weekly', label: 'Bu Hafta', icon: <TrendingUp size={16} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
              background: period === key ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: period === key ? 'white' : 'var(--text-muted)',
              boxShadow: period === key ? '0 0 20px rgba(59,130,246,0.4)' : 'none',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* My Rank Banner */}
      {myRank >= 0 && (
        <div className="glass-panel" style={{
          padding: '20px 24px', marginBottom: 32,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))',
          border: '1px solid rgba(59,130,246,0.3)',
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <Star color="#fbbf24" size={24} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Kendi Sıralamanız</div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
              Şu an <strong style={{ color: 'var(--primary)' }}>#{myRank + 1}.</strong> sıradasınız — 
              {myRank > 0 ? ` ${myRank} kişiyi geçmek için biraz daha çalışın!` : ' Harika, zirvadesiniz! 🏆'}
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {!loading && leaderboard.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 40, padding: '0 5%' }}>
          {/* 2nd */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: 70, height: 70, borderRadius: '50%', margin: '0 auto 12px',
              background: 'rgba(192,192,192,0.2)', border: '3px solid #C0C0C0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 800, color: '#C0C0C0'
            }}>
              {leaderboard[1]?.firstName?.[0]}{leaderboard[1]?.lastName?.[0]}
            </div>
            <div style={{ fontWeight: 700 }}>{leaderboard[1]?.firstName} {leaderboard[1]?.lastName}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>{leaderboard[1]?.totalScore?.toLocaleString()} puan</div>
            <div style={{ background: 'rgba(192,192,192,0.1)', border: '1px solid #C0C0C0', borderRadius: '12px 12px 0 0', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Medal size={28} color="#C0C0C0" />
            </div>
          </div>
          {/* 1st */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <Crown size={28} color="#FFD700" style={{ margin: '0 auto 8px' }} />
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
              background: 'rgba(255,215,0,0.2)', border: '3px solid #FFD700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 800, color: '#FFD700'
            }}>
              {leaderboard[0]?.firstName?.[0]}{leaderboard[0]?.lastName?.[0]}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{leaderboard[0]?.firstName} {leaderboard[0]?.lastName}</div>
            <div style={{ fontSize: '0.85rem', marginBottom: 8, color: '#FFD700', fontWeight: 600 }}>{leaderboard[0]?.totalScore?.toLocaleString()} puan</div>
            <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid #FFD700', borderRadius: '12px 12px 0 0', height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={36} color="#FFD700" />
            </div>
          </div>
          {/* 3rd */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: 70, height: 70, borderRadius: '50%', margin: '0 auto 12px',
              background: 'rgba(205,127,50,0.2)', border: '3px solid #CD7F32',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 800, color: '#CD7F32'
            }}>
              {leaderboard[2]?.firstName?.[0]}{leaderboard[2]?.lastName?.[0]}
            </div>
            <div style={{ fontWeight: 700 }}>{leaderboard[2]?.firstName} {leaderboard[2]?.lastName}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>{leaderboard[2]?.totalScore?.toLocaleString()} puan</div>
            <div style={{ background: 'rgba(205,127,50,0.1)', border: '1px solid #CD7F32', borderRadius: '12px 12px 0 0', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Medal size={24} color="#CD7F32" />
            </div>
          </div>
        </div>
      )}

      {/* Full List */}
      {loading ? (
        <div className="text-center" style={{ padding: 60 }}>
          <Trophy size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p className="text-muted">Yükleniyor...</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {leaderboard.map((entry, idx) => (
            <div
              key={entry._id || idx}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 24px',
                background: isCurrentUser(entry) ? 'rgba(59,130,246,0.08)' : getRankBg(idx),
                border: isCurrentUser(entry) ? '1px solid rgba(59,130,246,0.4)' : 'none',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ width: 36, display: 'flex', justifyContent: 'center' }}>
                {getRankIcon(idx)}
              </div>

              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: idx === 0 ? 'rgba(255,215,0,0.2)' : idx === 1 ? 'rgba(192,192,192,0.2)' : idx === 2 ? 'rgba(205,127,50,0.2)' : 'rgba(59,130,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1rem', overflow: 'hidden'
              }}>
                {entry.avatarUrl
                  ? <img src={entry.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : `${entry.firstName?.[0] || ''}${entry.lastName?.[0] || ''}`
                }
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {entry.firstName} {entry.lastName}
                  {isCurrentUser(entry) && (
                    <span style={{ fontSize: '0.7rem', background: 'rgba(59,130,246,0.2)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>Siz</span>
                  )}
                  {entry.proStatus && (
                    <span style={{ fontSize: '0.7rem', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>PRO</span>
                  )}
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 2 }}>
                  {entry.totalExams || 0} sınav tamamlandı
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--text-main)' }}>
                  {(entry.totalScore || 0).toLocaleString()}
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>%{entry.successRate || 0} başarı</div>
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <Trophy size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p className="text-muted">Henüz bu dönemde sınav çözülmemiş.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
