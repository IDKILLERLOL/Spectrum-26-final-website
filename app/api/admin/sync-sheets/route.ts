import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listRegistrations, setSheetsSyncStatus } from "@/lib/server/firestore-registrations"
import { syncToSheet, cleanEventName, cleanPhone } from "@/lib/google/apps-script"
import { writeAuditLog } from "@/lib/server/firestore-audit"

function formatDateTime(date: Date): string {
  const d = date.getDate()
  const m = date.getMonth() + 1
  const y = date.getFullYear()
  const hrs = String(date.getHours()).padStart(2, "0")
  const mins = String(date.getMinutes()).padStart(2, "0")
  const secs = String(date.getSeconds()).padStart(2, "0")
  return `${d}/${m}/${y}, ${hrs}:${mins}:${secs}`
}

export const maxDuration = 60
export const dynamic = "force-dynamic"

/** Manual re-sync: completely cleans and rebuilds the Google Sheet from Firestore. */
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

  // Build clean 2D array of rows for Google Sheets
  const rows: string[][] = []

  for (const reg of registrations) {
    const rawDate = typeof reg.createdAt === "string" 
      ? new Date(reg.createdAt) 
      : (reg.createdAt as any)?.toDate?.() || new Date()
    const formattedDate = formatDateTime(rawDate instanceof Date && !isNaN(rawDate.getTime()) ? rawDate : new Date())
    
    const eventName = cleanEventName(reg.eventName)
    const teamOrLeaderName = reg.teamName || reg.fullName || ""
    const feeStatus = reg.paymentStatus || "PENDING"
    const txId = reg.paymentRefId || ""
    const screenshot = reg.pictureUrl || ""
    const checkedIn = reg.checkedIn ? "Yes" : "No"
    const regId = reg.id || ""

    // 1. Leader Row
    rows.push([
      eventName,
      teamOrLeaderName,
      "LEADER",
      reg.fullName || "",
      reg.userEmail || "",
      cleanPhone(reg.phone),
      reg.collegeName || "",
      reg.year || "",
      feeStatus,
      txId,
      screenshot,
      checkedIn,
      formattedDate,
      regId,
    ])

    // 2. Member Rows
    if (Array.isArray(reg.teamMembers)) {
      for (const m of reg.teamMembers) {
        const memName = m.name || (typeof m === "string" ? m : "")
        if (!memName && !m.email) continue
        rows.push([
          eventName,
          teamOrLeaderName,
          "MEMBER",
          memName,
          m.email || "",
          cleanPhone(m.phone),
          m.collegeName || m.college || reg.collegeName || "",
          m.year || "",
          feeStatus,
          txId,
          screenshot,
          checkedIn,
          formattedDate,
          regId,
        ])
      }
    }
  }

  // Send full_sync batch payload to Google Apps Script
  const ok = await syncToSheet({
    type: "full_sync",
    rows,
  })

  if (ok) {
    // Mark all as SYNCED in Firestore
    await Promise.allSettled(registrations.map((r) => setSheetsSyncStatus(r.id, "SYNCED")))
  }

  await writeAuditLog({
    actorEmail: session.email,
    action: "MANUAL_SHEETS_SYNC",
    targetCollection: "registrations",
    targetId: "*",
    metadata: { totalRegistrations: registrations.length, totalRows: rows.length, success: ok },
  })

  if (!ok) {
    return NextResponse.json({
      ok: false,
      total: registrations.length,
      rows: rows.length,
      error: "Google Apps Script syncToSheet returned false. Ensure Apps Script is updated and deployed.",
    }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    total: registrations.length,
    rows: rows.length,
    message: `Successfully rebuilt sheet with ${rows.length} rows across ${registrations.length} registrations.`,
  })
}
