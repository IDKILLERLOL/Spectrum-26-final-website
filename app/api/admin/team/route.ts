import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listTeamMembers, createTeamMember } from "@/lib/server/firestore-team"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const items = await listTeamMembers()
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { name?: string; role?: string; imageUrl?: string; order?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.name?.trim() || !body.role?.trim()) {
    return NextResponse.json({ error: "Name and role are required." }, { status: 400 })
  }

  try {
    const id = await createTeamMember({
      name: body.name,
      role: body.role,
      imageUrl: body.imageUrl,
      order: body.order,
    })
    return NextResponse.json({ ok: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create team member." }, { status: 500 })
  }
}
