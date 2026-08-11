/**
 * HMAC sign/verify for the admin gate cookie, using Web Crypto (`crypto.subtle`)
 * so this works unmodified in Next.js Edge middleware as well as Node routes.
 * Signs a fixed payload ("admin-gate") with ADMIN_GATE_SECRET — proves the
 * cookie was issued by our server after a correct password check, without
 * storing the password itself in the cookie.
 */
const PAYLOAD = "admin-gate"
export const GATE_COOKIE_NAME = "spectrum_admin_gate"
const GATE_MAX_AGE_SECONDS = 60 * 60 * 12 // 12h

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ])
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function signGateToken(secret: string): Promise<string> {
  const key = await getKey(secret)
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(PAYLOAD))
  return toHex(sig)
}

export async function verifyGateToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false
  const expected = await signGateToken(secret)
  // constant-time-ish comparison (length check + char compare) — not critical here since
  // the token isn't a secret itself, just a proof of prior password verification.
  if (token.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

export const GATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: GATE_MAX_AGE_SECONDS,
}
