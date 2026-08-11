"use client"

import { Fragment, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { SpectrumEvent } from "@/content/spectrum"
import type { FirestoreWinner } from "@/types/firestore"

const inputClass =
  "w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
const labelClass = "text-xs text-neutral-400"
const btnClass =
  "rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
const btnPrimaryClass =
  "rounded border border-amber-400 bg-amber-400 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-amber-300"
const btnDangerClass =
  "rounded border border-red-900 bg-red-950 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900"

type WinnerRow = Omit<FirestoreWinner, "createdAt" | "updatedAt"> & {
  id: string
  createdAt: string
  updatedAt: string
}
type Place = "1st" | "2nd" | "3rd"

interface FormState {
  eventId: string
  place: Place
  teamName: string
  members: string
  edition: string
}

function toFormState(w: WinnerRow, fallbackEdition: string): FormState {
  return {
    eventId: w.eventId,
    place: w.place,
    teamName: w.teamName,
    members: w.members.join(", "),
    edition: w.edition || fallbackEdition,
  }
}

function buildPayload(f: FormState, events: SpectrumEvent[]) {
  const event = events.find((e) => e.id === f.eventId)
  return {
    eventId: f.eventId,
    eventName: event?.name ?? f.eventId,
    place: f.place,
    teamName: f.teamName.trim(),
    members: f.members
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean),
    edition: f.edition.trim(),
  }
}

function WinnerForm({
  initial,
  events,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: FormState
  events: SpectrumEvent[]
  onSubmit: (payload: ReturnType<typeof buildPayload>) => void
  onCancel?: () => void
  submitLabel: string
}) {
  const [form, setForm] = useState<FormState>(initial)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <form
      className="grid grid-cols-2 gap-3 rounded border border-neutral-800 bg-neutral-900/50 p-4 md:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(buildPayload(form, events))
      }}
    >
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Event *</label>
        <select className={inputClass} required value={form.eventId} onChange={(e) => set("eventId", e.target.value)}>
          <option value="" disabled>
            Select event
          </option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Place *</label>
        <select className={inputClass} value={form.place} onChange={(e) => set("place", e.target.value as Place)}>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="3rd">3rd</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Team name *</label>
        <input
          className={inputClass}
          required
          value={form.teamName}
          onChange={(e) => set("teamName", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Edition *</label>
        <input className={inputClass} required value={form.edition} onChange={(e) => set("edition", e.target.value)} />
      </div>
      <div className="col-span-2 flex flex-col gap-1 md:col-span-4">
        <label className={labelClass}>Members (comma-separated)</label>
        <input className={inputClass} value={form.members} onChange={(e) => set("members", e.target.value)} />
      </div>
      <div className="col-span-2 flex gap-2 md:col-span-4">
        <button type="submit" className={btnPrimaryClass}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={btnClass} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export function WinnersAdminClient({
  winners,
  events,
  defaultEdition,
}: {
  winners: WinnerRow[]
  events: SpectrumEvent[]
  defaultEdition: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const emptyForm: FormState = {
    eventId: events[0]?.id ?? "",
    place: "1st",
    teamName: "",
    members: "",
    edition: defaultEdition,
  }

  async function handleCreate(payload: ReturnType<typeof buildPayload>) {
    setError(null)
    const res = await fetch("/api/admin/winners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to create winner.")
      return
    }
    setCreating(false)
    startTransition(() => router.refresh())
  }

  async function handleUpdate(id: string, payload: ReturnType<typeof buildPayload>) {
    setError(null)
    const res = await fetch(`/api/admin/winners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to update winner.")
      return
    }
    setEditingId(null)
    startTransition(() => router.refresh())
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this winner entry? This cannot be undone.")) return
    setError(null)
    const res = await fetch(`/api/admin/winners/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to delete winner.")
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Winners</h1>
        <button className={btnPrimaryClass} onClick={() => setCreating((v) => !v)}>
          {creating ? "Close" : "+ New winner"}
        </button>
      </div>

      {error && <p className="rounded border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}

      {creating && (
        <WinnerForm
          initial={emptyForm}
          events={events}
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
          submitLabel="Create winner"
        />
      )}

      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-900 text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Place</th>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2">Edition</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {winners.map((w) => (
              <Fragment key={w.id}>
                <tr className="border-b border-neutral-800 last:border-0 hover:bg-neutral-900/50">
                  <td className="px-3 py-2">{w.eventName}</td>
                  <td className="px-3 py-2">{w.place}</td>
                  <td className="px-3 py-2 text-amber-400">{w.teamName}</td>
                  <td className="px-3 py-2">{w.edition}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className={btnClass}
                        onClick={() => setEditingId(editingId === w.id ? null : w.id)}
                        disabled={isPending}
                      >
                        {editingId === w.id ? "Close" : "Edit"}
                      </button>
                      <button className={btnDangerClass} onClick={() => handleDelete(w.id)} disabled={isPending}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {editingId === w.id && (
                  <tr>
                    <td colSpan={5} className="p-3">
                      <WinnerForm
                        initial={toFormState(w, defaultEdition)}
                        events={events}
                        onSubmit={(payload) => handleUpdate(w.id, payload)}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Save changes"
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {winners.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                  No winners recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
