import { Link } from "react-router-dom";
import { useState, useEffect, useRef, Fragment } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { EVENT_DATE } from "../config";
import { getEvents, db } from "../lib/firestore";
import { getDocs, collection, query, where } from "firebase/firestore";
import type { Event } from "../types";
import { canRegister, categoryLabel, isEventFull, FALLBACK_EVENTS } from "../types";
import { ShaderBackground } from "../components/ShaderBackground";

export function LandingPage() {
  return (
    <>
      <ShaderBackground />
      <div className="relative z-10">
        <Hero />
        <Events />
      </div>
    </>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative w-full min-h-[870px] flex flex-col justify-center items-center overflow-hidden border-b border-border-default px-6 bg-transparent">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-hero-glow via-bg-base to-bg-base opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center gap-12 max-w-7xl mx-auto w-full">
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-['Orbitron'] text-[48px] md:text-[104px] text-primary uppercase select-none tracking-widest leading-[1.1] whitespace-nowrap">
            SPECTRUM 26
          </h1>
          <div className="font-heading text-card-title text-text-secondary tracking-widest uppercase">
            All Systems Go
          </div>
        </div>

        {/* Live Countdown */}
        <Countdown />
      </div>
    </section>
  );
}

// ─── Countdown with digit-flip animation ───────────────────────────────────────

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, EVENT_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Countdown() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hours' },
    { value: time.minutes, label: 'Min' },
    { value: time.seconds, label: 'Sec' },
  ];

  return (
    <div className="flex gap-4 md:gap-8 items-center justify-center bg-bg-card border border-border-default p-6 md:p-8 rounded-md card-shadow">
      {units.map(({ value, label }, i) => (
        <Fragment key={label}>
          <div key={label} className="flex flex-col items-center gap-2 w-20 md:w-32">
            <FlipDigits value={value} />
            <span
              className="text-micro font-body uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              className="text-countdown font-hero opacity-50 mb-6"
              style={{ color: 'var(--color-text-muted)' }}
            >
              :
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function FlipDigits({ value }: { value: number }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex text-countdown font-countdown font-bold leading-none text-primary">
      <SingleDigit char={display[0]} />
      <SingleDigit char={display[1]} />
    </div>
  );
}

function SingleDigit({ char }: { char: string }) {
  return (
    <div className="relative flex items-center justify-center w-[1.1ch] h-[1.1em] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={char}
          initial={{ y: "-80%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "80%", opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="absolute text-primary inline-block"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Section heading with character reveal (Skiper31 pattern) ─────────────────

function SectionHeading({ text, className = "" }: { text: string; className?: string }) {
  return (
    <h2 className={`font-section text-section text-primary uppercase tracking-wide ${className}`}>
      {text}
    </h2>
  );
}

// ─── Events section ────────────────────────────────────────────────────────────

// Fallback placeholder images (used when no event image is stored in Firestore)
const FALLBACK_IMAGES: Record<string, string> = {
  "Reverse Engineering": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
  "Speed Typing": "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
  "Code Prism": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
  "BGMI": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
  "Free Fire": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&q=80&w=800",
  "FC 26": "https://images.unsplash.com/photo-1518605368461-1ee711659208?auto=format&fit=crop&q=80&w=800",
};
const DEFAULT_IMG = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800";

function EventCardSkeleton() {
  return (
    <div className="bg-bg-card border border-border-default p-4 md:p-6 rounded-none flex flex-col gap-4">
      <div className="skeleton h-40 w-full rounded" />
      <div className="skeleton h-4 w-16 rounded" />
      <div className="skeleton h-6 w-3/4 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-12 w-full rounded mt-2" />
    </div>
  );
}


function Events() {
  const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setLoading(true);
    getEvents()
      .then((data) => {
        if (data && data.length > 0) {
          setEvents(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load active team members to count total people per event
    getDocs(query(collection(db, 'teamMembers'), where('status', '==', 'ACTIVE')))
      .then(async (memsSnap) => {
        const regsSnap = await getDocs(collection(db, 'registrations'));
        const regToEventMap = new Map<string, string>();
        for (const doc of regsSnap.docs) {
          regToEventMap.set(doc.id, doc.data().eventId);
        }
        const counts: Record<string, number> = {};
        for (const doc of memsSnap.docs) {
          const regId = doc.data().registrationId;
          const evId = regToEventMap.get(regId);
          if (evId) {
            counts[evId] = (counts[evId] || 0) + 1;
          }
        }
        setParticipantCounts(counts);
      })
      .catch(console.error);
  }, []);

  const techEvents = events.filter((e) => e.category === "TECH");
  const nonTechEvents = events.filter((e) => e.category === "NON_TECH");

  return (
    <section id="events" className="w-full py-14 md:py-24 px-6 max-w-7xl mx-auto flex flex-col gap-12 md:gap-24">
      {/* TECH EVENTS */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-6 border-b border-border-default pb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
          <SectionHeading text="Tech Events" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
            : techEvents.length > 0
              ? techEvents.map((e) => <EventCard key={e.id} event={e} participantCount={participantCounts[e.id] ?? 0} />)
              : <p className="font-body text-body text-text-muted col-span-3">Tech events coming soon.</p>
          }
        </div>
      </div>

      {/* NON-TECH EVENTS */}
      <div className="flex flex-col gap-8 mt-8">
        <div className="flex items-center gap-6 border-b border-border-default pb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12 2.1 7.1"/><path d="m12 12 7.1 7.1"/></svg>
          <SectionHeading text="Non-Tech Events" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
            : nonTechEvents.length > 0
              ? nonTechEvents.map((e) => <EventCard key={e.id} event={e} participantCount={participantCounts[e.id] ?? 0} />)
              : <p className="font-body text-body text-text-muted col-span-3">Non-tech events coming soon.</p>
          }
        </div>
      </div>

      {/* View Schedule CTA */}
      <div className="flex justify-center mt-6">
        <Link
          to="/schedule"
          className="font-button text-button border border-primary text-primary px-8 py-4 uppercase tracking-widest btn-spread transition-colors"
        >
          View Full Timeline & Schedule
        </Link>
      </div>
    </section>
  );
}

function EventCard({ event, participantCount }: { event: Event; participantCount: number }) {
  const isTech = event.category === "TECH";
  const full = isEventFull(event);
  const open = canRegister(event);
  const img = FALLBACK_IMAGES[event.name] ?? DEFAULT_IMG;

  return (
    <div className={`group bg-bg-card hover:bg-bg-card-hover border ${isTech ? "border-solid" : "border-dashed"} border-border-default p-4 md:p-6 rounded-none flex flex-col justify-between gap-6 transition-all duration-180 hover:scale-[1.02] relative overflow-hidden`}>
      <div className="flex flex-col gap-4 relative z-10">
        <div className={`h-40 w-full bg-bg-elevated border ${isTech ? "border-solid" : "border-dashed"} border-border-subtle rounded flex items-center justify-center overflow-hidden`}>
          <img
            src={img}
            alt={event.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category tag: exactly "TECH" or "NON-TECH", solid vs dashed border — never colored */}
          <span className={`font-micro text-micro border ${isTech ? "border-solid border-primary" : "border-dashed border-border-default"} text-text-muted px-2 py-1 rounded-sm uppercase tracking-widest`}>
            {categoryLabel(event.category)}
          </span>
          {/* Format tag: Solo / Team */}
          <span className="font-micro text-micro border border-solid border-border-default text-text-muted px-2 py-1 rounded-sm uppercase tracking-widest">
            {event.isTeamEvent ? "Team" : "Solo"}
          </span>
          {event.price != null && (
            <span className="font-micro text-micro text-text-muted">₹{event.price}</span>
          )}
          <span className="font-micro text-micro text-primary uppercase tracking-widest ml-auto">
            {participantCount} registered
          </span>
        </div>

        <h3 className="font-heading text-card-title text-primary uppercase leading-tight">
          {event.name}
        </h3>

        <p className="font-body text-body text-text-secondary line-clamp-2">
          {event.description || "Details coming soon."}
        </p>
      </div>

      {open ? (
        <Link
          to={`/login?redirect=register&eventId=${event.id}`}
          className="relative z-10 w-full font-button text-button px-6 py-4 text-center uppercase tracking-widest hover:scale-[1.02] transition-transform duration-180 border border-primary text-primary bg-transparent btn-spread"
        >
          Register
        </Link>
      ) : (
        <div className="relative z-10 w-full font-button text-button px-6 py-4 text-center uppercase tracking-widest text-text-disabled border border-dashed border-border-subtle cursor-default">
          {full ? "Event Full" : "Registration Closed"}
        </div>
      )}
    </div>
  );
}
