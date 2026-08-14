import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { getDb } from "@/lib/firebase/admin"
import { writeAuditLog } from "@/lib/server/firestore-audit"

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { token } = await request.json()
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required." }, { status: 400 })
    }

    const db = getDb()
    await db.collection("systemConfig").doc("gmail").set({
      token,
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    })

    await writeAuditLog({
      actorEmail: session.email,
      action: "SAVE_GMAIL_TOKEN",
      targetCollection: "systemConfig",
      targetId: "gmail",
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[POST /api/admin/gmail-token]", err)
    return NextResponse.json({ error: "Failed to save token." }, { status: 500 })
  }
}
