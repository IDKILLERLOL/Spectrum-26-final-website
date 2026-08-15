"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function AdminGatePage() {
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Incorrect password.")
        return
      }
      router.push("/supercore/login")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-950 px-5 text-neutral-100">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="font-mono text-lg font-bold tracking-wide text-amber-400">SUPERCORE</h1>
        <p className="text-sm text-neutral-400">Enter the admin gate password to continue.</p>
        <input
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Gate password"
          className="rounded border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-amber-400"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="rounded bg-amber-400 py-3 text-sm font-bold text-neutral-950 disabled:opacity-40"
        >
          {submitting ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  )
}
