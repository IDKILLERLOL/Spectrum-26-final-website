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
    <main className="">
      {/* Header */}
      <div className="">
        <div className="">
          <h1 className="">Admin Users</h1>
          <p className="">
            Google accounts listed here can complete step 2 of the admin gate. You are currently signed in as <strong>{adminEmail}</strong>.
          </p>
        </div>
        <button
          onClick={inlineState.type === 'add' ? closeState : () => setInlineState({ type: 'add' })}
          className=""
        >
          <Plus size={14} /> Add Admin
        </button>
      </div>

      {/* ── Inline: Add form ── */}
      {inlineState.type === 'add' && (
        <form
          onSubmit={handleAdd}
          className=""
        >
          <p className="">New Admin Email</p>
          <div className="">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@example.com"
              className=""
            />
            <button
              type="button"
              onClick={closeState}
              className=""
            >Cancel</button>
            <button
              type="submit"
              disabled={saving || !newEmail}
              className=""
            >
              {saving && <Loader2 size={14} className="" />} Add
            </button>
          </div>
          {error && <p className="">{error}</p>}
        </form>
      )}

      {/* Whitelist table */}
      <div className="">
        {entries.length === 0 && (
          <p className="">No admins on the whitelist yet.</p>
        )}
        {entries.map((entry) => {
          const isRemoveOpen = inlineState.type === 'confirm-remove' && inlineState.email === entry.email;
          const self = isSelf(entry.email);

          return (
            <div key={entry.email}>
              <div className="">
                <div className="">
                  <div className="">
                    <span className="">{entry.email}</span>
                    {self && (
                      <span className="">
                        You
                      </span>
                    )}
                  </div>
                  <span className="">
                    Added by {entry.addedBy} · {entry.addedAt.toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() =>
                    isRemoveOpen
                      ? closeState()
                      : setInlineState({ type: 'confirm-remove', email: entry.email })
                  }
                  className=""
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* ── Inline: Remove confirm ── */}
              {isRemoveOpen && (
                <div className="">
                  {self && (
                    <div className="">
                      <AlertTriangle size={16} className="" />
                      <strong>Warning:</strong> You are removing yourself. You will lose admin access immediately.
                    </div>
                  )}
                  <p className="">
                    Remove <strong>{entry.email}</strong> from the admin whitelist?
                  </p>
                  {error && <p className="">{error}</p>}
                  <div className="">
                    <button onClick={closeState} className="">Cancel</button>
                    <button
                      onClick={() => handleRemove(entry.email)}
                      disabled={saving}
                      className=""
                    >
                      {saving && <Loader2 size={14} className="" />} Remove
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
    <main className="">
      <div className="" style={{ background: 'var(--color-bg-card)' }} />
      <div className="">
        {[1, 2, 3].map((i) => <div key={i} className="" style={{ background: 'var(--color-bg-card)' }} />)}
      </div>
    </main>
  );
}
