import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Truck, Bike, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';

// İkon eşleştirme tablosu
const iconMap = {
  'Car': Car,
  'Truck': Truck,
  'Bike': Bike,
  'car_hatchback': Car,
  'bicycle': Bike,
  'forklift': Truck,
};

const CategorySelectorModal = ({ isOpen, onClose }) => {
  const [dbCategories, setDbCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { user, setAuth, token } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          setFetchLoading(true);
          const res = await api.get('/categories');
          const data = res.data?.data || res.data;
          // Sadece parent'ı olmayan ana kategorileri al
          setDbCategories((Array.isArray(data) ? data : []).filter(c => !c.parent));
        } catch (err) {
          console.error("Kategoriler yüklenemedi:", err);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  const handleQuickSelect = async (cat) => {
    setSelectedCat(cat._id);
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        selectedCategoryId: cat._id,
        selectedCategoryName: cat.name
      });
      
      if (res.data.success) {
        setAuth({ ...user, ...res.data.user }, token);
      }
      onClose();
    } catch (err) {
      console.error('Kategori kaydedilemedi:', err);
      onClose(); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-dark/90 backdrop-blur-xl px-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-3xl bg-bg-card rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[100px]" />
            
            <div className="p-8 md:p-12 relative z-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 transform rotate-3">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Eğitim Türünü Belirle</h2>
              <p className="text-text-muted font-medium mb-12 max-w-md mx-auto leading-relaxed">
                Platformu sana özel hale getirebilmemiz için hazırlık yaptığın ehliyet sınıfını seçmelisin.
              </p>

              {fetchLoading ? (
                <div className="flex flex-col items-center py-10">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Kategoriler Yükleniyor...</p>
                </div>
              ) : dbCategories.length === 0 ? (
                <div className="py-10 text-warning flex flex-col items-center">
                   <AlertCircle className="w-12 h-12 mb-4" />
                   <p className="font-bold">Henüz kategori eklenmemiş!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                  {dbCategories.map((cat) => {
                    const isSelected = selectedCat === cat._id;
                    const Icon = iconMap[cat.icon] || ShieldCheck;
                    return (
                      <button
                        key={cat._id}
                        onClick={() => handleQuickSelect(cat)}
                        disabled={loading}
                        className={`
                          relative overflow-hidden p-8 rounded-[2rem] border-2 transition-all duration-300 transform group
                          ${isSelected 
                            ? 'border-primary bg-primary/10 scale-105 shadow-xl shadow-primary/10 opacity-70' 
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                          }
                        `}
                      >
                        <div className={`w-14 h-14 rounded-2xl mb-4 mx-auto flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-text-muted group-hover:text-white'}`}>
                          {loading && isSelected ? <Loader2 className="w-7 h-7 animate-spin" /> : <Icon className="w-7 h-7" />}
                        </div>
                        <h3 className={`text-xl font-black mb-1 ${isSelected ? 'text-white' : 'text-text-primary'}`}>{cat.name}</h3>
                        <p className="text-[10px] uppercase font-black tracking-widest text-text-muted">Göz At</p>
                        
                        {isSelected && (
                          <motion.div layoutId="modalSelected" className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(108,99,255,0.8)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button 
                  onClick={onClose}
                  disabled={loading}
                  className="text-text-muted hover:text-white font-bold text-sm transition-colors px-6 py-2"
                >
                  Kapat
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategorySelectorModal;
