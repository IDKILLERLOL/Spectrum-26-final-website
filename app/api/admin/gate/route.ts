import { NextResponse } from "next/server"
import { signGateToken, GATE_COOKIE_NAME, GATE_COOKIE_OPTIONS } from "@/lib/auth/gate"

export async function POST(request: Request) {
  const gatePassword = process.env.ADMIN_GATE_PASSWORD
  const gateSecret = process.env.ADMIN_GATE_SECRET

  if (!gatePassword || !gateSecret) {
    return NextResponse.json({ error: "Admin gate is not configured." }, { status: 500 })
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (body.password !== gatePassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 })
  }

  const token = await signGateToken(gateSecret)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(GATE_COOKIE_NAME, token, GATE_COOKIE_OPTIONS)
  return res
}
