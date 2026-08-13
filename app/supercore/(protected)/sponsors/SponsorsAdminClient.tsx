"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react"

export interface SponsorItem {
  id: string
  name: string
  fields: Record<string, string>
  createdAt: string
  updatedAt: string
}

const inputClass =
  "w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
const btnPrimaryClass =
  "rounded border border-amber-400 bg-amber-400 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-300 disabled:opacity-50 flex items-center gap-1.5"
const btnSecondaryClass =
  "rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700"

export function SponsorsAdminClient({ initialSponsors }: { initialSponsors: SponsorItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sponsors, setSponsors] = useState<SponsorItem[]>(initialSponsors)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Dynamic Form State
  const [sponsorName, setSponsorName] = useState("")
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  function openCreateForm() {
    setEditingId(null)
    setSponsorName("")
    setCustomFields([])
    setError(null)
    setIsFormOpen(true)
  }

  function openEditForm(sponsor: SponsorItem) {
    setEditingId(sponsor.id)
    setSponsorName(sponsor.name)
    const fieldsArray = Object.entries(sponsor.fields || {}).map(([key, value]) => ({ key, value }))
    setCustomFields(fieldsArray)
    setError(null)
    setIsFormOpen(true)
  }

  function handleAddField() {
    setCustomFields((prev) => [...prev, { key: "", value: "" }])
  }

  function handleRemoveField(index: number) {
    setCustomFields((prev) => prev.filter((_, i) => i !== index))
  }

  function handleFieldChange(index: number, keyOrValue: "key" | "value", text: string) {
    setCustomFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [keyOrValue]: text } : item))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sponsorName.trim()) {
      setError("Sponsor name is required.")
      return
    }

    setSaving(true)
    setError(null)

    // Build fields map from key-value pairs
    const fieldsMap: Record<string, string> = {}
    customFields.forEach(({ key, value }) => {
      const trimmedKey = key.trim()
      if (trimmedKey) {
        fieldsMap[trimmedKey] = value
      }
    })

    try {
      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: sponsorName.trim(),
          fields: fieldsMap,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save sponsor.")

      setIsFormOpen(false)
      startTransition(() => router.refresh())
    } catch (err: any) {
      setError(err.message || "Failed to save sponsor.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete sponsor "${name}"?`)) return
    setDeletingId(id)
    setError(null)

    try {
      const res = await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to delete sponsor.")

      setSponsors((prev) => prev.filter((s) => s.id !== id))
      startTransition(() => router.refresh())
    } catch (err: any) {
      setError(err.message || "Failed to delete sponsor.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sponsors</h1>
          <p className="text-sm text-neutral-400">Manage event sponsors with custom flexible field-value pairs.</p>
        </div>
        {!isFormOpen && (
          <button onClick={openCreateForm} className={btnPrimaryClass}>
            <Plus size={14} /> Add Sponsor
          </button>
        )}
      </div>

      {error && <div className="rounded border border-red-900 bg-red-950 p-3 text-xs text-red-300">{error}</div>}

      {/* Dynamic Form Panel */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            {editingId ? "Edit Sponsor" : "Add New Sponsor"}
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-300">Sponsor Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Red Bull / Monster Energy"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-semibold uppercase text-neutral-400">Custom Field-Value Pairs</span>
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center gap-1 text-xs text-amber-400 hover:underline"
              >
                <Plus size={12} /> Add Field
              </button>
            </div>

            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Field (e.g. Email / Phone / Tier)"
                  value={field.key}
                  onChange={(e) => handleFieldChange(idx, "key", e.target.value)}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => handleFieldChange(idx, "value", e.target.value)}
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="rounded p-2 text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {customFields.length === 0 && (
              <p className="text-xs italic text-neutral-500">No custom fields added yet. Click &quot;Add Field&quot; above to add details like Email, Phone, Website, etc.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className={btnSecondaryClass}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimaryClass}>
              {saving && <Loader2 size={12} className="animate-spin" />} Save Sponsor
            </button>
          </div>
        </form>
      )}

      {/* Sponsors Table / Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {initialSponsors.map((sponsor) => {
          const fields = sponsor.fields || {}
          const fieldKeys = Object.keys(fields)

          return (
            <div key={sponsor.id} className="flex flex-col justify-between rounded border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h3 className="text-base font-bold text-white">{sponsor.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditForm(sponsor)}
                      className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-amber-400"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor.id, sponsor.name)}
                      disabled={deletingId === sponsor.id}
                      className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
                    >
                      {deletingId === sponsor.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  {fieldKeys.length > 0 ? (
                    fieldKeys.map((key) => (
                      <div key={key} className="flex justify-between py-0.5 border-b border-neutral-800/50 last:border-0">
                        <span className="text-neutral-400 font-medium">{key}:</span>
                        <span className="text-neutral-200 font-mono">{fields[key]}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-neutral-500 italic">No extra attributes specified.</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {initialSponsors.length === 0 && (
          <div className="col-span-full rounded border border-neutral-800 bg-neutral-900/50 p-8 text-center text-xs text-neutral-500">
            No sponsors created yet. Click &quot;Add Sponsor&quot; above to create one.
          </div>
        )}
      </div>
    </div>
  )
}
