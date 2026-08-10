import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { playSynthSound } from '../lib/audio';
import { useAuth } from '../lib/useAuth';
import { createRegistration, getEvents, Event } from '../lib/firestore';

const FAQ_ITEMS = [
  { q: "Who can participate?", a: "Students from any registered engineering, polytechnic, or science college can enlist and accept these quests." },
  { q: "Is there a registration fee?", a: "Yes, the fees vary per event formatting: e.g. ₹50 for solos, ₹100 for duos, and ₹200 for squads." },
  { q: "Can I change my team later?", a: "Team rosters lock 24 hours before the battle begins. Contact help desks for exception requests." },
  { q: "What should I bring?", a: "Bring your college identity clearance card and the email quest pass received on completion." }
];

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
  }, []);

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  
  const [collegeName, setCollegeName] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('FY');
  const [teamName, setTeamName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [squadNames, setSquadNames] = useState(['', '', '']);

  useEffect(() => {
    if (location.state && location.state.selectedEventId) {
      setSelectedEventId(location.state.selectedEventId);
      setStep(1);
    }
  }, [location.state]);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [step, activeFaqIdx, events]);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const handleNextStep = () => {
    playSynthSound('click');
    if (step === 1) {
      if (!fullName || !email || !phone) {
        alert("Please fill in all personal info details.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedEventId) {
        alert("Please select an event battleground.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!collegeName) {
        alert("Please enter your college name.");
        return;
      }
      const membersList = [fullName];
      if (selectedEvent?.type.toLowerCase().includes('team') || selectedEvent?.type.toLowerCase().includes('duo')) {
        membersList.push(partnerName || 'Teammate');
      } else if (selectedEvent?.type.toLowerCase().includes('squad')) {
        squadNames.forEach(name => { if (name) membersList.push(name); });
      }

      const regData = {
        eventId: selectedEventId,
        eventName: selectedEvent?.name || 'Dual Debug',
        leaderName: fullName,
        email: email,
        phone: phone,
        college: collegeName,
        year: yearOfStudy,
        teamName: teamName || `${fullName}'s Crew`,
        members: membersList,
        paid: false
      };

      createRegistration(user?.uid || 'anonymous', regData)
        .then(() => {
          playSynthSound('laser');
          setStep(4);
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to submit registration. Please try again.");
        });
    }
  };

  const handlePrevStep = () => {
    playSynthSound('click');
    if (step > 1) {
      setStep((step - 1) as any);
    } else {
      setStep(0);
    }
  };

  const toggleFaq = (idx: number) => {
    playSynthSound('click');
    setActiveFaqIdx(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 page-content flex flex-col gap-8">
      
      {step === 0 ? (
        /* Quest Board Landing */
        <div className="quest-board-landing pixel-card">
          <h2 className="text-display uppercase">QUEST BOARD</h2>
          <span className="text-ui text-text-secondary uppercase">Accept your arena mission.</span>
          
          <div className="w-16 h-16 flex items-center justify-center my-6 mx-auto bg-bg-raised border border-border">
            <span className="highlight-icon"><i data-lucide="scroll-text"></i></span>
          </div>

          <h3 className="text-heading uppercase">SPECTRUM 5.0 QUEST</h3>
          <p className="text-small text-text-secondary leading-relaxed mt-2 mb-6">
            Join the ultimate 8-bit computational battle and register to become a Vile Parle legend.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => { playSynthSound('click'); setStep(1); }}
              className="btn btn-accent w-full"
            >
              ACCEPT QUEST
            </button>
            {!user && (
              <button
                onClick={() => { playSynthSound('click'); navigate('/login'); }}
                className="btn w-full"
              >
                LOGIN COMMAND
              </button>
            )}
          </div>
        </div>
      ) : step < 4 ? (
        /* Step 1-3 Forms Wizard */
        <div className="pixel-card text-left">
          {/* Step indicator progress bar */}
          <div className="wizard-progress-bar">
            <div className={`wizard-step-node ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`} />
            <div className={`wizard-connector-line ${step >= 2 ? 'completed' : ''}`} />
            <div className={`wizard-step-node ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`} />
            <div className={`wizard-connector-line ${step >= 3 ? 'completed' : ''}`} />
            <div className={`wizard-step-node ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`} />
            <div className={`wizard-connector-line`} />
            <div className="wizard-step-node" />
          </div>

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-heading uppercase border-b border-border pb-2">PERSONAL CLEARANCE</h3>
              <div>
                <label>FULL NAME</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label>TELEPHONE CONTACT</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Select Event */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-heading uppercase border-b border-border pb-2">SELECT BATTLEFIELD</h3>
              <div className="radio-card-group">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className={`radio-card-option ${selectedEventId === event.id ? 'selected' : ''}`}
                  >
                    <div>
                      <span className="font-ui text-base font-bold text-text-primary uppercase block">{event.name}</span>
                      <span className="px-2 py-0.5 border border-border text-[9px] font-pixel text-text-secondary uppercase mt-1 inline-block">
                        {event.type}
                      </span>
                    </div>
                    <span className="font-pixel text-xs text-text-primary">{event.price || 'FREE'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Team Details */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-heading uppercase border-b border-border pb-2">GUILD DETAILS</h3>
              <div>
                <label>COLLEGE NAME</label>
                <input
                  type="text"
                  placeholder="Enter college name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                />
              </div>
              <div>
                <label>YEAR OF STUDY</label>
                <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}>
                  <option value="FY">First Year (FY)</option>
                  <option value="SY">Second Year (SY)</option>
                  <option value="TY">Third Year (TY)</option>
                  <option value="LY">Fourth Year (LY)</option>
                </select>
              </div>

              {/* Conditional Team fields */}
              {(selectedEvent?.type.toLowerCase().includes('team') || selectedEvent?.type.toLowerCase().includes('duo')) && (
                <>
                  <div>
                    <label>CREW/TEAM NAME</label>
                    <input
                      type="text"
                      placeholder="Enter team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>PARTNER FULL NAME</label>
                    <input
                      type="text"
                      placeholder="Enter partner name"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Conditional Squad fields (BGMI) */}
              {selectedEvent?.type.toLowerCase().includes('squad') && (
                <>
                  <div>
                    <label>SQUAD NAME</label>
                    <input
                      type="text"
                      placeholder="Enter squad name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>SQUAD MEMBER 2</label>
                    <input
                      type="text"
                      placeholder="Member 2 name"
                      value={squadNames[0]}
                      onChange={(e) => {
                        const next = [...squadNames];
                        next[0] = e.target.value;
                        setSquadNames(next);
                      }}
                    />
                  </div>
                  <div>
                    <label>SQUAD MEMBER 3</label>
                    <input
                      type="text"
                      placeholder="Member 3 name"
                      value={squadNames[1]}
                      onChange={(e) => {
                        const next = [...squadNames];
                        next[1] = e.target.value;
                        setSquadNames(next);
                      }}
                    />
                  </div>
                  <div>
                    <label>SQUAD MEMBER 4</label>
                    <input
                      type="text"
                      placeholder="Member 4 name"
                      value={squadNames[2]}
                      onChange={(e) => {
                        const next = [...squadNames];
                        next[2] = e.target.value;
                        setSquadNames(next);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-4 mt-8">
            <button onClick={handlePrevStep} className="btn w-1/2">
              ← PREV
            </button>
            <button onClick={handleNextStep} className="btn btn-accent w-1/2">
              {step === 3 ? 'SUBMIT QUEST' : 'NEXT →'}
            </button>
          </div>
        </div>
      ) : (
        /* STEP 4: Success Confirmation */
        <div className="quest-board-landing pixel-card">
          <span className="highlight-icon text-green-500 mb-6 block mx-auto"><i data-lucide="circle-check" style={{ width: '40px', height: '40px' }}></i></span>
          <h2 className="text-display uppercase text-green-500">QUEST ACCEPTED!</h2>
          <p className="text-body text-text-secondary leading-relaxed mt-2 mb-6">
            Congratulations, your enlisting application has been processed. Check your mail directory inbox for verification wristband instructions.
          </p>
          <button
            onClick={() => { playSynthSound('click'); navigate('/'); }}
            className="btn btn-accent w-full"
          >
            VIEW DETAILS
          </button>
        </div>
      )}

      {/* Accordion FAQ Section */}
      <div className="pixel-card text-left">
        <h3 className="text-heading uppercase mb-4 border-b border-border pb-2 flex items-center gap-2">
          <i data-lucide="info"></i> FAQS
        </h3>
        <div className="flex flex-col">
          {FAQ_ITEMS.map((item, idx) => {
            const isActive = activeFaqIdx === idx;
            return (
              <div key={idx} className={`accordion-item ${isActive ? 'active' : ''}`}>
                <button className="accordion-header" onClick={() => toggleFaq(idx)}>
                  <span>{item.q}</span>
                  {isActive ? <i data-lucide="chevron-down" style={{ transform: 'rotate(180deg)', transition: 'transform 0.2s' }}></i> : <i data-lucide="chevron-down" style={{ transition: 'transform 0.2s' }}></i>}
                </button>
                <div className="accordion-content">
                  <div className="accordion-content-inner">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
