import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, ChevronDown, ChevronUp, Loader2, CheckCircle2, Clock, QrCode, Plus, Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getAccessToken, adminGoogleSignIn } from '../lib/auth';
import {
  getAllRegistrations, getEvent, getActiveTeamMembers,
  updateFeeStatus, toggleCheckedIn, deleteRegistration, getEvents, deleteSystemSpreadsheetId,
} from '../lib/firestore';
import { notifyFeeStatusPaid } from '../lib/email';
import { getOrCreateRegistrationSheet, syncRegistrationsToGoogleSheets } from '../lib/workspace';
import type { Registration, Event, TeamMember } from '../types';
import { categoryLabel } from '../types';

type RowView = {
  reg: Registration;
  event: Event | null;
  members: TeamMember[];
};

export function AdminRegistrationsPage() {
  console.log("[Mount] AdminRegistrationsPage component loaded");
  const { adminEmail } = useAuth();
  const [rows, setRows] = useState<RowView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);

  useEffect(() => {
    import('../lib/firestore').then(({ getSystemSpreadsheetId }) => {
      getSystemSpreadsheetId().then(id => setCurrentSheetId(id));
    });
  }, []);
  const [revealedCredentials, setRevealedCredentials] = useState<Record<string, boolean>>({});
  const [revealedMembers, setRevealedMembers] = useState<Record<string, boolean>>({});
  const [idPopupContent, setIdPopupContent] = useState<string | null>(null);
  const [idPopupTitle, setIdPopupTitle] = useState<string>('');

  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedCheckInStatus, setSelectedCheckInStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Client-side filter & sort on pre-fetched data (fine at ≤300 participants)
  const filtered = rows.filter((r) => {
    const q = filter.toLowerCase();
    const matchesSearch = !q || (
      r.reg.id.toLowerCase().includes(q) ||
      r.event?.name.toLowerCase().includes(q) ||
      r.members.some((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    );

    const matchesEvent = selectedEventId === 'all' || r.reg.eventId === selectedEventId;

    const matchesPayment = selectedPaymentStatus === 'all' || r.reg.feeStatus === selectedPaymentStatus;

    const matchesCheckIn = selectedCheckInStatus === 'all' || 
      (selectedCheckInStatus === 'checked-in' ? r.reg.checkedIn : !r.reg.checkedIn);

    return matchesSearch && matchesEvent && matchesPayment && matchesCheckIn;
  }).sort((a, b) => {
    const leaderA = a.members.find((m) => m.role === 'LEADER');
    const leaderB = b.members.find((m) => m.role === 'LEADER');
    
    switch (sortBy) {
      case 'date-asc':
        return a.reg.createdAt.getTime() - b.reg.createdAt.getTime();
      case 'date-desc':
        return b.reg.createdAt.getTime() - a.reg.createdAt.getTime();
      case 'team-asc':
        return (a.reg.teamName || '').localeCompare(b.reg.teamName || '');
      case 'team-desc':
        return (b.reg.teamName || '').localeCompare(a.reg.teamName || '');
      case 'leader-asc':
        return (leaderA?.name || '').localeCompare(leaderB?.name || '');
      case 'leader-desc':
        return (leaderB?.name || '').localeCompare(leaderA?.name || '');
      default:
        return 0;
    }
  });

  const reload = useCallback(async () => {
    const regs = await getAllRegistrations();
    const withData = await Promise.all(
      regs.map(async (reg) => {
        const [event, members] = await Promise.all([
          getEvent(reg.eventId),
          getActiveTeamMembers(reg.id),
        ]);
        return { reg, event, members };
      })
    );
    // Sort by event name alphabetically, then by createdAt descending
    withData.sort((a, b) => {
      const nameA = a.event?.name ?? '';
      const nameB = b.event?.name ?? '';
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB);
      }
      return b.reg.createdAt.getTime() - a.reg.createdAt.getTime();
    });
    setRows(withData);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));

    const handleGlobalReload = () => {
      reload();
    };
    window.addEventListener('spectrum26_reload_data', handleGlobalReload);
    return () => window.removeEventListener('spectrum26_reload_data', handleGlobalReload);
  }, [reload]);

  const [hasGmailToken, setHasGmailToken] = useState(false);

  useEffect(() => {
    getAccessToken().then((t) => setHasGmailToken(!!t));
  }, []);

  const handleAuthorizeGmail = async () => {
    try {
      await adminGoogleSignIn();
      setHasGmailToken(true);
      alert('Gmail Authorized successfully! Confirmation email passes will now be dispatched automatically when payments are marked as PAID.');
    } catch (err) {
      console.error('Gmail Authorization error:', err);
      alert('Google Sign-In failed or popup was closed. Please try again to enable email dispatch.');
    }
  };

  const handleToggleFee = async (row: RowView, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = row.reg.feeStatus === 'PAID' ? 'PENDING' : 'PAID';
    setSaving(row.reg.id);
    try {
      await updateFeeStatus(row.reg.id, newStatus, row.reg.upiTransactionRef, adminEmail ?? '');
      if (newStatus === 'PAID') {
        const emails = row.members.map((m) => m.email);
        const emailResult = await notifyFeeStatusPaid(emails, row.event?.name ?? '', row.reg.id);
        if (emailResult && !emailResult.success) {
          if (emailResult.reason === 'NO_GMAIL_TOKEN') {
            alert('Fee marked as PAID! Note: Gmail authorization is needed to dispatch entry pass emails. Click "Authorize Gmail for Emails" at the top of Admin Registrations to send emails.');
          } else {
            alert('Fee marked as PAID! Note: Gmail API dispatch encountered an error.');
          }
        }
      }
      await reload();
    } finally { setSaving(null); }
  };

  const handleToggleCheckedIn = async (row: RowView, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(row.reg.id + '_ci');
    try {
      await toggleCheckedIn(row.reg.id, !row.reg.checkedIn, adminEmail ?? '');
      await reload();
    } finally { setSaving(null); }
  };

  const handleDeleteRegistration = async (regId: string, eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this registration? This action is permanent.')) return;
    setSaving(regId);
    try {
      await deleteRegistration(regId, eventId, adminEmail ?? '');
      await reload();
    } catch (err) {
      console.error('[admin] Delete registration error:', err);
      alert('Failed to delete registration. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  // CSV export
  const handleExport = () => {
    const cols = ['RegID', 'Event', 'Category', 'Team Name', 'Leader Email', 'Members', 'FeeStatus', 'UPI Ref', 'CheckedIn', 'CreatedAt'];
    const lines = [cols.join(',')];
    for (const { reg, event, members } of filtered) {
      const leader = members.find((m) => m.role === 'LEADER');
      lines.push([
        reg.id,
        `"${event?.name ?? ''}"`,
        event ? categoryLabel(event.category) : '',
        `"${reg.teamName ?? ''}"`,
        leader?.email ?? '',
        members.length,
        reg.feeStatus,
        reg.upiTransactionRef ?? '',
        reg.checkedIn ? 'Yes' : 'No',
        reg.createdAt.toISOString(),
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `registrations_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncSheets = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const sheetId = await getOrCreateRegistrationSheet();
      const allEvents = await getEvents();
      // Extract all registrations and teamMembers from state rows
      const registrations = rows.map(r => r.reg);
      const teamMembers = rows.flatMap(r => r.members);

      await syncRegistrationsToGoogleSheets(sheetId, allEvents, registrations, teamMembers);
      setCurrentSheetId(sheetId);
      setSyncStatus('Sync to Google Sheets successful! Data updated.');
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Sync failed: ${err.message || err.toString()}`);
    } finally {
      setSyncing(false);
    }
  };
  const handleResetSheet = async () => {
    if (!window.confirm('WARNING: This will reset the linked Google Sheet ID. The next time you click "Sync to Google Sheets", a brand new spreadsheet will be created. Use this if the current sheet belongs to an expired user account or is not receiving updates. Continue?')) return;
    setSyncing(true);
    setSyncStatus(null);
    try {
      await deleteSystemSpreadsheetId();
      setCurrentSheetId(null);
      setSyncStatus('Spreadsheet link reset. Click "Sync to Google Sheets" to generate a new spreadsheet.');
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Reset failed: ${err.message || err.toString()}`);
    } finally {
      setSyncing(false);
    }
  };

  const qrUrl = (id: string, leaderId?: string) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const data = isLocal
      ? `${id}${leaderId ? `::${leaderId}` : ''}`
      : `${window.location.origin}/pass/${id}${leaderId ? `?memberId=${leaderId}` : ''}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  };

  if (loading) return <AdminPageSkeleton title="Registrations" />;

  return (
    <main className="">
      {/* Header */}
      <div className="">
        <div className="">
          <h1 className="">Registrations</h1>
          <div className="">
            <Link
              to="/supercore/registrations/new"
              className=""
              style={{ color: '#ffffff' }}
            >
              <Plus size={14} /> Add Registration
            </Link>
            <button
              onClick={handleAuthorizeGmail}
              className={`flex items-center gap-2 font-button text-button uppercase border px-5 py-3 transition-colors ${
                hasGmailToken
                  ? 'border-green-500/50 text-green-400 hover:bg-green-500/10'
                  : 'border-amber-500 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 animate-pulse'
              }`}
              title="Click to authorize Google Gmail for sending payment confirmation email passes to participants"
            >
              <CheckCircle2 size={14} /> {hasGmailToken ? 'Gmail Authorized' : 'Authorize Gmail for Emails'}
            </button>
            <button
              onClick={handleExport}
              className=""
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={handleSyncSheets}
              disabled={syncing}
              className=""
            >
              {syncing ? <Loader2 size={14} className="" /> : <RefreshCw size={14} />}
              Sync to Google Sheets
            </button>
            {currentSheetId && (
              <>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${currentSheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=""
                >
                  Open Google Sheet
                </a>
                <button
                  onClick={handleResetSheet}
                  disabled={syncing}
                  className=""
                >
                  Reset Sheets Link
                </button>
              </>
            )}
          </div>
        </div>
        {syncStatus && (
          <div className={`p-4 font-body text-small border rounded ${syncStatus.startsWith('Sync failed') ? 'border-red-500/30 bg-red-500/5 text-red-400' : 'border-primary/30 bg-primary/5 text-primary'}`}>
            {syncStatus}
          </div>
        )}
        <div className="">
          <div className="">
            <label className="">Search</label>
            <div className="">
              <Search size={16} className="" />
              <input
                type="text"
                placeholder="Search name, email, event..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className=""
              />
            </div>
          </div>

          <div className="">
            <label className="">Filter by Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className=""
              style={{ backgroundColor: '#060b19', color: '#ffffff' }}
            >
              <option value="all" className="">All Events</option>
              {Array.from(new Map(rows.map(r => [r.event?.id, r.event])).values())
                .filter((ev): ev is Event => !!ev)
                .map((ev) => (
                  <option key={ev.id} value={ev.id} className="">{ev.name}</option>
                ))}
            </select>
          </div>

          <div className="">
            <label className="">Payment Status</label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className=""
              style={{ backgroundColor: '#060b19', color: '#ffffff' }}
            >
              <option value="all" className="">All Statuses</option>
              <option value="PAID" className="">PAID</option>
              <option value="PENDING" className="">PENDING</option>
            </select>
          </div>

          <div className="">
            <label className="">Check-In Status</label>
            <select
              value={selectedCheckInStatus}
              onChange={(e) => setSelectedCheckInStatus(e.target.value)}
              className=""
              style={{ backgroundColor: '#060b19', color: '#ffffff' }}
            >
              <option value="all" className="">All Statuses</option>
              <option value="checked-in" className="">Checked In</option>
              <option value="not-checked-in" className="">Not Checked In</option>
            </select>
          </div>

          <div className="">
            <label className="">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className=""
              style={{ backgroundColor: '#060b19', color: '#ffffff' }}
            >
              <option value="date-desc" className="">Date (Newest First)</option>
              <option value="date-asc" className="">Date (Oldest First)</option>
              <option value="team-asc" className="">Team Name (A-Z)</option>
              <option value="team-desc" className="">Team Name (Z-A)</option>
              <option value="leader-asc" className="">Leader Name (A-Z)</option>
              <option value="leader-desc" className="">Leader Name (Z-A)</option>
            </select>
          </div>
        </div>
        <p className="">{filtered.length} registrations</p>
      </div>      {/* Table */}
      <div className=""
           style={{ borderColor: 'var(--color-border-default)' }}>
        
        {/* Table Header */}
        <div className="">
          <div className="">Sr No.</div>
          <div className="">Event</div>
          <div className="">Team Name</div>
          <div className="">Leader name(and email)</div>
          <div className="">Payment status</div>
          <div className="">Check in status</div>
        </div>

        {filtered.length === 0 && (
          <p className="">No registrations found.</p>
        )}
        {filtered.map(({ reg, event, members }, index) => {
          const leader = members.find((m) => m.role === 'LEADER');
          const open = expandedId === reg.id;

          return (
            <div key={reg.id}>
              {/* Summary row */}
              <div
                className=""
                onClick={() => setExpandedId(open ? null : reg.id)}
              >
                {/* Sr No. */}
                <div className="">
                  <span className="">Sr No.</span>
                  {index + 1}
                </div>

                {/* Event */}
                <div className="">
                  <span className="">Event</span>
                  {event?.name ?? 'Unknown Event'}
                </div>

                {/* Team Name */}
                <div className="">
                  <span className="">Team Name</span>
                  {reg.teamName || '—'}
                </div>

                {/* Leader name (and email) */}
                <div className="">
                  <span className="">Leader</span>
                  <span className="">{leader?.name ?? '—'}</span> <br/>
                  <span className="">{leader?.email ?? ''}</span>
                </div>

                {/* Payment status */}
                <div className="">
                  <span className="">Payment</span>
                  <button
                    onClick={(e) => handleToggleFee({ reg, event, members }, e)}
                    disabled={saving === reg.id}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 font-button text-[12px] uppercase border-2 transition-colors disabled:opacity-50 whitespace-nowrap ${
                      reg.feeStatus === 'PAID'
                        ? 'bg-primary text-bg-base border-primary'
                        : 'border-primary text-primary hover:bg-primary hover:text-bg-base'
                    }`}
                  >
                    {saving === reg.id ? <Loader2 size={12} className="" /> : reg.feeStatus === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {reg.feeStatus}
                  </button>
                </div>

                {/* Check in status & expand */}
                <div className="">
                  <div className="">
                    <span className="">Check In</span>
                    <button
                      onClick={(e) => handleToggleCheckedIn({ reg, event, members }, e)}
                      disabled={saving === reg.id + '_ci'}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 font-button text-[12px] uppercase border transition-colors disabled:opacity-50 whitespace-nowrap ${
                        reg.checkedIn
                          ? 'bg-primary text-bg-base border-primary hover:bg-transparent hover:text-primary'
                          : 'border-border-default text-text-secondary hover:bg-primary hover:text-bg-base hover:border-primary'
                      }`}
                    >
                      {saving === reg.id + '_ci' ? <Loader2 size={12} className="" /> : null}
                      {reg.checkedIn ? 'Checked In' : 'Check In'}
                    </button>
                  </div>
                  <div className="">
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Expanded panel */}
              {open && (() => {
                const isCredsRevealed = !!revealedCredentials[reg.id];
                const leader = members.find((m) => m.role === 'LEADER');
                return (
                  <div className="">
                    {/* Members table */}
                    <div className="">
                      <span className="">
                        Team Members
                      </span>
                      {members.map((m) => {
                        const isMemberRevealed = !!revealedMembers[m.id];
                        return (
                          <div key={m.id} className="">
                            <span className={`font-micro text-micro px-2 py-0.5 border uppercase ${m.role === 'LEADER' ? 'border-primary text-primary' : 'border-dashed border-border-default text-text-muted'}`}>{m.role}</span>
                            
                            {/* Member ID block (shifted to the left, no ellipses) */}
                            <div className="">
                              <span className="">ID:</span>
                              <span className="">
                                {isMemberRevealed ? m.id : '••••••••••••'}
                              </span>
                              <button
                                onClick={() => setRevealedMembers(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                className=""
                                title={isMemberRevealed ? "Hide ID" : "Show ID"}
                              >
                                {isMemberRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>

                            <span className="">{m.name}</span>
                            <span className="">{m.email}</span>
                            <span className="">{m.phone}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* UPI ref & QR */}
                    <div className="">
                      {/* Team ID */}
                      <div className="">
                        <span className="">Team ID</span>
                        <span className="">
                          {isCredsRevealed ? reg.id : '••••••••••••••••••••'}
                        </span>
                      </div>

                      <div className="">
                        <span className="">UPI Transaction Ref</span>
                        <span className="">
                          {reg.upiTransactionRef ?? '(not submitted)'}
                        </span>
                        {reg.paymentScreenshotUrl && (
                          <div className="">
                            <span className="">Proof Screenshot</span>
                            <a href={reg.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                              <img 
                                src={reg.paymentScreenshotUrl} 
                                alt="Payment Proof" 
                                className="" 
                              />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="">
                        <span className="">Entry QR</span>
                        {reg.feeStatus === 'PAID' ? (
                          isCredsRevealed ? (
                            <img src={qrUrl(reg.id, leader?.id)} alt="QR" className="" />
                          ) : (
                            <div className="">
                              <Lock size={20} className="" />
                              <span className="">QR Locked</span>
                            </div>
                          )
                        ) : (
                          <div className="">
                            <QrCode size={28} className="" />
                          </div>
                        )}
                      </div>

                      {/* Toggle Credentials */}
                      <div className="">
                        <button
                          onClick={() => setRevealedCredentials(prev => ({ ...prev, [reg.id]: !prev[reg.id] }))}
                          className=""
                        >
                          {isCredsRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          {isCredsRevealed ? 'Hide ID & QR' : 'Show ID & QR'}
                        </button>
                      </div>

                      {/* Edit button — navigate to the event detail page */}
                      <div className="">
                        <Link
                          to={`/supercore/registrations/edit/${reg.id}`}
                          className=""
                        >
                          Edit Team →
                        </Link>
                        <button
                          onClick={() => handleDeleteRegistration(reg.id, reg.eventId)}
                          disabled={saving === reg.id}
                          className=""
                        >
                          Delete Pass
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* ID Popup Modal */}
      {idPopupContent && (
        <div className="">
          <div className="">
            <div className="">
              <h3 className="">{idPopupTitle}</h3>
            </div>
            
            <div className="">
              {idPopupContent}
            </div>

            <button
              type="button"
              onClick={() => setIdPopupContent(null)}
              className=""
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function AdminPageSkeleton({ title }: { title: string }) {
  return (
    <main className="">
      <div className="">
        <div className="" style={{ background: 'var(--color-bg-card)' }} />
      </div>
      <div className="">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="" style={{ background: 'var(--color-bg-card)', animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </main>
  );
}
