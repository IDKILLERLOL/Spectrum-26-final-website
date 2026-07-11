import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, Lock, ShieldAlert } from 'lucide-react';
import { getRegistration, getEvent, getActiveTeamMembers } from '../lib/firestore';
import type { Registration, Event, TeamMember } from '../types';
import { categoryLabel } from '../types';

export function PublicPassPage() {
  const { id } = useParams<{ id: string }>();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showId, setShowId] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const scannedMemberId = queryParams.get('memberId');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRegistration(id)
      .then(async (reg) => {
        if (reg) {
          setRegistration(reg);
          const [mems, ev] = await Promise.all([
            getActiveTeamMembers(reg.id),
            getEvent(reg.eventId),
          ]);
          setMembers(mems);
          setEvent(ev);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-bg-base px-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-primary" />
          <span className="font-heading text-heading text-text-secondary uppercase tracking-widest">Loading Pass details...</span>
        </div>
      </main>
    );
  }

  if (!registration || !event) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-bg-base px-6">
        <div className="text-center flex flex-col gap-6 max-w-md border border-red-500/30 p-8 bg-bg-card">
          <ShieldAlert size={48} className="text-red-500 mx-auto" />
          <h2 className="font-heading text-card-title text-primary uppercase tracking-wide">Invalid Pass</h2>
          <p className="font-body text-body text-text-secondary">
            This entry pass could not be verified or does not exist in the database.
          </p>
          <Link to="/" className="font-button text-button text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-bg-base transition-colors uppercase tracking-wide">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const paid = registration.feeStatus === 'PAID';

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-bg-base px-6 py-12">
      <div className="w-full max-w-lg border border-border-default bg-bg-card flex flex-col shadow-2xl relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className={`absolute top-0 right-0 px-6 py-2 font-micro text-micro uppercase tracking-widest text-bg-base font-bold ${paid ? 'bg-primary' : 'bg-red-500'}`}>
          {paid ? 'Verified' : 'Unpaid'}
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-2 border-b border-border-strong pb-6">
            <span className="font-micro text-micro text-text-muted uppercase tracking-widest">
              {categoryLabel(event.category)} • {event.isTeamEvent ? 'Team' : 'Solo'}
            </span>
            <h1 className="font-hero text-[32px] leading-tight uppercase tracking-wide text-primary">
              {event.name}
            </h1>
          </div>

          {/* Members list */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-heading text-text-muted uppercase tracking-wider border-b border-border-subtle pb-2">
              Registered Roster
            </h3>
            <div className="flex flex-col gap-3">
              {members.map((member) => {
                const isScanned = member.id === scannedMemberId;
                return (
                  <div key={member.id} className={`flex justify-between items-start gap-4 p-3 border transition-colors ${isScanned ? 'border-primary bg-primary/5' : 'border-transparent'}`}>
                    <div className="flex flex-col">
                      <span className="font-heading text-heading text-primary flex items-center gap-2">
                        {member.name}
                        {isScanned && (
                          <span className="font-micro text-[10px] bg-primary text-bg-base px-2 py-0.5 uppercase font-bold tracking-wider">
                            Scanned
                          </span>
                        )}
                      </span>
                      <span className="font-body text-small text-text-secondary">{member.email}</span>
                      {member.college && <span className="font-body text-small text-text-muted">{member.college}</span>}
                    </div>
                    <span className={`font-micro text-micro px-2 py-0.5 border rounded uppercase ${member.role === 'LEADER' ? 'border-primary text-primary' : 'border-dashed border-border-default text-text-muted'}`}>
                      {member.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Status */}
          <div className={`p-4 border flex items-center gap-3 ${paid ? 'border-primary bg-primary/5 text-primary' : 'border-red-500 bg-red-500/5 text-red-500'}`}>
            {paid ? (
              <>
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="font-heading text-heading uppercase tracking-wider">Pass Validated for Entry</span>
              </>
            ) : (
              <>
                <Lock size={20} className="shrink-0" />
                <span className="font-heading text-heading uppercase tracking-wider">Payment Verification Pending</span>
              </>
            )}
          </div>
        </div>

        {/* Footer containing password-masked Registration ID */}
        <div className="p-6 bg-bg-elevated border-t border-border-default flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Registration ID</span>
            <span className="font-body text-body text-primary font-mono select-all tracking-wider">
              {showId ? registration.id : '•'.repeat(registration.id.length || 20)}
            </span>
          </div>
          <button
            onClick={() => setShowId(!showId)}
            className="flex items-center gap-2 font-button text-button text-primary border border-primary px-4 py-2 hover:bg-primary hover:text-bg-base transition-all uppercase self-start sm:self-auto"
          >
            {showId ? (
              <>
                <EyeOff size={14} /> Hide ID
              </>
            ) : (
              <>
                <Eye size={14} /> View ID
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
