import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeIcon } from './userStatsBits';

// ─── Rozet Detay Modalı ───────────────────────────────────────────────────────────
const BadgeDetailModal = ({ selectedBadge, onClose }) => (
createPortal(
              <AnimatePresence>
                {selectedBadge && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => onClose}
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
                          onClick={() => onClose}
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
            )
);

export default BadgeDetailModal;
