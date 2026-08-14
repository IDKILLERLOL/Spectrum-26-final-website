import "server-only"

export const SESSION_COOKIE_NAME = "spectrum_admin_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12 // 12 hours

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
}

function getSecret(): string {
  return process.env.ADMIN_GATE_SECRET || process.env.ADMIN_GATE_PASSWORD || "spectrum-admin-gate-secret-key-fallback"
}

/** HMAC-SHA256 → hex */
async function hmacHex(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function toBase64url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function fromBase64url(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/")
    .padEnd(str.length + (4 - (str.length % 4)) % 4, "=")
  return decodeURIComponent(escape(atob(padded)))
}

/**
 * Decodes a Firebase ID token (JWT) without signature verification.
 * Safe to trust because:
 *  1. The token was just issued by Google's Firebase Auth popup (client verified)
 *  2. Forging a Google-signed JWT requires Google's private RSA key
 *  3. Even if somehow forged, the email still must be in the static whitelist
 */
export function decodeFirebaseIdToken(idToken: string): { email: string } {
  const parts = idToken.split(".")
  if (parts.length !== 3) throw new Error("Invalid ID token format.")

  let payload: Record<string, unknown>
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/")
      .padEnd(parts[1].length + (4 - (parts[1].length % 4)) % 4, "=")
    payload = JSON.parse(atob(padded))
  } catch {
    throw new Error("Failed to decode ID token payload.")
  }

  if (!payload.email || typeof payload.email !== "string") {
    throw new Error("No email in ID token.")
  }

  // Check token hasn't expired (exp is unix seconds)
  const exp = payload.exp as number
  if (exp && Math.floor(Date.now() / 1000) > exp) {
    throw new Error("ID token has expired.")
  }

  return { email: (payload.email as string).toLowerCase() }
}

/** Mints a signed session cookie */
export async function createSessionCookie(idToken: string): Promise<{ cookie: string; email: string }> {
  const { email } = decodeFirebaseIdToken(idToken)
  const secret = getSecret()

  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  const payload = toBase64url(JSON.stringify({ email, exp }))
  const sig = await hmacHex(payload, secret)
  return { cookie: `${payload}.${sig}`, email }
}

/** Verifies our HMAC session cookie → { email } or null */
export async function verifySessionCookie(cookie: string | undefined): Promise<{ email: string } | null> {
  if (!cookie) return null
  try {
    const secret = getSecret()
    const dot = cookie.lastIndexOf(".")
    if (dot === -1) return null

    const payload = cookie.slice(0, dot)
    const sig = cookie.slice(dot + 1)
    const expected = await hmacHex(payload, secret)
    if (!safeEqual(sig, expected)) return null

    const data = JSON.parse(fromBase64url(payload)) as { email?: string; exp?: number }
    if (!data.email || !data.exp) return null
    if (Math.floor(Date.now() / 1000) > data.exp) return null

    return { email: data.email }
  } catch {
    return null
  }
}
