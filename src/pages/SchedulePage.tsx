import React, { useState, useEffect } from 'react';
import { getScheduleSlots } from '../lib/firestore';
import type { ScheduleSlot } from '../types';
import { playSynthSound } from '../lib/audio';

const SCHEDULE_DUMMY: ScheduleSlot[] = [
  { id: '1', displayTime: '09:00 AM', location: 'FOYER', name: 'Registrations Open', type: 'GENERAL', description: 'Collect your pass wristbands and enlist at the welcome desk.' },
  { id: '2', displayTime: '10:30 AM', location: 'MAIN AUDI', name: 'Opening Ceremony', type: 'GENERAL', description: 'Opening address from organizers and guidelines brief.' },
  { id: '3', displayTime: '11:00 AM', location: 'LABS 3-5', name: 'Events Start', type: 'TECH', description: 'Tech events start rounds. Dual Debug & Code Clash brackets lock.' },
  { id: '4', displayTime: '01:00 PM', location: 'FOYER', name: 'Lunch Break & Mini Quests', type: 'BREAK', description: 'Break for refreshments and side quests around the arena.' },
  { id: '5', displayTime: '02:00 PM', location: 'LABS 6-8', name: 'Gaming Tournaments Kickoff', type: 'NON_TECH', description: 'Console brackets and BGMI lobbies initialize.' },
  { id: '6', displayTime: '05:30 PM', location: 'MAIN AUDI', name: 'Championship Finals', type: 'TECH', description: 'Grand finals battle on stage live stream.' },
  { id: '7', displayTime: '07:30 PM', location: 'MAIN AUDI', name: 'Prize & Closing Ceremony', type: 'GENERAL', description: 'Trophy handouts and cash prizes distribution.' }
];

export function SchedulePage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>(SCHEDULE_DUMMY);

  useEffect(() => {
    getScheduleSlots()
      .then((data) => {
        if (data && data.length > 0) setSlots(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-8 page-content flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="highlight-icon"><i data-lucide="calendar"></i></span>
          <div className="section-divider" style={{ margin: 0 }}>EVENT TIMELINE</div>
        </div>
        <p className="text-small text-text-secondary">Mark your calendar. Join the battleground.</p>
      </div>

      {/* Clock Display Card */}
      <div className="pixel-card flex flex-col items-center gap-2 py-6 text-center">
        <span className="font-pixel text-[24px] text-text-primary block tracking-wide">30</span>
        <span className="font-pixel text-[12px] text-text-secondary uppercase">SEPT</span>
        <span className="font-pixel text-[14px] text-text-primary uppercase tracking-widest mt-1">2026</span>
      </div>

      {/* Timeline Board */}
      <div className="pixel-card relative pl-6">
        <div className="timeline-line" style={{ left: '16px' }} />
        {slots.map((slot) => (
          <div key={slot.id} className="timeline-item pl-4 mb-6 last:mb-0 relative">
            <div className="timeline-node" style={{ left: '-19px', top: '8px' }} />
            <div className="flex flex-col gap-1">
              <span className="font-pixel text-[9px] text-text-muted flex items-center gap-1.5">
                <i data-lucide="clock" style={{ width: '12px', height: '12px' }}></i> {slot.displayTime}
              </span>
              <span className="font-ui text-base font-bold text-text-primary uppercase">{slot.name}</span>
              <p className="text-small text-text-secondary leading-relaxed">
                {slot.description || 'Schedule round execution.'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Retro Gameboy console dummy frame placeholder */}
      <div className="pixel-card flex flex-col items-center py-8 bg-bg-raised text-center relative overflow-hidden">
        <div className="w-20 h-16 bg-black border-2 border-border mb-4 flex items-center justify-center rounded">
          <span className="text-[10px] font-pixel text-green-500">READY</span>
        </div>
        <div className="flex justify-between w-24 mb-4">
          <div className="w-8 h-8 border border-border flex items-center justify-center font-bold text-text-secondary font-pixel text-xs">+</div>
          <div className="flex gap-2 items-center">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
          </div>
        </div>
        <span className="font-pixel text-[8px] text-text-muted">RETRO CONSOLE ENGINE</span>
      </div>

    </div>
  );
}
