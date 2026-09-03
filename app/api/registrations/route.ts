import { NextResponse } from "next/server"
import { registrationSchema } from "@/lib/validation/registration"
import { getEvent } from "@/lib/server/firestore-events"
import { createRegistration, DuplicateRegistrationError, setSheetsSyncStatus, setEmailSent } from "@/lib/server/firestore-registrations"
import { upsertUser } from "@/lib/server/firestore-users"
import { syncToSheet, buildRegistrationRow } from "@/lib/google/apps-script"
import { sendEmail } from "@/lib/email/send"
import { registrationReceivedEmail } from "@/lib/email/templates"
import { getDb } from "@/lib/firebase/admin"

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
  const isBgmi = input.eventId.toLowerCase() === "bgmi"
  if (isBgmi) {
    if (input.teamMembers.length !== 3) {
      return NextResponse.json(
        { error: "VALIDATION", message: "BGMI requires exactly 3 team members besides the leader." },
        { status: 400 }
      )
    }
  } else if (input.teamMembers.length !== event.capacity - 1) {
    return NextResponse.json(
      { error: "VALIDATION", message: `This event needs exactly ${event.capacity - 1} team member(s) besides you.` },
      { status: 400 }
    )
  }

  const normalizedTeamName = input.teamName?.toLowerCase().trim()
  if (normalizedTeamName) {
    try {
      const db = getDb()
      const existingTeamQuery = await db.collection("registrations")
        .where("teamNameNormalized", "==", normalizedTeamName)
        .limit(1)
        .get()
      
      if (!existingTeamQuery.empty) {
        return NextResponse.json(
          { error: "DUPLICATE_TEAM_NAME", message: "TEAM NAME ALREADY EXISTS — PLEASE CHOOSE ANOTHER NAME" },
          { status: 400 }
        )
      }
    } catch (dbErr) {
      console.error("[POST /api/registrations] DB check failed:", dbErr)
    }
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

    const hasSubstitute = Boolean(input.substitute?.name && input.substitute.name.trim().length > 0)
    const effectiveTeamSize = 1 + input.teamMembers.length + (hasSubstitute ? 1 : 0)

    // Await both Sheets sync and Email delivery to prevent Vercel container pauses
    await Promise.all([
      syncToSheet(
        buildRegistrationRow({
          type: "registration",
          id,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          collegeName: input.collegeName ?? "",
          year: input.year,
          eventName: event.name,
          teamSize: effectiveTeamSize,
          paymentRefId: input.paymentRefId,
          amountPaid: event.feeNumeric,
          paymentStatus: "PENDING",
          createdAt: new Date().toISOString(),
          teamName: input.teamName || "",
          pictureUrl: input.pictureUrl || "",
          substitute: hasSubstitute ? input.substitute : undefined,
          teamMembers: input.teamMembers.map((str) => {
            try {
              const parsed = JSON.parse(str)
              if (parsed && typeof parsed === "object" && parsed.name) {
                return {
                  name: parsed.name,
                  email: parsed.email || "",
                  phone: parsed.phone || "",
                  collegeName: parsed.college || parsed.collegeName || "",
                  year: parsed.year || "",
                }
              }
            } catch {}
            return { name: str, email: "", phone: "", collegeName: "", year: "" }
          })
        })
      )
        .then((ok) => {
          setSheetsSyncStatus(id, ok ? "SYNCED" : "FAILED")
        })
        .catch(() => {
          setSheetsSyncStatus(id, "FAILED")
        }),
      sendEmail(
        registrationReceivedEmail({
          to: input.email,
          fullName: input.fullName,
          eventName: event.name,
          teamSize: effectiveTeamSize,
          amountPaid: event.feeNumeric,
          paymentRefId: input.paymentRefId,
          phone: input.phone,
          collegeName: input.collegeName,
          teamName: (input as any).teamName || "",
          teamMembers: input.teamMembers.map((str) => {
            try {
              const parsed = JSON.parse(str)
              if (parsed && typeof parsed === "object" && parsed.name) {
                return {
                  name: parsed.name,
                  email: parsed.email || "",
                  phone: parsed.phone || "",
                  college: parsed.college || parsed.collegeName || "",
                  year: parsed.year || "",
                }
              }
            } catch {}
            return { name: str }
          })
        })
      )
        .then((ok) => {
          if (ok) setEmailSent(id)
        })
        .catch(() => {})
    ])

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
