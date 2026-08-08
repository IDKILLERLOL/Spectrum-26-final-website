import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { getEvent } from '../lib/firestore';
import type { Event } from '../types';
import { categoryLabel, canRegister, isEventFull } from '../types';
import { playSynthSound } from '../lib/audio';
import { motion } from 'motion/react';

const TECH_ROUND_DETAILS: Record<string, string[]> = {
  'Dual Debug': [
    "Sub-Event 1: Swap Challenge — Duos solve 3 coding problems in Round 1, strategize in a 5-min break, then swap places to solve their teammate's remaining unsolved challenges in Round 2.",
    "Sub-Event 2: Codopoly — A 2v2v2v2 board game where topic tiles (DSA, Networks, OS, DBMS) are claimed by answering questions correctly, charging question taxes/penalties to opponents.",
    "Sub-Event 3: Snakes & Ladders — Dodge snakes and climb ladders by opting into solving hard and extra-hard tech challenges on a shared digital board."
  ],
  'Code Clash': [
    "Sub-Event 1: MCQ Round — Rapid-fire multiple-choice tournament where speed and accuracy determine scoring as timers tick down.",
    "Sub-Event 2: Bingo — 4-5 players play on a shared CS topic grid, claiming cells and winning points, aiming to complete a line first.",
    "Sub-Event 3: Buzzer Round — Solo battle featuring 31 questions of escalating difficulty using a fastest-finger-buzzer system with wrong answer penalties."
  ]
};

export function PublicEventDetailPage() {
  console.log("[Mount] PublicEventDetailPage component loaded");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRounds, setShowRounds] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getEvent(id)
      .then((ev) => setEvent(ev))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="w-full min-h-screen flex flex-col py-16 px-6 max-w-3xl mx-auto gap-8">
        <div className="skeleton h-12 w-48" />
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-32 w-full" />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center px-6">
        <div className="text-center flex flex-col gap-4">
          <ShieldAlert size={48} className="mx-auto text-primary animate-bounce" />
          <p className="font-heading text-heading text-text-secondary uppercase tracking-widest">Event Not Found</p>
          <button onClick={() => navigate(-1)} className="font-button text-button text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-bg-base transition-colors uppercase cursor-pointer bg-transparent">Back</button>
        </div>
      </main>
    );
  }

  const isSolo = event.minMembers === 1 && event.maxMembers === 1;
  const isDuo = event.minMembers === 2 && event.maxMembers === 2;
  const open = canRegister(event);
  const full = isEventFull(event);

  const roundsToRender = (event.roundDetails && event.roundDetails.length > 0)
    ? event.roundDetails
         : TECH_ROUND_DETAILS[event.name];

  return (
    <main className="relative z-10 w-full min-h-screen py-12 px-6 max-w-3xl mx-auto flex flex-col gap-10">
      {/* Back button */}
      <button
        onClick={() => {
          playSynthSound('click');
          navigate(-1);
        }}
        className="inline-flex items-center gap-2 text-primary hover:opacity-75 transition-opacity font-heading text-heading uppercase w-fit bg-transparent border-none cursor-pointer p-0"
        style={{ textDecoration: 'none' }}
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Main card */}
      <motion.article
        layoutId={`card-${event.id}`}
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="p-8 comic-border-thick comic-shadow"
        style={{ background: 'var(--panel-bg)' }}
      >
        {/* Badges */}
        <div className="flex gap-3 mb-6">
          <span
            className="comic-badge px-3 py-1 text-sm"
            style={{
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg-base)',
              transform: 'rotate(-1deg)',
            }}
          >
            {categoryLabel(event.category)}
          </span>
          <span
            className="comic-badge px-3 py-1 text-sm"
            style={{
              transform: 'rotate(1deg)',
            }}
          >
            {isSolo ? 'SOLO' : isDuo ? 'DUO' : 'TEAM'}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(44px, 8vw, 64px)',
            lineHeight: 1.0,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-4deg)',
            marginBottom: '16px',
          }}
        >
          {event.name}
        </h1>

        {/* Description */}
        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'var(--color-text-secondary)',
            marginBottom: '32px',
          }}
        >
          {event.description || 'Details coming soon.'}
        </p>

        {/* Info Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y-2 border-primary mb-8"
          style={{ borderColor: 'var(--border-color)', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Format</span>
            <div style={{ fontSize: '18px', color: 'var(--color-text-primary)', fontWeight: 700, marginTop: '4px' }}>
              {isSolo ? 'Individual' : isDuo ? 'Duo Partners' : 'Team / Squad'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Team Size</span>
            <div style={{ fontSize: '18px', color: 'var(--color-text-primary)', fontWeight: 700, marginTop: '4px' }}>
              {event.minMembers === event.maxMembers
                ? (event.minMembers === 2 ? 'Only 2 Players Per Duo' : `Only ${event.minMembers} Player${event.minMembers > 1 ? 's' : ''} Allowed`)
                : `${event.minMembers} – ${event.maxMembers} Players`}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Entry Fee</span>
            <div style={{ fontSize: '18px', color: 'var(--color-text-primary)', fontWeight: 700, marginTop: '4px' }}>
              ₹{event.price}
            </div>
          </div>
        </div>

        {/* Event expandable round details */}
        {roundsToRender && roundsToRender.length > 0 && (
          <div className="mb-8 pt-2 text-left" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <button
              onClick={() => {
                playSynthSound('click');
                setShowRounds(!showRounds);
              }}
              style={{
                background: 'transparent',
                border: '1.5px solid var(--color-primary)',
                color: 'var(--color-primary)',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                padding: '8px 16px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            >
              {showRounds ? 'Hide Round-by-Round Details' : 'Show Round-by-Round Details'}
            </button>

            {showRounds && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderLeft: '3px solid var(--color-primary)' }} className="flex flex-col gap-3 font-body text-small text-text-secondary leading-relaxed">
                {roundsToRender.map((round, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{round}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA area */}
        <div>
          {open ? (
            <Link
              to={`/register/${event.id}`}
              onClick={() => playSynthSound('laser')}
              className="comic-btn text-center w-full block"
              style={{ fontSize: '24px', padding: '14px 28px', textDecoration: 'none' }}
            >
              REGISTER FOR THIS EVENT
            </Link>
          ) : (
            <div
              className="comic-btn-outline text-center w-full block"
              style={{ fontSize: '20px', padding: '14px 28px', opacity: 0.5, cursor: 'not-allowed' }}
            >
              {full ? 'REGISTRATION FULL' : 'REGISTRATIONS CLOSED'}
            </div>
          )}
        </div>
      </motion.article>
    </main>
  );
}
