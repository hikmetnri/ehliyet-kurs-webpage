import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { motion } from 'framer-motion';
import { 
  BookOpen, ClipboardList, Target, Flame, 
  TrendingUp, ArrowRight, Star, Zap, Award
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const UserHome = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, catRes] = await Promise.all([
          api.get('/exam-results/stats'),
          api.get('/categories')
        ]);
        setStats(statsRes.data);
        setCategories((catRes.data?.categories || catRes.data || []).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  return (
    <div className="space-y-8 pb-10">
      
      {/* Hero Welcome */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-primary/20 p-8"
      >
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-warning" />
            <span className="text-warning text-xs font-black uppercase tracking-widest">
              {stats?.streak > 0 ? `🔥 ${stats.streak} Günlük Seri!` : 'Seriye Başla!'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            {greeting}, {user?.firstName}! 👋
          </h1>
          <p className="text-text-secondary text-base max-w-lg">
            Ehliyet sınavına bir adım daha yaklaşmak için bugün çalışmaya devam et.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <Link 
              to="/dashboard/lessons"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
            >
              <BookOpen className="w-4 h-4" /> Ders Çalış
            </Link>
            <Link 
              to="/dashboard/exams"
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl font-black text-sm border border-white/10 hover:bg-white/15 transition-all"
            >
              <ClipboardList className="w-4 h-4" /> Sınav Çöz
            </Link>
          </div>
        </div>

        {/* XP / Level Widget */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white/10">
            <div className="text-center">
              <div className="text-xl font-black text-white leading-none">{user?.level || 1}</div>
              <div className="text-[9px] text-white/70 font-bold uppercase">LVL</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-white font-black text-sm">{user?.totalScore || 0}</div>
            <div className="text-[10px] text-primary-light font-bold">XP</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Çözülen Sınav', value: loading ? '-' : stats?.totalExams || 0, icon: ClipboardList, color: 'text-primary-light', bg: 'bg-primary/10', border: 'border-primary/20' },
          { label: 'Başarı Oranı', value: loading ? '-' : `%${stats?.successRate || 0}`, icon: Target, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
          { label: 'Doğru Cevap', value: loading ? '-' : stats?.totalCorrect || 0, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
          { label: 'Günlük Seri', value: loading ? '-' : `${stats?.streak || 0} Gün`, icon: Flame, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`glass-card p-5 rounded-3xl border ${card.border} flex flex-col gap-4 hover:-translate-y-1 transition-transform`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color} border ${card.border}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-white mt-0.5">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Categories Quick Access */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-white">Konu Kategorileri</h2>
            <p className="text-xs text-text-muted mt-1">Hangi konuyu öğrenmek istersin?</p>
          </div>
          <Link to="/dashboard/lessons" className="flex items-center gap-1.5 text-xs font-black text-primary-light hover:text-white transition-colors uppercase tracking-wider">
            Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.length > 0 ? (
            categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={`/dashboard/lessons?category=${cat._id}`}
                  className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-start gap-4 hover:border-primary/30 hover:bg-primary/5 transition-all group block"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-2xl">
                    {cat.image ? (
                      <img src={cat.image} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary-light" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white group-hover:text-primary-light transition-colors">{cat.name}</h3>
                    {cat.lessonCount > 0 && (
                      <p className="text-[10px] text-text-muted mt-1 font-medium">{cat.lessonCount} ders</p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary-light group-hover:translate-x-1 transition-all mt-auto" />
                </Link>
              </motion.div>
            ))
          ) : !loading ? (
            <div className="col-span-4 text-center py-10 text-text-muted italic text-sm">Henüz kategori eklenmemiş.</div>
          ) : (
            [0,1,2,3].map(i => (
              <div key={i} className="h-40 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse" />
            ))
          )}
        </div>
      </div>

      {/* Daily Goal Progress */}
      {stats && (
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
            <Star className="w-7 h-7 text-warning" />
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-black text-white">Günlük Hedef</h3>
                <p className="text-xs text-text-muted mt-0.5">{stats.todayQuestions || 0} / {stats.dailyGoal || 20} soru çözüldü</p>
              </div>
              <span className="text-warning font-black text-sm">{Math.min(100, Math.round(((stats.todayQuestions || 0) / (stats.dailyGoal || 20)) * 100))}%</span>
            </div>
            <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((stats.todayQuestions || 0) / (stats.dailyGoal || 20)) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-warning to-primary rounded-full shadow-lg"
              />
            </div>
          </div>
          <Link to="/dashboard/exams" className="flex items-center gap-2 px-5 py-3 bg-warning/10 border border-warning/20 text-warning rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-warning hover:text-white transition-all whitespace-nowrap">
            <TrendingUp className="w-4 h-4" /> Hedefe Ulaş
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserHome;
