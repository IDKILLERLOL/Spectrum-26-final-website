import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Trophy, Users, Loader2, X, ArrowRight, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { getEvents, db, createRegistration, updateUser } from '../lib/firestore';
import { getDocs, collection, query, where } from 'firebase/firestore';
import type { Event } from '../types';
import { canRegister, categoryLabel, isEventFull, FALLBACK_EVENTS } from '../types';
import { playSynthSound } from '../lib/audio';
import { useAuth } from '../lib/useAuth';

const EVENT_BADGE: Record<string, string> = {
  'BGMI': 'RED ZONE',
  'FC 26': 'GOAL!',
  'Dual Debug': 'TECH',
  'Code Clash': 'TECH'
};

const TECH_ROUND_DETAILS: Record<string, string[]> = {
  'Dual Debug': [
    "Sub-Event 1: Swap Challenge — Duos solve 3 coding problems in Round 1, strategize in a 5-min break, then swap places to solve their teammate's remaining unsolved challenges in Round 2.",
    "Sub-Event 2: Codopoly — A 2v2v2v2 board game where topic tiles (DSA, Networks, OS, DBMS) are claimed by answering questions correctly, charging question taxes/penalties to opponents.",
    "Sub-Event 3: Snakes & Ladders — Dodge snakes and climb ladders by opting into solving hard and extra-hard tech challenges on a shared digital board."
  ],
  'Code Clash': [
    "Sub-Event 1: MCQ Round — Rapid-fire multiple-choice tournament where speed and accuracy determine scoring as timers tick down.",
    "Sub-Event 2: Bingo — 4-5 players play on a shared CS topic grid, claiming cells and winning points, aiming to complete a line first.",
    "Sub-Event 3: Buzzer Round — Solo battle featuring 31 questions of escalating difficulty using a fastest-finger-buzzer system with wrong answer penalties."
  ]
};

export function EventsPage() {
  console.log("[Mount] EventsPage component loaded");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  
  // Card Expansion States
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);

  // Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regTeamName, setRegTeamName] = useState('');
  const [regMembers, setRegMembers] = useState<{ name: string; email: string; phone: string; college: string; }[]>([]);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSubmitting, setRegSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEvents()
      .then((data) => { if (data && data.length > 0) setEvents(data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    getDocs(collection(db, 'teamMembers'))
      .then(async (memsSnap) => {
        const regsSnap = await getDocs(collection(db, 'registrations'));
        const regToEventMap = new Map<string, string>();
        for (const doc of regsSnap.docs) regToEventMap.set(doc.id, doc.data().eventId);
        const counts: Record<string, number> = {};
        for (const doc of memsSnap.docs) {
          const mData = doc.data();
          const status = mData.status ?? 'ACTIVE';
          if (status !== 'ACTIVE') continue;
          
          const evId = regToEventMap.get(mData.registrationId);
          if (evId) counts[evId] = (counts[evId] || 0) + 1;
        }
        setParticipantCounts(counts);
      })
      .catch(console.error);
  }, []);

  // Initialize form state when an event is selected for registration
  const startRegistration = (event: Event) => {
    navigate(`/register/${event.id}`);
  };

  const handleAddMember = (event: Event) => {
    if (regMembers.length + 1 >= event.maxMembers) return;
    setRegMembers(prev => [...prev, { name: '', email: '', phone: '', college: '' }]);
  };

  const handleRemoveMember = () => {
    setRegMembers(prev => prev.slice(0, -1));
  };

  const handleMemberChange = (idx: number, field: string, val: string) => {
    setRegMembers(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRegSubmit = async (e: React.FormEvent, event: Event) => {
    e.preventDefault();
    if (!user) return;
    setRegSubmitting(true);
    setRegError(null);
    try {
      if (!regName.trim() || !regEmail.trim()) {
        setRegError('Name and Email are required.');
        setRegSubmitting(false);
        return;
      }
      if (event.isTeamEvent) {
        if (!regTeamName.trim()) {
          setRegError('Team Name is required.');
          setRegSubmitting(false);
          return;
        }
        for (let i = 0; i < regMembers.length; i++) {
          const m = regMembers[i];
          if (!m.name.trim() || !m.email.trim()) {
            setRegError(`Please fill in Name and Email for Member #${i + 1}.`);
            setRegSubmitting(false);
            return;
          }
        }
      }

      await updateUser(user.uid, {
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim(),
        college: regCollege.trim(),
      });

      const newReg = await createRegistration(
        event.id,
        {
          uid: user.uid,
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          college: regCollege.trim(),
        },
        user.email || regEmail.trim(),
        event.isTeamEvent ? regMembers : [],
        event.isTeamEvent ? regTeamName.trim() : undefined
      );

      sessionStorage.setItem('spectrum26_active_registration_id', newReg.id);
      navigate('/event-dashboard');
    } catch (err: any) {
      console.error(err);
      setRegError(err.message || 'Registration failed');
    } finally {
      setRegSubmitting(false);
    }
  };

  const techEvents = events.filter((e) => e.category === 'TECH');
  const nonTechEvents = events.filter((e) => e.category === 'NON_TECH');

  return (
    <main className="relative z-10 max-w-7xl mx-auto w-[92%] py-12 flex flex-col gap-16">
      
      {/* ── TECH EVENTS ── */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div
            className="comic-badge flex items-center gap-2"
            style={{
              fontSize: '20px',
              padding: '6px 16px',
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg-base)',
              transform: 'rotate(-2deg)',
            }}
          >
            TECH COMBATANTS
          </div>
          <div style={{ flex: 1, height: '4px', background: 'var(--border-color)' }} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {techEvents.map((e) => {
            const isExpanded = expandedEventId === e.id;
            const isRegistering = registeringEventId === e.id;
            const participantCount = participantCounts[e.id] ?? 0;
            const full = isEventFull(e);
            const open = canRegister(e);
            const isSolo = e.minMembers === 1 && e.maxMembers === 1;
            const isDuo = e.minMembers === 2 && e.maxMembers === 2;

            return (
              <motion.article
                key={e.id}
                layout
                layoutId={`card-${e.id}`}
                className={`comic-border-thick comic-shadow p-6 flex flex-col gap-4 relative overflow-hidden transition-colors ${
                  isExpanded ? 'lg:col-span-2' : ''
                }`}
                style={{ background: 'var(--panel-bg)' }}
              >
                {/* Header Tag */}
                <div className="flex justify-between items-center">
                  <span className="comic-badge px-2 py-0.5 text-xs" style={{ background: 'var(--color-text-primary)', color: 'var(--color-bg-base)' }}>
                    {EVENT_BADGE[e.name] || 'EVENT'}
                  </span>
                  <span className="comic-badge px-2 py-0.5 text-xs">
                    {participantCount} enlisted
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 style={{ fontFamily: 'Bangers, cursive', fontSize: '32px', color: 'var(--color-text-primary)' }}>
                    {e.name}
                  </h3>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    {e.description}
                  </p>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-6 pt-4 border-t border-border-default text-left"
                    >
                      {/* Event Parameters Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        <div className="p-3 border border-border-default">
                          <span className="font-micro text-[10px] text-text-muted uppercase">Format</span>
                          <p className="font-heading text-heading text-primary uppercase mt-1">{isSolo ? 'Solo' : isDuo ? 'Duo' : 'Team'}</p>
                        </div>
                        <div className="p-3 border border-border-default">
                          <span className="font-micro text-[10px] text-text-muted uppercase">Team Size</span>
                          <p className="font-heading text-heading text-primary uppercase mt-1">{e.minMembers === e.maxMembers ? (e.minMembers === 2 ? 'Only 2 Players Per Duo' : `Only ${e.minMembers} Player${e.minMembers > 1 ? 's' : ''} Allowed`) : `${e.minMembers}–${e.maxMembers} Players`}</p>
                        </div>
                        <div className="p-3 border border-border-default">
                          <span className="font-micro text-[10px] text-text-muted uppercase">Entry Fee</span>
                          <p className="font-heading text-heading text-primary uppercase mt-1">₹{e.price}</p>
                        </div>
                      </div>

                      {/* Expandable round details */}
                      {TECH_ROUND_DETAILS[e.name] && (
                        <details className="group border border-border-default bg-bg-elevated p-4 cursor-pointer">
                          <summary className="font-heading text-small text-primary uppercase flex justify-between items-center select-none">
                            <span>View Round-by-Round Mechanics</span>
                            <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="mt-4 flex flex-col gap-3 font-body text-small text-text-secondary cursor-default">
                            {TECH_ROUND_DETAILS[e.name].map((round, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>{round}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {/* Inline Registration Form */}
                      {isRegistering ? (
                        <div className="p-6 border-2 border-primary bg-bg-elevated mt-4">
                          <div className="flex justify-between items-center border-b border-border-default pb-2 mb-4">
                            <h4 className="font-heading text-heading text-primary uppercase">Registration Form</h4>
                            <button
                              type="button"
                              onClick={() => setRegisteringEventId(null)}
                              className="text-xs uppercase text-red-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>

                          {regError && (
                            <p className="text-xs text-red-500 mb-4 border border-dashed border-red-500 p-2">{regError}</p>
                          )}

                          <form onSubmit={(ev) => handleRegSubmit(ev, e)} className="flex flex-col gap-4">
                            {e.isTeamEvent && (
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">Team Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={regTeamName}
                                  onChange={(ev) => setRegTeamName(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">Leader Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={regName}
                                  onChange={(ev) => setRegName(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">Leader Email *</label>
                                <input
                                  type="email"
                                  required
                                  value={regEmail}
                                  onChange={(ev) => setRegEmail(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">Leader Phone</label>
                                <input
                                  type="tel"
                                  value={regPhone}
                                  onChange={(ev) => setRegPhone(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">College Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={regCollege}
                                  onChange={(ev) => setRegCollege(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                            </div>

                            {/* Team member rows */}
                            {e.isTeamEvent && (
                              <div className="flex flex-col gap-4 mt-4">
                                <div className="flex justify-between items-center border-b border-border-subtle pb-1">
                                  <span className="font-heading text-small text-primary">Members ({regMembers.length + 1})</span>
                                  <div className="flex gap-2">
                                    {regMembers.length + 1 < e.maxMembers && (
                                      <button
                                        type="button"
                                        onClick={() => handleAddMember(e)}
                                        className="text-[10px] uppercase font-bold border border-primary px-2 py-0.5"
                                      >
                                        + Add
                                      </button>
                                    )}
                                    {regMembers.length + 1 > e.minMembers && (
                                      <button
                                        type="button"
                                        onClick={handleRemoveMember}
                                        className="text-[10px] uppercase font-bold border border-red-500 text-red-500 px-2 py-0.5"
                                      >
                                        - Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {regMembers.map((m, idx) => (
                                  <div key={idx} className="border border-border-default p-3 flex flex-col gap-2">
                                    <span className="font-micro text-[10px] text-primary uppercase">Member #{idx + 2}</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        required
                                        placeholder="Name *"
                                        value={m.name}
                                        onChange={(ev) => handleMemberChange(idx, 'name', ev.target.value)}
                                        className="bg-transparent border-b border-border-strong text-primary text-xs py-1"
                                      />
                                      <input
                                        type="email"
                                        required
                                        placeholder="Email *"
                                        value={m.email}
                                        onChange={(ev) => handleMemberChange(idx, 'email', ev.target.value)}
                                        className="bg-transparent border-b border-border-strong text-primary text-xs py-1"
                                      />
                                      <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={m.phone}
                                        onChange={(ev) => handleMemberChange(idx, 'phone', ev.target.value)}
                                        className="bg-transparent border-b border-border-strong text-primary text-xs py-1"
                                      />
                                      <input
                                        type="text"
                                        required
                                        placeholder="College *"
                                        value={m.college}
                                        onChange={(ev) => handleMemberChange(idx, 'college', ev.target.value)}
                                        className="bg-transparent border-b border-border-strong text-primary text-xs py-1"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={regSubmitting}
                              className="comic-btn w-full mt-4 flex items-center justify-center gap-2"
                            >
                              {regSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Complete Registration <ArrowRight size={14} /></>}
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Buttons */}
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => {
                      playSynthSound('click');
                      navigate(`/event/${e.id}`);
                    }}
                    className="comic-btn-outline flex-1 text-center py-2"
                  >
                    DETAILS
                  </button>
                  {open ? (
                    <button
                      onClick={() => {
                        playSynthSound('laser');
                        navigate(`/register/${e.id}`);
                      }}
                      className="comic-btn flex-1 text-center py-2"
                    >
                      REGISTER
                    </button>
                  ) : (
                    <div className="comic-btn-outline flex-1 text-center py-2 opacity-50 cursor-not-allowed">
                      {full ? 'FULL' : 'CLOSED'}
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ── NON-TECH EVENTS ── */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div
            className="comic-badge flex items-center gap-2"
            style={{
              fontSize: '20px',
              padding: '6px 16px',
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg-base)',
              transform: 'rotate(-2deg)',
            }}
          >
            TACTICAL GAMING
          </div>
          <div style={{ flex: 1, height: '4px', background: 'var(--border-color)' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {nonTechEvents.map((e) => {
            const isExpanded = expandedEventId === e.id;
            const isRegistering = registeringEventId === e.id;
            const participantCount = participantCounts[e.id] ?? 0;
            const full = isEventFull(e);
            const open = canRegister(e);
            const isSolo = e.minMembers === 1 && e.maxMembers === 1;

            return (
              <motion.article
                key={e.id}
                layout
                layoutId={`card-${e.id}`}
                className={`comic-border-thick comic-shadow p-6 flex flex-col gap-4 relative overflow-hidden transition-colors ${
                  isExpanded ? 'lg:col-span-2' : ''
                }`}
                style={{ background: 'var(--panel-bg)' }}
              >
                {/* Header Tag */}
                <div className="flex justify-between items-center">
                  <span className="comic-badge px-2 py-0.5 text-xs" style={{ background: 'var(--color-text-primary)', color: 'var(--color-bg-base)' }}>
                    {EVENT_BADGE[e.name] || 'EVENT'}
                  </span>
                  <span className="comic-badge px-2 py-0.5 text-xs">
                    {participantCount} enlisted
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 style={{ fontFamily: 'Bangers, cursive', fontSize: '32px', color: 'var(--color-text-primary)' }}>
                    {e.name}
                  </h3>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    {e.description}
                  </p>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-6 pt-4 border-t border-border-default text-left"
                    >
                      {/* Event Parameters Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        <div className="p-3 border border-border-default">
                          <span className="font-micro text-[10px] text-text-muted uppercase">Format</span>
                          <p className="font-heading text-heading text-primary uppercase mt-1">{isSolo ? 'Solo' : 'Squad'}</p>
                        </div>
                        <div className="p-3 border border-border-default">
                          <span className="font-micro text-[10px] text-text-muted uppercase">Team Size</span>
                          <p className="font-heading text-heading text-primary uppercase mt-1">{e.minMembers === e.maxMembers ? (e.minMembers === 2 ? 'Only 2 Players Per Duo' : `Only ${e.minMembers} Player${e.minMembers > 1 ? 's' : ''} Allowed`) : `${e.minMembers}–${e.maxMembers} Players`}</p>
                        </div>
                        <div className="p-3 border border-border-default">
                          <span className="font-micro text-[10px] text-text-muted uppercase">Entry Fee</span>
                          <p className="font-heading text-heading text-primary uppercase mt-1">₹{e.price}</p>
                        </div>
                      </div>

                      {/* Inline Registration Form */}
                      {isRegistering ? (
                        <div className="p-6 border-2 border-primary bg-bg-elevated mt-4">
                          <div className="flex justify-between items-center border-b border-border-default pb-2 mb-4">
                            <h4 className="font-heading text-heading text-primary uppercase">Registration Form</h4>
                            <button
                              type="button"
                              onClick={() => setRegisteringEventId(null)}
                              className="text-xs uppercase text-red-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>

                          {regError && (
                            <p className="text-xs text-red-500 mb-4 border border-dashed border-red-500 p-2">{regError}</p>
                          )}

                          <form onSubmit={(ev) => handleRegSubmit(ev, e)} className="flex flex-col gap-4">
                            {e.isTeamEvent && (
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">Team Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={regTeamName}
                                  onChange={(ev) => setRegTeamName(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">Leader Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={regName}
                                  onChange={(ev) => setRegName(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">Leader Email *</label>
                                <input
                                  type="email"
                                  required
                                  value={regEmail}
                                  onChange={(ev) => setRegEmail(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">Leader Phone</label>
                                <input
                                  type="tel"
                                  value={regPhone}
                                  onChange={(ev) => setRegPhone(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-micro font-body uppercase text-text-muted">College Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={regCollege}
                                  onChange={(ev) => setRegCollege(ev.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary py-1.5 focus:outline-none focus:border-primary"
                                />
                              </div>
                            </div>

                            {/* Team member rows */}
                            {e.isTeamEvent && (
                              <div className="flex flex-col gap-4 mt-4">
                                <div className="flex justify-between items-center border-b border-border-subtle pb-1">
                                  <span className="font-heading text-small text-primary">Members ({regMembers.length + 1})</span>
                                  <div className="flex gap-2">
                                    {regMembers.length + 1 < e.maxMembers && (
                                      <button
                                        type="button"
                                        onClick={() => handleAddMember(e)}
                                        className="text-[10px] uppercase font-bold border border-primary px-2 py-0.5"
                                      >
                                        + Add
                                      </button>
                                    )}
                                    {regMembers.length + 1 > e.minMembers && (
                                      <button
                                        type="button"
                                        onClick={handleRemoveMember}
                                        className="text-[10px] uppercase font-bold border border-red-500 text-red-500 px-2 py-0.5"
                                      >
                                        - Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {regMembers.map((m, idx) => (
                                  <div key={idx} className="border border-border-default p-3 flex flex-col gap-2">
                                    <span className="font-micro text-[10px] text-primary uppercase">Member #{idx + 2}</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        required
                                        placeholder="Name *"
                                        value={m.name}
                                        onChange={(ev) => handleMemberChange(idx, 'name', ev.target.value)}
                                        className="bg-transparent border-b border-border-strong text-primary text-xs py-1"
                                      />
                                      <input
                                        type="email"
                                        required
                                        placeholder="Email *"
                                        value={m.email}
                                        onChange={(ev) => handleMemberChange(idx, 'email', ev.target.value)}
                                        className="bg-transparent border-b border-border-strong text-primary text-xs py-1"
                                      />
                                      <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={m.phone}
                                        onChange={(ev) => handleMemberChange(idx, 'phone', ev.target.value)}
                                        className="bg-transparent border-b border-border-strong text-primary text-xs py-1"
                                      />
                                      <input
                                        type="text"
                                        required
                                        placeholder="College *"
                                        value={m.college}
                                        onChange={(ev) => handleMemberChange(idx, 'college', ev.target.value)}
                                        className="bg-transparent border-b border-border-strong text-primary text-xs py-1"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={regSubmitting}
                              className="comic-btn w-full mt-4 flex items-center justify-center gap-2"
                            >
                              {regSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Complete Registration <ArrowRight size={14} /></>}
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Buttons */}
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => {
                      playSynthSound('click');
                      navigate(`/event/${e.id}`);
                    }}
                    className="comic-btn-outline flex-1 text-center py-2"
                  >
                    DETAILS
                  </button>
                  {open ? (
                    <button
                      onClick={() => {
                        playSynthSound('laser');
                        navigate(`/register/${e.id}`);
                      }}
                      className="comic-btn flex-1 text-center py-2"
                    >
                      REGISTER
                    </button>
                  ) : (
                    <div className="comic-btn-outline flex-1 text-center py-2 opacity-50 cursor-not-allowed">
                      {full ? 'FULL' : 'CLOSED'}
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

    </main>
  );
}
