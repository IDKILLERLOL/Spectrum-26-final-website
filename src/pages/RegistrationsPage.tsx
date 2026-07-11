import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getMyRegistrations } from '../lib/firestore';
import { getEvent } from '../lib/firestore';
import type { Registration, Event } from '../types';
import { categoryLabel } from '../types';

type RegWithEvent = Registration & { event: Event | null };

export function RegistrationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<RegWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<RegWithEvent | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

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
      <main className="w-full min-h-screen flex flex-col py-8 px-6 max-w-7xl mx-auto gap-14">
        <header className="flex flex-col gap-6 border-b-2 border-primary pb-8">
          <div className="skeleton h-16 w-48 rounded" />
          <div className="skeleton h-5 w-80 rounded" />
        </header>
        <div className="flex flex-col gap-6">
          {[1, 2].map((i) => <div key={i} className="skeleton h-28 w-full rounded" />)}
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="w-full min-h-screen flex flex-col items-center justify-center py-8 px-6 max-w-7xl mx-auto gap-8">
        <h1 className="font-hero text-[32px] md:text-[48px] uppercase tracking-widest text-primary text-center">
          No Passes Yet
        </h1>
        <p className="font-body text-body text-text-secondary text-center max-w-md">
          You haven't registered for anything yet.
        </p>
        <Link
          to="/"
          className="bg-primary text-bg-base font-button text-button px-8 py-4 hover:scale-[1.02] transition-transform duration-180 uppercase tracking-widest"
        >
          View Events
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen flex flex-col py-8 px-6 md:px-6 max-w-7xl mx-auto gap-14 md:gap-24">
      <header className="flex flex-col gap-6 border-b-2 border-primary pb-8">
        <h1 className="font-hero text-[48px] md:text-[64px] leading-none uppercase tracking-widest text-primary">
          My Passes
        </h1>
        <p className="font-body text-body text-text-secondary max-w-2xl">
          Your authorized event clearances and active registrations for SPECTRUM 26.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <RegistrationCard
            key={item.id}
            reg={item}
            onSelect={() => {
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
  const borderClass = isTech ? 'border-solid' : 'border-dashed';
  const isPending = reg.feeStatus === 'PENDING';

  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer bg-bg-card hover:bg-bg-card-hover border border-solid border-border-default p-6 transition-all duration-180 hover:scale-[1.01] flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex flex-col gap-4 relative z-10 w-full md:w-auto">
        <div className="flex items-center gap-4">
          <span className={`font-micro text-micro border ${isTech ? 'border-primary' : 'border-dashed border-border-default'} text-primary px-2 py-1 uppercase tracking-widest`}>
            {reg.event ? categoryLabel(reg.event.category) : '—'}
          </span>
        </div>

        <h3 className="font-heading text-card-title text-primary uppercase flex items-center flex-wrap gap-2">
          {reg.event?.name ?? 'Unknown Event'}
          {reg.teamName && (
            <span className="font-body text-small text-text-primary border border-primary px-2 py-0.5 uppercase ml-2 bg-primary/5">
              Team: {reg.teamName}
            </span>
          )}
        </h3>

        <div className="flex flex-wrap items-center gap-4 md:gap-8 font-micro text-micro text-text-secondary uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <Clock size={14} /> Registered
          </span>
          <span>{reg.event?.isTeamEvent ? 'Team' : 'Solo'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto gap-6 mt-4 md:mt-0 relative z-10 pt-4 md:pt-0 border-t border-border-subtle md:border-t-0">
        <div className={`font-micro text-micro uppercase tracking-widest flex items-center gap-2 border px-3 py-1 ${isPending ? 'border-primary text-primary' : 'border-primary text-bg-base bg-primary'}`}>
          {isPending ? <Clock size={14} /> : <CheckCircle2 size={14} />}
          {isPending ? 'Pending' : 'Paid'}
        </div>
        <div className="w-10 h-10 border border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-bg-base transition-colors">
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
}
