import "server-only"

const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxtCVXriQbKWhJ1BioBOZPthxQOoPthyC-5HwZNJukI8zk7CXcis5IfbXrJ7SXhluUYiw/exec"
const DEFAULT_SPREADSHEET_ID = "1uoPRpcJrswDb_ghqOq-NDuHI1POrQOKUHWWxOSM__y0"
const DEFAULT_API_KEY = "ishaandagoat"

const APPS_SCRIPT_URL =
  process.env.EMAIL_APPS_SCRIPT_URL ||
  process.env.SHEETS_APPS_SCRIPT_URL ||
  process.env.APPS_SCRIPT_URL ||
  process.env.VITE_GOOGLE_SHEETS_WEBAPP_URL ||
  DEFAULT_APPS_SCRIPT_URL

// Must match the SECRET_KEY in the Apps Script doPost function
const APPS_SCRIPT_API_KEY =
  process.env.EMAIL_APPS_SCRIPT_SECRET ||
  process.env.APPS_SCRIPT_API_KEY ||
  process.env.APPS_SCRIPT_SECRET ||
  DEFAULT_API_KEY

function cleanUrl(raw: string) {
  return raw.replace(/^["']|["']$/g, "").trim()
}

async function getSpreadsheetId(): Promise<string> {
  let id = process.env.GOOGLE_SHEETS_ID || process.env.VITE_GOOGLE_SHEETS_ID || ""
  if (id === "undefined" || id === "null") id = ""
  if (!id) {
    try {
      const { getSettings } = await import("@/lib/server/firestore-settings")
      const settings = await getSettings()
      id = settings?.sheetId || (settings as any)?.sheetsSpreadsheetId || ""
    } catch {
      // ignored
    }
  }
  return id || DEFAULT_SPREADSHEET_ID
}

function formatDateTime(date: Date): string {
  const d = date.getDate()
  const m = date.getMonth() + 1
  const y = date.getFullYear()
  const hrs = String(date.getHours()).padStart(2, "0")
  const mins = String(date.getMinutes()).padStart(2, "0")
  const secs = String(date.getSeconds()).padStart(2, "0")
  return `${d}/${m}/${y}, ${hrs}:${mins}:${secs}`
}

/**
 * Syncs a payload to Google Sheets via the Apps Script web app owned by
 * sbmpspectrum@gmail.com. Verifies identity using the shared secret.
 *
 * Never throws — Sheets sync is an audit trail, not critical path.
 */
export async function syncToSheet(payload: object): Promise<boolean> {
  const p = payload as any

  // Skip audit log entries — not synced to Sheets
  if (p?.type === "auditLog") {
    console.log("[apps-script] Skipping audit log sheet synchronization.")
    return true
  }

  const url = cleanUrl(APPS_SCRIPT_URL)
  const apiKey = APPS_SCRIPT_API_KEY
  const spreadsheetId = await getSpreadsheetId()

  if (!url) {
    console.warn("[apps-script] No Apps Script URL configured — skipping sync.")
    return false
  }

  if (!spreadsheetId) {
    console.warn("[apps-script] No spreadsheet ID configured — skipping sync.")
    return false
  }

  /** Post one payload object to the Apps Script and return success. */
  async function post(body: object): Promise<boolean> {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...body, apiKey, spreadsheetId }),
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
      })
      const ok = res.ok || res.status === 302 || res.status === 200
      if (!ok) {
        const bodyText = await res.text().catch(() => "")
        console.warn(`[apps-script] POST failed — status=${res.status}, body=${bodyText.slice(0, 300)}`)
      }
      return ok
    } catch (err) {
      console.error("[apps-script] POST threw:", err)
      return false
    }
  }

  try {
    console.log(`[apps-script] Syncing type='${p.type}' to Apps Script (${url.slice(0, 60)}...)`)

    if (p.type === "registration") {
      const parsedDate = new Date(p.createdAt || Date.now())
      const formattedDate = formatDateTime(parsedDate)
      const teamOrName = p.teamName || p.fullName || ""
      const regId = p.id || p.teamId || ""

      const members = (p.teamMembers || []).map((m: any) => ({
        name: m.name || (typeof m === "string" ? m : ""),
        email: m.email || "",
        phone: m.phone || "",
        collegeName: m.college || m.collegeName || "",
        year: m.year || "",
      }))

      const checkedInVal =
        p.checkedIn === true || p.checkedIn === "Yes" || p.checkedIn === "YES"
          ? "Yes"
          : "No"

      const action = p.action || (p.paymentStatus && p.paymentStatus !== "PENDING" ? "edit" : "upsert")

      const ok = await post({
        type: "registration",
        action,
        id: regId,
        teamId: regId,
        eventName: p.eventName || "",
        teamName: teamOrName,
        fullName: p.fullName || "",
        email: p.email || "",
        phone: p.phone || "",
        collegeName: p.collegeName || "",
        year: p.year || "",
        paymentStatus: p.paymentStatus || "PENDING",
        paymentRefId: p.paymentRefId || "",
        pictureUrl: p.pictureUrl || "",
        checkedIn: checkedInVal,
        createdAt: formattedDate,
        teamMembers: members,
      })

      if (ok) console.log(`[apps-script] Registration synced (id=${regId}, action=${action}, ${members.length} members).`)
      return ok
    }

    // Non-registration payloads (whitelist, sponsor, etc.)
    return await post({ ...p })
  } catch (err) {
    console.error("[apps-script] syncToSheet failed:", err)
    return false
  }
}

/**
 * Reads registrations from the Google Sheet via the Apps Script web app.
 */
export async function fetchFromSheet(): Promise<any[]> {
  const url = cleanUrl(APPS_SCRIPT_URL)
  const secret = APPS_SCRIPT_API_KEY
  const spreadsheetId = await getSpreadsheetId()

  if (!url || !spreadsheetId) return []

  try {
    let fetchUrl = `${url}${url.includes("?") ? "&" : "?"}action=readRegistrations`
    fetchUrl += `&spreadsheetId=${encodeURIComponent(spreadsheetId)}`
    if (secret) {
      fetchUrl += `&secret=${encodeURIComponent(secret)}&appsScriptSecret=${encodeURIComponent(secret)}`
    }

    const res = await fetch(fetchUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return []

    const text = await res.text()
    if (!text || text.trim().startsWith("<")) {
      console.warn("[apps-script] fetchFromSheet returned non-JSON response.")
      return []
    }

    const data = JSON.parse(text)
    return Array.isArray(data) ? data : (data.registrations || [])
  } catch (err) {
    console.error("[apps-script] fetchFromSheet failed:", err)
    return []
  }
}

// ─── Row builders ────────────────────────────────────────────────────────────

interface RegistrationSheetRow {
  type: "registration"
  action?: "edit" | "create" | "upsert"
  id: string
  fullName: string
  email: string
  eventName: string
  teamSize: number
  paymentRefId: string
  amountPaid: number
  paymentStatus: string
  checkedIn?: boolean | string
  createdAt: string
  teamName?: string
  pictureUrl?: string
  phone?: string
  collegeName?: string
  year?: string
  teamMembers?: any[]
}

export function cleanEventName(eventName: string): string {
  const lower = (eventName || "").toLowerCase().trim()
  if (["singularity-strike", "singularity_strike", "code clash", "code_clash", "tech-solo-1"].includes(lower)) {
    return "Singularity Strike"
  } else if (["fifa", "fc26", "fc_26", "fc 26", "ea fc 26", "ea fc", "non-tech-1"].includes(lower)) {
    return "FC 26"
  } else if (["dual-debug", "dual_debug", "tech-duo-1"].includes(lower)) {
    return "Dual Debug"
  } else if (["bgmi", "non-tech-3"].includes(lower)) {
    return "BGMI"
  }
  return eventName || ""
}

export function cleanPhone(raw?: string): string {
  if (!raw) return ""
  let s = String(raw).trim()
  if (s.startsWith("+")) {
    s = s.substring(1).trim()
  }
  return s
}

export function buildRegistrationRow(input: RegistrationSheetRow) {
  const eventName = cleanEventName(input.eventName)
  const phone = cleanPhone(input.phone)
  return { ...input, eventName, phone }
}

export function buildDeleteRegistrationRow(input: { id: string; eventName: string; teamName?: string; email?: string }) {
  let eventName = input.eventName
  const lower = (eventName || "").toLowerCase().trim()
  if (["singularity-strike", "singularity_strike", "code clash", "code_clash", "tech-solo-1"].includes(lower)) {
    eventName = "Singularity Strike"
  } else if (["fifa", "fc26", "fc_26", "fc 26", "non-tech-1"].includes(lower)) {
    eventName = "FC 26"
  } else if (["dual-debug", "dual_debug", "tech-duo-1"].includes(lower)) {
    eventName = "Dual Debug"
  } else if (["bgmi", "non-tech-3"].includes(lower)) {
    eventName = "BGMI"
  }
  return {
    type: "delete_registration",
    id: input.id,
    teamId: input.id,
    eventName,
    teamName: input.teamName || "",
    email: input.email || "",
  }
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
