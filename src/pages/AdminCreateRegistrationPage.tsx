import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getEvents, adminCreateRegistration } from '../lib/firestore';
import type { Event } from '../types';
import { categoryLabel } from '../types';

export function AdminCreateRegistrationPage() {
  console.log("[Mount] AdminCreateRegistrationPage component loaded");
  const navigate = useNavigate();
  const { adminEmail } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Leader / registrant state
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderCollege, setLeaderCollege] = useState('');
  const [teamName, setTeamName] = useState('');

  // Team members state
  const [members, setMembers] = useState<{ name: string; email: string; phone: string; college: string }[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load events
  useEffect(() => {
    getEvents()
      .then((data) => {
        setEvents(data);
        if (data.length > 0) {
          // Default to first event
          setSelectedEventId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        setError('Failed to load events list.');
      })
      .finally(() => setLoadingEvents(false));
  }, []);

  // Update selected event details and reset team members if needed
  useEffect(() => {
    const ev = events.find((e) => e.id === selectedEventId) || null;
    setSelectedEvent(ev);
    setError(null);
    setSuccess(null);
    setTeamName('');

    if (ev) {
      // If it is a team event, initialize members with the minimum required (excluding leader)
      const minTeammates = Math.max(0, ev.minMembers - 1);
      const initialMembers = Array.from({ length: minTeammates }, () => ({
        name: '',
        email: '',
        phone: '',
        college: '',
      }));
      setMembers(initialMembers);
    } else {
      setMembers([]);
    }
  }, [selectedEventId, events]);

  const handleAddMember = () => {
    if (!selectedEvent) return;
    const maxTeammates = selectedEvent.maxMembers - 1;
    if (members.length >= maxTeammates) {
      setError(`Cannot add more than ${selectedEvent.maxMembers} total members (including the leader).`);
      return;
    }
    setMembers((prev) => [...prev, { name: '', email: '', phone: '', college: leaderCollege }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: 'name' | 'email' | 'phone' | 'college', value: string) => {
    setMembers((prev) =>
      prev.map((member, i) => (i === index ? { ...member, [field]: value } : member))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !selectedEvent) {
      setError('Please select a valid event.');
      return;
    }

    // Validate leader fields
    if (!leaderName.trim() || !leaderEmail.trim() || !leaderPhone.trim()) {
      setError('Leader Name, Email, and Phone are required.');
      return;
    }

    // Validate team members if team event
    if (selectedEvent.isTeamEvent) {
      if (!teamName.trim()) {
        setError('Team Name is required for team events.');
        return;
      }
      const totalMembers = members.length + 1;
      if (totalMembers < selectedEvent.minMembers) {
        setError(`This event requires a minimum of ${selectedEvent.minMembers} team members (including the leader).`);
        return;
      }
      if (totalMembers > selectedEvent.maxMembers) {
        setError(`This event allows a maximum of ${selectedEvent.maxMembers} team members (including the leader).`);
        return;
      }

      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.name.trim() || !m.email.trim()) {
          setError(`Please fill in Name and Email for Teammate #${i + 1}.`);
          return;
        }
      }

      // Duplicate checks within the team
      const allNames = [leaderName.trim().toLowerCase()];
      const allEmails = [leaderEmail.trim().toLowerCase()];
      const allPhones = [leaderPhone.trim().replace(/\s+/g, '')];

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

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await adminCreateRegistration(
        selectedEventId,
        {
          name: leaderName.trim(),
          email: leaderEmail.trim(),
          phone: leaderPhone.trim(),
          college: leaderCollege.trim(),
        },
        members.map((m) => ({
          name: m.name.trim(),
          email: m.email.trim(),
          phone: m.phone.trim(),
          college: m.college.trim() || leaderCollege.trim(),
        })),
        adminEmail ?? 'admin@system.local',
        selectedEvent.isTeamEvent ? teamName.trim() : undefined
      );

      setSuccess('Registration created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/supercore/registrations');
      }, 1500);
    } catch (err: any) {
      console.error('[AdminCreateRegistration] Creation error:', err);
      const errMsg = err?.message || '';
      if (errMsg.startsWith('LEADER_ALREADY_REGISTERED')) {
        setError(`The leader email (${leaderEmail}) is already registered for this event.`);
      } else if (errMsg.startsWith('MEMBER_ALREADY_REGISTERED')) {
        const email = errMsg.split(':')[1];
        setError(`The team member email (${email}) is already registered for this event.`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create registration. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvents) {
    return (
      <main className="">
        <Loader2 className="" size={32} />
        <p className="">Loading events...</p>
      </main>
    );
  }

  return (
    <main className="">
      {/* Back button & Header */}
      <div className="">
        <Link
          to="/supercore/registrations"
          className=""
        >
          <ArrowLeft size={14} /> Back to registrations
        </Link>
        <h1 className="">
          Add Registration
        </h1>
        <p className="">
          Manually register a team or individual for any event.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="">
        {/* Event Selection */}
        <div className="">
          <h2 className="">
            Select Event
          </h2>
          <div className="">
            <label className="">
              Choose Event *
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className=""
            >
              {events.map((e) => (
                <option key={e.id} value={e.id} className="">
                  [{categoryLabel(e.category)}] {e.name}
                </option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <div className="">
              <div className="">
                <span>
                  <strong>Category:</strong> {categoryLabel(selectedEvent.category)}
                </span>
                <span>
                  <strong>Format:</strong> {selectedEvent.isTeamEvent ? `Team (Size: ${selectedEvent.minMembers} - ${selectedEvent.maxMembers})` : 'Individual'}
                </span>
                <span>
                  <strong>Current Teams:</strong> {selectedEvent.currentTeamCount} {selectedEvent.maxTeams ? `/ ${selectedEvent.maxTeams}` : ''}
                </span>
              </div>
              <p className="">
                {selectedEvent.description}
              </p>
            </div>
          )}
        </div>

        {/* Leader Details */}
        <div className="">
          <h2 className="">
            Leader / Registrant Details
          </h2>
          <div className="">
            <div className="">
              <label className="">
                Full Name *
              </label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Full Name"
                required
                className=""
              />
            </div>
            <div className="">
              <label className="">
                Email Address *
              </label>
              <input
                type="email"
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                placeholder="leader@example.com"
                required
                className=""
              />
            </div>
            <div className="">
              <label className="">
                Phone Number *
              </label>
              <input
                type="tel"
                value={leaderPhone}
                onChange={(e) => setLeaderPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
                className=""
              />
            </div>
            <div className="">
              <label className="">
                College Name
              </label>
              <input
                type="text"
                value={leaderCollege}
                onChange={(e) => setLeaderCollege(e.target.value)}
                placeholder="e.g. MIT College"
                className=""
              />
            </div>
          </div>
        </div>

        {/* Team Identification (For Team Events) */}
        {selectedEvent?.isTeamEvent && (
          <div className="">
            <h2 className="">
              Team Identification
            </h2>
            <div className="">
              <label className="">
                Team Name *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter your team name"
                required
                className=""
              />
            </div>
          </div>
        )}

        {/* Team Members Section (For Team Events) */}
        {selectedEvent?.isTeamEvent && (
          <div className="">
            <div className="">
              <h2 className="">
                Teammate Details
              </h2>
              {members.length + 1 < selectedEvent.maxMembers && (
                <button
                  type="button"
                  onClick={handleAddMember}
                  className=""
                >
                  <Plus size={12} /> Add Teammate
                </button>
              )}
            </div>

            {members.length === 0 ? (
              <p className="">No additional teammates added yet.</p>
            ) : (
              <div className="">
                {members.map((member, index) => (
                  <div key={index} className="">
                    <div className="">
                      <span className="">
                        Teammate #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className=""
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>

                    <div className="">
                      <div className="">
                        <label className="">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          placeholder="Full Name"
                          required
                          className=""
                        />
                      </div>
                      <div className="">
                        <label className="">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          placeholder="teammate@example.com"
                          required
                          className=""
                        />
                      </div>
                      <div className="">
                        <label className="">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={member.phone}
                          onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className=""
                        />
                      </div>
                      <div className="">
                        <label className="">
                          College Name
                        </label>
                        <input
                          type="text"
                          value={member.college}
                          onChange={(e) => handleMemberChange(index, 'college', e.target.value)}
                          placeholder={leaderCollege || 'e.g. MIT College'}
                          className=""
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error / Success Alerts */}
        {error && (
          <div className="">
            {error}
          </div>
        )}

        {success && (
          <div className="">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className=""
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-bg-base)',
            borderRadius: '0px',
          }}
        >
          {submitting ? (
            <Loader2 size={16} className="" />
          ) : (
            'Create Registration'
          )}
        </button>
      </form>
    </main>
  );
}
