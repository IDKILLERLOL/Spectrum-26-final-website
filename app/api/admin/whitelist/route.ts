import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listWhitelist, addToWhitelist } from "@/lib/server/firestore-admin-whitelist"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const whitelist = await listWhitelist()
  return NextResponse.json({ whitelist })
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (!body.email || typeof body.email !== "string" || !body.email.trim()) {
    return NextResponse.json({ error: "email is required." }, { status: 400 })
  }

  try {
    await addToWhitelist(body.email.trim(), session.email)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/admin/whitelist] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
