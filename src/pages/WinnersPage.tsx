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
    <div className="">
      <h3
        className=""
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, letterSpacing: '0.04em' }}
      >
        <Users size={14} /> ROSTER
      </h3>

      {contenders.length === 0 ? (
        <span className="">Waiting for contestants to register.</span>
      ) : (
        <>
          <div className="" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {visible.map((c, i) => (
              <div key={c.regId} className="">
                <span className="">{c.teamName || c.leaderName}</span>
                <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>#{(i + 1).toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
          {sorted.length > 3 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className=""
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
      <main className="">
        <div className="">
          <Loader2 size={36} className="" />
          <span className="">Loading leaderboard details...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      {/* Header */}
      <header
        className=""
        style={{ background: 'var(--panel-bg)', transform: 'rotate(-0.5deg)' }}
      >
        <div className="" style={{ opacity: 0.15 }} />
        <span
          className=""
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '11px',
            padding: '4px 12px',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-base)',
            width: 'fit-content',
            transform: 'rotate(1deg)',
            textShadow: 'none'
          }}
        >
          <Sparkles size={12} className="" /> THE CHAMPIONS
        </span>
        <h1
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(28px, 6vw, 54px)',
            lineHeight: 1.1,
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
      <div className="">
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
              className=""
              style={{ background: 'var(--panel-bg)' }}
            >
              {/* Event category indicator tag */}
              <div className="">
                {categoryLabel(event.category)}
              </div>

              {/* Left Column: Event details */}
              <div className="">
                <div className="">
                  <span className="">
                    {isSolo ? 'Solo Arena' : isDuo ? 'Duo Partners' : 'Squad Battle'}
                  </span>
                  <h2 className="">
                    {event.name}
                  </h2>
                  <p className="">
                    {event.description || 'Event description coming soon.'}
                  </p>
                </div>
                <div className="">
                  <span className="" style={{ padding: '6px 12px', textShadow: 'none' }}>
                    Fee: ₹{event.price}
                  </span>
                  <span className="" style={{ padding: '6px 12px', textShadow: 'none' }}>
                    Size: {event.maxMembers === 1 ? '1 Player' : `${event.minMembers}-${event.maxMembers} Players`}
                  </span>
                </div>
              </div>

              {/* Center Column: Dynamic Podium Display */}
              <div className="">
                <h3 className="" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, letterSpacing: '0.04em' }}>
                  <Trophy size={16} /> PODIUM FINISHERS
                </h3>

                {/* Physical Podium Layout */}
                <div className="" style={{ fontFamily: "'Press Start 2P', monospace", userSelect: 'none', fontSize: '10px' }}>
                  {/* 2nd Place (Silver) */}
                  <div className="">
                    <div className="" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700 }}>
                      <span className={second ? "text-primary" : "text-gray-400"} style={{ color: second ? undefined : '#9ca3af' }}>
                        {resolveTeamName(second) ?? 'TBA'}
                      </span>
                    </div>
                    <div
                      className=""
                      style={{
                        height: '90px',
                        background: 'linear-gradient(180deg, #9ca3af 0%, #4b5563 100%)',
                        border: '3px solid var(--border-color)',
                        boxShadow: '2px 2px 0px var(--border-color)',
                      }}
                    >
                      <span className="">2</span>
                      <span className="">SILVER</span>
                    </div>
                  </div>

                  {/* 1st Place (Gold) */}
                  <div className="">
                    <div className="" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 800 }}>
                      <span className=""><Award size={13} /> {resolveTeamName(first) ?? 'TBA'}</span>
                    </div>
                    <div
                      className=""
                      style={{
                        height: '130px',
                        background: 'linear-gradient(180deg, #fbbf24 0%, #b45309 100%)',
                        border: '3px solid var(--border-color)',
                        boxShadow: '3px 3px 0px var(--border-color)',
                      }}
                    >
                      <span className="">1</span>
                      <span className="">CHAMPION</span>
                    </div>
                  </div>

                  {/* 3rd Place (Bronze) */}
                  <div className="">
                    <div className="" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700 }}>
                      <span className={third ? "text-primary" : "text-amber-700"} style={{ color: third ? undefined : '#cd7f32' }}>
                        {resolveTeamName(third) ?? 'TBA'}
                      </span>
                    </div>
                    <div
                      className=""
                      style={{
                        height: '70px',
                        background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
                        border: '3px solid var(--border-color)',
                        boxShadow: '1.5px 1.5px 0px var(--border-color)',
                      }}
                    >
                      <span className="">3</span>
                      <span className="">BRONZE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contender list */}
              <div className="">
                <ContenderRoster contenders={contenders} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
