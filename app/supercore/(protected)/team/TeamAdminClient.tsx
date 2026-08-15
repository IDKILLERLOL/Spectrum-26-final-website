"use client"

import { useState } from "react"
import { Loader2, Plus, Trash2, Edit2, User, Image as ImageIcon } from "lucide-react"

type TeamMember = {
  id: string
  name: string
  role: string
  imageUrl: string
  order?: number
}

export function TeamAdminClient({ initialMembers }: { initialMembers: TeamMember[] }) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openAdd() {
    setEditingId(null)
    setName("")
    setRole("")
    setImageUrl("")
    setError(null)
    setAdding(true)
  }

  function openEdit(m: TeamMember) {
    setAdding(false)
    setEditingId(m.id)
    setName(m.name)
    setRole(m.role)
    setImageUrl(m.imageUrl || "")
    setError(null)
  }

  function cancelForm() {
    setAdding(false)
    setEditingId(null)
    setName("")
    setRole("")
    setImageUrl("")
    setError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !role.trim()) return
    setSaving(true)
    setError(null)

    try {
      if (editingId) {
        // Edit existing
        const res = await fetch(`/api/admin/team/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), role: role.trim(), imageUrl: imageUrl.trim() }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Failed to update member.")
        
        setMembers((prev) =>
          prev.map((m) => (m.id === editingId ? { ...m, name: name.trim(), role: role.trim(), imageUrl: imageUrl.trim() } : m))
        )
        cancelForm()
      } else {
        // Add new
        const res = await fetch("/api/admin/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), role: role.trim(), imageUrl: imageUrl.trim() }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Failed to add member.")

        setMembers((prev) => [
          ...prev,
          { id: data.id, name: name.trim(), role: role.trim(), imageUrl: imageUrl.trim() },
        ])
        cancelForm()
      }
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this team member?")) return
    setDeletingId(id)
    setError(null)

    // Store current members state in case we need to revert
    const prevMembers = [...members]

    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to delete member.")

      // Optimistically remove from list
      setMembers((prev) => prev.filter((m) => m.id !== id))

      // Refresh list from server to ensure consistency
      const listRes = await fetch("/api/admin/team")
      if (listRes.ok) {
        const listData = await listRes.json()
        if (listData) {
          // Check if the deleted member is still in the list (meaning deletion didn't persist)
          const stillExists = listData.some((m: { id: string }) => m.id === id)
          if (stillExists) {
            // Deletion didn't persist, revert optimistic update and show error
            setMembers(prevMembers)
            throw new Error("Deletion did not persist. Please try again.")
          }
          // Deletion persisted, update with server list (should be same as optimistic)
          setMembers(listData)
        }
      } else {
        setError("Failed to refresh team member list.")
        // Revert optimistic update on failure to refresh
        setMembers(prevMembers)
      }
    } catch (err: unknown) {
      setError((err as Error).message)
      // Revert optimistic update on any error
      setMembers(prevMembers)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-400 pb-4">
        <div>
          <h1
            className="text-3xl uppercase tracking-wider text-white"
            style={{ fontFamily: "'Bangers', cursive" }}
          >
            Team Members ({members.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-sans">
            Add, edit, or remove members shown on the public Team page.
          </p>
        </div>
        {!adding && !editingId && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-amber-400 px-4 py-2 text-sm font-bold text-neutral-950 hover:bg-amber-300 transition-colors uppercase tracking-wider"
            style={{ fontFamily: "'Bangers', cursive" }}
          >
            <Plus size={16} /> Add Team Member
          </button>
        )}
      </div>

      {error && <p className="text-sm font-semibold text-red-400">{error}</p>}

      {/* Add / Edit Form */}
      {(adding || editingId) && (
        <form onSubmit={handleSave} className="flex flex-col gap-4 border border-neutral-700 bg-neutral-900 p-5">
          <h2 className="text-lg font-bold text-white uppercase" style={{ fontFamily: "'Bangers', cursive" }}>
            {editingId ? "Edit Team Member" : "Add Team Member"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400 uppercase tracking-wider">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400 uppercase tracking-wider">Role / Title *</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Lead Organizer / Tech Head"
                className="border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400 uppercase tracking-wider">Image URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Image preview if URL given */}
          {imageUrl && (
            <div className="flex items-center gap-3 bg-neutral-950 p-2 border border-neutral-800">
              <div className="size-10 overflow-hidden rounded bg-neutral-800 shrink-0">
                <img src={imageUrl} alt="Preview" className="size-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
              <span className="text-xs text-neutral-400 truncate">{imageUrl}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={cancelForm}
              className="border border-neutral-700 px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-wider"
              style={{ fontFamily: "'Bangers', cursive" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 bg-amber-400 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-300 disabled:opacity-50 uppercase tracking-wider"
              style={{ fontFamily: "'Bangers', cursive" }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Update Member" : "Add Member"}
            </button>
          </div>
        </form>
      )}

      {/* Team Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-3 min-w-0">
              {member.imageUrl ? (
                <div className="size-12 overflow-hidden border border-neutral-700 shrink-0 bg-neutral-950">
                  <img src={member.imageUrl} alt={member.name} className="size-full object-cover" />
                </div>
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center border border-amber-400/40 bg-amber-400/10 text-amber-400 font-bold text-sm">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{member.name}</p>
                <p className="text-xs text-amber-400 truncate">{member.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={() => openEdit(member)}
                className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                disabled={deletingId === member.id}
                className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                title="Delete"
              >
                {deletingId === member.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
          </div>
        ))}

        {members.length === 0 && !adding && (
          <div className="col-span-full border border-dashed border-neutral-800 p-8 text-center text-xs text-neutral-500">
            No team members added yet. Click &quot;Add Team Member&quot; above to create one.
          </div>
        )}
      </div>
    </div>
  )
}
