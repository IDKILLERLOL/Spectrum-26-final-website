import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { playSynthSound } from '../lib/audio';

export interface SlideshowItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string;
}

export const SLIDESHOW_ITEMS: SlideshowItem[] = [
  {
    id: 'slide-1',
    title: 'SPECTRUM — Team & Crew Gathering',
    imageUrl: '/gallery/gallery_1.jpg',
    caption: 'Organizers, committee heads, and volunteers celebrating a successful festival kickoff.',
  },
  {
    id: 'slide-2',
    title: 'SPECTRUM — Code Clash Challenge',
    imageUrl: '/gallery/code_clash.jpg',
    caption: 'Participants locked in deep focus during the high-stakes Code Clash lab session.',
  },
  {
    id: 'slide-3',
    title: 'SPECTRUM — Executive Leads & Heads',
    imageUrl: '/gallery/spectrum_heads.jpg',
    caption: 'President, Vice President, and Committee Heads showcasing their official SPECTRUM team hoodies.',
  },
  {
    id: 'slide-4',
    title: 'SPECTRUM — Wall of Handprints Banner',
    imageUrl: '/gallery/spectrum_wall_banner.jpg',
    caption: 'The iconic SPECTRUM 4.0 handprint art mural celebrating unity and festival spirit.',
  },
  {
    id: 'slide-5',
    title: 'SPECTRUM — Codopoly Board Game Face-Off',
    imageUrl: '/gallery/codopoly_session.jpg',
    caption: 'Teams competing strategically in the CS topic board game Codopoly.',
  },
  {
    id: 'slide-6',
    title: 'SPECTRUM — Esports & Console Battle',
    imageUrl: '/gallery/gaming_desk.jpg',
    caption: 'Gamers going head-to-head in the intense console esports event.',
  },
  {
    id: 'slide-7',
    title: 'SPECTRUM 4.0 — Photo Booth & Inauguration',
    imageUrl: '/gallery/photo_booth.jpg',
    caption: 'Faculty members, dignitaries, and event heads posing at the SPECTRUM 4.0 photo frame.',
  },
  {
    id: 'slide-8',
    title: 'SPECTRUM — Department Dignitaries & Faculty',
    imageUrl: '/gallery/faculty_hallway_1.jpg',
    caption: 'Faculty and department heads gathered under the binary code festival decorations.',
  },
  {
    id: 'slide-9',
    title: 'SPECTRUM — Organizers & Faculty Reception',
    imageUrl: '/gallery/faculty_hallway_2.jpg',
    caption: 'Faculty mentors, event coordinators, and core leads gathered in the main department corridor.',
  },
  {
    id: 'slide-10',
    title: 'SPECTRUM — Codopoly Championship Arena',
    imageUrl: '/gallery/codopoly_arena.jpg',
    caption: 'Faculty members and participants observing the intense Codopoly tournament match.',
  },
];

export function GalleryPage() {
  const [items] = useState<SlideshowItem[]>(SLIDESHOW_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentItem = items[currentIndex];

  const handleNext = useCallback(() => {
    playSynthSound('click');
    setDirection(1);
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  const handlePrev = useCallback(() => {
    playSynthSound('click');
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  // Autoplay Slideshow Effect
  useEffect(() => {
    if (!isPlaying || isFullscreen) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, isFullscreen, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-3 text-center items-center">
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
          <Sparkles size={14} /> SPECTRUM MEMORIES
        </span>

        <h1
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(40px, 8vw, 80px)',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
            color: 'var(--color-text-primary)',
            textShadow: '3px 3px 0px rgba(0,0,0,0.4)',
          }}
        >
          GALLERY
        </h1>
        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            maxWidth: '560px',
          }}
        >
          Relive the energy, competition, and memorable moments from SPECTRUM festival events.
        </p>
      </div>

      {/* Main Slideshow Container */}
      <div
        className="relative w-full comic-shadow overflow-hidden flex flex-col bg-black/60"
        style={{
          border: '3px solid var(--border-color)',
          background: 'var(--panel-bg)',
        }}
      >
        {/* Slideshow Display Area */}
        <div className="relative w-full aspect-[16/9] max-h-[650px] overflow-hidden bg-black flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.img
              key={currentItem.id}
              src={currentItem.imageUrl}
              alt={currentItem.title}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
              className="w-full h-full object-contain select-none"
            />
          </AnimatePresence>

          {/* Left Arrow */}
          {items.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black text-white border-2 border-white/40 hover:border-white rounded-full transition-all z-20"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow */}
          {items.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black text-white border-2 border-white/40 hover:border-white rounded-full transition-all z-20"
              aria-label="Next Slide"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Top Controls Overlay */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
            {/* AutoPlay Toggle */}
            {items.length > 1 && (
              <button
                onClick={() => {
                  playSynthSound('click');
                  setIsPlaying((prev) => !prev);
                }}
                className="px-3 py-1.5 bg-black/70 hover:bg-black border border-white/40 text-white font-button text-micro uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                {isPlaying ? 'Pause' : 'Autoplay'}
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={() => {
                playSynthSound('click');
                setIsFullscreen(true);
              }}
              className="p-1.5 bg-black/70 hover:bg-black border border-white/40 text-white transition-all"
              title="Fullscreen View"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Counter Badge */}
          <div className="absolute top-4 left-4 bg-black/70 border border-white/30 text-white px-3 py-1 font-mono text-micro tracking-widest z-20">
            0{currentIndex + 1} / 0{items.length}
          </div>
        </div>

        {/* Slide Caption & Controls Bar */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t-2 border-border-color">
          <div className="flex flex-col gap-1">
            <h3
              style={{
                fontFamily: 'Bangers, cursive',
                fontSize: '26px',
                letterSpacing: '0.04em',
                color: 'var(--color-text-primary)',
                textTransform: 'uppercase',
              }}
            >
              {currentItem.title}
            </h3>
            {currentItem.caption && (
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {currentItem.caption}
              </p>
            )}
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center gap-2 self-center md:self-auto">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playSynthSound('click');
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-3 transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-primary border-2 border-border-color'
                    : 'w-3 bg-border-subtle border border-border-color hover:bg-text-secondary'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="flex flex-col gap-4 mt-2">
        <h4
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: '22px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
          }}
        >
          // ALL PHOTOS ({items.length})
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <div
                key={item.id}
                onClick={() => {
                  playSynthSound('click');
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`comic-shadow cursor-pointer relative overflow-hidden transition-all duration-200 border-2 ${
                  isSelected ? 'border-primary ring-2 ring-primary scale-[1.02]' : 'border-border-color hover:border-primary/60'
                }`}
                style={{ background: 'var(--panel-bg)' }}
              >
                <div className="aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <span
                    style={{
                      fontFamily: 'Bangers, cursive',
                      fontSize: '18px',
                      color: 'var(--color-text-primary)',
                      display: 'block',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/98 backdrop-blur-xl"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 rounded-full transition-all z-[100000]"
              aria-label="Close Fullscreen View"
            >
              <X size={24} />
            </button>

            {items.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 rounded-full transition-all z-[100000]"
                aria-label="Previous Photo"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {items.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 rounded-full transition-all z-[100000]"
                aria-label="Next Photo"
              >
                <ChevronRight size={28} />
              </button>
            )}

            <div className="max-w-6xl max-h-[92vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                  key={currentItem.id}
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  custom={direction}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
                  className="max-h-[82vh] w-auto object-contain border-2 border-white/20 select-none shadow-2xl rounded-sm"
                />
              </AnimatePresence>
              <span className="font-hero text-xl text-white uppercase tracking-wider text-center px-4">{currentItem.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
