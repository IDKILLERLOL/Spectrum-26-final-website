"use client"

import * as React from "react"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { getClientAuth, googleProvider } from "@/lib/firebase/client"
import { trackAdminLogin } from "@/lib/analytics/track"

export default function AdminLoginPage() {
  const [error, setError] = React.useState<string | null>(null)
  const [signingIn, setSigningIn] = React.useState(false)

  async function handleGoogleSignIn() {
    console.log('[Admin Login] Starting Google sign-in')
    setSigningIn(true)
    setError(null)
    try {
      const auth = getClientAuth()
      console.log('[Admin Login] Auth obtained')
      const result = await signInWithPopup(auth, googleProvider)
      console.log('[Admin Login] SignInWithPopup result:', result)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const accessToken = credential?.accessToken ?? null
      const idToken = await result.user.getIdToken(true)
      console.log('[Admin Login] ID token obtained')
      const userEmail = result.user.email

      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, accessToken, email: userEmail }),
      })
      console.log('[Admin Login] Fetch response status:', res.status)

      const data = await res.json().catch(() => ({}))
      console.log('[Admin Login] Fetch response data:', data)

      if (!res.ok) {
        trackAdminLogin("failure")
        setError(data.error ?? `Sign-in failed (HTTP ${res.status}).`)
        return
      }

      if (accessToken) {
        localStorage.setItem("spectrum_gmail_token", accessToken)
      }
      sessionStorage.setItem("just_logged_in", "true")

      trackAdminLogin("success")
      window.location.href = "/supercore/registrations"
    } catch (err: any) {
      console.error("[admin login error]", err)
      trackAdminLogin("failure")
      const code = err?.code ? ` [${err.code}]` : ""
      const msg = err?.message || String(err)
      setError(`Google Sign-In failed${code}: ${msg}`)
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-950 px-5 text-neutral-100">
      <div className="flex w-full max-w-sm flex-col gap-4 text-center">
        <h1 className="font-mono text-lg font-bold tracking-wide text-amber-400">SUPERCORE</h1>
        <p className="text-sm text-neutral-400">Sign in with an authorized Google account.</p>
        {error && (
          <div className="text-xs font-semibold text-red-400 bg-red-950/50 p-3 border border-red-800/60 rounded break-words text-left">
            {error}
          </div>
        )}
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
