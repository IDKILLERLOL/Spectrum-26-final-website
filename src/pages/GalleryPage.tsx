import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, Filter, Plus, Maximize2 } from 'lucide-react';
import { playSynthSound } from '../lib/audio';
import { categoryLabel } from '../types';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'TECH' | 'NON_TECH' | 'HIGHLIGHTS' | 'STAGE';
  imageUrl: string;
  caption?: string;
  date?: string;
}

// Default initial gallery items (User can easily add or replace these images)
export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Code Prism Battle Ground',
    category: 'TECH',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    caption: 'Participants competing in the intense algorithmic problem-solving sprint.',
    date: 'Sep 22, 2026',
  },
  {
    id: 'gal-2',
    title: 'BGMI Squad Showdown',
    category: 'NON_TECH',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Final circle tactical combat live on the main stage screen.',
    date: 'Sep 23, 2026',
  },
  {
    id: 'gal-3',
    title: 'Grand Opening Ceremony',
    category: 'STAGE',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    caption: 'Stage keynotes and kickoff energy at Spectrum 26.',
    date: 'Sep 22, 2026',
  },
  {
    id: 'gal-4',
    title: 'Reverse Engineering Finals',
    category: 'TECH',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    caption: 'Deconstructing binary code logic under pressure.',
    date: 'Sep 22, 2026',
  },
  {
    id: 'gal-5',
    title: 'FC 26 Tournament Arena',
    category: 'NON_TECH',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    caption: 'Digital pitch finals with high audience hype.',
    date: 'Sep 23, 2026',
  },
  {
    id: 'gal-6',
    title: 'Victory & Awards Ceremony',
    category: 'HIGHLIGHTS',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    caption: 'Trophy presentation to the champion squads of Spectrum 26.',
    date: 'Sep 24, 2026',
  },
];

type CategoryFilter = 'ALL' | 'TECH' | 'NON_TECH' | 'HIGHLIGHTS' | 'STAGE';

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const activeItem = activeItemIndex !== null ? filteredItems[activeItemIndex] : null;

  // Lightbox Navigation
  const handlePrev = useCallback(() => {
    if (activeItemIndex === null) return;
    playSynthSound('click');
    setActiveItemIndex((prev) => (prev === 0 ? filteredItems.length - 1 : (prev ?? 0) - 1));
  }, [activeItemIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (activeItemIndex === null) return;
    playSynthSound('click');
    setActiveItemIndex((prev) => (prev === filteredItems.length - 1 ? 0 : (prev ?? 0) + 1));
  }, [activeItemIndex, filteredItems.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeItemIndex === null) return;
      if (e.key === 'Escape') setActiveItemIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItemIndex, handlePrev, handleNext]);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 text-center items-center">
        <span
          className="comic-badge"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            padding: '4px 14px',
            background: 'var(--badge-bg)',
            color: 'var(--color-text-primary)',
            transform: 'rotate(-1deg)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={14} /> SPECTRUM 26 SNAPSHOTS
        </span>

        <h1
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(40px, 8vw, 80px)',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-4deg)',
          }}
        >
          OFFICIAL FESTIVAL GALLERY
        </h1>
        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '15px',
            color: 'var(--color-text-muted)',
            maxWidth: '600px',
          }}
        >
          Explore high-voltage moments from coding battlegrounds, esports arenas, keynotes, and victory celebrations.
        </p>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {[
          { key: 'ALL', label: 'ALL SHOTS' },
          { key: 'TECH', label: 'TECH EVENTS' },
          { key: 'NON_TECH', label: 'ESPORTS & NON-TECH' },
          { key: 'HIGHLIGHTS', label: 'HIGHLIGHTS' },
          { key: 'STAGE', label: 'MAIN STAGE' },
        ].map(({ key, label }) => {
          const isActive = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => {
                playSynthSound('click');
                setSelectedCategory(key as CategoryFilter);
              }}
              style={{
                fontFamily: 'Bangers, cursive',
                fontSize: '18px',
                letterSpacing: '0.06em',
                padding: '8px 20px',
                textTransform: 'uppercase',
                background: isActive ? 'var(--color-text-primary)' : 'var(--panel-bg)',
                color: isActive ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
                border: '2.5px solid var(--border-color)',
                boxShadow: isActive ? '3px 3px 0px var(--border-color)' : '2px 2px 0px var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item, idx) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              playSynthSound('click');
              setActiveItemIndex(idx);
            }}
            className="comic-shadow group cursor-pointer relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'var(--panel-bg)',
              border: '3px solid var(--border-color)',
            }}
          >
            {/* Image Box */}
            <div className="relative aspect-video overflow-hidden bg-black/40">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="font-button text-small text-white uppercase flex items-center gap-1">
                  <Maximize2 size={14} /> Expand View
                </span>
              </div>

              {/* Tag Badge */}
              <span
                className="absolute top-3 left-3 px-3 py-1 font-micro text-micro uppercase font-bold tracking-wider"
                style={{
                  background: 'var(--color-text-primary)',
                  color: 'var(--color-bg-base)',
                  border: '1.5px solid var(--border-color)',
                }}
              >
                {item.category.replace('_', ' ')}
              </span>
            </div>

            {/* Details Footer */}
            <div className="p-5 flex flex-col gap-2 relative">
              <div className="flex justify-between items-center">
                <h3
                  style={{
                    fontFamily: 'Bangers, cursive',
                    fontSize: '22px',
                    letterSpacing: '0.04em',
                    color: 'var(--color-text-primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.title}
                </h3>
              </div>
              {item.caption && (
                <p
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.4,
                  }}
                >
                  {item.caption}
                </p>
              )}
              {item.date && (
                <span
                  style={{
                    fontFamily: 'Space Grotesk, monospace',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {item.date}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveItemIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveItemIndex(null)}
              className="absolute top-6 right-6 p-3 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 rounded-full transition-all z-50"
            >
              <X size={24} />
            </button>

            {/* Left Nav */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 rounded-full transition-all z-50"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Right Nav */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 rounded-full transition-all z-50"
            >
              <ChevronRight size={28} />
            </button>

            {/* Modal Card Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full flex flex-col comic-shadow overflow-hidden"
              style={{
                background: 'var(--panel-bg)',
                border: '3px solid var(--border-color)',
              }}
            >
              <div className="relative max-h-[70vh] bg-black flex items-center justify-center">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="p-6 flex flex-col gap-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h2
                    style={{
                      fontFamily: 'Bangers, cursive',
                      fontSize: '28px',
                      letterSpacing: '0.04em',
                      color: 'var(--color-text-primary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {activeItem.title}
                  </h2>
                  <span
                    className="px-3 py-1 font-micro text-micro uppercase font-bold tracking-wider"
                    style={{
                      background: 'var(--color-text-primary)',
                      color: 'var(--color-bg-base)',
                    }}
                  >
                    {activeItem.category.replace('_', ' ')}
                  </span>
                </div>

                {activeItem.caption && (
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    {activeItem.caption}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
