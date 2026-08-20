import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { deleteRegistration, getRegistration } from "@/lib/server/firestore-registrations"
import { writeAuditLog } from "@/lib/server/firestore-audit"
import { syncToSheet, buildDeleteRegistrationRow } from "@/lib/google/apps-script"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const existing = await getRegistration(id)
  if (!existing) return NextResponse.json({ error: "Registration not found." }, { status: 404 })

  await deleteRegistration(id)

  // Sync deletion to Google Sheets
  try {
    await syncToSheet(
      buildDeleteRegistrationRow({
        id,
        eventName: existing.eventName,
        teamName: existing.teamName || "",
        email: existing.userEmail,
      })
    )
  } catch (err) {
    console.error("[DELETE /api/admin/registrations/[id]] Sheets delete sync failed:", err)
  }

  await writeAuditLog({
    actorEmail: session.email,
    action: "REGISTRATION_DELETED",
    targetCollection: "registrations",
    targetId: id,
    metadata: { userEmail: existing.userEmail, eventName: existing.eventName },
  })

  return NextResponse.json({ ok: true })
}
