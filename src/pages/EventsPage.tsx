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
  { id: 'tech-duo-1', index: '01', color: '#8FD3F4', tag: 'DUO CODING FACE-OFF.', format: 'Duo Partners', fee: '₹150 / person', name: 'Dual Debug' },
  { id: 'tech-solo-1', index: '02', color: '#F2B705', tag: 'SOLO ARENA BATTLE.', format: 'Individual', fee: '₹50 / person', name: 'Singularity Strike' },
  { id: 'non-tech-1', index: '03', color: '#6FBF5B', tag: 'SQUAD VS SQUAD.', format: 'Squad of 4', fee: '₹200 / team', name: 'BGMI Tournament' },
  { id: 'non-tech-3', index: '04', color: '#8B6FD9', tag: '1V1 CONSOLE BATTLE.', format: '1v1 Solo', fee: '₹50 / person', name: 'FC 26 Showdown' }
];

export function EventsPage() {
  const navigate = useNavigate();
  const [dbEvents, setDbEvents] = useState<Event[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getEvents().then(setDbEvents).catch(console.error);
  }, []);

  const getEventRules = (name: string): string[] => {
    if (name.includes('Debug')) {
      return [
        "Participants must register as a Team of 2.",
        "Round 1 (Swap Challenge): Duos solve coding challenges, swapping platforms mid-way.",
        "Round 2 (Codopoly): DSA question grid taxation game board.",
        "Round 3 (Snakes & Ladders): Digital board integration with tech obstacles."
      ];
    }
    if (name.includes('Strike') || name.includes('Clash')) {
      return [
        "Individual participation only.",
        "Round 1: Rapid multiple choice programming syntax check.",
        "Round 2: Grid compilation matching challenge.",
        "Round 3: Fastest finger buzzer live questionnaire."
      ];
    }
    if (name.includes('BGMI')) {
      return [
        "Squads of 4 players.",
        "Matches played on Erangel and Miramar maps.",
        "Hacks, emulator devices, or trigger attachments are strictly prohibited.",
        "Final score determined by cumulative placement and finish points."
      ];
    }
    return [
      "Standard 1v1 bracket tournament matches.",
      "Matches are 6 minutes halves (12 mins total).",
      "Tactical defending mode is mandatory.",
      "In case of draw, matches go directly to classic extra time and penalties."
    ];
  };

  return (
    <div className="flex flex-col gap-8 px-4 py-16 bg-opacity-50 w-full min-h-screen max-w-lg mx-auto" style={{ background: `linear-gradient(to bottom, transparent, rgba(244, 163, 0, 0.15))` }}>
      <div className="text-center">
        <h2 className="font-hero text-3xl" style={{ color: VERMILION, textShadow: `1px 1px 0 ${INK}` }}>
          Mela Arena
        </h2>
        <p className="text-sm font-bold uppercase tracking-widest font-body" style={{ color: TEAL }}>
          Choose your stall
        </p>
      </div>

      <div className="flex flex-col gap-10 mt-6">
        {ARCH_CARDS_DATA.map((ev) => (
          <div key={ev.id} className="relative border-4 bg-white pt-6" style={{ borderColor: INK, boxShadow: hoardingShadow }}>
            {/* Striped Card Awning */}
            <div className="absolute -top-3.5 left-0 right-0 flex h-3.5" style={{ borderTop: `2.5px solid ${INK}` }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex-1 border-r-2 border-b-2 rounded-b-sm" style={{ backgroundColor: i % 2 === 0 ? ev.color : '#fff', borderColor: INK }} />
              ))}
            </div>
            
            <button 
              type="button" 
              className="flex w-full items-start justify-between text-left p-4" 
              onClick={() => {
                playSynthSound('click');
                setOpenId(openId === ev.id ? null : ev.id);
              }}
            >
              <div className="flex gap-3 items-center">
                <span
                  className="font-hero flex size-10 shrink-0 items-center justify-center text-lg border-2"
                  style={{ background: ev.color, color: INK, borderColor: INK, boxShadow: softHoardingShadow }}
                >
                  {ev.index}
                </span>
                <div>
                  <h3 className="font-hero text-xl" style={{ color: INK }}>
                    {ev.name}
                  </h3>
                  <p className="text-xs font-bold uppercase font-body" style={{ color: TEAL }}>
                    {ev.tag}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right text-xs font-bold font-body" style={{ color: VERMILION }}>
                <div className="opacity-80">{ev.format}</div>
                <div className="text-sm">{ev.fee}</div>
              </div>
            </button>

            {openId === ev.id && (
              <div className="px-4 pb-4 space-y-2 text-sm border-t-2 pt-3 font-body" style={{ borderColor: `${INK}33`, color: INK }}>
                <p className="font-bold text-base mb-3">Compete and conquer this track to win massive rewards!</p>
                <ul className="list-disc space-y-1 pl-4 mb-3">
                  {getEventRules(ev.name).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <ul className="space-y-1 p-3 border-2 bg-yellow-50" style={{ borderColor: INK, borderStyle: 'dashed' }}>
                  <li className="font-bold"><span style={{ color: VERMILION }}>1st Place:</span> Trophy + Special Merch</li>
                  <li className="font-bold"><span style={{ color: VERMILION }}>2nd Place:</span> Custom Goodies</li>
                </ul>
              </div>
            )}

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
