import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_DATE } from '../config';
import { playSynthSound } from '../lib/audio';
import type { Event } from '../types';
import { FALLBACK_EVENTS } from '../types';
import { getEvents, getActiveMemberCountForEvent } from '../lib/firestore';
import { PixelSprite } from '../components/PixelSprite';
import { usePageCurl } from '../components/PageCurlTransition';

import { DUSTIN_MAP, DUSTIN_PALETTE, DUSTIN_IDLE_REGION } from '../sprites/dustin';
import { ELEVEN_MAP, ELEVEN_PALETTE, ELEVEN_IDLE_REGION } from '../sprites/eleven';
import { STEVE_MAP, STEVE_PALETTE, STEVE_IDLE_REGION } from '../sprites/steve';
import { LUCAS_MAP, LUCAS_PALETTE, LUCAS_IDLE_REGION } from '../sprites/lucas';
import { MAX_MAP, MAX_PALETTE, MAX_IDLE_REGION } from '../sprites/max';

const ARCH_CARDS_DATA = [
  {
    id: 'tech-duo-1',
    panelNumber: '01',
    icon: '</>',
    title: '01 DUAL DEBUG',
    desc: 'Duo coding face-off.',
    format: 'DUO PARTNERS',
    price: '₹150 / PERSON',
    color: '#00ff66',
    glowColor: 'rgba(0, 255, 102, 0.4)',
    bgGradient: 'from-green-950/40 via-bg-card to-bg-card',
    character: 'max',
    spriteMap: MAX_MAP,
    spritePalette: MAX_PALETTE,
    idleRegion: MAX_IDLE_REGION,
  },
  {
    id: 'tech-solo-1',
    panelNumber: '02',
    icon: '🧠',
    title: '02 SINGULARITY STRIKE',
    desc: 'Solo arena battle.',
    format: 'INDIVIDUAL',
    price: '₹50',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    bgGradient: 'from-purple-950/40 via-bg-card to-bg-card',
    character: 'eleven',
    spriteMap: ELEVEN_MAP,
    spritePalette: ELEVEN_PALETTE,
    idleRegion: ELEVEN_IDLE_REGION,
  },
  {
    id: 'non-tech-1',
    panelNumber: '03',
    icon: '🎧',
    title: '03 BGMI TOURNAMENT',
    desc: 'Squad up. Drop in. Survive.',
    format: 'TEAM / SQUAD',
    price: '₹800 / TEAM',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    bgGradient: 'from-amber-950/40 via-bg-card to-bg-card',
    character: 'steve',
    spriteMap: STEVE_MAP,
    spritePalette: STEVE_PALETTE,
    idleRegion: STEVE_IDLE_REGION,
  },
  {
    id: 'non-tech-3',
    panelNumber: '04',
    icon: '⚽',
    title: '04 FC 26 SHOWDOWN',
    desc: 'Digital football battle.',
    format: '1v1',
    price: '₹100',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    bgGradient: 'from-blue-950/40 via-bg-card to-bg-card',
    character: 'lucas',
    spriteMap: LUCAS_MAP,
    spritePalette: LUCAS_PALETTE,
    idleRegion: LUCAS_IDLE_REGION,
  },
];

export function LandingPage() {
  const { startCurl } = usePageCurl();
  const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);

  useEffect(() => {
    getEvents().then(dbEvents => {
      if (dbEvents.length > 0) setEvents(dbEvents);
    }).catch(e => console.warn('[LandingPage] Firestore events load failed', e));
  }, []);

  return (
    <div className="relative w-full min-h-screen text-white select-none pb-24 lg:pb-16 bg-[#040812]">
      {/* Background Castle & Red Lightning Hero Banner */}
      <div className="absolute top-0 left-0 right-0 h-[650px] lg:h-[800px] overflow-hidden pointer-events-none z-0">
        <div
          className="w-full h-full opacity-45 bg-cover bg-top"
          style={{
            backgroundImage: 'url(/cave.jpeg)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-transparent to-[#040812]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 flex flex-col gap-10">

        {/* Hero Top Grid: Title & Countdown (Left) + 4 Archway Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Title, Subtitle, CTA & Countdown */}
          <div className="lg:col-span-5 flex flex-col gap-6 pt-2">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-red-400 font-pixel text-[10px] tracking-wider uppercase w-fit shadow-[0_0_15px_rgba(255,51,51,0.3)]">
              <span>☠</span> 4 EVENTS. 1 ULTIMATE BATTLE.
            </div>

            {/* Main Pixel Title */}
            <div className="flex flex-col gap-1">
              <h1 className="font-pixel text-4xl sm:text-6xl lg:text-5xl xl:text-6xl text-white tracking-wider leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                SPECTRUM
              </h1>
              <span className="font-pixel text-4xl sm:text-6xl lg:text-5xl xl:text-6xl text-red-600 tracking-wider leading-none drop-shadow-[0_0_20px_rgba(255,51,51,0.8)]">
                5.0
              </span>
            </div>

            {/* Subtitle */}
            <div className="flex flex-col gap-1 text-text-secondary font-body text-sm sm:text-base leading-relaxed max-w-md">
              <p className="font-semibold text-white">The ultimate tech and gaming showdown.</p>
              <p className="text-text-muted">Code. Compete. Conquer.</p>
            </div>

            {/* Hero CTAs */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/events"
                onClick={() => playSynthSound('laser')}
                className="px-6 py-3 rounded-md bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-600 text-white font-pixel text-xs uppercase tracking-wider border border-red-400/50 shadow-[0_0_20px_rgba(255,51,51,0.6)] hover:shadow-[0_0_30px_rgba(255,51,51,0.9)] transition-all flex items-center gap-2 font-bold active:scale-95"
              >
                <span>🏆</span> EXPLORE EVENTS <span>→</span>
              </Link>
              
              <Link
                to="/schedule"
                onClick={() => playSynthSound('click')}
                className="px-6 py-3 rounded-md bg-bg-card hover:bg-white/10 text-white font-pixel text-xs uppercase tracking-wider border border-white/20 hover:border-white/40 transition-all flex items-center gap-2 active:scale-95"
              >
                HOW IT WORKS <span className="text-red-500 text-xs">▶</span>
              </Link>
            </div>

            {/* Cyberpunk Red Countdown Box */}
            <div className="mt-2">
              <CountdownBox />
            </div>
          </div>

          {/* Right Column: 4 Neon Archway Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 items-stretch">
            {ARCH_CARDS_DATA.map((card) => {
              const matchingEvent = events.find(e => e.id === card.id);
              return (
                <ArchCard
                  key={card.id}
                  data={card}
                  event={matchingEvent}
                  onSelect={() => {
                    playSynthSound('laser');
                    startCurl('forward', `/event/${card.id}`);
                  }}
                />
              );
            })}
          </div>

        </div>

        {/* Bottom Feature Cards Row */}
        <BottomInfoBar />

        {/* Embedded Venue & Map Section */}
        <VenueContactSection />

      </div>
    </div>
  );
}

/** ─── Countdown Box ────────────────────────────────────────────────────────── */
function CountdownBox() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative border border-red-600/60 bg-black/80 p-4 sm:p-5 rounded-lg shadow-[0_0_25px_rgba(255,51,51,0.25)] flex flex-col items-center gap-3">
      {/* Corner Ticks */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-red-500" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-red-500" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-red-500" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-red-500" />

      <span className="font-pixel text-[10px] sm:text-xs text-red-500 uppercase tracking-widest flex items-center gap-2">
        <span className="w-6 h-[1px] bg-red-600/50" />
        THE BATTLE BEGINS IN
        <span className="w-6 h-[1px] bg-red-600/50" />
      </span>

      <div className="grid grid-cols-4 gap-3 sm:gap-5 text-center w-full max-w-sm">
        <div>
          <span className="font-pixel text-2xl sm:text-3xl text-white block">{String(time.days).padStart(2, '0')}</span>
          <span className="font-pixel text-[9px] text-text-muted uppercase">DAYS</span>
        </div>
        <div>
          <span className="font-pixel text-2xl sm:text-3xl text-white block">{String(time.hours).padStart(2, '0')}</span>
          <span className="font-pixel text-[9px] text-text-muted uppercase">HRS</span>
        </div>
        <div>
          <span className="font-pixel text-2xl sm:text-3xl text-white block">{String(time.minutes).padStart(2, '0')}</span>
          <span className="font-pixel text-[9px] text-text-muted uppercase">MINS</span>
        </div>
        <div>
          <span className="font-pixel text-2xl sm:text-3xl text-white block">{String(time.seconds).padStart(2, '0')}</span>
          <span className="font-pixel text-[9px] text-text-muted uppercase">SECS</span>
        </div>
      </div>
    </div>
  );
}

function getTimeLeft() {
  const diff = Math.max(0, EVENT_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** ─── Neon Portal Archway Card Component ───────────────────────────────────── */
function ArchCard({ data, event, onSelect }: { data: typeof ARCH_CARDS_DATA[0]; event?: Event; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer relative flex flex-col items-center p-3 sm:p-4 rounded-t-full rounded-b-lg border-2 bg-gradient-to-b ${data.bgGradient} transition-all duration-300 hover:scale-[1.03] shadow-lg hover:shadow-2xl overflow-hidden`}
      style={{
        borderColor: data.color,
        boxShadow: `0 0 20px ${data.glowColor}`,
      }}
    >
      {/* Top Archway Badge */}
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full font-pixel text-[10px] tracking-wider mb-3 text-white border"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderColor: data.color,
          color: data.color,
        }}
      >
        <span>{data.panelNumber}</span>
        <span>{data.icon}</span>
      </div>

      {/* Sprite Container inside Glowing Arch */}
      <div className="relative w-full aspect-square max-h-[160px] sm:max-h-[180px] flex items-center justify-center my-2 rounded-t-full bg-black/40 border border-white/10 group-hover:border-white/30 transition-colors overflow-hidden">
        <PixelSprite
          map={data.spriteMap}
          palette={data.spritePalette}
          size="lg"
          animate={true}
          idleRegion={data.idleRegion}
        />
        {/* Neon Floor Aura */}
        <div
          className="absolute bottom-1 w-20 h-4 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: data.color }}
        />
      </div>

      {/* Details Footer */}
      <div className="w-full flex flex-col gap-1 text-center mt-2">
        <h3
          className="font-pixel text-xs sm:text-sm font-bold truncate"
          style={{ color: data.color }}
        >
          {data.title}
        </h3>
        <p className="font-body text-[11px] text-text-secondary line-clamp-1 leading-tight">{data.desc}</p>

        <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-0.5 items-center">
          <span className="font-pixel text-[9px] text-text-muted uppercase flex items-center gap-1">
            <span>👤</span> {data.format}
          </span>
          <span className="font-pixel text-xs font-bold text-white" style={{ color: data.color }}>
            {data.price}
          </span>
        </div>

        {/* Down Indicator Arrow */}
        <span className="font-pixel text-xs mt-1 animate-bounce" style={{ color: data.color }}>
          ▼
        </span>
      </div>
    </div>
  );
}

/** ─── Bottom Info Bar ──────────────────────────────────────────────────────── */
function BottomInfoBar() {
  return (
    <div className="border border-red-600/40 bg-black/80 p-4 sm:p-6 rounded-lg shadow-[0_0_25px_rgba(255,51,51,0.15)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
      {/* Reward Block */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shrink-0 text-2xl">
          👑
        </div>
        <div className="flex flex-col">
          <span className="font-pixel text-xs text-red-500 uppercase tracking-wider">EPIC REWARDS AWAIT</span>
          <p className="font-body text-xs text-text-secondary leading-tight mt-0.5">
            Trophies, goodies and unforgettable memories.
          </p>
        </div>
      </div>

      {/* Date Block */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-red-500/10 border border-red-500/40 flex items-center justify-center shrink-0 text-xl">
          📅
        </div>
        <div className="flex flex-col">
          <span className="font-pixel text-xs text-white font-bold">30 SEPTEMBER 2026</span>
          <span className="font-pixel text-[9px] text-text-muted uppercase mt-0.5">EVENT DATE</span>
        </div>
      </div>

      {/* Location Block */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-red-500/10 border border-red-500/40 flex items-center justify-center shrink-0 text-xl">
          📍
        </div>
        <div className="flex flex-col">
          <span className="font-body text-xs text-white font-semibold leading-tight">
            SVKM'S SHRI BHAGUBHAI MAFATLAL POLYTECHNIC
          </span>
          <span className="font-pixel text-[9px] text-text-muted uppercase mt-0.5">COLLEGE OF ENGINEERING</span>
        </div>
      </div>

      {/* Memories Block */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-red-500/10 border border-red-500/40 flex items-center justify-center shrink-0 text-2xl text-red-500">
          ★
        </div>
        <div className="flex flex-col">
          <span className="font-pixel text-xs text-white font-bold uppercase">UNFORGETTABLE MEMORIES</span>
          <span className="font-pixel text-[9px] text-red-500 uppercase mt-0.5">SPECTRUM FESTIVAL</span>
        </div>
      </div>
    </div>
  );
}

/** ─── Embedded Venue & Map Section ─────────────────────────────────────────── */
function VenueContactSection() {
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    import('../lib/firestore').then(m => m.getEventDetails()).then(setDetails).catch(console.error);
  }, []);

  const locationText = details?.location || "SVKM's Shri Bhagubhai Mafatlal Polytechnic\nIrla, Vile Parle West, Mumbai, Maharashtra 400056";

  return (
    <section className="mt-6 p-6 border border-white/10 bg-bg-card/40 rounded-lg flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="font-pixel text-sm text-red-500">📍</span>
        <h3 className="font-pixel text-sm text-white uppercase tracking-wider">VENUE LOCATION & MAP</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-4 font-body">
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
            {locationText}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded bg-white/5 border border-white/20 hover:border-red-500 hover:text-red-400 text-white font-pixel text-xs uppercase tracking-wider transition-colors"
            >
              CONTACT HELPLINE →
            </Link>
          </div>
        </div>

        <a
          href="https://maps.app.goo.gl/jS54o8EKGNT7gRHS6"
          target="_blank"
          rel="noopener noreferrer"
          className="relative block h-56 w-full overflow-hidden rounded border border-red-500/40 group cursor-pointer"
          title="Open in Google Maps"
        >
          <iframe
            title="SVKM's Shri Bhagubhai Mafatlal Polytechnic Location"
            src="https://maps.google.com/maps?q=SVKM's%20Shri%20Bhagubhai%20Mafatlal%20Polytechnic&t=&z=16&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 pointer-events-none"
            allowFullScreen
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-pixel text-xs uppercase tracking-wider">
            Open in Google Maps ↗
          </div>
        </a>
      </div>
    </section>
  );
}
