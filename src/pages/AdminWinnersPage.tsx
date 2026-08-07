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
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      <div className="border-b-2 border-primary pb-6">
        <h1 className="font-hero text-[40px] leading-none uppercase tracking-widest text-primary">Winners</h1>
      </div>

      <div className="flex flex-col gap-12">
        {events.map((event) => {
          const eventWinners = winners.get(event.id) ?? new Map<1 | 2 | 3, Winner>();
          const eventRegs = regs.filter((r) => r.eventId === event.id);

          return (
            <div key={event.id} className="flex flex-col gap-4">
              {/* Event heading */}
              <div className="flex items-center gap-4 pb-2" style={{ border: 'none' }}>
                <span
                  className="font-micro text-micro uppercase tracking-widest mr-2"
                  style={{ color: '#ff3333', background: 'transparent', border: 'none', padding: 0 }}
                >
                  {categoryLabel(event.category)}
                </span>
                <h2 className="font-heading text-card-title text-primary uppercase" style={{ margin: 0 }}>{event.name}</h2>
                <span className="font-micro text-micro text-text-muted uppercase">
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
                  <div key={placement} className="py-2" style={{ borderStyle: 'none' }}>
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-6 p-4 border border-border-default rounded bg-bg-card hover:border-primary transition-all">
                      {/* Trophy */}
                      <div className="flex items-center gap-3 min-w-[80px]">
                        <Trophy size={18} className="text-primary opacity-70" />
                        <span className="font-hero text-[20px] text-primary tracking-widest">{PLACEMENT_LABEL[placement]}</span>
                      </div>

                      {/* Winner info */}
                      <div className="flex-1 flex flex-col gap-1">
                        {winner && winnerReg ? (
                          <>
                            <span className="font-heading text-heading text-primary uppercase">
                              {leader?.name ?? winnerReg.id}
                            </span>
                            <span className="font-body text-small text-text-muted">
                              Reg: {winnerReg.id.slice(0, 16)}…
                            </span>
                          </>
                        ) : (
                          <span className="font-body text-small text-text-muted italic">Not recorded yet</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => isSelectOpen ? closeState() : openSelect(event.id, placement)}
                          className="flex items-center gap-2 px-4 py-2 border border-border-default hover:border-primary text-text-secondary hover:text-primary font-button text-button uppercase transition-colors"
                        >
                          <Pencil size={14} /> {winner ? 'Change' : 'Set'}
                        </button>
                        {winner && (
                          <button
                            onClick={() => handleClearWinner(event.id, placement)}
                            disabled={saving}
                            className="p-2 border border-border-default hover:border-primary text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Inline: Select winner ── */}
                    {isSelectOpen && (
                      <div className="expand-in border-t border-border-default px-6 py-6 bg-bg-elevated flex flex-col gap-4">
                        <p className="font-micro text-micro text-text-muted uppercase tracking-widest">
                          Select team for {PLACEMENT_LABEL[placement]} place
                        </p>
                        <select
                          value={selectedRegId}
                          onChange={(e) => setSelectedRegId(e.target.value)}
                          className="bg-bg-base border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
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
                        {error && <p className="font-body text-small text-text-secondary">{error}</p>}
                        <div className="flex gap-3">
                          <button onClick={closeState} className="px-5 py-3 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70">Cancel</button>
                          <button
                            onClick={handleSetWinner}
                            disabled={saving || !selectedRegId}
                            className="px-8 py-3 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                          >
                            {saving && <Loader2 size={14} className="animate-spin" />} Confirm
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
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      <div className="skeleton h-12 w-40 rounded border-b-2 border-primary pb-6" style={{ background: 'var(--color-bg-card)' }} />
      <div className="flex flex-col gap-6">
        {[1, 2].map((i) => <div key={i} className="skeleton h-32 w-full rounded" style={{ background: 'var(--color-bg-card)' }} />)}
      </div>
    </main>
  );
}
