import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { getEvent } from '../lib/firestore';
import type { Event } from '../types';
import { EventDetailPageClient } from './events/[eventId]/EventDetailPageClient';

export function PublicEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
          <button onClick={() => navigate(-1)} className="font-button text-button text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-bg-base transition-colors uppercase cursor-pointer bg-transparent">Back</button>
        </div>
      </main>
    );
  }

  // Map Firestore Event to SpectrumEvent expected by the new UI detail component
  const mappedEvent = {
    id: event.id,
    index: event.id === 'tech-duo-1' ? '01' : event.id === 'tech-solo-1' ? '02' : event.id === 'non-tech-1' ? '03' : '04',
    order: event.id === 'tech-duo-1' ? 1 : event.id === 'tech-solo-1' ? 2 : event.id === 'non-tech-1' ? 3 : 4,
    category: event.category === 'TECH' ? 'Coding' : 'Gaming',
    name: event.name,
    shortName: event.name,
    tag: event.oneLineDescription || event.description,
    format: event.isTeamEvent ? 'Team Event' : 'Individual',
    fee: event.price ? `₹${event.price}` : 'Free',
    feeNumeric: event.price || 0,
    capacity: event.maxMembers,
    teamSize: `${event.minMembers}-${event.maxMembers} Members`,
    difficulty: event.id === 'tech-duo-1' ? 3 : event.id === 'tech-solo-1' ? 2 : event.id === 'non-tech-1' ? 4 : 3,
    color: event.id === 'tech-duo-1' ? '#6FBF5B' : event.id === 'tech-solo-1' ? '#8B6FD9' : event.id === 'non-tech-1' ? '#F2B705' : '#8FD3F4',
    duration: 'Round based',
    description: event.description,
    rules: event.roundDetails || [],
    prizes: [
      { place: "1st Place", reward: "Trophy + Goodies" },
      { place: "2nd Place", reward: "Trophy + Goodies" },
      { place: "3rd Place", reward: "Certificate + Goodies" },
    ],
    registrationEnds: 'Closing soon',
    registrationEndsAt: '',
    registrationOpen: event.registrationOpen,
    imageUrl: null
  };

  return <EventDetailPageClient event={mappedEvent} />;
}
