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
    <div className="">
      <div className="">
        <h2 className="" style={{ color: VERMILION, textShadow: `1px 1px 0 ${INK}` }}>
          Timetable
        </h2>
      </div>
      
      {/* Chalkboard schedule container */}
      <div 
        className=""
        style={{ 
          borderColor: "#4A3525", // Wooden frame
          background: "#2A3B2A", // Chalkboard green
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
        }}
      >
        <div className="" style={{ background: "#3A2515" }} />
        
        <ol className="">
          {slots.map((item) => (
            <li key={item.id} className="">
              <div className="" style={{ textShadow: "0 0 2px rgba(255,255,255,0.5)" }}>
                {item.displayTime}
              </div>
              <div>
                <p className="" style={{ textShadow: "0 0 2px rgba(255,255,255,0.5)" }}>
                  {item.title}
                </p>
                <p className="">
                  Location: {item.location}
                </p>
              </div>
            </li>
          ))}
          {slots.length === 0 && (
            <li className="">
              No Slots Added Yet
            </li>
          )}
        </ol>
        <div className="">
          Venue: SVKM's Shri Bhagubhai Mafatlal Polytechnic
        </div>
      </div>
    </div>
  );
}
