import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getScheduleSlots, createScheduleSlot, updateScheduleSlot, deleteScheduleSlot,
  getEventDetails, updateEventDetails, type EventDetails,
  getPaymentDetails, updatePaymentDetails
} from '../lib/firestore';
import type { ScheduleSlot, ScheduleEventType } from '../types';

type InlineState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; slotId: string }
  | { type: 'confirm-delete'; slotId: string };

type SlotFormData = Omit<ScheduleSlot, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY_FORM: SlotFormData = {
  day: 'Day 1',
  date: 'September 15, 2026',
  sortTime: '09:00',
  displayTime: '09:00 AM',
  location: '',
  title: '',
  type: 'GENERAL',
  sortOrder: 0,
};

export function AdminSchedulePage() {
  console.log("[Mount] AdminSchedulePage component loaded");
  const { adminEmail } = useAuth();
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [inlineState, setInlineState] = useState<InlineState>({ type: 'none' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SlotFormData>(EMPTY_FORM);

  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: 'SPECTRUM 26',
    location: 'College Campus',
    date: 'September 30, 2026',
    countdownTarget: '2026-09-30T09:00:00',
    helplinePhone: '+91 98765 43210',
    helplineEmail: 'spectrum.sbmp@gmail.com',
  });
  const [savingDetails, setSavingDetails] = useState(false);

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '9021095204',
    qrCodeUrl: '',
  });
  const [savingPayments, setSavingPayments] = useState(false);

  const reload = useCallback(async () => {
    const [data, details, pay] = await Promise.all([
      getScheduleSlots(),
      getEventDetails(),
      getPaymentDetails()
    ]);
    setSlots(data);
    setEventDetails(details);
    setPaymentDetails(pay);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));

    const handleGlobalReload = () => {
      reload();
    };
    window.addEventListener('spectrum26_reload_data', handleGlobalReload);
    return () => window.removeEventListener('spectrum26_reload_data', handleGlobalReload);
  }, [reload]);

  const handleSaveEventDetails = async () => {
    setSavingDetails(true);
    try {
      await updateEventDetails(eventDetails, adminEmail ?? '');
      await reload();
      // Dispatch custom event to trigger updates in other components
      window.dispatchEvent(new Event('spectrum26_reload_data'));
    } catch (err) {
      console.error('Failed to save event details:', err);
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSavePaymentDetails = async () => {
    setSavingPayments(true);
    try {
      await updatePaymentDetails(paymentDetails, adminEmail ?? '');
      await reload();
      window.dispatchEvent(new Event('spectrum26_reload_data'));
    } catch (err) {
      console.error('Failed to save payment details:', err);
    } finally {
      setSavingPayments(false);
    }
  };

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      date: eventDetails.date, // default to global date
    });
    setError(null);
    setInlineState({ type: 'create' });
  };

  const openEdit = (slot: ScheduleSlot) => {
    setForm({
      day: slot.day,
      date: slot.date,
      sortTime: slot.sortTime,
      displayTime: slot.displayTime,
      location: slot.location,
      title: slot.title,
      type: slot.type,
      sortOrder: slot.sortOrder,
    });
    setError(null);
    setInlineState({ type: 'edit', slotId: slot.id });
  };

  const closeState = () => { setInlineState({ type: 'none' }); setError(null); };

  const setField = (k: keyof SlotFormData, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) {
      setError('Title and Location are required.');
      return;
    }
    setSaving(true);
    try {
      await createScheduleSlot({
        ...form,
        date: eventDetails.date, // enforce global event details date
      }, adminEmail ?? '');
      await reload();
      closeState();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create slot.');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent, slotId: string) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) {
      setError('Title and Location are required.');
      return;
    }
    setSaving(true);
    try {
      await updateScheduleSlot(slotId, {
        ...form,
        date: eventDetails.date, // enforce global event details date
      }, adminEmail ?? '');
      await reload();
      closeState();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update slot.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (slotId: string) => {
    setSaving(true);
    try {
      await deleteScheduleSlot(slotId, adminEmail ?? '');
      await reload();
      closeState();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to delete slot.');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border-default pb-4">
        <div>
          <h1 className="font-hero text-2xl uppercase tracking-widest text-primary">Schedule Slots</h1>
          <p className="font-body text-small text-text-secondary">Create and manage timeslots for {eventDetails.name}.</p>
        </div>
        {inlineState.type === 'none' && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 font-button text-button px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-bg-base transition-colors"
          >
            <Plus size={16} /> Add Slot
          </button>
        )}
      </div>

      {/* Global Event Details & Payments Card */}
      {inlineState.type === 'none' && (
        <div className="flex flex-col gap-6">
          <div className="border border-border-default p-6 bg-bg-card flex flex-col gap-4">
            <h2 className="font-heading text-heading uppercase tracking-widest text-primary">Global Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="flex flex-col gap-2">
                <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Support Helpline Email</label>
                <input
                  type="email"
                  value={eventDetails.helplineEmail || ''}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, helplineEmail: e.target.value }))}
                  className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              onClick={handleSaveEventDetails}
              disabled={savingDetails}
              className="self-start font-button text-button px-6 py-2 border border-primary bg-primary text-bg-base hover:bg-transparent hover:text-primary transition-colors disabled:opacity-50 mt-2"
            >
              {savingDetails ? 'Saving...' : 'Save Global Details'}
            </button>
          </div>

          <div className="border border-border-default p-6 bg-bg-card flex flex-col gap-4">
            <h2 className="font-heading text-heading uppercase tracking-widest text-primary">UPI &amp; Payments Configuration</h2>
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
                  placeholder="e.g. /qr_code.jpg or URL link"
                  className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              onClick={handleSavePaymentDetails}
              disabled={savingPayments}
              className="self-start font-button text-button px-6 py-2 border border-primary bg-primary text-bg-base hover:bg-transparent hover:text-primary transition-colors disabled:opacity-50 mt-2"
            >
              {savingPayments ? 'Saving...' : 'Save Payment Details'}
            </button>
          </div>
        </div>
      )}

      {/* Form Area */}
      {inlineState.type !== 'none' && inlineState.type !== 'confirm-delete' && (
        <form
          onSubmit={(e) =>
            inlineState.type === 'create'
              ? handleCreate(e)
              : handleUpdate(e, (inlineState as { slotId: string }).slotId)
          }
          className="border border-border-default p-6 bg-bg-card flex flex-col gap-6"
        >
          <h2 className="font-heading text-heading uppercase tracking-widest text-primary">
            {inlineState.type === 'create' ? 'Create New Slot' : 'Edit Slot'}
          </h2>

          {error && (
            <div className="text-small text-red-500 font-body border border-red-900/30 bg-red-950/10 p-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Day</label>
              <input
                type="text"
                value={form.day}
                onChange={(e) => setField('day', e.target.value)}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
                placeholder="e.g. Day 1"
              />
            </div>


            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
                placeholder="e.g. Speed Typing - Prelims"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
                placeholder="e.g. Lab 3, CSE Block"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Sort Time (24h)</label>
              <input
                type="text"
                value={form.sortTime}
                onChange={(e) => setField('sortTime', e.target.value)}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
                placeholder="e.g. 09:30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Display Time</label>
              <input
                type="text"
                value={form.displayTime}
                onChange={(e) => setField('displayTime', e.target.value)}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
                placeholder="e.g. 09:30 AM - 11:00 AM"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Type</label>
              <select
                value={form.type}
                onChange={(e) => setField('type', e.target.value as ScheduleEventType)}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              >
                <option value="TECH">TECH</option>
                <option value="NON_TECH">NON-TECH</option>
                <option value="GENERAL">GENERAL</option>
                <option value="BREAK">BREAK</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-micro text-micro uppercase tracking-widest text-text-secondary">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setField('sortOrder', parseInt(e.target.value, 10) || 0)}
                className="bg-bg-elevated border border-border-default p-3 font-body text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="font-button text-button px-6 py-3 border border-primary bg-primary text-bg-base hover:bg-transparent hover:text-primary transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={closeState}
              className="font-button text-button px-6 py-3 border border-border-default text-text-secondary hover:text-primary hover:border-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation */}
      {inlineState.type === 'confirm-delete' && (
        <div className="border border-red-900/30 bg-red-950/5 p-6 flex flex-col gap-4">
          <h2 className="font-heading text-heading uppercase text-red-500">Confirm Deletion</h2>
          <p className="font-body text-body text-text-secondary">
            Are you sure you want to delete this schedule slot? This action is permanent.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleDelete((inlineState as { slotId: string }).slotId)}
              disabled={saving}
              className="font-button text-button px-6 py-3 border border-red-600 bg-red-600 text-white hover:bg-transparent hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={closeState}
              className="font-button text-button px-6 py-3 border border-border-default text-text-secondary hover:text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slots List */}
      <div className="flex flex-col gap-4">
        {slots.length === 0 ? (
          <p className="font-body text-body text-text-secondary">No schedule slots defined.</p>
        ) : (
          <div className="border border-border-default bg-bg-card overflow-hidden">
            <table className="w-full text-left font-body">
              <thead className="bg-bg-elevated border-b border-border-default font-micro text-micro uppercase tracking-widest text-text-muted">
                <tr>
                  <th className="p-4">Day</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default text-primary">
                {slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="p-4">
                      <div>{slot.day}</div>
                    </td>
                    <td className="p-4 font-mono">{slot.displayTime}</td>
                    <td className="p-4 font-semibold">{slot.title}</td>
                    <td className="p-4">{slot.location}</td>
                    <td className="p-4">
                      <span className="font-micro text-micro px-2 py-0.5 border border-border-default rounded">
                        {slot.type}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEdit(slot)}
                          className="text-text-secondary hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setInlineState({ type: 'confirm-delete', slotId: slot.id })}
                          className="text-text-secondary hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
