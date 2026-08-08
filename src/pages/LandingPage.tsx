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
    bgPos: '0% 0%',
  },
  {
    id: 'tech-solo-1',
    panelNumber: '02',
    icon: '🧠',
    title: '02 CODE CLASH',
    desc: 'Solo arena battle.',
    format: 'INDIVIDUAL',
    price: '₹50',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    bgGradient: 'from-purple-950/40 via-bg-card to-bg-card',
    bgPos: '33.333% 0%',
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
    bgPos: '66.666% 0%',
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
    bgPos: '100% 0%',
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
    <div className="relative w-full min-h-screen text-white select-none pb-36 sm:pb-24 lg:pb-16 bg-[#040812] overflow-x-hidden">
      {/* Background Castle & Red Lightning Hero Banner */}
      <div className="absolute top-0 left-0 right-0 h-[550px] sm:h-[650px] lg:h-[800px] overflow-hidden pointer-events-none z-0">
        <div
          className="w-full h-full opacity-40 bg-cover bg-top"
          style={{
            backgroundImage: 'url(/cave.jpeg)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-transparent to-[#040812]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-10 flex flex-col gap-6 sm:gap-10">

        {/* Centered Hero Top Header: Title, Countdown Timer & High-Attention CTA Buttons */}
        <div className="flex flex-col items-center text-center gap-4 sm:gap-6 pt-2 max-w-4xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 font-pixel text-[9px] sm:text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(255,51,51,0.35)]">
            <span>☠</span> 4 EVENTS. 1 ULTIMATE BATTLE.
          </div>

          {/* Main Pixel Title */}
          <h1 className="font-pixel text-4xl sm:text-7xl lg:text-8xl text-white tracking-wider leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
            SPECTRUM <span className="text-red-600 drop-shadow-[0_0_25px_rgba(255,51,51,0.9)]">5.0</span>
          </h1>

          {/* Subtitle with Pixelated Fonts */}
          <div className="flex flex-col gap-1.5 max-w-lg">
            <p className="font-pixel text-xs sm:text-base text-red-400 font-bold leading-snug tracking-wide drop-shadow-[0_0_12px_rgba(255,51,51,0.6)]">
              The ultimate tech and gaming showdown.
            </p>
            <p className="font-silkscreen text-[10px] sm:text-xs text-white uppercase tracking-[0.2em] font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              Code. Compete. Conquer.
            </p>
          </div>

          {/* Centered High-Attention Countdown Box */}
          <div className="w-full max-w-md my-1">
            <CountdownBox />
          </div>

          {/* Centered High-Attention Hero CTAs */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap w-full mt-1">
            <Link
              to="/events"
              onClick={() => playSynthSound('laser')}
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-md bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-600 text-white font-pixel text-xs sm:text-sm uppercase tracking-wider border border-red-400/60 shadow-[0_0_25px_rgba(255,51,51,0.7)] hover:shadow-[0_0_35px_rgba(255,51,51,1)] transition-all flex items-center gap-2 sm:gap-2.5 font-bold active:scale-95"
            >
              <span>🏆</span> EXPLORE EVENTS <span>→</span>
            </Link>
            
            <Link
              to="/schedule"
              onClick={() => playSynthSound('click')}
              className="px-5 py-3 sm:px-7 sm:py-4 rounded-md bg-bg-card hover:bg-white/10 text-white font-pixel text-xs sm:text-sm uppercase tracking-wider border border-white/25 hover:border-white/50 transition-all flex items-center gap-2 active:scale-95"
            >
              HOW IT WORKS <span className="text-red-500 text-xs sm:text-sm">▶</span>
            </Link>
          </div>
        </div>

        {/* 4 Neon Archway Event Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 items-stretch mt-4">
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
    <div className="relative border border-red-600/60 bg-black/80 p-3 sm:p-5 rounded-lg shadow-[0_0_25px_rgba(255,51,51,0.25)] flex flex-col items-center gap-2 sm:gap-3">
      {/* Corner Ticks */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-red-500" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-red-500" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-red-500" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-red-500" />

      <span className="font-pixel text-[9px] sm:text-xs text-red-500 uppercase tracking-widest flex items-center gap-2">
        <span className="w-4 sm:w-6 h-[1px] bg-red-600/50" />
        THE BATTLE BEGINS IN
        <span className="w-4 sm:w-6 h-[1px] bg-red-600/50" />
      </span>

      <div className="grid grid-cols-4 gap-2 sm:gap-5 text-center w-full max-w-sm">
        <div>
          <span className="font-pixel text-xl sm:text-3xl text-white block">{String(time.days).padStart(2, '0')}</span>
          <span className="font-pixel text-[8px] sm:text-[9px] text-text-muted uppercase">DAYS</span>
        </div>
        <div>
          <span className="font-pixel text-xl sm:text-3xl text-white block">{String(time.hours).padStart(2, '0')}</span>
          <span className="font-pixel text-[8px] sm:text-[9px] text-text-muted uppercase">HRS</span>
        </div>
        <div>
          <span className="font-pixel text-xl sm:text-3xl text-white block">{String(time.minutes).padStart(2, '0')}</span>
          <span className="font-pixel text-[8px] sm:text-[9px] text-text-muted uppercase">MINS</span>
        </div>
        <div>
          <span className="font-pixel text-xl sm:text-3xl text-white block">{String(time.seconds).padStart(2, '0')}</span>
          <span className="font-pixel text-[8px] sm:text-[9px] text-text-muted uppercase">SECS</span>
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
      className="group cursor-pointer relative flex flex-col items-center w-full transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Archway Image - Ultra HD Crisp with Subtle Glow */}
      <div className="relative w-full aspect-[4/6] sm:aspect-[4/6.4] min-h-[190px] sm:min-h-[290px] overflow-hidden flex items-center justify-center z-10">
        {data.customImage ? (
          <img
            src={data.customImage}
            alt={data.title}
            className="w-full h-full object-contain rounded-t-full transition-transform duration-500 group-hover:scale-105 pixel-crisp"
            style={{
              filter: `drop-shadow(0 0 10px ${data.color}) contrast(1.15) brightness(1.08)`,
            }}
          />
        ) : (
          <div
            className="w-full h-full transition-transform duration-500 group-hover:scale-105 transform-gpu pixel-crisp"
            style={{
              backgroundImage: "url('/archways_seamless.png')",
              backgroundSize: '400% 100%',
              backgroundPosition: data.bgPos,
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
              filter: `drop-shadow(0 0 8px ${data.color}) contrast(1.15) brightness(1.08) saturate(1.2)`,
            }}
          />
        )}
      </div>

      {/* Details Footer - Below Archway */}
      <div className="w-full flex flex-col gap-1 text-center mt-1 z-10">
        <h3
          className="font-pixel text-[11px] sm:text-xs font-bold leading-tight tracking-wide"
          style={{
            color: data.color,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)',
          }}
        >
          {data.title}
        </h3>
        <p className="font-body text-[11px] text-text-secondary line-clamp-1 leading-tight">{data.desc}</p>

        <div className="mt-1 flex flex-col gap-0.5 items-center">
          <span className="font-pixel text-[9px] text-text-muted uppercase flex items-center gap-1">
            <span>👤</span> {data.format}
          </span>
          <span
            className="font-pixel text-xs font-bold"
            style={{
              color: data.color,
            }}
          >
            {data.price}
          </span>
        </div>

        {/* Animated Chevron Arrow */}
        <span
          className="font-pixel text-[10px] mt-0.5 animate-bounce"
          style={{
            color: data.color,
          }}
        >
          vv
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
