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
    <div className="">
      <h2 className="" style={{ color: VERMILION, textShadow: `1px 1px 0 ${INK}` }}>
        Proud Sponsors
      </h2>
      <div className="">
        {SPONSORS_DATA.map((s) => (
          <div 
            key={s.name} 
            className="" 
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
