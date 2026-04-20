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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, catRes, badgesRes] = await Promise.all([
          api.get('/exam-results/stats'),
          api.get('/exam-results/category-stats'),
          api.get('/badges/my')
        ]);
        setStats(statsRes.data);
        setCatStats(catRes.data || []);
        setBadges(badgesRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
      <span className="text-text-muted text-xs uppercase tracking-widest font-bold">İstatistikler Hesaplanıyor...</span>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">İstatistiklerim</h1>
        <p className="text-text-secondary text-sm mt-1">Çalışma performansınızı ve ilerlemenizi takip edin.</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Sınav', value: stats?.totalExams || 0, icon: ClipboardList, color: 'text-primary-light', bg: 'bg-primary/10', border: 'border-primary/20' },
          { label: 'Başarı Oranı', value: `%${stats?.successRate || 0}`, icon: Target, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
          { label: 'Toplam Doğru', value: stats?.totalCorrect || 0, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
          { label: 'Günlük Seri', value: `${stats?.streak || 0} Gün`, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`glass-card p-5 rounded-3xl border ${card.border} flex flex-col gap-4`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-white mt-0.5">{card.value}</p>
            </div>
          </motion.div>
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

         <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 relative z-10">
            {badges.map((badge, idx) => (
              <motion.div 
                key={badge._id}
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex flex-col items-center text-center group/badge ${!badge.isEarned ? 'opacity-40 grayscale' : ''}`}
              >
                <div 
                  className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-3 relative shadow-2xl transition-all duration-500 ${badge.isEarned ? 'group-hover/badge:scale-110 group-hover/badge:rotate-6' : ''}`}
                  style={{ 
                    backgroundColor: badge.isEarned ? `${badge.color}15` : 'rgba(255,255,255,0.05)', 
                    border: `2px solid ${badge.isEarned ? badge.color + '40' : 'rgba(255,255,255,0.1)'}` 
                  }}
                >
                  {badge.isEarned && <div className="absolute inset-0 blur-xl opacity-30" style={{ backgroundColor: badge.color }}></div>}
                  <BadgeIcon name={badge.icon} className="w-8 h-8 relative z-10" style={{ color: badge.isEarned ? badge.color : '#666' }} />
                  {!badge.isEarned && <div className="absolute -top-1 -right-1 bg-bg-card border border-white/10 rounded-full p-1"><Clock className="w-2.5 h-2.5 text-text-muted" /></div>}
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
    </div>
  );
};

export default UserStats;
