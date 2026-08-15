import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { updateEvent, deleteEvent, type CreateEventInput } from "@/lib/server/firestore-events"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  try {
    await updateEvent(id, body as Partial<Omit<CreateEventInput, "id">>)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[PATCH /api/admin/events/[id]] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    await deleteEvent(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[DELETE /api/admin/events/[id]] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
