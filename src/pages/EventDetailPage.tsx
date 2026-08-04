import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Lock, CheckCircle2, Copy, ArrowRight, Loader2,
  ChevronDown, ChevronUp, Pencil, Trash2, Crown, Plus, Mail, EyeOff, Eye, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getRegistration, getEvent, getActiveTeamMembers,
  addTeamMember, updateTeamMember, removeTeamMember, transferLeadership,
  updateFeeStatus, submitUpiRef, createRegistration, getMyRegistrations, getUser,
  hasExistingRegistration, updateTeamName, getEvents, getPaymentDetails,
} from '../lib/firestore';
import {
  notifyTeamEdited, notifyMemberAdded, notifyMemberRemoved,
  notifyLeadershipTransferred, notifyFeeStatusPaid,
} from '../lib/email';
import type { Registration, Event, TeamMember } from '../types';
import { categoryLabel } from '../types';
import { UPI_ID, HELP_EMAIL } from '../config';

// ─── Inline state machine ─────────────────────────────────────────────────────
// Only one panel open at a time. Opening any panel closes all others.
type InlineState =
  | { type: 'none' }
  | { type: 'edit'; memberId: string }
  | { type: 'confirm-remove'; memberId: string }
  | { type: 'confirm-leader'; memberId: string }
  | { type: 'add-member' }
  | { type: 'submit-upi' }
  | { type: 'edit-team-name' };

export function EventDetailPage() {
  const { eventId: urlId } = useParams<{ eventId: string }>();
  const registrationId = urlId || sessionStorage.getItem('spectrum26_active_registration_id') || '';
  const { user, adminEmail, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("[Mount] EventDetailPage component loaded");
  console.log("[EventDetailPage Debug] Render state:", { loading, urlId, registrationId, hasUser: !!user, hasEvent: !!event, hasReg: !!registration, membersCount: members.length });

  const [inlineState, setInlineState] = useState<InlineState>({ type: 'none' });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payDetails, setPayDetails] = useState({ upiId: UPI_ID, qrCodeUrl: '' });
  const [supportEmail, setSupportEmail] = useState('spectrum.sbmp@gmail.com');

  // Input states declared at top to follow Rules of Hooks
  const [upiRef, setUpiRef] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [hidePassDetails, setHidePassDetails] = useState(true);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [idPopupContent, setIdPopupContent] = useState<string | null>(null);
  const [idPopupTitle, setIdPopupTitle] = useState<string>('');



  // Sync upiRef with registration.upiTransactionRef once loaded
  useEffect(() => {
    if (registration) {
      setUpiRef(registration.upiTransactionRef ?? '');
    }
  }, [registration]);

  const actorEmail = adminEmail ?? user?.email ?? '';
  const actorType: 'PARTICIPANT' | 'ADMIN' = isAdmin ? 'ADMIN' : 'PARTICIPANT';

  // ─── Load data ──────────────────────────────────────────────────────────────
  const reload = async () => {
    if (!registrationId) return;

    try {
      // Check if the URL parameter is a Registration ID
      const reg = await getRegistration(registrationId);
      if (reg) {
        setRegistration(reg);
        const [mems, ev] = await Promise.all([
          getActiveTeamMembers(reg.id),
          getEvent(reg.eventId),
        ]);
        setMembers(mems);
        setEvent(ev);

        // Fetch auxiliary details in the background gracefully
        getPaymentDetails().then(setPayDetails).catch(console.error);
        getEventDetails().then((details) => {
          if (details?.helplineEmail) {
            setSupportEmail(details.helplineEmail);
          }
        }).catch(console.error);
        return;
      }

      // If it's not a Registration ID, check if it's an Event ID
      const ev = await getEvent(registrationId);
      if (ev) {
        setEvent(ev);
        setRegistration(null);
        setMembers([]);

        // Fetch auxiliary details in the background gracefully
        getPaymentDetails().then(setPayDetails).catch(console.error);
        getEventDetails().then((details) => {
          if (details?.helplineEmail) {
            setSupportEmail(details.helplineEmail);
          }
        }).catch(console.error);
        return;
      }

      // Neither Registration nor Event exists
      setRegistration(null);
      setEvent(null);
    } catch (err) {
      console.error("[EventDetailPage] Reload error:", err);
      setError("Failed to load data. Please refresh.");
    }
  };

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    if (!registrationId) {
      setLoading(true);
      getEvents()
        .then((evs) => {
          setAllEvents(evs);
          if (evs.length > 0) {
            setSelectedEventId(evs[0].id);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [registrationId, user]);

  if (loading) return <PageSkeleton />;

  // If the user has no active registration selected, show the selection/redirect flow
  if (!registrationId) {
    return (
      <main className="w-full min-h-screen py-16 px-6 max-w-7xl mx-auto flex flex-col justify-center items-center gap-10 md:gap-14 animate-fade-in">
        <header className="flex flex-col gap-6 text-center border-b-2 border-primary pb-8 w-full max-w-2xl">
          <h1 className="font-hero text-[48px] md:text-[64px] leading-none uppercase tracking-widest text-primary">
            Event Registration
          </h1>
          <p className="font-body text-body text-text-secondary">
            Select one of the available events to begin your registration.
          </p>
        </header>

        <div className="flex flex-col gap-8 w-full max-w-md bg-bg-card border border-border-default p-8 shadow-2xl items-center text-center">
          <div className="flex flex-col gap-2 w-full text-left">
            <label className="font-heading text-micro uppercase tracking-wider text-text-muted">
              Choose Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-[#121212] border border-primary text-white font-heading text-body py-4 px-6 w-full focus:outline-none focus:ring-1 focus:ring-primary uppercase tracking-wide cursor-pointer rounded-none"
            >
              {allEvents.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-bg-card text-white">
                  {ev.name} ({ev.isTeamEvent ? 'Team' : 'Solo'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-4 w-full mt-4">
            <button
              onClick={() => navigate(`/register/${selectedEventId}`)}
              className="w-full py-4 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 active:scale-95 transition-all font-bold tracking-widest rounded-none"
            >
              Register Now
            </button>
            <a
              href="/#tech-events"
              className="w-full py-4 border border-white/20 text-white font-button text-button uppercase hover:bg-white/5 active:scale-95 transition-all tracking-widest rounded-none text-center"
            >
              View Event Details
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center px-6">
        <div className="text-center flex flex-col gap-4">
          <p className="font-heading text-heading text-text-secondary uppercase tracking-widest">Event not found</p>
          <Link to="/" className="font-button text-button text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-bg-base transition-colors uppercase">Back to events</Link>
        </div>
      </main>
    );
  }

  const isTech = event.category === 'TECH';
  const myMemberRow = members.find((m) => m.userId === user?.uid);
  const isLeader = registration ? (isAdmin || registration.leaderId === user?.uid) : true;
  const leaderMember = members.find((m) => m.role === 'LEADER');
  const paid = registration ? (registration.feeStatus === 'PAID') : false;

  // ─── Access control: non-admin participants may only view registrations they belong to ──
  // If a registration exists but the current user is not the leader, a team member, or admin,
  // they should not be able to see this pass. Redirect them to their own dashboard.
  const isMemberOfThisReg = !!(
    !registration ||    // No reg yet (viewing by event ID) — anyone can see
    isAdmin ||
    registration.leaderId === user?.uid ||
    myMemberRow
  );

  if (!loading && registration && !isMemberOfThisReg) {
    navigate('/my-registrations', { replace: true });
    return null;
  }


  const openState = (s: InlineState) => { setInlineState(s); setError(null); };
  const closeState = () => {
    setInlineState({ type: 'none' });
    setScreenshotBase64(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Draw and compress on canvas
        const canvas = document.createElement('canvas');
        const max_width = 800; // Limit image dimensions to maintain reasonable Base64 payload size
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
          // Compress to JPEG with 0.75 quality (keeps file size ~50KB - 150KB)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setScreenshotBase64(dataUrl);
        }
        setImageLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ─── Copy UPI ID ────────────────────────────────────────────────────────────
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(payDetails.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmRegistration = async () => {
    if (!user || !event) return;
    // Guard: redirect to existing registration instead of creating a duplicate
    const existing = await hasExistingRegistration(user.uid, event.id);
    if (existing) {
      navigate(`/events/${existing}`, { replace: true });
      return;
    }
    // No existing registration: go to the dedicated Registration Form
    navigate(`/register/${event.id}`);
  };

  // ─── Submit UPI ref ─────────────────────────────────────────────────────────
  const handleSubmitUpiRef = async () => {
    if (!upiRef.trim() || !registration) return;
    setSaving(true);
    try {
      await submitUpiRef(registration.id, upiRef.trim(), actorEmail, screenshotBase64);
      await reload();
      closeState();
    } catch { setError('Failed to save. Try again.'); }
    finally { setSaving(false); }
  };

  // ─── Edit member ────────────────────────────────────────────────────────────
  const startEdit = (m: TeamMember) => {
    setEditName(m.name); setEditPhone(m.phone); setEditEmail(m.email); setEditCollege(m.college ?? '');
    openState({ type: 'edit', memberId: m.id });
  };

  const handleSaveEdit = async () => {
    if (inlineState.type !== 'edit' || !registration || !event) return;
    const targetMember = members.find((m) => m.id === inlineState.memberId);
    if (!targetMember) return;

    // Duplicate checks within the team (excluding the member being edited)
    const otherMembers = members.filter((m) => m.id !== targetMember.id);
    const newName = editName.trim().toLowerCase();
    const newEmail = editEmail.trim().toLowerCase();
    const newPhone = editPhone.trim().replace(/\s+/g, '');

    for (const m of otherMembers) {
      if (m.name.trim().toLowerCase() === newName) {
        setError(`Another member already has the name "${editName}". Every team member must have a unique name.`);
        return;
      }
      if (m.email.trim().toLowerCase() === newEmail) {
        setError(`Another member already has the email "${editEmail}". Every team member must have a unique email.`);
        return;
      }
      if (newPhone && m.phone.trim().replace(/\s+/g, '') === newPhone) {
        setError(`Another member already has the phone number "${editPhone}". Every team member must have a unique phone number.`);
        return;
      }
    }

    await executeSaveEdit(targetMember.id);
  };

  const executeSaveEdit = async (memberId: string) => {
    if (!registration || !event) return;
    setSaving(true);
    try {
      await updateTeamMember(
        memberId, registration.id,
        { name: editName, phone: editPhone, email: editEmail, college: editCollege },
        actorEmail, actorType
      );
      // Notify active members (except email field — dual notice handled in email module)
      try {
        const emails = members.map((m) => m.email);
        await notifyTeamEdited(emails, event.name, actorEmail);
      } catch (emailErr) {
        console.warn('[email] Failed to send team edited email:', emailErr);
      }
      await reload();
      closeState();
    } catch { setError('Failed to save. Try again.'); }
    finally { setSaving(false); }
  };

  // ─── Edit team name ─────────────────────────────────────────────────────────
  const handleSaveTeamName = async () => {
    if (!registration || !editTeamName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updateTeamName(registration.id, editTeamName.trim(), actorEmail, actorType);
      await reload();
      closeState();
    } catch {
      setError('Failed to update team name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Remove member ──────────────────────────────────────────────────────────
  const handleConfirmRemove = async () => {
    if (inlineState.type !== 'confirm-remove') return;
    const targetMember = members.find((m) => m.id === inlineState.memberId);
    setSaving(true);
    try {
      await removeTeamMember(inlineState.memberId, registration.id, actorEmail, actorType);
      try {
        if (targetMember) await notifyMemberRemoved(targetMember.email, event.name);
      } catch (emailErr) {
        console.warn('[email] Failed to send member removed email:', emailErr);
      }
      await reload();
      closeState();
    } catch { setError('Failed to remove. Try again.'); }
    finally { setSaving(false); }
  };

  // ─── Transfer leadership ────────────────────────────────────────────────────
  const handleConfirmLeader = async () => {
    if (inlineState.type !== 'confirm-leader' || !leaderMember) return;
    const newLeaderMember = members.find((m) => m.id === inlineState.memberId);
    if (!newLeaderMember) return;
    setSaving(true);
    try {
      await transferLeadership(
        registration.id, leaderMember.id, newLeaderMember.id,
        newLeaderMember.userId, actorEmail, actorType
      );
      try {
        const emails = members.map((m) => m.email);
        await notifyLeadershipTransferred(emails, event.name, newLeaderMember.name);
      } catch (emailErr) {
        console.warn('[email] Failed to send leadership transferred email:', emailErr);
      }
      await reload();
      closeState();
    } catch { setError('Failed to transfer leadership. Try again.'); }
    finally { setSaving(false); }
  };

  // ─── Add member ─────────────────────────────────────────────────────────────
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addEmail || !registration || !event) return;

    // Duplicate checks within the team
    const newName = addName.trim().toLowerCase();
    const newEmail = addEmail.trim().toLowerCase();
    const newPhone = addPhone.trim().replace(/\s+/g, '');

    for (const m of members) {
      if (m.name.trim().toLowerCase() === newName) {
        setError(`A member already has the name "${addName}". Every team member must have a unique name.`);
        return;
      }
      if (m.email.trim().toLowerCase() === newEmail) {
        setError(`A member already has the email "${addEmail}". Every team member must have a unique email.`);
        return;
      }
      if (newPhone && m.phone.trim().replace(/\s+/g, '') === newPhone) {
        setError(`A member already has the phone number "${addPhone}". Every team member must have a unique phone number.`);
        return;
      }
    }

    await executeAddMember();
  };

  const executeAddMember = async () => {
    if (!registration || !event) return;
    setSaving(true);
    try {
      await addTeamMember(registration.id, { name: addName, email: addEmail, phone: addPhone }, actorEmail, actorType);
      try {
        await notifyMemberAdded(addEmail, event.name, leaderMember?.name ?? 'Team leader');
      } catch (emailErr) {
        console.warn('[email] Failed to send member added email:', emailErr);
      }
      setAddName(''); setAddEmail(''); setAddPhone('');
      await reload();
      closeState();
    } catch { setError('Failed to add member. Try again.'); }
    finally { setSaving(false); }
  };



  // ─── Admin: toggle fee status ────────────────────────────────────────────────
  const handleToggleFee = async () => {
    if (!isAdmin || !registration) return;
    const newStatus = paid ? 'PENDING' : 'PAID';
    setSaving(true);
    try {
      await updateFeeStatus(registration.id, newStatus, registration.upiTransactionRef, actorEmail);
      if (newStatus === 'PAID') {
        try {
          const emails = members.map((m) => m.email);
          await notifyFeeStatusPaid(emails, event.name, registration.id);
        } catch (emailErr) {
          console.warn('[email] Failed to send payment confirmation email:', emailErr);
        }
      }
      await reload();
    } catch { setError('Failed to update fee status.'); }
    finally { setSaving(false); }
  };



  const perPersonPrice = event?.price || 0;
  const totalPeopleCount = event?.isTeamEvent ? members.length : 1;
  const totalPrice = perPersonPrice * totalPeopleCount;

  const currentMember = members.find((m) => m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase());
  const activeMember = currentMember || leaderMember;

  // ─── QR code URL (on-demand, no storage) ────────────────────────────────────
  const qrData = registration
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `${registration.id}${activeMember ? `::${activeMember.id}` : ''}`
      : `${window.location.origin}/pass/${registration.id}${activeMember ? `?memberId=${activeMember.id}` : ''}`)
    : '';

  const qrUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`
    : '';

  return (
    <main className="w-full min-h-screen flex flex-col py-8 px-6 md:px-6 max-w-7xl mx-auto gap-14 md:gap-24">
      {/* Header */}
      <header className="flex flex-col gap-6 border-b-2 border-primary pb-8">
        <Link
          to="/my-registrations"
          className="inline-flex items-center gap-2 text-primary hover:opacity-70 transition-opacity duration-180 w-max font-heading text-heading group uppercase"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-180" />
          My Passes
        </Link>
        <div className="flex flex-col gap-6 mt-4">
          <h1 className="font-hero text-[48px] md:text-[44px] leading-none uppercase tracking-widest text-primary">
            {event.name}
          </h1>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {!registration ? (
          /* Unregistered view: Confirm Registration Form */
          <div className="md:col-span-8 flex flex-col gap-8">
            <div className="flex flex-col">
              <div className="flex justify-between items-end pb-4 border-b-4 border-primary mb-6">
                <h2 className="font-heading text-card-title text-primary uppercase tracking-wide">
                  Event Registration
                </h2>
              </div>
              <div className="flex flex-col gap-6 font-body text-body text-text-secondary leading-relaxed max-w-2xl">
                <p>
                  You are about to register for <strong className="text-primary uppercase">{event.name}</strong> as the team leader.
                </p>
                {event.isTeamEvent ? (
                  <p>
                    Once registered, your entry pass will be created. You will then be able to add/manage team members, submit your UPI fee payment, and unlock your entry QR pass.
                  </p>
                ) : (
                  <p>
                    Once registered, your entry pass will be created. You will then be able to submit your UPI fee payment and unlock your entry QR pass.
                  </p>
                )}

                {error && (
                  <div className="p-4 border border-dashed border-primary text-small text-primary bg-bg-elevated">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleConfirmRegistration}
                  disabled={saving}
                  className="w-full md:w-max bg-primary text-bg-base font-button text-button uppercase py-4 px-8 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 border-2 border-primary mt-4"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>Confirm & Register <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Left Column Roster block is rendered only when registration exists */}
        {registration && (
          <div className="md:col-span-8 flex flex-col gap-8">
            <div className="flex flex-col">
              {/* Team Name Section */}
              {event.isTeamEvent && (
                <div className="flex flex-col gap-2 p-6 border border-border-default bg-bg-card mb-6 shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Team Name</span>
                      <h3 className="font-heading text-card-title text-primary uppercase mt-1">
                        {registration.teamName || '(No Team Name set)'}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pb-4 border-b-4 border-primary mb-4">
                <h2 className="font-heading text-card-title text-primary uppercase tracking-wide">
                  {event.isTeamEvent ? 'Team Roster' : 'Registration Details'}
                </h2>
                {event.isTeamEvent && isLeader && members.length < event.maxMembers && (
                  <button
                    onClick={() => openState({ type: 'add-member' })}
                    className="flex items-center gap-2 font-button text-micro text-primary border border-primary px-3 py-1.5 hover:bg-primary hover:text-bg-base transition-all uppercase tracking-wide font-bold"
                  >
                    <Plus size={12} /> Add Member
                  </button>
                )}
              </div>

              {/* Member table */}
              <div className="flex flex-col divide-y border-b-2 border-primary"
                   style={{ borderColor: 'var(--color-border-default)' }}>
                {members.map((member) => {
                  const isMe = member.userId === user?.uid;
                  const canEdit = isAdmin || isLeader || isMe;
                  const canRemove = (isAdmin || isLeader) && member.role !== 'LEADER';
                  const canMakeLeader = (isAdmin || isLeader) && member.role === 'MEMBER';
                  const isEditOpen = inlineState.type === 'edit' && inlineState.memberId === member.id;
                  const isRemoveOpen = inlineState.type === 'confirm-remove' && inlineState.memberId === member.id;
                  const isLeaderOpen = inlineState.type === 'confirm-leader' && inlineState.memberId === member.id;
                  return (
                    <div key={member.id}>
                      {/* Member row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-heading text-heading text-primary">{member.name || '(unnamed)'}</span>
                            <span className={`font-micro text-micro px-2 py-0.5 border uppercase tracking-widest ${
                              member.role === 'LEADER'
                                ? 'border-primary text-primary'
                                : 'border-border-default text-text-muted border-dashed'
                            }`}>
                              {member.role}
                            </span>
                            {isMe && <span className="font-micro text-micro text-text-muted uppercase tracking-widest">(you)</span>}
                          </div>
                          <div className="flex flex-wrap gap-4 font-body text-small text-text-secondary">
                            <span>{member.email}</span>
                            {member.phone && <span>{member.phone}</span>}
                            {member.college && <span className="text-text-muted">{member.college}</span>}
                          </div>
                        </div>
                      </div>

                      {/* ── Inline: Edit form ── */}
                      {isEditOpen && (
                        <div className="expand-in border-l-2 border-primary pl-4 pb-6 flex flex-col gap-4">
                          <p className="font-micro text-micro text-text-muted uppercase tracking-widest">Edit team member</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { label: 'Name *', value: editName, setter: setEditName },
                              { label: 'Email *', value: editEmail, setter: setEditEmail },
                              { label: 'Phone', value: editPhone, setter: setEditPhone },
                              { label: 'College', value: editCollege, setter: setEditCollege },
                            ].map(({ label, value, setter }) => (
                              <div key={label} className="flex flex-col gap-1">
                                <label className="font-micro text-micro text-text-muted uppercase tracking-widest">{label}</label>
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => setter(e.target.value)}
                                  className="bg-transparent border-b border-border-strong text-primary font-body text-small py-2 focus:outline-none focus:border-primary transition-all"
                                />
                              </div>
                            ))}
                          </div>
                          {error && <p className="font-body text-small text-text-secondary">{error}</p>}
                          <div className="flex gap-3">
                            <button onClick={closeState} className="px-4 py-2 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70 transition-opacity">Cancel</button>
                            <button onClick={handleSaveEdit} disabled={saving} className="px-6 py-2 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                              {saving && <Loader2 size={14} className="animate-spin" />} Save
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Inline: Remove confirm ── */}
                      {isRemoveOpen && (
                        <div className="expand-in border-l-2 border-primary pl-4 pb-6 flex flex-col gap-4">
                          <p className="font-body text-body text-text-secondary">
                            Remove <strong>{member.name}</strong> from the team?
                          </p>
                          {error && <p className="font-body text-small text-text-secondary">{error}</p>}
                          <div className="flex gap-3">
                            <button onClick={closeState} className="px-4 py-2 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70 transition-opacity">Cancel</button>
                            <button onClick={handleConfirmRemove} disabled={saving} className="px-6 py-2 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                              {saving && <Loader2 size={14} className="animate-spin" />} Remove
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Inline: Make leader confirm ── */}
                      {isLeaderOpen && (
                        <div className="expand-in border-l-2 border-primary pl-4 pb-6 flex flex-col gap-4">
                          <p className="font-body text-body text-text-secondary">
                            Transfer leadership to <strong>{member.name}</strong>? You will become a regular member.
                          </p>
                          {error && <p className="font-body text-small text-text-secondary">{error}</p>}
                          <div className="flex gap-3">
                            <button onClick={closeState} className="px-4 py-2 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70 transition-opacity">Cancel</button>
                            <button onClick={handleConfirmLeader} disabled={saving} className="px-6 py-2 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                              {saving && <Loader2 size={14} className="animate-spin" />} Transfer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ── Inline: Add member form ── */}
                {inlineState.type === 'add-member' && (
                  <div className="expand-in py-4 border-l-2 border-primary pl-4 flex flex-col gap-4">
                    <p className="font-micro text-micro text-text-muted uppercase tracking-widest">Add a new member</p>
                    <form onSubmit={handleAddMember} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label: 'Name *', value: addName, setter: setAddName, required: true },
                          { label: 'Email *', value: addEmail, setter: setAddEmail, required: true },
                          { label: 'Phone', value: addPhone, setter: setAddPhone, required: false },
                        ].map(({ label, value, setter, required }) => (
                          <div key={label} className="flex flex-col gap-1">
                            <label className="font-micro text-micro text-text-muted uppercase tracking-widest">{label}</label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setter(e.target.value)}
                              required={required}
                              className="bg-transparent border-b border-border-strong text-primary font-body text-small py-2 focus:outline-none focus:border-primary transition-all"
                            />
                          </div>
                        ))}
                      </div>
                      {error && <p className="font-body text-small text-text-secondary">{error}</p>}
                      <div className="flex gap-3">
                        <button type="button" onClick={closeState} className="px-4 py-2 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70 transition-opacity">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                          {saving && <Loader2 size={14} className="animate-spin" />} Add Member
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Help mailto button */}
            <a
              href={`mailto:${supportEmail}?subject=Help with registration ${registration.id}&body=Hi, I need help with my registration for ${event.name}.`}
              className="inline-flex items-center gap-2 font-button text-button text-text-secondary border border-dashed border-border-default px-6 py-3 hover:border-primary hover:text-primary transition-colors uppercase tracking-wide w-max"
            >
              <Mail size={14} /> Need help with this team?
            </a>
          </div>
        )}

        {/* Right: Fee & QR */}
        <div className="md:col-span-4 flex flex-col gap-12">

          {/* Payment section */}
          {!paid && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-end border-b-4 border-primary pb-4">
                <h3 className="font-heading text-card-title text-primary uppercase">Registration Fee</h3>
              </div>

              <div className="font-countdown text-[48px] leading-none font-bold text-primary tracking-tight">
                {event.price != null ? `₹${totalPrice}` : 'TBA'}
                {event.isTeamEvent && (
                  <span className="font-body text-text-muted text-[14px] font-medium block mt-2 animate-fade-in" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    (₹{event.price} per person × {totalPeopleCount} members)
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Pay via UPI</label>
                <div className="border-2 border-primary p-4 flex justify-between items-center font-heading text-heading text-primary">
                  <span className="tracking-wide">{payDetails.upiId}</span>
                  <button onClick={handleCopyUpi} className="text-primary hover:opacity-70 transition-opacity" title="Copy UPI ID">
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              {/* QR Code Embed */}
              <div className="flex flex-col items-center gap-2 mt-4 p-4 border border-dashed border-primary bg-[#121212]">
                <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Scan QR to Pay</span>
                <img
                  src={payDetails.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${payDetails.upiId}&pn=SPECTRUM26&am=${totalPrice}&cu=INR`)}`}
                  alt="Payment QR Code"
                  className="w-48 h-48 border-2 border-primary object-contain"
                />
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  Double check the UPI ID before transferring.
                </span>
              </div>

            </div>
          )}

            {/* QR Entry Pass */}
            <div className={`border-2 ${paid ? 'border-primary' : 'border-dashed border-primary'} p-8 flex flex-col items-center justify-center gap-6 text-center min-h-[280px] relative overflow-hidden`}>
              {!paid && (
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #ffffff 25%, #ffffff 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />
              )}

              {paid ? (
                hidePassDetails ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <EyeOff size={48} className="text-text-muted animate-pulse" />
                    <span className="font-heading text-small text-text-secondary uppercase">Pass Hidden</span>
                    <button
                      onClick={() => setShowSecurityModal(true)}
                      className="font-button text-micro text-primary border border-primary px-3 py-1.5 hover:bg-primary hover:text-bg-base transition-colors uppercase tracking-wide"
                    >
                      Show Pass
                    </button>
                  </div>
                ) : (
                  <>
                    <img src={qrUrl} alt="Entry QR Code" className="w-48 h-48 border border-border-default animate-fade-in" />
                    <div className="flex flex-col gap-3 px-6 bg-bg-base py-4 border border-primary text-left w-full max-w-[240px]">
                      <span className="font-heading text-micro text-primary uppercase border-b border-border-default pb-1 mb-1 block">Pass Credentials</span>
                      {activeMember && (
                        <div className="flex flex-col gap-0.5 mb-2.5">
                          <span className="font-micro text-[10px] text-text-muted uppercase tracking-widest">Member ID</span>
                          <span className="font-body text-small text-primary font-mono select-all break-all">{activeMember.id}</span>
                          <button
                            onClick={() => {
                              setIdPopupTitle('Member ID');
                              setIdPopupContent(activeMember.id);
                            }}
                            className="font-micro text-[10px] text-primary border border-primary/30 px-1 py-0.5 mt-1 hover:border-primary uppercase tracking-wide self-start"
                          >
                            Expand View
                          </button>
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5">
                        <span className="font-micro text-[10px] text-text-muted uppercase tracking-widest">Team ID</span>
                        <span className="font-body text-small text-primary font-mono select-all break-all">{registration.id}</span>
                        <button
                          onClick={() => {
                            setIdPopupTitle('Team ID');
                            setIdPopupContent(registration.id);
                          }}
                          className="font-micro text-[10px] text-primary border border-primary/30 px-1 py-0.5 mt-1 hover:border-primary uppercase tracking-wide self-start"
                        >
                          Expand View
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setHidePassDetails(true)}
                      className="font-button text-micro text-text-secondary border border-border-default px-3 py-1.5 hover:border-primary hover:text-primary transition-colors uppercase tracking-wide"
                    >
                      Hide Pass
                    </button>
                  </>
                )
              ) : (
                <>
                  <div className="w-16 h-16 border-2 border-primary bg-bg-base flex items-center justify-center relative z-10">
                    {registration?.upiTransactionRef ? (
                      <Clock size={32} className="text-primary animate-pulse" />
                    ) : (
                      <Lock size={32} className="text-primary" />
                    )}
                  </div>
                  <div className="relative z-10 flex flex-col gap-3 px-4 bg-bg-base p-4 border border-primary w-full max-w-[280px]">
                    <span className="font-heading text-card-title text-primary uppercase">
                      {registration?.upiTransactionRef ? 'Payment Pending' : 'Entry Pass Locked'}
                    </span>
                    <span className="font-body text-small text-text-muted">
                      {registration?.upiTransactionRef 
                        ? 'Admin is verifying your transaction. You can update details below.'
                        : 'Generated upon payment verification.'}
                    </span>

                    {/* Submit form directly inside */}
                    <div className="flex flex-col gap-4 border-t border-border-default pt-4 text-left w-full mt-2">
                      <div className="flex flex-col gap-1">
                        <label className="font-micro text-[10px] text-text-muted uppercase tracking-widest">Transaction / UTR ID</label>
                        <input
                          type="text"
                          value={upiRef}
                          onChange={(e) => setUpiRef(e.target.value)}
                          placeholder="e.g. 312345678901"
                          className="bg-transparent border-b border-border-strong text-primary font-mono text-small py-1.5 focus:outline-none focus:border-primary transition-all w-full"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
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
                            <img src={registration.paymentScreenshotUrl} alt="Submitted proof" className="w-16 h-16 object-cover border border-border-default" />
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
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

      {/* Security Alert Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-[#121212] border border-white/10 max-w-md w-full p-8 flex flex-col gap-6 shadow-2xl text-left rounded-none">
            <div className="flex items-center gap-3 text-white">
              <ShieldAlert size={28} className="text-white shrink-0" />
              <h3 className="font-heading text-card-title uppercase tracking-wide font-bold">SECURITY ALERT</h3>
            </div>
            
            <div className="h-px bg-white/10 w-full" />
            
            <p className="font-body text-body leading-relaxed text-white/60">
              Do not share this QR code or ID with anyone. Keep it hidden. 
              If another person obtains your credentials, they can scan it to enter the venue, and <strong>you will be barred from entry</strong>.
            </p>

            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="flex-1 py-3 border border-white/20 bg-transparent text-white font-button uppercase hover:bg-white/5 active:scale-95 transition-all text-center tracking-wider text-sm font-semibold rounded-none"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSecurityModal(false);
                  setHidePassDetails(false);
                }}
                className="flex-1 py-3 bg-white text-black font-button uppercase hover:bg-white/90 active:scale-95 transition-all text-center font-bold tracking-wider text-sm rounded-none"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Popup Modal */}
      {idPopupContent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-bg-card border-2 border-primary max-w-sm w-full p-8 flex flex-col gap-6 shadow-2xl text-left border-solid">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h3 className="font-heading text-card-title uppercase tracking-wide text-primary">{idPopupTitle}</h3>
            </div>
            
            <div className="bg-bg-base p-4 border border-border-default select-all font-mono text-body text-primary break-all text-center">
              {idPopupContent}
            </div>

            <button
              type="button"
              onClick={() => setIdPopupContent(null)}
              className="py-3 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 transition-opacity w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function PageSkeleton() {
  return (
    <main className="w-full min-h-screen flex flex-col py-8 px-6 max-w-7xl mx-auto gap-14">
      <div className="skeleton h-8 w-24 rounded" />
      <div className="flex flex-col gap-4 border-b-2 border-primary pb-8">
        <div className="skeleton h-14 w-80 rounded" />
        <div className="flex gap-4">
          <div className="skeleton h-7 w-20 rounded" />
          <div className="skeleton h-7 w-32 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 flex flex-col gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full rounded" />)}
        </div>
        <div className="md:col-span-4">
          <div className="skeleton h-64 w-full rounded" />
        </div>
      </div>
    </main>
  );
}
