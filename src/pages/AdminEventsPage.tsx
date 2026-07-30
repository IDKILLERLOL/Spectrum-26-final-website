import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getEvents, createEvent, updateEvent, deleteEvent,
} from '../lib/firestore';
import type { Event } from '../types';
import { categoryLabel } from '../types';

type InlineState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; eventId: string }
  | { type: 'confirm-delete'; eventId: string };

type EventFormData = Omit<Event, 'id' | 'currentTeamCount'>;

const EMPTY_FORM: EventFormData = {
  name: '',
  category: 'TECH',
  isTeamEvent: false,
  maxTeams: null,
  registrationOpen: false,
  price: null,
  description: '',
  rulesUrl: null,
  minMembers: 1,
  maxMembers: 1,
};

export function AdminEventsPage() {
  const { adminEmail } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [inlineState, setInlineState] = useState<InlineState>({ type: 'none' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);

  const reload = useCallback(async () => {
    const evs = await getEvents();
    setEvents(evs);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));

    const handleGlobalReload = () => {
      reload();
    };
    window.addEventListener('spectrum26_reload_data', handleGlobalReload);
    return () => window.removeEventListener('spectrum26_reload_data', handleGlobalReload);
  }, [reload]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setInlineState({ type: 'create' });
  };

  const openEdit = (event: Event) => {
    setForm({
      name: event.name,
      category: event.category,
      isTeamEvent: event.isTeamEvent,
      maxTeams: event.maxTeams,
      registrationOpen: event.registrationOpen,
      price: event.price,
      description: event.description,
      rulesUrl: event.rulesUrl,
      minMembers: event.minMembers,
      maxMembers: event.maxMembers,
    });
    setError(null);
    setInlineState({ type: 'edit', eventId: event.id });
  };

  const closeState = () => { setInlineState({ type: 'none' }); setError(null); };

  const setField = (k: keyof EventFormData, v: EventFormData[keyof EventFormData]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ─── Create ────────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const data = { ...form };
      if (data.isTeamEvent) {
        const minVal = typeof data.minMembers === 'string' ? parseInt(data.minMembers) : data.minMembers;
        if (!minVal || isNaN(minVal)) {
          data.minMembers = data.maxMembers;
        } else {
          data.minMembers = minVal;
        }
      }
      await createEvent(data, adminEmail ?? '');
      await reload();
      closeState();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create event.');
    } finally { setSaving(false); }
  };

  // ─── Update ────────────────────────────────────────────────────────────────

  const handleUpdate = async (e: React.FormEvent, eventId: string, event: Event) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      // Category/type lock: if teams already registered, block category + isTeamEvent changes
      const patch: Partial<EventFormData> = { ...form };
      if (event.currentTeamCount > 0) {
        if (patch.category !== event.category || patch.isTeamEvent !== event.isTeamEvent) {
          setError('Cannot change category or event type after teams have registered.');
          setSaving(false);
          return;
        }
      }
      if (patch.isTeamEvent) {
        const minVal = typeof patch.minMembers === 'string' ? parseInt(patch.minMembers) : patch.minMembers;
        if (!minVal || isNaN(minVal)) {
          patch.minMembers = patch.maxMembers;
        } else {
          patch.minMembers = minVal;
        }
      }
      await updateEvent(eventId, patch, adminEmail ?? '');
      await reload();
      closeState();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update event.');
    } finally { setSaving(false); }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (eventId: string) => {
    setSaving(true);
    try {
      await deleteEvent(eventId, adminEmail ?? '');
      await reload();
      closeState();
    } catch (err: unknown) {
      setError((err as Error).message || 'Cannot delete: teams are registered for this event.');
    } finally { setSaving(false); }
  };

  const techEvents = events.filter((e) => e.category === 'TECH');
  const nonTechEvents = events.filter((e) => e.category === 'NON_TECH');

  if (loading) return <AdminPageSkeleton />;

  return (
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-primary pb-6">
        <h1 className="font-hero text-[40px] leading-none uppercase tracking-widest text-primary">Events</h1>
        <button
          onClick={inlineState.type === 'create' ? closeState : openCreate}
          className="flex items-center gap-2 font-button text-button uppercase bg-primary text-bg-base px-5 py-3 hover:opacity-90 transition-opacity"
        >
          {inlineState.type === 'create' ? <ChevronUp size={14} /> : <Plus size={14} />}
          {inlineState.type === 'create' ? 'Cancel' : 'New Event'}
        </button>
      </div>

      {/* ── Inline: Create event form ── */}
      {inlineState.type === 'create' && (
        <form
          onSubmit={handleCreate}
          className="expand-in border-l-4 border-primary pl-6 flex flex-col gap-6 py-4"
        >
          <p className="font-micro text-micro text-text-muted uppercase tracking-widest">New Event</p>
          <EventFormFields form={form} setField={setField} isNew />
          {error && <p className="font-body text-small text-text-secondary border border-dashed border-border-default px-4 py-3">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={closeState} className="px-5 py-3 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70 transition-opacity">Cancel</button>
            <button type="submit" disabled={saving} className="px-8 py-3 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />} Create
            </button>
          </div>
        </form>
      )}

      {/* TECH events */}
      {[
        { label: 'TECH EVENTS', evs: techEvents },
        { label: 'NON-TECH EVENTS', evs: nonTechEvents },
      ].map(({ label, evs }) => (
        <div key={label} className="flex flex-col gap-2">
          <h2 className="font-hero text-[22px] leading-none uppercase tracking-widest text-primary border-b border-border-default pb-3">
            {label}
          </h2>

          {evs.length === 0 && (
            <p className="font-body text-body text-text-muted py-4">None yet.</p>
          )}

          {evs.map((event) => {
            const isEditOpen = inlineState.type === 'edit' && inlineState.eventId === event.id;
            const isDeleteOpen = inlineState.type === 'confirm-delete' && inlineState.eventId === event.id;
            const hasTeams = event.currentTeamCount > 0;

            return (
              <div key={event.id} className="border border-border-default" style={{ borderStyle: event.category === 'TECH' ? 'solid' : 'dashed' }}>
                {/* Event summary row */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4">
                  <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <span className="font-heading text-card-title text-primary uppercase">{event.name}</span>
                    <div className="flex flex-wrap gap-3 font-micro text-micro text-text-muted uppercase tracking-widest">
                      <span>{event.isTeamEvent ? `Team (${event.minMembers}-${event.maxMembers} members)` : 'Solo'}</span>
                      <span>·</span>
                      <span>{event.price != null ? `₹${event.price}` : 'Free/TBA'}</span>
                      <span>·</span>
                      <span>{event.currentTeamCount}{event.maxTeams ? `/${event.maxTeams}` : ''} teams</span>
                      <span>·</span>
                      <span className={event.registrationOpen ? 'text-primary' : ''}>
                        {event.registrationOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => isEditOpen ? closeState() : openEdit(event)}
                      className="p-2 border border-border-default hover:border-primary text-text-secondary hover:text-primary transition-colors"
                    >
                      {isEditOpen ? <ChevronUp size={16} /> : <Pencil size={16} />}
                    </button>
                    <button
                      onClick={() => isDeleteOpen ? closeState() : setInlineState({ type: 'confirm-delete', eventId: event.id })}
                      disabled={hasTeams}
                      title={hasTeams ? 'Cannot delete — teams are registered' : 'Delete event'}
                      className="p-2 border border-border-default hover:border-primary text-text-secondary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {hasTeams ? <Lock size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>

                {/* ── Inline: Edit form ── */}
                {isEditOpen && (
                  <form
                    onSubmit={(e) => handleUpdate(e, event.id, event)}
                    className="expand-in border-t border-border-default px-6 py-6 flex flex-col gap-6 bg-bg-elevated"
                  >
                    <div className="flex items-center gap-3">
                      <p className="font-micro text-micro text-text-muted uppercase tracking-widest">Edit Event</p>
                      {hasTeams && (
                        <span className="flex items-center gap-1 font-micro text-micro text-text-muted border border-dashed border-border-default px-2 py-0.5 uppercase">
                          <Lock size={10} /> Category &amp; type locked ({event.currentTeamCount} teams registered)
                        </span>
                      )}
                    </div>
                    <EventFormFields form={form} setField={setField} isNew={false} categoryLocked={hasTeams} />
                    {error && <p className="font-body text-small text-text-secondary border border-dashed border-border-default px-4 py-3">{error}</p>}
                    <div className="flex gap-3">
                      <button type="button" onClick={closeState} className="px-5 py-3 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70">Cancel</button>
                      <button type="submit" disabled={saving} className="px-8 py-3 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                        {saving && <Loader2 size={14} className="animate-spin" />} Save
                      </button>
                    </div>
                  </form>
                )}

                {/* ── Inline: Delete confirm ── */}
                {isDeleteOpen && (
                  <div className="expand-in border-t border-border-default px-6 py-6 bg-bg-elevated flex flex-col gap-4">
                    <p className="font-body text-body text-text-secondary">
                      Permanently delete <strong>{event.name}</strong>? This cannot be undone.
                    </p>
                    {error && <p className="font-body text-small text-text-secondary">{error}</p>}
                    <div className="flex gap-3">
                      <button onClick={closeState} className="px-5 py-3 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70">Cancel</button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={saving}
                        className="px-8 py-3 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving && <Loader2 size={14} className="animate-spin" />} Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </main>
  );
}

// ─── Event form fields (shared for create and edit) ───────────────────────────

function EventFormFields({
  form,
  setField,
  isNew,
  categoryLocked = false,
}: {
  form: EventFormData;
  setField: (k: keyof EventFormData, v: EventFormData[keyof EventFormData]) => void;
  isNew: boolean;
  categoryLocked?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Name */}
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Event Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          required
          placeholder="e.g. Code Prism"
          className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="font-micro text-micro text-text-muted uppercase tracking-widest flex items-center gap-2">
          Category {categoryLocked && <Lock size={10} />}
        </label>
        <select
          value={form.category}
          onChange={(e) => setField('category', e.target.value as 'TECH' | 'NON_TECH')}
          disabled={categoryLocked}
          className="bg-bg-base border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all disabled:opacity-40"
        >
          <option value="TECH">TECH</option>
          <option value="NON_TECH">NON-TECH</option>
        </select>
      </div>

      {/* Team / Solo */}
      <div className="flex flex-col gap-2">
        <label className="font-micro text-micro text-text-muted uppercase tracking-widest flex items-center gap-2">
          Format {categoryLocked && <Lock size={10} />}
        </label>
        <select
          value={form.isTeamEvent ? 'team' : 'solo'}
          onChange={(e) => {
            const isTeam = e.target.value === 'team';
            setField('isTeamEvent', isTeam);
            if (!isTeam) {
              setField('minMembers', 1);
              setField('maxMembers', 1);
            } else {
              setField('minMembers', 2);
              setField('maxMembers', 4);
            }
          }}
          disabled={categoryLocked}
          className="bg-bg-base border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all disabled:opacity-40"
        >
          <option value="solo">Solo</option>
          <option value="team">Team</option>
        </select>
      </div>

      {/* Min members */}
      {form.isTeamEvent && (
        <div className="flex flex-col gap-2">
          <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Min Team Members (optional)</label>
          <input
            type="number"
            min={2}
            value={form.minMembers || ''}
            onChange={(e) => setField('minMembers', e.target.value === '' ? '' : parseInt(e.target.value))}
            className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      )}

      {/* Max members */}
      {form.isTeamEvent && (
        <div className="flex flex-col gap-2">
          <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Max Team Members *</label>
          <input
            type="number"
            min={2}
            value={form.maxMembers || ''}
            onChange={(e) => setField('maxMembers', e.target.value === '' ? '' : parseInt(e.target.value))}
            required
            className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      )}

      {/* Max teams */}
      <div className="flex flex-col gap-2">
        <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Max Teams (blank = no cap)</label>
        <input
          type="number"
          min={0}
          value={form.maxTeams ?? ''}
          onChange={(e) => setField('maxTeams', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="No cap"
          className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-2">
        <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Price ₹ (blank = TBA)</label>
        <input
          type="number"
          min={0}
          value={form.price ?? ''}
          onChange={(e) => setField('price', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="TBA"
          className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={3}
          className="bg-transparent border border-border-strong text-primary font-body text-body p-3 focus:outline-none focus:border-primary transition-all resize-none"
        />
      </div>

      {/* Rules URL */}
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Rules URL (optional)</label>
        <input
          type="url"
          value={form.rulesUrl ?? ''}
          onChange={(e) => setField('rulesUrl', e.target.value || null)}
          placeholder="https://..."
          className="bg-transparent border-b-2 border-border-strong text-primary font-body text-body py-2 focus:outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Registration open toggle */}
      <div className="flex items-center gap-4">
        <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Registration Open</label>
        <button
          type="button"
          role="switch"
          aria-checked={form.registrationOpen}
          onClick={() => setField('registrationOpen', !form.registrationOpen)}
          className="w-12 h-6 border-2 border-primary relative transition-colors flex items-center"
          style={{ background: form.registrationOpen ? 'var(--color-text-primary)' : 'transparent' }}
        >
          <span
            className="absolute w-4 h-4 transition-all duration-200"
            style={{
              background: form.registrationOpen ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
              left: form.registrationOpen ? 'calc(100% - 1.25rem)' : '0.125rem',
            }}
          />
        </button>
        <span className="font-body text-small text-primary">{form.registrationOpen ? 'Yes' : 'No'}</span>
      </div>
    </div>
  );
}

function AdminPageSkeleton() {
  return (
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      <div className="border-b-2 border-primary pb-6">
        <div className="skeleton h-12 w-40 rounded" style={{ background: 'var(--color-bg-card)' }} />
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-20 w-full rounded" style={{ background: 'var(--color-bg-card)', animationDelay: `${i * 0.1}s` }} />)}
      </div>
    </main>
  );
}
