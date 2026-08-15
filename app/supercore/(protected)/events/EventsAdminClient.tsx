"use client"

import { Fragment, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { SpectrumEvent } from "@/content/spectrum"

const inputClass =
  "w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
const labelClass = "text-xs text-neutral-400"
const btnClass =
  "rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
const btnPrimaryClass =
  "rounded border border-amber-400 bg-amber-400 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-amber-300"
const btnDangerClass =
  "rounded border border-red-900 bg-red-950 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900"

interface FormState {
  id: string
  name: string
  shortName: string
  category: string
  tag: string
  format: string
  fee: string
  feeNumeric: string
  capacity: string
  teamSize: string
  difficulty: string
  color: string
  duration: string
  description: string
  rules: string
  prizes: string
  prizePool: string
  registrationOpen: boolean
  registrationEndsAt: string
  imageUrl: string
}

const emptyForm: FormState = {
  id: "",
  name: "",
  shortName: "",
  category: "",
  tag: "",
  format: "",
  fee: "",
  feeNumeric: "",
  capacity: "",
  teamSize: "",
  difficulty: "1",
  color: "#f59e0b",
  duration: "",
  description: "",
  rules: "",
  prizes: "",
  prizePool: "",
  registrationOpen: true,
  registrationEndsAt: "",
  imageUrl: "",
}

function toFormState(ev: SpectrumEvent): FormState {
  return {
    id: ev.id,
    name: ev.name,
    shortName: ev.shortName,
    category: ev.category,
    tag: ev.tag,
    format: ev.format,
    fee: ev.fee,
    feeNumeric: String(ev.feeNumeric),
    capacity: String(ev.capacity),
    teamSize: ev.teamSize,
    difficulty: String(ev.difficulty),
    color: ev.color,
    duration: ev.duration,
    description: ev.description,
    rules: ev.rules.join("\n"),
    prizes: ev.prizes.map((p) => `${p.place}:${p.reward}`).join("\n"),
    prizePool: ev.prizePool ?? "",
    registrationOpen: ev.registrationOpen,
    registrationEndsAt: ev.registrationEndsAt ? ev.registrationEndsAt.slice(0, 16) : "",
    imageUrl: ev.imageUrl ?? "",
  }
}

function buildPayload(f: FormState) {
  return {
    id: f.id.trim() || undefined,
    name: f.name.trim(),
    shortName: f.shortName.trim() || undefined,
    category: f.category.trim() || undefined,
    tag: f.tag.trim() || undefined,
    format: f.format.trim() || undefined,
    fee: f.fee.trim() || undefined,
    feeNumeric: Number(f.feeNumeric),
    capacity: Number(f.capacity),
    teamSize: f.teamSize.trim() || undefined,
    difficulty: Number(f.difficulty),
    color: f.color.trim() || undefined,
    duration: f.duration.trim() || undefined,
    description: f.description.trim() || undefined,
    rules: f.rules
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean),
    prizes: f.prizes
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [place, ...rest] = line.split(":")
        return { place: (place ?? "").trim(), reward: rest.join(":").trim() }
      }),
    prizePool: f.prizePool.trim() || undefined,
    registrationOpen: f.registrationOpen,
    registrationEndsAt: f.registrationEndsAt ? new Date(f.registrationEndsAt).toISOString() : undefined,
    imageUrl: f.imageUrl.trim() || null,
  }
}

function EventForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  showIdField,
}: {
  initial: FormState
  onSubmit: (payload: ReturnType<typeof buildPayload>) => void
  onCancel?: () => void
  submitLabel: string
  showIdField?: boolean
}) {
  const [form, setForm] = useState<FormState>(initial)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <form
      className="grid grid-cols-2 gap-3 rounded border border-neutral-800 bg-neutral-900/50 p-4 md:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(buildPayload(form))
      }}
    >
      {showIdField && (
        <div className="col-span-2 flex flex-col gap-1 md:col-span-1">
          <label className={labelClass}>ID (optional, slugified from name if blank)</label>
          <input className={inputClass} value={form.id} onChange={(e) => set("id", e.target.value)} />
        </div>
      )}
      <div className="col-span-2 flex flex-col gap-1 md:col-span-1">
        <label className={labelClass}>Name *</label>
        <input className={inputClass} required value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Short name</label>
        <input className={inputClass} value={form.shortName} onChange={(e) => set("shortName", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Category</label>
        <input className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Tag</label>
        <input className={inputClass} value={form.tag} onChange={(e) => set("tag", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Format</label>
        <input className={inputClass} value={form.format} onChange={(e) => set("format", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Fee (display)</label>
        <input className={inputClass} value={form.fee} onChange={(e) => set("fee", e.target.value)} placeholder="₹150 / person" />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Fee (numeric) *</label>
        <input
          className={inputClass}
          required
          type="number"
          value={form.feeNumeric}
          onChange={(e) => set("feeNumeric", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Capacity *</label>
        <input
          className={inputClass}
          required
          type="number"
          value={form.capacity}
          onChange={(e) => set("capacity", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Team size (display)</label>
        <input className={inputClass} value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Difficulty (1-5)</label>
        <select className={inputClass} value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
          {[1, 2, 3, 4, 5].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Color (hex)</label>
        <input className={inputClass} value={form.color} onChange={(e) => set("color", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Duration</label>
        <input className={inputClass} value={form.duration} onChange={(e) => set("duration", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Registration ends at</label>
        <input
          className={inputClass}
          type="datetime-local"
          value={form.registrationEndsAt}
          onChange={(e) => set("registrationEndsAt", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Image URL</label>
        <input className={inputClass} value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Prize Pool (e.g. ₹5,000 / Leave blank to hide)</label>
        <input className={inputClass} value={form.prizePool} onChange={(e) => set("prizePool", e.target.value)} placeholder="₹5,000" />
      </div>
      <div className="col-span-2 flex items-end gap-2 md:col-span-1">
        <label className="flex items-center gap-2 text-xs text-neutral-300">
          <input
            type="checkbox"
            checked={form.registrationOpen}
            onChange={(e) => set("registrationOpen", e.target.checked)}
          />
          Registration open
        </label>
      </div>
      <div className="col-span-2 flex flex-col gap-1 md:col-span-4">
        <label className={labelClass}>Description</label>
        <textarea
          className={inputClass}
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div className="col-span-2 flex flex-col gap-1">
        <label className={labelClass}>Rules (one per line)</label>
        <textarea className={inputClass} rows={3} value={form.rules} onChange={(e) => set("rules", e.target.value)} />
      </div>
      <div className="col-span-2 flex flex-col gap-1">
        <label className={labelClass}>Prizes (place:reward, one per line)</label>
        <textarea
          className={inputClass}
          rows={3}
          value={form.prizes}
          onChange={(e) => set("prizes", e.target.value)}
          placeholder="1st:₹5000"
        />
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

export function EventsAdminClient({ events }: { events: SpectrumEvent[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(payload: ReturnType<typeof buildPayload>) {
    setError(null)
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to create event.")
      return
    }
    setCreating(false)
    startTransition(() => router.refresh())
  }

  async function handleUpdate(id: string, payload: ReturnType<typeof buildPayload>) {
    setError(null)
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to update event.")
      return
    }
    setEditingId(null)
    startTransition(() => router.refresh())
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete event "${id}"? This cannot be undone.`)) return
    setError(null)
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to delete event.")
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Events</h1>
        <button className={btnPrimaryClass} onClick={() => setCreating((v) => !v)}>
          {creating ? "Close" : "+ New event"}
        </button>
      </div>

      {error && <p className="rounded border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}

      {creating && (
        <EventForm
          initial={emptyForm}
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
          submitLabel="Create event"
          showIdField
        />
      )}

      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-900 text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Fee</th>
              <th className="px-3 py-2">Capacity</th>
              <th className="px-3 py-2">Reg. open</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <Fragment key={ev.id}>
                <tr className="border-b border-neutral-800 last:border-0 hover:bg-neutral-900/50">
                  <td className="px-3 py-2">
                    <span className="text-amber-400">{ev.name}</span>
                    <span className="ml-1 text-xs text-neutral-500">({ev.id})</span>
                  </td>
                  <td className="px-3 py-2">{ev.fee}</td>
                  <td className="px-3 py-2">{ev.capacity}</td>
                  <td className="px-3 py-2">{ev.registrationOpen ? "Yes" : "No"}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className={btnClass}
                        onClick={() => setEditingId(editingId === ev.id ? null : ev.id)}
                        disabled={isPending}
                      >
                        {editingId === ev.id ? "Close" : "Edit"}
                      </button>
                      <button className={btnDangerClass} onClick={() => handleDelete(ev.id)} disabled={isPending}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {editingId === ev.id && (
                  <tr>
                    <td colSpan={5} className="p-3">
                      <EventForm
                        initial={toFormState(ev)}
                        onSubmit={(payload) => handleUpdate(ev.id, payload)}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Save changes"
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
