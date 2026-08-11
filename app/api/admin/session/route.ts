import { NextResponse } from "next/server"
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session"
import { isWhitelisted, bootstrapIfEmpty } from "@/lib/server/firestore-admin-whitelist"

/**
 * Called after client-side Firebase Google sign-in. Verifies the ID token,
 * checks (or bootstraps) the adminWhitelist, and — only if allowed — sets the
 * session cookie. This is where "Google-authenticated but not whitelisted"
 * sign-ins actually get rejected.
 */
export async function POST(request: Request) {
  let body: { idToken?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (!body.idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 })
  }

  let cookie: string
  let email: string
  try {
    const result = await createSessionCookie(body.idToken)
    cookie = result.cookie
    email = result.email
  } catch (err) {
    console.error("[POST /api/admin/session] token verification failed:", err)
    return NextResponse.json({ error: "Could not verify Google sign-in." }, { status: 401 })
  }

  const bootstrapped = await bootstrapIfEmpty(email)
  if (!bootstrapped) {
    const allowed = await isWhitelisted(email)
    if (!allowed) {
      return NextResponse.json(
        { error: "This Google account is not authorized for admin access." },
        { status: 403 }
      )
    }
  }

  const res = NextResponse.json({ ok: true, bootstrapped })
  res.cookies.set(SESSION_COOKIE_NAME, cookie, SESSION_COOKIE_OPTIONS)
  return res
}
