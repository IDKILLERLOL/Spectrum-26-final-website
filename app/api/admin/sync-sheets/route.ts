import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listRegistrations, setSheetsSyncStatus } from "@/lib/server/firestore-registrations"
import { syncToSheet, buildRegistrationRow } from "@/lib/google/apps-script"
import { writeAuditLog } from "@/lib/server/firestore-audit"

/** Manual re-sync: pushes every registration currently in Firestore to the Sheets ledger. */
export async function POST() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const registrations = await listRegistrations()

  // Sort chronologically by createdAt timestamp (oldest first)
  registrations.sort((a, b) => {
    const timeA = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : (a.createdAt as any)?.toDate?.()?.getTime() || 0
    const timeB = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : (b.createdAt as any)?.toDate?.()?.getTime() || 0
    return timeA - timeB
  })

  let synced = 0
  let failed = 0

  for (const reg of registrations) {
    // Only sync new/unsynced records
    if (reg.sheetsSyncStatus === "SYNCED") {
      continue
    }

    const ok = await syncToSheet(
      buildRegistrationRow({
        type: "registration",
        id: reg.id,
        fullName: reg.fullName,
        email: reg.userEmail,
        phone: reg.phone || "",
        collegeName: reg.collegeName || "",
        year: reg.year || "",
        eventName: reg.eventName,
        teamSize: reg.teamSize,
        paymentRefId: reg.paymentRefId,
        amountPaid: reg.amountPaid,
        paymentStatus: reg.paymentStatus,
        createdAt: typeof reg.createdAt === "string" ? reg.createdAt : (reg.createdAt as any)?.toDate?.()?.toISOString() || new Date().toISOString(),
        teamName: reg.teamName || "",
        teamMembers: reg.teamMembers?.map((m: any) => ({
          name: m.name,
          email: m.email || "",
          phone: m.phone || "",
          collegeName: m.college || m.collegeName || "",
          year: m.year || "",
        })) || []
      })
    )
    await setSheetsSyncStatus(reg.id, ok ? "SYNCED" : "FAILED")
    if (ok) synced++
    else failed++
  }

  await writeAuditLog({
    actorEmail: session.email,
    action: "MANUAL_SHEETS_SYNC",
    targetCollection: "registrations",
    targetId: "*",
    metadata: { total: registrations.length, synced, failed },
  })

  return NextResponse.json({ ok: true, total: registrations.length, synced, failed })
}
