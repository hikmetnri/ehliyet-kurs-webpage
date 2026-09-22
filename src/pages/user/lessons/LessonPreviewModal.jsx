import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MotionDiv = motion.div;

const LessonPreviewModal = ({ previewImage, onClose }) => (
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-6">
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => onClose}
            />
            <MotionDiv
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ duration: 0.2 }}
              className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e1016] shadow-2xl shadow-black/70"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/30 px-4 py-3">
                <p className="min-w-0 truncate text-sm font-black text-white">{previewImage.alt || 'Görsel'}</p>
                <button
                  type="button"
                  onClick={() => onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-text-muted transition hover:bg-white/10 hover:text-white"
                  aria-label="Görseli kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black/40 p-2 custom-scrollbar sm:p-4">
                <img
                  src={previewImage.src}
                  alt={previewImage.alt || ''}
                  className="max-h-[78vh] max-w-full object-contain"
                />
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
);

export default LessonPreviewModal;
