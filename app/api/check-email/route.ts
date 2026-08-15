import { NextResponse } from "next/server"
import { getDb } from "@/lib/firebase/admin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")?.toLowerCase().trim()
  const eventId = searchParams.get("eventId")?.trim()

  if (!email) {
    return NextResponse.json({ error: "Email parameter is required." }, { status: 400 })
  }

  const db = getDb()
  try {
    const snap = await db.collection("registrations").where("userEmail", "==", email).get()
    
    if (snap.empty) {
      // Also check legacy/alternative email fields
      const snap2 = await db.collection("registrations").where("email", "==", email).get()
      if (snap2.empty) {
        return NextResponse.json({ registered: false })
      }
    }

    if (eventId) {
      const match = snap.docs.find(d => d.data().eventId === eventId)
      if (match) {
        return NextResponse.json({ registered: true, isDuplicateEvent: true, message: "You are already registered for this event with this email address." })
      }
    }

    return NextResponse.json({ registered: true, isDuplicateEvent: false })
  } catch (err) {
    console.error("[check-email]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
