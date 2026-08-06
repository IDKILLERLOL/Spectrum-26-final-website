import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_DATE } from '../config';
import { SpeedLines } from '../components/SpeedLines';
import { playSynthSound } from '../lib/audio';
import { FighterCard, type FighterEvent, type EventCharacter } from '../components/FighterCard';
import type { Event } from '../types';
import { FALLBACK_EVENTS } from '../types';
import { getEvents, getActiveMemberCountForEvent } from '../lib/firestore';
import { PixelSprite } from '../components/PixelSprite';
import { usePageCurl } from '../components/PageCurlTransition';

// Character mappings for retro renderer
import { DUSTIN_MAP, DUSTIN_PALETTE, DUSTIN_IDLE_REGION } from '../sprites/dustin';
import { ELEVEN_MAP, ELEVEN_PALETTE, ELEVEN_IDLE_REGION } from '../sprites/eleven';
import { STEVE_MAP, STEVE_PALETTE, STEVE_IDLE_REGION } from '../sprites/steve';
import { LUCAS_MAP, LUCAS_PALETTE, LUCAS_IDLE_REGION } from '../sprites/lucas';
import { MAX_MAP, MAX_PALETTE, MAX_IDLE_REGION } from '../sprites/max';


// Map Firestore event IDs → character + panel metadata
const EVENT_CHARACTER_MAP: Record<string, {
  character: EventCharacter;
  panelNumber: '01' | '02' | '03' | '04';
  format: string;
  subEvents?: string[];
}> = {
  'tech-duo-1': {
    character: 'max',
    panelNumber: '01',
    format: 'Duo Partners',
    subEvents: ['Codopoly', 'Swap Challenge', 'Snakes & Ladders'],
  },
  'tech-solo-1': {
    character: 'eleven',
    panelNumber: '02',
    format: 'Individual',
    subEvents: ['MCQ Round', 'Bingo', 'Buzzer Round'],
  },
  'non-tech-1': {
    character: 'steve',
    panelNumber: '03',
    format: 'Team / Squad',
  },
  'non-tech-3': {
    character: 'lucas',
    panelNumber: '04',
    format: 'Individual',
  },
};

// Ordered display
const EVENT_ORDER = ['tech-duo-1', 'tech-solo-1', 'non-tech-1', 'non-tech-3'];

function eventToFighter(event: Event, enlistedCount: number): FighterEvent | null {
  const meta = EVENT_CHARACTER_MAP[event.id];
  if (!meta) return null;

  const status: FighterEvent['status'] =
    !event.registrationOpen
      ? 'CLOSED'
      : event.maxTeams !== null && event.currentTeamCount >= event.maxTeams
        ? 'FULL'
        : 'OPEN';

  const teamSizeLabel = event.maxMembers === 1
    ? 'Only 1 Player'
    : event.minMembers === event.maxMembers
      ? `Only ${event.maxMembers} Players Per ${event.maxMembers === 2 ? 'Duo' : 'Team'}`
      : `${event.minMembers}–${event.maxMembers} Players`;

  const feeLabel = event.price === null
    ? 'TBA'
    : event.isTeamEvent
      ? `₹${event.price}/person`
      : `₹${event.price}`;

  return {
    id: event.id,
    name: event.name.toUpperCase(),
    character: meta.character,
    panelNumber: meta.panelNumber,
    category: `${event.category === 'TECH' ? 'TECH' : 'NON-TECH'} · ${event.isTeamEvent ? (event.maxMembers === 2 ? 'DUO' : 'TEAM') : 'SOLO'}`,
    format: meta.format,
    teamSize: teamSizeLabel,
    entryFee: feeLabel,
    status,
    enlistedCount,
    subEvents: meta.subEvents,
  };
}

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(800);
  const { startCurl } = usePageCurl();

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  // walkFactor maps scroll position (from 0.8*windowHeight to 1.8*windowHeight) to a 0..1 progress value
  const walkFactor = Math.min(1, Math.max(0, (scrollY - windowHeight * 0.8) / (windowHeight || 800)));

  return (
    <div className="relative w-full select-none" style={{ backgroundColor: 'transparent' }}>
      
      {/* Section 1: Surface & Fighter Arena (occupies 300vh height to allow scrolling characters in phase 2) */}
      <div style={{ position: 'relative', height: '300vh', width: '100%' }}>
        
        {/* Sticky viewport content container */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 0 0 0',
            overflow: 'clip',
          }}
        >
          {/* Hero text translating up and fading out as scroll progress builds */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: 0,
              right: 0,
              transform: `translateY(${-scrollY * 0.8}px)`,
              opacity: scrollY > 150 ? Math.max(0, 1 - (scrollY - 150) / 250) : 1,
              transition: 'transform 0.05s ease-out, opacity 0.1s ease-out',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <Hero />
          </div>

          {/* Fighter Character Selection Screen */}
          <ChooseFighter walkFactor={walkFactor} />
        </div>
      </div>

      {/* Section 2: Cave Landscape & Venue Contact (rises naturally and covers Section 1) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          backgroundImage: 'url(/cave.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 0 0 0',
          zIndex: 10,
          boxShadow: '0 -20px 30px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div style={{ width: '90%', maxWidth: '1100px', flex: 1 }}>
          <VenueContact />
        </div>
        {/* Embedded footer — sits on cave.jpeg, no background seam */}
        <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '40px' }}>
          <div style={{ width: '90%', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px', padding: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: 'Bangers, cursive', fontSize: '22px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-primary)', transform: 'skewX(-12deg)', display: 'inline-block' }}>
                SPECTRUM 26
              </span>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', opacity: 0.5 }}>
                // ALL SYSTEMS GO
              </span>
            </div>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: '18px', letterSpacing: '0.05em', color: 'var(--color-text-primary)' }}>
              SEPTEMBER 30, 2026
            </div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              © 2026 SPECTRUM CO.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




const GAME_CHARACTER_DATA: Record<EventCharacter, {
  map: string[][];
  palette: Record<string, string>;
  idleRegion: { row: number; col: number }[];
  name: string;
}> = {
  dustin: { map: DUSTIN_MAP, palette: DUSTIN_PALETTE, idleRegion: DUSTIN_IDLE_REGION, name: 'DUSTIN' },
  eleven: { map: ELEVEN_MAP, palette: ELEVEN_PALETTE, idleRegion: ELEVEN_IDLE_REGION, name: 'ELEVEN' },
  steve:  { map: STEVE_MAP,  palette: STEVE_PALETTE,  idleRegion: STEVE_IDLE_REGION,  name: 'STEVE'  },
  lucas:  { map: LUCAS_MAP,  palette: LUCAS_PALETTE,  idleRegion: LUCAS_IDLE_REGION,  name: 'LUCAS'  },
  max:    { map: MAX_MAP,    palette: MAX_PALETTE,    idleRegion: MAX_IDLE_REGION,    name: 'MAX'    },
};


function ChooseFighter({ walkFactor }: { walkFactor: number }) {
  const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const { startCurl } = usePageCurl();
  const [shake, setShake] = useState(false);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileIdx, setMobileIdx] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Load events from Firestore
    getEvents().then(dbEvents => {
      if (dbEvents.length > 0) setEvents(dbEvents);
    }).catch(e => {
      console.warn('[ChooseFighter] Firestore events load failed, using fallback', e);
    });

    // Load enlisted counts per event
    Promise.all(
      EVENT_ORDER.map(id =>
        getActiveMemberCountForEvent(id)
          .then(n => [id, n] as [string, number])
          .catch(() => [id, 0] as [string, number])
      )
    ).then(pairs => {
      setCounts(Object.fromEntries(pairs));
    }).catch(e => {
      console.warn('[ChooseFighter] Enlisted count load failed', e);
    });
  }, []);

  const fighters: FighterEvent[] = EVENT_ORDER
    .map(id => {
      const event = events.find(e => e.id === id);
      if (!event) return null;
      return eventToFighter(event, counts[id] ?? 0);
    })
    .filter((f): f is FighterEvent => f !== null);

  const activeFighter = selectedIdx !== null ? fighters[selectedIdx] : null;

  const handleSelect = (idx: number) => {
    if (idx !== selectedIdx) {
      playSynthSound('click');
      setSelectedIdx(idx);
    }
  };

  const handleDetailsLink = () => {
    if (!activeFighter) return;
    playSynthSound('laser');
    startCurl('forward', `/event/${activeFighter.id}`);
  };

  if (fighters.length === 0) return null;

  const [activeCharacterIdx, setActiveCharacterIdx] = useState<number | null>(null);

  const listToRender = isMobile ? [fighters[mobileIdx]] : fighters;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 16,
        maxWidth: '1100px',
        margin: 'auto auto 0 auto',
        width: '92%',
        zIndex: 10,
        position: 'relative',
        minHeight: '480px',
        paddingTop: '260px',
        paddingBottom: '0px',
        opacity: walkFactor,
        transition: 'opacity 0.2s ease-out',
      }}
    >
      {/* Mobile chevron navigation arrows */}
      {isMobile && (
        <>
          <button
            onClick={() => setMobileIdx(prev => (prev === 0 ? fighters.length - 1 : prev - 1))}
            style={{
              position: 'absolute',
              left: '10px',
              bottom: '120px',
              background: 'rgba(255, 51, 51, 0.9)',
              border: '2px solid #ffffff',
              color: '#ffffff',
              fontFamily: 'Bangers, cursive',
              fontSize: '28px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 60,
              boxShadow: '0px 0px 8px rgba(0,0,0,0.6)',
              padding: 0,
            }}
          >
            ‹
          </button>
          <button
            onClick={() => setMobileIdx(prev => (prev === fighters.length - 1 ? 0 : prev + 1))}
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '120px',
              background: 'rgba(255, 51, 51, 0.9)',
              border: '2px solid #ffffff',
              color: '#ffffff',
              fontFamily: 'Bangers, cursive',
              fontSize: '28px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 60,
              boxShadow: '0px 0px 8px rgba(0,0,0,0.6)',
              padding: 0,
            }}
          >
            ›
          </button>
        </>
      )}

      {listToRender.map((f) => {
        const originalIdx = fighters.findIndex(item => item.id === f.id);
        const char = GAME_CHARACTER_DATA[f.character];
        const isColumnActive = isMobile ? true : activeCharacterIdx === originalIdx;

        // No side sliding entrance transition
        const translateX = '0px';

        // Add a bobbing movement bounce when active scroll is occurring
        const isBobbing = walkFactor > 0.05 && walkFactor < 0.95;
        const bounceStyle = isBobbing ? 'arcade-bob 0.4s infinite alternate' : 'none';

        return (
          <div
            key={f.id}
            onMouseLeave={() => {
              if (!isMobile) setActiveCharacterIdx(null);
            }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '23%',
              minWidth: '200px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-out, opacity 0.2s ease-out',
              transform: translateX === '0px' && isColumnActive ? 'scale(1.05) translateY(-4px)' : `translateX(${translateX}) scale(0.95)`,
              animation: bounceStyle,
            }}
          >
            {/* 1. Details Box above head - anchored at bottom to expand upwards */}
            <div
              style={{
                position: 'absolute',
                bottom: '242px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '280px',
                height: isColumnActive ? '270px' : '95px',
                background: 'linear-gradient(to bottom, rgba(10, 15, 30, 0.92) 0%, rgba(10, 15, 30, 0.3) 100%)',
                backdropFilter: 'blur(8px)',
                border: isColumnActive ? '1.5px solid rgba(255, 51, 51, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isColumnActive ? '0 0 15px rgba(255, 51, 51, 0.3)' : 'none',
                padding: isColumnActive ? '14px 16px' : '10px 12px',
                fontFamily: 'Space Grotesk, sans-serif',
                transition: 'all 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                zIndex: isColumnActive ? 50 : 10,
              }}
            >
              {isColumnActive ? (
                /* Expanded Detail Mode */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: 'Bangers, cursive', fontSize: '22px', color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
                        {f.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        {f.enlistedCount} ENLISTED
                      </span>
                    </div>
                    <div style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.4, maxHeight: '85px', overflow: 'hidden' }}>
                      {events.find(e => e.id === f.id)?.shortDescription || events.find(e => e.id === f.id)?.description}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>FORMAT:</span>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>{f.format}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>FEE:</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{f.entryFee}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSynthSound('laser');
                          startCurl('forward', '/events');
                        }}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '8px 0',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSynthSound('laser');
                          startCurl('forward', `/register/${f.id}`);
                        }}
                        style={{
                          flex: 1,
                          background: 'var(--color-primary)',
                          border: '1px solid var(--color-primary)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '8px 0',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Compact Default Mode */
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bangers, cursive', fontSize: '20px', color: '#ffffff', letterSpacing: '0.04em' }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: 1.2, height: '32px', overflow: 'hidden' }}>
                    {events.find(e => e.id === f.id)?.oneLineDescription || 'No details available.'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {f.entryFee} • {f.format}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Character Name tag above head */}
            <span
              style={{
                fontFamily: 'Bangers, cursive',
                fontSize: 18,
                color: isColumnActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 8,
                zIndex: 1,
                textShadow: 'none',
                animation: isColumnActive ? 'arcade-blink 1.2s infinite' : 'none',
                transition: 'opacity 0.4s ease-out',
              }}
            >
              {isColumnActive ? `› ${char.name} ‹` : char.name}
            </span>

            {/* 3. Mapped PNG image render - triggers hover activation */}
            <div
              onMouseEnter={() => {
                if (!isMobile) setActiveCharacterIdx(originalIdx);
              }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <img
                src={{
                  dustin: '/Dustin.png',
                  eleven: '/Eleven.png',
                  steve: '/steve.png',
                  lucas: '/Lucas.png',
                  max: '/Max.png',
                }[f.character]}
                alt={char.name}
                style={{
                  imageRendering: 'pixelated',
                  width: 170,
                  height: 210,
                  objectFit: 'contain',
                  filter: isColumnActive
                    ? 'drop-shadow(0 0 12px rgba(255,51,51,0.9)) brightness(1.1)'
                    : 'brightness(0.75)',
                  transition: 'all 0.15s ease',
                }}
              />
            </div>
          </div>
        );
      })}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes arcade-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
          .arcade-hud {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .arcade-hud > div:last-child {
            padding-left: 0 !important;
            border-top: 1px dashed rgba(255,255,255,0.15) !important;
            padding-top: 12px !important;
          }
        }
      ` }} />
    </div>
  );
}

function Hero() {
  return (
    <header className="relative z-10 max-w-5xl mx-auto w-[92%] mt-36 text-center">
      {/* Crosshatch decoration behind hero */}
      <div
        className="absolute inset-0 hatch-pattern pointer-events-none"
        style={{
          borderRadius: '50%',
          transform: 'scale(0.9) skewY(-3deg)',
        }}
      />

      {/* Main Title */}
      <div className="relative inline-block mb-2" style={{ zIndex: 20 }}>
        <h1
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(60px, 12vw, 130px)',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-6deg)',
            display: 'block',
            userSelect: 'none',
          }}
        >
          SPECTRUM 26
        </h1>
      </div>

      {/* Countdown (moved up) */}
      <Countdown />

    </header>
  );
}

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, EVENT_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Countdown() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft);
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hrs' },
    { value: time.minutes, label: 'Mins' },
    { value: time.seconds, label: 'Secs' },
  ];

  return (
    <div className="flex flex-col items-center gap-4 mt-4 relative z-20">
      <div
        className="flex gap-6 md:gap-8 justify-center items-center flex-wrap select-none"
        style={{ fontFamily: 'Bangers, cursive' }}
      >
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col justify-center items-center"
            style={{
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            <span
              className="text-[44px] md:text-[68px] leading-none text-white"
              style={{ textShadow: 'none' }}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[12px] md:text-[14px] uppercase tracking-wider text-text-muted mt-1">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          playSynthSound('laser');
          startCurl('forward', '/events');
        }}
        style={{
          background: 'transparent',
          color: '#ffffff',
          fontFamily: 'Bangers, cursive',
          fontSize: '24px',
          letterSpacing: '0.08em',
          textDecoration: 'none',
          border: 'none',
          boxShadow: 'none',
          transition: 'color 0.15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
        }}
      >
        › VIEW EVENTS
      </button>
    </div>
  );
}

function VenueContact() {
  const [details, setDetails] = useState<any>(null);
  useEffect(() => {
    import('../lib/firestore').then(m => m.getEventDetails()).then(setDetails).catch(console.error);
  }, []);

  const locationText = details?.location || "SVKM's Shri Bhagubhai Mafatlal Polytechnic\nIrla, Vile Parle West, Mumbai, Maharashtra 400056";

  return (
    <section className="relative z-10 max-w-7xl mx-auto w-[92%] mt-8 p-6" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
      <div className="flex items-center gap-4 mb-8">
        <div
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: '28px',
            color: 'var(--color-primary)',
            textShadow: 'none',
          }}
        >
          › VENUE &amp; CONTACT
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Details */}
        <div className="flex flex-col gap-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <div>
            <h4 style={{ fontFamily: 'Bangers, cursive', fontSize: '24px', letterSpacing: '0.04em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              LOCATION
            </h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {locationText}
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Bangers, cursive', fontSize: '24px', letterSpacing: '0.04em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              REGISTRATION SUPPORT
            </h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500, lineHeight: 1.6, marginBottom: '16px' }}>
              For queries related to passes, payments, or team registration, reach out to us directly.
            </p>
            <Link
              to="/contact"
              style={{
                background: 'transparent',
                color: '#ffffff',
                fontFamily: 'Bangers, cursive',
                fontSize: '20px',
                letterSpacing: '0.06em',
                textDecoration: 'none',
                border: 'none',
                boxShadow: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
              }}
            >
              › CONTACT US
            </Link>
          </div>
        </div>

        {/* Right Column: Google Maps Embed */}
        <a 
          href="https://maps.app.goo.gl/jS54o8EKGNT7gRHS6"
          target="_blank"
          rel="noopener noreferrer"
          className="overflow-hidden h-[300px] relative block cursor-pointer group"
          title="Click to open in Google Maps"
          style={{ border: '2px solid var(--color-primary)' }}
        >
          <iframe
            title="SVKM's Shri Bhagubhai Mafatlal Polytechnic Location"
            src="https://maps.google.com/maps?q=SVKM's%20Shri%20Bhagubhai%20Mafatlal%20Polytechnic&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, pointerEvents: 'none' }}
            allowFullScreen
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold uppercase tracking-wider text-sm pointer-events-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Open in Google Maps ↗
          </div>
        </a>
      </div>
    </section>
  );
}
