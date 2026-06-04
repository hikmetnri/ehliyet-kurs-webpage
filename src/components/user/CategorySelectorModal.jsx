import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Car, Truck, Bike, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import api from '../../api';
import useAuthStore from '../../store/authStore';
import { isVideoRecord } from '../../utils/categoryContent';

// İkon eşleştirme tablosu
const iconMap = {
  'Car': Car,
  'Truck': Truck,
  'Bike': Bike,
  'car_hatchback': Car,
  'bicycle': Bike,
  'forklift': Truck,
};

const CategorySelectorModal = ({ isOpen, onClose, required = false }) => {
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
          setDbCategories((Array.isArray(data) ? data : []).filter(c => !c.parent && !isVideoRecord(c)));
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
      onClose?.();
    } catch (err) {
      console.error('Kategori kaydedilemedi:', err);
      if (!required) onClose?.();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-bg-dark/90 px-3 py-4 backdrop-blur-xl sm:px-4 sm:py-6"
        >
          <Motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="relative my-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-bg-card shadow-2xl sm:rounded-[2.5rem] lg:max-w-5xl lg:rounded-3xl lg:bg-[#0b0d12] lg:shadow-xl"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[100px] lg:hidden" />
            
            <div className="relative z-10 max-h-[calc(100vh-2rem)] overflow-y-auto p-5 text-center custom-scrollbar sm:p-8 md:p-12 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8 lg:p-0 lg:text-left">
              <div className="hidden border-r border-white/10 bg-white/[0.02] p-8 lg:flex lg:flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary-light">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="mt-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-light">Onboarding</p>
                  <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white">Eğitim türünü belirle</h2>
                  <p className="mt-4 text-sm font-medium leading-6 text-text-muted">
                    Dersler, sınavlar ve öneriler seçtiğin ehliyet sınıfına göre düzenlenir.
                  </p>
                </div>
                <div className="mt-auto rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-bold leading-5 text-text-secondary">
                    Tek seçim yeterli. Daha sonra dashboard içinden sınıfını değiştirebilirsin.
                  </p>
                </div>
              </div>

              <div className="mx-auto mb-5 flex h-16 w-16 rotate-3 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/20 sm:mb-6 sm:h-20 sm:w-20 lg:hidden">
                <ShieldCheck className="h-8 w-8 text-white sm:h-10 sm:w-10" />
              </div>
              <h2 className="mb-3 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl lg:hidden">Eğitim Türünü Belirle</h2>
              <p className="mx-auto mb-7 max-w-md text-sm font-medium leading-relaxed text-text-muted sm:mb-12 sm:text-base lg:hidden">
                Platformu sana özel hale getirebilmemiz için hazırlık yaptığın ehliyet sınıfını seçmelisin.
              </p>

              <div className="lg:p-8">
                {fetchLoading ? (
                  <div className="flex flex-col items-center py-10 lg:min-h-[320px] lg:justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Kategoriler Yükleniyor...</p>
                  </div>
                ) : dbCategories.length === 0 ? (
                  <div className="py-10 text-warning flex flex-col items-center lg:min-h-[320px] lg:justify-center">
                     <AlertCircle className="w-12 h-12 mb-4" />
                     <p className="font-bold">Henüz kategori eklenmemiş!</p>
                  </div>
                ) : (
                  <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-5 lg:mb-0 lg:grid-cols-3 lg:gap-4">
                    {dbCategories.map((cat) => {
                      const isSelected = selectedCat === cat._id;
                      const Icon = iconMap[cat.icon] || ShieldCheck;
                      return (
                        <button
                          key={cat._id}
                          onClick={() => handleQuickSelect(cat)}
                          disabled={loading}
                          className={`
                            relative overflow-hidden rounded-3xl border-2 p-5 transition-all duration-300 transform group sm:p-8 lg:rounded-2xl lg:p-5 lg:text-left lg:hover:-translate-y-0.5
                            ${isSelected
                              ? 'border-primary bg-primary/10 scale-105 shadow-xl shadow-primary/10 opacity-70 lg:scale-100 lg:shadow-none'
                              : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 lg:border-white/10'
                            }
                          `}
                        >
                          <div className={`w-14 h-14 rounded-2xl mb-4 mx-auto flex items-center justify-center transition-all lg:mx-0 lg:h-11 lg:w-11 lg:rounded-xl ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-text-muted group-hover:text-white'}`}>
                            {loading && isSelected ? <Loader2 className="w-7 h-7 animate-spin lg:h-5 lg:w-5" /> : <Icon className="w-7 h-7 lg:h-5 lg:w-5" />}
                          </div>
                          <h3 className={`text-xl font-black mb-1 lg:text-base ${isSelected ? 'text-white' : 'text-text-primary'}`}>{cat.name}</h3>
                          <p className="text-[10px] uppercase font-black tracking-widest text-text-muted">Göz At</p>

                          {isSelected && (
                            <Motion.div layoutId="modalSelected" className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(108,99,255,0.8)] lg:shadow-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {!required && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 lg:col-start-2 lg:border-t lg:border-white/10 lg:px-8 lg:py-5">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="text-text-muted hover:text-white font-bold text-sm transition-colors px-6 py-2 lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.03]"
                  >
                    Kapat
                  </button>
                </div>
              )}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CategorySelectorModal;
