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
      <div className="">
        <Loader2 className="" size={40} />
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="">
        <div>
          <h1 className="">Global Event Details</h1>
          <p className="">Configure branding, helpline info, countdown timers, and payment channels.</p>
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

      <div className="">
        {/* Global Event Details Panel */}
        <div className="">
          <div className="">
            <Settings size={20} className="" />
            <h2 className="">Branding &amp; Metadata</h2>
          </div>
          <div className="">
            <div className="">
              <label className="">Event Name</label>
              <input
                type="text"
                value={eventDetails.name}
                onChange={(e) => setEventDetails(prev => ({ ...prev, name: e.target.value }))}
                className=""
              />
            </div>
            <div className="">
              <label className="">Location</label>
              <input
                type="text"
                value={eventDetails.location}
                onChange={(e) => setEventDetails(prev => ({ ...prev, location: e.target.value }))}
                className=""
              />
            </div>
            <div className="">
              <label className="">Date Description</label>
              <input
                type="text"
                value={eventDetails.date}
                onChange={(e) => setEventDetails(prev => ({ ...prev, date: e.target.value }))}
                className=""
              />
            </div>
          </div>

          <div className="">
            <div className="">
              <label className="">Countdown Target</label>
              <input
                type="text"
                value={eventDetails.countdownTarget}
                onChange={(e) => setEventDetails(prev => ({ ...prev, countdownTarget: e.target.value }))}
                placeholder="YYYY-MM-DDTHH:MM:SS"
                className=""
              />
            </div>
            <div className="">
              <label className="">Helpline Phone 1</label>
              <input
                type="text"
                value={eventDetails.helplinePhones?.[0] ?? eventDetails.helplinePhone ?? '+91 86574 78886'}
                onChange={(e) => {
                  const next = [...(eventDetails.helplinePhones || ['+91 86574 78886', '+91 90046 20948', '+91 90210 95204'])];
                  next[0] = e.target.value;
                  setEventDetails(prev => ({ ...prev, helplinePhone: next[0], helplinePhones: next }));
                }}
                className=""
              />
            </div>
            <div className="">
              <label className="">Helpline Phone 2</label>
              <input
                type="text"
                value={eventDetails.helplinePhones?.[1] ?? '+91 90046 20948'}
                onChange={(e) => {
                  const next = [...(eventDetails.helplinePhones || ['+91 86574 78886', '+91 90046 20948', '+91 90210 95204'])];
                  next[1] = e.target.value;
                  setEventDetails(prev => ({ ...prev, helplinePhones: next }));
                }}
                className=""
              />
            </div>
            <div className="">
              <label className="">Helpline Phone 3</label>
              <input
                type="text"
                value={eventDetails.helplinePhones?.[2] ?? '+91 90210 95204'}
                onChange={(e) => {
                  const next = [...(eventDetails.helplinePhones || ['+91 86574 78886', '+91 90046 20948', '+91 90210 95204'])];
                  next[2] = e.target.value;
                  setEventDetails(prev => ({ ...prev, helplinePhones: next }));
                }}
                className=""
              />
            </div>
          </div>

          <div className="">
            <label className="">Support Helpline Email</label>
            <input
              type="email"
              value={eventDetails.helplineEmail || ''}
              onChange={(e) => setEventDetails(prev => ({ ...prev, helplineEmail: e.target.value }))}
              className=""
            />
          </div>

          <button
            onClick={handleSaveEventDetails}
            disabled={savingDetails}
            className=""
          >
            {savingDetails ? 'Saving...' : 'Save Global Details'}
          </button>
        </div>

        {/* UPI ID Section Panel */}
        <div className="">
          <div className="">
            <Landmark size={20} className="" />
            <h2 className="">UPI &amp; Payments Configuration</h2>
          </div>
          <div className="">
            <div className="">
              <label className="">VP's UPI ID</label>
              <input
                type="text"
                value={paymentDetails.upiId}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
                className=""
              />
            </div>
            <div className="">
              <label className="">QR Code Image Link / Path</label>
              <input
                type="text"
                value={paymentDetails.qrCodeUrl}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, qrCodeUrl: e.target.value }))}
                placeholder="e.g. /payment-qr.jpg or URL link"
                className=""
              />
            </div>
          </div>
          <button
            onClick={handleSavePaymentDetails}
            disabled={savingPayments}
            className=""
          >
            {savingPayments ? 'Saving...' : 'Save Payment Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
