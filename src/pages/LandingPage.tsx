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

      {/* CTA Buttons */}
      <div className="mt-8 flex justify-center gap-4 flex-wrap relative z-20">
        <Link
          to="/events"
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
          SIGN IN
        </Link>
      </div>
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
    <div
      className="flex gap-3 md:gap-4 justify-center items-center mt-10 relative z-20 flex-wrap select-none"
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
  );
}

function VenueContact() {
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
  );
}
