import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { getRegistration, setPaymentStatus, setSheetsSyncStatus, setEmailSent } from "@/lib/server/firestore-registrations"
import { writeAuditLog } from "@/lib/server/firestore-audit"
import { syncToSheet, buildRegistrationRow } from "@/lib/google/apps-script"
import { sendEmail } from "@/lib/email/send"
import { paymentStatusEmail } from "@/lib/email/templates"
import { getDb } from "@/lib/firebase/admin"

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

  // Sync status updates to Google Sheets so the sheet is always in sync with the DB
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
        paymentStatus: body.status,
        checkedIn: existing.checkedIn,
        createdAt: createdAtStr,
        teamName: existing.teamName || "",
        // pictureUrl removed — Payment Screenshot no longer in sheet schema
        teamMembers: existing.teamMembers || [],
      })
    )
    await setSheetsSyncStatus(id, ok ? "SYNCED" : "FAILED")
  } catch (err) {
    console.error("[status route] sheets sync failed:", err)
  }

  if (body.status !== "PENDING") {
    try {
      const recipients: { email: string; name: string }[] = []

      // 1. Leader
      if (existing.userEmail) {
        recipients.push({
          email: existing.userEmail.trim(),
          name: existing.fullName || "Participant",
        })
      }

      // 2. Team Members (non-leaders)
      if (Array.isArray(existing.teamMembers)) {
        for (const m of existing.teamMembers) {
          const memEmail = (m?.email || "").trim()
          const memName = m?.name || "Team Member"
          if (
            memEmail &&
            !recipients.some((r) => r.email.toLowerCase() === memEmail.toLowerCase())
          ) {
            recipients.push({ email: memEmail, name: memName })
          }
        }
      }

      const results = await Promise.allSettled(
        recipients.map((recipient) =>
          sendEmail(
            paymentStatusEmail({
              to: recipient.email,
              fullName: recipient.name,
              eventName: existing.eventName,
              status: body.status as "APPROVED" | "REJECTED",
              phone: existing.phone,
              collegeName: existing.collegeName,
              teamName: existing.teamName,
              teamMembers: existing.teamMembers,
            })
          )
        )
      )

      const anySent = results.some((r) => r.status === "fulfilled" && r.value)
      if (anySent) {
        await setEmailSent(id)
      }
    } catch (err) {
      console.error("[status route] failed to send email(s):", err)
    }
  }

  return NextResponse.json({ ok: true, registration: updated })
}
