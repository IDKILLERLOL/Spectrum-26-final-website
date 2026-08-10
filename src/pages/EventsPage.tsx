import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, Event } from '../lib/firestore';
import { playSynthSound } from '../lib/audio';

const INK = "#1A1A1A";
const VERMILION = "#C7382F";
const TEAL = "#12595B";
const MUSTARD = "#E8A13A";
const JUTE = "#D9C9A3";
const hoardingShadow = `4px 4px 0px ${INK}`;
const softHoardingShadow = `2px 2px 0px ${INK}`;

const ARCH_CARDS_DATA = [
  { id: 'tech-duo-1', index: '01', color: '#6FBF5B', tag: 'DUO CODING FACE-OFF.', format: 'Duo Partners', fee: '₹150 / person', name: 'Dual Debug' },
  { id: 'tech-solo-1', index: '02', color: '#8B6FD9', tag: 'SOLO ARENA BATTLE.', format: 'Individual', fee: '₹50', name: 'Singularity Strike' },
  { id: 'non-tech-1', index: '03', color: '#F2B705', tag: 'SQUAD UP. DROP IN. SURVIVE.', format: 'Team / Squad', fee: '₹800 / team', name: 'BGMI Tournament' },
  { id: 'non-tech-3', index: '04', color: '#8FD3F4', tag: '1V1 CONSOLE BATTLE.', format: '1 v 1 Solo', fee: '₹50', name: 'FC 26 Showdown' }
];

export function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-8 px-4 py-16 w-full min-h-screen max-w-lg mx-auto text-left">
      <div className="text-center">
        <h2 className="font-hero text-3xl" style={{ color: VERMILION, textShadow: `1px 1px 0 ${INK}` }}>
          Mela Arena
        </h2>
        <p className="text-sm font-bold uppercase tracking-widest font-body mt-1" style={{ color: TEAL }}>
          Choose your stall
        </p>
      </div>

      <div className="flex flex-col gap-10 mt-6">
        {ARCH_CARDS_DATA.map((ev) => (
          <div key={ev.id} className="relative border-4 bg-white pt-6" style={{ borderColor: INK, boxShadow: '6px 6px 0px #1A1A1A' }}>
            {/* Striped Card Awning */}
            <div className="absolute -top-3.5 left-0 right-0 flex h-3.5" style={{ borderTop: `2.5px solid ${INK}` }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex-1 border-r-2 border-b-2 rounded-b-sm" style={{ backgroundColor: i % 2 === 0 ? ev.color : '#fff', borderColor: INK }} />
              ))}
            </div>
            
            <div className="flex w-full items-start justify-between p-4">
              <div className="flex gap-3 items-center">
                <span
                  className="font-hero flex size-10 shrink-0 items-center justify-center text-lg border-2"
                  style={{ background: ev.color, color: INK, borderColor: INK, boxShadow: softHoardingShadow }}
                >
                  {ev.index}
                </span>
                <div>
                  <h3 className="font-hero text-xl" style={{ color: INK, fontFamily: "'Mukta', sans-serif", fontWeight: 800 }}>
                    {ev.name}
                  </h3>
                  <p className="text-xs font-bold uppercase font-body" style={{ color: TEAL }}>
                    {ev.tag}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right text-xs font-bold font-body" style={{ color: VERMILION }}>
                <div className="opacity-80">{ev.format}</div>
                <div className="text-sm mt-0.5" style={{ fontWeight: 800 }}>{ev.fee}</div>
              </div>
            </div>

            <div className="px-4 pb-4 mt-2">
              <button 
                onClick={() => {
                  playSynthSound('laser');
                  navigate('/register', { state: { selectedEventId: ev.id } });
                }}
                className="font-hero w-full py-3 text-sm border-2 uppercase tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 transition-transform" 
                style={{
                  borderColor: INK,
                  background: MUSTARD,
                  color: INK,
                  boxShadow: softHoardingShadow,
                }}
              >
                Register — {ev.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
