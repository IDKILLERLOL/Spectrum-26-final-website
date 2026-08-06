import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getMyRegistrations, getEvent } from '../lib/firestore';
import type { Registration, Event } from '../types';
import { categoryLabel } from '../types';
import { playSynthSound } from '../lib/audio';

type RegWithEvent = Registration & { event: Event | null };

export function RegistrationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<RegWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMyRegistrations(user.uid, user.email ?? undefined)
      .then(async (regs) => {
        const withEvents = await Promise.all(
          regs.map(async (r) => ({ ...r, event: await getEvent(r.eventId) }))
        );
        setItems(withEvents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <main className="w-full min-h-screen flex flex-col py-8 px-6 max-w-7xl mx-auto gap-12">
        <div className="skeleton h-16 w-48" />
        <div className="skeleton h-5 w-80" />
        <div className="flex flex-col gap-6">
          {[1, 2].map((i) => <div key={i} className="skeleton h-32 w-full" />)}
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="w-full min-h-screen flex flex-col items-center justify-center py-8 px-6 max-w-7xl mx-auto gap-8 text-center">
        <div
          className="comic-badge"
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: '44px',
            padding: '8px 24px',
            transform: 'rotate(-3deg)',
          }}
        >
          NO PANELS YET!
        </div>
        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            maxWidth: '380px',
            opacity: 0.8,
          }}
        >
          You haven't registered for any events yet. Step into the arena!
        </p>
        <Link
          to="/"
          onClick={() => playSynthSound('laser')}
          className="comic-btn"
          style={{ fontSize: '20px', padding: '12px 28px' }}
        >
          VIEW EVENTS
        </Link>
      </main>
    );
  }

  return (
    <main className="relative z-10 w-full min-h-screen flex flex-col py-8 max-w-7xl mx-auto gap-10 px-4 md:px-6">
      {/* Page header */}
      <header
        className="flex flex-col gap-4 pb-6"
        style={{ borderBottom: '4px solid var(--border-color)' }}
      >
        <span
          className="comic-badge inline-block"
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: '13px',
            padding: '3px 12px',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-base)',
            width: 'fit-content',
            transform: 'rotate(-1.5deg)',
          }}
        >
          YOUR CLEARANCES
        </span>
        <h1
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(44px, 8vw, 72px)',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-4deg)',
          }}
        >
          My Panels
        </h1>
        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            opacity: 0.8,
          }}
        >
          Your authorized event clearances and active registrations for SPECTRUM 26.
        </p>
      </header>

      {/* Registration cards */}
      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <RegistrationCard
            key={item.id}
            reg={item}
            onSelect={() => {
              playSynthSound('laser');
              sessionStorage.setItem('spectrum26_active_registration_id', item.id);
              navigate('/events');
            }}
          />
        ))}
      </div>
    </main>
  );
}

function RegistrationCard({ reg, onSelect }: { key?: React.Key; reg: RegWithEvent; onSelect: () => void }) {
  const isTech = reg.event?.category === 'TECH';
  const isPending = reg.feeStatus === 'PENDING';

  return (
    <div
      onClick={onSelect}
      className="comic-shadow cursor-pointer flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden"
      style={{
        background: 'var(--panel-bg)',
        padding: '20px 24px',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      }}
    >
      {/* Crosshatch on hover texture */}
      <div className="absolute inset-0 hatch-pattern pointer-events-none" style={{ opacity: 0.07 }} />

      {/* Left: event info */}
      <div className="flex flex-col gap-3 relative z-10 w-full md:w-auto">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="comic-badge"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.10em',
              padding: '2px 8px',
              background: isTech ? 'var(--color-text-primary)' : 'transparent',
              color: isTech ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
            }}
          >
            {reg.event ? categoryLabel(reg.event.category) : '—'}
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.10em',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
            }}
          >
            #{reg.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <h3
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: '28px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            lineHeight: 1.1,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {reg.event?.name ?? 'Unknown Event'}
          {reg.teamName && (
            <span
              className="comic-badge"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
              }}
            >
              {reg.teamName}
            </span>
          )}
        </h3>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            opacity: 0.8,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} /> Registered
          </span>
          <span>{reg.event?.isTeamEvent ? 'Squad' : 'Solo'}</span>
        </div>
      </div>

      {/* Right: status + arrow */}
      <div
        className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0 relative z-10"
        style={{ borderTop: '2px solid var(--color-border-subtle)' }}
      >
        <div
          className="comic-badge"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.10em',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isPending ? 'transparent' : 'var(--color-text-primary)',
            color: isPending ? 'var(--color-text-primary)' : 'var(--color-bg-base)',
            transform: 'rotate(-1deg)',
          }}
        >
          {isPending ? <Clock size={12} /> : <CheckCircle2 size={12} />}
          {isPending ? 'PENDING' : 'PAID'}
        </div>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            flexShrink: 0,
          }}
        >
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
}
