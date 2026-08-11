import { NextResponse, type NextRequest } from "next/server"
import { verifyGateToken, GATE_COOKIE_NAME } from "@/lib/auth/gate"

/**
 * Coarse first layer, Edge runtime: is the gate password cookie present and
 * valid? The finer Google-OAuth-session + adminWhitelist check happens deeper,
 * in requireAdminSession() (Node runtime, called from protected Server
 * Components / route handlers) — middleware can't reach Firestore itself.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isGateRoute = pathname === "/supercore/gate" || pathname === "/api/admin/gate"
  const isAdminArea = pathname.startsWith("/supercore") || pathname.startsWith("/api/admin")

  if (!isAdminArea || isGateRoute) return NextResponse.next()

  const secret = process.env.ADMIN_GATE_SECRET
  const token = request.cookies.get(GATE_COOKIE_NAME)?.value
  const valid = secret ? await verifyGateToken(token, secret) : false

  if (valid) return NextResponse.next()

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Gate password required." }, { status: 401 })
  }

  const gateUrl = new URL("/supercore/gate", request.url)
  return NextResponse.redirect(gateUrl)
}

export const config = {
  matcher: ["/supercore/:path*", "/api/admin/:path*"],
}
