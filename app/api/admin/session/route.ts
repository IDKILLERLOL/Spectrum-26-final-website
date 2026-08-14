import { NextResponse } from "next/server"
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session"
import { isWhitelisted } from "@/lib/server/firestore-admin-whitelist"
import { getDb } from "@/lib/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"

const STATIC_ADMIN_EMAILS = new Set([
  "i.doshi30@gmail.com",
  "theperfectgamer1812@gmail.com",
  "galamann939@gmail.com",
  "prathampoladia12@gmail.com",
  "saraiyamahir009@gmail.com",
])

/**
 * Called after client-side Firebase Google sign-in. Verifies the ID token,
 * checks the adminWhitelist, and — only if allowed — sets the session cookie.
 */
export async function POST(request: Request) {
  let body: { idToken?: string; accessToken?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
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
  } catch (err: any) {
    console.error("[POST /api/admin/session] token verification failed:", err?.message || err)
    return NextResponse.json({ error: "Could not verify Google sign-in." }, { status: 401 })
  }

  // Check whitelist — static emails always pass, Firestore errors fall back safely
  try {
    const allowed = await isWhitelisted(email)
    if (!allowed) {
      console.log(`[Admin Session] Rejected unauthorized email: ${email}`)
      return NextResponse.json(
        { error: "This Google account is not authorized for admin access." },
        { status: 403 }
      )
    }
  } catch (err: any) {
    console.warn("[Admin Session] Whitelist check warning, checking static allowlist:", err?.message || err)
    if (!STATIC_ADMIN_EMAILS.has(email.toLowerCase().trim())) {
      return NextResponse.json(
        { error: "This Google account is not authorized for admin access." },
        { status: 403 }
      )
    }
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, cookie, SESSION_COOKIE_OPTIONS)

  if (body.accessToken) {
    try {
      const db = getDb()
      await db.collection("systemConfig").doc("gmail").set({
        token: body.accessToken,
        updatedAt: Timestamp.now(),
      })
    } catch (err) {
      console.warn("[POST /api/admin/session] Failed to save gmail token to Firestore (non-fatal):", err)
    }
  }

  return res
}
