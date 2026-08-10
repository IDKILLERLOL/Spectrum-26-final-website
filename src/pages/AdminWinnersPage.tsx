import { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Loader2, Trophy } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getEvents, getWinners, setWinner, clearWinner, getAllRegistrations, getActiveTeamMembers,
} from '../lib/firestore';
import type { Event, Winner, Registration, TeamMember } from '../types';
import { categoryLabel } from '../types';

const PLACEMENTS = [1, 2, 3] as const;
const PLACEMENT_LABEL: Record<1 | 2 | 3, string> = { 1: '1st', 2: '2nd', 3: '3rd' };

type WinnersMap = Map<string, Map<1 | 2 | 3, Winner>>; // eventId → placement → Winner

type RegRow = Registration & { members: TeamMember[] };

type InlineState =
  | { type: 'none' }
  | { type: 'select'; eventId: string; placement: 1 | 2 | 3 };

export function AdminWinnersPage() {
  console.log("[Mount] AdminWinnersPage component loaded");
  const { adminEmail } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [winners, setWinnersMap] = useState<WinnersMap>(new Map());
  const [regs, setRegs] = useState<RegRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inlineState, setInlineState] = useState<InlineState>({ type: 'none' });
  const [saving, setSaving] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [evs, allWinners, allRegs] = await Promise.all([
      getEvents(),
      getWinners(),
      getAllRegistrations(),
    ]);
    const members = await Promise.all(allRegs.map((r) => getActiveTeamMembers(r.id)));
    const regRows: RegRow[] = allRegs.map((r, i) => ({ ...r, members: members[i] }));

    const map: WinnersMap = new Map();
    for (const w of allWinners) {
      if (!map.has(w.eventId)) map.set(w.eventId, new Map());
      map.get(w.eventId)!.set(w.placement, w);
    }
    setEvents(evs);
    setWinnersMap(map);
    setRegs(regRows);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));

    const handleGlobalReload = () => {
      reload();
    };
    window.addEventListener('spectrum26_reload_data', handleGlobalReload);
    return () => window.removeEventListener('spectrum26_reload_data', handleGlobalReload);
  }, [reload]);

  const openSelect = (eventId: string, placement: 1 | 2 | 3) => {
    setSelectedRegId('');
    setError(null);
    setInlineState({ type: 'select', eventId, placement });
  };

  const closeState = () => setInlineState({ type: 'none' });

  const handleSetWinner = async () => {
    if (inlineState.type !== 'select' || !selectedRegId) return;
    setSaving(true);
    try {
      await setWinner(inlineState.eventId, inlineState.placement, selectedRegId, adminEmail ?? '');
      await reload();
      closeState();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to record winner.');
    } finally { setSaving(false); }
  };

  const handleClearWinner = async (eventId: string, placement: 1 | 2 | 3) => {
    setSaving(true);
    try {
      await clearWinner(eventId, placement, adminEmail ?? '');
      await reload();
    } finally { setSaving(false); }
  };

  if (loading) return <PageSkeleton />;

  return (
    <main className="">
      <div className="">
        <h1 className="">Winners</h1>
      </div>

      <div className="">
        {events.map((event) => {
          const eventWinners = winners.get(event.id) ?? new Map<1 | 2 | 3, Winner>();
          const eventRegs = regs.filter((r) => r.eventId === event.id);

          return (
            <div key={event.id} className="">
              {/* Event heading */}
              <div className="" style={{ border: 'none' }}>
                <span
                  className=""
                  style={{ color: '#ff3333', background: 'transparent', border: 'none', padding: 0 }}
                >
                  {categoryLabel(event.category)}
                </span>
                <h2 className="" style={{ margin: 0 }}>{event.name}</h2>
                <span className="">
                  {eventRegs.length} team(s)
                </span>
              </div>

              {/* Placement rows */}
              {PLACEMENTS.map((placement) => {
                const winner = eventWinners.get(placement);
                const winnerReg = winner ? regs.find((r) => r.id === winner.registrationId) : null;
                const leader = winnerReg?.members.find((m) => m.role === 'LEADER');
                const isSelectOpen =
                  inlineState.type === 'select' &&
                  inlineState.eventId === event.id &&
                  inlineState.placement === placement;

                return (
                  <div key={placement} className="" style={{ borderStyle: 'none' }}>
                    <div className="">
                      {/* Trophy */}
                      <div className="">
                        <Trophy size={18} className="" />
                        <span className="">{PLACEMENT_LABEL[placement]}</span>
                      </div>

                      {/* Winner info */}
                      <div className="">
                        {winner && winnerReg ? (
                          <>
                            <span className="">
                              {leader?.name ?? winnerReg.id}
                            </span>
                            <span className="">
                              Reg: {winnerReg.id.slice(0, 16)}…
                            </span>
                          </>
                        ) : (
                          <span className="">Not recorded yet</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="">
                        <button
                          onClick={() => isSelectOpen ? closeState() : openSelect(event.id, placement)}
                          className=""
                        >
                          <Pencil size={14} /> {winner ? 'Change' : 'Set'}
                        </button>
                        {winner && (
                          <button
                            onClick={() => handleClearWinner(event.id, placement)}
                            disabled={saving}
                            className=""
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Inline: Select winner ── */}
                    {isSelectOpen && (
                      <div className="">
                        <p className="">
                          Select team for {PLACEMENT_LABEL[placement]} place
                        </p>
                        <select
                          value={selectedRegId}
                          onChange={(e) => setSelectedRegId(e.target.value)}
                          className=""
                        >
                          <option value="">— Select a team —</option>
                          {eventRegs.map((r) => {
                            const ldr = r.members.find((m) => m.role === 'LEADER');
                            return (
                              <option key={r.id} value={r.id}>
                                {ldr?.name ?? r.id.slice(0, 12)} ({r.id.slice(0, 8)})
                              </option>
                            );
                          })}
                        </select>
                        {error && <p className="">{error}</p>}
                        <div className="">
                          <button onClick={closeState} className="">Cancel</button>
                          <button
                            onClick={handleSetWinner}
                            disabled={saving || !selectedRegId}
                            className=""
                          >
                            {saving && <Loader2 size={14} className="" />} Confirm
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function PageSkeleton() {
  return (
    <main className="">
      <div className="" style={{ background: 'var(--color-bg-card)' }} />
      <div className="">
        {[1, 2].map((i) => <div key={i} className="" style={{ background: 'var(--color-bg-card)' }} />)}
      </div>
    </main>
  );
}
