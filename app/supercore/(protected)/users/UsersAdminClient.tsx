"use client"

import { Fragment, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { FirestoreUser } from "@/types/firestore"

const inputClass =
  "w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
const labelClass = "text-xs text-neutral-400"
const btnClass =
  "rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
const btnPrimaryClass =
  "rounded border border-amber-400 bg-amber-400 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-amber-300"
const btnDangerClass =
  "rounded border border-red-900 bg-red-950 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900"

type UserRow = Omit<FirestoreUser, "createdAt" | "updatedAt"> & {
  id: string
  createdAt: string
  updatedAt: string
}

interface FormState {
  fullName: string
  phone: string
  collegeName: string
  year: string
}

function toFormState(u: UserRow): FormState {
  return { fullName: u.fullName, phone: u.phone, collegeName: u.collegeName, year: u.year }
}

export function UsersAdminClient({ users }: { users: UserRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ fullName: "", phone: "", collegeName: "", year: "" })
  const [error, setError] = useState<string | null>(null)

  function startEdit(u: UserRow) {
    setEditingId(u.id)
    setForm(toFormState(u))
  }

  async function handleUpdate(id: string) {
    setError(null)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to update user.")
      return
    }
    setEditingId(null)
    startTransition(() => router.refresh())
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return
    setError(null)
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to delete user.")
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Users</h1>

      {error && <p className="rounded border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-900 text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Full name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">College</th>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Registrations</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <Fragment key={u.id}>
                <tr className="border-b border-neutral-800 last:border-0 hover:bg-neutral-900/50">
                  <td className="px-3 py-2 text-amber-400">{u.email}</td>
                  <td className="px-3 py-2">{u.fullName}</td>
                  <td className="px-3 py-2">{u.phone}</td>
                  <td className="px-3 py-2">{u.collegeName}</td>
                  <td className="px-3 py-2">{u.year}</td>
                  <td className="px-3 py-2">{u.totalRegistrations}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className={btnClass}
                        onClick={() => (editingId === u.id ? setEditingId(null) : startEdit(u))}
                        disabled={isPending}
                      >
                        {editingId === u.id ? "Close" : "Edit"}
                      </button>
                      <button className={btnDangerClass} onClick={() => handleDelete(u.id, u.email)} disabled={isPending}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {editingId === u.id && (
                  <tr>
                    <td colSpan={7} className="p-3">
                      <form
                        className="grid grid-cols-2 gap-3 rounded border border-neutral-800 bg-neutral-900/50 p-4 md:grid-cols-4"
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleUpdate(u.id)
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          <label className={labelClass}>Full name</label>
                          <input
                            className={inputClass}
                            value={form.fullName}
                            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className={labelClass}>Phone</label>
                          <input
                            className={inputClass}
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className={labelClass}>College</label>
                          <input
                            className={inputClass}
                            value={form.collegeName}
                            onChange={(e) => setForm((f) => ({ ...f, collegeName: e.target.value }))}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className={labelClass}>Year</label>
                          <input
                            className={inputClass}
                            value={form.year}
                            onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                          />
                        </div>
                        <div className="col-span-2 flex gap-2 md:col-span-4">
                          <button type="submit" className={btnPrimaryClass}>
                            Save changes
                          </button>
                          <button type="button" className={btnClass} onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-neutral-500">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
