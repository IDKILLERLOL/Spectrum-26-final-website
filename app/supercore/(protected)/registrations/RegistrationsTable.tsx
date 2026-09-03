"use client"

import * as React from "react"
import type { FirestoreRegistration } from "@/types/firestore"
import { INK, MUSTARD, VERMILION, AGED_PAPER, TEAL, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

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

  async function togglePaidStatus(id: string, newStatus: "APPROVED" | "PENDING") {
    setBusyId(id)
    const token = typeof window !== "undefined" ? localStorage.getItem("spectrum_gmail_token") : null
    try {
      const res = await fetch(`/api/admin/registrations/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "X-Gmail-Token": token } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, paymentStatus: newStatus } : r))
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
    <div className={`flex flex-col gap-4 ${questBody.className}`}>
      <div className="flex flex-wrap gap-2 text-xs">
        {(["ALL", "PENDING", "PAID", "CHECKED_IN"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="border-2 px-3 py-1.5 font-bold uppercase transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{
              borderColor: INK,
              background: filter === f ? INK : AGED_PAPER,
              color: filter === f ? MUSTARD : INK,
              boxShadow: `2px 2px 0px ${INK}`,
            }}
          >
            {f === "CHECKED_IN" ? "CHECKED IN" : f}
          </button>
        ))}
      </div>

      <div
        className="overflow-x-auto border-4 bg-white"
        style={{ borderColor: INK, boxShadow: hoardingShadow }}
      >
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="border-b-2 font-bold uppercase tracking-wider" style={{ borderColor: INK, color: INK }}>
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
          <tbody style={{ color: INK }}>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b" style={{ borderColor: `${INK}20` }}>
                <td className="p-3 font-bold">{r.fullName}</td>
                <td className="p-3 opacity-80">{r.userEmail}</td>
                <td className="p-3 font-semibold">{r.eventName}</td>
                <td className="p-3 opacity-80">
                  {r.teamSize} ({r.teamMembers?.map((m: any) => m.name).join(", ") || "solo"}
                  {r.eventId?.toLowerCase() === "bgmi"
                    ? ` | Sub: ${(r as any).substitute?.name || (r as any).substituteName || "-"}`
                    : ""})
                </td>
                <td className="p-3 font-mono font-bold">{r.paymentRefId}</td>
                <td className="p-3 font-bold">₹{r.amountPaid}</td>
                <td className="p-3">
                  {r.paymentStatus === "APPROVED" ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: TEAL }}>PAID</span>
                      <button
                        onClick={() => togglePaidStatus(r.id, "PENDING")}
                        disabled={busyId === r.id}
                        className="text-[10px] font-bold underline hover:opacity-85 transition-opacity"
                        style={{ color: VERMILION }}
                      >
                        (Un-Approve)
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => togglePaidStatus(r.id, "APPROVED")}
                      disabled={busyId === r.id}
                      className="border-2 px-2.5 py-1 text-[10px] font-bold uppercase transition-all active:scale-95"
                      style={{ borderColor: INK, background: MUSTARD, color: INK, boxShadow: `1.5px 1.5px 0px ${INK}` }}
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleCheckedIn(r.id, !r.checkedIn)}
                    disabled={busyId === r.id}
                    className="border-2 px-2.5 py-1 text-[10px] font-bold uppercase transition-all active:scale-95"
                    style={{
                      borderColor: INK,
                      background: r.checkedIn ? TEAL : VERMILION,
                      color: "#FFFFFF",
                      boxShadow: `1.5px 1.5px 0px ${INK}`,
                    }}
                  >
                    {r.checkedIn ? "Checked In" : "Check In"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center font-bold opacity-60">
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
