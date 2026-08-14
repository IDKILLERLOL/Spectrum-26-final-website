"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { getClientAuth, googleProvider } from "@/lib/firebase/client"
import { trackAdminLogin } from "@/lib/analytics/track"

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [signingIn, setSigningIn] = React.useState(false)

  async function handleGoogleSignIn() {
    setSigningIn(true)
    setError(null)
    try {
      const result = await signInWithPopup(getClientAuth(), googleProvider)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const accessToken = credential?.accessToken ?? null
      const idToken = await result.user.getIdToken()

      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, accessToken }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        trackAdminLogin("failure")
        setError(data.error ?? `Sign-in failed (HTTP ${res.status}).`)
        return
      }

      if (accessToken) {
        localStorage.setItem("spectrum_gmail_token", accessToken)
      }

      trackAdminLogin("success")
      router.push("/supercore/registrations")
    } catch (err: any) {
      console.error("[admin login]", err)
      trackAdminLogin("failure")
      const code = err?.code ? ` (${err.code})` : ""
      const msg = err?.message || String(err)
      setError(`Google sign-in error${code}: ${msg}`)
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-950 px-5 text-neutral-100">
      <div className="flex w-full max-w-sm flex-col gap-4 text-center">
        <h1 className="font-mono text-lg font-bold tracking-wide text-amber-400">SUPERCORE</h1>
        <p className="text-sm text-neutral-400">Sign in with an authorized Google account.</p>
        {error && <p className="text-xs font-semibold text-red-400 bg-red-950/40 p-3 border border-red-800/50 rounded break-words">{error}</p>}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="rounded bg-white py-3 text-sm font-bold text-neutral-950 hover:bg-neutral-200 transition-colors disabled:opacity-40"
        >
          {signingIn ? "Signing in…" : "Sign in with Google"}
        </button>
      </div>
    </div>
  )
}
