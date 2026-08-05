import { useState, useEffect } from 'react';
import { getScheduleSlots, getEventDetails, type EventDetails } from '../lib/firestore';
import type { ScheduleSlot, ScheduleEventType } from '../types';
import { playSynthSound } from '../lib/audio';

const TYPE_CONFIG: Record<ScheduleEventType, { label: string; fill: boolean }> = {
  TECH:     { label: 'TECH',     fill: true  },
  NON_TECH: { label: 'NON-TECH', fill: false },
  GENERAL:  { label: 'GENERAL',  fill: false },
  BREAK:    { label: 'BREAK',    fill: false },
};

function ScheduleCard({ slot }: { slot: ScheduleSlot }) {
  const cfg = TYPE_CONFIG[slot.type];

  return (
    <div
      className="comic-border-thick comic-shadow overflow-hidden flex flex-col justify-between relative"
      style={{
        background: 'var(--panel-bg)',
        minHeight: '200px',
        padding: '20px',
      }}
    >
      {/* Crosshatch overlay */}
      <div className="absolute inset-0 hatch-pattern" style={{ opacity: 0.1, pointerEvents: 'none' }} />

      <div className="flex flex-col gap-4 relative">
        {/* Time + Location */}
        <div className="flex justify-between items-start flex-wrap gap-2">
          <span
            className="comic-badge"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '2px 10px',
              background: 'var(--badge-bg)',
              color: 'var(--color-text-primary)',
              transform: 'rotate(-1deg)',
            }}
          >
            {slot.displayTime}
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'var(--color-text-primary)',
              border: '2px solid var(--border-color)',
              padding: '2px 8px',
            }}
          >
            {slot.location}
          </span>
        </div>

        {/* Type badge */}
        <div>
          <span
            className="comic-badge"
            style={{
              fontFamily: 'Bangers, cursive',
              fontSize: '14px',
              letterSpacing: '0.08em',
              padding: '2px 12px',
              background: cfg.fill ? 'var(--color-text-primary)' : 'var(--badge-bg)',
              color: cfg.fill ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
              border: '2px solid var(--border-color)',
              transform: 'rotate(-1deg)',
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: '26px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            lineHeight: 1.1,
          }}
        >
          {slot.title}
        </h3>
      </div>
    </div>
  );
}

function ScheduleCardSkeleton() {
  return (
    <div
      className="comic-border-thick flex flex-col gap-4"
      style={{
        background: 'var(--panel-bg)',
        padding: '20px',
        minHeight: '200px',
        boxShadow: '8px 8px 0px var(--border-color)',
      }}
    >
      <div className="flex justify-between gap-2">
        <div className="skeleton h-6 w-24" />
        <div className="skeleton h-6 w-20" />
      </div>
      <div className="skeleton h-5 w-16" />
      <div className="skeleton h-8 w-3/4" />
    </div>
  );
}

export function SchedulePage() {
  console.log("[Mount] SchedulePage component loaded");
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: 'SPECTRUM 26',
    location: 'College Campus',
    date: 'September 30, 2026',
    countdownTarget: '2026-09-30T09:00:00',
  });

  useEffect(() => {
    Promise.all([
      getScheduleSlots(),
      getEventDetails()
    ])
      .then(([slotsData, detailsData]) => {
        setSlots(slotsData);
        setEventDetails(detailsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const days = Array.from(
    slots.reduce((map, slot) => {
      const key = `${slot.day}__${slot.date}`;
      if (!map.has(key)) map.set(key, { day: slot.day, date: slot.date, slots: [] });
      map.get(key)!.slots.push(slot);
      return map;
    }, new Map<string, { day: string; date: string; slots: ScheduleSlot[] }>())
  );

  useEffect(() => {
    if (activeDayIndex >= days.length && days.length > 0) {
      setActiveDayIndex(days.length - 1);
    }
  }, [days.length, activeDayIndex]);

  const currentDay = days[activeDayIndex];

  return (
    <main className="relative z-10 max-w-7xl mx-auto w-[92%] py-12 md:py-20">

      {/* Page Header */}
      <header className="mb-12 md:mb-16 text-center relative">
        {/* Crosshatch decoration */}
        <div
          className="absolute inset-0 hatch-pattern pointer-events-none"
          style={{ borderRadius: '50%', transform: 'scale(0.85)', opacity: 0.5 }}
        />
        <div
          className="comic-badge inline-block mb-4"
          style={{
            padding: '4px 16px',
            fontSize: '14px',
            fontFamily: 'Bangers, cursive',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-base)',
            transform: 'rotate(-1.5deg)',
          }}
        >
          TIMELINE — {eventDetails.name}
        </div>
        <h1
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(56px, 10vw, 120px)',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-4deg)',
            display: 'block',
            marginBottom: '12px',
          }}
        >
          Schedule
        </h1>
        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          The timeline for {eventDetails.name}. All times are IST. Events may be subject to slight modifications.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col gap-14">
          {[1, 2].map((d) => (
            <section key={d}>
              <div className="skeleton h-10 w-48 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => <ScheduleCardSkeleton key={i} />)}
              </div>
            </section>
          ))}
        </div>
      ) : days.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-24 text-center">
          <div
            className="comic-badge"
            style={{
              fontFamily: 'Bangers, cursive',
              fontSize: '40px',
              padding: '8px 24px',
              transform: 'rotate(-2deg)',
              color: 'var(--color-text-primary)',
            }}
          >
            COMING SOON
          </div>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', color: 'var(--color-text-primary)', maxWidth: '380px' }}>
            The detailed event schedule will be published closer to the event date.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10 animate-fade-in">
          {/* Day selection pagination tabs */}
          {days.length > 1 && (
            <div className="flex flex-wrap justify-center gap-6 mb-8 border-b-2 border-primary/20 pb-8">
              {days.map(([key, { day }], idx) => {
                const isActive = idx === activeDayIndex;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      playSynthSound('click');
                      setActiveDayIndex(idx);
                    }}
                    className={`comic-border-thick px-6 py-2 font-heading text-heading transition-all duration-100 ${
                      isActive
                        ? 'bg-primary text-bg-base -translate-y-1'
                        : 'bg-transparent text-text-primary hover:bg-primary/10'
                    }`}
                    style={{
                      fontFamily: 'Bangers, cursive',
                      fontSize: '22px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      boxShadow: isActive ? '6px 6px 0px var(--border-color)' : '4px 4px 0px var(--border-color)',
                      transform: isActive ? 'rotate(-1deg) translateY(-4px)' : 'none',
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}

          {currentDay && (() => {
            const [key, { day, slots: daySlots }] = currentDay as [string, { day: string; date: string; slots: ScheduleSlot[] }];
            return (
              <section key={key}>
                <div
                  className="flex items-baseline gap-4 mb-8 pb-4"
                  style={{ borderBottom: '4px solid var(--border-color)' }}
                >
                  <h2
                    style={{
                      fontFamily: 'Bangers, cursive',
                      fontSize: 'clamp(28px, 4vw, 44px)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1,
                    }}
                  >
                    {day}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {daySlots.map((slot) => <ScheduleCard key={slot.id} slot={slot} />)}
                </div>
              </section>
            );
          })()}
        </div>
      )}
    </main>
  );
}
