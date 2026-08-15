"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { getClientAuth, googleProvider } from "@/lib/firebase/client"
import type { SettingsDoc } from "@/types/firestore"

const inputClass =
  "w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
const labelClass = "text-xs text-neutral-400"
const btnPrimaryClass =
  "rounded border border-amber-400 bg-amber-400 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-amber-300"
const btnSecondaryClass =
  "rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"

type SettingsView = Omit<SettingsDoc, "updatedAt"> & { updatedAt: string }

export function SettingsAdminClient({ settings }: { settings: SettingsView }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [upiVpa, setUpiVpa] = useState(settings.upiVpa)
  const [sheetId, setSheetId] = useState(settings.sheetId)
  const [registrationOpen, setRegistrationOpen] = useState(settings.registrationOpen)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [connectingGmail, setConnectingGmail] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)

  async function handleConnectGmail() {
    setError(null)
    setGmailConnected(false)
    setConnectingGmail(true)
    try {
      const auth = getClientAuth()
      const result = await signInWithPopup(auth, googleProvider)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken

      if (!token) {
        throw new Error("Could not retrieve access token from Google sign-in.")
      }

      const res = await fetch("/api/admin/gmail-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (!res.ok) {
        throw new Error("Failed to save Gmail token on server.")
      }

      setGmailConnected(true)
    } catch (err) {
      setError((err as Error).message ?? "Failed to connect Gmail account.")
    } finally {
      setConnectingGmail(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upiVpa, sheetId, registrationOpen }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to save settings.")
      return
    }
    setSaved(true)
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-xl font-bold">Settings</h1>
      <p className="text-xs text-neutral-500">
        Last updated by {settings.updatedBy} at{" "}
        {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString("en-IN") : "—"}
      </p>

      {error && <p className="rounded border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}
      {saved && (
        <p className="rounded border border-emerald-900 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
          Settings saved.
        </p>
      )}
      {gmailConnected && (
        <p className="rounded border border-emerald-900 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
          ✓ Gmail account connected successfully! Outgoing emails enabled.
        </p>
      )}

      {/* Gmail OAuth popup connection */}
      <div className="flex flex-col gap-2 rounded border border-neutral-800 bg-neutral-900/50 p-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Gmail Integration</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Click below to sign in with your admin Google account. This grants temporary Gmail send permissions so confirmation emails are dispatched automatically.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleConnectGmail}
            disabled={connectingGmail}
            className={btnSecondaryClass}
          >
            {connectingGmail ? "Connecting…" : "Connect Gmail Account"}
          </button>
        </div>
      </div>

      <form className="flex flex-col gap-4 rounded border border-neutral-800 bg-neutral-900/50 p-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>UPI VPA</label>
          <input className={inputClass} value={upiVpa} onChange={(e) => setUpiVpa(e.target.value)} placeholder="spectrum@upi" />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Google Sheet ID</label>
          <input className={inputClass} value={sheetId} onChange={(e) => setSheetId(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={registrationOpen}
            onChange={(e) => setRegistrationOpen(e.target.checked)}
          />
          Registration open site-wide
        </label>
        <div>
          <button type="submit" className={btnPrimaryClass} disabled={isPending}>
            Save settings
          </button>
        </div>
      </form>
    </div>
  )
}
