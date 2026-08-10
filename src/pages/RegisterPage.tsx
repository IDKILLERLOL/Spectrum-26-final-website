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
    return <div className="text-center font-hero py-20">Loading Ticket...</div>;
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center max-w-md mx-auto w-full min-h-screen">
        <div className="relative p-8 w-full max-w-sm border-4" style={ticketStyle}>
          {/* Rubber stamp */}
          <div 
            className="absolute -top-6 -right-4 size-28 rounded-full border-4 flex items-center justify-center bg-transparent z-10 -rotate-12"
            style={{ borderColor: VERMILION, color: VERMILION }}
          >
             <div className="border-2 w-[85%] h-[85%] rounded-full flex flex-col items-center justify-center border-dashed" style={{ borderColor: VERMILION }}>
                <span className="font-hero text-xl uppercase leading-none mt-2">Approved</span>
                <span className="text-[8px] font-bold mt-1 tracking-widest font-body">SEPT 30</span>
             </div>
          </div>

          <h2 className="font-hero text-2xl" style={{ color: TEAL }}>
            Ticket Confirmed!
          </h2>
          <p className="text-sm mt-2 font-bold font-body" style={{ color: INK }}>
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
            className="mt-6 text-xs uppercase font-bold tracking-widest underline decoration-2 font-body" 
            style={{ color: VERMILION, textUnderlineOffset: "4px" }}
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-16 max-w-md mx-auto w-full min-h-screen">
      <div className="p-6 border-4" style={ticketStyle}>
        <div className="border-b-4 pb-4 mb-5 flex justify-between items-end" style={{ borderColor: INK }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest font-body" style={{ color: VERMILION }}>Registration Form</p>
            <h2 className="font-hero" style={{ color: INK, fontSize: "1.8rem", lineHeight: 1.1 }}>
              Official Ticket
            </h2>
          </div>
          <div className="font-hero text-2xl opacity-30" style={{ color: INK }}>
            No. 50
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-body text-left">
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>Name</label>
             <input required placeholder="Enter Full Name" value={name} onChange={(e) => setName(e.target.value)} className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>Email</label>
             <input required type="email" placeholder="email@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>Phone</label>
             <input required type="tel" placeholder="+91" value={phone} onChange={(e) => setPhone(e.target.value)} className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>College / Institute</label>
             <input required placeholder="College Name" value={college} onChange={(e) => setCollege(e.target.value)} className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>UPI Transaction ID / Ref No.</label>
             <input required placeholder="12-digit UPI reference ID" value={upiTransactionRef} onChange={(e) => setUpiTransactionRef(e.target.value)} className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50" style={{ borderColor: INK, color: INK }} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="font-hero mt-6 border-4 py-3 text-lg uppercase transition-transform disabled:opacity-40"
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
