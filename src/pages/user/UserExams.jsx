import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Clock, Lock, ChevronRight, 
  Loader2, BookOpen, Target, Zap, BarChart2,
  Play, CheckCircle2, ListChecks, AlertCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const UserExams = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [validCategories, setValidCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('short_tests'); // 'short_tests' | 'general' | 'real_sim_cat' | examId
  const [collapsedGroups, setCollapsedGroups] = useState({}); // Grup aç/kapa state'i

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Tüm kategorileri çek
        const catRes = await api.get('/categories/all');
        const allCategories = catRes.data?.data || catRes.data || [];

        // Belirli bir parent'ın tüm alt çocuklarını bul (Recursive)
        const getDescendants = (parentId) => {
           const children = allCategories.filter(c => {
             const pId = c.parent?._id || c.parent;
             return pId === parentId;
           });
           let desc = [...children];
           children.forEach(child => {
              desc = [...desc, ...getDescendants(child._id)];
           });
           return desc;
        }

        const userDescendants = user?.selectedCategoryId ? getDescendants(user.selectedCategoryId) : [];
        const validCatIds = [user?.selectedCategoryId, ...userDescendants.map(c => c._id)].filter(Boolean);

        // İçeriği olan alt konu başlıklarını bul (Kısa test üretmek için)
        const lessonCategories = userDescendants.filter(c => c.content && c.content.trim().length > 0);

        // Her konu/içerik kategorisi için otomatik, sentetik bir Mini Test oluştur
        const syntheticExams = lessonCategories.map(cat => ({
          _id: `short_${cat._id}`,
          name: `${cat.name} Mini Test`,
          description: 'İlgili konuyu pekiştirmen için özel hazırlanan değerlendirme testi.',
          categoryId: cat._id,
          duration: 5,
          isMiniTest: true,
          isPro: false,
          _isSynthetic: true,
          _realCategoryId: cat._id
        }));

        // Tüm sınavları getir
        const examRes = await api.get('/exams');
        const allExams = examRes.data?.exams || examRes.data || [];

        // "Gerçek MEB E-Sınav Simülatörü" oluştur
        const syntheticMebExam = {
          _id: `real_sim_${user?.selectedCategoryId}`,
          name: `MEB E-Sınav Simülatörü`,
          description: 'Belirlediğiniz ehliyet sınıfının tüm müfredatından rastgele 50 soru. Anında cevap göremezsiniz, gerçek MEB formatındadır.',
          categoryId: 'real_sim_cat',
          duration: 45,
          isMiniTest: false,
          isPro: false,
          _isRealMeb: true,
        };

        // Filtreleme: Ya sınavın kategorisi null (Genel Deneme), ya da kullanıcının alt test kısımlarında.
        const filteredExams = allExams.filter(e => {
           if (!e.categoryId) return true; // Genel Deneme
           const cid = e.categoryId?._id || e.categoryId;
           return validCatIds.includes(cid);
        });

        // Testleri listeye ekle
        setValidCategories(allCategories);
        setExams([...filteredExams, ...syntheticExams, syntheticMebExam]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.selectedCategoryId]);

  const getCategoryName = (categoryId) => {
    if (!categoryId) return null;
    const cid = categoryId?._id || categoryId;
    const cat = validCategories.find(c => c._id === cid);
    return cat?.name || 'Sınıflandırılmamış';
  };

  const getParentName = (categoryId) => {
    if (!categoryId) return 'Genel';
    const cid = categoryId?._id || categoryId;
    const cat = validCategories.find(c => c._id === cid);
    if (!cat || !cat.parent) return 'Sınıflandırılmamış';
    const pId = typeof cat.parent === 'object' ? cat.parent._id : cat.parent;
    const pCat = validCategories.find(c => c._id === pId);
    return pCat?.name || 'Diğer Ana Konular';
  };

  const categoryExams = exams.filter(e => e.categoryId);
  const generalExams = exams.filter(e => !e.categoryId);

  const displayedExams = exams.filter(e => {
    const catId = e.categoryId?._id || e.categoryId;
    
    if (activeTab === 'general') return !catId && !e._isSynthetic && !e._isRealMeb;
    if (activeTab === 'short_tests') return e._isSynthetic;
    if (activeTab === 'real_sim_cat') return e._isRealMeb;
    
    return catId === activeTab && !e._isSynthetic && !e._isRealMeb;
  });

  // Ekran render kontrolü
  if (!user?.selectedCategoryId) {
    return (
       <div className="flex flex-col items-center justify-center py-32 text-text-muted text-center px-4">
          <AlertCircle className="w-16 h-16 opacity-20 mb-4" />
          <h2 className="text-xl font-black text-white mb-2 tracking-tight">Eğitim Paketi Seçilmedi</h2>
          <p className="font-medium text-sm mb-6 max-w-md">Sınavları görebilmek için lütfen ana sayfadan ehliyet sınıfı seçiminizi yapınız.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary px-8">Ana Sayfaya Dön</button>
       </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 text-white">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Sınav Merkezi</h1>
        <p className="text-text-muted text-sm font-medium">Şu anda <span className="text-primary-light font-black uppercase tracking-widest">{user?.selectedCategoryName}</span> sınıfı için özel test ve denemeleri görüyorsunuz.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 flex items-center gap-5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
             <ListChecks className="w-7 h-7 text-primary-light" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tighter leading-none">{exams.length}</p>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Toplam Sınav</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
             <BookOpen className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tighter leading-none">{categoryExams.length}</p>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Konu Testi</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center">
             <Target className="w-7 h-7 text-warning" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tighter leading-none">{generalExams.length}</p>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Genel Deneme</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 flex-wrap">
        {[
          { id: 'short_tests', label: '⚡ KISA TESTLER' },
          { id: 'real_sim_cat', label: '🎓 MEB E-SINAV' },
          { id: 'general', label: '🎯 GENEL DENEMELER' },
          ...Array.from(new Set(categoryExams.filter(e => !e._isSynthetic && !e._isRealMeb).map(e => e.categoryId?._id || e.categoryId))).map(id => {
            const cName = getCategoryName(id);
            return {
              id,
              label: cName ? cName.toUpperCase() : 'BİLİNMEYEN'
            }
          }).filter(t => t.label !== 'BİLİNMEYEN')
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === tab.id
                ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105'
                : 'bg-white/5 text-text-muted border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exam Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <span className="text-text-muted text-[10px] uppercase tracking-widest font-black">Sınavlar Yükleniyor...</span>
        </div>
      ) : displayedExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center glass-card rounded-[3rem] border border-dashed border-white/10">
          <ClipboardList className="w-16 h-16 text-text-muted opacity-30 mb-6" />
          <p className="text-lg font-black text-white tracking-tight mb-2">Bu alanda sınav bulunamadı</p>
          <p className="text-sm font-medium text-text-muted max-w-sm">Seçtiğiniz kategoriye ait sınav içerikleri kısa süre içinde admin tarafından eklenecektir.</p>
        </div>
      ) : (() => {
        const renderExamCard = (exam, i) => {
          const isLocked = exam.isPro && !user?.proStatus;
          const catName = getCategoryName(exam.categoryId);
          const isGeneral = !exam.categoryId;

          return (
            <motion.div
              layout
              key={exam._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-8 rounded-[2.5rem] border flex flex-col gap-6 transition-all duration-300 relative overflow-hidden group ${
                isLocked
                  ? 'border-warning/20 opacity-80'
                  : 'border-white/5 hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10'
              }`}
            >
              {/* Dekoratif Gradient Arka Plan Işığı */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] pointer-events-none rounded-full group-hover:bg-primary/10 transition-colors" />

              {/* Top badges */}
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 shrink-0 shadow-lg ${
                  isGeneral
                    ? 'bg-warning/10 border-warning/30 shadow-warning/10 text-warning group-hover:bg-warning group-hover:text-white transition-colors'
                    : 'bg-primary/10 border-primary/30 shadow-primary/10 text-primary-light group-hover:bg-primary group-hover:text-white transition-colors'
                }`}>
                  {isGeneral ? <Target className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isLocked && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-warning/10">
                      <Lock className="w-3 h-3" /> PRO ÜYELİK
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    isGeneral
                      ? 'bg-warning/10 text-warning border-warning/20'
                      : exam._isSynthetic 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-primary/10 text-primary-light border-primary/20'
                  }`}>
                    {isGeneral ? 'Meb Deneme Sınavı' : exam._isRealMeb ? 'E-Sınav Simülatörü' : exam._isSynthetic ? 'Hızlı Mini Test' : 'Konu Sınavı'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 relative z-10">
                <h3 className="font-black text-xl tracking-tight leading-tight mb-2 group-hover:text-primary-light transition-colors">{exam.name}</h3>
                {catName && <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mb-3">{catName}</p>}
                {exam.description && (
                  <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">{exam.description}</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 py-4 mt-auto border-y border-white/5 relative z-10 text-[11px] font-black text-text-muted uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary-light" /> {exam.duration || 45} Dakika
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-warning" /> Çoktan Seçmeli
                </div>
              </div>

              {/* CTA */}
              <button
                disabled={isLocked}
                onClick={() => navigate(
                   exam._isRealMeb ? `/dashboard/exams/real-test/${user?.selectedCategoryId}` :
                   exam._isSynthetic ? `/dashboard/exams/short-test/${exam._realCategoryId}` : 
                   `/dashboard/exams/${exam._id}`
                )}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all relative z-10 ${
                  isLocked
                    ? 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
                    : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 group-hover:bg-white group-hover:text-black group-hover:shadow-white/20'
                }`}
              >
                <Play className="w-5 h-5" />
                {isLocked ? 'KİLİDİ AÇ' : 'TESTİ BAŞLAT'}
              </button>
            </motion.div>
          );
        };

        // Eğer Kısa Testler seçiliyse modüllere (Üst Kategorilere) göre gruplandır:
        if (activeTab === 'short_tests') {
          const groupedExams = displayedExams.reduce((acc, exam) => {
            const groupName = getParentName(exam.categoryId);
            if (!acc[groupName]) acc[groupName] = [];
            acc[groupName].push(exam);
            return acc;
          }, {});

          return (
            <div className="space-y-8">
              <AnimatePresence>
                {Object.entries(groupedExams).map(([groupName, groupExams]) => {
                  const isCollapsed = collapsedGroups[groupName];
                  return (
                    <motion.div key={groupName} layout className="filter drop-shadow-sm">
                      <div 
                        className="flex items-center gap-4 cursor-pointer group mb-4"
                        onClick={() => setCollapsedGroups(prev => ({...prev, [groupName]: !prev[groupName]}))}
                      >
                         <h2 className="text-lg md:text-xl font-black text-white px-5 py-3 bg-white/5 border border-white/10 rounded-2xl tracking-tight inline-flex items-center gap-3 group-hover:bg-white/10 transition-colors">
                            <BookOpen className="w-5 h-5 text-primary-light"/> {groupName} Modülü
                            <motion.div animate={{ rotate: isCollapsed ? 0 : 90 }} transition={{ type: 'spring', bounce: 0.4 }}>
                               <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" />
                            </motion.div>
                         </h2>
                         <div className="flex-1 h-px bg-white/10 shadow-sm" />
                      </div>

                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2 pb-6">
                              {groupExams.map((exam, i) => renderExamCard(exam, i))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          );
        }

        // Değilse standart grid olarak göster
        return (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayedExams.map((exam, i) => renderExamCard(exam, i))}
            </AnimatePresence>
          </motion.div>
        );
      })()}
    </div>
  );
};

export default UserExams;
