import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEvent, createRegistration, hasExistingRegistration } from '../lib/firestore';
import { playSynthSound } from '../lib/audio';
import { useAuth } from '../lib/useAuth';
import type { Event } from '../types';

const INK = "#1A1A1A";
const VERMILION = "#C7382F";
const TEAL = "#12595B";
const MUSTARD = "#E8A13A";
const JUTE = "#D9C9A3";
const hoardingShadow = `4px 4px 0px ${INK}`;
const softHoardingShadow = `2px 2px 0px ${INK}`;

const ticketStyle = {
  background: "#F4EBD9", // aged paper
  borderColor: INK,
  borderWidth: "4px",
  boxShadow: hoardingShadow,
};

export function RegisterPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [upiTransactionRef, setUpiTransactionRef] = useState('');

  useEffect(() => {
    if (eventId) {
      getEvent(eventId).then(setEvent).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first!");
      return;
    }
    setSubmitting(true);
    playSynthSound('laser');

    try {
      const alreadyRegistered = await hasExistingRegistration(user.uid, eventId || 'general');
      if (alreadyRegistered) {
        alert("You are already registered for this event!");
        setSubmitting(false);
        return;
      }

      await createRegistration({
        userId: user.uid,
        eventId: eventId || 'general',
        eventName: event?.name || 'General Entry',
        name,
        email,
        phone,
        college,
        teamName: '',
        members: [],
        upiTransactionRef,
        paymentScreenshot: '',
        status: 'PENDING',
        registeredAt: new Date().toISOString()
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="">Loading Ticket...</div>;
  }

  if (submitted) {
    return (
      <div className="">
        <div className="" style={ticketStyle}>
          {/* Rubber stamp */}
          <div 
            className=""
            style={{ borderColor: VERMILION, color: VERMILION }}
          >
             <div className="" style={{ borderColor: VERMILION }}>
                <span className="">Approved</span>
                <span className="">SEPT 30</span>
             </div>
          </div>

          <h2 className="" style={{ color: TEAL }}>
            Ticket Confirmed!
          </h2>
          <p className="" style={{ color: INK }}>
            Your seat is reserved. See you at Spectrum 5.0.
          </p>
          <button 
            type="button" 
            onClick={() => {
              playSynthSound('click');
              setSubmitted(false);
              setName('');
              setEmail('');
              setPhone('');
              setCollege('');
              setUpiTransactionRef('');
            }} 
            className="" 
            style={{ color: VERMILION, textUnderlineOffset: "4px" }}
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="" style={ticketStyle}>
        <div className="" style={{ borderColor: INK }}>
          <div>
            <p className="" style={{ color: VERMILION }}>Registration Form</p>
            <h2 className="" style={{ color: INK, fontSize: "1.8rem", lineHeight: 1.1 }}>
              Official Ticket
            </h2>
          </div>
          <div className="" style={{ color: INK }}>
            No. 50
          </div>
        </div>

        <form onSubmit={handleSubmit} className="">
          <div className="">
             <label className="" style={{ color: TEAL }}>Name</label>
             <input required placeholder="Enter Full Name" value={name} onChange={(e) => setName(e.target.value)} className="" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="">
             <label className="" style={{ color: TEAL }}>Email</label>
             <input required type="email" placeholder="email@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="">
             <label className="" style={{ color: TEAL }}>Phone</label>
             <input required type="tel" placeholder="+91" value={phone} onChange={(e) => setPhone(e.target.value)} className="" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="">
             <label className="" style={{ color: TEAL }}>College / Institute</label>
             <input required placeholder="College Name" value={college} onChange={(e) => setCollege(e.target.value)} className="" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="">
             <label className="" style={{ color: TEAL }}>UPI Transaction ID / Ref No.</label>
             <input required placeholder="12-digit UPI reference ID" value={upiTransactionRef} onChange={(e) => setUpiTransactionRef(e.target.value)} className="" style={{ borderColor: INK, color: INK }} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className=""
            style={{ 
              borderColor: INK, 
              background: MUSTARD, 
              color: INK, 
              boxShadow: hoardingShadow,
              transform: 'translate(-2px, -2px)'
            }}
          >
            {submitting ? "Stamping..." : "Confirm Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}
