import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, ChevronDown, ChevronUp, Loader2, CheckCircle2, Clock, QrCode, Plus, Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getAccessToken, adminGoogleSignIn } from '../lib/auth';
import {
  getAllRegistrations, getEvent, getActiveTeamMembers,
  updateFeeStatus, toggleCheckedIn, deleteRegistration, getEvents,
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
      setSyncStatus('Sync to Google Sheets successful! Data updated.');
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Sync failed: ${err.message || err.toString()}`);
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
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b-2 border-primary pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-hero text-[40px] leading-none uppercase tracking-widest text-primary">Registrations</h1>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/supercore/registrations/new"
              className="flex items-center gap-2 font-button text-button uppercase bg-primary border border-primary px-5 py-3 hover:bg-transparent hover:text-primary transition-colors"
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
              className="flex items-center gap-2 font-button text-button uppercase border border-primary text-primary px-5 py-3 hover:bg-primary hover:text-bg-base transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={handleSyncSheets}
              disabled={syncing}
              className="flex items-center gap-2 font-button text-button uppercase border border-border-default text-text-secondary px-5 py-3 hover:border-primary hover:text-primary disabled:opacity-50 transition-colors"
            >
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Sync to Google Sheets
            </button>
          </div>
        </div>
        {syncStatus && (
          <div className={`p-4 font-body text-small border rounded ${syncStatus.startsWith('Sync failed') ? 'border-red-500/30 bg-red-500/5 text-red-400' : 'border-primary/30 bg-primary/5 text-primary'}`}>
            {syncStatus}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="font-micro text-micro text-text-muted uppercase tracking-wider">Search</label>
            <div className="flex items-center gap-2.5 border border-white/10 px-3 bg-bg-card h-[42px] w-full min-w-0 focus-within:border-white/25">
              <Search size={16} className="text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search name, email, event..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-primary font-body text-small focus:outline-none flex-1 min-w-0 w-full placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="font-micro text-micro text-text-muted uppercase tracking-wider">Filter by Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-bg-card border border-border-default px-3 h-[42px] text-primary font-body text-small focus:outline-none focus:border-primary w-full min-w-0 truncate"
            >
              <option value="all">All Events</option>
              {Array.from(new Map(rows.map(r => [r.event?.id, r.event])).values())
                .filter((ev): ev is Event => !!ev)
                .map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="font-micro text-micro text-text-muted uppercase tracking-wider">Payment Status</label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="bg-bg-card border border-border-default px-3 h-[42px] text-primary font-body text-small focus:outline-none focus:border-primary w-full min-w-0"
            >
              <option value="all">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="font-micro text-micro text-text-muted uppercase tracking-wider">Check-In Status</label>
            <select
              value={selectedCheckInStatus}
              onChange={(e) => setSelectedCheckInStatus(e.target.value)}
              className="bg-bg-card border border-border-default px-3 h-[42px] text-primary font-body text-small focus:outline-none focus:border-primary w-full min-w-0"
            >
              <option value="all">All Statuses</option>
              <option value="checked-in">Checked In</option>
              <option value="not-checked-in">Not Checked In</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="font-micro text-micro text-text-muted uppercase tracking-wider">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-bg-card border border-border-default px-3 h-[42px] text-primary font-body text-small focus:outline-none focus:border-primary w-full min-w-0"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="team-asc">Team Name (A-Z)</option>
              <option value="team-desc">Team Name (Z-A)</option>
              <option value="leader-asc">Leader Name (A-Z)</option>
              <option value="leader-desc">Leader Name (Z-A)</option>
            </select>
          </div>
        </div>
        <p className="font-micro text-micro text-text-muted uppercase">{filtered.length} registrations</p>
      </div>      {/* Table */}
      <div className="flex flex-col divide-y border-b border-border-default"
           style={{ borderColor: 'var(--color-border-default)' }}>
        
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 font-heading text-small text-text-muted uppercase border-b border-border-default">
          <div className="col-span-1">Sr No.</div>
          <div className="col-span-2">Event</div>
          <div className="col-span-2">Team Name</div>
          <div className="col-span-3">Leader name(and email)</div>
          <div className="col-span-2">Payment status</div>
          <div className="col-span-2">Check in status</div>
        </div>

        {filtered.length === 0 && (
          <p className="font-body text-body text-text-muted py-8">No registrations found.</p>
        )}
        {filtered.map(({ reg, event, members }, index) => {
          const leader = members.find((m) => m.role === 'LEADER');
          const open = expandedId === reg.id;

          return (
            <div key={reg.id}>
              {/* Summary row */}
              <div
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-5 px-4 cursor-pointer hover:bg-bg-card transition-colors"
                onClick={() => setExpandedId(open ? null : reg.id)}
              >
                {/* Sr No. */}
                <div className="font-heading text-small text-primary md:col-span-1">
                  <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block">Sr No.</span>
                  {index + 1}
                </div>

                {/* Event */}
                <div className="font-heading text-heading text-primary uppercase truncate md:col-span-2">
                  <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block">Event</span>
                  {event?.name ?? 'Unknown Event'}
                </div>

                {/* Team Name */}
                <div className="font-body text-small text-text-primary md:col-span-2 truncate">
                  <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block">Team Name</span>
                  {reg.teamName || '—'}
                </div>

                {/* Leader name (and email) */}
                <div className="font-body text-small text-text-secondary md:col-span-3 min-w-0 truncate">
                  <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block">Leader</span>
                  <span className="font-heading text-[13px] text-primary">{leader?.name ?? '—'}</span> <br/>
                  <span className="text-text-muted text-[11px] font-mono">{leader?.email ?? ''}</span>
                </div>

                {/* Payment status */}
                <div className="md:col-span-2">
                  <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block mb-1">Payment</span>
                  <button
                    onClick={(e) => handleToggleFee({ reg, event, members }, e)}
                    disabled={saving === reg.id}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 font-button text-[12px] uppercase border-2 transition-colors disabled:opacity-50 whitespace-nowrap ${
                      reg.feeStatus === 'PAID'
                        ? 'bg-primary text-bg-base border-primary'
                        : 'border-primary text-primary hover:bg-primary hover:text-bg-base'
                    }`}
                  >
                    {saving === reg.id ? <Loader2 size={12} className="animate-spin" /> : reg.feeStatus === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {reg.feeStatus}
                  </button>
                </div>

                {/* Check in status & expand */}
                <div className="md:col-span-2 flex items-center gap-2 justify-between">
                  <div className="flex-1">
                    <span className="md:hidden text-text-muted text-micro uppercase tracking-wider block mb-1">Check In</span>
                    <button
                      onClick={(e) => handleToggleCheckedIn({ reg, event, members }, e)}
                      disabled={saving === reg.id + '_ci'}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 font-button text-[12px] uppercase border transition-colors disabled:opacity-50 whitespace-nowrap ${
                        reg.checkedIn
                          ? 'bg-primary text-bg-base border-primary hover:bg-transparent hover:text-primary'
                          : 'border-border-default text-text-secondary hover:bg-primary hover:text-bg-base hover:border-primary'
                      }`}
                    >
                      {saving === reg.id + '_ci' ? <Loader2 size={12} className="animate-spin" /> : null}
                      {reg.checkedIn ? 'Checked In' : 'Check In'}
                    </button>
                  </div>
                  <div className="text-text-muted shrink-0 mt-4 md:mt-0">
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Expanded panel */}
              {open && (() => {
                const isCredsRevealed = !!revealedCredentials[reg.id];
                const leader = members.find((m) => m.role === 'LEADER');
                return (
                  <div className="expand-in border border-border-default border-l-4 border-l-primary p-8 mt-2 mb-4 mx-4 bg-bg-card flex flex-col gap-6 shadow-xl">
                    {/* Members table */}
                    <div className="flex flex-col gap-1">
                      <span className="font-micro text-micro text-text-muted uppercase tracking-widest pb-2 border-b border-border-subtle">
                        Team Members
                      </span>
                      {members.map((m) => {
                        const isMemberRevealed = !!revealedMembers[m.id];
                        return (
                          <div key={m.id} className="flex flex-wrap items-center gap-4 py-2 border-b border-border-subtle">
                            <span className={`font-micro text-micro px-2 py-0.5 border uppercase ${m.role === 'LEADER' ? 'border-primary text-primary' : 'border-dashed border-border-default text-text-muted'}`}>{m.role}</span>
                            
                            {/* Member ID block (shifted to the left, no ellipses) */}
                            <div className="flex items-center gap-2 border-r border-border-subtle pr-4 mr-2">
                              <span className="font-micro text-[10px] text-text-muted uppercase">ID:</span>
                              <span className="font-body text-small font-mono text-primary">
                                {isMemberRevealed ? m.id : '••••••••••••'}
                              </span>
                              <button
                                onClick={() => setRevealedMembers(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                className="text-text-muted hover:text-primary transition-colors"
                                title={isMemberRevealed ? "Hide ID" : "Show ID"}
                              >
                                {isMemberRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>

                            <span className="font-heading text-heading text-primary flex-1">{m.name}</span>
                            <span className="font-body text-small text-text-secondary">{m.email}</span>
                            <span className="font-body text-small text-text-muted">{m.phone}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* UPI ref & QR */}
                    <div className="flex flex-wrap gap-8 items-start border-t border-border-subtle pt-4 mt-2">
                      {/* Team ID */}
                      <div className="flex flex-col gap-2">
                        <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Team ID</span>
                        <span className="font-body text-heading font-mono text-primary select-all">
                          {isCredsRevealed ? reg.id : '••••••••••••••••••••'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="font-micro text-micro text-text-muted uppercase tracking-widest">UPI Transaction Ref</span>
                        <span className="font-heading text-heading text-primary font-mono select-all">
                          {reg.upiTransactionRef ?? '(not submitted)'}
                        </span>
                        {reg.paymentScreenshotUrl && (
                          <div className="mt-2">
                            <span className="font-micro text-[10px] text-text-muted uppercase tracking-widest block mb-1">Proof Screenshot</span>
                            <a href={reg.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                              <img 
                                src={reg.paymentScreenshotUrl} 
                                alt="Payment Proof" 
                                className="w-24 h-24 border border-border-default object-cover cursor-pointer hover:opacity-85 transition-opacity" 
                              />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Entry QR</span>
                        {reg.feeStatus === 'PAID' ? (
                          isCredsRevealed ? (
                            <img src={qrUrl(reg.id, leader?.id)} alt="QR" className="w-24 h-24 border border-border-default" />
                          ) : (
                            <div className="w-24 h-24 border border-dashed border-border-default flex flex-col items-center justify-center gap-1 bg-bg-base/30">
                              <Lock size={20} className="text-text-muted" />
                              <span className="font-micro text-[10px] text-text-muted uppercase font-bold">QR Locked</span>
                            </div>
                          )
                        ) : (
                          <div className="w-24 h-24 border border-dashed border-border-default flex items-center justify-center">
                            <QrCode size={28} className="text-text-muted" />
                          </div>
                        )}
                      </div>

                      {/* Toggle Credentials */}
                      <div className="flex flex-col justify-end h-[96px]">
                        <button
                          onClick={() => setRevealedCredentials(prev => ({ ...prev, [reg.id]: !prev[reg.id] }))}
                          className="font-button text-micro uppercase border border-border-default text-text-secondary px-4 py-2 hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
                        >
                          {isCredsRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          {isCredsRevealed ? 'Hide ID & QR' : 'Show ID & QR'}
                        </button>
                      </div>

                      {/* Edit button — navigate to the event detail page */}
                      <div className="flex gap-4 self-end h-[96px] items-end ml-auto">
                        <Link
                          to={`/supercore/registrations/edit/${reg.id}`}
                          className="font-button text-button uppercase border border-primary text-primary px-5 py-3 hover:bg-primary hover:text-bg-base transition-colors"
                        >
                          Edit Team →
                        </Link>
                        <button
                          onClick={() => handleDeleteRegistration(reg.id, reg.eventId)}
                          disabled={saving === reg.id}
                          className="font-button text-button uppercase border border-red-500 text-red-500 px-5 py-3 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-bg-card border-2 border-primary max-w-sm w-full p-8 flex flex-col gap-6 shadow-2xl text-left border-solid">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <h3 className="font-heading text-card-title uppercase tracking-wide text-primary">{idPopupTitle}</h3>
            </div>
            
            <div className="bg-bg-base p-4 border border-border-default select-all font-mono text-body text-primary break-all text-center">
              {idPopupContent}
            </div>

            <button
              type="button"
              onClick={() => setIdPopupContent(null)}
              className="py-3 bg-primary text-bg-base font-button text-button uppercase hover:opacity-90 transition-opacity w-full"
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
    <main className="flex flex-col gap-8 py-8 px-6 max-w-7xl mx-auto w-full">
      <div className="border-b-2 border-primary pb-6">
        <div className="skeleton h-12 w-56 rounded" style={{ background: 'var(--color-bg-card)' }} />
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-16 w-full rounded" style={{ background: 'var(--color-bg-card)', animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </main>
  );
}
