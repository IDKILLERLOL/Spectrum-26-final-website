import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { toggleCheckIn, getRegistration, setSheetsSyncStatus } from "@/lib/server/firestore-registrations"
import { writeAuditLog } from "@/lib/server/firestore-audit"
import { syncToSheet, buildRegistrationRow } from "@/lib/google/apps-script"

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

  await writeAuditLog({
    actorEmail: session.email,
    action: body.checkedIn ? "REGISTRATION_CHECKIN" : "REGISTRATION_UNCHECKIN",
    targetCollection: "registrations",
    targetId: id,
    metadata: { eventName: existing.eventName, userEmail: existing.userEmail },
  })

  // Sync check-in status edit to Google Sheets
  try {
    const createdAtStr = existing.createdAt instanceof Date 
      ? existing.createdAt.toISOString() 
      : (existing.createdAt as any)?.toDate?.()?.toISOString() || new Date().toISOString()

    const ok = await syncToSheet(
      buildRegistrationRow({
        type: "registration",
        action: "edit",
        id,
        fullName: existing.fullName,
        email: existing.userEmail,
        phone: existing.phone || "",
        collegeName: existing.collegeName || "",
        year: existing.year || "",
        eventName: existing.eventName,
        teamSize: existing.teamSize,
        paymentRefId: existing.paymentRefId,
        amountPaid: existing.amountPaid,
        paymentStatus: existing.paymentStatus,
        checkedIn: body.checkedIn,
        createdAt: createdAtStr,
        teamName: existing.teamName || "",
        pictureUrl: existing.pictureUrl || "",
        teamMembers: existing.teamMembers || [],
      })
    )
    await setSheetsSyncStatus(id, ok ? "SYNCED" : "FAILED")
  } catch (err) {
    console.error("[checkin route] sheets sync failed:", err)
  }

  return NextResponse.json({ ok: true })
}
