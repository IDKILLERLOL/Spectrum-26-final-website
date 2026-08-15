import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { getSchedule, createScheduleItem, type CreateScheduleItemInput } from "@/lib/server/firestore-schedule"

export async function GET() {
  const schedule = await getSchedule()
  return NextResponse.json({ schedule })
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
    typeof body.date !== "string" ||
    !body.date.trim() ||
    typeof body.order !== "number" ||
    typeof body.time !== "string" ||
    typeof body.title !== "string" ||
    !body.title.trim()
  ) {
    return NextResponse.json({ error: "date, order, time, and title are required." }, { status: 400 })
  }

  try {
    const id = await createScheduleItem(body as unknown as CreateScheduleItemInput)
    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/admin/schedule] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
