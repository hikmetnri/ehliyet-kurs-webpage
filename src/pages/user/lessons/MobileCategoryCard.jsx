import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';
import { getCategoryIcon } from './lessonsHelpers';

export const MobileCategoryCard = ({ category, parentColor, onClick, user, completedIds, allCategories }) => {
  const isContent = category.content && category.content.trim().length > 0;
  const catColor = category.color && category.color !== '#6C63FF' ? category.color : parentColor;
  const icon = getCategoryIcon(category.name);
  const isProLocked = category.isPro && !user?.proStatus;

  const progressPercent = useMemo(() => {
    const extractContentNodeIds = (node) => {
      let ids = [];
      if (node.content && node.content.trim().length > 0) {
        ids.push(node._id);
      }
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          ids.push(...extractContentNodeIds(child));
        }
      }
      return ids;
    };
    
    const fullNode = allCategories.find(c => c._id === category._id) || category;
    const contentIds = extractContentNodeIds(fullNode);
    if (contentIds.length === 0) return 0;
    const completedCount = contentIds.filter(id => completedIds.includes(id)).length;
    return Math.round((completedCount / contentIds.length) * 100);
  }, [category, completedIds, allCategories]);

  return (
    <div
      onClick={() => onClick(category)}
      role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(category); } }}
      style={{ '--lesson-color': catColor }}
      className="flutter-lesson-card relative overflow-hidden rounded-2xl border border-white/5 bg-[#151821] p-4 flex flex-col min-h-[160px] cursor-pointer transition-all active:scale-95 active:border-white/20 select-none shadow-lg shadow-black/25"
    >
      <div className="absolute -right-4 -bottom-4 text-white/[0.02] pointer-events-none">
        {React.createElement(icon, { className: "w-24 h-24 stroke-[1]" })}
      </div>

      <div className="flex items-start justify-between mb-3">
        <div 
          className="p-2.5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${catColor}20` }}
        >
          {React.createElement(icon, { className: "w-5 h-5", style: { color: catColor } })}
        </div>

        <div className="flex flex-col items-end gap-1">
          {category.isPro && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning/15 border border-warning/30 text-[9px] font-black text-warning uppercase tracking-wider">
              <Lock className="w-2.5 h-2.5" /> PRO
            </span>
          )}
          {isContent && (
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-text-secondary">
              İçerik
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end mb-3">
        <h3 className="text-sm font-black text-white leading-tight line-clamp-2">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-[10px] text-text-muted mt-1 truncate font-medium">
            {category.description}
          </p>
        )}
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between text-[9px] font-bold mb-1">
          <span className={progressPercent >= 100 ? "text-success" : "text-text-muted"}>
            {progressPercent >= 100 ? "Tamamlandı" : "İlerleme"}
          </span>
          <span className={progressPercent >= 100 ? "text-success font-black" : "text-white font-black"}>
            {progressPercent >= 100 && "✓ "}%{progressPercent}
          </span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: progressPercent >= 100 ? '#10b981' : catColor 
            }}
          />
        </div>
      </div>

      {isProLocked && (
        <div className="absolute inset-0 bg-[#0e1015]/85 flex items-center justify-center backdrop-blur-[1px]">
          <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center shadow-lg shadow-warning/20">
            <Lock className="w-5 h-5 text-black" />
          </div>
        </div>
      )}
    </div>
  );
};
