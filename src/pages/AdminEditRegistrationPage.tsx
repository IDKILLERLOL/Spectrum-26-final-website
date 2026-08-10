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
      navigate('/supercore/registrations');
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
      <main className="">
        <div className="" style={{ background: 'var(--color-bg-card)' }} />
        <div className="" style={{ background: 'var(--color-bg-card)' }} />
      </main>
    );
  }

  if (!registration || !event) {
    return (
      <main className="">
        <ShieldAlert size={48} className="" />
        <h2 className="">Pass Not Found</h2>
        <Link to="/supercore/registrations" className="">
          Back to list
        </Link>
      </main>
    );
  }

  return (
    <main className="">
      {/* Header */}
      <div className="">
        <Link to="/supercore/registrations" className="">
          <ArrowLeft size={16} /> Back to Registrations
        </Link>
        <h1 className="">
          Edit Roster
        </h1>
        <span className="">
          {event.name} • {categoryLabel(event.category)}
        </span>
      </div>

      <div className="">
        {/* Roster column */}
        <div className="">
          {/* Team Name block (for team events) */}
          {event.isTeamEvent && (
            <div className="">
              <div className="">
                <div className="">
                  <span className="">Team Name</span>
                  {isEditingTeamName ? (
                    <div className="">
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        className=""
                        placeholder="Enter Team Name"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveTeamName}
                        disabled={saving === 'teamName'}
                        className=""
                      >
                        {saving === 'teamName' && <Loader2 size={12} className="" />} Save
                      </button>
                      <button
                        onClick={() => {
                          setEditTeamName(registration.teamName || '');
                          setIsEditingTeamName(false);
                        }}
                        className=""
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h3 className="">
                      {registration.teamName || '(No Team Name set)'}
                    </h3>
                  )}
                </div>
                {!isEditingTeamName && (
                  <button
                    onClick={() => setIsEditingTeamName(true)}
                    className=""
                  >
                    <Pencil size={12} /> Edit Name
                  </button>
                )}
              </div>
              {error && isEditingTeamName && <p className="">{error}</p>}
            </div>
          )}

          <div className="">
            <div className="">
              <h2 className=""> Roster</h2>
              {inlineState.type !== 'add' && members.length < event.maxMembers && (
                <button
                  onClick={() => setInlineState({ type: 'add' })}
                  className=""
                >
                  <Plus size={14} /> Add Member
                </button>
              )}
            </div>

            {/* Members List */}
            <div className="">
              {members.map((m) => {
                const isEdit = inlineState.type === 'edit' && inlineState.memberId === m.id;
                const isLdr = m.role === 'LEADER';

                return (
                  <div key={m.id} className="">
                    <div className="">
                      <div className="">
                        <div className="">
                          <span className="">{m.name}</span>
                          <span className={`font-micro text-micro px-2 py-0.5 border uppercase ${isLdr ? 'border-primary text-primary' : 'border-dashed border-border-default text-text-muted'}`}>
                            {m.role}
                          </span>
                        </div>
                        <div className="">
                          <span>{m.email}</span>
                          {m.phone && <span>{m.phone}</span>}
                          {m.college && <span className="">{m.college}</span>}
                        </div>
                      </div>

                      <div className="">
                        <button
                          onClick={() => isEdit ? closeState() : startEdit(m)}
                          className=""
                        >
                          <Pencil size={14} />
                        </button>
                        {!isLdr && (
                          <>
                            <button
                              onClick={() => handleMakeLeader(m.id)}
                              disabled={saving !== null}
                              className=""
                              title="Make Leader"
                            >
                              <Crown size={14} />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              disabled={saving !== null}
                              className=""
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline edit member */}
                    {isEdit && (
                      <div className="">
                        <span className="">Edit Member details</span>
                        <div className="">
                          {[
                            { label: 'Name', value: editName, setter: setEditName },
                            { label: 'Email', value: editEmail, setter: setEditEmail },
                            { label: 'Phone', value: editPhone, setter: setEditPhone },
                            { label: 'College', value: editCollege, setter: setEditCollege },
                          ].map((field) => (
                            <div key={field.label} className="">
                              <label className="">{field.label}</label>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => field.setter(e.target.value)}
                                className=""
                              />
                            </div>
                          ))}
                        </div>
                        {error && <p className="">{error}</p>}
                        <div className="">
                          <button onClick={closeState} className="">Cancel</button>
                          <button onClick={handleSaveEdit} disabled={saving !== null} className="">
                            {saving === 'edit' && <Loader2 size={12} className="" />} Save
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
              <form onSubmit={handleAddMember} className="">
                <span className="">Add New Team Member</span>
                <div className="">
                  {[
                    { label: 'Name *', value: addName, setter: setAddName, required: true },
                    { label: 'Email *', value: addEmail, setter: setAddEmail, required: true },
                    { label: 'Phone', value: addPhone, setter: setAddPhone, required: false },
                  ].map((field) => (
                    <div key={field.label} className="">
                      <label className="">{field.label}</label>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        required={field.required}
                        className=""
                      />
                    </div>
                  ))}
                </div>
                {error && <p className="">{error}</p>}
                <div className="">
                  <button type="button" onClick={closeState} className="">Cancel</button>
                  <button type="submit" disabled={saving !== null} className="">
                    {saving === 'add' && <Loader2 size={12} className="" />} Add
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Status column */}
        <div className="">
          <div className="">
            <h2 className="">Status & Billing</h2>

            <div className="">
              <span className="">Registration ID</span>
              <code className="">{registration.id}</code>
            </div>

            <div className="">
              <span className="">UPI Transaction Ref</span>
              <code className="">{registration.upiTransactionRef ?? '(not submitted)'}</code>
            </div>

            {registration.paymentProofUrl && (
              <div className="">
                <span className="">Payment Screenshot Proof</span>
                <a
                  href={registration.paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=""
                >
                  <img
                    src={registration.paymentProofUrl}
                    alt="Uploaded Payment Proof"
                    className=""
                  />
                </a>
              </div>
            )}

            {/* Action buttons */}
            <div className="">
              <button
                onClick={handleToggleFee}
                disabled={saving !== null}
                className=""
              >
                {saving === 'fee' ? <Loader2 size={14} className="" /> : registration.feeStatus === 'PAID' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                Mark as {registration.feeStatus === 'PAID' ? 'Pending' : 'Paid'}
              </button>

              <button
                onClick={handleToggleCheckin}
                disabled={saving !== null}
                className=""
              >
                {saving === 'checkin' ? <Loader2 size={14} className="" /> : <CheckCircle2 size={14} />}
                {registration.checkedIn ? 'Check Out' : 'Check In'}
              </button>

              <button
                onClick={handleDeleteReg}
                disabled={saving !== null}
                className=""
              >
                {saving === 'delete' ? <Loader2 size={14} className="" /> : <Trash2 size={14} />}
                Delete Pass
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
