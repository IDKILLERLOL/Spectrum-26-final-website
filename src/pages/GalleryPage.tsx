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
    <div className="">
      {/* Header */}
      <div className="">
        <span
          className=""
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
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(24px, 5vw, 54px)',
            lineHeight: 1.1,
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
        className=""
        style={{
          border: '3px solid var(--border-color)',
          background: 'var(--panel-bg)',
        }}
      >
        {/* Slideshow Display Area */}
        <div className="">
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
              className=""
            />
          </AnimatePresence>

          {/* Left Arrow */}
          {items.length > 1 && (
            <button
              onClick={handlePrev}
              className=""
              aria-label="Previous Slide"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow */}
          {items.length > 1 && (
            <button
              onClick={handleNext}
              className=""
              aria-label="Next Slide"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Top Controls Overlay */}
          <div className="">
            {/* AutoPlay Toggle */}
            {items.length > 1 && (
              <button
                onClick={() => {
                  playSynthSound('click');
                  setIsPlaying((prev) => !prev);
                }}
                className=""
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
              className=""
              title="Fullscreen View"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Counter Badge */}
          <div className="">
            0{currentIndex + 1} / 0{items.length}
          </div>
        </div>

        {/* Slide Caption & Controls Bar */}
        <div className="">
          <div className="">
            <h3
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '16px',
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
          <div className="">
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
      <div className="">
        <h4
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '14px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
          }}
        >
          // ALL PHOTOS ({items.length})
        </h4>

        <div className="">
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
                <div className="">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className=""
                  />
                </div>
                <div className="">
                  <span
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '12px',
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
            className=""
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className=""
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
                className=""
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
                className=""
                aria-label="Next Photo"
              >
                <ChevronRight size={28} />
              </button>
            )}

            <div className="" onClick={(e) => e.stopPropagation()}>
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
                  className=""
                />
              </AnimatePresence>
              <span className="">{currentItem.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
