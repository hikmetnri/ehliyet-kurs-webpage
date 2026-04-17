import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Clock, Lock, ChevronRight, 
  Loader2, BookOpen, Target, Zap, BarChart2,
  Play, CheckCircle2, ListChecks
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const UserExams = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | examId (category)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examRes, catRes] = await Promise.all([
          api.get('/exams'),
          api.get('/categories/all'),
        ]);
        const fetchedExams = examRes.data?.exams || examRes.data || [];
        setExams(fetchedExams);
        
        // Build category lookup
        const cats = catRes.data?.data || [];
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryName = (categoryId) => {
    if (!categoryId) return null;
    const cat = categories.find(c => c._id === (categoryId?._id || categoryId));
    return cat?.name || null;
  };

  // Group exams: null categoryId → deneme/mock, otherwise → category-specific
  const categoryExams = exams.filter(e => e.categoryId);
  const generalExams = exams.filter(e => !e.categoryId);

  const displayedExams = activeTab === 'all' ? exams : exams.filter(e => {
    const catId = e.categoryId?._id || e.categoryId;
    return catId === activeTab || (!e.categoryId && activeTab === 'general');
  });

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Sınav Merkezi</h1>
        <p className="text-text-secondary text-sm mt-1">Konu bazlı testler ve deneme sınavlarıyla kendinizi geliştirin.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <ListChecks className="w-8 h-8 text-primary-light shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Toplam Sınav</p>
            <p className="text-xl font-black text-white">{exams.length}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-400 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Konu Testleri</p>
            <p className="text-xl font-black text-white">{categoryExams.length}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <Target className="w-8 h-8 text-warning shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Deneme Sınavı</p>
            <p className="text-xl font-black text-white">{generalExams.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'general', label: '🎯 Deneme Sınavları' },
          ...Array.from(new Set(categoryExams.map(e => e.categoryId?._id || e.categoryId))).map(id => ({
            id,
            label: getCategoryName(id) || 'Kategori'
          }))
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === tab.id
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white/5 text-text-muted border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exam Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <span className="text-text-muted text-xs uppercase tracking-widest font-bold">Sınavlar Yükleniyor...</span>
        </div>
      ) : displayedExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-text-muted">
          <ClipboardList className="w-16 h-16 opacity-10 mb-4" />
          <p className="text-sm font-medium italic">Bu filtrede sınav bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedExams.map((exam, i) => {
            const isLocked = exam.isPro && !user?.proStatus;
            const catName = getCategoryName(exam.categoryId);
            const isGeneral = !exam.categoryId;

            return (
              <motion.div
                key={exam._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`glass-card p-6 rounded-3xl border flex flex-col gap-5 transition-all duration-300 ${
                  isLocked
                    ? 'border-warning/20 opacity-70'
                    : 'border-white/5 hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-1'
                }`}
              >
                {/* Top badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 ${
                    isGeneral
                      ? 'bg-warning/10 border-warning/30'
                      : 'bg-primary/10 border-primary/30'
                  }`}>
                    {isGeneral
                      ? <Target className="w-7 h-7 text-warning" />
                      : <BookOpen className="w-7 h-7 text-primary-light" />
                    }
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {isLocked && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 rounded text-[9px] font-black uppercase">
                        <Lock className="w-2.5 h-2.5" /> PRO
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                      isGeneral
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-primary/10 text-primary-light border-primary/20'
                    }`}>
                      {isGeneral ? 'Deneme' : 'Konu Testi'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-black text-base text-white tracking-tight leading-snug">{exam.name}</h3>
                  {catName && <p className="text-xs text-text-muted mt-1 font-medium">{catName}</p>}
                  {exam.description && (
                    <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed italic">{exam.description}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {exam.duration || 45} dk
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Çoktan Seçmeli
                  </div>
                </div>

                {/* CTA */}
                <button
                  disabled={isLocked}
                  onClick={() => navigate(`/dashboard/exams/${exam._id}`)}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    isLocked
                      ? 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
                      : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  {isLocked ? 'PRO Üyelik Gerekli' : 'Sınava Başla'}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserExams;
