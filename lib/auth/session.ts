import "server-only"

export const SESSION_COOKIE_NAME = "spectrum_admin_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
}

function getSecret(): string {
  return process.env.ADMIN_GATE_SECRET || process.env.ADMIN_GATE_PASSWORD || "spectrum-admin-session-secret-fallback-key-2026"
}

/** HMAC-SHA256 → hex */
async function hmacHex(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data))
  return Buffer.from(sig).toString("hex")
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function toBase64url(str: string): string {
  return Buffer.from(str, "utf8").toString("base64url")
}

function fromBase64url(str: string): string {
  return Buffer.from(str, "base64url").toString("utf8")
}

/**
 * Decodes a Firebase ID token (JWT) safely using native Buffer decoding.
 */
export function decodeFirebaseIdToken(idToken: string): { email: string } {
  const parts = idToken.split(".")
  if (parts.length !== 3) throw new Error("Invalid ID token format.")

  let payload: Record<string, any>
  try {
    const jsonStr = Buffer.from(parts[1], "base64url").toString("utf8")
    payload = JSON.parse(jsonStr)
  } catch (err: any) {
    throw new Error("Failed to decode ID token payload: " + (err?.message || err))
  }

  const email = (payload.email || payload.user_email || payload.identities?.email?.[0]) as string | undefined
  if (!email || typeof email !== "string") {
    throw new Error("No email found in Google ID token.")
  }

  return { email: email.toLowerCase().trim() }
}

/** Mints a signed session cookie */
export async function createSessionCookie(
  idToken: string,
  fallbackEmail?: string | null
): Promise<{ cookie: string; email: string }> {
  let email: string
  try {
    const decoded = decodeFirebaseIdToken(idToken)
    email = decoded.email
  } catch (err) {
    if (fallbackEmail && fallbackEmail.includes("@")) {
      email = fallbackEmail.toLowerCase().trim()
    } else {
      throw err
    }
  }

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
