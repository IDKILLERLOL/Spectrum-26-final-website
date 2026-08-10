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
      <main className="">
        <div className="">
          <Loader2 size={36} className="" />
          <span className="">Loading Pass details...</span>
        </div>
      </main>
    );
  }

  if (!registration || !event) {
    return (
      <main className="">
        <div className="">
          <ShieldAlert size={48} className="" />
          <h2 className="">Invalid Pass</h2>
          <p className="">
            This entry pass could not be verified or does not exist in the database.
          </p>
          <Link to="/" className="">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const paid = registration.feeStatus === 'PAID';
  const hasSubmittedProof = !!(registration.upiTransactionRef || registration.paymentProofUrl || registration.paymentScreenshot || registration.paymentScreenshotUrl);

  return (
    <main className="">
      <div className="">
        <button
          onClick={() => {
            playSynthSound('click');
            navigate(-1);
          }}
          className=""
          style={{ textDecoration: 'none' }}
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      <div className="">
        {/* Decorative corner tag */}
        <div className={`absolute top-0 right-0 px-6 py-2 font-micro text-micro uppercase tracking-widest text-bg-base font-bold ${paid ? 'bg-primary' : 'bg-red-500'}`}>
          {paid ? 'Verified' : 'Unpaid'}
        </div>

        {/* Content */}
        <div className="">
          {/* Header */}
          <div className="">
            <span className="">
              {categoryLabel(event.category)} • {event.isTeamEvent ? 'Team' : 'Solo'}
            </span>
            <h1 className="">
              {event.name}
            </h1>
          </div>

          {/* Members list */}
          <div className="">
            <h3 className="">
              Registered Roster
            </h3>
            <div className="">
              {members.map((member) => {
                const isScanned = member.id === scannedMemberId;
                return (
                  <div key={member.id} className={`flex justify-between items-start gap-4 p-3 border transition-colors ${isScanned ? 'border-primary bg-primary/5' : 'border-transparent'}`}>
                    <div className="">
                      <span className="">
                        {member.name}
                        {isScanned && (
                          <span className="">
                            Scanned
                          </span>
                        )}
                      </span>
                      <span className="">{member.email}</span>
                      {member.college && <span className="">{member.college}</span>}
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
          <div className="">
            <div className={`p-4 border flex items-center gap-3 ${paid ? 'border-primary bg-primary/5 text-primary' : 'border-red-500 bg-red-500/5 text-red-500'}`}>
              {paid ? (
                <>
                  <CheckCircle2 size={20} className="" />
                  <span className="">Pass Validated for Entry</span>
                </>
              ) : (
                <>
                  <Lock size={20} className="" />
                  <span className="">PAYMENT VERIFICATION PENDING</span>
                </>
              )}
            </div>

            {/* Submission Form for Unpaid / Pending Verification Pass */}
            {!paid && !hasSubmittedProof && (
              <form onSubmit={handleSubmitProof} className="">
                <div className="">
                  <span className="">
                    <Upload size={16} /> Submit Payment Details
                  </span>
                  <p className="">
                    Provide your UPI Transaction Ref / UTR and upload payment screenshot for admin verification.
                  </p>
                </div>

                {/* Transaction ID Input */}
                <div className="">
                  <label className="">
                    Transaction ID / Ref (UTR) *
                  </label>
                  <input
                    type="text"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="e.g. 329182391024 or UPI/123456"
                    required
                    className=""
                  />
                </div>

                {/* Screenshot Uploader */}
                <div className="">
                  <label className="">
                    Payment Screenshot *
                  </label>
                  {proofImage ? (
                    <div className="">
                      <img
                        src={proofImage}
                        alt="Payment Screenshot Preview"
                        className=""
                      />
                      <button
                        type="button"
                        onClick={() => setProofImage(null)}
                        className=""
                      >
                        <X size={14} /> Remove Screenshot
                      </button>
                    </div>
                  ) : (
                    <label className="">
                      <ImageIcon size={24} className="" />
                      <span className="">Click to upload screenshot</span>
                      <span className="">PNG, JPG, JPEG, WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className=""
                      />
                    </label>
                  )}
                </div>

                {/* Success Feedback */}
                {successMsg && (
                  <div className="">
                    <CheckCircle2 size={16} className="" />
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className=""
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Submit Payment Proof
                    </>
                  )}
                </button>
              </form>
            )}

            {!paid && hasSubmittedProof && (
              <div className="">
                <p className="" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  ✓ Payment details submitted successfully. Our crew is verifying your payment (Ref: <span className="">{registration.upiTransactionRef}</span>). An email notification will be sent to <span className="">{registration.leader?.email || 'your email'}</span> as soon as verification is complete!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer containing password-masked Registration ID */}
        <div className="">
          <div className="">
            <span className="">Registration ID</span>
            <span className="">
              {showId ? registration.id : '•'.repeat(registration.id.length || 20)}
            </span>
          </div>
          <button
            onClick={() => setShowId(!showId)}
            className=""
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
