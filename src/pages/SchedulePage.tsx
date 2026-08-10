import React, { useState, useEffect } from 'react';
import { getScheduleSlots } from '../lib/firestore';
import type { ScheduleSlot } from '../types';

const INK = "#1A1A1A";
const VERMILION = "#C7382F";

export function SchedulePage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);

  useEffect(() => {
    getScheduleSlots()
      .then(setSlots)
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 px-4 py-16 w-full min-h-screen max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="font-hero text-3xl" style={{ color: VERMILION, textShadow: `1px 1px 0 ${INK}` }}>
          Timetable
        </h2>
      </div>
      
      {/* Chalkboard schedule container */}
      <div 
        className="p-5 border-[12px] shadow-xl rounded-md relative text-left"
        style={{ 
          borderColor: "#4A3525", // Wooden frame
          background: "#2A3B2A", // Chalkboard green
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
        }}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-2 opacity-80" style={{ background: "#3A2515" }} />
        
        <ol className="space-y-6 relative z-10">
          {slots.map((item) => (
            <li key={item.id} className="flex gap-4 border-b border-white/20 pb-4 last:border-0 last:pb-0">
              <div className="font-hero text-white/90 text-right w-24 shrink-0 text-sm mt-1" style={{ textShadow: "0 0 2px rgba(255,255,255,0.5)" }}>
                {item.displayTime}
              </div>
              <div>
                <p className="font-hero text-white/95 text-lg" style={{ textShadow: "0 0 2px rgba(255,255,255,0.5)" }}>
                  {item.title}
                </p>
                <p className="text-white/70 text-xs italic font-body">
                  Location: {item.location}
                </p>
              </div>
            </li>
          ))}
          {slots.length === 0 && (
            <li className="text-center text-white/80 font-hero py-12">
              No Slots Added Yet
            </li>
          )}
        </ol>
        <div className="mt-6 pt-4 border-t-2 border-white/30 text-center text-white/80 font-mono text-xs uppercase tracking-widest">
          Venue: SVKM's Shri Bhagubhai Mafatlal Polytechnic
        </div>
      </div>
    </div>
  );
}
