import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Loader2 } from 'lucide-react';
import { getEvents, getWinners, getAllRegistrations, db } from '../lib/firestore';
import { getDocs, collection, query, where } from 'firebase/firestore';
import type { Event, Winner, Registration, TeamMember } from '../types';
import { categoryLabel } from '../types';

type CompetingTeam = {
  regId: string;
  leaderName: string;
  members: string[];
  teamName?: string;
};

export function WinnersPage() {
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
    <main className="w-full min-h-screen py-8 px-6 max-w-7xl mx-auto flex flex-col gap-12 md:gap-16">
      {/* Header */}
      <header className="flex flex-col gap-6 border-b-2 border-primary pb-8">
        <h1 className="font-hero text-[48px] md:text-[64px] leading-none uppercase tracking-widest text-primary">
          Hall of Fame
        </h1>
        <p className="font-body text-body text-text-secondary max-w-2xl">
          The ultimate champions of SPECTRUM 26 along with all registered contenders.
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

          // Helper to resolve team display string
          const resolveTeamName = (win: Winner | undefined) => {
            if (!win) return null;
            const match = contenders.find((c) => c.regId === win.registrationId);
            return match ? (match.teamName || match.leaderName) : 'Anonymous';
          };

          return (
            <div key={event.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-border-default bg-bg-card p-8 shadow-xl relative overflow-hidden">
              {/* Event category indicator tag */}
              <div className="absolute top-0 right-0 px-4 py-1.5 font-micro text-micro uppercase tracking-widest bg-primary text-bg-base font-bold">
                {categoryLabel(event.category)}
              </div>

              {/* Event Header Detail */}
              <div className="lg:col-span-4 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-border-subtle pb-6 lg:pb-0 lg:pr-8">
                <span className="font-micro text-micro text-text-muted uppercase tracking-widest">
                  {event.isTeamEvent ? 'Team Event' : 'Solo Event'}
                </span>
                <h2 className="font-hero text-[28px] uppercase tracking-wide text-primary leading-tight">
                  {event.name}
                </h2>
                <p className="font-body text-small text-text-secondary leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Podium Column */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <h3 className="font-heading text-heading text-primary uppercase flex items-center gap-2 border-b border-border-subtle pb-2" style={{ letterSpacing: '0.3em' }}>
                  <Trophy size={16} /> Winners
                </h3>

                <div className="flex flex-col gap-4">
                  {/* 1st Place */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-heading font-bold">1</span>
                    <div className="flex flex-col">
                      <span className="font-heading text-heading text-primary">
                        {resolveTeamName(first) ?? 'TBA'}
                      </span>
                      <span className="font-micro text-micro text-text-muted uppercase">1st Place</span>
                    </div>
                  </div>

                  {/* 2nd Place */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-400 text-black flex items-center justify-center font-heading font-bold">2</span>
                    <div className="flex flex-col">
                      <span className="font-heading text-heading text-primary">
                        {resolveTeamName(second) ?? 'TBA'}
                      </span>
                      <span className="font-micro text-micro text-text-muted uppercase">2nd Place</span>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-heading font-bold">3</span>
                    <div className="flex flex-col">
                      <span className="font-heading text-heading text-primary">
                        {resolveTeamName(third) ?? 'TBA'}
                      </span>
                      <span className="font-micro text-micro text-text-muted uppercase">3rd Place</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competing Teams Column */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <h3 className="font-heading text-heading text-primary uppercase flex items-center gap-2 border-b border-border-subtle pb-2" style={{ letterSpacing: '0.3em' }}>
                  <Users size={16} /> Competing Roster ({contenders.length})
                </h3>

                {contenders.length === 0 ? (
                  <span className="font-body text-small text-text-muted italic">No registrations recorded yet.</span>
                ) : (
                  <div className="max-h-48 overflow-y-auto pr-2 flex flex-col gap-2 divide-y divide-border-subtle/30">
                    {contenders.map((c) => (
                      <div key={c.regId} className="pt-2 flex flex-col gap-0.5">
                        <span className="font-heading text-small text-primary">{c.teamName || c.leaderName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
