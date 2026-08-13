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

/** HMAC-SHA256 sign */
async function sign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

/** Constant-time compare */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/**
 * Verifies a Firebase ID token via the public REST API (no Admin SDK needed).
 * Only requires NEXT_PUBLIC_FIREBASE_API_KEY.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<{ email: string }> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set.")

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
    throw new Error(err?.error?.message ?? `Firebase token verification failed (${res.status})`)
  }

  const data = await res.json()
  const user = data?.users?.[0]
  if (!user?.email) throw new Error("No email found in Firebase token.")
  return { email: user.email.toLowerCase() }
}

/**
 * Creates a signed session token: base64(payload).signature
 * Payload: { email, exp } as JSON → base64url
 */
export async function createSessionCookie(idToken: string): Promise<{ cookie: string; email: string }> {
  const { email } = await verifyFirebaseIdToken(idToken)
  const secret = getSecret()

  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString("base64url")
  const sig = await sign(payload, secret)
  const cookie = `${payload}.${sig}`

  return { cookie, email }
}

/**
 * Verifies our own HMAC session cookie and returns { email } or null.
 */
export async function verifySessionCookie(cookie: string | undefined): Promise<{ email: string } | null> {
  if (!cookie) return null
  try {
    const secret = getSecret()
    const dot = cookie.lastIndexOf(".")
    if (dot === -1) return null

    const payload = cookie.slice(0, dot)
    const sig = cookie.slice(dot + 1)
    const expectedSig = await sign(payload, secret)
    if (!safeEqual(sig, expectedSig)) return null

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    if (!data?.email || !data?.exp) return null
    if (Math.floor(Date.now() / 1000) > data.exp) return null

    return { email: data.email }
  } catch {
    return null
  }
}
