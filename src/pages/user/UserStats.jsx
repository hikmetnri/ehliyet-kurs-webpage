import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, BarChart2, Target, Clock, Award, ChevronRight, TrendingUp, ClipboardList, Star, Trophy, Zap, Crown, Shield, Gem, Medal, Rocket, Heart, Flame } from 'lucide-react';

const ICON_MAP = { Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart };

const BadgeIcon = ({ name, ...props }) => {
  const Icon = ICON_MAP[name] || Award;
  return <Icon {...props} />;
};
import useAuthStore from '../../store/authStore';

const UserStats = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [catStats, setCatStats] = useState([]);
  const [badges, setBadges] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'leaderboard'
  const [lbPeriod, setLbPeriod] = useState('all'); // 'daily' | 'weekly' | 'monthly' | 'all'
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, catRes, badgesRes, resultsRes] = await Promise.all([
          api.get('/exam-results/stats'),
          api.get('/exam-results/category-stats'),
          api.get('/badges/my'),
          api.get('/exam-results?limit=10')
        ]);
        setStats(statsRes.data);
        setCatStats(catRes.data || []);
        setBadges(badgesRes.data || []);
        setRecentResults(resultsRes.data?.data || resultsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLbLoading(true);
        const res = await api.get(`/exam-results/leaderboard?period=${lbPeriod}`);
        setLeaderboard(res.data?.data || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLbLoading(false);
      }
    };
    if (activeTab === 'leaderboard') fetchLeaderboard();
  }, [activeTab, lbPeriod]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
      <span className="text-text-muted text-xs uppercase tracking-widest font-bold">İstatistikler Hesaplanıyor...</span>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">İstatistiklerim</h1>
          <p className="text-text-secondary text-sm mt-1">Çalışma performansınızı ve ilerlemenizi takip edin.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
          {[
            { id: 'stats', label: 'Genel Özet', icon: BarChart2 },
            { id: 'leaderboard', label: 'Liderlik Tablosu', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' ? (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Main stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Toplam Sınav', value: stats?.totalExams || 0, icon: ClipboardList, color: 'text-primary-light', bg: 'bg-primary/10', border: 'border-primary/20' },
                { label: 'Başarı Oranı', value: `%${stats?.successRate || 0}`, icon: Target, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
                { label: 'Toplam Doğru', value: stats?.totalCorrect || 0, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                { label: 'Günlük Seri', value: `${stats?.streak || 0} Gün`, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
              ].map((card, i) => (
                <div 
                  key={i}
                  className={`glass-card p-5 rounded-3xl border ${card.border} flex flex-col gap-4`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{card.label}</p>
                    <p className="text-2xl font-black text-white mt-0.5">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pass/Fail Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-3xl border border-white/5">
                <h3 className="text-sm font-black text-white mb-5 uppercase tracking-widest">Sınav Sonuçları</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-xs font-bold text-text-muted">Geçilen</div>
                    <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.totalExams > 0 ? (stats.passedCount / stats.totalExams) * 100 : 0}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-success rounded-full"
                      />
                    </div>
                    <div className="text-sm font-black text-success w-8 text-right">{stats?.passedCount || 0}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-xs font-bold text-text-muted">Kaldığım</div>
                    <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.totalExams > 0 ? (stats.failedCount / stats.totalExams) * 100 : 0}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-danger rounded-full"
                      />
                    </div>
                    <div className="text-sm font-black text-danger w-8 text-right">{stats?.failedCount || 0}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-xs font-bold text-text-muted">Doğru</div>
                    <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.totalQuestions > 0 ? (stats.totalCorrect / stats.totalQuestions) * 100 : 0}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <div className="text-sm font-black text-primary-light w-8 text-right">{stats?.totalCorrect || 0}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-xs font-bold text-text-muted">Yanlış</div>
                    <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.totalQuestions > 0 ? (stats.totalWrong / stats.totalQuestions) * 100 : 0}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-warning rounded-full"
                      />
                    </div>
                    <div className="text-sm font-black text-warning w-8 text-right">{stats?.totalWrong || 0}</div>
                  </div>
                </div>
              </div>

              {/* Category stats */}
              <div className="glass-card p-6 rounded-3xl border border-white/5">
                <h3 className="text-sm font-black text-white mb-5 uppercase tracking-widest">Konu Bazlı Başarı</h3>
                {catStats.length === 0 ? (
                  <p className="text-text-muted text-sm italic text-center py-8">Henüz konu bazlı istatistiğiniz yok.</p>
                ) : (
                  <div className="space-y-4 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                    {catStats.map((c, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-white/80 truncate">{c.categoryName}</span>
                          <span className="font-black text-primary-light ml-2 shrink-0">%{c.successRate}</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.successRate}%` }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                            className={`h-full rounded-full ${c.successRate > 75 ? 'bg-success' : c.successRate > 50 ? 'bg-warning' : 'bg-danger'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Badges Section */}
            <div className="glass-card p-8 rounded-[40px] border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-400/5 blur-[80px] rounded-full"></div>
              <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Kazanılan Rozetler</h3>
                    <p className="text-xs text-text-muted font-bold mt-0.5">Başarılarınızın simgesi olan ödülleriniz.</p>
                  </div>
              </div>

              <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 relative z-10">
                  {badges.map((badge, idx) => (
                    <motion.div 
                      key={badge._id}
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedBadge(badge)}
                      className={`flex flex-col items-center text-center group/badge cursor-pointer ${!badge.isEarned ? 'opacity-40 grayscale hover:grayscale-0 transition-all' : ''}`}
                    >
                      <div 
                        className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-3 relative shadow-2xl transition-all duration-500 ${badge.isEarned ? 'group-hover/badge:scale-110 group-hover/badge:rotate-6 shadow-amber-500/10' : 'group-hover/badge:scale-105'}`}
                        style={{ 
                          backgroundColor: badge.isEarned ? `${badge.color}15` : 'rgba(255,255,255,0.05)', 
                          border: `2px solid ${badge.isEarned ? badge.color + '40' : 'rgba(255,255,255,0.1)'}` 
                        }}
                      >
                        {badge.isEarned && <div className="absolute inset-0 blur-xl opacity-30" style={{ backgroundColor: badge.color }}></div>}
                        <BadgeIcon name={badge.icon} className="w-8 h-8 relative z-10" style={{ color: badge.isEarned ? badge.color : '#666' }} />
                        {!badge.isEarned && <div className="absolute -top-1 -right-1 bg-bg-card border border-white/10 rounded-full p-1"><Shield className="w-2.5 h-2.5 text-text-muted" /></div>}
                      </div>
                      <h4 className={`text-[11px] font-black leading-tight ${badge.isEarned ? 'text-white' : 'text-text-muted'}`}>{badge.name}</h4>
                      {badge.isEarned ? (
                        <span className="text-[8px] font-bold text-amber-400 mt-1 uppercase tracking-tighter">
                          {new Date(badge.earnedAt).toLocaleDateString('tr-TR')}
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold text-text-muted/50 mt-1 uppercase tracking-tighter">Kilitli</span>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* Badge Detail Modal */}
            <AnimatePresence>
              {selectedBadge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedBadge(null)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-bg-card border border-white/10 rounded-[40px] overflow-hidden shadow-2xl shadow-black/50"
                  >
                    <div className="p-8 text-center flex flex-col items-center">
                      <div 
                        className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-6 relative shadow-2xl"
                        style={{ 
                          backgroundColor: `${selectedBadge.color}15`, 
                          border: `2px solid ${selectedBadge.color}40` 
                        }}
                      >
                        <div className="absolute inset-0 blur-2xl opacity-20" style={{ backgroundColor: selectedBadge.color }}></div>
                        <BadgeIcon name={selectedBadge.icon} className="w-12 h-12 relative z-10" style={{ color: selectedBadge.color }} />
                      </div>
                      
                      <h3 className="text-2xl font-black text-white tracking-tight mb-2">{selectedBadge.name}</h3>
                      
                      <div className="flex items-center gap-2 mb-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedBadge.isEarned ? 'bg-success/10 border-success/20 text-success' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                          {selectedBadge.isEarned ? '🏆 KAZANILDI' : '🔒 KİLİTLİ'}
                        </span>
                        {selectedBadge.isEarned && (
                          <span className="text-[10px] font-bold text-text-muted uppercase">
                            {new Date(selectedBadge.earnedAt).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6 w-full mb-8">
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                          {selectedBadge.description}
                        </p>
                      </div>
                      
                      {!selectedBadge.isEarned && (
                        <div className="w-full flex flex-col items-center gap-2 mb-4">
                           <p className="text-[10px] font-black text-primary-light uppercase tracking-widest">Gereksinim</p>
                           <p className="text-xs font-bold text-white">
                             {selectedBadge.type === 'exam_count' ? `${selectedBadge.requiredValue} Sınav Tamamla` :
                              selectedBadge.type === 'streak' ? `${selectedBadge.requiredValue} Günlük Seri Yap` :
                              selectedBadge.type === 'correct_count' ? `${selectedBadge.requiredValue} Doğru Cevaba Ulaş` :
                              selectedBadge.type === 'success_rate' ? `%${selectedBadge.requiredValue} Başarı Oranını Geç` :
                              `${selectedBadge.requiredValue} Günlük Hedefini Tamamla`}
                           </p>
                        </div>
                      )}

                      <button 
                        onClick={() => setSelectedBadge(null)}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/5"
                      >
                        Kapat
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Exam History Section */}
            <div className="glass-card p-6 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-primary-light" />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">Son Sınavlarım</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Sınav / Konu</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Tarih</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Doğru/Yanlış</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Puan</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentResults.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-text-muted text-sm italic">Henüz bir sınav sonucu bulunmuyor.</td>
                        </tr>
                      ) : (
                        recentResults.map((res, i) => (
                          <motion.tr 
                            key={res._id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">
                                  {res.examName || res.categoryName || 'Genel Deneme'}
                                </span>
                                <span className="text-[10px] text-text-muted uppercase tracking-tighter mt-0.5">
                                  {res.testType === 'short_test' ? 'Konu Testi' : res.testType === 'real_exam' ? 'Simülasyon' : 'Deneme Sınavı'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-xs text-text-secondary">
                                {new Date(res.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-xs font-bold text-success">{res.correctCount} D</span>
                                <span className="text-xs font-bold text-danger">{res.wrongCount} Y</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-sm font-black ${res.passed ? 'text-success' : 'text-danger'}`}>
                                %{res.score}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                res.passed 
                                  ? 'bg-success/10 border-success/20 text-success' 
                                  : 'bg-danger/10 border-danger/20 text-danger'
                              }`}>
                                {res.passed ? 'Geçti' : 'Kaldı'}
                              </span>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Leaderboard Header & Period Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">En Başarılı Sürücü Adayları</h3>
              <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
                {[
                  { id: 'all', label: 'Genel' },
                  { id: 'monthly', label: 'Aylık' },
                  { id: 'weekly', label: 'Haftalık' },
                  { id: 'daily', label: 'Günlük' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setLbPeriod(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      lbPeriod === p.id ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="glass-card rounded-[40px] border border-white/5 overflow-hidden">
               {lbLoading ? (
                 <div className="py-20 flex flex-col items-center justify-center">
                   <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                   <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Sıralama Güncelleniyor...</p>
                 </div>
               ) : leaderboard.length === 0 ? (
                 <div className="py-20 text-center text-text-muted text-sm italic">Bu dönem için henüz veri yok.</div>
               ) : (
                 <div className="divide-y divide-white/5">
                   {leaderboard.map((item, idx) => {
                     const isMe = item.userId === user?._id;
                     return (
                       <motion.div
                         key={item.userId}
                         initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                         className={`flex items-center gap-4 p-5 transition-colors ${isMe ? 'bg-primary/5' : 'hover:bg-white/[0.02]'}`}
                       >
                         {/* Rank */}
                         <div className="w-8 text-center shrink-0">
                           {idx === 0 ? <Crown className="w-6 h-6 text-amber-400 mx-auto" /> : 
                            idx === 1 ? <Medal className="w-5 h-5 text-slate-300 mx-auto" /> :
                            idx === 2 ? <Medal className="w-5 h-5 text-amber-700 mx-auto" /> :
                            <span className="text-xs font-black text-text-muted">{idx + 1}</span>}
                         </div>

                         {/* User Info */}
                         <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] shrink-0">
                               <div className="w-full h-full bg-bg-card rounded-[14px] flex items-center justify-center overflow-hidden">
                                  {item.avatarUrl ? (
                                    <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="font-black text-white text-sm">{(item.firstName || 'Ö').charAt(0)}</span>
                                  )}
                               </div>
                            </div>
                            <div className="min-w-0">
                               <p className={`text-sm font-bold truncate ${isMe ? 'text-primary-light' : 'text-white'}`}>
                                 {item.firstName} {item.lastName} {isMe && '(Sen)'}
                               </p>
                               <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Level {item.level || 1}</p>
                            </div>
                         </div>

                         {/* Stats */}
                         <div className="flex items-center gap-8 pr-4">
                            <div className="hidden sm:block text-center">
                               <p className="text-xs font-black text-white">{item.examCount || 0}</p>
                               <p className="text-[8px] font-bold text-text-muted uppercase">Sınav</p>
                            </div>
                            <div className="text-right min-w-[80px]">
                               <p className="text-base font-black text-primary-light leading-none">{item.totalPoints || 0}</p>
                               <p className="text-[8px] font-bold text-text-muted uppercase mt-1">Puan (XP)</p>
                            </div>
                         </div>
                       </motion.div>
                     );
                   })}
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserStats;
