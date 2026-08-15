import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listAllWinners, createWinner } from "@/lib/server/firestore-winners"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const winners = await listAllWinners()
  return NextResponse.json({ winners })
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
    typeof body.eventId !== "string" ||
    !body.eventId.trim() ||
    typeof body.eventName !== "string" ||
    !body.eventName.trim() ||
    (body.place !== "1st" && body.place !== "2nd" && body.place !== "3rd") ||
    typeof body.teamName !== "string" ||
    !body.teamName.trim() ||
    typeof body.edition !== "string" ||
    !body.edition.trim()
  ) {
    return NextResponse.json(
      { error: "eventId, eventName, place (1st/2nd/3rd), teamName, and edition are required." },
      { status: 400 }
    )
  }

  try {
    const id = await createWinner({
      eventId: body.eventId,
      eventName: body.eventName,
      place: body.place,
      teamName: body.teamName,
      members: Array.isArray(body.members) ? (body.members as string[]) : [],
      edition: body.edition,
      createdBy: session.email,
    })
    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/admin/winners] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
