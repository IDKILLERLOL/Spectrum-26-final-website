import { Link } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EVENT_DATE } from "../config";
import { getEvents, db } from "../lib/firestore";
import { getDocs, collection, query, where } from "firebase/firestore";
import type { Event } from "../types";
import { canRegister, categoryLabel, isEventFull, FALLBACK_EVENTS } from "../types";
import { SpeedLines } from "../components/SpeedLines";
import { playSynthSound } from "../lib/audio";

export function LandingPage() {
  return (
    <div className="relative z-10">
      <SpeedLines />
      <Hero />
      <Events />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <header className="relative z-10 max-w-5xl mx-auto w-[92%] mt-12 text-center">
      {/* Crosshatch decoration behind hero */}
      <div
        className="absolute inset-0 hatch-pattern pointer-events-none"
        style={{
          borderRadius: '50%',
          transform: 'scale(0.9) skewY(-3deg)',
        }}
      />

      {/* Main Title */}
      <div className="relative inline-block mb-2">
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

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'Bangers, cursive',
          fontSize: 'clamp(18px, 3vw, 28px)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-text-primary)',
          marginTop: '16px',
        }}
      >
        // CRISIS COMBAT ENGINE READY
      </p>

      {/* Countdown */}
      <Countdown />
    </header>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

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
    { value: time.seconds, label: 'Secs', invert: true },
  ];

  return (
    <div
      className="mt-8 inline-flex items-center justify-center gap-4 comic-border-thick comic-shadow max-w-full"
      style={{
        background: 'var(--panel-bg)',
        padding: '16px 24px',
        transform: 'rotate(1deg)',
      }}
    >
      <div
        className="flex items-center gap-2 md:gap-3"
        style={{
          fontFamily: 'Bangers, cursive',
          fontSize: 'clamp(32px, 6vw, 52px)',
          color: 'var(--color-text-primary)',
        }}
      >
        {units.map(({ value, label, invert }, i) => (
          <Fragment key={label}>
            <div className="text-center" style={{ minWidth: '60px' }}>
              <div
                className="comic-border-medium leading-none"
                style={{
                  padding: '6px 8px',
                  background: invert ? 'var(--color-text-primary)' : 'var(--badge-bg)',
                  color: invert ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
                }}
              >
                <FlipDigits value={value} />
              </div>
              <div
                style={{
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  marginTop: '6px',
                  color: 'var(--color-text-primary)',
                }}
              >
                {label}
              </div>
            </div>
            {i < units.length - 1 && (
              <span className="animate-pulse" style={{ opacity: 0.4 }}>:</span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function FlipDigits({ value }: { value: number }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex items-center gap-1 leading-none font-bold" style={{ fontFamily: '"Gravitas One", serif' }}>
      <SingleDigit char={display[0]} />
      <SingleDigit char={display[1]} />
    </div>
  );
}

function SingleDigit({ char }: { char: string }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '1.2ch', height: '1.1em', overflow: 'visible' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={char}
          initial={{ y: '-80%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '80%', opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
          className="absolute inline-block"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// Comic-style badge text per event name
const EVENT_BADGE: Record<string, string> = {
  'Code Prism': '010101',
  'Reverse Engineering': 'DEBUGGER',
  'Speed Typing': '160 WPM',
  'BGMI': 'RED ZONE',
  'Free Fire': 'SHOOT!',
  'FC 26': 'GOAL!',
};



// ─── Events Section ───────────────────────────────────────────────────────────

function EventCardSkeleton() {
  return (
    <div
      className="comic-shadow flex flex-col gap-4 overflow-hidden"
      style={{ background: 'var(--panel-bg)' }}
    >
      <div className="skeleton m-3" style={{ height: '176px' }} />
      <div className="px-5 pb-5 flex flex-col gap-3">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-12 w-full mt-2" />
      </div>
    </div>
  );
}

function Events() {
  const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setLoading(true);
    getEvents()
      .then((data) => { if (data && data.length > 0) setEvents(data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    getDocs(query(collection(db, 'teamMembers'), where('status', '==', 'ACTIVE')))
      .then(async (memsSnap) => {
        const regsSnap = await getDocs(collection(db, 'registrations'));
        const regToEventMap = new Map<string, string>();
        for (const doc of regsSnap.docs) regToEventMap.set(doc.id, doc.data().eventId);
        const counts: Record<string, number> = {};
        for (const doc of memsSnap.docs) {
          const evId = regToEventMap.get(doc.data().registrationId);
          if (evId) counts[evId] = (counts[evId] || 0) + 1;
        }
        setParticipantCounts(counts);
      })
      .catch(console.error);
  }, []);

  const techEvents = events.filter((e) => e.category === 'TECH');
  const nonTechEvents = events.filter((e) => e.category === 'NON_TECH');

  return (
    <main id="events" className="relative z-10 max-w-7xl mx-auto w-[92%] mt-16 flex flex-col gap-16">

      {/* ── TECH EVENTS ── */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div
            className="comic-badge flex items-center gap-2"
            style={{
              fontSize: '20px',
              padding: '6px 16px',
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg-base)',
              transform: 'rotate(-2deg)',
            }}
          >
            TECH COMBATANTS
          </div>
          <div style={{ flex: 1, height: '4px', background: 'var(--border-color)' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
            : techEvents.length > 0
              ? techEvents.map((e) => <EventCard key={e.id} event={e} participantCount={participantCounts[e.id] ?? 0} />)
              : <p style={{ fontFamily: 'Space Grotesk', color: 'var(--color-text-muted)', gridColumn: 'span 3' }}>Tech events coming soon.</p>
          }
        </div>
      </section>

      {/* ── NON-TECH EVENTS ── */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div
            className="comic-badge flex items-center gap-2"
            style={{
              fontSize: '20px',
              padding: '6px 16px',
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg-base)',
              transform: 'rotate(-2deg)',
            }}
          >
            TACTICAL GAMING
          </div>
          <div style={{ flex: 1, height: '4px', background: 'var(--border-color)' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
            : nonTechEvents.length > 0
              ? nonTechEvents.map((e) => <EventCard key={e.id} event={e} participantCount={participantCounts[e.id] ?? 0} />)
              : <p style={{ fontFamily: 'Space Grotesk', color: 'var(--color-text-muted)', gridColumn: 'span 3' }}>Non-tech events coming soon.</p>
          }
        </div>
      </section>

      {/* ── Schedule CTA ── */}
      <div className="text-center my-10">
        <Link
          to="/schedule"
          onClick={() => playSynthSound('zap')}
          className="comic-btn mx-auto"
          style={{
            fontSize: 'clamp(20px, 3vw, 32px)',
            padding: '16px 32px',
            transform: 'skewX(-6deg)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          VIEW FULL TIMELINE &amp; SCHEDULE
        </Link>
      </div>

    </main>
  );
}

function EventCard({ event, participantCount }: { event: Event; participantCount: number }) {
  const isTech = event.category === 'TECH';
  const full = isEventFull(event);
  const open = canRegister(event);
  const badge = EVENT_BADGE[event.name] ?? categoryLabel(event.category);

  return (
    <article
      className="comic-border-thick comic-shadow overflow-hidden flex flex-col justify-between group"
      style={{ background: 'var(--panel-bg)' }}
    >
      <div>
        {/* Card header with category info and enlisted count */}
        <div className="flex justify-between items-center px-5 pt-5 pb-2">
          <span
            className="comic-badge px-2 py-0.5 text-xs"
            style={{
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg-base)',
              fontSize: '10px',
              transform: 'rotate(2deg)',
            }}
          >
            {badge}
          </span>
          <span
            className="comic-badge px-2 py-0.5 text-xs"
            style={{
              fontSize: '10px',
              transform: 'rotate(-1deg)',
            }}
          >
            {participantCount} enlisted
          </span>
        </div>

        {/* Card body */}
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className="comic-badge px-2 py-0.5"
              style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}
            >
              {categoryLabel(event.category)}
            </span>
            <span
              className="comic-badge px-2 py-0.5"
              style={{
                fontSize: '11px',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                background: 'var(--color-text-primary)',
                color: 'var(--color-bg-base)',
                border: '2px solid var(--border-color)',
              }}
            >
              {event.isTeamEvent ? 'SQUAD' : 'SOLO'}
            </span>
            {event.price != null && (
              <span
                className="comic-badge px-2 py-0.5"
                style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}
              >
                ₹{event.price}
              </span>
            )}
          </div>

          <h3
            style={{
              fontFamily: 'Bangers, cursive',
              fontSize: '28px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
              marginBottom: '8px',
            }}
          >
            {event.name}
          </h3>

          <p
            className="line-clamp-2"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.55,
              opacity: 0.85,
            }}
          >
            {event.description || 'Details coming soon.'}
          </p>
        </div>
      </div>

      {/* CTA button */}
      <div className="p-5 pt-0">
        {open ? (
          <Link
            to={`/login?redirect=register&eventId=${event.id}`}
            onClick={() => playSynthSound('laser')}
            className="comic-btn w-full"
            style={{ fontSize: '20px', padding: '10px 20px' }}
          >
            REGISTER FOR COMBAT
          </Link>
        ) : (
          <div
            className="comic-btn-outline w-full"
            style={{ fontSize: '18px', padding: '10px 20px', opacity: 0.5, cursor: 'not-allowed' }}
          >
            {full ? 'SECTOR FULL' : 'CLOSED'}
          </div>
        )}
      </div>
    </article>
  );
}
