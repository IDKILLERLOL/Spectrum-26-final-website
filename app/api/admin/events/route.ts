import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { getEvents, createEvent, type CreateEventInput } from "@/lib/server/firestore-events"

export async function GET() {
  const events = await getEvents()
  return NextResponse.json({ events })
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.feeNumeric !== "number" ||
    typeof body.capacity !== "number"
  ) {
    return NextResponse.json({ error: "name, feeNumeric, and capacity are required." }, { status: 400 })
  }

  try {
    const id = await createEvent(body as unknown as CreateEventInput)
    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/admin/events] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
