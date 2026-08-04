import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_DATE } from '../config';
import { SpeedLines } from '../components/SpeedLines';
import { playSynthSound } from '../lib/audio';

export function LandingPage() {
  return (
    <div className="relative z-10 flex flex-col gap-12 pb-16">
      <SpeedLines />
      <Hero />
      <VenueContact />
    </div>
  );
}

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
    { value: time.seconds, label: 'Secs', invert: true },
  ];

  return (
    <div className="flex flex-col items-center gap-6 mt-10 relative z-20">
      <div
        className="flex gap-3 md:gap-4 justify-center items-center flex-wrap select-none"
        style={{ fontFamily: 'Bangers, cursive' }}
      >
        {units.map((unit) => (
          <div
            key={unit.label}
            className="w-20 h-20 md:w-28 md:h-28 comic-border-thick flex flex-col justify-center items-center rotate-[-1deg]"
            style={{
              background: 'var(--panel-bg)',
              boxShadow: '4px 4px 0px var(--border-color)',
            }}
          >
            <span className="text-[36px] md:text-[54px] leading-none text-primary">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[12px] md:text-[14px] uppercase tracking-wider text-text-muted">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
      <Link
        to="/events"
        onClick={() => playSynthSound('laser')}
        className="comic-shadow-sm inline-flex items-center gap-2"
        style={{
          background: 'var(--color-text-primary)',
          color: 'var(--color-bg-base)',
          fontFamily: 'Bangers, cursive',
          fontSize: '20px',
          padding: '8px 24px',
          letterSpacing: '0.04em',
          textDecoration: 'none',
          border: '2px solid var(--color-bg-base)',
        }}
      >
        VIEW EVENTS
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
    <section className="relative z-10 max-w-7xl mx-auto w-[92%] mt-8 p-6 comic-border-thick comic-shadow" style={{ background: 'var(--panel-bg)' }}>
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
              className="comic-shadow-sm inline-flex items-center gap-2"
              style={{
                background: 'var(--color-text-primary)',
                color: 'var(--color-bg-base)',
                fontFamily: 'Bangers, cursive',
                fontSize: '18px',
                padding: '8px 20px',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                border: '2px solid var(--color-bg-base)',
              }}
            >
              CONTACT US
            </Link>
          </div>
        </div>

        {/* Right Column: Google Maps Embed */}
        <a 
          href="https://maps.app.goo.gl/jS54o8EKGNT7gRHS6"
          target="_blank"
          rel="noopener noreferrer"
          className="comic-border-medium overflow-hidden h-[300px] relative block cursor-pointer group"
          title="Click to open in Google Maps"
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
