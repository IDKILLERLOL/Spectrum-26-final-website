import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getEvents, Event } from '../lib/firestore';
import { playSynthSound } from '../lib/audio';

const ARCH_CARDS_DATA = [
  { id: 'tech-duo-1', title: 'DUAL DEBUG', category: 'Duo coding face-off.', partners: 'Duo Partners', fee: '₹100 / Team', img: '/Green.png' },
  { id: 'tech-solo-1', title: 'SINGULARITY STRIKE', category: 'Solo arena battle.', partners: 'Individual', fee: '₹50', img: '/purple.png' },
  { id: 'non-tech-1', title: 'BGMI TOURNAMENT', category: 'Squad vs Squad in Erangel.', partners: 'Squad of 4', fee: '₹200 / Team', img: '/orange.png' },
  { id: 'non-tech-3', title: 'FC 26 SHOWDOWN', category: 'Digital football battle.', partners: '1 v 1 Solo', fee: '₹50', img: '/blue.png' }
];

export function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'RULES' | 'PRIZES'>('DETAILS');

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
  }, []);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [selectedEventId, activeTab]);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const handleSelectEvent = (id: string) => {
    playSynthSound('laser');
    setSelectedEventId(id);
    setActiveTab('DETAILS');
  };

  const getEventRules = (name: string): string[] => {
    if (name.includes('Debug')) {
      return [
        "Participants must register as a Team of 2.",
        "Round 1 (Swap Challenge): Duos solve coding challenges, swapping platforms mid-way.",
        "Round 2 (Codopoly): DSA question grid taxation game board.",
        "Round 3 (Snakes & Ladders): Digital board integration with tech obstacles."
      ];
    }
    if (name.includes('Clash') || name.includes('Strike')) {
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
    <div className="max-w-md mx-auto px-4 py-8">
      {selectedEvent ? (
        /* Event Detail View */
        <div className="page-content flex flex-col gap-6">
          <button
            onClick={() => {
              playSynthSound('click');
              setSelectedEventId(null);
            }}
            className="btn self-start"
          >
            <i data-lucide="arrow-right" style={{ transform: 'rotate(180deg)', marginRight: '6px' }}></i> BACK TO ARENA
          </button>

          <div className="pixel-card flex gap-4 items-center">
            <div className="w-16 h-20 shrink-0 bg-bg-raised border border-border flex items-center justify-center" style={{ color: 'var(--text-primary)' }}>
              <i data-lucide={selectedEvent.id === 'tech-duo-1' ? 'code-2' : selectedEvent.id === 'tech-solo-1' ? 'terminal' : selectedEvent.id === 'non-tech-1' ? 'gamepad-2' : 'swords'} style={{ width: '28px', height: '28px' }}></i>
            </div>
            <div className="text-left">
              <h2 className="text-heading uppercase">{selectedEvent.name}</h2>
              <p className="text-small text-text-secondary uppercase mt-1">{selectedEvent.category} • {selectedEvent.type}</p>
            </div>
          </div>

          {/* Details / Rules / Prizes Tabs */}
          <div className="tabs-container">
            <button
              onClick={() => { playSynthSound('click'); setActiveTab('DETAILS'); }}
              className={`tab-btn ${activeTab === 'DETAILS' ? 'active' : ''}`}
            >
              DETAILS
            </button>
            <button
              onClick={() => { playSynthSound('click'); setActiveTab('RULES'); }}
              className={`tab-btn ${activeTab === 'RULES' ? 'active' : ''}`}
            >
              RULES
            </button>
            <button
              onClick={() => { playSynthSound('click'); setActiveTab('PRIZES'); }}
              className={`tab-btn ${activeTab === 'PRIZES' ? 'active' : ''}`}
            >
              PRIZES
            </button>
          </div>

          <div className="pixel-card text-left">
            {activeTab === 'DETAILS' && (
              <div className="flex flex-col gap-2">
                <div className="detail-meta-row">
                  <span className="detail-meta-label flex items-center gap-1.5"><i data-lucide="users-round"></i> Team Size</span>
                  <span className="detail-meta-value uppercase">{selectedEvent.type}</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-label flex items-center gap-1.5"><i data-lucide="indian-rupee"></i> Registration Fee</span>
                  <span className="detail-meta-value">{selectedEvent.price || 'FREE'}</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-label flex items-center gap-1.5"><i data-lucide="calendar"></i> Event Date</span>
                  <span className="detail-meta-value">30 Sept 2026</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-label flex items-center gap-1.5"><i data-lucide="timer"></i> Duration</span>
                  <span className="detail-meta-value">3 Rounds</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-label flex items-center gap-1.5"><i data-lucide="signal"></i> Difficulty</span>
                  <span className="detail-meta-value text-red-500 font-pixel">★★★☆☆</span>
                </div>
                <p className="text-body text-text-secondary mt-4 leading-relaxed">
                  {selectedEvent.description || 'Challenge yourself in the ultimate battle arena. Defeat opponents to win high tier epic loot.'}
                </p>
              </div>
            )}

            {activeTab === 'RULES' && (
              <ol className="list-decimal pl-6 flex flex-col gap-3 text-body text-text-secondary">
                {getEventRules(selectedEvent.name).map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">{rule}</li>
                ))}
              </ol>
            )}

            {activeTab === 'PRIZES' && (
              <div className="flex flex-col gap-4 text-center">
                <div className="flex justify-between p-3 bg-bg-raised border border-border">
                  <span className="font-ui text-base font-bold text-text-primary uppercase flex items-center gap-2"><i data-lucide="gift"></i> 1st Place</span>
                  <span className="font-pixel text-xs text-text-primary">₹5,000</span>
                </div>
                <div className="flex justify-between p-3 bg-bg-raised border border-border">
                  <span className="font-ui text-base font-bold text-text-primary uppercase flex items-center gap-2"><i data-lucide="gift"></i> 2nd Place</span>
                  <span className="font-pixel text-xs text-text-primary">₹2,000</span>
                </div>
                <div className="flex justify-between p-3 bg-bg-raised border border-border">
                  <span className="font-ui text-base font-bold text-text-primary uppercase flex items-center gap-2"><i data-lucide="gift"></i> 3rd Place</span>
                  <span className="font-pixel text-xs text-text-primary">₹1,000</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              playSynthSound('laser');
              navigate('/register', { state: { selectedEventId: selectedEvent.id } });
            }}
            className="btn btn-accent w-full mt-4"
          >
            REGISTER NOW →
          </button>
        </div>
      ) : (
        /* Event Selection List */
        <div className="page-content flex flex-col gap-6">
          <div className="flex items-center gap-2 justify-center">
            <span className="highlight-icon"><i data-lucide="gamepad-2"></i></span>
            <div className="section-divider" style={{ margin: 0 }}>EVENTS ARENA</div>
          </div>
          <p className="text-small text-text-secondary text-center mt-[-10px]">Choose your battleground.</p>
          
          <div className="flex flex-col gap-6 mt-2">
            {ARCH_CARDS_DATA.map((card, idx) => (
              <div
                key={card.id}
                onClick={() => handleSelectEvent(card.id)}
                className="pixel-card flex gap-4 cursor-pointer text-left transition-transform hover:-translate-y-1 duration-300"
              >
                <div className="w-24 h-28 bg-bg-raised border border-border flex items-center justify-center shrink-0" style={{ color: 'var(--text-primary)' }}>
                  <i data-lucide={card.id === 'tech-duo-1' ? 'code-2' : card.id === 'tech-solo-1' ? 'terminal' : card.id === 'non-tech-1' ? 'gamepad-2' : 'swords'} style={{ width: '32px', height: '32px' }}></i>
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-ui text-base font-bold text-text-primary uppercase">
                      0{idx + 1} {card.title}
                    </h3>
                    <span className="text-[11px] text-text-secondary uppercase mt-0.5 block">{card.category}</span>
                  </div>
                  
                  <div className="bg-bg-raised border border-border p-2 rounded flex justify-between items-center text-[10px] font-pixel text-text-primary mt-2">
                    <span className="flex items-center gap-1">👥 {card.partners}</span>
                    <span>💳 {card.fee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
