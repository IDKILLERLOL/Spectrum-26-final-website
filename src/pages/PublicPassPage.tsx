import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, Lock, ShieldAlert, Clock } from 'lucide-react';
import { getRegistration, getEvent, getActiveTeamMembers, submitUpiRef } from '../lib/firestore';
import type { Registration, Event, TeamMember } from '../types';
import { categoryLabel } from '../types';

export function PublicPassPage() {
  console.log("[Mount] PublicPassPage component loaded");
  const { id } = useParams<{ id: string }>();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showId, setShowId] = useState(false);

  const [upiRef, setUpiRef] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(window.location.search);
  const scannedMemberId = queryParams.get('memberId');

  const reload = async () => {
    if (!id) return;
    try {
      const reg = await getRegistration(id);
      if (reg) {
        setRegistration(reg);
        const [mems, ev] = await Promise.all([
          getActiveTeamMembers(reg.id),
          getEvent(reg.eventId),
        ]);
        setMembers(mems);
        setEvent(ev);
        if (reg.upiTransactionRef) {
          setUpiRef(reg.upiTransactionRef);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max_width = 800;
        let width = img.width;
        let height = img.height;

        if (width > max_width) {
          height = Math.round((height * max_width) / width);
          width = max_width;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setScreenshotBase64(dataUrl);
        }
        setImageLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitUpiRef = async () => {
    if (!upiRef.trim() || !registration) return;
    setSaving(true);
    setError(null);
    try {
      await submitUpiRef(registration.id, upiRef.trim(), registration.leaderEmail || 'Public Pass User', screenshotBase64);
      await reload();
      setScreenshotBase64(null);
    } catch {
      setError('Failed to submit details. Try again.');
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex flex-col gap-4">
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

            {!paid && (
              <div className="p-5 border border-border-default bg-bg-elevated flex flex-col gap-4 text-left">
                <span className="font-heading text-micro text-primary uppercase border-b border-border-default pb-1.5 block">Submit Payment Details</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-micro text-[10px] text-text-muted uppercase tracking-widest">Transaction / UTR ID</label>
                  <input
                    type="text"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="e.g. 312345678901"
                    className="bg-transparent border-b border-border-strong text-primary font-mono text-small py-1.5 focus:outline-none focus:border-primary transition-all w-full"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-micro text-[10px] text-text-muted uppercase tracking-widest">Payment Proof / Screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-[10px] text-text-secondary cursor-pointer w-full file:bg-primary file:text-bg-base file:border-none file:px-2 file:py-1 file:font-bold file:uppercase file:text-[9px] hover:file:opacity-85 file:cursor-pointer"
                  />
                  {imageLoading && <span className="text-[10px] text-text-muted animate-pulse">Processing...</span>}
                  {screenshotBase64 && (
                    <div className="relative w-20 h-20 border border-border-default mt-1 overflow-hidden bg-black/50">
                      <img src={screenshotBase64} alt="Screenshot preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setScreenshotBase64(null)}
                        className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 text-[8px] font-bold"
                        style={{ width: '12px', height: '12px', display: 'flex', alignItems: 'center', justify: 'center' }}
                      >
                        X
                      </button>
                    </div>
                  )}
                  {registration?.paymentScreenshotUrl && !screenshotBase64 && (
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="font-micro text-[9px] text-text-muted uppercase">Last Submitted Proof</span>
                      <img src={registration.paymentScreenshotUrl} alt="Submitted proof" className="w-20 h-20 object-cover border border-border-default" />
                    </div>
                  )}
                </div>

                {error && <p className="font-body text-small text-text-secondary">{error}</p>}
                <button
                  onClick={handleSubmitUpiRef}
                  disabled={saving || !upiRef.trim() || imageLoading}
                  className="bg-primary text-bg-base font-button text-micro uppercase py-2 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 font-bold w-full"
                >
                  {saving && <Loader2 size={10} className="animate-spin" />}
                  {registration?.upiTransactionRef ? 'Update Details' : 'Submit Details'}
                </button>
              </div>
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
