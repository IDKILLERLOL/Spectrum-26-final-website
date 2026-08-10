import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSynthSound } from '../lib/audio';
import { getEvents, getWinners, Event, Winner } from '../lib/firestore';
import { TrophySVG } from '../components/PixelCharacters';

const PAST_CHAMPIONS = [
  { name: "Alpha Decoders", event: "Dual Debug (Spectrum 4.0)", year: "2025", prize: "₹5,000" },
  { name: "Pixel Striker", event: "Singularity Strike (Spectrum 4.0)", year: "2025", prize: "₹3,000" },
  { name: "Phantom Esports", event: "BGMI Arena (Spectrum 4.0)", year: "2025", prize: "₹10,000" },
  { name: "Vansh Shah", event: "FIFA Showdown (Spectrum 3.0)", year: "2024", prize: "₹2,500" }
];

export function WinnersPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
    getWinners().then(setWinners).catch(console.error);
  }, []);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [events, winners, activeFilter]);

  const handleFilterChange = (id: string) => {
    playSynthSound('click');
    setActiveFilter(id);
  };

  const filteredWinners = winners.filter(w => activeFilter === 'ALL' || w.eventId === activeFilter);

  return (
    <div className="max-w-md mx-auto px-4 py-8 page-content flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="highlight-icon"><i data-lucide="trophy"></i></span>
          <div className="section-divider" style={{ margin: 0 }}>CHAMPIONS BOARD</div>
        </div>
        <p className="text-small text-text-secondary">Celebrating the elite tech combatants.</p>
      </div>

      {/* Event Filters Tab Bar */}
      <div className="tabs-container overflow-x-auto flex-nowrap whitespace-nowrap">
        <button
          onClick={() => handleFilterChange('ALL')}
          className={`tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
        >
          All Events
        </button>
        {events.slice(0, 4).map((event) => (
          <button
            key={event.id}
            onClick={() => handleFilterChange(event.id)}
            className={`tab-btn ${activeFilter === event.id ? 'active' : ''}`}
          >
            {event.name}
          </button>
        ))}
      </div>

      {/* Winners Podium Display */}
      <div className="pixel-card">
        <h3 className="text-heading text-left uppercase mb-6 border-b border-border pb-2">SPECTRUM PODIUM</h3>
        
        {filteredWinners.length > 0 ? (
          <div className="winners-podium-layout">
            {/* 2nd place */}
            {filteredWinners.find(w => w.rank === 2) && (
              <div className="podium-step podium-2nd">
                <TrophySVG className="w-8 h-8 text-slate-400 mt-2" />
                <span className="podium-title">2ND</span>
                <span className="font-ui text-sm font-bold text-text-primary block px-1 truncate max-w-[90px]">
                  {filteredWinners.find(w => w.rank === 2)?.teamName}
                </span>
                <span className="podium-val">₹2,000</span>
              </div>
            )}
            {/* 1st place */}
            {filteredWinners.find(w => w.rank === 1) && (
              <div className="podium-step podium-1st">
                <TrophySVG className="w-10 h-10 text-yellow-500 mt-2" />
                <span className="podium-title">1ST</span>
                <span className="font-ui text-sm font-bold text-text-primary block px-1 truncate max-w-[90px]">
                  {filteredWinners.find(w => w.rank === 1)?.teamName}
                </span>
                <span className="podium-val">₹5,000</span>
              </div>
            )}
            {/* 3rd place */}
            {filteredWinners.find(w => w.rank === 3) && (
              <div className="podium-step podium-3rd">
                <TrophySVG className="w-8 h-8 text-amber-700 mt-2" />
                <span className="podium-title">3RD</span>
                <span className="font-ui text-sm font-bold text-text-primary block px-1 truncate max-w-[90px]">
                  {filteredWinners.find(w => w.rank === 3)?.teamName}
                </span>
                <span className="podium-val">₹1,000</span>
              </div>
            )}
          </div>
        ) : (
          <div className="winners-podium-layout">
            <div className="podium-step podium-2nd">
              <TrophySVG className="w-8 h-8 text-slate-400 mt-2" />
              <span className="podium-title">2ND PLACE</span>
              <span className="podium-val">₹2,000</span>
            </div>
            <div className="podium-step podium-1st">
              <TrophySVG className="w-10 h-10 text-yellow-500 mt-2" />
              <span className="podium-title">CHAMPION</span>
              <span className="podium-val">₹5,000</span>
            </div>
            <div className="podium-step podium-3rd">
              <TrophySVG className="w-8 h-8 text-amber-700 mt-2" />
              <span className="podium-title">3RD PLACE</span>
              <span className="podium-val">₹1,000</span>
            </div>
          </div>
        )}
      </div>

      {/* Hall of Fame */}
      <div className="pixel-card text-left">
        <h3 className="text-heading uppercase mb-6 border-b border-border pb-2 flex items-center gap-2">
          <i data-lucide="trophy" className="text-yellow-500"></i> HALL OF FAME
        </h3>
        <p className="text-small text-text-secondary mb-6">
          Honoring the legendary champions who carved their names into computational history:
        </p>
        <div className="flex flex-col gap-4">
          {PAST_CHAMPIONS.map((champ, idx) => (
            <div key={idx} className="p-3 bg-bg-raised border border-border flex justify-between items-center">
              <div>
                <span className="font-ui text-base font-bold text-text-primary uppercase block">{champ.name}</span>
                <span className="text-small text-text-secondary uppercase">{champ.event} ({champ.year})</span>
              </div>
              <span className="font-pixel text-xs text-text-primary">{champ.prize}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
