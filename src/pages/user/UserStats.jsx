import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.025] border border-white/10 hover:border-white/15 transition-all">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} ${color} shrink-0 mb-2`}>
      <Icon className="w-4.5 h-4.5" />
    </div>
    <span className="text-sm font-black text-white leading-tight">{value}</span>
    <span className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tight line-clamp-1">{label}</span>
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]">
        <Icon className="h-5 w-5 text-primary-light" />
      </div>
      <div>
        <h3 className="text-base font-black tracking-tight text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs font-semibold text-text-muted">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const MetricTile = ({ icon: Icon, label, value, helper, color = 'text-white', bg = 'bg-white/[0.04]' }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
    </div>
    <p className={`mt-3 text-2xl font-black leading-none ${color}`}>{value}</p>
    {helper && <p className="mt-2 text-xs font-semibold leading-relaxed text-text-muted">{helper}</p>}
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
              const wrong = stats?.totalWrong || 0;
              const success = stats?.successRate || 0;
              const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
              const totalDuration = stats?.totalDuration || 0;
              const avgTime = stats?.avgTimePerQuestion || 0;
              
              const radius = 44;
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
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                  <section className={`rounded-3xl border ${heroBorderColor} bg-white/[0.025] p-5 sm:p-6`}>
                     <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
                        <svg width="112" height="112" viewBox="0 0 112 112">
                          <g transform="rotate(-90 56 56)">
                            <circle
                              cx="56"
                              cy="56"
                              r={radius}
                              className="fill-none stroke-white/10"
                              strokeWidth={strokeWidth}
                            />
                            <motion.circle
                              cx="56"
                              cy="56"
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
                          </g>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 min-w-0">
                          <span className="block text-2xl font-black text-white leading-none tracking-tighter whitespace-nowrap">%{accuracy}</span>
                          <span className="mt-1 block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-text-muted leading-none whitespace-nowrap">Doğruluk</span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${heroBgColor} ${heroBorderColor} ${heroColor}`}>
                            {accuracy >= 70 ? 'Sınava Yakınsın' : accuracy >= 45 ? 'Tekrar Alanı Açık' : 'Çalışmaya Başla'}
                          </span>
                          <span className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                            %{Math.round(success)} sınav başarısı
                          </span>
                        </div>
                        <h2 className="mt-4 text-2xl font-black tracking-tight text-white">Performans Özeti</h2>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-secondary">
                          {stats?.totalExams || 0} sınavda {totalQ} soru çözüldü. Doğru-yanlış dağılımı ve süre bilgileri aşağıdaki panellerde toplanıyor.
                        </p>

                        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${goalBg} ${goalColor}`}>
                                {isGoalComplete ? <CheckCircle2 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Günlük Hedef</p>
                                <p className="mt-0.5 text-sm font-black text-white">{todayQ}/{dailyGoal} soru</p>
                              </div>
                            </div>
                            <span className={`rounded-xl border px-2.5 py-1 text-[10px] font-black ${goalBg} ${goalBorder} ${goalColor}`}>
                              %{goalProgressPct}
                            </span>
                          </div>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
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
                  </section>

                  <section className="grid grid-cols-2 gap-3">
                    <MetricTile icon={ClipboardList} label="Sınav" value={stats?.totalExams || 0} helper={`${stats?.passedCount || 0} geçildi`} color="text-primary-light" bg="bg-primary/10" />
                    <MetricTile icon={BookOpen} label="Soru" value={totalQ} helper={`${correct} doğru, ${wrong} yanlış`} color="text-accent-light" bg="bg-accent/10" />
                    <MetricTile icon={Flame} label="Seri" value={`${stats?.streak || 0} gün`} helper="çalışma devamlılığı" color="text-warning" bg="bg-warning/10" />
                    <MetricTile icon={Clock} label="Süre" value={formatDuration(totalDuration)} helper={`${avgTime || 0}sn / soru`} color="text-success" bg="bg-success/10" />
                  </section>
                </div>
              );
            })()}

            {/* Performans Grafiği */}
            {(() => {
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
                <div className="glass-card rounded-3xl border border-white/10 p-4 sm:p-6">
                  <SectionHeader
                    icon={BarChart2}
                    title="Performans Grafiği"
                    subtitle={chartData.length > 0 ? `Son ${chartData.length} sınavdaki başarı eğrisi` : 'İlk sınavdan sonra başarı eğrisi burada oluşur'}
                    action={chartData.length > 0 && (
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-success" />Geçti</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-danger" />Kaldı</span>
                      </div>
                    )}
                  />
                  {chartData.length === 0 ? (
                    <EmptyAction
                      icon={PlayCircle}
                      title="Grafik için sınav sonucu gerekiyor"
                      text="Bir deneme veya konu testi çözdüğünde puan değişimin burada görsel olarak izlenir."
                      action="Sınavlara Git"
                      to="/dashboard/exams"
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={v => `%${v}`}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                          contentStyle={{
                            background: '#101017',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '14px',
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
                        <ReferenceLine y={70} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" label={{ value: 'Geçme Sınırı %70', position: 'insideTopRight', fill: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700 }} />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={42}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.passed ? 'rgba(16,185,129,0.85)' : 'rgba(239,68,68,0.78)'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              );
            })()}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.75fr)]">
              <div className="space-y-6">
                {/* Sınav ve Soru Özeti */}
                <div className="glass-card p-5 rounded-3xl border border-white/10 sm:p-6">
                  <SectionHeader
                    icon={ClipboardList}
                    title="Sınav ve Soru Özeti"
                    subtitle="Temel çözüm hacmi ve geçme durumu"
                  />
                  {(() => {
                    const totalE = stats?.totalExams || 0;
                    const passed = stats?.passedCount || 0;
                    const failed = stats?.failedCount || 0;
                    const totalQ = stats?.totalQuestions || 0;
                    const correct = stats?.totalCorrect || 0;
                    const wrong = stats?.totalWrong || 0;

                    return (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                <div className="glass-card p-5 rounded-3xl border border-white/10 sm:p-6">
                  <SectionHeader
                    icon={Target}
                    title="İleri Düzey Analiz"
                    subtitle="Doğruluk, süre ve XP sinyalleri"
                  />
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
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
              <div className="glass-card p-5 rounded-3xl border border-white/10 sm:p-6">
                <SectionHeader
                  icon={BookOpen}
                  title="Konu Bazlı Başarı"
                  subtitle="Hangi alanda güçlenmen gerektiğini gösterir"
                />
                {catStats.length === 0 ? (
                  <EmptyAction
                    icon={BookOpen}
                    title="Konu verisi oluşmadı"
                    text="Bir konu testi çözdüğünde güçlü ve zayıf alanların burada görünür."
                    action="Konu Testi Çöz"
                    to="/dashboard/lessons"
                  />
                ) : (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
                    {catStats.map((c, i) => (
                      <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                        <div className="mb-3 flex items-center justify-between gap-3 text-xs">
                          <span className="truncate font-bold text-white/90">{c.categoryName}</span>
                          <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black ${
                            c.successRate > 75 ? 'bg-success/10 text-success' : c.successRate > 50 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                          }`}>%{c.successRate}</span>
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
            <div className="glass-card rounded-3xl border border-white/10 p-5 sm:p-6">
              <SectionHeader
                icon={Award}
                title="Kazanılan Rozetler"
                subtitle="Başarılarınızın simgesi olan ödüller"
                action={<span className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted">{badges.filter(b => b.isEarned).length}/{badges.length}</span>}
              />

              {badges.length === 0 ? (
                <EmptyAction
                  icon={Award}
                  title="Henüz rozet verisi yok"
                  text="Sınav çözdükçe ve hedef tamamladıkça kazanılabilecek rozetler burada görünür."
                  action="Sınav Çöz"
                  to="/dashboard/exams"
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 xs:grid-cols-3 sm:grid-cols-4 sm:gap-5 md:grid-cols-6 lg:grid-cols-8">
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
              )}
            </div>

            {/* Badge Detail Modal */}
            {createPortal(
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
              </AnimatePresence>,
              document.body
            )}

            {/* Exam History Section */}
            <div className="glass-card rounded-3xl border border-white/10 p-4 sm:p-6">
                <SectionHeader
                  icon={ClipboardList}
                  title="Son Sınavlarım"
                  subtitle={recentResults.length > 0 ? `${recentResults.length} son kayıt listeleniyor` : 'İlk sonuçtan sonra geçmiş burada oluşur'}
                />

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
