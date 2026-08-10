import { useState, useEffect, useCallback, FormEvent } from 'react';
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
  roundDetails: [],
  oneLineDescription: '',
  shortDescription: '',
};

export function AdminEventsPage() {
  console.log("[Mount] AdminEventsPage component loaded");
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
      roundDetails: event.roundDetails || [],
      oneLineDescription: event.oneLineDescription || '',
      shortDescription: event.shortDescription || '',
    });
    setError(null);
    setInlineState({ type: 'edit', eventId: event.id });
  };

  const closeState = () => { setInlineState({ type: 'none' }); setError(null); };

  const setField = (k: keyof EventFormData, v: EventFormData[keyof EventFormData]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ─── Create ────────────────────────────────────────────────────────────────

  const handleCreate = async (e: FormEvent) => {
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
      closeState();
      reload().catch(console.error);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create event.');
    } finally { setSaving(false); }
  };

  // ─── Update ────────────────────────────────────────────────────────────────

  const handleUpdate = async (e: FormEvent, eventId: string, event: Event) => {
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
      closeState();
      reload().catch(console.error);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update event.');
    } finally { setSaving(false); }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (eventId: string) => {
    setSaving(true);
    try {
      await deleteEvent(eventId, adminEmail ?? '');
      closeState();
      reload().catch(console.error);
    } catch (err: unknown) {
      setError((err as Error).message || 'Cannot delete: teams are registered for this event.');
    } finally { setSaving(false); }
  };

  const techEvents = events.filter((e) => e.category === 'TECH');
  const nonTechEvents = events.filter((e) => e.category === 'NON_TECH');

  if (loading) return <AdminPageSkeleton />;

  return (
    <main className="">
      {/* Header */}
      <div className="">
        <h1 className="">Events</h1>
        <button
          onClick={inlineState.type === 'create' ? closeState : openCreate}
          className=""
        >
          {inlineState.type === 'create' ? <ChevronUp size={14} /> : <Plus size={14} />}
          {inlineState.type === 'create' ? 'Cancel' : 'New Event'}
        </button>
      </div>

      {/* ── Inline: Create event form ── */}
      {inlineState.type === 'create' && (
        <form
          onSubmit={handleCreate}
          className=""
        >
          <p className="">New Event</p>
          <EventFormFields form={form} setField={setField} isNew />
          {error && <p className="">{error}</p>}
          <div className="">
            <button type="button" onClick={closeState} className="">Cancel</button>
            <button type="submit" disabled={saving} className="">
              {saving && <Loader2 size={14} className="" />} Create
            </button>
          </div>
        </form>
      )}

      {/* TECH events */}
      {[
        { label: 'TECH EVENTS', evs: techEvents },
        { label: 'NON-TECH EVENTS', evs: nonTechEvents },
      ].map(({ label, evs }) => (
        <div key={label} className="">
          <h2 className="">
            {label}
          </h2>

          {evs.length === 0 && (
            <p className="">None yet.</p>
          )}

          {evs.map((event) => {
            const isEditOpen = inlineState.type === 'edit' && inlineState.eventId === event.id;
            const isDeleteOpen = inlineState.type === 'confirm-delete' && inlineState.eventId === event.id;
            const hasTeams = event.currentTeamCount > 0;

            return (
              <div key={event.id} className="" style={{ borderStyle: 'none' }}>
                {/* Event summary row */}
                <div className="">
                  <div className="">
                    <span className="">{event.name}</span>
                    <div className="">
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
                  <div className="">
                    <button
                      onClick={() => isEditOpen ? closeState() : openEdit(event)}
                      className=""
                    >
                      {isEditOpen ? <ChevronUp size={16} /> : <Pencil size={16} />}
                    </button>
                    <button
                      onClick={() => isDeleteOpen ? closeState() : setInlineState({ type: 'confirm-delete', eventId: event.id })}
                      disabled={hasTeams}
                      title={hasTeams ? 'Cannot delete — teams are registered' : 'Delete event'}
                      className=""
                    >
                      {hasTeams ? <Lock size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>

                {/* ── Inline: Edit form ── */}
                {isEditOpen && (
                  <form
                    onSubmit={(e) => handleUpdate(e, event.id, event)}
                    className=""
                  >
                    <div className="">
                      <p className="">Edit Event</p>
                      {hasTeams && (
                        <span className="">
                          <Lock size={10} /> Category &amp; type locked ({event.currentTeamCount} teams registered)
                        </span>
                      )}
                    </div>
                    <EventFormFields form={form} setField={setField} isNew={false} categoryLocked={hasTeams} />
                    {error && <p className="">{error}</p>}
                    <div className="">
                      <button type="button" onClick={closeState} className="">Cancel</button>
                      <button type="submit" disabled={saving} className="">
                        {saving && <Loader2 size={14} className="" />} Save
                      </button>
                    </div>
                  </form>
                )}

                {/* ── Inline: Delete confirm ── */}
                {isDeleteOpen && (
                  <div className="">
                    <p className="">
                      Permanently delete <strong>{event.name}</strong>? This cannot be undone.
                    </p>
                    {error && <p className="">{error}</p>}
                    <div className="">
                      <button onClick={closeState} className="">Cancel</button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={saving}
                        className=""
                      >
                        {saving && <Loader2 size={14} className="" />} Delete
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
    <div className="">
      {/* Name */}
      <div className="">
        <label className="">Event Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          required
          placeholder="e.g. Code Prism"
          className=""
        />
      </div>

      {/* Category */}
      <div className="">
        <label className="">
          Category {categoryLocked && <Lock size={10} />}
        </label>
        <select
          value={form.category}
          onChange={(e) => setField('category', e.target.value as 'TECH' | 'NON_TECH')}
          disabled={categoryLocked}
          className=""
        >
          <option value="TECH">TECH</option>
          <option value="NON_TECH">NON-TECH</option>
        </select>
      </div>

      {/* Team / Solo / Duo */}
      <div className="">
        <label className="">
          Format {categoryLocked && <Lock size={10} />}
        </label>
        <select
          value={form.isTeamEvent ? (form.maxMembers === 2 ? 'duo' : 'team') : 'solo'}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'solo') {
              setField('isTeamEvent', false);
              setField('minMembers', 1);
              setField('maxMembers', 1);
            } else if (val === 'duo') {
              setField('isTeamEvent', true);
              setField('minMembers', 2);
              setField('maxMembers', 2);
            } else {
              setField('isTeamEvent', true);
              setField('minMembers', 3);
              setField('maxMembers', 4);
            }
          }}
          disabled={categoryLocked}
          className=""
        >
          <option value="solo">Solo</option>
          <option value="duo">Duo</option>
          <option value="team">Team (3+)</option>
        </select>
      </div>

      {/* Min members */}
      {form.isTeamEvent && (
        <div className="">
          <label className="">Min Team Members (optional)</label>
          <input
            type="number"
            min={2}
            value={form.minMembers || ''}
            onChange={(e) => setField('minMembers', e.target.value === '' ? '' : parseInt(e.target.value))}
            className=""
          />
        </div>
      )}

      {/* Max members */}
      {form.isTeamEvent && (
        <div className="">
          <label className="">Max Team Members *</label>
          <input
            type="number"
            min={2}
            value={form.maxMembers || ''}
            onChange={(e) => setField('maxMembers', e.target.value === '' ? '' : parseInt(e.target.value))}
            required
            className=""
          />
        </div>
      )}

      {/* Max teams */}
      <div className="">
        <label className="">Max Teams (blank = no cap)</label>
        <input
          type="number"
          min={0}
          value={form.maxTeams ?? ''}
          onChange={(e) => setField('maxTeams', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="No cap"
          className=""
        />
      </div>

      {/* Price */}
      <div className="">
        <label className="">Price ₹ (blank = TBA)</label>
        <input
          type="number"
          min={0}
          value={form.price ?? ''}
          onChange={(e) => setField('price', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="TBA"
          className=""
        />
      </div>

      {/* One Line Description */}
      <div className="">
        <label className="">One Line Description (home page, no hover)</label>
        <input
          type="text"
          value={form.oneLineDescription || ''}
          onChange={(e) => setField('oneLineDescription', e.target.value)}
          placeholder="e.g. The ultimate duo coding face-off."
          className=""
        />
      </div>

      {/* Short Description */}
      <div className="">
        <label className="">Short Description (home page, hover)</label>
        <textarea
          value={form.shortDescription || ''}
          onChange={(e) => setField('shortDescription', e.target.value)}
          rows={2}
          placeholder="e.g. Battle in Codopoly, Swap Challenge, and Snakes & Ladders Challenges."
          className=""
        />
      </div>

      {/* Description */}
      <div className="">
        <label className="">Long Description (details page)</label>
        <textarea
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={3}
          className=""
        />
      </div>

      {/* Rules URL */}
      <div className="">
        <label className="">Rules URL (optional)</label>
        <input
          type="url"
          value={form.rulesUrl ?? ''}
          onChange={(e) => setField('rulesUrl', e.target.value || null)}
          placeholder="https://..."
          className=""
        />
      </div>

      {/* Round Details */}
      <div className="">
        <label className="">Round Details / Sub-Events (one per line)</label>
        <textarea
          value={(form.roundDetails || []).join('\n')}
          onChange={(e) => setField('roundDetails', e.target.value.split('\n').filter(line => line.trim() !== ''))}
          rows={4}
          placeholder="Sub-Event 1: Codopoly — CS topic board game..."
          className=""
        />
      </div>

      {/* Registration open toggle */}
      <div className="">
        <label className="">Registration Open</label>
        <button
          type="button"
          role="switch"
          aria-checked={form.registrationOpen}
          onClick={() => setField('registrationOpen', !form.registrationOpen)}
          className=""
          style={{ background: form.registrationOpen ? 'var(--color-text-primary)' : 'transparent' }}
        >
          <span
            className=""
            style={{
              background: form.registrationOpen ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
              left: form.registrationOpen ? 'calc(100% - 1.25rem)' : '0.125rem',
            }}
          />
        </button>
        <span className="">{form.registrationOpen ? 'Yes' : 'No'}</span>
      </div>
    </div>
  );
}

function AdminPageSkeleton() {
  return (
    <main className="">
      <div className="">
        <div className="" style={{ background: 'var(--color-bg-card)' }} />
      </div>
      <div className="">
        {[1, 2, 3, 4].map((i) => <div key={i} className="" style={{ background: 'var(--color-bg-card)', animationDelay: `${i * 0.1}s` }} />)}
      </div>
    </main>
  );
}
