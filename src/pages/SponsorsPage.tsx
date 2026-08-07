import React from 'react';
import { Mail, Phone, Instagram, Globe, Sparkles } from 'lucide-react';

type Sponsor = {
  name: string;
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
  logoUrl?: string;
  tier?: 'Gold' | 'Silver' | 'Bronze' | 'Partner';
};

const SPONSORS_DATA: Sponsor[] = [
  {
    name: "Stranger Brands Ltd",
    phone: "+91 98765 43210",
    email: "contact@strangerbrands.com",
    instagram: "https://instagram.com/strangerbrands",
    website: "https://strangerbrands.com",
    tier: "Gold"
  },
  {
    name: "Upside Down Devs",
    email: "hello@upsidedowndevs.io",
    instagram: "https://instagram.com/upsidedowndevs",
    website: "https://upsidedowndevs.io",
    tier: "Gold"
  },
  {
    name: "Hawkins Lab Logistics",
    phone: "+91 88888 77777",
    tier: "Silver"
  },
  {
    name: "Scoops Ahoy Parlor",
    website: "https://scoopsahoy.example.com",
    tier: "Bronze"
  }
];

export function SponsorsPage() {
  return (
    <main className="w-full min-h-screen py-12 max-w-7xl mx-auto flex flex-col gap-12 px-4 md:px-6">
      {/* Header */}
      <header
        className="flex flex-col gap-4 pb-8 relative overflow-hidden p-6 comic-border-thick"
        style={{ background: 'var(--panel-bg)', transform: 'rotate(-0.5deg)' }}
      >
        <div className="absolute inset-0 hatch-pattern pointer-events-none" style={{ opacity: 0.15 }} />
        <span
          className="comic-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'Bangers, cursive',
            fontSize: '13px',
            padding: '3px 12px',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-base)',
            width: 'fit-content',
            transform: 'rotate(1deg)',
            textShadow: 'none'
          }}
        >
          <Sparkles size={12} className="shrink-0" /> ARENA PATRONS
        </span>
        <h1
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(50px, 9vw, 84px)',
            lineHeight: 0.9,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-6deg)',
          }}
        >
          Sponsors
        </h1>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          The powerhouses backing the arena combatants. Empowering SPECTRUM 26 behind the scenes.
        </p>
      </header>

      {/* Grid of Sponsors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SPONSORS_DATA.map((s, idx) => (
          <div
            key={idx}
            className="comic-border-thick p-6 relative flex flex-col justify-between min-h-[220px]"
            style={{ background: 'var(--panel-bg)' }}
          >
            {/* Header / Tier indicator */}
            <div className="flex justify-between items-start mb-4">
              <h2 
                className="font-hero text-2xl uppercase tracking-wide text-primary leading-tight flex-1 mr-2"
                style={{ fontFamily: 'Bangers, cursive', textShadow: 'none' }}
              >
                {s.name}
              </h2>
              {s.tier && (
                <span 
                  className="comic-badge text-[9px] px-2 py-0.5"
                  style={{
                    textShadow: 'none',
                    background: s.tier === 'Gold' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                    color: s.tier === 'Gold' ? '#ffffff' : 'var(--color-text-muted)',
                    borderColor: 'rgba(255,255,255,0.08)'
                  }}
                >
                  {s.tier}
                </span>
              )}
            </div>

            {/* Details Fields - only render if NOT blank */}
            <div className="flex flex-col gap-3 font-body text-xs text-text-secondary flex-1 mt-2">
              {s.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-primary shrink-0" />
                  <span>{s.phone}</span>
                </div>
              )}
              {s.email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-primary shrink-0" />
                  <a href={`mailto:${s.email}`} className="hover:text-primary transition-colors">{s.email}</a>
                </div>
              )}
              {s.instagram && (
                <div className="flex items-center gap-2.5">
                  <Instagram size={14} className="text-primary shrink-0" />
                  <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {s.instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@')}
                  </a>
                </div>
              )}
            </div>

            {/* Footer website link - only render if NOT blank */}
            {s.website && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <a
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  <Globe size={12} />
                  <span>Visit Website</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
