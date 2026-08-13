import { NextResponse } from "next/server"
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session"

/**
 * Hardcoded admin allowlist — sign-in never touches Firestore or Firebase Admin SDK.
 * Keep this in sync with lib/server/firestore-admin-whitelist.ts STATIC_ADMIN_EMAILS.
 */
const STATIC_ADMIN_EMAILS = new Set([
  "i.doshi30@gmail.com",
  "theperfectgamer1812@gmail.com",
  "galamann939@gmail.com",
  "prathampoladia12@gmail.com",
  "saraiyamahir009@gmail.com",
])

export async function POST(request: Request) {
  // Parse body
  let body: { idToken?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!body.idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 })
  }

  // Decode & sign session — pure crypto, no external calls
  let cookie: string
  let email: string
  try {
    const result = await createSessionCookie(body.idToken)
    cookie = result.cookie
    email = result.email
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to decode token." }, { status: 401 })
  }

  // Whitelist check — purely in-memory, zero external dependencies
  if (!STATIC_ADMIN_EMAILS.has(email.toLowerCase().trim())) {
    return NextResponse.json(
      { error: "This Google account is not authorized for admin access." },
      { status: 403 }
    )
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, cookie, SESSION_COOKIE_OPTIONS)
  return res
}
