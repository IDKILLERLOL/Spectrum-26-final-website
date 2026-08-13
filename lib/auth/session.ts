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
  const s = process.env.ADMIN_GATE_SECRET
  if (!s) throw new Error("ADMIN_GATE_SECRET env var is not set.")
  return s
}

/** HMAC-SHA256 → hex string */
async function hmacHex(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** btoa-safe base64url encode */
function toBase64url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

/** base64url decode */
function fromBase64url(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + (4 - str.length % 4) % 4, "=")
  return atob(padded)
}

/**
 * Verifies a Firebase ID token via the public REST API.
 * Only requires NEXT_PUBLIC_FIREBASE_API_KEY — no Admin SDK / private key needed.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<{ email: string }> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set in environment.")

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Firebase token lookup failed (HTTP ${res.status})`)
  }

  const data = await res.json()
  const user = data?.users?.[0]
  if (!user?.email) throw new Error("No email found in Firebase token response.")
  return { email: (user.email as string).toLowerCase() }
}

/**
 * Mints a signed session cookie: base64url(payload).hmacHex
 */
export async function createSessionCookie(idToken: string): Promise<{ cookie: string; email: string }> {
  const { email } = await verifyFirebaseIdToken(idToken)
  const secret = getSecret()

  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  const payload = toBase64url(JSON.stringify({ email, exp }))
  const sig = await hmacHex(payload, secret)
  return { cookie: `${payload}.${sig}`, email }
}

/**
 * Verifies our HMAC session cookie. Returns { email } or null.
 */
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
