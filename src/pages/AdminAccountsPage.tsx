import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, UserMinus, Trash2, ShieldAlert } from 'lucide-react';
import { getAllUsers, getAllRegistrations, deleteUserDoc, db } from '../lib/firestore';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { useAuth } from '../lib/useAuth';
import type { User as DbUser } from '../types';

export function AdminAccountsPage() {
  console.log("[Mount] AdminAccountsPage component loaded");
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
      <main className="">
        <div className="">
          <Loader2 size={36} className="" />
          <span className="">
            Loading accounts...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      {/* Header */}
      <div className="">
        <div className="">
          <h1 className="">
            Accounts
          </h1>
          <p className="">
            Manage all registered and unregistered participant accounts.
          </p>
        </div>
        <div className="">
          <UserMinus size={14} className="" />
          <span>{filteredList.length} of {users.length} Accounts Shown</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="">
        <div className="">
          <label className="">Search</label>
          <div className="">
            <Search size={16} className="" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Name, email, college..."
              className=""
            />
          </div>
        </div>

        <div className="">
          <label className="">Filter by status</label>
          <select
            value={selectedRegStatus}
            onChange={(e) => setSelectedRegStatus(e.target.value)}
            className=""
          >
            <option value="all">All Accounts</option>
            <option value="registered">Registered Only</option>
            <option value="unregistered">Unregistered Only</option>
          </select>
        </div>

        <div className="">
          <label className="">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className=""
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
        <div className="">
          <span className="">
            No matching accounts found.
          </span>
        </div>
      ) : (
        <div className="">
          {filteredList.map((u) => {
            const isRegistered = !unregisteredIds.has(u.id);
            return (
              <div
                key={u.id}
                className=""
              >
                <div className="">
                  <div className="">
                    <div className="">
                      <span className="">{u.name || 'Anonymous User'}</span>
                      <span className={`font-micro text-[10px] border px-2 py-0.5 uppercase tracking-wider font-bold shrink-0 ${
                        isRegistered 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {isRegistered ? 'Registered' : 'Unregistered'}
                      </span>
                    </div>
                    <span className="">{u.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteUser(u)}
                    className=""
                    aria-label="Delete Account"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              <div className="">
                {u.phone && (
                  <div className="">
                    <span className="">Phone:</span>
                    <span className="">{u.phone}</span>
                  </div>
                )}
                {u.college && (
                  <div className="">
                    <span className="">College:</span>
                    <span className="">{u.college}</span>
                  </div>
                )}
                <div className="">
                  <span className="">Auth:</span>
                  <span className="">
                    {u.authMethod}
                  </span>
                </div>
                <div className="">
                  <span className="">Joined:</span>
                  <span className="">
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
        <div className="">
          <div className="">
            <div className="">
              <ShieldAlert size={28} className="" />
              <h3 className="">DELETE ACCOUNT</h3>
            </div>
            
            <div className="" />
            
            <p className="">
              Are you sure you want to delete user account for <strong>{confirmDeleteUser.name || confirmDeleteUser.email}</strong>? 
              This will remove their profile record from database. This action is **irreversible**.
            </p>

            <div className="">
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                disabled={deleting}
                className=""
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteUser.id)}
                disabled={deleting}
                className=""
              >
                {deleting ? <Loader2 size={16} className="" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
