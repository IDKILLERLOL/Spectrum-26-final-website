import "server-only"
import crypto from "crypto"

export async function getServiceAccountToken(): Promise<string | null> {
  const serviceAccount = {
    project_id: "spectrum-1-2026",
    client_email: "github-action-1117616876@spectrum-1-2026.iam.gserviceaccount.com",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDCu69rt20SSxra\nMSs0oH4djEr6xU4GRk3d+R1wYD+Vc2LO+tVYiv5z5vskR/oUGygavXlzbgaKaZ42\nvoAFpCxBgmjj93uZBQDZaI3lLJ/4jbmHWpFwuLqdNRvrgJpxU7f69RyJs9mH4Fx0\nHkWnPekM7hR5a+5FFtHYDFMe7PZT4Ut8I3lJDiXQsDa3U8eRLqoZ3mpDBEg7Btfa\nAatZhg3WGFT3GKROgEbbxHTHpmBlVzF4iB4f3HneWHg0PN92UH6E/+R0X+dcSVrX\nR9zG3LAWbWzizDsLyXs028vl6Y2g0BoJr9g8dlqg/qGpSd7jo3vDSV55HS9GiGdY\nUAkjpHi1AgMBAAECggEAO6ca+bha5Tu0ohplzd1MROjxHxjJ6gonWFQzvHT/hVyv\nbBBSwqjxgbfEPzz9UqNvCaH5Tm7p+gSYvtRki1XbaMX2M79gUWPC+taYgRfGeXGQ\n3/HSk+FC6V2Xi/D9XrHyriHf+B7sCD+mkrujQrQobBmSlA+IEgoHhlNgMx0L6G2W\nkuC2i1GV94lXaN/79hCmXRSZXbpAK0zsusqyaF7NQPz71S2omBu+MZPhcrMogZek\n25ure1fc3R1+oGlwwfQF/1W0Kwc1T44ocvR7mxfKeg1QeoZWhSnNazN7ynaYJspK\ncgH9TkOPovaP/W367bUYAKB6npZ4xMYZ2mXEvDi9EQKBgQDtLggDi2s5xoqVArN/\n9rSlSxmWJTc2BhacN81wVYkelxCS/zCfdxv0xcD78TxAbghy/qs5y4AWum96mlyV\nNZYOFq5tix3Chu40GIlDPISpCivTreGrt9Nba/xWH5qb13eQQ+Fr6LgDDXyVeg+y\nCAQ+cggJk3NZmvb48hWPVjL1NwKBgQDSL2kfy4Io4C2AA2Mp5EZYFCaGdJFEh7Ud\nzHHHmboLdI7p4O89O08Fj1Svr/K6wp3Funsf6tZkMu1HR9t7BcFTXZeNpozdFWAm\nX7VIs3ZoPf1sBGypznlhkeBxKMVY9FAbPQ2g6UhXL91puttms/BeWPN0bkuITa4d\nPf1HiTq3cwKBgQCYCtYgT5OhKeFUvLKM6X3MKGRyl9DY1PZRloQf6vVHoteBJA3r\na9OECfE4kOBq/R51eUQSfJ3T9BfapHGNRRi4V1nh5zhgp1a0FraHX5g7NMX7oI/2\nIJVhGcxc+U2HcYy38ovjPQAZFOA0glblbbYqwbbdTKS5YFnKJIYlqMBp6QKBgQCr\nVyzaV3seuUk+LwS6lLVnfd2+A+6cMAjMZupl7YKFbhpGvDAq+Vs8zBAcPFGiP56A\nHrnaVgU5n25gikp4akOkIwq11YzFeXRtM95DitC+v7IESUMP1hqLGHEfrj3aeyeG\nXOnsP9/R+1oCo+nROmR7dQXZ50O5tKF4gx0jINJ10wKBgQDUIu+keQ/czr27ExwS\nx1a9FzhtC7asU7wMA18aV4m9F0RWaPZc6LECV+Xi0yXsOpUnXo0qJi/tbkq0+8AO\n/aG0ynVJcadt/OgzzkiNiUGI/pAFYzsFXkeilSoyUpyR0BG6VCtgAC5oTEw3RrN9\nW+Va7sNX9qs/NOLl0RkszDe3IQ==\n-----END PRIVATE KEY-----\n"
  }

  try {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 3600
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
    const claim = Buffer.from(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp,
      iat
    })).toString("base64url")

    const sign = crypto.createSign("RSA-SHA256")
    sign.update(`${header}.${claim}`)
    const signature = sign.sign(serviceAccount.private_key, "base64url")
    const jwt = `${header}.${claim}.${signature}`

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt
      })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error("[service-account-auth] Google token exchange failed:", err)
      return null
    }

    const data = await res.json()
    return data.access_token || null
  } catch (err) {
    console.error("[service-account-auth] Failed to sign JWT:", err)
    return null
  }
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

    // Try Google Service Account first, fallback to user OAuth token
    let token: string | null = null
    try {
      token = await getServiceAccountToken()
    } catch (saErr) {
      console.warn("[apps-script] Service account token generation failed, trying user token...", saErr)
    }
    if (!token) {
      try {
        const { getSystemGmailToken } = await import("@/lib/server/firestore-registrations")
        token = await getSystemGmailToken()
      } catch {
        // Ignored
      }
    }

async function appendAndMerge(
  spreadsheetId: string,
  tabName: string,
  rowsToAppend: any[][],
  token: string
): Promise<boolean> {
  const allowedTabs = new Set([
    "All Registrations",
    "Singularity Strike",
    "Dual Debug",
    "FIFA",
    "FC 26",
    "BGMI",
    "Audit Logs",
    "Whitelist",
    "Sponsors",
    "Sheet1",
    "A:L"
  ])
  if (!allowedTabs.has(tabName)) {
    console.log(`[apps-script] Skipping append/create for irrelevant sheet tab name: '${tabName}'`)
    return true // Return true since it is an intentional skip
  }

  const encodedTab = encodeURIComponent(tabName)
  let appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedTab}!A:L:append?valueInputOption=USER_ENTERED`
  
  try {
    let apiRes = await fetch(appendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        majorDimension: "ROWS",
        values: rowsToAppend
      })
    })

    // If tab doesn't exist, create it, add headers, and retry
    if (!apiRes.ok && tabName !== "A:L" && tabName !== "Sheet1") {
      console.log(`[apps-script] Tab '${tabName}' not found. Creating sheet tab...`)
      const createRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: tabName
                }
              }
            }
          ]
        })
      })

      if (createRes.ok) {
        // Add headers first
        const headers = [
          "Event Name", "Team/Leader Name", "Role", "Name", "Email", 
          "Phone", "College", "Fee Status", "Transaction ID / Ref", 
          "Payment Screenshot", "Checked In", "Registered At"
        ]
        const headersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedTab}!A1:L1?valueInputOption=USER_ENTERED`
        await fetch(headersUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            majorDimension: "ROWS",
            values: [headers]
          })
        })

        // Now retry the append
        apiRes = await fetch(appendUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            majorDimension: "ROWS",
            values: rowsToAppend
          })
        })
      }
    }

    if (apiRes.ok) {
      console.log(`[apps-script] Appended successfully to tab '${tabName}'`)
      
      // Perform cell merge if multiple rows
      if (rowsToAppend.length > 1) {
        try {
          const resData = await apiRes.json()
          const updatedRange = resData.updates?.updatedRange
          if (updatedRange) {
            const rangeMatch = updatedRange.match(/A(\d+):L(\d+)/)
            if (rangeMatch) {
              const startRowIndex = parseInt(rangeMatch[1]) - 1
              const endRowIndex = parseInt(rangeMatch[2])

              // Fetch sheetId
              const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              let sheetId = 0
              if (metaRes.ok) {
                const metaData = await metaRes.json()
                const sheetObj = metaData.sheets?.find((s: any) => s.properties?.title === tabName)
                if (sheetObj) {
                  sheetId = sheetObj.properties.sheetId || 0
                }
              }

              const mergeColumns = [0, 1, 7, 8, 9, 10, 11]
              const requests = mergeColumns.map(colIndex => ({
                mergeCells: {
                  range: {
                    sheetId,
                    startRowIndex,
                    endRowIndex,
                    startColumnIndex: colIndex,
                    endColumnIndex: colIndex + 1
                  },
                  mergeType: "MERGE_ALL"
                }
              }))

              console.log(`[apps-script] Merging team cells on '${tabName}' from row ${startRowIndex + 1} to ${endRowIndex}...`)
              await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ requests })
              })
            }
          }
        } catch (mergeErr) {
          console.warn(`[apps-script] Cell merge on '${tabName}' failed:`, mergeErr)
        }
      }
      return true
    }
  } catch (err) {
    console.error(`[apps-script] appendAndMerge failed for '${tabName}':`, err)
  }
  return false
}

// Inside syncToSheet
    if (token) {
      console.log("[apps-script] Attempting direct Google Sheets REST API append...")
      let rowsToAppend: any[][] = []
      const p = payload as any
      if (p.type === "registration") {
        const parsedDate = new Date(p.createdAt || Date.now())
        const formattedDate = formatDateTime(parsedDate)

        // Leader row
        rowsToAppend.push([
          p.eventName || "",
          p.teamName || p.fullName || "",
          "LEADER",
          p.fullName || "",
          p.email || "",
          p.phone || "",
          p.collegeName || "",
          p.paymentStatus || "PENDING",
          p.paymentRefId || "",
          p.pictureUrl || "", // Screenshot
          "No", // Checked In
          formattedDate
        ])
        // Member rows
        if (p.teamMembers && Array.isArray(p.teamMembers)) {
          for (const m of p.teamMembers) {
            rowsToAppend.push([
              p.eventName || "",
              p.teamName || p.fullName || "",
              "MEMBER",
              m.name || "",
              m.email || "",
              m.phone || "",
              m.collegeName || m.college || "",
              p.paymentStatus || "PENDING",
              p.paymentRefId || "",
              p.pictureUrl || "", // Screenshot
              "No", // Checked In
              formattedDate
            ])
          }
        }
      } else {
        rowsToAppend.push([
          p.type || "unknown",
          JSON.stringify(p),
          new Date().toISOString()
        ])
      }

      // Sync to respective sheet tab
      let masterOk = false
      if (p.type === "registration") {
        masterOk = await appendAndMerge(spreadsheetId, "All Registrations", rowsToAppend, token)
        if (p.eventName) {
          await appendAndMerge(spreadsheetId, p.eventName, rowsToAppend, token)
        }
      } else {
        let tabName = "Audit Logs"
        if (p.type === "whitelist") {
          tabName = "Whitelist"
        } else if (p.type === "sponsor") {
          tabName = "Sponsors"
        }
        masterOk = await appendAndMerge(spreadsheetId, tabName, rowsToAppend, token)
      }

      if (masterOk) return true
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

    // Try Google Service Account first, fallback to user OAuth token
    let token: string | null = null
    try {
      token = await getServiceAccountToken()
    } catch (saErr) {
      console.warn("[apps-script] Service account token generation failed, trying user token...", saErr)
    }
    if (!token) {
      try {
        const { getSystemGmailToken } = await import("@/lib/server/firestore-registrations")
        token = await getSystemGmailToken()
      } catch {
        // Ignored
      }
    }

    if (token) {
      console.log("[apps-script] Attempting direct Google Sheets REST API read...")
      let readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("All Registrations!A:L")}`
      try {
        let apiRes = await fetch(readUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!apiRes.ok) {
          console.log("[apps-script] Direct read from 'All Registrations' tab failed, trying default first tab A:L...")
          readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("A:L")}`
          apiRes = await fetch(readUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        }
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
          console.warn("[apps-script] Direct Google Sheets API read failed on both tabs, falling back to Apps Script...")
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
  pictureUrl?: string
  phone?: string
  collegeName?: string
  year?: string
  teamMembers?: any[]
}

export function buildRegistrationRow(input: RegistrationSheetRow) {
  let eventName = input.eventName
  const lower = eventName.toLowerCase().trim()
  if (lower === "singularity-strike" || lower === "singularity_strike" || lower === "code clash" || lower === "code_clash" || lower === "tech-solo-1") {
    eventName = "Singularity Strike"
  } else if (lower === "fifa" || lower === "fc26" || lower === "fc_26" || lower === "fc 26" || lower === "non-tech-1") {
    eventName = "FC 26"
  } else if (lower === "dual-debug" || lower === "dual_debug" || lower === "tech-duo-1") {
    eventName = "Dual Debug"
  } else if (lower === "bgmi" || lower === "non-tech-3") {
    eventName = "BGMI"
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
