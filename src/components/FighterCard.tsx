import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PixelSprite } from './PixelSprite';
import { usePageCurl } from './PageCurlTransition';
import { playSynthSound } from '../lib/audio';

import { DUSTIN_MAP, DUSTIN_MAP_SM, DUSTIN_MAP_CELEBRATE, DUSTIN_PALETTE, DUSTIN_IDLE_REGION } from '../sprites/dustin';
import { ELEVEN_MAP, ELEVEN_MAP_SM, ELEVEN_MAP_CELEBRATE, ELEVEN_PALETTE, ELEVEN_IDLE_REGION } from '../sprites/eleven';
import { STEVE_MAP, STEVE_MAP_SM, STEVE_MAP_CELEBRATE, STEVE_PALETTE, STEVE_IDLE_REGION } from '../sprites/steve';
import { LUCAS_MAP, LUCAS_MAP_SM, LUCAS_MAP_CELEBRATE, LUCAS_PALETTE, LUCAS_IDLE_REGION } from '../sprites/lucas';
import { MAX_MAP, MAX_MAP_SM, MAX_MAP_CELEBRATE, MAX_PALETTE, MAX_IDLE_REGION } from '../sprites/max';

export type EventCharacter = 'dustin' | 'eleven' | 'steve' | 'lucas' | 'max';

const CHARACTER_DATA: Record<EventCharacter, {
  map: string[][];
  mapSm: string[][];
  celebrateMap: string[][];
  palette: Record<string, string>;
  idleRegion: { row: number; col: number }[];
  name: string;
}> = {
  dustin: { map: DUSTIN_MAP, mapSm: DUSTIN_MAP_SM, celebrateMap: DUSTIN_MAP_CELEBRATE, palette: DUSTIN_PALETTE, idleRegion: DUSTIN_IDLE_REGION, name: 'DUSTIN' },
  eleven: { map: ELEVEN_MAP, mapSm: ELEVEN_MAP_SM, celebrateMap: ELEVEN_MAP_CELEBRATE, palette: ELEVEN_PALETTE, idleRegion: ELEVEN_IDLE_REGION, name: 'ELEVEN' },
  steve:  { map: STEVE_MAP,  mapSm: STEVE_MAP_SM,  celebrateMap: STEVE_MAP_CELEBRATE,  palette: STEVE_PALETTE,  idleRegion: STEVE_IDLE_REGION,  name: 'STEVE'  },
  lucas:  { map: LUCAS_MAP,  mapSm: LUCAS_MAP_SM,  celebrateMap: LUCAS_MAP_CELEBRATE,  palette: LUCAS_PALETTE,  idleRegion: LUCAS_IDLE_REGION,  name: 'LUCAS'  },
  max:    { map: MAX_MAP,    mapSm: MAX_MAP_SM,    celebrateMap: MAX_MAP_CELEBRATE,    palette: MAX_PALETTE,    idleRegion: MAX_IDLE_REGION,    name: 'MAX'    },
};


export interface FighterEvent {
  id: string;
  name: string;
  character: EventCharacter;
  panelNumber: '01' | '02' | '03' | '04';
  category: string;
  format: string;
  teamSize: string;
  entryFee: string;
  status: 'OPEN' | 'CLOSED' | 'FULL';
  enlistedCount: number;
  subEvents?: string[];
}

interface FighterCardProps {
  event: FighterEvent;
  panelIndex: number;
}

/**
 * FighterCard — one event panel in the Choose Your Fighter grid.
 *
 * Idle:   sprite in outline state + panel number + event name + enlisted counter
 * Hover:  sprite colors in (staggered rows) + stat-block flips up replacing lower-third
 * Click:  if OPEN → page-curl to /register/:id
 *         if CLOSED/FULL → shake animation + status flash
 * Mobile: tap1 = color+stats (instant), tap2 = navigate, tap elsewhere = reset
 *
 * Uses existing comic card styling: 2.5px solid var(--border-comic), box-shadow 4px 4px 0
 */
export function FighterCard({ event, panelIndex }: FighterCardProps) {
  const { startCurl } = usePageCurl();
  const [hovered, setHovered] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const isMobile = useMemo(() => window.innerWidth < 768, []);
  const isTouchRef = useRef(false);
  const char = CHARACTER_DATA[event.character];
  // Use small map on mobile or sm screen
  const [useSmMap, setUseSmMap] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handler = () => setUseSmMap(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const activeMap = useSmMap ? char.mapSm : char.map;
  const activeSize = useSmMap ? 'sm' as const : 'lg' as const;

  // Dismiss on outside tap (mobile)
  useEffect(() => {
    if (!mobileExpanded) return;
    const handler = (e: TouchEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) {
        setMobileExpanded(false);
      }
    };
    document.addEventListener('touchstart', handler);
    return () => document.removeEventListener('touchstart', handler);
  }, [mobileExpanded]);

  const handleNavigate = useCallback(() => {
    if (event.status === 'OPEN') {
      playSynthSound('laser');
      startCurl('forward', `/register/${event.id}`);
    } else {
      // Shake
      setShaking(true);
      playSynthSound('click');
      setTimeout(() => setShaking(false), 400);
    }
  }, [event.id, event.status, startCurl]);

  const handleClick = useCallback(() => {
    if (isTouchRef.current) return; // handled by touch
    handleNavigate();
  }, [handleNavigate]);

  const handleTouchStart = useCallback(() => {
    isTouchRef.current = true;
    if (!mobileExpanded) {
      setMobileExpanded(true);
    } else {
      handleNavigate();
    }
  }, [mobileExpanded, handleNavigate]);

  const spriteState = (hovered && !isMobile) || mobileExpanded ? 'colored' : 'outline';
  const showStatBlock = (hovered && !isMobile) || mobileExpanded;

  const statusColor = event.status === 'OPEN' ? '#22c55e' : '#ef4444';
  const statusIcon = event.status === 'OPEN' ? '✓' : '✗';

  return (
    <div
      ref={cardRef}
      className=""
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      style={{
        position: 'relative',
        border: '2.5px solid var(--border-color)',
        boxShadow: '4px 4px 0 var(--border-color)',
        background: 'var(--panel-bg)',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 0,
        userSelect: 'none',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        animation: shaking && !prefersReduced ? 'fighter-shake 300ms ease-out' : undefined,
        // Hover lift
        transform: hovered && !isMobile && !shaking ? 'translate(-2px, -2px)' : undefined,
      }}
    >
      {/* Panel number top-left */}
      <span style={{
        position: 'absolute',
        top: 8,
        left: 10,
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 500,
        fontSize: 11,
        color: 'var(--color-text-muted)',
        letterSpacing: '0.06em',
      }}>
        {event.panelNumber}
      </span>

      {/* Sprite */}
      <div style={{ marginBottom: 8, position: 'relative' }}>
        <PixelSprite
          map={activeMap}
          palette={char.palette}
          celebrateMap={char.celebrateMap}
          size={activeSize}
          state={spriteState}
          animate={!mobileExpanded && !hovered}
          idleRegion={char.idleRegion}
        />
      </div>

      {/* Lower third — flips between name/event and stat block */}
      <div
        style={{
          width: '100%',
          minHeight: 120,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Default lower-third: character name + event name */}
        <div
          className=""
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 12px 12px',
            transformOrigin: 'bottom center',
            transform: showStatBlock && !prefersReduced ? 'rotateX(-90deg)' : 'rotateX(0deg)',
            opacity: showStatBlock && prefersReduced ? 0 : 1,
            transition: `transform 250ms ease-in, opacity 50ms`,
            backfaceVisibility: 'hidden',
          }}
        >
          <span style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 14,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            {char.name}
          </span>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            lineHeight: 1.2,
          }}>
            {event.name}
          </span>

          {/* Enlisted counter stamp */}
          <div style={{
            marginTop: 10,
            transform: 'rotate(-2deg)',
            border: '2px solid var(--border-color)',
            padding: '2px 8px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: 11,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {event.enlistedCount} enlisted
          </div>
        </div>

        {/* Stat block — flips in from bottom */}
        <div
          className=""
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '8px 12px 10px',
            transformOrigin: 'bottom center',
            transform: showStatBlock
              ? prefersReduced ? 'rotateX(0deg)' : 'rotateX(0deg)'
              : prefersReduced ? 'rotateX(0deg)' : 'rotateX(90deg)',
            opacity: showStatBlock ? 1 : prefersReduced ? 0 : 1,
            transition: showStatBlock
              ? `transform 250ms ease-out 200ms, opacity ${prefersReduced ? '150ms' : '0ms'}`
              : `transform 0ms, opacity 0ms`,
            backfaceVisibility: 'hidden',
            pointerEvents: showStatBlock ? 'auto' : 'none',
          }}
        >
          {[
            { label: 'FORMAT', value: event.format },
            { label: 'TEAM SIZE', value: event.teamSize },
            { label: 'ENTRY FEE', value: event.entryFee },
            { label: 'STATUS', value: `${event.status} ${statusIcon}`, color: statusColor, flash: shaking },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 500,
                fontSize: 10,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {row.label}
              </span>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: 11,
                color: row.color || 'var(--color-text-primary)',
                textTransform: 'uppercase',
                animation: row.flash && shaking ? 'status-flash 400ms ease' : undefined,
              }}>
                {row.value}
              </span>
            </div>
          ))}

          {/* Sub-events (if any) */}
          {event.subEvents && event.subEvents.length > 0 && (
            <div style={{
              marginTop: 4,
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: 4,
              maxHeight: 54,
              overflowY: 'auto',
            }}>
              {event.subEvents.map((se, i) => (
                <div key={i} style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 10,
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.4,
                  paddingTop: 2,
                }}>
                  › {se}
                </div>
              ))}
            </div>
          )}

          {/* Click hint */}
          {event.status === 'OPEN' && (
            <div style={{
              marginTop: 4,
              fontFamily: 'Bangers, cursive',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              letterSpacing: '0.05em',
              opacity: 0.7,
            }}>
              {isMobile ? 'TAP AGAIN TO REGISTER' : 'CLICK TO REGISTER ›'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
