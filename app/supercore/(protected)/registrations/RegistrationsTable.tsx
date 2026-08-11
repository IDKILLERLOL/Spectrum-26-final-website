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
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-amber-400",
  APPROVED: "text-green-400",
  REJECTED: "text-red-400",
}

export function RegistrationsTable({ initialRegistrations }: { initialRegistrations: SerializedRegistration[] }) {
  const [registrations, setRegistrations] = React.useState(initialRegistrations)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")

  async function setStatus(id: string, status: "APPROVED" | "REJECTED") {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/registrations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, paymentStatus: status } : r)))
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? "Failed to update status.")
      }
    } finally {
      setBusyId(null)
    }
  }

  const filtered = filter === "ALL" ? registrations : registrations.filter((r) => r.paymentStatus === filter)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 text-xs">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1.5 ${filter === f ? "bg-amber-400 text-neutral-950 font-bold" : "bg-neutral-900 text-neutral-300"}`}
          >
            {f}
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
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
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
                <td className={`p-3 font-bold ${STATUS_COLOR[r.paymentStatus]}`}>{r.paymentStatus}</td>
                <td className="p-3">
                  {r.paymentStatus === "PENDING" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStatus(r.id, "APPROVED")}
                        disabled={busyId === r.id}
                        className="rounded bg-green-500/20 px-2 py-1 text-green-400 disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setStatus(r.id, "REJECTED")}
                        disabled={busyId === r.id}
                        className="rounded bg-red-500/20 px-2 py-1 text-red-400 disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-neutral-500">{r.paymentVerifiedBy ?? "—"}</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-neutral-500">
                  No registrations{filter !== "ALL" ? ` with status ${filter}` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
