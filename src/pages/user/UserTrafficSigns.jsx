import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, TriangleAlert, Info, CircleStop, ArrowRight, Filter, X } from 'lucide-react';
import { getSignLibraryForCategoryName } from '../../data/signLibrariesData';
import useAuthStore from '../../store/authStore';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const normalizeText = (value) => String(value || '').toLocaleLowerCase('tr-TR');

const UserTrafficSigns = () => {
  const user = useAuthStore((state) => state.user);
  const library = useMemo(
    () => getSignLibraryForCategoryName(user?.selectedCategoryName),
    [user?.selectedCategoryName]
  );
  const signsData = library.signs;
  const categories = library.categories;
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSign, setSelectedSign] = useState(null);

  useEffect(() => {
    setActiveCategory('all');
    setSelectedSign(null);
    setSearchQuery('');
  }, [library.id]);

  const categoryById = useMemo(() => (
    categories.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {})
  ), [categories]);

  const categoryStats = useMemo(() => (
    categories.map((category) => ({
      ...category,
      count: category.id === 'all'
        ? signsData.length
        : signsData.filter((sign) => sign.category === category.id).length,
    }))
  ), [categories, signsData]);

  const filteredSigns = useMemo(() => {
    const query = normalizeText(searchQuery);
    return signsData.filter((sign) => {
      const matchesCategory = activeCategory === 'all' || sign.category === activeCategory;
      const searchable = `${sign.title} ${sign.description} ${sign.code} ${categoryById[sign.category]?.label || ''} ${sign.subcategoryLabel || ''}`;
      return matchesCategory && normalizeText(searchable).includes(query);
    });
  }, [activeCategory, categoryById, searchQuery, signsData]);

  const activeCategoryLabel = categoryById[activeCategory]?.label || 'Tümü';
  const knownSignCount = library.id === 'traffic'
    ? signsData.filter((sign) => !sign.title.includes(sign.code)).length
    : categories.length - 1;

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
            <TriangleAlert className="h-3.5 w-3.5 text-primary-light" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary-light">Levha Kütüphanesi</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">{library.title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-muted">
            {library.description} Kategori, kod veya anlamına göre ara; görseli ve açıklamayı hızlıca incele.
          </p>
          {user?.selectedCategoryName && (
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-primary-light">
              Seçili eğitim: {user.selectedCategoryName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-white/[0.025] p-2">
          {[
            ['Toplam', signsData.length],
            ['Listede', filteredSigns.length],
            [library.id === 'traffic' ? 'Tanımlı' : 'Kategori', knownSignCount],
          ].map(([label, value]) => (
            <div key={label} className="min-w-24 rounded-2xl bg-white/[0.035] px-4 py-3 text-center">
              <p className="text-lg font-black text-white">{value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <Search className="mr-3 h-5 w-5 text-primary-light" />
            <input
              type="text"
              placeholder="Levha adı, kodu veya açıklama ara..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full border-none bg-transparent text-sm font-semibold text-white outline-none placeholder:text-text-muted"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar xl:max-w-[58%] xl:pb-0">
            <span className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted xl:inline-flex">
              <Filter className="h-3.5 w-3.5" />
              Kategori
            </span>
            {categoryStats.map((category) => {
              const active = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                    active
                      ? 'border-primary/35 bg-primary/15 text-primary-light'
                      : 'border-white/10 bg-white/[0.03] text-text-muted hover:border-white/20 hover:text-white'
                  }`}
                >
                  {category.id === 'all' ? 'Tümü' : category.label.replace(' İşaretleri', '')}
                  <span className="ml-2 opacity-70">{category.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
          <span>{activeCategoryLabel} içinde {filteredSigns.length} levha</span>
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="text-primary-light hover:text-white">
              Aramayı temizle
            </button>
          )}
        </div>
      </section>

      {filteredSigns.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 text-center">
          <Search className="mb-4 h-14 w-14 text-white/15" />
          <h3 className="text-lg font-black text-white">Sonuç Bulunamadı</h3>
          <p className="mt-2 max-w-md text-sm font-semibold leading-relaxed text-text-muted">
            Arama metnini veya kategori filtresini değiştirerek levhaları yeniden listeleyebilirsin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredSigns.map((sign, index) => (
            <motion.button
              key={sign.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: Math.min(index * 0.01, 0.08) }}
              onClick={() => setSelectedSign(sign)}
              className="group flex min-h-[260px] flex-col rounded-3xl border border-white/10 bg-white/[0.025] p-4 text-left transition hover:border-primary/25 hover:bg-white/[0.04]"
            >
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-white/[0.035] p-4">
                <img
                  src={resolveMediaUrl(sign.image)}
                  alt={sign.title}
                  className="max-h-full max-w-full object-contain drop-shadow-xl transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="mt-4 flex flex-1 flex-col">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {sign.code}
                  </span>
                  <span className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary-light">
                    {categoryById[sign.category]?.label.replace(' İşaretleri', '')}
                  </span>
                </div>

                <h3 className="line-clamp-2 min-h-[42px] text-sm font-black leading-snug text-white transition group-hover:text-primary-light">
                  {sign.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-text-muted">
                  {sign.description}
                </p>

                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-black uppercase tracking-widest text-text-secondary transition group-hover:text-white">
                  Detay
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedSign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Levha detayını kapat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSign(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.section
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative grid max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#101017] shadow-2xl md:grid-cols-[280px_minmax(0,1fr)]"
            >
              <div className="flex items-center justify-center border-b border-white/10 bg-white/[0.035] p-8 md:border-b-0 md:border-r">
                <div className="flex aspect-square w-44 items-center justify-center rounded-3xl bg-white/[0.04] p-6 sm:w-52">
                  <img src={resolveMediaUrl(selectedSign.image)} alt={selectedSign.title} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
                </div>
              </div>

              <div className="flex min-w-0 flex-col p-6 sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-light">
                      <CircleStop className="h-3.5 w-3.5" />
                      {selectedSign.code}
                    </div>
                    <h2 className="text-2xl font-black leading-tight text-white">{selectedSign.title}</h2>
                    <p className="mt-2 text-xs font-black uppercase tracking-widest text-text-muted">
                      {categoryById[selectedSign.category]?.label}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSign(null)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-text-muted transition hover:text-white"
                    aria-label="Kapat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-light">
                    <Info className="h-4 w-4" />
                    Anlamı
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-white/85">
                    {selectedSign.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSign(null)}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
                >
                  Kapat
                </button>
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserTrafficSigns;
