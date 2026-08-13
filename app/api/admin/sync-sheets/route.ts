import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listRegistrations, setSheetsSyncStatus } from "@/lib/server/firestore-registrations"
import { syncToSheet, buildRegistrationRow } from "@/lib/google/apps-script"

/** Manual re-sync: pushes every registration to the Sheets ledger. */
export async function POST() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const registrations = await listRegistrations()

  let synced = 0
  let failed = 0

  for (const reg of registrations) {
    const createdAtIso = reg.createdAt
      ? (typeof (reg.createdAt as any).toDate === "function"
        ? (reg.createdAt as any).toDate().toISOString()
        : new Date(reg.createdAt as any).toISOString())
      : new Date().toISOString()

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
        createdAt: createdAtIso,
      })
    )
    await setSheetsSyncStatus(reg.id, ok ? "SYNCED" : "FAILED")
    if (ok) synced++
    else failed++
  }

  return NextResponse.json({ ok: true, total: registrations.length, synced, failed })
}
