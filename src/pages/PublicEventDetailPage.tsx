import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { getEvent } from '../lib/firestore';
import type { Event } from '../types';
import { categoryLabel, canRegister, isEventFull } from '../types';
import { playSynthSound } from '../lib/audio';

const TECH_ROUND_DETAILS: Record<string, string[]> = {
  'Codopoly': [
    "Overview: A 2v2v2v2 multiplayer board game featuring 4 teams of 2 players.",
    "Board Layout: Mirrors standard Monopoly but properties are replaced by core CS and Tech topics (DSA, Computer Networks, OS, DBMS).",
    "Mechanics: Landing on a topic tile requires answering a question from that category to claim/own the property tile.",
    "Property Tax: Landing on an opponent's owned tile incurs a question tax or score point penalty.",
    "Chance/Chest: Special action cards award buffs (steals, skips, extra turns) or debuffs (fines, missed turns).",
    "Win Condition: Highest cumulative points or most property tiles owned when time expires."
  ],
  'Swap Challenge': [
    "Round 1 (30 Mins): Each duo is assigned 3 coding challenges (1 Easy, 1 Medium, 1 Hard) and solves as many as possible concurrently.",
    "Collaboration Break (5 Mins): A short strategy window to review approaches and explain progress to each other.",
    "Round 2 (30 Mins): Swapping places. Members must attempt to solve the remaining unsolved coding challenges left by their partner.",
    "Scoring: Based on solved problem count and submission timestamps."
  ],
  'Snakes & Ladders': [
    "Board Layout: Standard 100-tile board played on a shared screen.",
    "Snakes: Landing on a snake triggers a Hard question. Correct answers bypass the slide; incorrect answers slide you down.",
    "Ladders: Landing on a ladder triggers a very Hard question. Correct answers let you climb; incorrect answers leave you at the bottom.",
    "Win Condition: First team to reach tile 100 wins."
  ],
  'MCQ — Kahoot Eliminator': [
    "Format: Rapid-fire Kahoot-style MCQ session.",
    "Time Factor: Points decrease as the countdown timer ticks down; speed and accuracy are both critical.",
    "Eliminations: Bottom scorers are eliminated each round, leading to a final solo face-off."
  ],
  'Bingo': [
    "Matchup: 4-5 players per board playing on a shared computer science topic grid.",
    "Turns: Players take turns picking topic cells. Answering correctly marks the cell. Wrong answers remove the tile from play.",
    "Win Condition: First player to complete a straight line (horizontal, vertical, or diagonal) of marked cells calls BINGO and wins."
  ],
  'Buzzer Round': [
    "Format: Speed buzzing round featuring 31 questions of varying difficulty.",
    "Buzzers: Fastest finger gets the chance to answer.",
    "Penalties: Wrong answers deduct points. Choose wisely to avoid penalties."
  ]
};

export function PublicEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

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
          <Link to="/" className="font-button text-button text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-bg-base transition-colors uppercase">Back to home</Link>
        </div>
      </main>
    );
  }

  const isSolo = event.minMembers === 1 && event.maxMembers === 1;
  const isDuo = event.minMembers === 2 && event.maxMembers === 2;
  const open = canRegister(event);
  const full = isEventFull(event);

  return (
    <main className="relative z-10 w-full min-h-screen py-12 px-6 max-w-3xl mx-auto flex flex-col gap-10">
      {/* Back button */}
      <Link
        to="/"
        onClick={() => playSynthSound('click')}
        className="inline-flex items-center gap-2 text-primary hover:opacity-75 transition-opacity font-heading text-heading uppercase w-fit"
        style={{ textDecoration: 'none' }}
      >
        <ArrowLeft size={20} /> Back to Events
      </Link>

      {/* Main card */}
      <article className="p-8 comic-border-thick comic-shadow" style={{ background: 'var(--panel-bg)' }}>
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
              {event.maxMembers === 1 ? '1 Player' : `${event.minMembers} - ${event.maxMembers} Players`}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Entry Fee</span>
            <div style={{ fontSize: '18px', color: 'var(--color-text-primary)', fontWeight: 700, marginTop: '4px' }}>
              ₹{event.price}
            </div>
          </div>
        </div>

        {/* Tech event expandable round details */}
        {event.category === 'TECH' && TECH_ROUND_DETAILS[event.name] && (
          <div className="mb-8 pt-2 text-left" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <details className="group border border-border-default bg-bg-elevated p-4 cursor-pointer">
              <summary className="font-heading text-heading text-primary uppercase flex justify-between items-center select-none">
                <span>View Round-by-Round Mechanics</span>
                <span className="transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 flex flex-col gap-3 font-body text-small text-text-secondary leading-relaxed cursor-default">
                {TECH_ROUND_DETAILS[event.name].map((round, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{round}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* CTA area */}
        <div>
          {open ? (
            <Link
              to={`/login?redirect=register&eventId=${event.id}`}
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
      </article>
    </main>
  );
}
