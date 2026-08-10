import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playSynthSound } from '../lib/audio';

const EVENT_DATE = new Date('2026-09-30T09:00:00').getTime();
const MARIGOLD = "#F4A300";
const MUSTARD = "#E8A13A";
const TEAL = "#12595B";
const VERMILION = "#C7382F";
const JUTE = "#D9C9A3";
const INK = "#1A1A1A";

const hoardingShadow = `4px 4px 0px ${INK}`;

const MarigoldGarland = () => (
  <div className="absolute top-0 left-0 right-0 h-8 flex overflow-hidden opacity-90 z-10 pointer-events-none">
    {Array.from({ length: 40 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-8 h-8 rounded-full border-2 -ml-2 first:ml-0 shadow-sm" style={{ background: `radial-gradient(circle, ${MARIGOLD} 40%, #D97700 80%)`, borderColor: "#A54A00" }} />
    ))}
  </div>
);

const Marquee = () => {
  return (
    <div className="w-full overflow-hidden border-y-4 py-1.5 my-6" style={{ borderColor: INK, background: MUSTARD, color: INK }}>
      <div className="flex whitespace-nowrap text-sm font-bold uppercase tracking-widest animate-[marquee_20s_linear_infinite]">
        <span className="px-4">HORN PLEASE 📯 SEPTEMBER 30 📯 SVKM'S SBMP MUMBAI 📯 </span>
        <span className="px-4">HORN PLEASE 📯 SEPTEMBER 30 📯 SVKM'S SBMP MUMBAI 📯 </span>
        <span className="px-4">HORN PLEASE 📯 SEPTEMBER 30 📯 SVKM'S SBMP MUMBAI 📯 </span>
        <span className="px-4">HORN PLEASE 📯 SEPTEMBER 30 📯 SVKM'S SBMP MUMBAI 📯 </span>
      </div>
    </div>
  );
};

export function LandingPage() {
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const diff = EVENT_DATE - Date.now();
      if (diff <= 0) {
        setCd({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      setCd({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad2 = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 px-4 pb-32 pt-16 text-center overflow-hidden w-full min-h-screen">
      <MarigoldGarland />
      
      {/* Hoarding Card */}
      <div 
        className="relative border-4 bg-white p-6 mt-8 max-w-sm w-full z-10 animate-[gentle-float_4s_ease-in-out_infinite]"
        style={{ borderColor: INK, boxShadow: hoardingShadow }}
      >
        <div className="absolute top-1 left-1 w-4 h-4 border-t-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute top-1 right-1 w-4 h-4 border-t-4 border-r-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-4 border-r-4" style={{ borderColor: VERMILION }} />
        
        <p className="text-xs font-bold uppercase tracking-[0.25em] mb-2 font-body" style={{ color: TEAL }}>
          4 Events. 1 Ultimate Battle.
        </p>
        <h1 className="font-hero" style={{ color: VERMILION, fontSize: "2.8rem", lineHeight: 1.1, textShadow: `2px 2px 0px ${MUSTARD}, 4px 4px 0px ${INK}` }}>
          SPECTRUM
          <br />
          <span style={{ color: TEAL }}>5.0</span>
        </h1>
        <p className="mt-3 text-sm font-bold font-body" style={{ color: INK }}>
          The ultimate computational tech and gaming showdown.
        </p>

        {/* Countdown Box */}
        <div className="mt-5 grid grid-cols-4 gap-1 border-2 p-2 bg-yellow-50" style={{ borderColor: INK }}>
           <p className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-center border-b-2 mb-1 pb-1 font-body" style={{ borderColor: TEAL, color: TEAL }}>Starts In</p>
           {[
            ["Days", cd.days],
            ["Hrs", cd.hours],
            ["Min", cd.minutes],
            ["Sec", cd.seconds],
          ].map(([label, value]) => (
            <div key={label as string} className="text-center">
              <div className="font-hero" style={{ color: VERMILION, fontSize: "1.2rem" }}>
                {pad2(value as number)}
              </div>
              <div className="text-[9px] uppercase font-bold font-body" style={{ color: INK }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Marquee />

      <Link
        to="/events"
        onClick={() => playSynthSound('laser')}
        className="relative border-2 uppercase tracking-widest transition-transform px-8 py-4 text-sm z-10 font-hero inline-block hover:translate-x-0.5 hover:translate-y-0.5"
        style={{
          borderColor: INK,
          background: VERMILION,
          color: JUTE,
          boxShadow: hoardingShadow,
        }}
      >
        Accept The Quest
      </Link>
    </div>
  );
}
