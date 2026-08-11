import React, { useState, useEffect } from 'react';
import { getEvents, getWinners } from '../lib/firestore';
import { WinnersPageClient } from './more/winners/WinnersPageClient';
import type { Event, Winner } from '../types';

export function WinnersPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
    getWinners().then(setWinners).catch(console.error);
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

  // Group winners by event
  const groupedWinners = winners.reduce((acc, curr) => {
    let group = acc.find(g => g.eventId === curr.eventId);
    if (!group) {
      group = { eventId: curr.eventId, winners: [] };
      acc.push(group);
    }
    group.winners.push({
      place: curr.rank === 1 ? '1st' : curr.rank === 2 ? '2nd' : '3rd',
      teamName: curr.name,
      members: []
    });
    // Sort winners by rank
    group.winners.sort((a: any, b: any) => {
      const aRank = a.place === '1st' ? 1 : a.place === '2nd' ? 2 : 3;
      const bRank = b.place === '1st' ? 1 : b.place === '2nd' ? 2 : 3;
      return aRank - bRank;
    });
    return acc;
  }, [] as any[]);

  // If no winners yet, provide a dummy overall group to prevent crashes
  if (groupedWinners.length === 0) {
    groupedWinners.push({
      eventId: 'overall',
      winners: []
    });
  }

  return <WinnersPageClient events={mappedEvents} currentEditionWinners={groupedWinners} />;
}
