import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
      className={`mb-4 border rounded-2xl overflow-hidden transition-all cursor-pointer backdrop-blur-sm ${isOpen ? 'bg-primary/5 border-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04]'}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-5 md:p-6 flex justify-between items-center gap-4">
        <h4 className={`font-bold text-base md:text-lg transition-colors ${isOpen ? 'text-white' : 'text-white/90'}`}>{faq.q}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-primary/20 text-primary-light' : 'bg-white/5 text-white/50'}`}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-5 md:p-6 pt-0 text-text-muted leading-relaxed font-medium text-base">
              <div className="w-full h-px bg-white/5 mb-5"></div>
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQItem;
