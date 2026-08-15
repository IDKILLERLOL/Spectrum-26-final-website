import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifySessionCookie } from "./session"

const SESSION_COOKIE_NAME = "spectrum_admin_session"
import { isWhitelisted } from "@/lib/server/firestore-admin-whitelist"

/**
 * Call at the top of every protected /supercore Server Component and every
 * /api/admin route handler. Defense in depth: re-checks the whitelist on every
 * call rather than trusting session freshness alone, so removing an admin
 * takes effect immediately even mid-session.
 */
export async function requireAdminSession(): Promise<{ email: string }> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  const session = await verifySessionCookie(sessionCookie)
  if (!session) redirect("/supercore/login")

  const allowed = await isWhitelisted(session.email)
  if (!allowed) redirect("/supercore/login")

  return session
}

/** Route-handler variant: returns null instead of redirecting (caller returns its own 401/403 JSON). */
export async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  const session = await verifySessionCookie(sessionCookie)
  if (!session) return null

  const allowed = await isWhitelisted(session.email)
  if (!allowed) return null

  return session
}
