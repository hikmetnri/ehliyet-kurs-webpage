import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Loader2, Send } from 'lucide-react';

// ─── Hedefli Bildirim Modalı ──────────────────────────────────────────────────────────
const NotificationModal = ({ notifModalOpen, onClose, notifData, setNotifData, sendingNotif, handleSendNotif, selectedUserIds }) => (
<AnimatePresence>
        {notifModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-bg-card p-6 shadow-xl shadow-black/40"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
                    <Bell className="h-5 w-5 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Özel Bildirim Gönder</h2>
                    <p className="text-xs font-semibold text-text-secondary">{selectedUserIds.length} kullanıcı seçildi</p>
                  </div>
                </div>
                <button onClick={() => onClose} className="rounded-xl p-2 transition-colors hover:bg-white/[0.07]">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-bold text-text-muted">Bildirim başlığı</label>
                  <input
                    type="text"
                    value={notifData.title}
                    onChange={(e) => setNotifData({...notifData, title: e.target.value})}
                    placeholder="Örn: Sınav Hatırlatması"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-bold text-text-muted">Mesaj içeriği</label>
                  <textarea
                    value={notifData.body}
                    onChange={(e) => setNotifData({...notifData, body: e.target.value})}
                    placeholder="Kullanıcıya özel mesajınızı yazın..."
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all resize-none custom-scrollbar font-medium"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSendNotif}
                    disabled={sendingNotif || !notifData.title || !notifData.body}
                    className="flex w-full h-12 items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {sendingNotif ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Bildirimi Gönder</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
);

export default NotificationModal;
