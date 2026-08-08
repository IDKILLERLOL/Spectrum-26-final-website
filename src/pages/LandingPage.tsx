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
    subEvents: ['Swap Challenge', 'Codopoly', 'Snakes & Ladders'],
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setIsMobile(window.innerWidth < 768);
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
      
      {/* Section 1: Surface & Fighter Arena */}
      {/* Disable 300vh height on mobile to allow normal document flow */}
      <div style={{ position: 'relative', height: isMobile ? 'auto' : '300vh', width: '100%' }}>
        
        {/* Sticky viewport content container */}
        <div
          style={{
            position: isMobile ? 'relative' : 'sticky',
            top: 0,
            width: '100%',
            height: isMobile ? 'auto' : '100vh',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isMobile ? 'flex-start' : 'space-between',
            padding: isMobile ? '20px 0 0 0' : '40px 0 0 0',
            overflow: isMobile ? 'visible' : 'clip',
          }}
        >
          {/* Hero text translating up and fading out as scroll progress builds */}
          <div
            style={{
              position: isMobile ? 'relative' : 'absolute',
              top: isMobile ? '0' : '40px',
              left: 0,
              right: 0,
              transform: isMobile ? 'none' : `translateY(${-scrollY * 0.8}px)`,
              opacity: isMobile ? 1 : (scrollY > 150 ? Math.max(0, 1 - (scrollY - 150) / 250) : 1),
              transition: 'transform 0.05s ease-out, opacity 0.1s ease-out',
              zIndex: 30,
              pointerEvents: (scrollY > 200 && !isMobile) ? 'none' : 'auto',
            }}
          >
            <Hero />
          </div>

          {/* Fighter Character Selection Screen */}
          <ChooseFighter isMobile={isMobile} walkFactor={walkFactor} />
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


function ChooseFighter({ isMobile, walkFactor }: { isMobile: boolean; walkFactor: number }) {
  const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const { startCurl } = usePageCurl();
  const [shake, setShake] = useState(false);

  const [mobileIdx, setMobileIdx] = useState(0);

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

  const listToRender = fighters;

  return (
    <div
      style={{
        display: isMobile ? 'grid' : 'flex',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'none',
        flexDirection: isMobile ? undefined : 'row',
        justifyContent: 'space-around',
        alignItems: isMobile ? 'start' : 'flex-end',
        gap: isMobile ? '20px 12px' : '16px',
        maxWidth: '1100px',
        margin: 'auto auto 0 auto',
        width: '92%',
        zIndex: 10,
        position: 'relative',
        minHeight: '480px',
        paddingTop: isMobile ? '40px' : '260px',
        paddingBottom: isMobile ? '60px' : '0px',
        opacity: isMobile ? 1 : walkFactor,
        transition: 'opacity 0.2s ease-out',
      }}
    >
      {listToRender.map((f) => {
        const originalIdx = fighters.findIndex(item => item.id === f.id);
        const char = GAME_CHARACTER_DATA[f.character];
        const isColumnActive = isMobile ? true : activeCharacterIdx === originalIdx;

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
              width: '100%',
              minWidth: isMobile ? 'auto' : '200px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-out, opacity 0.2s ease-out',
              transform: isColumnActive ? 'scale(1.02) translateY(-2px)' : 'scale(0.95)',
            }}
          >
            {/* 1. Details Box above head - anchored at bottom to expand upwards (positioned relatively in flow on mobile) */}
            <div
              style={{
                position: isMobile ? 'relative' : 'absolute',
                bottom: isMobile ? 'auto' : '254px',
                left: isMobile ? 'auto' : '50%',
                transform: isMobile ? 'none' : 'translateX(-50%)',
                width: '100%',
                maxWidth: '240px',
                height: isMobile ? '210px' : (isColumnActive ? '270px' : '95px'),
                background: 'linear-gradient(to bottom, rgba(10, 15, 30, 0.92) 0%, rgba(10, 15, 30, 0.3) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: isColumnActive ? '1.5px solid rgba(255, 51, 51, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isColumnActive ? '0 0 15px rgba(255, 51, 51, 0.3)' : 'none',
                padding: isMobile ? '8px 10px' : (isColumnActive ? '14px 16px' : '10px 12px'),
                fontFamily: 'Space Grotesk, sans-serif',
                transition: 'all 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                zIndex: isColumnActive ? 50 : 10,
                marginBottom: isMobile ? '12px' : '0px',
              }}
            >
              {isColumnActive ? (
                /* Expanded Detail Mode */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 3 : 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: 'Bangers, cursive', fontSize: isMobile ? '16px' : '22px', color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
                        {f.name}
                      </span>
                      <span style={{ fontSize: isMobile ? '9px' : '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        {f.enlistedCount} ENLISTED
                      </span>
                    </div>
                    <div style={{ fontSize: isMobile ? '11px' : '13.5px', color: 'var(--color-text-secondary)', lineHeight: isMobile ? 1.25 : 1.4, maxHeight: isMobile ? '55px' : '85px', overflow: 'hidden' }}>
                      {events.find(e => e.id === f.id)?.shortDescription || events.find(e => e.id === f.id)?.description}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : 4, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: isMobile ? 4 : 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? '10px' : '12px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>FORMAT:</span>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>{f.format}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? '10px' : '12px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>FEE:</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{f.entryFee}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: isMobile ? '6px' : '10px' }}>
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
                          fontSize: isMobile ? '9px' : '11px',
                          fontWeight: 700,
                          padding: isMobile ? '6px 0' : '8px 0',
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
                          fontSize: isMobile ? '9px' : '11px',
                          fontWeight: 700,
                          padding: isMobile ? '6px 0' : '8px 0',
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

            {/* Float container wrapper around name tag & sprite image */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: 'character-idle-float 1.2s steps(2) infinite',
                animationDelay: `${originalIdx % 2 === 0 ? '0s' : '-0.6s'}`,
                width: '100%',
              }}
            >
              {/* 2. Character Name tag above head */}
              <span
                style={{
                  fontFamily: 'Bangers, cursive',
                  fontSize: isMobile ? 14 : 18,
                  color: isColumnActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: isMobile ? 4 : 8,
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
                    width: isMobile ? 110 : 170,
                    height: isMobile ? 135 : 210,
                    objectFit: 'contain',
                    filter: isColumnActive
                      ? 'drop-shadow(0 0 12px rgba(255,51,51,0.9)) brightness(1.1)'
                      : 'brightness(0.75)',
                    transition: 'all 0.15s ease',
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes arcade-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes character-idle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.25rem); }
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
      ` }} />
    </div>
  );
}

function Hero() {
  return (
    <header className="relative z-10 max-w-5xl mx-auto w-[92%] mt-16 sm:mt-36 text-center">
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
      <Link
        to="/events"
        onClick={(e) => {
          e.stopPropagation();
          try { playSynthSound('laser'); } catch {}
          try { startCurl('forward', '/events'); } catch {}
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="inline-flex items-center gap-2 cursor-pointer relative z-50 pointer-events-auto"
        style={{
          background: 'var(--color-primary)',
          color: '#ffffff',
          fontFamily: 'Bangers, cursive',
          fontSize: '22px',
          padding: '8px 24px',
          letterSpacing: '0.08em',
          textDecoration: 'none',
          border: '2px solid #ffffff',
          boxShadow: '0 0 12px rgba(255, 51, 51, 0.5)',
          transition: 'all 0.15s ease',
          cursor: 'pointer',
          marginTop: '8px',
          pointerEvents: 'auto',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
        }}
      >
        VIEW ALL EVENTS →
      </Link>
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
          className="relative block cursor-pointer group"
          title="Click to open in Google Maps"
          style={{ border: '2px solid var(--color-primary)', height: '300px', width: '100%', overflow: 'hidden' }}
        >
          <iframe
            title="SVKM's Shri Bhagubhai Mafatlal Polytechnic Location"
            src="https://maps.google.com/maps?q=SVKM's%20Shri%20Bhagubhai%20Mafatlal%20Polytechnic&t=&z=16&ie=UTF8&iwloc=&output=embed"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
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
