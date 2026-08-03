import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { getEvent } from '../lib/firestore';
import type { Event } from '../types';
import { categoryLabel, canRegister, isEventFull } from '../types';
import { playSynthSound } from '../lib/audio';

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
