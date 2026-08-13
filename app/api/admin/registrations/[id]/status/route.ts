import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { getRegistration, setPaymentStatus, setSheetsSyncStatus, setEmailSent } from "@/lib/server/firestore-registrations"
import { writeAuditLog } from "@/lib/server/firestore-audit"
import { syncToSheet, buildRegistrationRow } from "@/lib/google/apps-script"
import { sendEmail } from "@/lib/email/send"
import { paymentStatusEmail } from "@/lib/email/templates"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (body.status !== "APPROVED" && body.status !== "REJECTED" && body.status !== "PENDING") {
    return NextResponse.json({ error: "status must be APPROVED, REJECTED, or PENDING." }, { status: 400 })
  }

  const existing = await getRegistration(id)
  if (!existing) return NextResponse.json({ error: "Registration not found." }, { status: 404 })

  const updated = await setPaymentStatus(id, body.status, session.email)

  await writeAuditLog({
    actorEmail: session.email,
    action: `REGISTRATION_${body.status}`,
    targetCollection: "registrations",
    targetId: id,
    metadata: { eventName: existing.eventName, userEmail: existing.userEmail },
  })

  // Fire-and-forget: a Sheets outage should never block the admin's approve/reject action.
  syncToSheet(
    buildRegistrationRow({
      type: "registration",
      id,
      fullName: existing.fullName,
      email: existing.userEmail,
      eventName: existing.eventName,
      teamSize: existing.teamSize,
      paymentRefId: existing.paymentRefId,
      amountPaid: existing.amountPaid,
      paymentStatus: body.status,
      createdAt: existing.createdAt
        ? (typeof (existing.createdAt as any).toDate === "function"
          ? (existing.createdAt as any).toDate().toISOString()
          : new Date(existing.createdAt as any).toISOString())
        : new Date().toISOString(),
    })
  )
    .then((ok) => setSheetsSyncStatus(id, ok ? "SYNCED" : "FAILED"))
    .catch(() => setSheetsSyncStatus(id, "FAILED"))

  if (body.status !== "PENDING") {
    sendEmail(
      paymentStatusEmail({
        to: existing.userEmail,
        fullName: existing.fullName,
        eventName: existing.eventName,
        status: body.status as "APPROVED" | "REJECTED",
      })
    )
      .then((ok) => {
        if (ok) return setEmailSent(id)
      })
      .catch(() => {})
  }

  return NextResponse.json({ ok: true, registration: updated })
}
