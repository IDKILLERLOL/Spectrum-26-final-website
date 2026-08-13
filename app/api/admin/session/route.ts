import { NextResponse } from "next/server"
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session"
import { isWhitelisted } from "@/lib/server/firestore-admin-whitelist"


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

  // Whitelist check — static admins always pass, Firestore errors are non-fatal
  try {
    const allowed = await isWhitelisted(email)
    if (!allowed) {
      console.log(`[Admin Session] Rejected: ${email}`)
      return NextResponse.json(
        { error: "This Google account is not authorized for admin access." },
        { status: 403 }
      )
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE_NAME, cookie, SESSION_COOKIE_OPTIONS)
    return res
  } catch (err: any) {
    // Should never reach here since isWhitelisted has its own fallbacks,
    // but as last resort allow if email is in hardcoded list
    console.error("[Admin Session] Unexpected error in whitelist check:", err?.message ?? err)
    return NextResponse.json({ error: "Sign-in failed: " + (err?.message ?? "unknown error") }, { status: 500 })
  }
}

