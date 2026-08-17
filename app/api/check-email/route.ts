import { NextResponse } from "next/server"
import { getDb } from "@/lib/firebase/admin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamName = searchParams.get("teamName")

  if (teamName) {
    const normalized = teamName.toLowerCase().trim()
    if (normalized) {
      try {
        const db = getDb()
        const querySnap = await db.collection("registrations")
          .where("teamNameNormalized", "==", normalized)
          .limit(1)
          .get()

        if (!querySnap.empty) {
          return NextResponse.json({
            registered: true,
            message: "TEAM NAME ALREADY EXISTS — PLEASE CHOOSE ANOTHER NAME"
          })
        }
      } catch (err) {
        console.error("[check-email] Failed to check team name uniqueness:", err)
      }
    }
  }

  // Always return registered: false as requested by the user to bypass email registration checks
  return NextResponse.json({ registered: false })
}
