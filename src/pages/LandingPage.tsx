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

      {/* Subtitle */}
      <p
        style={{
          position: 'relative',
          zIndex: 20,
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

      {/* CTA Buttons */}
      <div className="mt-8 flex justify-center gap-4 flex-wrap relative z-20">
        <Link
          to="/login?redirect=register"
          onClick={() => playSynthSound('laser')}
          className="comic-btn"
          style={{ fontSize: '20px', padding: '12px 28px', textDecoration: 'none' }}
        >
          REGISTER NOW
        </Link>
        <Link
          to="/login"
          onClick={() => playSynthSound('click')}
          className="comic-btn-outline"
          style={{ fontSize: '20px', padding: '12px 28px', textDecoration: 'none' }}
        >
          SIGN UP / SIGN IN
        </Link>
      </div>
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
    <div className="flex items-center gap-1 leading-none" style={{ fontFamily: 'Bangers, cursive' }}>
      <SingleDigit char={display[0]} />
      <SingleDigit char={display[1]} />
    </div>
  );
}

function SingleDigit({ char }: { char: string }) {
  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ 
        width: '1.2ch', 
        height: '1.1em', 
        overflow: 'visible',
        fontFamily: 'Bangers, cursive'
      }}
    >
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
            textDecoration: 'none'
          }}
        >
          VIEW FULL TIMELINE &amp; SCHEDULE
        </Link>
      </div>

      {/* ── Venue & Contact Section ── */}
      <section className="mt-8 p-6 comic-border-thick comic-shadow" style={{ background: 'var(--panel-bg)' }}>
        <div className="flex items-center gap-4 mb-8">
          <div
            className="comic-badge flex items-center gap-2"
            style={{
              fontSize: '20px',
              padding: '6px 16px',
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg-base)',
              transform: 'rotate(-1.5deg)',
            }}
          >
            VENUE &amp; CONTACT
          </div>
          <div style={{ flex: 1, height: '4px', background: 'var(--border-color)' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column: Details */}
          <div className="flex flex-col gap-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <div>
              <h4 style={{ fontFamily: 'Bangers, cursive', fontSize: '24px', letterSpacing: '0.04em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                LOCATION
              </h4>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500, lineHeight: 1.6 }}>
                SVKM's Shri Bhagubhai Mafatlal Polytechnic<br />
                Irla, Vile Parle West, Mumbai, Maharashtra 400056
              </p>
            </div>

            <div>
              <h4 style={{ fontFamily: 'Bangers, cursive', fontSize: '24px', letterSpacing: '0.04em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                REGISTRATION SUPPORT
              </h4>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500, lineHeight: 1.6 }}>
                For queries related to passes, payments, or team registration:
              </p>
              <ul className="mt-3 flex flex-col gap-2" style={{ listStyle: 'none', padding: 0 }}>
                <li>
                  <strong>Email:</strong> <a href="mailto:spectrum.sbmp@gmail.com" style={{ color: 'var(--color-text-primary)', textDecoration: 'underline' }}>spectrum.sbmp@gmail.com</a>
                </li>
                <li>
                  <strong>Helpline:</strong> <a href="tel:+919876543210" style={{ color: 'var(--color-text-primary)', textDecoration: 'underline' }}>+91 98765 43210</a> (Registration Desk)
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Google Maps Embed */}
          <div className="comic-border-medium overflow-hidden h-[300px] relative">
            <iframe
              title="SVKM's Shri Bhagubhai Mafatlal Polytechnic Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.0814986701886!2d72.8354924!3d19.1150493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9db1d607a97%3A0xe54199c0cb8788a1!2sSVKM's%20Shri%20Bhagubhai%20Mafatlal%20Polytechnic!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>

    </main>
  );
}

function EventCard({ event, participantCount }: { event: Event; participantCount: number }) {
  const full = isEventFull(event);
  const open = canRegister(event);
  const badge = EVENT_BADGE[event.name] ?? categoryLabel(event.category);
  const isSolo = event.minMembers === 1 && event.maxMembers === 1;
  const isDuo = event.minMembers === 2 && event.maxMembers === 2;

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
        <div className="p-5 pb-2">
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
              {isSolo ? 'SOLO' : isDuo ? 'DUO' : 'TEAM'}
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
              marginBottom: '12px',
            }}
          >
            {event.name}
          </h3>

          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div><strong>Format:</strong> {isSolo ? 'Solo Participation' : isDuo ? 'Duo Team' : 'Squad/Team Event'}</div>
            <div><strong>Team Size:</strong> {event.maxMembers === 1 ? '1 Player' : `${event.minMembers}-${event.maxMembers} Players`}</div>
            <div><strong>Entry Fee:</strong> ₹{event.price}</div>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="p-5 pt-0 flex gap-3 mt-4">
        <Link
          to={`/event/${event.id}`}
          onClick={() => playSynthSound('click')}
          className="comic-btn-outline flex-1 text-center"
          style={{ fontSize: '16px', padding: '10px 12px', textDecoration: 'none' }}
        >
          DETAILS
        </Link>
        {open ? (
          <Link
            to={`/login?redirect=register&eventId=${event.id}`}
            onClick={() => playSynthSound('laser')}
            className="comic-btn flex-1 text-center"
            style={{ fontSize: '16px', padding: '10px 12px', textDecoration: 'none' }}
          >
            REGISTER
          </Link>
        ) : (
          <div
            className="comic-btn-outline flex-1 text-center"
            style={{ fontSize: '14px', padding: '10px 12px', opacity: 0.5, cursor: 'not-allowed' }}
          >
            {full ? 'FULL' : 'CLOSED'}
          </div>
        )}
      </div>
    </article>
  );
}
