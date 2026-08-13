import "server-only"
import { getAdminAuth } from "@/lib/firebase/admin"

export const SESSION_COOKIE_NAME = "spectrum_admin_session"
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 12 // 12h, matches the gate cookie

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

/** Verifies a client Firebase ID token (from signInWithPopup) and mints a long-lived session cookie. */
export async function createSessionCookie(idToken: string): Promise<{ cookie: string; email: string }> {
  const decoded = await getAdminAuth().verifyIdToken(idToken)
  if (!decoded.email) throw new Error("Google account has no email.")

  const cookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS })
  return { cookie, email: decoded.email.toLowerCase() }
}

export async function verifySessionCookie(cookie: string | undefined): Promise<{ email: string } | null> {
  if (!cookie) return null
  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookie, true)
    if (!decoded.email) return null
    return { email: decoded.email.toLowerCase() }
  } catch {
    return null
  }
}
