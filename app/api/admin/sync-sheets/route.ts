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

  let synced = 0
  let failed = 0

  for (const reg of registrations) {
    const ok = await syncToSheet(
      buildRegistrationRow({
        type: "registration",
        id: reg.id,
        fullName: reg.fullName,
        email: reg.userEmail,
        eventName: reg.eventName,
        teamSize: reg.teamSize,
        paymentRefId: reg.paymentRefId,
        amountPaid: reg.amountPaid,
        paymentStatus: reg.paymentStatus,
        createdAt: typeof reg.createdAt === "string" ? reg.createdAt : (reg.createdAt as any)?.toDate?.()?.toISOString() || new Date().toISOString(),
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
