import { useState, useEffect } from 'react';
import { getScheduleSlots } from '../lib/firestore';
import type { ScheduleSlot, ScheduleEventType } from '../types';

// ─── Type badge config (solid vs dashed, text) ────────────────────────────────

const TYPE_CONFIG: Record<ScheduleEventType, { label: string; solid: boolean; accent: boolean }> = {
  TECH:    { label: 'TECH',     solid: true,  accent: true  },
  NON_TECH:{ label: 'NON-TECH', solid: false, accent: false },
  GENERAL: { label: 'GENERAL',  solid: true,  accent: false },
  BREAK:   { label: 'BREAK',    solid: false, accent: false },
};

function ScheduleCard({ slot }: { slot: ScheduleSlot }) {
  const cfg = TYPE_CONFIG[slot.type];
  const isTech = slot.type === 'TECH';

  return (
    <div
      className={`bg-bg-card hover:bg-bg-card-hover border ${isTech ? '' : 'border-dashed'} border-border-default p-6 transition-all duration-180 hover:scale-[1.02] flex flex-col justify-between min-h-[200px] relative overflow-hidden`}
    >
      {isTech && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary opacity-5 blur-xl rounded-full translate-x-1/2 -translate-y-1/2" />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <span
            className="font-micro text-micro text-primary border border-border-subtle px-2 py-1 bg-bg-elevated"
          >
            {slot.displayTime}
          </span>
          <span
            className={`font-micro text-micro text-text-muted uppercase tracking-widest px-2 py-1 ${
              isTech ? 'border border-border-default' : 'border border-dashed border-border-default'
            }`}
          >
            {slot.location}
          </span>
        </div>

        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span
            className={`font-micro text-micro uppercase tracking-widest px-2 py-0.5 ${
              cfg.accent
                ? 'bg-primary text-bg-base'
                : `text-primary border ${cfg.solid ? 'border-primary' : 'border-dashed border-primary'}`
            }`}
          >
            {cfg.label}
          </span>
        </div>

        <h3 className="font-heading text-card-title text-primary">{slot.title}</h3>
      </div>
    </div>
  );
}

function ScheduleCardSkeleton() {
  return (
    <div className="bg-bg-card border border-border-default p-6 flex flex-col gap-4 min-h-[200px]">
      <div className="flex justify-between">
        <div className="skeleton h-6 w-20 rounded" />
        <div className="skeleton h-6 w-24 rounded" />
      </div>
      <div className="skeleton h-4 w-16 rounded" />
      <div className="skeleton h-6 w-3/4 rounded" />
    </div>
  );
}

export function SchedulePage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScheduleSlots()
      .then(setSlots)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group by day (preserving order from Firestore query: sorted by day then sortTime)
  const days = Array.from(
    slots.reduce((map, slot) => {
      const key = `${slot.day}__${slot.date}`;
      if (!map.has(key)) map.set(key, { day: slot.day, date: slot.date, slots: [] });
      map.get(key)!.slots.push(slot);
      return map;
    }, new Map<string, { day: string; date: string; slots: ScheduleSlot[] }>())
  );

  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-24">
      <header className="mb-16 md:mb-24 text-center">
        <h1 className="font-hero text-[48px] md:text-[104px] uppercase mb-4 leading-none tracking-widest text-primary">
          Schedule
        </h1>
        <p className="font-body text-body text-text-secondary max-w-2xl mx-auto">
          The timeline for SPECTRUM 26. All times are IST. Events may be subject to slight modifications.
        </p>
      </header>

      {loading ? (
        <div className="space-y-14">
          {[1, 2].map((d) => (
            <section key={d}>
              <div className="border-b border-border-default pb-4 mb-8">
                <div className="skeleton h-10 w-48 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => <ScheduleCardSkeleton key={i} />)}
              </div>
            </section>
          ))}
        </div>
      ) : days.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="font-heading text-card-title text-text-muted uppercase tracking-widest">
            Schedule Coming Soon
          </p>
          <p className="font-body text-body text-text-secondary max-w-md">
            The detailed event schedule will be published closer to the event date.
          </p>
        </div>
      ) : (
        <div className="space-y-14 md:space-y-24">
          {days.map(([key, { day, date, slots: daySlots }]) => (
            <section key={key}>
              <div className="border-b border-border-default pb-4 mb-8">
                <h2 className="font-section text-section uppercase flex items-baseline gap-4 text-primary">
                  {day}
                  <span className="font-body text-small text-text-secondary tracking-widest uppercase">
                    {date}
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {daySlots.map((slot) => (
                  <ScheduleCard key={slot.id} slot={slot} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
