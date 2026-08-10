import React from 'react';

const INK = "#1A1A1A";
const VERMILION = "#C7382F";
const TEAL = "#12595B";

const SPONSORS_DATA = [
  { name: "Stranger Brands Ltd" },
  { name: "Upside Down Devs" },
  { name: "Hawkins Lab Logistics" },
  { name: "Scoops Ahoy Parlor" }
];

export function SponsorsPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-16 w-full min-h-screen max-w-lg mx-auto">
      <h2 className="font-hero text-3xl text-center" style={{ color: VERMILION, textShadow: `1px 1px 0 ${INK}` }}>
        Proud Sponsors
      </h2>
      <div className="flex flex-col gap-4 mt-6">
        {SPONSORS_DATA.map((s) => (
          <div 
            key={s.name} 
            className="font-hero border-4 px-5 py-3 text-lg bg-white text-center" 
            style={{ 
              borderColor: INK, 
              color: TEAL, 
              boxShadow: '2px 2px 0px #1A1A1A' 
            }}
          >
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}
