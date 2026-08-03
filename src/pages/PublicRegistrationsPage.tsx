import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, db } from '../lib/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Event, Registration } from '../types';
import { playSynthSound } from '../lib/audio';
import { Loader2 } from 'lucide-react';

export function PublicRegistrationsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Load all events
  useEffect(() => {
    setLoadingEvents(true);
    getEvents()
      .then((evs) => {
        setEvents(evs);
        if (evs.length > 0) {
          setSelectedEventId(evs[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingEvents(false));
  }, []);

  // Load registrations when selected event changes
  useEffect(() => {
    if (!selectedEventId) return;
    setLoadingRegs(true);
    const regsRef = collection(db, 'registrations');
    const q = query(regsRef, where('eventId', '==', selectedEventId));
    getDocs(q)
      .then((snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
        setRegistrations(list);
      })
      .catch(console.error)
      .finally(() => setLoadingRegs(false));
  }, [selectedEventId]);

  if (loadingEvents) {
    return (
      <main className="w-full min-h-screen flex flex-col py-16 px-6 max-w-4xl mx-auto gap-8">
        <div className="skeleton h-12 w-48" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-32 w-full" />
      </main>
    );
  }

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <main className="relative z-10 w-full min-h-screen py-12 px-6 max-w-4xl mx-auto flex flex-col gap-10">
      {/* Header */}
      <header className="flex flex-col gap-4 pb-6" style={{ borderBottom: '4px solid var(--border-color)' }}>
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
          ARENA STATS
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
          Event Registrations
        </h1>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', color: 'var(--color-text-secondary)', opacity: 0.8 }}>
          View registered squads and contestants participating in different events.
        </p>
      </header>

      {/* Select Dropdown */}
      <div className="flex flex-col gap-2 p-6 comic-border-medium" style={{ background: 'var(--panel-bg)' }}>
        <label style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
          SELECT EVENT TO INSPECT
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => { playSynthSound('click'); setSelectedEventId(e.target.value); }}
          className="bg-transparent border-2 border-primary text-primary font-heading text-heading py-3 px-4 w-full focus:outline-none cursor-pointer rounded-none uppercase tracking-wide"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id} className="bg-bg-card text-white">
              {ev.name} ({ev.minMembers === 1 && ev.maxMembers === 1 ? 'Solo' : ev.minMembers === 2 && ev.maxMembers === 2 ? 'Duo' : 'Team'})
            </option>
          ))}
        </select>
        {selectedEvent && (
          <div className="mt-4 flex gap-4 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Link
              to={`/event/${selectedEvent.id}`}
              onClick={() => playSynthSound('click')}
              style={{ color: 'var(--color-text-primary)', textDecoration: 'underline' }}
            >
              View event rules & details
            </Link>
          </div>
        )}
      </div>

      {/* Registrations List */}
      <div className="flex flex-col gap-4">
        {loadingRegs ? (
          <div className="flex items-center justify-center py-12 gap-2 text-primary font-heading uppercase">
            <Loader2 className="animate-spin" size={20} /> Loading registrations...
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16 comic-border-thick border-dashed" style={{ color: 'var(--color-text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}>
            No registrations logged yet for this combat arena. Be the first to register!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="p-5 comic-border-medium comic-shadow flex flex-col justify-between"
                style={{ background: 'var(--panel-bg)' }}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
                      REG ID: #{reg.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className="comic-badge text-xs"
                      style={{
                        padding: '2px 8px',
                        background: reg.feeStatus === 'PAID' ? 'var(--color-text-primary)' : 'transparent',
                        color: reg.feeStatus === 'PAID' ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
                      }}
                    >
                      {reg.feeStatus}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'Bangers, cursive', fontSize: '24px', letterSpacing: '0.04em', color: 'var(--color-text-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {reg.teamName || 'Solo Competitor'}
                  </h3>
                </div>
                <div className="mt-4 pt-3 flex justify-between items-center" style={{ borderTop: '2px solid var(--border-color)' }}>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    Registered on: {new Date(reg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
