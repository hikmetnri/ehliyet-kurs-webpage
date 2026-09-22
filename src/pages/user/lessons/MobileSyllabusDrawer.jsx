import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, CheckCircle2 } from 'lucide-react';
import { getCategoryIcon } from './lessonsHelpers';

const MobileSyllabusDrawer = ({
  isSyllabusOpen,
  setIsSyllabusOpen,
  selectedLesson,
  mobileNavStack,
  handleSelect,
  setSelectedLesson,
  setMobileNavStack,
  setActiveTopicId,
  allCategories,
  user,
  completedIds,
  getSyllabusLessons,
}) => {
    const lessons = getSyllabusLessons();
    const currentActiveNode = selectedLesson || mobileNavStack[mobileNavStack.length - 1];

    return (
      <AnimatePresence>
        {isSyllabusOpen && (
          <div className="fixed inset-0 z-[250] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => setIsSyllabusOpen(false)}
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-[80%] max-w-[320px] bg-[#11141b] border-l border-white/10 h-full flex flex-col z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#3ECFCF]/10 border border-[#3ECFCF]/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-[#3ECFCF]" />
                  </span>
                  <span className="text-sm font-black text-white uppercase tracking-wider">Müfredat</span>
                </div>
                <button 
                  onClick={() => setIsSyllabusOpen(false)}
                  className="p-1 text-text-muted hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
                {lessons.length === 0 ? (
                  <p className="text-xs text-text-muted italic text-center py-6">Konu bulunamadı.</p>
                ) : (
                  lessons.map((cat) => {
                    const isCurrent = currentActiveNode && cat._id === currentActiveNode._id;
                    const catColor = cat.color && cat.color !== '#6C63FF' ? cat.color : '#6366f1';
                    const icon = getCategoryIcon(cat.name);
                    
                    const extractContentNodeIds = (node) => {
                      let ids = [];
                      if (node.content && node.content.trim().length > 0) ids.push(node._id);
                      if (node.children && node.children.length > 0) {
                        for (const child of node.children) {
                          ids.push(...extractContentNodeIds(child));
                        }
                      }
                      return ids;
                    };
                    
                    const contentIds = extractContentNodeIds(cat);
                    const isCompleted = contentIds.length > 0 && contentIds.every(id => completedIds.includes(id));

                    return (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setIsSyllabusOpen(false);
                          if (cat.content?.trim()) {
                            handleSelect(cat);
                          } else {
                            setSelectedLesson(null);
                            const parentId = cat.parent?._id || cat.parent;
                            const parentNode = allCategories.find(c => c._id === parentId);
                            if (parentNode && parentNode._id !== user?.selectedCategoryId) {
                              setMobileNavStack([parentNode, cat]);
                            } else {
                              setMobileNavStack([cat]);
                            }
                            setActiveTopicId(cat._id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-r from-primary/15 to-transparent text-white border-l-4 border-l-primary'
                            : 'border-l-4 border-l-transparent text-text-secondary hover:bg-white/[0.03] hover:text-white'
                        }`}
                      >
                        <div 
                          className="p-2 rounded-lg flex items-center justify-center shrink-0"
                          style={{ 
                            backgroundColor: isCurrent ? `${catColor}25` : 'rgba(255,255,255,0.03)',
                            color: isCurrent ? catColor : 'var(--text-muted)' 
                          }}
                        >
                          {React.createElement(icon, { className: "w-4 h-4" })}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className={`block text-xs font-black truncate ${isCurrent ? 'text-white' : 'text-text-secondary'}`}>
                            {cat.name}
                          </span>
                        </div>

                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

export default MobileSyllabusDrawer;
