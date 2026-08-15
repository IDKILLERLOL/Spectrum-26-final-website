import "server-only"

/**
 * POSTs a row payload to the Google Apps Script Web App, which appends it to
 * the linked Spreadsheet as an offline, immutable ledger of transactions.
 * Never throws — the Sheets sync is a nice-to-have audit trail, not something
 * that should ever break a registration or an admin action. Callers check the
 * returned boolean and update `sheetsSyncStatus` accordingly.
 */
export async function syncToSheet(payload: object): Promise<boolean> {
  const rawUrl = process.env.APPS_SCRIPT_URL || process.env.VITE_GOOGLE_SHEETS_WEBAPP_URL
  const url = rawUrl ? rawUrl.replace(/^["']|["']$/g, "") : "https://script.google.com/macros/s/AKfycbxtCVXriQbKWhJ1BioBOZPthxQOoPthyC-5HwZNJukI8zk7CXcis5IfbXrJ7SXhluUYiw/exec"

  try {
    let spreadsheetId = process.env.GOOGLE_SHEETS_ID || process.env.VITE_GOOGLE_SHEETS_ID || ""
    if (spreadsheetId === "undefined" || spreadsheetId === "null") {
      spreadsheetId = ""
    }
    if (!spreadsheetId) {
      try {
        const { getSettings } = await import("@/lib/server/firestore-settings")
        const settings = await getSettings()
        spreadsheetId = settings?.sheetId || ""
      } catch {
        // Fallback ignored
      }
    }

    if (!spreadsheetId) {
      console.warn("[apps-script] No spreadsheet ID configured, skipping sync.")
      return false
    }

    // Try Google Sheets REST API directly if we have a saved admin OAuth token
    let token: string | null = null
    try {
      const { getSystemGmailToken } = await import("@/lib/server/firestore-registrations")
      token = await getSystemGmailToken()
    } catch {
      // Ignored
    }

    if (token) {
      console.log("[apps-script] Attempting direct Google Sheets REST API append...")
      let valuesArray: any[] = []
      const p = payload as any
      if (p.type === "registration") {
        valuesArray = [
          p.eventName || "",
          p.teamName || p.fullName || "",
          "LEADER",
          p.fullName || "",
          p.email || "",
          "", // Phone
          "", // College
          p.paymentStatus || "PENDING",
          p.paymentRefId || "",
          "", // Screenshot
          "No", // Checked In
          p.createdAt || new Date().toISOString()
        ]
      } else {
        valuesArray = [
          p.type || "unknown",
          JSON.stringify(p),
          new Date().toISOString()
        ]
      }

      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("All Registrations!A:L")}:append?valueInputOption=USER_ENTERED`
      try {
        const apiRes = await fetch(appendUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            majorDimension: "ROWS",
            values: [valuesArray]
          })
        })
        if (apiRes.ok) {
          console.log("[apps-script] Direct Google Sheets API sync succeeded!")
          return true
        } else {
          const errBody = await apiRes.json().catch(() => ({}))
          console.warn("[apps-script] Direct Google Sheets API sync failed, falling back to Apps Script...", errBody)
        }
      } catch (apiErr) {
        console.warn("[apps-script] Direct Google Sheets API fetch error, falling back...", apiErr)
      }
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, spreadsheetId, sheetId: spreadsheetId }),
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    })
    return res.ok || res.status === 302 || res.status === 200
  } catch (err) {
    console.error("[apps-script] syncToSheet failed:", err)
    return false
  }
}

export async function fetchFromSheet(): Promise<any[]> {
  const rawUrl = process.env.APPS_SCRIPT_URL || process.env.VITE_GOOGLE_SHEETS_WEBAPP_URL
  const url = rawUrl ? rawUrl.replace(/^["']|["']$/g, "") : "https://script.google.com/macros/s/AKfycbxtCVXriQbKWhJ1BioBOZPthxQOoPthyC-5HwZNJukI8zk7CXcis5IfbXrJ7SXhluUYiw/exec"

  try {
    let spreadsheetId = process.env.GOOGLE_SHEETS_ID || process.env.VITE_GOOGLE_SHEETS_ID || ""
    if (spreadsheetId === "undefined" || spreadsheetId === "null") {
      spreadsheetId = ""
    }
    if (!spreadsheetId) {
      try {
        const { getSettings } = await import("@/lib/server/firestore-settings")
        const settings = await getSettings()
        spreadsheetId = settings?.sheetId || ""
      } catch {
        // Fallback ignored
      }
    }

    if (!spreadsheetId) return []

    // Try Google Sheets REST API directly if we have a saved admin OAuth token
    let token: string | null = null
    try {
      const { getSystemGmailToken } = await import("@/lib/server/firestore-registrations")
      token = await getSystemGmailToken()
    } catch {
      // Ignored
    }

    if (token) {
      console.log("[apps-script] Attempting direct Google Sheets REST API read...")
      const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("All Registrations!A:L")}`
      try {
        const apiRes = await fetch(readUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (apiRes.ok) {
          const data = await apiRes.json()
          const rows = data.values || []
          if (rows.length > 0) {
            const headers = rows[0]
            return rows.slice(1).map((row: any[]) => {
              const obj: any = {}
              headers.forEach((h: string, idx: number) => {
                obj[h] = row[idx] || ""
              })
              return obj
            })
          }
          return []
        } else {
          console.warn("[apps-script] Direct Google Sheets API read failed, falling back to Apps Script...")
        }
      } catch (apiErr) {
        console.warn("[apps-script] Direct Google Sheets API read error, falling back...", apiErr)
      }
    }

    let fetchUrl = url.includes("?") ? `${url}&action=readRegistrations` : `${url}?action=readRegistrations`
    if (spreadsheetId) {
      fetchUrl += `&spreadsheetId=${spreadsheetId}`
    }
    const res = await fetch(fetchUrl, {
      method: "GET",
      headers: { "Accept": "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const text = await res.text()
    if (!text || text.trim().startsWith("<")) {
      console.warn("[apps-script] fetchFromSheet returned non-JSON/HTML response.")
      return []
    }
    const data = JSON.parse(text)
    return Array.isArray(data) ? data : (data.registrations || [])
  } catch (err) {
    console.error("[apps-script] fetchFromSheet failed:", err)
    return []
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
  teamName?: string
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
