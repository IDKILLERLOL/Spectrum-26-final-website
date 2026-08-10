import React, { useState, useEffect } from 'react';
import { getEvents, getWinners, Event, Winner } from '../lib/firestore';

const INK = "#1A1A1A";
const VERMILION = "#C7382F";
const TEAL = "#12595B";
const MUSTARD = "#E8A13A";
const JUTE = "#D9C9A3";
const hoardingShadow = `4px 4px 0px ${INK}`;
const softHoardingShadow = `2px 2px 0px ${INK}`;

export function WinnersPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
    getWinners().then(setWinners).catch(console.error);
  }, []);

  const filteredWinners = winners.filter(w => activeFilter === 'ALL' || w.eventId === activeFilter);

  return (
    <div className="flex flex-col gap-6 px-4 py-16 w-full min-h-screen max-w-lg mx-auto text-left">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-hero text-3xl" style={{ color: VERMILION, textShadow: `1px 1px 0 ${INK}` }}>
          Champions
        </h2>
        <p className="text-sm font-bold uppercase tracking-widest font-body" style={{ color: TEAL }}>
          Elite Combatants
        </p>
      </div>

      {/* Filters Tab Bar */}
      <div className="flex gap-2 overflow-x-auto py-2 whitespace-nowrap">
        <button
          onClick={() => setActiveFilter('ALL')}
          className="px-4 py-2 border-2 text-sm font-hero uppercase"
          style={{
            borderColor: INK,
            background: activeFilter === 'ALL' ? MUSTARD : 'white',
            color: INK,
            boxShadow: activeFilter === 'ALL' ? softHoardingShadow : 'none'
          }}
        >
          All
        </button>
        {events.map((e) => (
          <button
            key={e.id}
            onClick={() => setActiveFilter(e.id)}
            className="px-4 py-2 border-2 text-sm font-hero uppercase"
            style={{
              borderColor: INK,
              background: activeFilter === e.id ? MUSTARD : 'white',
              color: INK,
              boxShadow: activeFilter === e.id ? softHoardingShadow : 'none'
            }}
          >
            {e.name}
          </button>
        ))}
      </div>

      {/* Winners List */}
      <div className="flex flex-col gap-6 mt-4">
        {filteredWinners.map((winner) => (
          <div 
            key={winner.id} 
            className="border-4 bg-white p-5 flex flex-col gap-2 relative" 
            style={{ borderColor: INK, boxShadow: hoardingShadow }}
          >
            <div className="flex justify-between items-center border-b-2 pb-2" style={{ borderColor: INK }}>
              <span className="font-hero text-lg" style={{ color: INK }}>{winner.name}</span>
              <span className="font-hero text-xs uppercase" style={{ color: VERMILION }}>
                Rank #{winner.rank}
              </span>
            </div>
            <div className="font-body text-sm font-bold mt-2" style={{ color: TEAL }}>
              Event: {winner.eventName}
            </div>
            {winner.college && (
              <div className="font-body text-xs text-opacity-80" style={{ color: INK }}>
                Representing: {winner.college}
              </div>
            )}
          </div>
        ))}

        {filteredWinners.length === 0 && (
          <div 
            className="border-4 border-dashed p-10 text-center font-hero text-sm bg-white" 
            style={{ borderColor: TEAL, color: TEAL }}
          >
            No Champions Declared Yet
          </div>
        )}
      </div>
    </div>
  );
}
