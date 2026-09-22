import React from 'react';
import { Reorder } from 'framer-motion';
import { Loader2, Search, X, Folder } from 'lucide-react';
import { CategoryTreeItem } from './contentUiParts';

const CategoryTreePanel = ({
  loading,
  categories,
  rootCats,
  filteredRoots,
  searchTerm,
  selectedCatId,
  onSearchChange,
  onSelect,
  onEdit,
  onReorder,
}) => (
  <div className="w-full xl:w-72 shrink-0 flex flex-col bg-white/[0.025] border border-white/10 rounded-3xl overflow-hidden max-h-[42vh] sm:max-h-[360px] xl:max-h-none">
    {/* Search */}
    <div className="p-3 border-b border-white/10">
      <div className="flex items-center bg-black/20 border border-white/10 rounded-2xl px-3 py-2 gap-2 focus-within:border-primary/50 focus-within:bg-transparent transition-all">
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input
          type="text"
          placeholder="Kategori ara..."
          className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/30"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => onSearchChange('')}>
            <X className="w-3.5 h-3.5 text-text-muted hover:text-white" />
          </button>
        )}
      </div>
    </div>

    {/* Tree */}
    <div className="flex-1 min-h-0 overflow-y-auto p-2 custom-scrollbar">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredRoots.length === 0 ? (
        <div className="py-10 text-center text-text-muted text-sm">
          <Folder className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p>Kategori bulunamadı.</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={searchTerm ? filteredRoots : rootCats}
          onReorder={(newOrder) => onReorder(null, newOrder)}
          className="space-y-0.5"
        >
          {(searchTerm ? filteredRoots : rootCats).map(cat => (
            <CategoryTreeItem
              key={cat._id}
              cat={cat}
              allCategories={categories}
              selectedId={selectedCatId}
              onSelect={onSelect}
              onEdit={onEdit}
              onReorder={onReorder}
              level={0}
            />
          ))}
        </Reorder.Group>
      )}
    </div>

    {/* Footer */}
    <div className="p-3.5 border-t border-white/10 text-[10px] text-text-muted font-bold uppercase tracking-widest text-center">
      {categories.length} Kategori
    </div>
  </div>
);

export default CategoryTreePanel;
