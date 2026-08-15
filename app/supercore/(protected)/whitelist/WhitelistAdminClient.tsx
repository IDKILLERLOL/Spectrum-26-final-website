"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { AdminWhitelistEntry } from "@/types/firestore"

const inputClass =
  "w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
const btnPrimaryClass =
  "rounded border border-amber-400 bg-amber-400 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-amber-300"
const btnDangerClass =
  "rounded border border-red-900 bg-red-950 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900"

type WhitelistRow = Omit<AdminWhitelistEntry, "addedAt"> & { id: string; addedAt: string }

export function WhitelistAdminClient({ whitelist }: { whitelist: WhitelistRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch("/api/admin/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to add email.")
      return
    }
    setEmail("")
    startTransition(() => router.refresh())
  }

  async function handleRemove(id: string, targetEmail?: string) {
    const label = targetEmail || "this entry"
    if (!confirm(`Remove "${label}" from the admin whitelist?`)) return
    setError(null)
    const res = await fetch(`/api/admin/whitelist/${encodeURIComponent(id || targetEmail || "")}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to remove email.")
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Admin Whitelist</h1>
      <p className="text-sm text-neutral-400">
        Only Google accounts listed here can sign in to Supercore. The first sign-in when this list is empty
        auto-bootstraps as the first admin.
      </p>

      {error && <p className="rounded border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}

      <form className="flex gap-2" onSubmit={handleAdd}>
        <input
          className={inputClass}
          type="email"
          required
          placeholder="someone@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className={btnPrimaryClass} disabled={isPending}>
          Add
        </button>
      </form>

      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-900 text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Added by</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {whitelist.map((entry) => (
              <tr key={entry.id} className="border-b border-neutral-800 last:border-0 hover:bg-neutral-900/50">
                <td className="px-3 py-2 text-amber-400">{entry.email || "(no email)"}</td>
                <td className="px-3 py-2">{entry.addedBy || "-"}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    className={btnDangerClass}
                    onClick={() => handleRemove(entry.id, entry.email)}
                    disabled={isPending}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {whitelist.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-neutral-500">
                  No admins whitelisted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
