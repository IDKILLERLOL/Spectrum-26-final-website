import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, Lock, ShieldAlert, Upload, Image as ImageIcon, X, Send, ArrowLeft } from 'lucide-react';
import { playSynthSound } from '../lib/audio';
import { getRegistration, getEvent, getActiveTeamMembers, submitUpiRef } from '../lib/firestore';
import type { Registration, Event, TeamMember } from '../types';
import { categoryLabel } from '../types';

export function PublicPassPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showId, setShowId] = useState(false);

  // Payment proof form state
  const [txId, setTxId] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const queryParams = new URLSearchParams(window.location.search);
  const scannedMemberId = queryParams.get('memberId');

  const reload = async () => {
    if (!id) return;
    try {
      const reg = await getRegistration(id);
      if (reg) {
        setRegistration(reg);
        setTxId(reg.upiTransactionRef || '');
        setProofImage(reg.paymentProofUrl || reg.paymentScreenshotUrl || null);
        const [mems, ev] = await Promise.all([
          getActiveTeamMembers(reg.id),
          getEvent(reg.eventId),
        ]);
        setMembers(mems);
        setEvent(ev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;
    if (!txId.trim()) {
      alert('Both fields are mandatory. Please enter your Transaction ID / UTR.');
      return;
    }
    if (!proofImage) {
      alert('Both fields are mandatory. Please upload your payment screenshot.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await submitUpiRef(registration.id, txId.trim(), 'participant', proofImage);
      setRegistration((prev) => prev ? { ...prev, upiTransactionRef: txId.trim(), paymentProofUrl: proofImage, paymentScreenshotUrl: proofImage } : null);
      setSuccessMsg('Payment proof submitted successfully! Verification pending admin review.');
    } catch (err) {
      console.error('[PublicPassPage] Failed to submit payment proof:', err);
      alert('Failed to submit payment proof. Please try again.');
    } finally {
      setSubmitting(false);
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
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-bg-base px-6 py-12 gap-6">
      <div className="w-full max-w-lg">
        <button
          onClick={() => {
            playSynthSound('click');
            navigate(-1);
          }}
          className="inline-flex items-center gap-2 text-primary hover:opacity-75 transition-opacity font-heading text-heading uppercase w-fit bg-transparent border-none cursor-pointer p-0"
          style={{ textDecoration: 'none' }}
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>

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

          {/* Verification Status Container */}
          <div className="flex flex-col gap-4">
            <div className={`p-4 border flex items-center gap-3 ${paid ? 'border-primary bg-primary/5 text-primary' : 'border-red-500 bg-red-500/5 text-red-500'}`}>
              {paid ? (
                <>
                  <CheckCircle2 size={20} className="shrink-0" />
                  <span className="font-heading text-heading uppercase tracking-wider">Pass Validated for Entry</span>
                </>
              ) : (
                <>
                  <Lock size={20} className="shrink-0 text-red-500" />
                  <span className="font-heading text-heading uppercase tracking-wider text-red-500">PAYMENT VERIFICATION PENDING</span>
                </>
              )}
            </div>

            {/* Submission Form for Unpaid / Pending Verification Pass */}
            {!paid && (
              <form onSubmit={handleSubmitProof} className="flex flex-col gap-4 p-5 border border-dashed border-border-strong bg-bg-elevated/40 rounded-sm">
                <div className="flex flex-col gap-1">
                  <span className="font-heading text-card-title text-primary uppercase tracking-wide flex items-center gap-2">
                    <Upload size={16} /> Submit Payment Details
                  </span>
                  <p className="font-body text-small text-text-secondary">
                    Provide your UPI Transaction Ref / UTR and upload payment screenshot for admin verification.
                  </p>
                </div>

                {/* Transaction ID Input */}
                <div className="flex flex-col gap-1">
                  <label className="font-micro text-micro uppercase tracking-wider text-text-muted">
                    Transaction ID / Ref (UTR) *
                  </label>
                  <input
                    type="text"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="e.g. 329182391024 or UPI/123456"
                    required
                    className="w-full bg-bg-base border border-border-default px-3 py-2 text-body font-mono text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Screenshot Uploader */}
                <div className="flex flex-col gap-2">
                  <label className="font-micro text-micro uppercase tracking-wider text-text-muted">
                    Payment Screenshot *
                  </label>
                  {proofImage ? (
                    <div className="relative border border-primary p-2 bg-bg-base flex flex-col items-center gap-2">
                      <img
                        src={proofImage}
                        alt="Payment Screenshot Preview"
                        className="max-h-48 w-auto object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setProofImage(null)}
                        className="flex items-center gap-1 font-micro text-micro text-red-400 hover:text-red-300 uppercase py-1"
                      >
                        <X size={14} /> Remove Screenshot
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-border-default hover:border-primary transition-colors p-4 flex flex-col items-center gap-2 cursor-pointer bg-bg-base">
                      <ImageIcon size={24} className="text-text-muted" />
                      <span className="font-button text-small text-primary uppercase">Click to upload screenshot</span>
                      <span className="font-micro text-micro text-text-muted">PNG, JPG, JPEG, WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Success Feedback */}
                {successMsg && (
                  <div className="p-3 border border-primary bg-primary/10 text-primary font-body text-small flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-bg-base font-button text-button uppercase py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 font-bold"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Submit Payment Proof
                    </>
                  )}
                </button>
              </form>
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
