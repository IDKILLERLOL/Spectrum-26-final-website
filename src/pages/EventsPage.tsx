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
    <div className="" style={{ background: `linear-gradient(to bottom, transparent, rgba(244, 163, 0, 0.15))` }}>
      <div className="">
        <h2 className="" style={{ color: VERMILION, textShadow: `1px 1px 0 ${INK}` }}>
          Mela Arena
        </h2>
        <p className="" style={{ color: TEAL }}>
          Choose your stall
        </p>
      </div>

      <div className="">
        {ARCH_CARDS_DATA.map((ev) => (
          <div key={ev.id} className="" style={{ borderColor: INK, boxShadow: hoardingShadow }}>
            {/* Striped Card Awning */}
            <div className="" style={{ borderTop: `2.5px solid ${INK}` }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="" style={{ backgroundColor: i % 2 === 0 ? ev.color : '#fff', borderColor: INK }} />
              ))}
            </div>
            
            <button 
              type="button" 
              className="" 
              onClick={() => {
                playSynthSound('click');
                setOpenId(openId === ev.id ? null : ev.id);
              }}
            >
              <div className="">
                <span
                  className=""
                  style={{ background: ev.color, color: INK, borderColor: INK, boxShadow: softHoardingShadow }}
                >
                  {ev.index}
                </span>
                <div>
                  <h3 className="" style={{ color: INK }}>
                    {ev.name}
                  </h3>
                  <p className="" style={{ color: TEAL }}>
                    {ev.tag}
                  </p>
                </div>
              </div>
              <div className="" style={{ color: VERMILION }}>
                <div className="">{ev.format}</div>
                <div className="">{ev.fee}</div>
              </div>
            </button>

            {openId === ev.id && (
              <div className="" style={{ borderColor: `${INK}33`, color: INK }}>
                <p className="">Compete and conquer this track to win massive rewards!</p>
                <ul className="">
                  {getEventRules(ev.name).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <ul className="" style={{ borderColor: INK, borderStyle: 'dashed' }}>
                  <li className=""><span style={{ color: VERMILION }}>1st Place:</span> Trophy + Special Merch</li>
                  <li className=""><span style={{ color: VERMILION }}>2nd Place:</span> Custom Goodies</li>
                </ul>
              </div>
            )}

            <div className="">
              <button 
                onClick={() => {
                  playSynthSound('laser');
                  navigate('/register', { state: { selectedEventId: ev.id } });
                }}
                className="" 
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
