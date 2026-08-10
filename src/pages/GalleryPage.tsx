import React, { useState } from 'react';

const INK = "#1A1A1A";
const VERMILION = "#C7382F";
const TEAL = "#12595B";
const MUSTARD = "#E8A13A";
const hoardingShadow = `4px 4px 0px ${INK}`;

const GALLERY_PHOTOS = [
  { id: '1', title: 'Code Clash Lab', url: '/gallery/code_clash.jpg', desc: 'Contestants coding in the arena.' },
  { id: '2', title: 'Organizers Group', url: '/gallery/gallery_1.jpg', desc: 'Committee members photo.' },
  { id: '3', title: 'Spectrum Heads', url: '/gallery/spectrum_heads.jpg', desc: 'Official event leads lineup.' },
  { id: '4', title: 'Handprint Wall', url: '/gallery/spectrum_wall_banner.jpg', desc: 'Mural board handprints.' },
  { id: '5', title: 'Codopoly Session', url: '/gallery/codopoly_session.jpg', desc: 'DSA board game battle.' },
  { id: '6', title: 'Console Esports', url: '/gallery/gaming_desk.jpg', desc: 'Players fighting in console hubs.' }
];

export function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6 px-4 py-16 w-full min-h-screen max-w-lg mx-auto text-left">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-hero text-3xl" style={{ color: VERMILION, textShadow: `1px 1px 0 ${INK}` }}>
          Gallery
        </h2>
        <p className="text-sm font-bold uppercase tracking-widest font-body" style={{ color: TEAL }}>
          Moments & Memories
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {GALLERY_PHOTOS.map((photo, idx) => (
          <div 
            key={photo.id} 
            className="border-4 bg-white p-4 flex flex-col gap-3" 
            style={{ borderColor: INK, boxShadow: hoardingShadow }}
            onClick={() => setLightboxIndex(idx)}
          >
            <div className="w-full h-48 bg-gray-200 border-2 overflow-hidden" style={{ borderColor: INK }}>
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-hero text-base" style={{ color: INK }}>
                {photo.title}
              </h3>
              <p className="font-body text-xs font-bold mt-1" style={{ color: TEAL }}>
                {photo.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setLightboxIndex(null)}
        >
          <div 
            className="border-4 bg-white p-4 max-w-sm w-full flex flex-col gap-3 relative" 
            style={{ borderColor: INK }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setLightboxIndex(null)}
              className="absolute top-2 right-2 font-hero text-sm px-2 py-1 bg-white border-2"
              style={{ borderColor: INK }}
            >
              X
            </button>
            <img 
              src={GALLERY_PHOTOS[lightboxIndex].url} 
              alt={GALLERY_PHOTOS[lightboxIndex].title} 
              className="w-full h-auto max-h-[300px] object-contain border-2" 
              style={{ borderColor: INK }}
            />
            <h4 className="font-hero text-base mt-2">{GALLERY_PHOTOS[lightboxIndex].title}</h4>
            <p className="font-body text-xs text-opacity-80">{GALLERY_PHOTOS[lightboxIndex].desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
