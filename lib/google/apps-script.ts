import "server-only"

/**
 * POSTs a row payload to the Google Apps Script Web App, which appends it to
 * the linked Spreadsheet as an offline, immutable ledger of transactions.
 * Never throws — the Sheets sync is a nice-to-have audit trail, not something
 * that should ever break a registration or an admin action. Callers check the
 * returned boolean and update `sheetsSyncStatus` accordingly.
 */
export async function syncToSheet(payload: object): Promise<boolean> {
  const url = process.env.APPS_SCRIPT_URL
  if (!url) {
    console.warn("[apps-script] APPS_SCRIPT_URL not configured, skipping sync.")
    return false
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Apps Script Web Apps can be slow to cold-start; give it real headroom.
      signal: AbortSignal.timeout(15000),
    })
    return res.ok
  } catch (err) {
    console.error("[apps-script] syncToSheet failed:", err)
    return false
  }
}

interface RegistrationSheetRow {
  type: "registration"
  id: string
  fullName: string
  email: string
  eventName: string
  teamSize: number
  paymentRefId: string
  amountPaid: number
  paymentStatus: string
  createdAt: string
}

export function buildRegistrationRow(input: RegistrationSheetRow) {
  return input
}

interface AuditLogSheetRow {
  type: "auditLog"
  actorEmail: string
  action: string
  targetCollection: string
  targetId: string
  createdAt: string
}

export function buildAuditLogRow(input: AuditLogSheetRow) {
  return input
}
