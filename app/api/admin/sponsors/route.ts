import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listSponsors, saveSponsor } from "@/lib/server/firestore-sponsors"

export async function GET() {
  try {
    const sponsors = await listSponsors()
    return NextResponse.json({ sponsors })
  } catch (err) {
    console.error("[GET /api/admin/sponsors]", err)
    return NextResponse.json({ error: "Failed to list sponsors" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, name, fields, tags } = body
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Sponsor name is required" }, { status: 400 })
    }
    await saveSponsor(id || null, name.trim(), fields || {}, Array.isArray(tags) ? tags : [])
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[POST /api/admin/sponsors]", err)
    return NextResponse.json({ error: "Failed to save sponsor" }, { status: 500 })
  }
}
