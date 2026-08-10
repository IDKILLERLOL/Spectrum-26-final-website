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
    <main className="flex flex-col gap-4 py-8 px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-hero text-[40px] leading-none uppercase tracking-widest text-primary">Audit Log</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 font-button text-button uppercase border border-border-default text-text-secondary px-5 py-3 hover:border-primary hover:text-primary disabled:opacity-50 transition-colors"
            >
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} 
              Sync to Google Sheets
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 font-button text-button uppercase border border-primary text-primary px-5 py-3 hover:bg-primary hover:text-bg-base transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Filter by action</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-bg-card border border-border-default px-4 py-2 text-primary font-body text-small focus:outline-none focus:border-primary"
            >
              {actionTypes.map((a) => (
                <option key={a} value={a}>{a || 'All actions'}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Filter by Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-bg-card border border-border-default px-4 py-2 text-primary font-body text-small focus:outline-none focus:border-primary"
            >
              <option value="all">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-micro text-micro text-text-muted uppercase tracking-widest">Search by Team Name / ID</label>
            <input
              type="text"
              placeholder="e.g. Alpha Team..."
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              className="bg-bg-card border border-border-default px-4 py-2 text-primary font-body text-small focus:outline-none focus:border-primary placeholder:text-text-muted"
            />
          </div>
        </div>
      </div>

      {/* Pagination & Table Wrapper */}
      <div className="flex flex-col gap-3 mt-[-16px]">
        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 pb-3 border-b border-border-default">
          <div className="text-small text-text-muted">
            Showing {filteredEntries.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(filteredEntries.length, currentPage * PAGE_SIZE)} of {filteredEntries.length} entries
          </div>
          <div className="flex items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 border border-border-default text-text-secondary font-button text-button uppercase hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:hover:border-border-default disabled:hover:text-text-secondary"
            >
              Previous
            </button>
            <div className="font-heading text-small text-primary">
              Page {currentPage} of {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages && !hasMore}
              onClick={handleNextPage}
              className="px-4 py-2 border border-border-default text-text-secondary font-button text-button uppercase hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:hover:border-border-default disabled:hover:text-text-secondary flex items-center gap-2"
            >
              {loadingMore && <Loader2 size={12} className="animate-spin" />}
              Next
            </button>
          </div>
        </div>

        {/* Log table */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-14 w-full rounded" style={{ background: 'var(--color-bg-card)', animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <p className="font-body text-body text-text-muted py-8">No log entries found.</p>
        ) : (
          <div className="flex flex-col divide-y border-b border-border-default">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 pt-0 pb-3 font-heading text-small text-text-muted uppercase border-b border-border-default">
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-4">Action</div>
              <div className="col-span-4">Team Name</div>
            </div>

            {pageEntries.map((entry) => {
              const open = expandedId === entry.id;
              const isGateEvent = entry.actionType === 'GATE_FAILED' || entry.actionType === 'UNAUTHORIZED_ADMIN_ATTEMPT';
              
              const dateStr = entry.timestamp ? entry.timestamp.toLocaleDateString('en-GB') : '—';
              const timeStr = entry.timestamp ? entry.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';

              return (
                <div key={entry.id}>
                  <div
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-4 px-4 cursor-pointer hover:bg-bg-card transition-colors"
                    onClick={() => setExpandedId(open ? null : entry.id)}
                  >
                    {/* Date */}
                    <div className="font-body text-small text-text-primary md:col-span-2">
                      <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block">Date</span>
                      {dateStr}
                    </div>

                    {/* Time */}
                    <div className="font-body text-small text-text-secondary font-mono md:col-span-2">
                      <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block">Time</span>
                      {timeStr}
                    </div>

                    {/* Action */}
                    <div className="flex flex-col gap-0.5 min-w-0 md:col-span-4">
                      <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block">Action</span>
                      <span
                        className={`font-button text-button uppercase tracking-wide truncate ${isGateEvent ? 'text-text-secondary' : 'text-primary'}`}
                      >
                        {entry.actionType.replace(/_/g, ' ')}
                      </span>
                      <span className="font-body text-[12px] text-text-muted">
                        By: {entry.actorName || entry.actorEmail || 'anonymous'} ({entry.actorType})
                      </span>
                    </div>

                    {/* Team Name Info */}
                    <div className="md:col-span-4 flex justify-between items-center gap-4 min-w-0">
                      <div className="flex-1 min-w-0">
                        <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block">Team Name</span>
                        {entry.teamName ? (
                          <div className="font-body text-small text-text-primary font-bold truncate">
                            {entry.teamName}
                          </div>
                        ) : (
                          <div className="font-body text-small text-text-muted italic truncate">
                            N/A
                          </div>
                        )}
                        {entry.eventName && (
                          <div className="font-body text-[11px] text-text-muted truncate mt-0.5">
                            Event: {entry.eventName}
                          </div>
                        )}
                      </div>
                      <div className="text-text-muted shrink-0">
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: diff viewer */}
                  {open && (
                    <div className="expand-in border-l-4 border-primary pl-6 pb-6 bg-bg-elevated flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {entry.diffOld !== null && (
                          <div className="flex flex-col gap-2">
                            <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Before</span>
                            <pre className="font-mono text-small text-text-secondary bg-bg-card border border-border-default p-4 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(entry.diffOld, null, 2)}
                            </pre>
                          </div>
                        )}
                        {entry.diffNew !== null && (
                          <div className="flex flex-col gap-2">
                            <span className="font-micro text-micro text-text-muted uppercase tracking-widest">After</span>
                            <pre className="font-mono text-small text-primary bg-bg-card border border-border-default p-4 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(entry.diffNew, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-6 font-body text-small text-text-muted">
                        {entry.actorId && <span>Actor ID: <code className="font-mono">{entry.actorId}</code></span>}
                        {entry.actorName && <span>Actor Name: <code className="font-mono">{entry.actorName}</code></span>}
                        {entry.actorEmail && <span>Actor Email: <code className="font-mono">{entry.actorEmail}</code></span>}
                        {entry.targetRegistrationId && <span>Reg ID: <code className="font-mono">{entry.targetRegistrationId}</code></span>}
                        {entry.targetEventId && <span>Event ID: <code className="font-mono">{entry.targetEventId}</code></span>}
                        {entry.ipAddress && <span>IP: <code className="font-mono">{entry.ipAddress}</code></span>}
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
