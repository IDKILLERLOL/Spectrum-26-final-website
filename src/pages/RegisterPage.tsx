import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getEvent, createRegistration, getUser, updateUser, hasExistingRegistration, db } from '../lib/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Event } from '../types';

export function RegisterPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Leader / registrant state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [teamName, setTeamName] = useState('');
  
  // Team members state (for team events)
  const [members, setMembers] = useState<{ name: string; email: string; phone: string; college: string }[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [regCount, setRegCount] = useState<number | null>(null);

  // Load event details & pre-fill user profile if available
  useEffect(() => {
    if (!eventId || authLoading) return;

    const loadData = async () => {
      try {
        const ev = await getEvent(eventId);
        setEvent(ev);

        // Fetch registered persons count
        const memSnap = await getDocs(query(collection(db, 'teamMembers'), where('status', '==', 'ACTIVE')));
        setRegCount(memSnap.size);

        if (!user) {
          navigate(`/login?redirect=register&eventId=${eventId}`, { replace: true });
          return;
        }

        if (user) {
          const profile = await getUser(user.uid);
          if (profile) {
            setName(profile.name || '');
            setEmail(profile.email || user.email || '');
            setPhone(profile.phone || '');
            setCollege(profile.college || '');
          }

          // Check if user is already registered for this event
          if (ev && user) {
            const existing = await hasExistingRegistration(user.uid, ev.id);
            if (existing) {
              // Already registered — go straight to their pass
              sessionStorage.setItem('spectrum26_active_registration_id', existing);
              navigate('/event-dashboard', { replace: true });
              return;
            }
          }
        }
      } catch (err) {
        console.error('[RegisterPage] Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId, user, navigate]);

  const handleAddMember = () => {
    if (event && members.length + 1 >= event.maxMembers) {
      setError(`Cannot add more than ${event.maxMembers} members (including the leader).`);
      return;
    }
    setMembers((m) => [...m, { name: '', email: '', phone: '', college: college }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers((m) => m.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: 'name' | 'email' | 'phone' | 'college', value: string) => {
    setMembers((m) =>
      m.map((member, i) => (i === index ? { ...member, [field]: value } : member))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !event) return;
    
    // Validate leader fields
    if (!name.trim() || !email.trim() || !phone.trim() || !college.trim()) {
      setError('All leader fields (including College Name) are required.');
      return;
    }

    // Validate team members if team event
    if (event.isTeamEvent) {
      if (!teamName.trim()) {
        setError('Team Name is required for team events.');
        return;
      }
      const totalSize = members.length + 1;
      if (totalSize < event.minMembers) {
        setError(`This event requires a minimum of ${event.minMembers} team members (including the leader). Please add more teammates.`);
        return;
      }
      if (totalSize > event.maxMembers) {
        setError(`This event allows a maximum of ${event.maxMembers} team members (including the leader). Please remove some teammates.`);
        return;
      }
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.name.trim() || !m.email.trim()) {
          setError(`Please fill in Name and Email for Member #${i + 1}.`);
          return;
        }
      }

      // Duplicate checks within the team
      const allNames = [name.trim().toLowerCase()];
      const allEmails = [email.trim().toLowerCase()];
      const allPhones = [phone.trim().replace(/\s+/g, '')];

      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const mName = m.name.trim().toLowerCase();
        const mEmail = m.email.trim().toLowerCase();
        const mPhone = m.phone.trim().replace(/\s+/g, '');

        if (allNames.includes(mName)) {
          setError(`Duplicate member name: "${m.name}". Every team member must have a unique name.`);
          return;
        }
        if (allEmails.includes(mEmail)) {
          setError(`Duplicate email address: "${m.email}". Every team member must have a unique email.`);
          return;
        }
        if (mPhone && allPhones.includes(mPhone)) {
          setError(`Duplicate phone number: "${m.phone}". Every team member must have a unique phone number.`);
          return;
        }

        allNames.push(mName);
        allEmails.push(mEmail);
        if (mPhone) allPhones.push(mPhone);
      }
    }

    setError(null);
    await completeRegistration();
  };

  const completeRegistration = async () => {
    if (!eventId || !event || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      // Save leader details to their global user profile
      await updateUser(user.uid, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        college: college.trim(),
      });

      // Create the event registration with members list
      const newReg = await createRegistration(
        event.id,
        {
          uid: user.uid,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: college.trim(),
        },
        user.email || email.trim(),
        event.isTeamEvent ? members : [],
        event.isTeamEvent ? teamName.trim() : undefined
      );

      // Redirect directly to the Event Detail/Pass page
      sessionStorage.setItem('spectrum26_active_registration_id', newReg.id);
      navigate('/event-dashboard', { replace: true });
    } catch (err: unknown) {
      console.error('[RegisterPage] Submit registration error:', err);
      const msg = (err as Error).message || '';
      if (msg.startsWith('ALREADY_REGISTERED:')) {
        const existingId = msg.replace('ALREADY_REGISTERED:', '');
        sessionStorage.setItem('spectrum26_active_registration_id', existingId);
        navigate('/event-dashboard', { replace: true });
        return;
      }
      setError(msg || 'Failed to complete registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg-base)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg-base)' }}>
        <div className="text-center flex flex-col gap-4">
          <p className="font-heading text-heading text-text-secondary uppercase tracking-widest">Event not found</p>
          <Link to="/" className="font-button text-button text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-bg-base transition-colors uppercase">View Events</Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'var(--color-bg-base)' }}
    >
      <div className="w-full max-w-2xl flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="font-hero tracking-widest uppercase text-xl md:text-2xl hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-primary)' }}
          >
            SPECTRUM 26
          </Link>
          <p className="text-body font-body" style={{ color: 'var(--color-text-secondary)' }}>
            Registering for <strong className="text-primary uppercase">{event.name}</strong> ({event.isTeamEvent ? 'Team Event' : 'Solo Event'})
          </p>
        </div>

        <div
          className="p-8 border flex flex-col gap-8"
          style={{
            background: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-default)',
            borderRadius: '8px',
          }}
        >
          <div className="flex justify-between items-center border-b border-border-default pb-3 flex-wrap gap-2">
            <h2 className="text-card-title font-heading uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
              Registration Form
            </h2>
            {regCount !== null && (
              <span className="comic-badge text-xs" style={{ padding: '4px 10px', fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
                LIVE COUNTER: {regCount} PARTICIPANTS
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Team Name Input (for team events only, placed at the top) */}
            {event.isTeamEvent && (
              <div className="flex flex-col gap-6 pb-4 border-b border-border-default">
                <h3 className="font-heading text-body text-primary uppercase border-b border-dashed border-border-subtle pb-2">
                  Team Identification
                </h3>
                <div className="flex flex-col gap-2">
                  <label className="text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name"
                    required
                    className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/40 w-full"
                  />
                </div>
              </div>
            )}

            {/* Leader / Registrant Section */}
            <div className="flex flex-col gap-6">
              <h3 className="font-heading text-body text-primary uppercase border-b border-dashed border-border-subtle pb-2">
                Leader / Registrant Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    required
                    className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    College Name
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Stanford University"
                    required
                    className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Team Members Section (for team events only) */}
            {event.isTeamEvent && (
              <div className="flex flex-col gap-6 pt-4 border-t border-border-default">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading text-body text-primary uppercase">
                    Team Members
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="flex items-center gap-1 font-button text-micro uppercase bg-primary text-bg-base px-3 py-1.5 hover:opacity-90 transition-opacity"
                  >
                    <Plus size={12} /> Add Member
                  </button>
                </div>

                {members.length === 0 ? (
                  <p className="font-body text-body text-text-muted text-center py-4 border border-dashed border-border-default">
                    No team members added yet. Add at least one member.
                  </p>
                ) : (
                  <div className="flex flex-col gap-6">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="p-4 border border-border-default flex flex-col gap-4 relative"
                      >
                        <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                          <span className="font-heading text-small text-text-secondary uppercase">
                            Member #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(index)}
                            className="text-primary hover:opacity-75 transition-opacity"
                            title="Remove Member"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-micro font-body uppercase tracking-widest text-text-muted">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                              placeholder="Full Name"
                              required
                              className="bg-transparent border-b border-border-strong text-primary font-body text-body py-1.5 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-micro font-body uppercase tracking-widest text-text-muted">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                              placeholder="member@example.com"
                              required
                              className="bg-transparent border-b border-border-strong text-primary font-body text-body py-1.5 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-micro font-body uppercase tracking-widest text-text-muted">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={member.phone}
                              onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                              placeholder="+91 98765 43210"
                              className="bg-transparent border-b border-border-strong text-primary font-body text-body py-1.5 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-micro font-body uppercase tracking-widest text-text-muted">
                              College Name
                            </label>
                            <input
                              type="text"
                              value={member.college}
                              onChange={(e) => handleMemberChange(index, 'college', e.target.value)}
                              placeholder="e.g. MIT"
                              className="bg-transparent border-b border-border-strong text-primary font-body text-body py-1.5 focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div
                className="p-3 border border-dashed text-small font-body text-center"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-text-secondary)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-4 font-button text-button uppercase tracking-wide transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              style={{
                background: 'var(--color-text-primary)',
                color: 'var(--color-bg-base)',
                borderRadius: '6px',
              }}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Register Now <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Support Section */}
          <div className="mt-4 pt-6 border-t border-border-default text-xs font-semibold text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>Need help with registering?</p>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Helpline Support: <a href="tel:+919876543210" style={{ color: 'var(--color-text-primary)', textDecoration: 'underline' }}>+91 98765 43210</a> (Registration Desk)<br />
              Email Support: <a href="mailto:spectrum.sbmp@gmail.com" style={{ color: 'var(--color-text-primary)', textDecoration: 'underline' }}>spectrum.sbmp@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
