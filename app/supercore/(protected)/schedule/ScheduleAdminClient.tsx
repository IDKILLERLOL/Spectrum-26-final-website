"use client"

import { Fragment, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { ScheduleItem } from "@/content/spectrum"

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
  date: string
  order: string
  time: string
  title: string
  description: string
}

const emptyForm: FormState = { date: "2026-09-30", order: "", time: "", title: "", description: "" }

function toFormState(item: ScheduleItem): FormState {
  return {
    date: item.date,
    order: String(item.order),
    time: item.time,
    title: item.title,
    description: item.description,
  }
}

function buildPayload(f: FormState) {
  return {
    date: f.date.trim(),
    order: Number(f.order),
    time: f.time.trim(),
    title: f.title.trim(),
    description: f.description.trim(),
  }
}

function scheduleId(item: ScheduleItem): string {
  return `${item.date}-${item.order}`
}

function ScheduleForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: FormState
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
        onSubmit(buildPayload(form))
      }}
    >
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Date (YYYY-MM-DD) *</label>
        <input className={inputClass} required value={form.date} onChange={(e) => set("date", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Order *</label>
        <input
          className={inputClass}
          required
          type="number"
          value={form.order}
          onChange={(e) => set("order", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Time *</label>
        <input
          className={inputClass}
          required
          value={form.time}
          onChange={(e) => set("time", e.target.value)}
          placeholder="10:00 AM"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Title *</label>
        <input className={inputClass} required value={form.title} onChange={(e) => set("title", e.target.value)} />
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

export function ScheduleAdminClient({ schedule }: { schedule: ScheduleItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(payload: ReturnType<typeof buildPayload>) {
    setError(null)
    const res = await fetch("/api/admin/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to create schedule item.")
      return
    }
    setCreating(false)
    startTransition(() => router.refresh())
  }

  async function handleUpdate(id: string, payload: ReturnType<typeof buildPayload>) {
    setError(null)
    const res = await fetch(`/api/admin/schedule/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to update schedule item.")
      return
    }
    setEditingId(null)
    startTransition(() => router.refresh())
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete schedule item "${id}"? This cannot be undone.`)) return
    setError(null)
    const res = await fetch(`/api/admin/schedule/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to delete schedule item.")
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Schedule</h1>
        <button className={btnPrimaryClass} onClick={() => setCreating((v) => !v)}>
          {creating ? "Close" : "+ New item"}
        </button>
      </div>

      {error && <p className="rounded border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}

      {creating && (
        <ScheduleForm initial={emptyForm} onSubmit={handleCreate} onCancel={() => setCreating(false)} submitLabel="Create item" />
      )}

      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-900 text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item) => {
              const id = scheduleId(item)
              return (
                <Fragment key={id}>
                  <tr className="border-b border-neutral-800 last:border-0 hover:bg-neutral-900/50">
                    <td className="px-3 py-2">{item.date}</td>
                    <td className="px-3 py-2">{item.order}</td>
                    <td className="px-3 py-2">{item.time}</td>
                    <td className="px-3 py-2 text-amber-400">{item.title}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className={btnClass}
                          onClick={() => setEditingId(editingId === id ? null : id)}
                          disabled={isPending}
                        >
                          {editingId === id ? "Close" : "Edit"}
                        </button>
                        <button className={btnDangerClass} onClick={() => handleDelete(id)} disabled={isPending}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === id && (
                    <tr>
                      <td colSpan={5} className="p-3">
                        <ScheduleForm
                          initial={toFormState(item)}
                          onSubmit={(payload) => handleUpdate(id, payload)}
                          onCancel={() => setEditingId(null)}
                          submitLabel="Save changes"
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
            {schedule.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                  No schedule items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
