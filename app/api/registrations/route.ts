import { NextResponse } from "next/server"
import { registrationSchema } from "@/lib/validation/registration"
import { getEvent } from "@/lib/server/firestore-events"
import { createRegistration, DuplicateRegistrationError, setSheetsSyncStatus, setEmailSent } from "@/lib/server/firestore-registrations"
import { upsertUser } from "@/lib/server/firestore-users"
import { syncToSheet, buildRegistrationRow } from "@/lib/google/apps-script"
import { sendEmail } from "@/lib/email/send"
import { registrationReceivedEmail } from "@/lib/email/templates"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "VALIDATION", message: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = registrationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", message: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 }
    )
  }
  const input = parsed.data

  const event = await getEvent(input.eventId)
  if (!event) {
    return NextResponse.json({ error: "VALIDATION", message: "That event doesn't exist." }, { status: 400 })
  }
  if (!event.registrationOpen) {
    return NextResponse.json({ error: "VALIDATION", message: "Registration is closed for this event." }, { status: 400 })
  }
  if (input.teamMembers.length !== event.capacity - 1) {
    return NextResponse.json(
      { error: "VALIDATION", message: `This event needs exactly ${event.capacity - 1} team member(s) besides you.` },
      { status: 400 }
    )
  }

  try {
    const id = await createRegistration({
      ...input,
      eventName: event.name,
      amountPaid: event.feeNumeric,
    })

    await upsertUser({
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      collegeName: input.collegeName ?? "",
      year: input.year,
    })

    // Fire-and-forget: never let a Sheets outage block the registration response.
    syncToSheet(
      buildRegistrationRow({
        type: "registration",
        id,
        fullName: input.fullName,
        email: input.email,
        eventName: event.name,
        teamSize: 1 + input.teamMembers.length,
        paymentRefId: input.paymentRefId,
        amountPaid: event.feeNumeric,
        paymentStatus: "PENDING",
        createdAt: new Date().toISOString(),
      })
    )
      .then((ok) => setSheetsSyncStatus(id, ok ? "SYNCED" : "FAILED"))
      .catch(() => setSheetsSyncStatus(id, "FAILED"))

    // Fire-and-forget: an email-provider outage should never block the registration response.
    sendEmail(
      registrationReceivedEmail({
        to: input.email,
        fullName: input.fullName,
        eventName: event.name,
        teamSize: 1 + input.teamMembers.length,
        amountPaid: event.feeNumeric,
        paymentRefId: input.paymentRefId,
      })
    )
      .then((ok) => {
        if (ok) return setEmailSent(id)
      })
      .catch(() => {})

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (err) {
    if (err instanceof DuplicateRegistrationError) {
      return NextResponse.json(
        { error: "DUPLICATE", message: "You've already registered for this event with this email." },
        { status: 409 }
      )
    }
    console.error("[POST /api/registrations] unexpected error:", err)
    return NextResponse.json({ error: "UNKNOWN", message: "Something went wrong. Please try again." }, { status: 500 })
  }
}
