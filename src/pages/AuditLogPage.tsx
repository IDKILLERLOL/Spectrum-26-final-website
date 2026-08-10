import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getAuditLog, getEvents, syncAuditLogsToSheets } from '../lib/firestore';
import type { AuditLog, Event } from '../types';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

const PAGE_SIZE = 7;

export function AuditLogPage() {
  console.log("[Mount] AuditLogPage component loaded");
  const { adminEmail } = useAuth();
  const [entries, setEntries] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [teamSearch, setTeamSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const evs = await getEvents();
        setEvents(evs);
      } catch (err) {
        console.error('[audit-log] Failed to load events:', err);
      }
    };
    loadEvents();
  }, []);

  const load = useCallback(async (reset = false) => {
    try {
      const { entries: newEntries, lastDoc } = await getAuditLog({
        pageSize: 500,
        actionTypeFilter: filter || undefined,
      });
      lastDocRef.current = lastDoc;
      setEntries(newEntries);
      setHasMore(false);
    } catch (err) {
      console.error('[audit-log]', err);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    lastDocRef.current = null;
    load(true).finally(() => setLoading(false));

    const handleGlobalReload = () => {
      setLoading(true);
      lastDocRef.current = null;
      load(true).finally(() => setLoading(false));
    };
    window.addEventListener('spectrum26_reload_data', handleGlobalReload);
    return () => window.removeEventListener('spectrum26_reload_data', handleGlobalReload);
  }, [filter]);

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, selectedEventId, teamSearch]);

  const filteredEntries = entries.filter((e) => {
    const matchesEvent = selectedEventId === 'all' || e.targetEventId === selectedEventId;
    const matchesTeam = !teamSearch || (
      (e.teamName || '').toLowerCase().includes(teamSearch.toLowerCase()) ||
      (e.targetRegistrationId || '').toLowerCase().includes(teamSearch.toLowerCase())
    );
    return matchesEvent && matchesTeam;
  });

  const totalPages = Math.ceil(filteredEntries.length / PAGE_SIZE) || 1;
  const pageEntries = filteredEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const loadMore = async () => {
    setLoadingMore(true);
    await load(false);
    setLoadingMore(false);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handleExport = () => {
    const cols = ['Timestamp', 'Actor', 'ActorType', 'Action', 'RegistrationID', 'TeamName', 'EventID', 'EventName', 'IP'];
    const lines = [cols.join(',')];
    for (const e of filteredEntries) {
      lines.push([
        e.timestamp.toISOString(),
        e.actorEmail ?? '',
        e.actorType,
        e.actionType,
        e.targetRegistrationId ?? '',
        `"${e.teamName ?? ''}"`,
        e.targetEventId ?? '',
        `"${e.eventName ?? ''}"`,
        e.ipAddress ?? '',
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit_log_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncAuditLogsToSheets();
      setSyncStatus(`Sync successful! ${res.success} logs written to Google Sheets.`);
    } catch (err: any) {
      setSyncStatus(`Sync failed: ${err.message || err.toString()}`);
    } finally {
      setSyncing(false);
    }
  };

  const actionTypes = [
    '', 'REGISTRATION_CREATED', 'MEMBER_ADDED', 'MEMBER_REMOVED', 'MEMBER_EDITED',
    'LEADERSHIP_TRANSFERRED', 'FEE_STATUS_CHANGED', 'CHECKED_IN_TOGGLED',
    'EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_DELETED',
    'WINNER_RECORDED', 'WINNER_UPDATED',
    'ADMIN_ADDED', 'ADMIN_REMOVED',
    'PROFILE_UPDATED', 'GATE_FAILED', 'UNAUTHORIZED_ADMIN_ATTEMPT',
  ];

  return (
    <main className="">
      {/* Header */}
      <div className="">
        <div className="">
          <h1 className="">Audit Log</h1>
          <div className="">
            <button
              onClick={handleSync}
              disabled={syncing}
              className=""
            >
              {syncing ? <Loader2 size={14} className="" /> : <RefreshCw size={14} />} 
              Sync to Google Sheets
            </button>
            <button
              onClick={handleExport}
              className=""
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className={`p-4 font-body text-small border rounded ${syncStatus.startsWith('Sync failed') ? 'border-red-500/30 bg-red-500/5 text-red-400' : 'border-primary/30 bg-primary/5 text-primary'}`}>
            {syncStatus}
          </div>
        )}

        {/* Filter controls row */}
        <div className="">
          <div className="">
            <label className="">Filter by action</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className=""
            >
              {actionTypes.map((a) => (
                <option key={a} value={a}>{a || 'All actions'}</option>
              ))}
            </select>
          </div>

          <div className="">
            <label className="">Filter by Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className=""
            >
              <option value="all">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>

          <div className="">
            <label className="">Search by Team Name / ID</label>
            <input
              type="text"
              placeholder="e.g. Alpha Team..."
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              className=""
            />
          </div>
        </div>
      </div>

      {/* Pagination & Table Wrapper */}
      <div className="">
        {/* Pagination Controls */}
        <div className="">
          <div className="">
            Showing {filteredEntries.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(filteredEntries.length, currentPage * PAGE_SIZE)} of {filteredEntries.length} entries
          </div>
          <div className="">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className=""
            >
              Previous
            </button>
            <div className="">
              Page {currentPage} of {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages && !hasMore}
              onClick={handleNextPage}
              className=""
            >
              {loadingMore && <Loader2 size={12} className="" />}
              Next
            </button>
          </div>
        </div>

        {/* Log table */}
        {loading ? (
          <div className="">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="" style={{ background: 'var(--color-bg-card)', animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <p className="">No log entries found.</p>
        ) : (
          <div className="">
            {/* Table Header */}
            <div className="">
              <div className="">Date</div>
              <div className="">Time</div>
              <div className="">Action</div>
              <div className="">Team Name</div>
            </div>

            {pageEntries.map((entry) => {
              const open = expandedId === entry.id;
              const isGateEvent = entry.actionType === 'GATE_FAILED' || entry.actionType === 'UNAUTHORIZED_ADMIN_ATTEMPT';
              
              const dateStr = entry.timestamp ? entry.timestamp.toLocaleDateString('en-GB') : '—';
              const timeStr = entry.timestamp ? entry.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';

              return (
                <div key={entry.id}>
                  <div
                    className=""
                    onClick={() => setExpandedId(open ? null : entry.id)}
                  >
                    {/* Date */}
                    <div className="">
                      <span className="">Date</span>
                      {dateStr}
                    </div>

                    {/* Time */}
                    <div className="">
                      <span className="">Time</span>
                      {timeStr}
                    </div>

                    {/* Action */}
                    <div className="">
                      <span className="">Action</span>
                      <span
                        className={`font-button text-button uppercase tracking-wide truncate ${isGateEvent ? 'text-text-secondary' : 'text-primary'}`}
                      >
                        {entry.actionType.replace(/_/g, ' ')}
                      </span>
                      <span className="">
                        By: {entry.actorName || entry.actorEmail || 'anonymous'} ({entry.actorType})
                      </span>
                    </div>

                    {/* Team Name Info */}
                    <div className="">
                      <div className="">
                        <span className="">Team Name</span>
                        {entry.teamName ? (
                          <div className="">
                            {entry.teamName}
                          </div>
                        ) : (
                          <div className="">
                            N/A
                          </div>
                        )}
                        {entry.eventName && (
                          <div className="">
                            Event: {entry.eventName}
                          </div>
                        )}
                      </div>
                      <div className="">
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: diff viewer */}
                  {open && (
                    <div className="">
                      <div className="">
                        {entry.diffOld !== null && (
                          <div className="">
                            <span className="">Before</span>
                            <pre className="">
                              {JSON.stringify(entry.diffOld, null, 2)}
                            </pre>
                          </div>
                        )}
                        {entry.diffNew !== null && (
                          <div className="">
                            <span className="">After</span>
                            <pre className="">
                              {JSON.stringify(entry.diffNew, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      <div className="">
                        {entry.actorId && <span>Actor ID: <code className="">{entry.actorId}</code></span>}
                        {entry.actorName && <span>Actor Name: <code className="">{entry.actorName}</code></span>}
                        {entry.actorEmail && <span>Actor Email: <code className="">{entry.actorEmail}</code></span>}
                        {entry.targetRegistrationId && <span>Reg ID: <code className="">{entry.targetRegistrationId}</code></span>}
                        {entry.targetEventId && <span>Event ID: <code className="">{entry.targetEventId}</code></span>}
                        {entry.ipAddress && <span>IP: <code className="">{entry.ipAddress}</code></span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
