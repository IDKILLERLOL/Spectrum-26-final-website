import "server-only"

/**
 * POSTs a row payload to the Google Apps Script Web App, which appends it to
 * the linked Spreadsheet as an offline, immutable ledger of transactions.
 * Never throws — the Sheets sync is a nice-to-have audit trail, not something
 * that should ever break a registration or an admin action. Callers check the
 * returned boolean and update `sheetsSyncStatus` accordingly.
 */
export async function syncToSheet(payload: object): Promise<boolean> {
  const url = process.env.APPS_SCRIPT_URL || process.env.VITE_GOOGLE_SHEETS_WEBAPP_URL
  if (!url) {
    console.warn("[apps-script] APPS_SCRIPT_URL not configured, skipping sync.")
    return false
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    })
    return res.ok || res.status === 302 || res.status === 200
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
  let eventName = input.eventName
  if (eventName === "singularity-strike" || eventName === "singularity_strike") {
    eventName = "Code Clash"
  } else if (eventName === "fc26" || eventName === "fc_26") {
    eventName = "FIFA"
  } else if (eventName === "dual-debug" || eventName === "dual_debug") {
    eventName = "Dual Debug"
  }
  return { ...input, eventName }
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

export function buildWhitelistRow(email: string, action: "ADD" | "REMOVE", addedBy: string) {
  return {
    type: "whitelist",
    email: email.toLowerCase().trim(),
    action,
    addedBy,
    timestamp: new Date().toISOString(),
  }
}

export function buildSponsorRow(id: string, name: string, fields: Record<string, string>, action: "SAVE" | "DELETE") {
  return {
    type: "sponsor",
    id,
    name,
    fields,
    action,
    timestamp: new Date().toISOString(),
  }
}
