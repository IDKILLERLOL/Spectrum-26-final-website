"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  Download, Search, ChevronDown, ChevronUp, Loader2, CheckCircle2, 
  Clock, QrCode, Plus, Eye, EyeOff, Lock, RefreshCw, 
  Trash2, AlertTriangle, Edit, UserPlus, Copy
} from "lucide-react"
// Handlers are called via client-side fetch API routes instead of direct imports


// Types based on the data structure from listRegistrations
interface RegistrationData {
  id: string
  userEmail: string
  fullName: string
  phone: string
  collegeName: string
  year: string
  eventId: string
  eventName: string
  teamMembers: { name: string }[]
  teamSize: number
  paymentRefId: string
  amountPaid: number
  paymentStatus: "APPROVED" | "PENDING" | "REJECTED" | string
  checkedIn: boolean
  paymentVerifiedBy: string | null
  paymentVerifiedAt: string | null
  sheetsSyncStatus: string
  emailSentAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

interface RowView {
  reg: RegistrationData
  // event and members are already included in reg from listRegistrations
}

type PaymentStatus = "APPROVED" | "PENDING" | "REJECTED"
type CheckInStatus = "all" | "checked-in" | "unchecked"

export function RegistrationsAdminClient({ 
  registrations, 
  adminEmail 
}: { 
  registrations: RegistrationData[] 
  adminEmail: string 
}) {
  const router = useRouter()
  const [rows, setRows] = useState<RowView[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [revealedCredentials, setRevealedCredentials] = useState<Record<string, boolean>>({})
  const [revealedMembers, setRevealedMembers] = useState<Record<string, boolean>>({})
  const [idPopupContent, setIdPopupContent] = useState<string | null>(null)
  const [idPopupTitle, setIdPopupTitle] = useState<string>('')

  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | 'all'>('all')
  const [selectedCheckInStatus, setSelectedCheckInStatus] = useState<CheckInStatus>('all')
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [lastUpdated, setLastUpdated] = useState("")

  // Initialize rows from registrations prop
  useEffect(() => {
    const rowData: RowView[] = registrations.map(reg => ({ reg }))
    setRows(rowData)
    setLastUpdated(new Date().toLocaleTimeString())
  }, [registrations])

  // Client-side filter & sort on pre-fetched data
  const filtered = useCallback(() => {
    return rows.filter((r) => {
      const q = filter.toLowerCase()
      const matchesSearch = !q || (
        r.reg.id.toLowerCase().includes(q) ||
        r.reg.fullName.toLowerCase().includes(q) ||
        r.reg.userEmail.toLowerCase().includes(q) ||
        r.reg.eventName.toLowerCase().includes(q) ||
        r.reg.teamMembers.some((m) => m.name.toLowerCase().includes(q))
      )

      const matchesEvent = selectedEventId === 'all' || r.reg.eventId === selectedEventId

      const matchesPayment = selectedPaymentStatus === 'all' || r.reg.paymentStatus === selectedPaymentStatus

      const matchesCheckIn = selectedCheckInStatus === 'all' ||
        (selectedCheckInStatus === 'checked-in' ? r.reg.checkedIn : !r.reg.checkedIn)

      return matchesSearch && matchesEvent && matchesPayment && matchesCheckIn
    }).sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.reg.createdAt || 0).getTime() - new Date(b.reg.createdAt || 0).getTime()
        case 'date-desc':
          return new Date(b.reg.createdAt || 0).getTime() - new Date(a.reg.createdAt || 0).getTime()
        case 'team-asc':
          return (a.reg.teamName || '').localeCompare(b.reg.teamName || '')
        case 'team-desc':
          return (b.reg.teamName || '').localeCompare(a.reg.teamName || '')
        case 'leader-asc':
          {
            const leaderA = a.reg.teamMembers.find((m) => m.name.toLowerCase() !== '')
            const leaderB = b.reg.teamMembers.find((m) => m.name.toLowerCase() !== '')
            return (leaderA?.name || '').localeCompare(leaderB?.name || '')
          }
        case 'leader-desc':
          {
            const leaderA = a.reg.teamMembers.find((m) => m.name.toLowerCase() !== '')
            const leaderB = b.reg.teamMembers.find((m) => m.name.toLowerCase() !== '')
            return (leaderB?.name || '').localeCompare(leaderA?.name || '')
          }
        default:
          return 0
      }
    })
  }, [rows, filter, selectedEventId, selectedPaymentStatus, selectedCheckInStatus, sortBy])

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/registrations")
      const data = await res.json()
      if (res.ok && data.registrations) {
        const rowData: RowView[] = data.registrations.map((reg: any) => ({ reg }))
        setRows(rowData)
        setLastUpdated(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.error('[admin] Failed to reload registrations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handler functions for mutations
  const handleUpdatePaymentStatus = useCallback(async (regId: string, status: PaymentStatus) => {
    setSaving(regId)
    try {
      // Call the API route which handles audit logging, syncing, emails, etc.
      const response = await fetch(`/api/admin/registrations/${regId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await reload()
    } catch (err) {
      console.error('[admin] Update payment status error:', err)
      alert('Failed to update payment status. Please try again.')
    } finally {
      setSaving(null)
    }
  }, [reload])

  const handleToggleCheckIn = useCallback(async (regId: string, checkedIn: boolean) => {
    setSaving(regId)
    try {
      // Call the API route
      const response = await fetch(`/api/admin/registrations/${regId}/checkin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedIn })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await reload()
    } catch (err) {
      console.error('[admin] Toggle check-in error:', err)
      alert('Failed to update check-in status. Please try again.')
    } finally {
      setSaving(null)
    }
  }, [reload])

  // Note: deleteRegistration function would need to be implemented or API route created
  // For now, we'll comment it out or implement a basic version if needed
  const handleDeleteRegistration = useCallback(async (regId: string) => {
    if (!window.confirm('Are you sure you want to delete this registration/team? This action cannot be undone.')) {
      return
    }

    setSaving(regId)
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete registration')
      }
      await reload()
    } catch (err) {
      console.error('[admin] Delete registration error:', err)
      alert((err as Error).message || 'Failed to delete registration. Please try again.')
    } finally {
      setSaving(null)
    }
  }, [reload])

  const handleSyncAll = useCallback(async () => {
    setSyncing(true)
    try {
      // In a real implementation, this would sync all registrations to Google Sheets
      // For now, we'll just show a toast or notification
      alert('Sync all to Google Sheets not yet implemented')
    } catch (err) {
      console.error('[admin] Sync all error:', err)
      alert('Failed to sync registrations. Please try again.')
    } finally {
      setSyncing(false)
    }
  }, [])

  const handleExportCSV = useCallback(() => {
    const cols = [
      'RegID', 'Event', 'Team Name', 'Leader Name', 'Leader Email', 
      'Members', 'Fee Status', 'Amount Paid', 'UPI Ref', 
      'Checked In', 'Created At'
    ]
    const lines = [cols.join(',')]
    
    const filteredRows = filtered()
    for (const { reg } of filteredRows) {
      const leader = reg.teamMembers.find((m) => m.name.toLowerCase() !== '') || { name: '' }
      const membersList = reg.teamMembers.map(m => m.name).join('; ')
      
      lines.push([
        `"${reg.id}"`,
        `"${reg.eventName}"`,
        `"${reg.teamName || ''}"`,
        `"${leader.name}"`,
        `"${reg.userEmail}"`,
        `"${membersList}"`,
        `"${reg.paymentStatus}"`,
        `${reg.amountPaid ?? 0}`,
        `"${reg.paymentRefId || ''}"`,
        `${reg.checkedIn}`,
        `"${new Date(reg.createdAt || 0).toISOString()}"`
      ].join(','))
    }

    const csvContent = lines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `spectrum-registrations-${new Date().toISOString().slice(0,10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filtered])

  // Helper functions for UI
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return '-'
    }
  }

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return '-'
    }
  }

  const getPaymentStatusClass = (status: PaymentStatus): string => {
    switch (status) {
      case 'APPROVED': return 'bg-green-600/20 text-green-400'
      case 'REJECTED': return 'bg-red-600/20 text-red-400'
      default: return 'bg-yellow-600/20 text-yellow-400'
    }
  }

  // JSX for the component
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registrations</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="btn btn-outline btn-sm"
            title="Export to CSV"
          >
            <Download className="h-4 w-4" />
          </button>
          <button 
            onClick={handleSyncAll}
            disabled={syncing}
            className={`btn btn-outline btn-sm ${syncing ? 'opacity-50' : ''}`}
            title="Sync All to Google Sheets"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3 text-xs">
        <div>
          <label className="block font-medium mb-1 text-neutral-400">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-100 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1 text-neutral-400">Event</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-1.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-100 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">All Events</option>
            {[...new Set(registrations.map(r => r.eventName))].sort().map(event => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1 text-neutral-400">Payment Status</label>
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus | 'all')}
            className="px-3 py-1.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-100 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1 text-neutral-400">Check-in</label>
          <select
            value={selectedCheckInStatus}
            onChange={(e) => setSelectedCheckInStatus(e.target.value as CheckInStatus)}
            className="px-3 py-1.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-100 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="checked-in">Checked In</option>
            <option value="unchecked">Not Checked In</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1 text-neutral-400">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-100 focus:border-amber-400 focus:outline-none"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="team-asc">Team Name (A-Z)</option>
            <option value="team-desc">Team Name (Z-A)</option>
            <option value="leader-asc">Leader Name (A-Z)</option>
            <option value="leader-desc">Leader Name (Z-A)</option>
          </select>
        </div>
      </div>



      {/* Main table */}
      <div className="w-full">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs font-medium text-neutral-400">
              <th className="whitespace-nowrap px-4 py-3">Reg ID</th>
              <th className="whitespace-nowrap px-4 py-3">Event</th>
              <th className="whitespace-nowrap px-4 py-3">Team</th>
              <th className="whitespace-nowrap px-4 py-3">Leader</th>
              <th className="whitespace-nowrap px-4 py-3">Members</th>
              <th className="whitespace-nowrap px-4 py-3">Fee Status</th>
              <th className="whitespace-nowrap px-4 py-3">Amount</th>
              <th className="whitespace-nowrap px-4 py-3">UPI Ref</th>
              <th className="whitespace-nowrap px-4 py-3">Checked In</th>
              <th className="whitespace-nowrap px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {filtered().map(({ reg }, index) => (
              <React.Fragment key={reg.id}>
                {/* Main row */}
                <tr 
                  onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                  className="hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                    {reg.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {reg.eventName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {reg.teamName || `Team ${reg.id.slice(0, 4)}`}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {/* Leader avatar/initials */}
                      <div className="h-8 w-8 rounded bg-neutral-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {reg.fullName ? reg.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : '??'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{reg.fullName}</div>
                        <div className="text-xs text-neutral-500">{reg.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {reg.teamMembers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {reg.teamMembers.map((m, idx) => (
                          <span key={idx} className="inline-block bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-xs">
                            {m.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-500 text-xs">Solo / No members</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs ${getPaymentStatusClass(reg.paymentStatus as PaymentStatus)}`}>
                      {reg.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    {reg.amountPaid !== null && reg.amountPaid !== undefined 
                      ? `Rs. ${reg.amountPaid.toLocaleString()}` 
                      : '-' }
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                    {reg.paymentRefId || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {reg.checkedIn ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-red-400" />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    {/* Action buttons */}
                    {saving === reg.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <React.Fragment>
                        {(reg.paymentStatus === 'PENDING' || reg.paymentStatus === 'REJECTED') && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(reg.id, 'APPROVED')}
                            title="Approve payment"
                            className="hover:text-green-400"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </button>
                        )}
                        {reg.paymentStatus === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(reg.id, 'PENDING')}
                            title="Un-approve payment (Mark Pending)"
                            className="ml-1 hover:text-amber-400"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        )}
                        {(reg.paymentStatus === 'PENDING' || reg.paymentStatus === 'APPROVED') && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(reg.id, 'REJECTED')}
                            title="Reject payment"
                            className="ml-1 hover:text-red-400"
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleCheckIn(reg.id, !reg.checkedIn)}
                          title={reg.checkedIn ? 'Check out' : 'Check in'}
                          className="ml-1 hover:text-amber-400"
                        >
                          {reg.checkedIn ? (
                            <Loader2 className="h-3 w-3" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIdPopupTitle('Registration ID')
                            setIdPopupContent(reg.id)
                          }}
                          title="Copy ID"
                          className="ml-1 hover:text-neutral-400"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                          className="ml-1 hover:text-neutral-400"
                          title="Expand/collapse details"
                        >
                          {expandedId === reg.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </React.Fragment>
                    )}
                  </td>
                </tr>

                {/* Expandable details row */}
                {expandedId === reg.id && (
                  <tr className="bg-neutral-900/50">
                    <td colSpan="10" className="px-4 py-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                          <h4 className="font-semibold text-sm text-white">
                            Registration &amp; Team Details
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleDeleteRegistration(reg.id)}
                            disabled={saving === reg.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 size={13} /> Delete Team
                          </button>
                        </div>
                        <div className="border border-neutral-700 rounded p-3">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Full Name</p>
                              <p className="text-sm font-medium">{reg.fullName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Email</p>
                              <p className="text-sm font-medium">{reg.userEmail || '-'}</p>
                            </div>
                            {(reg as any).pictureUrl && (
                              <div>
                                <p className="text-xs text-neutral-500 mb-1">Profile Photo</p>
                                <img
                                  src={(reg as any).pictureUrl}
                                  alt="Profile"
                                  className="size-16 object-cover border border-neutral-700 rounded"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Phone</p>
                              <p className="text-sm font-medium">{reg.phone || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">College</p>
                              <p className="text-sm font-medium">{reg.collegeName || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Year</p>
                              <p className="text-sm font-medium">{reg.year}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Payment Ref ID</p>
                              <p className="text-sm font-medium">{reg.paymentRefId || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Amount Paid</p>
                              <p className="text-sm font-medium">
                                {reg.amountPaid !== null && reg.amountPaid !== undefined 
                                  ? `Rs. ${reg.amountPaid.toLocaleString()}` 
                                  : '-' }
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Payment Status</p>
                              <p className="text-sm font-medium">
                                <span className={`px-2 py-0.5 rounded text-xs ${getPaymentStatusClass(reg.paymentStatus as PaymentStatus)}`}>
                                  {reg.paymentStatus}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Checked In</p>
                              <p className="text-sm font-medium">
                                {reg.checkedIn ? (
                                  <span className="text-green-400">Yes</span>
                                ) : (
                                  <span className="text-red-400">No</span>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Created At</p>
                              <p className="text-sm font-medium">{formatDateTime(reg.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Updated At</p>
                              <p className="text-sm font-medium">{formatDateTime(reg.updatedAt)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Team members details */}
                        {reg.teamMembers.length > 0 && (
                          <div className="border border-neutral-700 rounded p-3">
                            <p className="text-xs font-medium mb-2">Team Members ({reg.teamMembers.length})</p>
                            <div className="space-y-2">
                              {reg.teamMembers.map((member, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded bg-neutral-700 flex items-center justify-center text-xs">
                                    {member.name ? member.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '??'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{member.name}</p>
                                    <p className="text-xs text-neutral-500">Team Member</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* Empty state */}
            {filtered().length === 0 && (
              <tr>
                <td colSpan="10" className="px-4 py-6 text-center text-neutral-500">
                  No registrations found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with stats */}
      <div className="mt-6 flex items-center justify-between text-sm text-neutral-500">
        <div>
          Showing {filtered().length} of {rows.length} registrations
        </div>
        <div>
          Last updated: {lastUpdated}
        </div>
      </div>
    </div>
  )
}

// Helper component for revealing/hiding sensitive data
function RevealTrigger({ 
  value, 
  onToggle, 
  children 
}: {
  value: boolean
  onToggle: (value: boolean) => void
  children: (value: boolean) => React.ReactNode
}) {
  return children(value)
}

export default RegistrationsAdminClient
