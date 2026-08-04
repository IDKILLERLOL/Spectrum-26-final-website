import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, Crown, CheckCircle2, Clock, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getRegistration, getEvent, getActiveTeamMembers,
  addTeamMember, updateTeamMember, removeTeamMember, transferLeadership,
  updateFeeStatus, toggleCheckedIn, deleteRegistration, updateTeamName
} from '../lib/firestore';
import {
  notifyTeamEdited, notifyMemberAdded, notifyMemberRemoved,
  notifyLeadershipTransferred, notifyFeeStatusPaid
} from '../lib/email';
import type { Registration, Event, TeamMember } from '../types';
import { categoryLabel } from '../types';

type InlineState =
  | { type: 'none' }
  | { type: 'edit'; memberId: string }
  | { type: 'add' };

export function AdminEditRegistrationPage() {
  console.log("[Mount] AdminEditRegistrationPage component loaded");
  const { id: regId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { adminEmail } = useAuth();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [inlineState, setInlineState] = useState<InlineState>({ type: 'none' });
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);

  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');

  const reload = useCallback(async () => {
    if (!regId) return;
    try {
      const reg = await getRegistration(regId);
      if (reg) {
        setRegistration(reg);
        setEditTeamName(reg.teamName || '');
        const [mems, ev] = await Promise.all([
          getActiveTeamMembers(reg.id),
          getEvent(reg.eventId),
        ]);
        setMembers(mems);
        setEvent(ev);
      }
    } catch (err) {
      console.error('[AdminEditRegistrationPage] Error loading data:', err);
    }
  }, [regId]);

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [reload]);

  const closeState = () => {
    setInlineState({ type: 'none' });
    setError(null);
  };

  const handleToggleFee = async () => {
    if (!registration || !event) return;
    const newStatus = registration.feeStatus === 'PAID' ? 'PENDING' : 'PAID';
    setSaving('fee');
    try {
      await updateFeeStatus(registration.id, newStatus, registration.upiTransactionRef, adminEmail ?? '');
      if (newStatus === 'PAID') {
        try {
          const emails = members.map((m) => m.email);
          await notifyFeeStatusPaid(emails, event.name, registration.id);
        } catch (emailErr) {
          console.warn('[email] Failed to send payment confirmation email:', emailErr);
        }
      }
      await reload();
    } catch {
      setError('Failed to update fee status.');
    } finally {
      setSaving(null);
    }
  };

  const handleToggleCheckin = async () => {
    if (!registration) return;
    setSaving('checkin');
    try {
      await toggleCheckedIn(registration.id, !registration.checkedIn, adminEmail ?? '');
      await reload();
    } catch {
      setError('Failed to update checked in status.');
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteReg = async () => {
    if (!registration || !event) return;
    if (!window.confirm('Are you sure you want to permanently delete this registration?')) return;
    setSaving('delete');
    try {
      await deleteRegistration(registration.id, event.id, adminEmail ?? '');
      navigate('/admin/registrations');
    } catch {
      setError('Failed to delete registration.');
      setSaving(null);
    }
  };

  const startEdit = (m: TeamMember) => {
    setEditName(m.name);
    setEditEmail(m.email);
    setEditPhone(m.phone);
    setEditCollege(m.college ?? '');
    setInlineState({ type: 'edit', memberId: m.id });
  };

  const handleSaveEdit = async () => {
    if (inlineState.type !== 'edit' || !registration || !event) return;
    if (!editName.trim() || !editEmail.trim()) {
      setError('Name and Email are required.');
      return;
    }

    // Duplicate checks within the team (excluding the member being edited)
    const otherMembers = members.filter((m) => m.id !== inlineState.memberId);
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
    setSaving('edit');
    try {
      await updateTeamMember(
        inlineState.memberId, registration.id,
        { name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim(), college: editCollege.trim() },
        adminEmail ?? '', 'ADMIN'
      );
      try {
        const emails = members.map((m) => m.email);
        await notifyTeamEdited(emails, event.name, adminEmail ?? '');
      } catch (emailErr) {
        console.warn('[email] Failed to send team edited email:', emailErr);
      }
      await reload();
      closeState();
    } catch {
      setError('Failed to update member.');
    } finally {
      setSaving(null);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration || !event) return;
    if (!addName.trim() || !addEmail.trim()) {
      setError('Name and Email are required.');
      return;
    }

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
    setSaving('add');
    try {
      await addTeamMember(
        registration.id,
        { name: addName.trim(), email: addEmail.trim(), phone: addPhone.trim() },
        adminEmail ?? '', 'ADMIN'
      );
      try {
        const leaderMember = members.find((m) => m.role === 'LEADER');
        await notifyMemberAdded(addEmail.trim(), event.name, leaderMember?.name ?? 'Admin');
      } catch (emailErr) {
        console.warn('[email] Failed to send member added email:', emailErr);
      }
      setAddName(''); setAddEmail(''); setAddPhone('');
      await reload();
      closeState();
    } catch (err: any) {
      setError(err.message || 'Failed to add member.');
    } finally {
      setSaving(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!registration || !event) return;
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) return;
    if (!window.confirm(`Are you sure you want to remove ${targetMember.name}?`)) return;
    setSaving(`remove_${memberId}`);
    try {
      await removeTeamMember(memberId, registration.id, adminEmail ?? '', 'ADMIN');
      try {
        await notifyMemberRemoved(targetMember.email, event.name);
      } catch (emailErr) {
        console.warn('[email] Failed to send member removed email:', emailErr);
      }
      await reload();
    } catch {
      setError('Failed to remove member.');
    } finally {
      setSaving(null);
    }
  };

  const handleMakeLeader = async (memberId: string) => {
    if (!registration || !event) return;
    const targetMember = members.find((m) => m.id === memberId);
    const leaderMember = members.find((m) => m.role === 'LEADER');
    if (!targetMember || !leaderMember) return;
    if (!window.confirm(`Transfer team leadership to ${targetMember.name}?`)) return;
    setSaving(`leader_${memberId}`);
    try {
      await transferLeadership(
        registration.id, leaderMember.id, targetMember.id,
        targetMember.userId, adminEmail ?? '', 'ADMIN'
      );
      try {
        const emails = members.map((m) => m.email);
        await notifyLeadershipTransferred(emails, event.name, targetMember.name);
      } catch (emailErr) {
        console.warn('[email] Failed to send leadership transferred email:', emailErr);
      }
      await reload();
    } catch {
      setError('Failed to transfer leadership.');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveTeamName = async () => {
    if (!registration || !editTeamName.trim()) return;
    setSaving('teamName');
    setError(null);
    try {
      await updateTeamName(registration.id, editTeamName.trim(), adminEmail ?? '', 'ADMIN');
      await reload();
      setIsEditingTeamName(false);
    } catch {
      setError('Failed to update team name.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
        <div className="skeleton h-12 w-80 rounded" style={{ background: 'var(--color-bg-card)' }} />
        <div className="skeleton h-64 w-full rounded" style={{ background: 'var(--color-bg-card)' }} />
      </main>
    );
  }

  if (!registration || !event) {
    return (
      <main className="flex flex-col gap-6 items-center justify-center py-20 px-6 max-w-md mx-auto">
        <ShieldAlert size={48} className="text-red-500" />
        <h2 className="font-heading text-card-title text-primary uppercase">Pass Not Found</h2>
        <Link to="/admin/registrations" className="font-button text-button text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-bg-base transition-colors uppercase">
          Back to list
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b-2 border-primary pb-6 flex flex-col gap-4">
        <Link to="/admin/registrations" className="inline-flex items-center gap-2 text-primary hover:opacity-75 uppercase font-heading text-small">
          <ArrowLeft size={16} /> Back to Registrations
        </Link>
        <h1 className="font-hero text-[36px] md:text-[44px] leading-none uppercase tracking-widest text-primary mt-2">
          Edit Roster
        </h1>
        <span className="font-micro text-micro text-text-muted uppercase tracking-widest">
          {event.name} • {categoryLabel(event.category)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Roster column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Team Name block (for team events) */}
          {event.isTeamEvent && (
            <div className="border border-border-default bg-bg-card p-6 flex flex-col gap-4 shadow-md">
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Team Name</span>
                  {isEditingTeamName ? (
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        className="bg-transparent border-b border-border-strong text-primary font-heading text-heading focus:outline-none focus:border-primary transition-all py-1 placeholder:text-text-muted/40"
                        placeholder="Enter Team Name"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveTeamName}
                        disabled={saving === 'teamName'}
                        className="px-4 py-1.5 bg-primary text-bg-base font-button text-small uppercase hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                      >
                        {saving === 'teamName' && <Loader2 size={12} className="animate-spin" />} Save
                      </button>
                      <button
                        onClick={() => {
                          setEditTeamName(registration.teamName || '');
                          setIsEditingTeamName(false);
                        }}
                        className="px-3 py-1.5 border border-border-default text-text-secondary font-button text-small uppercase hover:opacity-75"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-heading text-card-title text-primary uppercase mt-1">
                      {registration.teamName || '(No Team Name set)'}
                    </h3>
                  )}
                </div>
                {!isEditingTeamName && (
                  <button
                    onClick={() => setIsEditingTeamName(true)}
                    className="flex items-center gap-1 font-button text-micro text-primary border border-primary px-3 py-1.5 hover:bg-primary hover:text-bg-base transition-colors uppercase tracking-wide"
                  >
                    <Pencil size={12} /> Edit Name
                  </button>
                )}
              </div>
              {error && isEditingTeamName && <p className="font-body text-small text-text-secondary mt-1">{error}</p>}
            </div>
          )}

          <div className="border border-border-default bg-bg-card p-6 flex flex-col gap-6 shadow-md">
            <div className="flex justify-between items-center border-b border-border-subtle pb-4">
              <h2 className="font-heading text-card-title text-primary uppercase"> Roster</h2>
              {inlineState.type !== 'add' && members.length < event.maxMembers && (
                <button
                  onClick={() => setInlineState({ type: 'add' })}
                  className="flex items-center gap-2 font-button text-button text-primary border border-primary px-4 py-2 hover:bg-primary hover:text-bg-base transition-all uppercase"
                >
                  <Plus size={14} /> Add Member
                </button>
              )}
            </div>

            {/* Members List */}
            <div className="flex flex-col divide-y border-b border-border-subtle">
              {members.map((m) => {
                const isEdit = inlineState.type === 'edit' && inlineState.memberId === m.id;
                const isLdr = m.role === 'LEADER';

                return (
                  <div key={m.id} className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <span className="font-heading text-heading text-primary">{m.name}</span>
                          <span className={`font-micro text-micro px-2 py-0.5 border uppercase ${isLdr ? 'border-primary text-primary' : 'border-dashed border-border-default text-text-muted'}`}>
                            {m.role}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 font-body text-small text-text-secondary">
                          <span>{m.email}</span>
                          {m.phone && <span>{m.phone}</span>}
                          {m.college && <span className="text-text-muted">{m.college}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => isEdit ? closeState() : startEdit(m)}
                          className="p-2 border border-border-default hover:border-primary text-text-secondary hover:text-primary transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        {!isLdr && (
                          <>
                            <button
                              onClick={() => handleMakeLeader(m.id)}
                              disabled={saving !== null}
                              className="p-2 border border-border-default hover:border-primary text-text-secondary hover:text-primary transition-colors"
                              title="Make Leader"
                            >
                              <Crown size={14} />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              disabled={saving !== null}
                              className="p-2 border border-border-default hover:border-red-500 text-text-secondary hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline edit member */}
                    {isEdit && (
                      <div className="expand-in mt-4 border-l-2 border-primary pl-4 py-4 flex flex-col gap-4 bg-bg-elevated p-4">
                        <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Edit Member details</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: 'Name', value: editName, setter: setEditName },
                            { label: 'Email', value: editEmail, setter: setEditEmail },
                            { label: 'Phone', value: editPhone, setter: setEditPhone },
                            { label: 'College', value: editCollege, setter: setEditCollege },
                          ].map((field) => (
                            <div key={field.label} className="flex flex-col gap-1">
                              <label className="font-micro text-micro text-text-muted uppercase">{field.label}</label>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => field.setter(e.target.value)}
                                className="bg-transparent border-b border-border-strong text-primary py-1 text-small focus:outline-none focus:border-primary transition-all"
                              />
                            </div>
                          ))}
                        </div>
                        {error && <p className="font-body text-small text-red-500">{error}</p>}
                        <div className="flex gap-2">
                          <button onClick={closeState} className="font-button text-button uppercase border border-border-default px-4 py-2 hover:opacity-70">Cancel</button>
                          <button onClick={handleSaveEdit} disabled={saving !== null} className="font-button text-button uppercase bg-primary text-bg-base px-6 py-2 hover:opacity-90 disabled:opacity-50">
                            {saving === 'edit' && <Loader2 size={12} className="animate-spin inline mr-1" />} Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Inline add member */}
            {inlineState.type === 'add' && (
              <form onSubmit={handleAddMember} className="expand-in border border-primary p-4 flex flex-col gap-4 bg-bg-elevated">
                <span className="font-micro text-micro text-primary uppercase tracking-widest">Add New Team Member</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Name *', value: addName, setter: setAddName, required: true },
                    { label: 'Email *', value: addEmail, setter: setAddEmail, required: true },
                    { label: 'Phone', value: addPhone, setter: setAddPhone, required: false },
                  ].map((field) => (
                    <div key={field.label} className="flex flex-col gap-1">
                      <label className="font-micro text-micro text-text-muted uppercase">{field.label}</label>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        required={field.required}
                        className="bg-transparent border-b border-border-strong text-primary py-1 text-small focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  ))}
                </div>
                {error && <p className="font-body text-small text-red-500">{error}</p>}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={closeState} className="font-button text-button uppercase border border-border-default px-4 py-2 hover:opacity-70">Cancel</button>
                  <button type="submit" disabled={saving !== null} className="font-button text-button uppercase bg-primary text-bg-base px-6 py-2 hover:opacity-90 disabled:opacity-50">
                    {saving === 'add' && <Loader2 size={12} className="animate-spin inline mr-1" />} Add
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Status column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="border border-border-default bg-bg-card p-6 flex flex-col gap-6 shadow-md">
            <h2 className="font-heading text-card-title text-primary uppercase border-b border-border-subtle pb-4">Status & Billing</h2>

            <div className="flex flex-col gap-2">
              <span className="font-micro text-micro text-text-muted uppercase">Registration ID</span>
              <code className="font-mono text-heading text-primary select-all">{registration.id}</code>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-micro text-micro text-text-muted uppercase">UPI Transaction Ref</span>
              <code className="font-mono text-heading text-primary">{registration.upiTransactionRef ?? '(not submitted)'}</code>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border-subtle">
              <button
                onClick={handleToggleFee}
                disabled={saving !== null}
                className="w-full font-button text-button py-3 border border-primary text-primary hover:bg-primary hover:text-bg-base transition-colors uppercase uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving === 'fee' ? <Loader2 size={14} className="animate-spin" /> : registration.feeStatus === 'PAID' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                Mark as {registration.feeStatus === 'PAID' ? 'Pending' : 'Paid'}
              </button>

              <button
                onClick={handleToggleCheckin}
                disabled={saving !== null}
                className="w-full font-button text-button py-3 border border-primary text-primary hover:bg-primary hover:text-bg-base transition-colors uppercase uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving === 'checkin' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {registration.checkedIn ? 'Check Out' : 'Check In'}
              </button>

              <button
                onClick={handleDeleteReg}
                disabled={saving !== null}
                className="w-full font-button text-button py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors uppercase uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving === 'delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete Pass
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
