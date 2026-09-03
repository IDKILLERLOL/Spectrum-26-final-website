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

  // Build clean rows and teams for Google Sheets
  const allRows: string[][] = []
  const teams: any[] = []

  for (const reg of registrations) {
    const rawDate = typeof reg.createdAt === "string" 
      ? new Date(reg.createdAt) 
      : (reg.createdAt as any)?.toDate?.() || new Date()
    const formattedDate = formatDateTime(rawDate instanceof Date && !isNaN(rawDate.getTime()) ? rawDate : new Date())
    
    const eventName = cleanEventName(reg.eventName)
    const teamOrLeaderName = reg.teamName || reg.fullName || ""
    const feeStatus = reg.paymentStatus || "PENDING"
    const txId = reg.paymentRefId || ""
    const checkedIn = reg.checkedIn ? "Yes" : "No"
    const regId = reg.id || ""

    // 1. Leader Row for All Registrations (11 cols: no Team ID, no Payment Screenshot)
    allRows.push([
      eventName,          // col 0: Event Name
      teamOrLeaderName,   // col 1: Team Name
      "Leader",           // col 2: Member Type
      reg.fullName || "", // col 3: Name
      reg.userEmail || "",// col 4: Email
      cleanPhone(reg.phone), // col 5: Phone
      reg.collegeName || "", // col 6: College
      feeStatus,          // col 7: Fee Status
      txId,               // col 8: Transaction ID / Ref
      checkedIn,          // col 9: Checked In
      formattedDate,      // col 10: Registered At
    ])

    const members: any[] = []

    // 2. Member Rows
    if (Array.isArray(reg.teamMembers)) {
      for (const m of reg.teamMembers) {
        const memName = m.name || (typeof m === "string" ? m : "")
        if (!memName && !m.email) continue
        const memPhone = cleanPhone(m.phone)
        const memCollege = m.collegeName || m.college || reg.collegeName || ""

        allRows.push([
          eventName,        // col 0: Event Name
          teamOrLeaderName, // col 1: Team Name
          "Member",         // col 2: Member Type
          memName,          // col 3: Name
          m.email || "",    // col 4: Email
          memPhone,         // col 5: Phone
          memCollege,       // col 6: College
          feeStatus,        // col 7: Fee Status
          txId,             // col 8: Transaction ID / Ref
          checkedIn,        // col 9: Checked In
          formattedDate,    // col 10: Registered At
        ])

        members.push({
          name: memName,
          email: m.email || "",
          phone: memPhone,
          college: memCollege,
          memberType: "Member",
        })
      }
    }

    // 3. Substitute Row (only if provided)
    const subName = reg.substitute?.name || reg.substituteName
    let substituteObj: any = undefined
    if (subName && subName.trim()) {
      const subEmail = reg.substitute?.email || reg.substituteEmail || ""
      const subPhone = cleanPhone(reg.substitute?.phone || reg.substitutePhone)
      const subCollege = reg.substitute?.college || reg.substituteCollege || reg.collegeName || ""
      const subYear = reg.substitute?.year || reg.substituteYear || ""

      allRows.push([
        eventName,          // col 0: Event Name
        teamOrLeaderName,   // col 1: Team Name
        "Substitute",       // col 2: Member Type
        subName.trim(),     // col 3: Name
        subEmail,           // col 4: Email
        subPhone,           // col 5: Phone
        subCollege,         // col 6: College
        feeStatus,          // col 7: Fee Status
        txId,               // col 8: Transaction ID / Ref
        checkedIn,          // col 9: Checked In
        formattedDate,      // col 10: Registered At
      ])

      substituteObj = {
        name: subName.trim(),
        email: subEmail,
        phone: subPhone,
        college: subCollege,
        year: subYear,
        memberType: "Substitute",
      }
    }

    teams.push({
      teamId: regId,
      eventName,
      teamName: teamOrLeaderName,
      memberType: "Leader",
      fullName: reg.fullName || "",
      email: reg.userEmail || "",
      phone: cleanPhone(reg.phone),
      collegeName: reg.collegeName || "",
      paymentStatus: feeStatus,
      paymentRefId: txId,
      // pictureUrl intentionally omitted — Payment Screenshot removed from sheet schema
      checkedIn,
      createdAt: formattedDate,
      teamMembers: members,
      substitute: substituteObj,
    })
  }

  // Send full_sync batch payload to Google Apps Script
  const ok = await syncToSheet({
    type: "full_sync",
    allRows,
    teams,
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
    metadata: { totalRegistrations: registrations.length, totalRows: allRows.length, success: ok },
  })

  if (!ok) {
    return NextResponse.json({
      ok: false,
      total: registrations.length,
      rows: allRows.length,
      error: "Google Apps Script syncToSheet returned false. Ensure Apps Script is updated and deployed.",
    }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    total: registrations.length,
    rows: allRows.length,
    message: `Successfully rebuilt sheet with ${allRows.length} rows across ${registrations.length} registrations.`,
  })
}
