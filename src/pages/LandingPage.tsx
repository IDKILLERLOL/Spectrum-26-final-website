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
  <div className="">
    {Array.from({ length: 40 }).map((_, i) => (
      <div key={i} className="" style={{ background: `radial-gradient(circle, ${MARIGOLD} 40%, #D97700 80%)`, borderColor: "#A54A00" }} />
    ))}
  </div>
);

const Marquee = () => {
  return (
    <div className="" style={{ borderColor: INK, background: MUSTARD, color: INK }}>
      <div className="">
        <span className="">HORN PLEASE 📯 SEPTEMBER 30 📯 SVKM'S SBMP MUMBAI 📯 </span>
        <span className="">HORN PLEASE 📯 SEPTEMBER 30 📯 SVKM'S SBMP MUMBAI 📯 </span>
        <span className="">HORN PLEASE 📯 SEPTEMBER 30 📯 SVKM'S SBMP MUMBAI 📯 </span>
        <span className="">HORN PLEASE 📯 SEPTEMBER 30 📯 SVKM'S SBMP MUMBAI 📯 </span>
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
    <div className="">
      <MarigoldGarland />
      
      {/* Hoarding Card */}
      <div 
        className=""
        style={{ borderColor: INK, boxShadow: hoardingShadow }}
      >
        <div className="" style={{ borderColor: VERMILION }} />
        <div className="" style={{ borderColor: VERMILION }} />
        <div className="" style={{ borderColor: VERMILION }} />
        <div className="" style={{ borderColor: VERMILION }} />
        
        <p className="" style={{ color: TEAL }}>
          4 Events. 1 Ultimate Battle.
        </p>
        <h1 className="" style={{ color: VERMILION, fontSize: "2.8rem", lineHeight: 1.1, textShadow: `2px 2px 0px ${MUSTARD}, 4px 4px 0px ${INK}` }}>
          SPECTRUM
          <br />
          <span style={{ color: TEAL }}>5.0</span>
        </h1>
        <p className="" style={{ color: INK }}>
          The ultimate computational tech and gaming showdown.
        </p>

        {/* Countdown Box */}
        <div className="" style={{ borderColor: INK }}>
           <p className="" style={{ borderColor: TEAL, color: TEAL }}>Starts In</p>
           {[
            ["Days", cd.days],
            ["Hrs", cd.hours],
            ["Min", cd.minutes],
            ["Sec", cd.seconds],
          ].map(([label, value]) => (
            <div key={label as string} className="">
              <div className="" style={{ color: VERMILION, fontSize: "1.2rem" }}>
                {pad2(value as number)}
              </div>
              <div className="" style={{ color: INK }}>
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
        className=""
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
