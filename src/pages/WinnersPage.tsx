import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Loader2, Sparkles, Award, ChevronDown } from 'lucide-react';
import { getEvents, getWinners, getAllRegistrations, db } from '../lib/firestore';
import { getDocs, collection, query, where } from 'firebase/firestore';
import type { Event, Winner } from '../types';
import { categoryLabel } from '../types';
import { playSynthSound } from '../lib/audio';

type CompetingTeam = {
  regId: string;
  leaderName: string;
  members: string[];
  teamName?: string;
};

function ContenderRoster({ contenders }: { contenders: CompetingTeam[] }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...contenders].sort((a, b) =>
    (a.teamName || a.leaderName).localeCompare(b.teamName || b.leaderName)
  );
  const visible = expanded ? sorted : sorted.slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      <h3
        className="text-primary uppercase flex items-center gap-2 pb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, letterSpacing: '0.04em' }}
      >
        <Users size={14} /> ROSTER
      </h3>

      {contenders.length === 0 ? (
        <span className="font-body text-small text-text-muted italic">Waiting for contestants to register.</span>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 divide-y divide-border-subtle/30" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {visible.map((c, i) => (
              <div key={c.regId} className="pt-1.5 flex items-center justify-between text-xs text-text-secondary">
                <span className="font-bold truncate max-w-[130px]">{c.teamName || c.leaderName}</span>
                <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>#{(i + 1).toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
          {sorted.length > 3 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-primary mt-1"
              style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              {expanded ? `Show Less` : `+${sorted.length - 3} More`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function WinnersPage() {
  console.log("[Mount] WinnersPage component loaded");
  const [events, setEvents] = useState<Event[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [competingTeams, setCompetingTeams] = useState<Map<string, CompetingTeam[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [evs, winList, regs] = await Promise.all([
          getEvents(),
          getWinners(),
          getAllRegistrations(),
        ]);

        // Load all active team members
        const memsSnap = await getDocs(
          query(collection(db, 'teamMembers'), where('status', '==', 'ACTIVE'))
        );
        const allMembers = memsSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            registrationId: data.registrationId ?? '',
            role: data.role ?? 'MEMBER',
            name: data.name ?? '',
            userId: data.userId ?? '',
          };
        });

        // Group members by registrationId
        const regMembersMap = new Map<string, typeof allMembers>();
        for (const m of allMembers) {
          if (!regMembersMap.has(m.registrationId)) {
            regMembersMap.set(m.registrationId, []);
          }
          regMembersMap.get(m.registrationId)!.push(m);
        }

        // Build competing teams grouped by eventId
        const eventTeamsMap = new Map<string, CompetingTeam[]>();
        for (const reg of regs) {
          const regMems = regMembersMap.get(reg.id) ?? [];
          const leader = regMems.find((m) => m.role === 'LEADER');
          const membersList = regMems.filter((m) => m.role === 'MEMBER').map((m) => m.name);

          const team: CompetingTeam = {
            regId: reg.id,
            leaderName: leader?.name ?? 'Anonymous Participant',
            members: membersList,
            teamName: reg.teamName,
          };

          if (!eventTeamsMap.has(reg.eventId)) {
            eventTeamsMap.set(reg.eventId, []);
          }
          eventTeamsMap.get(reg.eventId)!.push(team);
        }

        setEvents(evs);
        setWinners(winList);
        setCompetingTeams(eventTeamsMap);
      } catch (err) {
        console.error('[WinnersPage] Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-bg-base px-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-primary" />
          <span className="font-heading text-heading text-text-secondary uppercase tracking-widest">Loading leaderboard details...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen py-12 max-w-7xl mx-auto flex flex-col gap-12 px-4 md:px-6">
      {/* Header */}
      <header
        className="flex flex-col gap-4 pb-8 relative overflow-hidden p-6 comic-border-thick"
        style={{ background: 'var(--panel-bg)', transform: 'rotate(-0.5deg)' }}
      >
        <div className="absolute inset-0 hatch-pattern pointer-events-none" style={{ opacity: 0.15 }} />
        <span
          className="comic-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'Bangers, cursive',
            fontSize: '13px',
            padding: '3px 12px',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-base)',
            width: 'fit-content',
            transform: 'rotate(1deg)',
            textShadow: 'none'
          }}
        >
          <Sparkles size={12} className="shrink-0" /> THE CHAMPIONS
        </span>
        <h1
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(50px, 9vw, 84px)',
            lineHeight: 0.9,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-6deg)',
          }}
        >
          Hall of Fame
        </h1>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Honor roll displaying placement rankings, podium finishers, and arena contenders for SPECTRUM 26.
        </p>
      </header>

      {/* Grid of Events */}
      <div className="flex flex-col gap-16">
        {events.map((event) => {
          const eventWinners = winners.filter((w) => w.eventId === event.id);
          const first = eventWinners.find((w) => w.placement === 1);
          const second = eventWinners.find((w) => w.placement === 2);
          const third = eventWinners.find((w) => w.placement === 3);

          const contenders = competingTeams.get(event.id) ?? [];

          const resolveTeamName = (win: Winner | undefined) => {
            if (!win) return null;
            const match = contenders.find((c) => c.regId === win.registrationId);
            return match ? (match.teamName || match.leaderName) : 'Anonymous';
          };

          const isSolo = event.minMembers === 1 && event.maxMembers === 1;
          const isDuo = event.minMembers === 2 && event.maxMembers === 2;

          return (
            <div
              key={event.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 comic-border-thick p-6 relative overflow-hidden"
              style={{ background: 'var(--panel-bg)' }}
            >
              {/* Event category indicator tag */}
              <div className="absolute -top-[1px] -right-[1px] px-4 py-1.5 font-micro text-micro uppercase tracking-widest bg-primary text-bg-base font-bold z-10">
                {categoryLabel(event.category)}
              </div>

              {/* Left Column: Event details */}
              <div className="lg:col-span-4 flex flex-col justify-between pb-6 lg:pb-0 lg:pr-6">
                <div className="flex flex-col gap-3">
                  <span className="font-micro text-micro text-text-muted uppercase tracking-widest">
                    {isSolo ? 'Solo Arena' : isDuo ? 'Duo Partners' : 'Squad Battle'}
                  </span>
                  <h2 className="font-hero text-[32px] uppercase tracking-wide text-primary leading-tight">
                    {event.name}
                  </h2>
                  <p className="font-body text-small text-text-secondary leading-relaxed">
                    {event.description || 'Event description coming soon.'}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="comic-badge text-xs" style={{ padding: '6px 12px', textShadow: 'none' }}>
                    Fee: ₹{event.price}
                  </span>
                  <span className="comic-badge text-xs" style={{ padding: '6px 12px', textShadow: 'none' }}>
                    Size: {event.maxMembers === 1 ? '1 Player' : `${event.minMembers}-${event.maxMembers} Players`}
                  </span>
                </div>
              </div>

              {/* Center Column: Dynamic Podium Display */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <h3 className="text-primary uppercase flex items-center gap-2 border-b border-border-subtle pb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, letterSpacing: '0.04em' }}>
                  <Trophy size={16} /> PODIUM FINISHERS
                </h3>

                {/* Physical Podium Layout */}
                <div className="flex items-end justify-center gap-2 pt-6 h-[200px]" style={{ fontFamily: 'Bangers, cursive', userSelect: 'none' }}>
                  {/* 2nd Place (Silver) */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="text-center mb-2 px-1 w-full truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700 }}>
                      <span className={second ? "text-primary" : "text-gray-400"} style={{ color: second ? undefined : '#9ca3af' }}>
                        {resolveTeamName(second) ?? 'TBA'}
                      </span>
                    </div>
                    <div
                      className="w-full text-center flex flex-col justify-center items-center relative"
                      style={{
                        height: '90px',
                        background: 'linear-gradient(180deg, #9ca3af 0%, #4b5563 100%)',
                        border: '3px solid var(--border-color)',
                        boxShadow: '2px 2px 0px var(--border-color)',
                      }}
                    >
                      <span className="text-[32px] text-black">2</span>
                      <span className="absolute bottom-1 font-body text-[9px] uppercase font-bold text-gray-200">SILVER</span>
                    </div>
                  </div>

                  {/* 1st Place (Gold) */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="text-center mb-2 px-1 w-full truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 800 }}>
                      <span className="text-yellow-400 flex items-center justify-center gap-0.5"><Award size={13} /> {resolveTeamName(first) ?? 'TBA'}</span>
                    </div>
                    <div
                      className="w-full text-center flex flex-col justify-center items-center relative"
                      style={{
                        height: '130px',
                        background: 'linear-gradient(180deg, #fbbf24 0%, #b45309 100%)',
                        border: '3px solid var(--border-color)',
                        boxShadow: '3px 3px 0px var(--border-color)',
                      }}
                    >
                      <span className="text-[44px] text-black">1</span>
                      <span className="absolute bottom-1 font-body text-[10px] uppercase font-bold text-yellow-100">CHAMPION</span>
                    </div>
                  </div>

                  {/* 3rd Place (Bronze) */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="text-center mb-2 px-1 w-full truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700 }}>
                      <span className={third ? "text-primary" : "text-amber-700"} style={{ color: third ? undefined : '#cd7f32' }}>
                        {resolveTeamName(third) ?? 'TBA'}
                      </span>
                    </div>
                    <div
                      className="w-full text-center flex flex-col justify-center items-center relative"
                      style={{
                        height: '70px',
                        background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
                        border: '3px solid var(--border-color)',
                        boxShadow: '1.5px 1.5px 0px var(--border-color)',
                      }}
                    >
                      <span className="text-[28px] text-black">3</span>
                      <span className="absolute bottom-1 font-body text-[9px] uppercase font-bold text-amber-200">BRONZE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contender list */}
              <div className="lg:col-span-3 flex flex-col justify-between pt-6 lg:pt-0 lg:pl-6">
                <ContenderRoster contenders={contenders} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
