import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { toggleCheckIn, getRegistration } from "@/lib/server/firestore-registrations"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let body: { checkedIn?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (typeof body.checkedIn !== "boolean") {
    return NextResponse.json({ error: "checkedIn must be a boolean." }, { status: 400 })
  }

  const existing = await getRegistration(id)
  if (!existing) return NextResponse.json({ error: "Registration not found." }, { status: 404 })

  await toggleCheckIn(id, body.checkedIn)

  return NextResponse.json({ ok: true })
}
