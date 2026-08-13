import { NextResponse, type NextRequest } from "next/server"

const GATE_COOKIE_NAME = "spectrum_admin_gate"
const SESSION_COOKIE_NAME = "spectrum_admin_session"

async function verifyGateToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("admin-gate"))
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("")
  if (token.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isGateRoute = pathname === "/supercore/gate"
  const isLoginRoute = pathname === "/supercore/login"
  const isAdminApi = pathname.startsWith("/api/admin")
  const isAdminApp = pathname.startsWith("/supercore")

  // Ignore unrelated routes
  if (!isAdminApp && !isAdminApi) {
    return NextResponse.next()
  }

  // Admin API route gate check
  if (isAdminApi) {
    if (pathname === "/api/admin/gate") {
      return NextResponse.next()
    }
    const secret = process.env.ADMIN_GATE_SECRET
    const token = request.cookies.get(GATE_COOKIE_NAME)?.value
    const valid = secret ? await verifyGateToken(token, secret) : false
    if (!valid) {
      return NextResponse.json({ error: "Gate password required." }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Now handling /supercore HTML page routes
  const secret = process.env.ADMIN_GATE_SECRET
  const gateToken = request.cookies.get(GATE_COOKIE_NAME)?.value
  const hasValidGate = secret ? await verifyGateToken(gateToken, secret) : false
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME)

  if (isGateRoute) {
    if (hasValidGate) {
      if (hasSessionCookie) {
        return NextResponse.redirect(new URL("/supercore/registrations", request.url))
      }
      return NextResponse.redirect(new URL("/supercore/login", request.url))
    }
    return NextResponse.next()
  }

  if (!hasValidGate) {
    return NextResponse.redirect(new URL("/supercore/gate", request.url))
  }

  if (isLoginRoute) {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL("/supercore/registrations", request.url))
    }
    return NextResponse.next()
  }

  // For all protected pages, layout.tsx verifies the session token securely.
  // We can do a fast pre-check here to redirect to login if no cookie exists.
  if (!hasSessionCookie && pathname !== "/supercore") {
    return NextResponse.redirect(new URL("/supercore/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/supercore/:path*", "/api/admin/:path*"],
}
