import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getAdminWhitelist, addAdmin, removeAdmin } from '../lib/firestore';
import type { AdminWhitelistEntry } from '../types';

type InlineState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'confirm-remove'; email: string };

export function AdminUsersPage() {
  console.log("[Mount] AdminUsersPage component loaded");
  const { adminEmail } = useAuth();
  const [entries, setEntries] = useState<AdminWhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [inlineState, setInlineState] = useState<InlineState>({ type: 'none' });
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const data = await getAdminWhitelist();
    setEntries(data);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));

    const handleGlobalReload = () => {
      reload();
    };
    window.addEventListener('spectrum26_reload_data', handleGlobalReload);
    return () => window.removeEventListener('spectrum26_reload_data', handleGlobalReload);
  }, [reload]);

  const closeState = () => { setInlineState({ type: 'none' }); setError(null); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSaving(true);
    try {
      await addAdmin(newEmail.trim().toLowerCase(), adminEmail ?? '');
      setNewEmail('');
      await reload();
      closeState();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to add admin.');
    } finally { setSaving(false); }
  };

  const handleRemove = async (email: string) => {
    setSaving(true);
    try {
      await removeAdmin(email, adminEmail ?? '');
      await reload();
      closeState();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to remove admin.');
    } finally { setSaving(false); }
  };

  const isSelf = (email: string) => email === adminEmail;

  if (loading) return <PageSkeleton />;

  return (
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-primary pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-hero text-[40px] leading-none uppercase tracking-widest text-primary">Admin Users</h1>
          <p className="font-body text-small text-text-secondary max-w-lg">
            Google accounts listed here can complete step 2 of the admin gate. You are currently signed in as <strong>{adminEmail}</strong>.
          </p>
        </div>
        <button
          onClick={inlineState.type === 'add' ? closeState : () => setInlineState({ type: 'add' })}
          className="flex items-center gap-2 font-button text-button uppercase bg-primary text-bg-base px-5 py-3 hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> Add Admin
        </button>
      </div>

      {/* ── Inline: Add form ── */}
      {inlineState.type === 'add' && (
        <form
          onSubmit={handleAdd}
          className="expand-in border-l-4 border-primary pl-6 flex flex-col gap-4 py-2"
        >
          <p className="font-micro text-micro text-text-muted uppercase tracking-widest">New Admin Email</p>
          <div className="flex gap-3 items-center">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@example.com"
              className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all flex-1"
            />
            <button
              type="button"
              onClick={closeState}
              className="px-4 py-3 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70"
            >Cancel</button>
            <button
              type="submit"
              disabled={saving || !newEmail}
              className="px-6 py-3 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Add
            </button>
          </div>
          {error && <p className="font-body text-small text-text-secondary">{error}</p>}
        </form>
      )}

      {/* Whitelist table */}
      <div className="flex flex-col divide-y border-b border-border-default">
        {entries.length === 0 && (
          <p className="font-body text-body text-text-muted py-8">No admins on the whitelist yet.</p>
        )}
        {entries.map((entry) => {
          const isRemoveOpen = inlineState.type === 'confirm-remove' && inlineState.email === entry.email;
          const self = isSelf(entry.email);

          return (
            <div key={entry.email}>
              <div className="flex flex-wrap md:flex-nowrap items-center gap-6 py-5 px-6">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-heading text-heading text-primary">{entry.email}</span>
                    {self && (
                      <span className="font-micro text-micro text-text-muted border border-dashed border-border-default px-2 py-0.5 uppercase tracking-widest">
                        You
                      </span>
                    )}
                  </div>
                  <span className="font-body text-small text-text-muted">
                    Added by {entry.addedBy} · {entry.addedAt.toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() =>
                    isRemoveOpen
                      ? closeState()
                      : setInlineState({ type: 'confirm-remove', email: entry.email })
                  }
                  className="p-2 border border-border-default hover:border-primary text-text-secondary hover:text-primary transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* ── Inline: Remove confirm ── */}
              {isRemoveOpen && (
                <div className="expand-in border-l-4 border-primary pl-6 pb-6 flex flex-col gap-4">
                  {self && (
                    <div className="flex items-center gap-3 p-3 border border-dashed border-border-default font-body text-small text-text-secondary">
                      <AlertTriangle size={16} className="shrink-0" />
                      <strong>Warning:</strong> You are removing yourself. You will lose admin access immediately.
                    </div>
                  )}
                  <p className="font-body text-body text-text-secondary">
                    Remove <strong>{entry.email}</strong> from the admin whitelist?
                  </p>
                  {error && <p className="font-body text-small text-text-secondary">{error}</p>}
                  <div className="flex gap-3">
                    <button onClick={closeState} className="px-4 py-2 border border-border-default text-text-secondary font-button text-button uppercase hover:opacity-70">Cancel</button>
                    <button
                      onClick={() => handleRemove(entry.email)}
                      disabled={saving}
                      className="px-6 py-2 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />} Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function PageSkeleton() {
  return (
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      <div className="skeleton h-12 w-48 rounded border-b-2 border-primary pb-6" style={{ background: 'var(--color-bg-card)' }} />
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full rounded" style={{ background: 'var(--color-bg-card)' }} />)}
      </div>
    </main>
  );
}
