import React, { useState, useEffect } from 'react';
import { getEvents } from '../lib/firestore';
import { EventsPageClient } from './events/EventsPageClient';
import type { Event } from '../types';

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
  }, []);

  // Map Firestore Event[] to SpectrumEvent[] expected by new UI component
  const mappedEvents = events.map(ev => ({
    id: ev.id,
    index: ev.id === 'tech-duo-1' ? '01' : ev.id === 'tech-solo-1' ? '02' : ev.id === 'non-tech-1' ? '03' : '04',
    order: ev.id === 'tech-duo-1' ? 1 : ev.id === 'tech-solo-1' ? 2 : ev.id === 'non-tech-1' ? 3 : 4,
    category: ev.category === 'TECH' ? 'Coding' : 'Gaming',
    name: ev.name,
    shortName: ev.name,
    tag: ev.oneLineDescription || ev.description,
    format: ev.isTeamEvent ? 'Team Event' : 'Individual',
    fee: ev.price ? `₹${ev.price}` : 'Free',
    feeNumeric: ev.price || 0,
    capacity: ev.maxMembers,
    teamSize: `${ev.minMembers}-${ev.maxMembers} Members`,
    difficulty: 3,
    color: ev.id === 'tech-duo-1' ? '#6FBF5B' : ev.id === 'tech-solo-1' ? '#8B6FD9' : ev.id === 'non-tech-1' ? '#F2B705' : '#8FD3F4',
    duration: 'Round based',
    description: ev.description,
    rules: ev.roundDetails || [],
    prizes: [],
    registrationEnds: 'Closing soon',
    registrationEndsAt: '',
    registrationOpen: ev.registrationOpen,
    imageUrl: null
  }));

  return <EventsPageClient events={mappedEvents} />;
}
