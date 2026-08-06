import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getEvent, createRegistration, getUser, updateUser, hasExistingRegistration, db, getEventDetails } from '../lib/firestore';
import { collection, getDocs, query, where, getCountFromServer, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Event } from '../types';
import { PixelSprite } from '../components/PixelSprite';
import { useMaxError } from '../contexts/MaxErrorContext';
import { DUSTIN_MAP, DUSTIN_MAP_CELEBRATE, DUSTIN_PALETTE, DUSTIN_IDLE_REGION } from '../sprites/dustin';
import { ELEVEN_MAP, ELEVEN_MAP_CELEBRATE, ELEVEN_PALETTE, ELEVEN_IDLE_REGION } from '../sprites/eleven';
import { STEVE_MAP, STEVE_MAP_CELEBRATE, STEVE_PALETTE, STEVE_IDLE_REGION } from '../sprites/steve';
import { LUCAS_MAP, LUCAS_MAP_CELEBRATE, LUCAS_PALETTE, LUCAS_IDLE_REGION } from '../sprites/lucas';
import { MAX_MAP, MAX_MAP_CELEBRATE, MAX_PALETTE, MAX_IDLE_REGION } from '../sprites/max';

const EVENT_SPRITE_MAP: Record<string, {
  map: string[][];
  celebrateMap: string[][];
  palette: Record<string, string>;
  idleRegion: { row: number; col: number }[];
}> = {
  'tech-duo-1':  { map: MAX_MAP,    celebrateMap: MAX_MAP_CELEBRATE,    palette: MAX_PALETTE,    idleRegion: MAX_IDLE_REGION    },
  'tech-solo-1': { map: ELEVEN_MAP, celebrateMap: ELEVEN_MAP_CELEBRATE, palette: ELEVEN_PALETTE, idleRegion: ELEVEN_IDLE_REGION },
  'non-tech-1':  { map: STEVE_MAP,  celebrateMap: STEVE_MAP_CELEBRATE,  palette: STEVE_PALETTE,  idleRegion: STEVE_IDLE_REGION  },
  'non-tech-3':  { map: LUCAS_MAP,  celebrateMap: LUCAS_MAP_CELEBRATE,  palette: LUCAS_PALETTE,  idleRegion: LUCAS_IDLE_REGION  },
};


function hashPassword(password: string, email: string): string {
  const str = `${email}::${password}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash; // 32-bit
  }
  return (hash >>> 0).toString(16);
}

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
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  
  // Team members state (for team events)
  const [members, setMembers] = useState<{ name: string; email: string; phone: string; college: string }[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [regCount, setRegCount] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [supportEmail, setSupportEmail] = useState('spectrum.sbmp@gmail.com');
  const { showMaxError } = useMaxError();
  const spriteData = eventId ? EVENT_SPRITE_MAP[eventId] : null;

  // Load event details & pre-fill user profile if available
  useEffect(() => {
    if (!eventId || authLoading) return;

    const loadData = async () => {
      try {
        // Fetch event & details in parallel to minimize load latency
        const [ev, details] = await Promise.all([
          getEvent(eventId),
          getEventDetails()
        ]);
        
        setEvent(ev);
        if (details) {
          setSupportPhone(details.helplinePhone || '+91 98765 43210');
          setSupportEmail(details.helplineEmail || 'spectrum.sbmp@gmail.com');
        }

        // Fetch registered persons count accurately using server aggregation (fast & cheap)
        const countSnap = await getCountFromServer(query(collection(db, 'teamMembers'), where('status', '==', 'ACTIVE')));
        setRegCount(countSnap.data().count);

        // Skip authentication check and pre-fill if user is logged in
        if (user && ev) {
          const [profile, existing] = await Promise.all([
            getUser(user.uid),
            hasExistingRegistration(user.uid, ev.id)
          ]);

          if (profile) {
            setName(profile.name || '');
            setEmail(profile.email || user.email || '');
            setPhone(profile.phone || '');
            setCollege(profile.college || '');
          }

          if (existing) {
            // Already registered — go straight to their pass
            sessionStorage.setItem('spectrum26_active_registration_id', existing);
            navigate(`/pass/${existing}`, { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error('[RegisterPage] Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId, user, navigate, authLoading]);

  const handleAddMember = () => {
    if (event && members.length + 1 >= event.maxMembers) {
      setError(`Cannot add more than ${event.maxMembers} members (including the leader).`);
      showMaxError('team-full');
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

    if (!user && !password.trim()) {
      setError('Please create a password for your account.');
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
        showMaxError('team-under');
        return;
      }
      if (totalSize > event.maxMembers) {
        setError(`This event allows a maximum of ${event.maxMembers} team members (including the leader). Please remove some teammates.`);
        showMaxError('team-full');
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
          showMaxError('generic');
          return;
        }
        if (allEmails.includes(mEmail)) {
          setError(`Duplicate email address: "${m.email}". Every team member must have a unique email.`);
          showMaxError('duplicate-email');
          return;
        }
        if (mPhone && allPhones.includes(mPhone)) {
          setError(`Duplicate phone number: "${m.phone}". Every team member must have a unique phone number.`);
          showMaxError('duplicate-phone');
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
    if (!eventId || !event) return;
    setSubmitting(true);
    setError(null);
    try {
      // Save leader details to their global user profile if authenticated
      if (user) {
        await updateUser(user.uid, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          college: college.trim(),
        });
      }

      const leaderUid = user ? user.uid : `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // If they are not logged in (guest), create their user document with the password hash!
      if (!user) {
        const userRef = doc(db, 'users', leaderUid);
        const passHash = hashPassword(password.trim(), email.trim().toLowerCase());
        await setDoc(userRef, {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone.trim(),
          college: college.trim(),
          authMethod: 'otp', // So they login via email/password in LoginPage
          passwordHash: passHash,
          createdAt: serverTimestamp()
        });
      }

      // Create the event registration with members list
      const newReg = await createRegistration(
        event.id,
        {
          uid: leaderUid,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: college.trim(),
        },
        user?.email || email.trim(),
        event.isTeamEvent ? members : [],
        event.isTeamEvent ? teamName.trim() : undefined
      );

      // Redirect directly to the Pass page
      sessionStorage.setItem('spectrum26_active_registration_id', newReg.id);
      // Trigger celebrate pose for 1200ms
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1200);
      navigate(`/pass/${newReg.id}`, { replace: true });
    } catch (err: unknown) {
      console.error('[RegisterPage] Submit registration error:', err);
      const msg = (err as Error).message || '';
      if (msg.startsWith('ALREADY_REGISTERED:')) {
        const existingId = msg.replace('ALREADY_REGISTERED:', '');
        sessionStorage.setItem('spectrum26_active_registration_id', existingId);
        navigate(`/pass/${existingId}`, { replace: true });
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
        <div className="flex flex-col gap-3" style={{ position: 'relative' }}>
          {/* Character sprite — top-right corner of header (decorative) */}
          {spriteData && (
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              opacity: 0.85,
              pointerEvents: 'none',
            }}>
              <img
                src={{
                  'tech-duo-1': '/Max.png',
                  'tech-solo-1': '/Eleven.png',
                  'non-tech-1': '/steve.png',
                  'non-tech-3': '/Lucas.png',
                }[eventId || ''] || '/Max.png'}
                alt="character"
                style={{
                  imageRendering: 'pixelated',
                  width: 80,
                  height: 100,
                  objectFit: 'contain',
                }}
              />
            </div>
          )}


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
          className="p-8 flex flex-col gap-8 border border-border-default"
          style={{
            background: 'var(--color-bg-card)',
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
                <h3 className="font-heading text-body text-primary uppercase pb-2">
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
                    className="bg-transparent border-b-2 border-border-strong text-primary font-body text-body py-2 focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/40 w-full"
                  />
                </div>
              </div>
            )}

            {/* Leader / Registrant Section */}
            <div className="flex flex-col gap-6">
              <h3 className="font-heading text-body text-primary uppercase pb-2">
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
                    className="bg-transparent border-b-2 border-border-strong text-primary font-body text-body py-2 focus:outline-none focus:border-primary transition-all"
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
                    className="bg-transparent border-b-2 border-border-strong text-primary font-body text-body py-2 focus:outline-none focus:border-primary transition-all"
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
                    className="bg-transparent border-b-2 border-border-strong text-primary font-body text-body py-2 focus:outline-none focus:border-primary transition-all"
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
                    className="bg-transparent border-b-2 border-border-strong text-primary font-body text-body py-2 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                {!user && (
                  <div className="flex flex-col gap-2">
                    <label className="text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                      Create Account Password *
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters recommended"
                      required
                      className="bg-transparent border-b-2 border-border-strong text-primary font-body text-body py-2 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                )}
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

            {/* Payment UPI & QR Code Section */}
            <div className="flex flex-col gap-4 p-6 border-2 border-primary bg-bg-elevated/80 text-center items-center rounded-sm">
              <span className="font-heading text-card-title text-primary uppercase tracking-wide">
                Payment Instructions (Scan &amp; Pay)
              </span>
              <p className="font-body text-small text-text-secondary max-w-md leading-relaxed">
                Scan the official UPI QR code below using any UPI app (GPay, PhonePe, Paytm) to pay the registration fee of <strong className="text-primary font-bold">₹{event.price}</strong>.
              </p>

              <div className="p-3 bg-white border-2 border-primary shadow-lg rounded-sm inline-block my-1">
                <img
                  src="/payment-qr.jpg"
                  alt="Payment UPI QR Code"
                  className="w-56 h-auto object-contain mx-auto"
                />
              </div>

              <span className="font-micro text-micro uppercase tracking-widest text-text-muted">
                UPI ID: <span className="text-primary font-mono font-bold select-all">spectrum26@upi</span>
              </span>
            </div>

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
            <p style={{ color: 'var(--color-text-muted)' }}>
              Need help with registering?{' '}
              <Link to="/contact" style={{ color: 'var(--color-text-primary)', textDecoration: 'underline' }}>
                Contact Us.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
