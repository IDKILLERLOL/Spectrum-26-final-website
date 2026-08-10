import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { playSynthSound } from '../lib/audio';
import { CastleSVG, SkylineSVG } from '../components/PixelCharacters';

const EVENT_DATE = new Date('2026-09-30T09:00:00');

const ARCH_CARDS_DATA = [
  { id: 'tech-duo-1', title: 'DUAL DEBUG', category: 'Duo Coding Face-off', fee: '₹100 / Team', img: '/Green.png' },
  { id: 'tech-solo-1', title: 'SINGULARITY STRIKE', category: 'Solo Arena Battle', fee: '₹50', img: '/purple.png' },
  { id: 'non-tech-1', title: 'BGMI TOURNAMENT', category: 'Squad or Solo Battle', fee: '₹200 / Team', img: '/orange.png' },
  { id: 'non-tech-3', title: 'FC 26 SHOWDOWN', category: 'Digital Football Battle', fee: '₹50 / Player', img: '/blue.png' }
];

export function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, []);

  return (
    <div className="layout-offset-top layout-offset-bottom page-content container flex flex-col gap-12">
      {/* Hero Section */}
      <section className="hero">
        {/* Background elements from CSS spec */}
        <div className="hero-bg-castle">
          <CastleSVG />
        </div>
        <div className="hero-bg-city">
          <SkylineSVG />
        </div>

        {/* Content */}
        <div className="hero-content">
          <span className="hero-eyebrow">4 EVENTS. 1 ULTIMATE BATTLE.</span>
          <h1 className="hero-title">SPECTRUM 5.0</h1>
          <p className="hero-tagline">
            The ultimate tech and gaming showdown. Code. Compete. Conquer.
          </p>

          <div className="hero-actions">
            <Link
              to="/events"
              onClick={() => playSynthSound('laser')}
              className="btn btn-primary"
            >
              EXPLORE EVENTS
            </Link>
            <Link
              to="/schedule"
              onClick={() => playSynthSound('click')}
              className="btn btn-outline"
            >
              VIEW SCHEDULE
            </Link>
          </div>
        </div>
      </section>

      {/* Countdown Timer Block */}
      <section className="countdown-bar">
        <CountdownBar />
      </section>

      {/* Extra Info List */}
      <section className="pixel-card flex flex-col gap-4 text-left">
        <div className="flex items-start gap-3">
          <span className="highlight-icon" style={{ color: '#f59e0b' }}><i data-lucide="gift"></i></span>
          <div>
            <span className="font-ui text-sm font-bold text-text-primary uppercase block">EPIC REWARDS AWAIT</span>
            <span className="text-small text-text-secondary">Trophies, goodies and unforgettable memories.</span>
          </div>
        </div>
        <div className="flex items-start gap-3 border-t border-border/30 pt-3">
          <span className="highlight-icon" style={{ color: '#ef4444' }}><i data-lucide="calendar"></i></span>
          <div>
            <span className="font-ui text-sm font-bold text-text-primary uppercase block">30 SEPTEMBER 2026</span>
            <span className="text-small text-text-secondary">EVENT DATE</span>
          </div>
        </div>
        <div className="flex items-start gap-3 border-t border-border/30 pt-3">
          <span className="highlight-icon" style={{ color: '#f43f5e' }}><i data-lucide="map-pin"></i></span>
          <div>
            <span className="font-ui text-sm font-bold text-text-primary uppercase block">SVKM'S SHRI BHAGUBHAI MAFATLAL POLYTECHNIC</span>
            <span className="text-small text-text-secondary">COLLEGE OF ENGINEERING</span>
          </div>
        </div>
        <div className="flex items-start gap-3 border-t border-border/30 pt-3">
          <span className="highlight-icon" style={{ color: '#eab308' }}><i data-lucide="star"></i></span>
          <div>
            <span className="font-ui text-sm font-bold text-text-primary uppercase block">UNFORGETTABLE MEMORIES</span>
            <span className="text-small text-text-secondary">Make your mark on Spectrum 5.0.</span>
          </div>
        </div>
      </section>

      {/* Featured Events Grid */}
      <section className="flex flex-col gap-6">
        <div className="section-divider"><span>FEATURED EVENTS</span></div>
        <div className="featured-events">
          {ARCH_CARDS_DATA.map((card) => (
            <Link
              to={`/event/${card.id}`}
              key={card.id}
              onClick={() => playSynthSound('laser')}
              className="event-preview-card pixel-card"
            >
              <div className="event-preview-art flex items-center justify-center bg-bg-raised" style={{ color: 'var(--text-primary)' }}>
                <i data-lucide={card.id === 'tech-duo-1' ? 'code-2' : card.id === 'tech-solo-1' ? 'terminal' : card.id === 'non-tech-1' ? 'gamepad-2' : 'swords'} style={{ width: '28px', height: '28px' }}></i>
              </div>
              <div className="event-preview-art" style={{ display: 'none' }}>
                <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
              </div>
              <div className="event-preview-info">
                <h4 className="event-preview-name">{card.title}</h4>
                <span className="event-preview-tagline">{card.category}</span>
                <div className="event-preview-footer">
                  <span className="event-preview-fee">FEE: {card.fee}</span>
                </div>
              </div>
              <div className="event-preview-chevron">
                <i data-lucide="chevron-right"></i>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-2">
          <Link to="/events" onClick={() => playSynthSound('click')} className="btn btn-outline btn-full">
            VIEW ALL EVENTS
          </Link>
        </div>
      </section>
    </div>
  );
}

function CountdownBar() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="countdown-timer">
        <div className="countdown-unit">
          <span className="countdown-digit">{String(time.days).padStart(2, '0')}</span>
          <span className="countdown-label">Days</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-unit">
          <span className="countdown-digit">{String(time.hours).padStart(2, '0')}</span>
          <span className="countdown-label">Hrs</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-unit">
          <span className="countdown-digit">{String(time.minutes).padStart(2, '0')}</span>
          <span className="countdown-label">Mins</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-unit">
          <span className="countdown-digit">{String(time.seconds).padStart(2, '0')}</span>
          <span className="countdown-label">Secs</span>
        </div>
      </div>
      <div className="countdown-meta">
        <div className="countdown-meta-row">
          <i data-lucide="clock"></i>
          <span className="countdown-meta-text">THE BATTLE BEGINS IN</span>
        </div>
      </div>
    </>
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
