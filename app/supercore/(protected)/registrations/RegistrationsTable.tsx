"use client"

import * as React from "react"
import type { FirestoreRegistration } from "@/types/firestore"

export type SerializedRegistration = Omit<
  FirestoreRegistration & { id: string },
  "createdAt" | "updatedAt" | "paymentVerifiedAt" | "emailSentAt"
> & {
  createdAt: string
  updatedAt: string
  paymentVerifiedAt: string | null
  emailSentAt: string | null
  checkedIn: boolean
}

export function RegistrationsTable({ initialRegistrations }: { initialRegistrations: SerializedRegistration[] }) {
  const [registrations, setRegistrations] = React.useState(initialRegistrations)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<"ALL" | "PENDING" | "PAID" | "CHECKED_IN">("ALL")

  async function markAsPaid(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/registrations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      })
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, paymentStatus: "APPROVED" } : r))
        )
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? "Failed to update status.")
      }
    } finally {
      setBusyId(null)
    }
  }

  async function toggleCheckedIn(id: string, checkedIn: boolean) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/registrations/${id}/checkin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkedIn }),
      })
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, checkedIn } : r))
        )
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? "Failed to update check-in.")
      }
    } finally {
      setBusyId(null)
    }
  }

  const filtered = registrations.filter((r) => {
    if (filter === "PENDING") return r.paymentStatus !== "APPROVED"
    if (filter === "PAID") return r.paymentStatus === "APPROVED"
    if (filter === "CHECKED_IN") return r.checkedIn === true
    return true
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 text-xs">
        {(["ALL", "PENDING", "PAID", "CHECKED_IN"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1.5 ${filter === f ? "bg-amber-400 text-neutral-950 font-bold" : "bg-neutral-900 text-neutral-300"}`}
          >
            {f === "CHECKED_IN" ? "CHECKED IN" : f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Event</th>
              <th className="p-3">Team</th>
              <th className="p-3">UPI Ref</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Check-In</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-neutral-900">
                <td className="p-3">{r.fullName}</td>
                <td className="p-3 text-neutral-400">{r.userEmail}</td>
                <td className="p-3">{r.eventName}</td>
                <td className="p-3 text-neutral-400">
                  {r.teamSize} ({r.teamMembers?.map((m) => m.name).join(", ") || "solo"})
                </td>
                <td className="p-3 font-mono">{r.paymentRefId}</td>
                <td className="p-3">₹{r.amountPaid}</td>
                <td className="p-3">
                  {r.paymentStatus === "APPROVED" ? (
                    <span className="text-green-400 font-bold">PAID</span>
                  ) : (
                    <button
                      onClick={() => markAsPaid(r.id)}
                      disabled={busyId === r.id}
                      className="rounded bg-amber-400/20 px-2 py-1 text-amber-400 font-semibold hover:bg-amber-400/30 disabled:opacity-40"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleCheckedIn(r.id, !r.checkedIn)}
                    disabled={busyId === r.id}
                    className={`rounded px-2 py-1 font-semibold disabled:opacity-40 ${
                      r.checkedIn
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                    }`}
                  >
                    {r.checkedIn ? "Checked In" : "Check In"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-neutral-500">
                  No registrations{filter !== "ALL" ? ` with status ${filter === "CHECKED_IN" ? "CHECKED IN" : filter}` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
