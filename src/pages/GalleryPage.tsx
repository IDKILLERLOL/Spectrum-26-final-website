import React, { useState, useEffect } from 'react';
import { playSynthSound } from '../lib/audio';

const GALLERY_PHOTOS = [
  { id: '1', title: 'Code Clash Lab', url: '/gallery/code_clash.jpg', desc: 'Contestants coding in the arena.' },
  { id: '2', title: 'Organizers Group', url: '/gallery/gallery_1.jpg', desc: 'Committee members photo.' },
  { id: '3', title: 'Spectrum Heads', url: '/gallery/spectrum_heads.jpg', desc: 'Official event leads lineup.' },
  { id: '4', title: 'Handprint Wall', url: '/gallery/spectrum_wall_banner.jpg', desc: 'Mural board handprints.' },
  { id: '5', title: 'Codopoly Session', url: '/gallery/codopoly_session.jpg', desc: 'DSA board game battle.' },
  { id: '6', title: 'Console Esports', url: '/gallery/gaming_desk.jpg', desc: 'Players fighting in console hubs.' }
];

const PREVIOUS_EDITIONS = [
  { edition: "Spectrum 4.0", year: "2025", tagline: "The Retro Bytes Hack", url: "/gallery/gallery_1.jpg" },
  { edition: "Spectrum 3.0", year: "2024", tagline: "Rise of the Machine Code", url: "/gallery/code_clash.jpg" },
  { edition: "Spectrum 2.0", year: "2023", tagline: "Binary Dawn Tournament", url: "/gallery/spectrum_heads.jpg" },
  { edition: "Spectrum 1.0", year: "2022", tagline: "System Startup Arena", url: "/gallery/gaming_desk.jpg" }
];

export function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [lightboxIndex]);

  const openLightbox = (idx: number) => {
    playSynthSound('click');
    setLightboxIndex(idx);
  };

  const closeLightbox = () => {
    playSynthSound('click');
    setLightboxIndex(null);
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSynthSound('click');
    if (lightboxIndex !== null) {
      setLightboxIndex(prev => (prev === 0 ? GALLERY_PHOTOS.length - 1 : (prev ?? 0) - 1));
    }
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSynthSound('click');
    if (lightboxIndex !== null) {
      setLightboxIndex(prev => (prev === GALLERY_PHOTOS.length - 1 ? 0 : (prev ?? 0) + 1));
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 page-content flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="highlight-icon"><i data-lucide="image"></i></span>
          <div className="section-divider" style={{ margin: 0 }}>ARENA GALLERY</div>
        </div>
        <p className="text-small text-text-secondary text-center">
          Visual logs captured from past Spectrum gaming battles.
        </p>
      </div>

      {/* Masonry Photogrid */}
      <div className="pixel-card">
        <h3 className="text-heading text-left uppercase mb-4 border-b border-border pb-2">SNAP RECORDS</h3>
        <div className="photo-masonry-grid">
          {GALLERY_PHOTOS.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(idx)}
              className="photo-masonry-item"
            >
              <img src={photo.url} alt={photo.title} onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${photo.id}`;
              }} />
              <div className="p-3 text-left">
                <span className="font-ui text-sm font-bold text-text-primary uppercase block">{photo.title}</span>
                <span className="text-small text-text-secondary">{photo.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Editions */}
      <div className="pixel-card text-left">
        <h3 className="text-heading uppercase mb-6 border-b border-border pb-2">PREVIOUS EDITIONS</h3>
        <div className="flex flex-col gap-4">
          {PREVIOUS_EDITIONS.map((ed, idx) => (
            <div key={idx} className="p-3 bg-bg-raised border border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bg-primary border border-border overflow-hidden shrink-0">
                  <img src={ed.url} className="w-full h-full object-cover" onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${ed.edition}`;
                  }} />
                </div>
                <div>
                  <span className="font-ui text-base font-bold text-text-primary uppercase block">{ed.edition} ({ed.year})</span>
                  <span className="text-small text-text-secondary">{ed.tagline}</span>
                </div>
              </div>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); playSynthSound('laser'); }}
                className="font-pixel text-[10px] text-text-primary uppercase tracking-wider hover:text-red-500"
              >
                EXPLORE SOUVENIRS →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Overlay Modal */}
      {lightboxIndex !== null && (
        <div className="lightbox-modal" onClick={closeLightbox}>
          <button className="lightbox-close-btn" onClick={closeLightbox}>&times;</button>
          
          <button
            onClick={showPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 btn w-12 h-12 rounded-full flex items-center justify-center bg-black/60 border-white/20 text-white"
          >
            <i data-lucide="chevron-right" style={{ transform: 'rotate(180deg)' }}></i>
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={GALLERY_PHOTOS[lightboxIndex].url}
              alt={GALLERY_PHOTOS[lightboxIndex].title}
              className="max-w-full max-h-[70vh] border-2 border-white/20 rounded shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${GALLERY_PHOTOS[lightboxIndex].id}`;
              }}
            />
            <div className="p-4 bg-black/80 text-left mt-2 rounded border border-white/10">
              <span className="font-ui text-base font-bold text-white uppercase block">
                {GALLERY_PHOTOS[lightboxIndex].title}
              </span>
              <span className="text-small text-slate-400 mt-1 block">
                {GALLERY_PHOTOS[lightboxIndex].desc}
              </span>
            </div>
          </div>

          <button
            onClick={showNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 btn w-12 h-12 rounded-full flex items-center justify-center bg-black/60 border-white/20 text-white"
          >
            <i data-lucide="chevron-right"></i>
          </button>
        </div>
      )}

    </div>
  );
}
