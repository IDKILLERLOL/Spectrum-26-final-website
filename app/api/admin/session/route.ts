import { NextResponse } from "next/server"
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session"
import { isWhitelisted, bootstrapIfEmpty } from "@/lib/server/firestore-admin-whitelist"

/**
 * Called after client-side Firebase Google sign-in. Verifies the ID token,
 * checks (or bootstraps) the adminWhitelist, and — only if allowed — sets the
 * session cookie.
 */
export async function POST(request: Request) {
  let body: { idToken?: string; accessToken?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (!body.idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 })
  }

  // Verify the Firebase ID token and mint a session cookie
  let cookie: string
  let email: string
  try {
    const result = await createSessionCookie(body.idToken)
    cookie = result.cookie
    email = result.email
  } catch (err: any) {
    const msg = err?.message ?? String(err)
    console.error("[POST /api/admin/session] createSessionCookie failed:", msg)
    return NextResponse.json({ error: msg }, { status: 401 })
  }

  // Whitelist check (with ENV fallback already built-in to isWhitelisted)
  try {
    const bootstrapped = await bootstrapIfEmpty(email)
    if (!bootstrapped) {
      const allowed = await isWhitelisted(email)
      if (!allowed) {
        console.log(`[Admin Session] Rejected: ${email}`)
        return NextResponse.json(
          { error: "This Google account is not authorized for admin access." },
          { status: 403 }
        )
      }
    }

    const res = NextResponse.json({ ok: true, bootstrapped })
    res.cookies.set(SESSION_COOKIE_NAME, cookie, SESSION_COOKIE_OPTIONS)
    return res
  } catch (err: any) {
    console.error("[POST /api/admin/session] whitelist check failed:", err?.message ?? err)
    // Whitelist check failed (e.g. Firestore unavailable) — allow ENV-fallback emails anyway
    const envEmails = (process.env.ADMIN_EMAILS || process.env.VITE_BOOTSTRAP_ADMIN_EMAIL || "i.doshi30@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
    if (envEmails.includes(email.toLowerCase())) {
      const res = NextResponse.json({ ok: true, bootstrapped: false })
      res.cookies.set(SESSION_COOKIE_NAME, cookie, SESSION_COOKIE_OPTIONS)
      return res
    }
    return NextResponse.json({ error: "Sign-in failed: could not verify authorization." }, { status: 500 })
  }
}
