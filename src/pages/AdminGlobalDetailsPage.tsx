import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Settings, Landmark } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getEventDetails,
  updateEventDetails,
  getPaymentDetails,
  updatePaymentDetails,
  EventDetails
} from '../lib/firestore';

export function AdminGlobalDetailsPage() {
  console.log("[Mount] AdminGlobalDetailsPage component loaded");
  const { adminEmail } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPayments, setSavingPayments] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: 'SPECTRUM 26',
    location: 'College Campus',
    date: 'September 30, 2026',
    countdownTarget: '2026-09-30T09:00:00',
    helplinePhone: '+91 86574 78886',
    helplineEmail: 'spectrumsbmp@gmail.com',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '9021095204@postbank',
    qrCodeUrl: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [details, pay] = await Promise.all([
        getEventDetails(),
        getPaymentDetails()
      ]);
      setEventDetails(details);
      setPaymentDetails(pay);
    } catch (err) {
      console.error('Failed to load global details:', err);
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleSaveEventDetails = async () => {
    setSavingDetails(true);
    setMessage(null);
    try {
      await updateEventDetails(eventDetails, adminEmail ?? '');
      await loadData();
      window.dispatchEvent(new Event('spectrum26_reload_data'));
      setMessage({ text: 'Global event details updated successfully.', type: 'success' });
    } catch (err) {
      console.error('Failed to save event details:', err);
      setMessage({ text: 'Failed to update event details.', type: 'error' });
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSavePaymentDetails = async () => {
    setSavingPayments(true);
    setMessage(null);
    try {
      await updatePaymentDetails(paymentDetails, adminEmail ?? '');
      await loadData();
      window.dispatchEvent(new Event('spectrum26_reload_data'));
      setMessage({ text: 'UPI & Payments configuration updated successfully.', type: 'success' });
    } catch (err) {
      console.error('Failed to save payment details:', err);
      setMessage({ text: 'Failed to update payment details.', type: 'error' });
    } finally {
      setSavingPayments(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12 bg-black text-white">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border-default pb-4">
        <div>
          <h1 className="font-hero text-2xl uppercase tracking-widest text-primary">Global Event Details</h1>
          <p className="font-body text-small text-text-secondary">Configure branding, helpline info, countdown timers, and payment channels.</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 border border-dashed text-small font-body text-center ${
            message.type === 'success' ? 'border-green-500 text-green-400 bg-green-950/10' : 'border-primary text-primary bg-red-950/10'
          }`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {/* Global Event Details Panel */}
        <div className="border border-border-default p-6 bg-bg-card flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-border-default pb-3">
            <Settings size={20} className="text-primary" />
            <h2 className="font-heading text-heading uppercase tracking-widest text-primary">Branding &amp; Metadata</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Event Name</label>
              <input
                type="text"
                value={eventDetails.name}
                onChange={(e) => setEventDetails(prev => ({ ...prev, name: e.target.value }))}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Location</label>
              <input
                type="text"
                value={eventDetails.location}
                onChange={(e) => setEventDetails(prev => ({ ...prev, location: e.target.value }))}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Date Description</label>
              <input
                type="text"
                value={eventDetails.date}
                onChange={(e) => setEventDetails(prev => ({ ...prev, date: e.target.value }))}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Countdown Target</label>
              <input
                type="text"
                value={eventDetails.countdownTarget}
                onChange={(e) => setEventDetails(prev => ({ ...prev, countdownTarget: e.target.value }))}
                placeholder="YYYY-MM-DDTHH:MM:SS"
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Helpline Phone 1</label>
              <input
                type="text"
                value={eventDetails.helplinePhones?.[0] ?? eventDetails.helplinePhone ?? '+91 86574 78886'}
                onChange={(e) => {
                  const next = [...(eventDetails.helplinePhones || ['+91 86574 78886', '+91 90046 20948', '+91 90210 95204'])];
                  next[0] = e.target.value;
                  setEventDetails(prev => ({ ...prev, helplinePhone: next[0], helplinePhones: next }));
                }}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Helpline Phone 2</label>
              <input
                type="text"
                value={eventDetails.helplinePhones?.[1] ?? '+91 90046 20948'}
                onChange={(e) => {
                  const next = [...(eventDetails.helplinePhones || ['+91 86574 78886', '+91 90046 20948', '+91 90210 95204'])];
                  next[1] = e.target.value;
                  setEventDetails(prev => ({ ...prev, helplinePhones: next }));
                }}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Helpline Phone 3</label>
              <input
                type="text"
                value={eventDetails.helplinePhones?.[2] ?? '+91 90210 95204'}
                onChange={(e) => {
                  const next = [...(eventDetails.helplinePhones || ['+91 86574 78886', '+91 90046 20948', '+91 90210 95204'])];
                  next[2] = e.target.value;
                  setEventDetails(prev => ({ ...prev, helplinePhones: next }));
                }}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Support Helpline Email</label>
            <input
              type="email"
              value={eventDetails.helplineEmail || ''}
              onChange={(e) => setEventDetails(prev => ({ ...prev, helplineEmail: e.target.value }))}
              className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={handleSaveEventDetails}
            disabled={savingDetails}
            className="self-start font-button text-button px-6 py-2 border border-primary bg-primary text-bg-base hover:bg-transparent hover:text-primary transition-colors disabled:opacity-50 mt-4"
          >
            {savingDetails ? 'Saving...' : 'Save Global Details'}
          </button>
        </div>

        {/* UPI ID Section Panel */}
        <div className="border border-border-default p-6 bg-bg-card flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-border-default pb-3">
            <Landmark size={20} className="text-primary" />
            <h2 className="font-heading text-heading uppercase tracking-widest text-primary">UPI &amp; Payments Configuration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">VP's UPI ID</label>
              <input
                type="text"
                value={paymentDetails.upiId}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">QR Code Image Link / Path</label>
              <input
                type="text"
                value={paymentDetails.qrCodeUrl}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, qrCodeUrl: e.target.value }))}
                placeholder="e.g. /payment-qr.jpg or URL link"
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            onClick={handleSavePaymentDetails}
            disabled={savingPayments}
            className="self-start font-button text-button px-6 py-2 border border-primary bg-primary text-bg-base hover:bg-transparent hover:text-primary transition-colors disabled:opacity-50 mt-4"
          >
            {savingPayments ? 'Saving...' : 'Save Payment Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
