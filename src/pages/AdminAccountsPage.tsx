import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, UserMinus, Trash2, ShieldAlert } from 'lucide-react';
import { getAllUsers, getAllRegistrations, deleteUserDoc, db } from '../lib/firestore';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { useAuth } from '../lib/useAuth';
import type { User as DbUser } from '../types';

export function AdminAccountsPage() {
  const { adminEmail } = useAuth();
  const [users, setUsers] = useState<DbUser[]>([]);
  const [unregisteredUsers, setUnregisteredUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [selectedRegStatus, setSelectedRegStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<DbUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reload = async () => {
    try {
      const [allUsers, allRegs] = await Promise.all([
        getAllUsers(),
        getAllRegistrations(),
      ]);

      const teamMembersSnap = await getDocs(
        query(collection(db, 'teamMembers'), where('status', '==', 'ACTIVE'))
      );

      const registeredUserIds = new Set<string>();
      
      // Collect IDs of leaders
      allRegs.forEach((reg) => {
        if (reg.leaderId) {
          registeredUserIds.add(reg.leaderId);
        }
      });

      // Collect IDs of team members
      teamMembersSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.userId) {
          registeredUserIds.add(data.userId);
        }
      });

      // Filter users who are not registered anywhere
      const filtered = allUsers.filter((u) => !registeredUserIds.has(u.id));
      setUsers(allUsers);
      setUnregisteredUsers(filtered);
    } catch (err) {
      console.error('[AdminAccountsPage] Error loading data:', err);
    }
  };

  useEffect(() => {
    reload().finally(() => setLoading(false));
    
    const handleGlobalReload = () => {
      reload();
    };
    window.addEventListener('spectrum26_reload_data', handleGlobalReload);
    return () => window.removeEventListener('spectrum26_reload_data', handleGlobalReload);
  }, []);

  const handleDelete = async (uid: string) => {
    setDeleting(true);
    try {
      await deleteUserDoc(uid, adminEmail ?? 'admin');
      setConfirmDeleteUser(null);
      await reload();
    } catch (err) {
      console.error('[AdminAccountsPage] Error deleting user:', err);
    } finally {
      setDeleting(false);
    }
  };

  const unregisteredIds = useMemo(() => new Set(unregisteredUsers.map((u) => u.id)), [unregisteredUsers]);

  const filteredList = useMemo(() => {
    const queryStr = filterText.toLowerCase().trim();
    let result = users;

    // 1. Search text filter
    if (queryStr) {
      result = result.filter((u) => {
        return (
          u.name.toLowerCase().includes(queryStr) ||
          u.email.toLowerCase().includes(queryStr) ||
          (u.college && u.college.toLowerCase().includes(queryStr))
        );
      });
    }

    // 2. Registration status filter
    if (selectedRegStatus === 'registered') {
      result = result.filter((u) => !unregisteredIds.has(u.id));
    } else if (selectedRegStatus === 'unregistered') {
      result = result.filter((u) => unregisteredIds.has(u.id));
    }

    // 3. Sorting
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'date-desc':
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
        case 'date-asc':
          return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
        case 'email-asc':
          return (a.email || '').localeCompare(b.email || '');
        case 'college-asc':
          return (a.college || '').localeCompare(b.college || '');
        default:
          return 0;
      }
    });
  }, [users, unregisteredIds, filterText, selectedRegStatus, sortBy]);

  if (loading) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-bg-base px-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-primary" />
          <span className="font-heading text-heading text-text-secondary uppercase tracking-widest">
            Loading accounts...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-primary pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-hero text-[40px] leading-none uppercase tracking-widest text-primary">
            Accounts
          </h1>
          <p className="font-body text-small text-text-secondary max-w-lg">
            Manage all registered and unregistered participant accounts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-heading font-heading bg-bg-card border border-border-default px-4 py-2 text-text-secondary uppercase text-[12px] tracking-wider">
          <UserMinus size={14} className="text-primary" />
          <span>{filteredList.length} of {users.length} Accounts Shown</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="font-micro text-micro text-text-muted uppercase">Search</label>
          <div className="flex items-center gap-3 border border-border-default px-4 py-2 bg-bg-card">
            <Search size={16} className="text-text-muted shrink-0" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Name, email, college..."
              className="bg-transparent text-primary font-body text-body focus:outline-none flex-1 placeholder:text-text-muted text-small"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-micro text-micro text-text-muted uppercase">Filter by status</label>
          <select
            value={selectedRegStatus}
            onChange={(e) => setSelectedRegStatus(e.target.value)}
            className="bg-bg-card border border-border-default px-4 py-2 text-primary font-body text-small focus:outline-none focus:border-primary w-full"
          >
            <option value="all">All Accounts</option>
            <option value="registered">Registered Only</option>
            <option value="unregistered">Unregistered Only</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-micro text-micro text-text-muted uppercase">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-bg-card border border-border-default px-4 py-2 text-primary font-body text-small focus:outline-none focus:border-primary w-full"
          >
            <option value="date-desc">Joined (Newest First)</option>
            <option value="date-asc">Joined (Oldest First)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="college-asc">College (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {filteredList.length === 0 ? (
        <div className="border border-dashed border-border-default p-12 text-center">
          <span className="font-body text-body text-text-muted italic">
            No matching accounts found.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((u) => {
            const isRegistered = !unregisteredIds.has(u.id);
            return (
              <div
                key={u.id}
                className="bg-bg-card border border-border-default p-6 flex flex-col gap-4 shadow-md hover:border-primary/50 transition-colors relative"
              >
                <div className="flex justify-between items-start gap-2 border-b border-border-subtle/30 pb-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-heading text-primary uppercase truncate">{u.name || 'Anonymous User'}</span>
                      <span className={`font-micro text-[10px] border px-2 py-0.5 uppercase tracking-wider font-bold shrink-0 ${
                        isRegistered 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {isRegistered ? 'Registered' : 'Unregistered'}
                      </span>
                    </div>
                    <span className="font-mono text-small text-text-secondary truncate">{u.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteUser(u)}
                    className="p-2 border border-border-default text-text-muted hover:border-red-500 hover:text-red-500 transition-colors shrink-0"
                    aria-label="Delete Account"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              <div className="flex flex-col gap-2 font-body text-small">
                {u.phone && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-text-muted">Phone:</span>
                    <span className="text-text-primary font-mono">{u.phone}</span>
                  </div>
                )}
                {u.college && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-text-muted shrink-0">College:</span>
                    <span className="text-text-primary text-right truncate max-w-[160px]">{u.college}</span>
                  </div>
                )}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-text-muted">Auth:</span>
                  <span className="text-text-primary uppercase text-micro px-2 py-0.5 border border-border-default tracking-wide font-semibold">
                    {u.authMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-text-muted">Joined:</span>
                  <span className="text-text-primary text-micro">
                    {u.createdAt.toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Delete User Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-[#121212] border border-white/10 max-w-md w-full p-8 flex flex-col gap-6 shadow-2xl text-left rounded-none">
            <div className="flex items-center gap-3 text-white">
              <ShieldAlert size={28} className="text-white shrink-0" />
              <h3 className="font-heading text-card-title uppercase tracking-wide font-bold">DELETE ACCOUNT</h3>
            </div>
            
            <div className="h-px bg-white/10 w-full" />
            
            <p className="font-body text-body leading-relaxed text-white/60">
              Are you sure you want to delete user account for <strong>{confirmDeleteUser.name || confirmDeleteUser.email}</strong>? 
              This will remove their profile record from database. This action is **irreversible**.
            </p>

            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                disabled={deleting}
                className="flex-1 py-3 border border-white/20 bg-transparent text-white font-button uppercase hover:bg-white/5 active:scale-95 transition-all text-center tracking-wider text-sm font-semibold rounded-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteUser.id)}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white font-button uppercase hover:bg-red-700 active:scale-95 transition-all text-center font-bold tracking-wider text-sm rounded-none disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
