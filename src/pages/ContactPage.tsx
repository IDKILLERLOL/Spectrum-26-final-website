import React, { useState, useEffect } from 'react';
import { playSynthSound } from '../lib/audio';
import { getEventDetails } from '../lib/firestore';

export function ContactPage() {
  const [details, setDetails] = useState<any>(null);
  const [name, setName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getEventDetails().then(setDetails).catch(console.error);
  }, []);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, []);

  const email = details?.helplineEmail || 'spectrumsbmp@gmail.com';
  const phone = details?.helplinePhone || '+91 98765 43210';
  const address = details?.location || "SVKM's Shri Bhagubhai Mafatlal Polytechnic\nIrla, Vile Parle West, Mumbai, Maharashtra 400056";

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    playSynthSound('laser');
    alert("Message sent! Our crew will get back to you shortly.");
    setName('');
    setEmailInput('');
    setMessage('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 page-content flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="highlight-icon"><i data-lucide="mail"></i></span>
          <div className="section-divider" style={{ margin: 0 }}>GET IN TOUCH</div>
        </div>
        <p className="text-small text-text-secondary font-semibold">We'd love to hear from you!</p>
      </div>

      {/* Info Card */}
      <div className="pixel-card flex flex-col gap-4 text-left">
        <div className="flex items-center gap-3">
          <i data-lucide="mail" className="text-text-secondary shrink-0"></i>
          <div>
            <span className="font-ui text-xs font-bold text-text-secondary block">EMAIL</span>
            <a href={`mailto:${email}`} className="text-ui text-text-primary uppercase break-all">{email}</a>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border/30 pt-3">
          <i data-lucide="volume-2" className="text-text-secondary shrink-0"></i>
          <div>
            <span className="font-ui text-xs font-bold text-text-secondary block">PHONE</span>
            <a href={`tel:${phone}`} className="text-ui text-text-primary">{phone}</a>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-border/30 pt-3">
          <i data-lucide="map-pin" className="text-text-secondary shrink-0 mt-0.5"></i>
          <div>
            <span className="font-ui text-xs font-bold text-text-secondary block">LOCATION</span>
            <p className="text-small text-text-primary whitespace-pre-line leading-relaxed">{address}</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSendMessage} className="pixel-card flex flex-col gap-4">
        <div>
          <label>Your Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Message</label>
          <textarea
            placeholder="Enter your message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-accent w-full mt-2">
          SEND MESSAGE →
        </button>
      </form>

    </div>
  );
}
