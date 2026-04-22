import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../api';

const reasons = [
  { value: 'wrong_answer', label: 'Doğru cevap hatalı', icon: '❌' },
  { value: 'wrong_question', label: 'Soru metni yanlış', icon: '📝' },
  { value: 'typo', label: 'Yazım / imla hatası', icon: '✏️' },
  { value: 'inappropriate', label: 'Uygunsuz içerik', icon: '🚫' },
  { value: 'other', label: 'Diğer', icon: '💬' },
];

const ReportQuestionModal = ({ isOpen, onClose, question }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setLoading(true);
    try {
      await api.post('/reports', {
        questionId: question._id,
        reason: selectedReason,
        description: description.trim(),
      });
      setSent(true);
    } catch (err) {
      console.error('Rapor gönderilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setSelectedReason('');
      setDescription('');
      setSent(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md glass-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
                    <Flag className="w-5 h-5 text-warning" />
                  </div>
                  <h3 className="font-black text-lg text-white">Soruyu Raporla</h3>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sent ? (
                /* Başarı Ekranı */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-success/20 border border-success/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <h4 className="text-xl font-black text-white mb-2">Raporunuz Gönderildi</h4>
                  <p className="text-sm text-text-muted mb-6">Bildirdiğiniz için teşekkür ederiz. Yöneticiler en kısa sürede inceleyecektir.</p>
                  <button onClick={handleClose} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">
                    Kapat
                  </button>
                </div>
              ) : (
                /* Form */
                <div className="p-6 space-y-5">
                  {/* Soru Önizleme */}
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Raporlanan Soru</p>
                    <p className="text-sm text-white line-clamp-2">{question?.text}</p>
                  </div>

                  {/* Sebep Seçimi */}
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 ml-1">Sebep Seçin</p>
                    <div className="space-y-2">
                      {reasons.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setSelectedReason(r.value)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all text-sm ${
                            selectedReason === r.value
                              ? 'bg-warning/10 border-warning/30 text-white'
                              : 'bg-white/[0.02] border-white/10 text-text-secondary hover:bg-white/5'
                          }`}
                        >
                          <span>{r.icon}</span>
                          <span className="font-medium">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Açıklama */}
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">Ek Açıklama (Opsiyonel)</p>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-muted text-sm focus:outline-none focus:border-warning/40 focus:ring-2 focus:ring-warning/20 resize-none transition-all"
                      placeholder="Sorunla ilgili detay ekleyin..."
                    />
                  </div>

                  {/* Butonlar */}
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleClose} className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                      Vazgeç
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedReason || loading}
                      className="flex-1 py-3 bg-warning text-black rounded-xl font-bold text-sm shadow-lg shadow-warning/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                      Gönder
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportQuestionModal;
