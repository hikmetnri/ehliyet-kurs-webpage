import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, BarChart2, Target, Clock, Award, ChevronRight, TrendingUp, ClipboardList, Star, Trophy, Zap, Crown, Shield, Gem, Medal, Rocket, Heart, Flame, Search, BookOpen, PlayCircle, CheckCircle2, XCircle, HelpCircle, AlertCircle, Percent } from 'lucide-react';
import ExamDetailModal from '../../components/user/ExamDetailModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const ICON_MAP = { Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart };

const BadgeIcon = ({ name, ...props }) => {
  const Icon = ICON_MAP[name] || Award;
  return <Icon {...props} />;
};
import useAuthStore from '../../store/authStore';

const EmptyAction = ({ icon: Icon, title, text, action, to }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-4 py-8 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
      <Icon className="h-5 w-5 text-primary-light" />
    </div>
    <h4 className="text-sm font-black text-white">{title}</h4>
    <p className="mt-2 max-w-xs text-xs font-semibold leading-relaxed text-text-muted">{text}</p>
    <Link
      to={to}
      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-light transition hover:bg-primary/20"
    >
      {action}
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0dk';
  if (seconds < 60) return `${seconds}sn`;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    const remMin = minutes % 60;
    return remMin > 0 ? `${hours}sa ${remMin}dk` : `${hours}sa`;
  }
  return `${minutes}dk`;
};

const MiniStat = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${bg} ${color} shrink-0 mb-2`}>
      <Icon className="w-4.5 h-4.5" />
    </div>
    <span className="text-sm font-black text-white leading-tight">{value}</span>
    <span className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tight line-clamp-1">{label}</span>
  </div>
);

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
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, catRes, badgesRes, resultsRes] = await Promise.allSettled([
          api.get('/exam-results/stats'),
          api.get('/exam-results/category-stats'),
          api.get('/badges/my'),
          api.get('/exam-results?limit=10')
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (catRes.status === 'fulfilled') setCatStats(catRes.value.data || []);
        if (badgesRes.status === 'fulfilled') setBadges(badgesRes.value.data || []);
        if (resultsRes.status === 'fulfilled') {
          const data = resultsRes.value.data;
          setRecentResults(data?.data || data || []);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
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
    <div className="space-y-6 pb-10 sm:space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">İstatistiklerim</h1>
          <p className="text-text-secondary text-sm mt-1">Çalışma performansınızı ve ilerlemenizi takip edin.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-1 custom-scrollbar sm:w-fit">
          {[
            { id: 'stats', label: 'Genel Özet', icon: BarChart2 },
            { id: 'leaderboard', label: 'Liderlik Tablosu', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-widest transition-all sm:px-4 sm:text-xs ${
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
            {/* Detailed Analytics Header & Goals */}
            {(() => {
              const totalQ = stats?.totalQuestions || 0;
              const correct = stats?.totalCorrect || 0;
              const success = stats?.successRate || 0;
              const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
              
              const radius = 34;
              const strokeWidth = 6;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (accuracy / 100) * circumference;
              
              const heroColor = accuracy >= 70
                ? 'text-success'
                : accuracy >= 45
                ? 'text-warning'
                : 'text-primary-light';

              const heroBgColor = accuracy >= 70
                ? 'bg-success/10'
                : accuracy >= 45
                ? 'bg-warning/10'
                : 'bg-primary/10';

              const heroBorderColor = accuracy >= 70
                ? 'border-success/20'
                : accuracy >= 45
                ? 'border-warning/20'
                : 'border-primary/20';

              const strokeColorHex = accuracy >= 70
                ? '#22c55e'
                : accuracy >= 45
                ? '#f97316'
                : '#6366f1';

              const todayQ = stats?.todayQuestions || 0;
              const dailyGoal = stats?.dailyGoal || 20;
              const goalProgress = dailyGoal > 0 ? Math.min(1, todayQ / dailyGoal) : 0;
              const isGoalComplete = todayQ >= dailyGoal;
              const goalProgressPct = Math.round(goalProgress * 100);
              
              const goalColor = isGoalComplete ? 'text-success' : 'text-primary-light';
              const goalBg = isGoalComplete ? 'bg-success/10' : 'bg-primary/10';
              const goalBorder = isGoalComplete ? 'border-success/20' : 'border-primary/20';

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Hero Card */}
                  <div className={`lg:col-span-2 p-6 rounded-[32px] border ${heroBorderColor} bg-gradient-to-br from-white/[0.03] to-white/[0.01] flex flex-col xs:flex-row items-center gap-6 relative overflow-hidden`}>
                    <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 blur-[50px] rounded-full pointer-events-none"></div>
                    
                    {/* SVG Circular Accuracy Progress */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r={radius}
                          className="stroke-white/10 fill-none"
                          strokeWidth={strokeWidth}
                        />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r={radius}
                          className="fill-none"
                          stroke={strokeColorHex}
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-base font-black text-white">%{accuracy}</span>
                    </div>

                    <div className="flex-1 text-center xs:text-left">
                      <h2 className="text-xl font-black text-white tracking-tight">Performans Özeti</h2>
                      <p className="text-xs text-text-secondary leading-relaxed mt-2 font-semibold">
                        {stats?.totalExams || 0} sınav, {stats?.totalQuestions || 0} soru ve %{Math.round(success)} genel sınav başarısı elde ettiniz.
                      </p>
                      <span className={`inline-block mt-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${heroBgColor} ${heroBorderColor} ${heroColor}`}>
                        {accuracy >= 70 ? 'Sınava Yakınsın' : accuracy >= 45 ? 'Tekrar Alanı Açık' : 'Çalışmaya Başla'}
                      </span>
                    </div>
                  </div>

                  {/* Streak & Daily Goal Column */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {/* Streak Card */}
                    <div className="p-4 rounded-2xl border border-white/5 bg-bg-card flex items-center gap-4 shadow-lg shadow-black/10">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-warning/10 text-warning shrink-0">
                        <Flame className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Çalışma Serisi</p>
                        <p className="text-lg font-black text-white mt-0.5">{stats?.streak || 0} Gün</p>
                      </div>
                    </div>

                    {/* Daily Goal Card */}
                    <div className="p-4 rounded-2xl border border-white/5 bg-bg-card flex flex-col justify-center gap-3 shadow-lg shadow-black/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${goalBg} ${goalColor}`}>
                            {isGoalComplete ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Günlük Soru</p>
                            <p className="text-xs font-black text-white mt-0.5">{todayQ}/{dailyGoal}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-xl text-[9px] font-black border ${goalBg} ${goalBorder} ${goalColor}`}>
                          %{goalProgressPct}
                        </span>
                      </div>
                      
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goalProgressPct}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full rounded-full ${isGoalComplete ? 'bg-success' : 'bg-primary'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Performans Grafiği */}
            {recentResults.length > 0 && (() => {
              const chartData = [...recentResults]
                .reverse()
                .slice(-10)
                .map((r, i) => ({
                  name: new Date(r.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
                  score: r.score || 0,
                  passed: r.passed,
                  label: r.examName || r.categoryName || `Sınav ${i+1}`,
                }));
              return (
                <div className="glass-card rounded-3xl border border-white/5 p-4 sm:p-6">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-primary-light" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">Performans Grafiği</h3>
                      <p className="text-xs text-text-muted font-bold mt-0.5">Son {chartData.length} sınavdaki başarı eğrisi</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest sm:ml-auto">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-success inline-block"></span>Geçti</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-danger inline-block"></span>Kaldı</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `%${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a2e',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                        formatter={(value, name, props) => [
                          `%${value}`,
                          props.payload.label
                        ]}
                        labelFormatter={() => ''}
                      />
                      <ReferenceLine y={70} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" label={{ value: 'Geçme Sınırı %70', position: 'insideTopRight', fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700 }} />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.passed ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.7)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Sınav ve Soru Özeti */}
                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-[#171927]/60">
                  <h3 className="text-sm font-black text-white mb-5 uppercase tracking-widest flex items-center gap-2">
                    <ClipboardList className="w-4.5 h-4.5 text-primary-light" />
                    Sınav ve Soru Özeti
                  </h3>
                  {(() => {
                    const totalE = stats?.totalExams || 0;
                    const passed = stats?.passedCount || 0;
                    const failed = stats?.failedCount || 0;
                    const totalQ = stats?.totalQuestions || 0;
                    const correct = stats?.totalCorrect || 0;
                    const wrong = stats?.totalWrong || 0;

                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <MiniStat icon={ClipboardList} label="Toplam Sınav" value={totalE} color="text-primary-light" bg="bg-primary/10" />
                        <MiniStat icon={Trophy} label="Geçilen" value={passed} color="text-success" bg="bg-success/10" />
                        <MiniStat icon={XCircle} label="Kalan" value={failed} color="text-text-muted" bg="bg-white/5" />
                        <MiniStat icon={BookOpen} label="Toplam Soru" value={totalQ} color="text-indigo-400" bg="bg-indigo-500/10" />
                        <MiniStat icon={CheckCircle2} label="Doğru" value={correct} color="text-success" bg="bg-success/10" />
                        <MiniStat icon={AlertCircle} label="Yanlış" value={wrong} color="text-warning" bg="bg-warning/10" />
                      </div>
                    );
                  })()}
                </div>

                {/* İleri Düzey Analiz */}
                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-[#171927]/60">
                  <h3 className="text-sm font-black text-white mb-5 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-4.5 h-4.5 text-primary-light" />
                    İleri Düzey Analiz
                  </h3>
                  {(() => {
                    const totalQ = stats?.totalQuestions || 0;
                    const correct = stats?.totalCorrect || 0;
                    const wrong = stats?.totalWrong || 0;
                    const success = stats?.successRate || 0;
                    const totalScore = stats?.totalScore || 0;
                    const totalDuration = stats?.totalDuration || 0;
                    const avgTime = stats?.avgTimePerQuestion || 0;

                    const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
                    const skipped = Math.max(0, totalQ - (correct + wrong));

                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <MiniStat icon={Percent} label="Sınav Başarısı" value={`%${success}`} color="text-primary-light" bg="bg-primary/10" />
                        <MiniStat icon={Target} label="Doğruluk" value={`%${accuracy}`} color="text-success" bg="bg-success/10" />
                        <MiniStat icon={HelpCircle} label="Boş/Atlanan" value={skipped} color="text-text-muted" bg="bg-white/5" />
                        <MiniStat icon={Clock} label="Çalışma Süresi" value={formatDuration(totalDuration)} color="text-indigo-400" bg="bg-indigo-500/10" />
                        <MiniStat icon={Zap} label="Soru Başı Hız" value={`${avgTime}sn`} color="text-warning" bg="bg-warning/10" />
                        <MiniStat icon={Award} label="Toplam Puan" value={totalScore} color="text-amber-400" bg="bg-amber-400/10" />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Category stats */}
              <div className="glass-card p-6 rounded-3xl border border-white/5">
                <h3 className="text-sm font-black text-white mb-5 uppercase tracking-widest">Konu Bazlı Başarı</h3>
                {catStats.length === 0 ? (
                  <EmptyAction
                    icon={BookOpen}
                    title="Konu verisi oluşmadı"
                    text="Bir konu testi çözdüğünde güçlü ve zayıf alanların burada görünür."
                    action="Konu Testi Çöz"
                    to="/dashboard/lessons"
                  />
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
            <div className="glass-card group relative overflow-hidden rounded-3xl border border-white/5 p-5 sm:p-8 lg:rounded-[40px]">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-400/5 blur-[80px] rounded-full"></div>
              <div className="mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Kazanılan Rozetler</h3>
                    <p className="text-xs text-text-muted font-bold mt-0.5">Başarılarınızın simgesi olan ödülleriniz.</p>
                  </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 xs:grid-cols-3 sm:grid-cols-4 sm:gap-6 md:grid-cols-6 lg:grid-cols-8">
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
                    <div className="flex max-h-[90vh] flex-col items-center overflow-y-auto p-6 text-center custom-scrollbar sm:p-8">
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
                              selectedBadge.type === 'question_count' ? `${selectedBadge.requiredValue} Soru Çöz` :
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
            <div className="glass-card rounded-3xl border border-white/5 p-4 sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-primary-light" />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">Son Sınavlarım</h3>
                  </div>
                </div>

                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[720px] text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Sınav / Konu</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Tarih</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Doğru/Yanlış</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Puan</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Durum</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Detay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentResults.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8">
                            <EmptyAction
                              icon={PlayCircle}
                              title="Henüz sınav sonucun yok"
                              text="İlk denemeni çözdükten sonra puan, doğru-yanlış ve detaylar burada listelenir."
                              action="Sınavlara Git"
                              to="/dashboard/exams"
                            />
                          </td>
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
                                  {res.testType === 'short_test'
                                    ? 'Konu Testi'
                                    : res.testType === 'real_exam'
                                      ? 'Simülasyon'
                                      : res.testType === 'wrong_review' || res.testType === 'wrong_answers'
                                        ? 'Yanlış Tekrarı'
                                        : 'Deneme Sınavı'}
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
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                res.passed 
                                  ? 'bg-success/10 border-success/20 text-success' 
                                  : 'bg-danger/10 border-danger/20 text-danger'
                              }`}>
                                {res.passed ? 'Geçti' : 'Kaldı'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => setSelectedResult(res)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary-light text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105"
                              >
                                <Search className="w-3 h-3" />
                                İncele
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="block md:hidden space-y-3">
                  {recentResults.length === 0 ? (
                    <EmptyAction
                      icon={PlayCircle}
                      title="Henüz sınav sonucun yok"
                      text="İlk denemeni çözdükten sonra puan, doğru-yanlış ve detaylar burada listelenir."
                      action="Sınavlara Git"
                      to="/dashboard/exams"
                    />
                  ) : (
                    recentResults.map((res, i) => (
                      <motion.div 
                        key={res._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl border border-white/5 bg-bg-card flex flex-col gap-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-xs font-black text-white block">
                              {res.examName || res.categoryName || 'Genel Deneme'}
                            </span>
                            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-0.5 block">
                              {res.testType === 'short_test'
                                ? 'Konu Testi'
                                : res.testType === 'real_exam'
                                  ? 'Simülasyon'
                                  : res.testType === 'wrong_review' || res.testType === 'wrong_answers'
                                    ? 'Yanlış Tekrarı'
                                    : 'Deneme Sınavı'}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            res.passed 
                              ? 'bg-success/10 border-success/20 text-success' 
                              : 'bg-danger/10 border-danger/20 text-danger'
                          }`}>
                            {res.passed ? 'Geçti' : 'Kaldı'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Doğru/Yanlış</p>
                              <p className="text-xs font-black text-white mt-0.5">
                                <span className="text-success">{res.correctCount}D</span>
                                <span className="text-text-muted mx-0.5">·</span>
                                <span className="text-danger">{res.wrongCount}Y</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Puan</p>
                              <p className={`text-xs font-black mt-0.5 ${res.passed ? 'text-success' : 'text-danger'}`}>
                                %{res.score}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Tarih</p>
                              <p className="text-xs font-semibold text-text-secondary mt-0.5">
                                {new Date(res.createdAt).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedResult(res)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary-light text-[9px] font-black uppercase tracking-wider transition-all"
                          >
                            <Search className="w-3 h-3" />
                            İncele
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
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
              <div className="flex w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1 custom-scrollbar sm:w-fit">
                {[
                  { id: 'all', label: 'Genel' },
                  { id: 'monthly', label: 'Aylık' },
                  { id: 'weekly', label: 'Haftalık' },
                  { id: 'daily', label: 'Günlük' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setLbPeriod(p.id)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase transition-all ${
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
                 <div className="p-6">
                   <EmptyAction
                     icon={Trophy}
                     title="Bu dönem sıralama boş"
                     text="Sınav çözen öğrenciler oldukça liderlik tablosu burada hareketlenir."
                     action="Sınav Çöz"
                     to="/dashboard/exams"
                   />
                 </div>
               ) : (
                 <div className="divide-y divide-white/5">
                   {leaderboard.map((item, idx) => {
                     const isMe = String(item.userId) === String(user?._id);
                     return (
                       <motion.div
                         key={item.userId}
                         initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                         className={`flex items-center gap-3 p-4 transition-colors sm:gap-4 sm:p-5 ${isMe ? 'bg-primary/5' : 'hover:bg-white/[0.02]'}`}
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
                         <div className="flex items-center gap-3 pr-0 sm:gap-8 sm:pr-4">
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

      {/* Sınav Detay Modalı */}
      {selectedResult && (
        <ExamDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

export default UserStats;
