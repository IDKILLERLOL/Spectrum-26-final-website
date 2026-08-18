"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus, Trash2, Edit2, Loader2, Utensils, Shirt, ShoppingBag,
  Music, Camera, Laptop, Coffee, Gift, Megaphone, Zap, Star, Globe,
  X, Tag, MapPin
} from "lucide-react"
import { SPONSOR_TAGS, getSponsorTagLabel } from "@/lib/sponsor-tags"

export interface SponsorItem {
  id: string
  name: string
  fields: Record<string, string>
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Lucide icon map for preset tag values (client-side only)
const TAG_ICONS: Record<string, React.ReactNode> = {
  food:         <Utensils size={12} />,
  clothing:     <Shirt size={12} />,
  accessories:  <ShoppingBag size={12} />,
  tech:         <Laptop size={12} />,
  music:        <Music size={12} />,
  photography:  <Camera size={12} />,
  coffee:       <Coffee size={12} />,
  gifts:        <Gift size={12} />,
  marketing:    <Megaphone size={12} />,
  energy:       <Zap size={12} />,
  premium:      <Star size={12} />,
  media:        <Globe size={12} />,
}

function getTagIcon(value: string): React.ReactNode {
  return TAG_ICONS[value] ?? <Tag size={12} />
}

const inputClass =
  "w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
const btnPrimaryClass =
  "rounded border border-amber-400 bg-amber-400 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-300 disabled:opacity-50 flex items-center gap-1.5"
const btnSecondaryClass =
  "rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700"

/** Renders a field value with special handling for instagram and location keys */
function FieldValue({ fieldKey, value }: { fieldKey: string; value: string }) {
  const key = fieldKey.toLowerCase()

  if (key === "instagram") {
    const url = value.startsWith("http") ? value : `https://instagram.com/${value.replace(/^@/, "")}`
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300 font-mono">
        {value}
      </a>
    )
  }

  if (key === "location") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-xs text-emerald-400 hover:bg-neutral-700 hover:text-emerald-300"
      >
        <MapPin size={11} />
        View on Maps
      </a>
    )
  }

  return <span className="text-neutral-200 font-mono">{value}</span>
}

export function SponsorsAdminClient({ initialSponsors }: { initialSponsors: SponsorItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sponsors, setSponsors] = useState<SponsorItem[]>(initialSponsors)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Dynamic Form State
  const [sponsorName, setSponsorName] = useState("")
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  function openCreateForm() {
    setEditingId(null)
    setSponsorName("")
    setCustomFields([])
    setSelectedTags([])
    setCustomTagInput("")
    setError(null)
    setIsFormOpen(true)
  }

  function openEditForm(sponsor: SponsorItem) {
    setEditingId(sponsor.id)
    setSponsorName(sponsor.name)
    const fieldsArray = Object.entries(sponsor.fields || {}).map(([key, value]) => ({ key, value }))
    setCustomFields(fieldsArray)
    setSelectedTags(sponsor.tags || [])
    setCustomTagInput("")
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

  function toggleTag(value: string) {
    setSelectedTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    )
  }

  function addCustomTag() {
    const trimmed = customTagInput.trim().toLowerCase().replace(/\s+/g, "-")
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed])
    }
    setCustomTagInput("")
  }

  function removeTag(value: string) {
    setSelectedTags((prev) => prev.filter((t) => t !== value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sponsorName.trim()) {
      setError("Sponsor name is required.")
      return
    }

    setSaving(true)
    setError(null)

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
          tags: selectedTags,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save sponsor.")

      setIsFormOpen(false)
      const listRes = await fetch("/api/admin/sponsors")
      const listData = await listRes.json()
      if (listRes.ok && listData.sponsors) {
        setSponsors(listData.sponsors)
      }
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

    const prevSponsors = [...sponsors]

    try {
      const res = await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to delete sponsor.")

      setSponsors((prev) => prev.filter((s) => s.id !== id))

      const listRes = await fetch("/api/admin/sponsors")
      if (listRes.ok) {
        const listData = await listRes.json()
        if (listData.sponsors) {
          const stillExists = listData.sponsors.some((s: SponsorItem) => s.id === id)
          if (stillExists) {
            setSponsors(prevSponsors)
            throw new Error("Deletion did not persist. Please try again.")
          }
          setSponsors(listData.sponsors)
        }
        startTransition(() => router.refresh())
      } else {
        setError("Failed to refresh sponsor list.")
        setSponsors(prevSponsors)
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete sponsor.")
      setSponsors(prevSponsors)
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

          {/* Tags Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-semibold uppercase text-neutral-400">Tags</span>
            </div>

            {/* Preset tags */}
            <div className="flex flex-wrap gap-1.5">
              {SPONSOR_TAGS.map((tag) => {
                const active = selectedTags.includes(tag.value)
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleTag(tag.value)}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium border transition-colors ${
                      active
                        ? "border-amber-400 bg-amber-400/20 text-amber-300"
                        : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    {getTagIcon(tag.value)}
                    {tag.label}
                  </button>
                )
              })}
            </div>

            {/* Custom tag input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Custom tag (press Enter)"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag() } }}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700"
              >
                Add
              </button>
            </div>

            {/* Selected tags summary */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tv) => (
                  <span
                    key={tv}
                    className="flex items-center gap-1 rounded bg-amber-400/20 border border-amber-400/50 px-2 py-0.5 text-xs text-amber-300"
                  >
                    {getTagIcon(tv)}
                    {getSponsorTagLabel(tv)}
                    <button type="button" onClick={() => removeTag(tv)} className="ml-0.5 text-amber-400 hover:text-red-400">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Custom Fields */}
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
            <p className="text-[11px] text-neutral-500">
              Tip: Use <span className="text-pink-400 font-mono">instagram</span> as a field name to render it as a clickable link.
            </p>

            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Field (e.g. Email / Instagram / Tier)"
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
        {sponsors.map((sponsor) => {
          const fields = sponsor.fields || {}
          const fieldKeys = Object.keys(fields)

          return (
            <div key={sponsor.id} className="flex flex-col justify-between rounded border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h3 className="text-base font-bold text-white">{sponsor.name}</h3>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEditForm(sponsor)}
                      className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-amber-400"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sponsor.id, sponsor.name)}
                      disabled={deletingId === sponsor.id}
                      className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
                    >
                      {deletingId === sponsor.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {(sponsor.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(sponsor.tags || []).map((tv) => (
                      <span
                        key={tv}
                        className="flex items-center gap-1 rounded bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-400"
                      >
                        {getTagIcon(tv)}
                        {getSponsorTagLabel(tv)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Fields */}
                <div className="flex flex-col gap-1 text-xs">
                  {fieldKeys.length > 0 ? (
                    fieldKeys.map((key) => (
                      <div key={key} className="flex justify-between py-0.5 border-b border-neutral-800/50 last:border-0">
                        <span className="text-neutral-400 font-medium">{key}:</span>
                        <FieldValue fieldKey={key} value={fields[key]} />
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

        {sponsors.length === 0 && (
          <div className="col-span-full rounded border border-neutral-800 bg-neutral-900/50 p-8 text-center text-xs text-neutral-500">
            No sponsors created yet. Click &quot;Add Sponsor&quot; above to create one.
          </div>
        )}
      </div>
    </div>
  )
}
