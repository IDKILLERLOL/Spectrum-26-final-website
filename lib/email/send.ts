import "server-only"
import { getDb } from "@/lib/firebase/admin"

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Sends email unconditionally via the Google Apps Script Web App.
 */
export async function sendEmail(message: EmailMessage, tokenOverride?: string | null): Promise<boolean> {
  const rawUrl = process.env.EMAIL_APPS_SCRIPT_URL || process.env.APPS_SCRIPT_URL || process.env.VITE_GOOGLE_SHEETS_WEBAPP_URL
  const appsScriptUrl = rawUrl ? rawUrl.replace(/^["']|["']$/g, "") : "https://script.google.com/macros/s/AKfycbxtCVXriQbKWhJ1BioBOZPthxQOoPthyC-5HwZNJukI8zk7CXcis5IfbXrJ7SXhluUYiw/exec"
  const secret = process.env.EMAIL_APPS_SCRIPT_SECRET || process.env.APPS_SCRIPT_SECRET || "SECRET123"

  let authHeader: Record<string, string> = {}
  try {
    const db = getDb()
    const settingsDoc = await db.collection("settings").doc("global").get()
    const activeSender = settingsDoc.data()?.activeGmailSender || "sbmpspectrum@gmail.com"
    const tokenDoc = await db.collection("gmailTokens").doc(activeSender).get()
    const tempToken = tokenDoc.data()?.token
    if (tempToken) {
      authHeader = { Authorization: `Bearer ${tempToken}` }
    }
  } catch {}

  if (appsScriptUrl) {
    console.log(`[email] Dispatching email to ${message.to} via Apps Script Web App...`)
    try {
      const relayRes = await fetch(appsScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader
        },
        body: JSON.stringify({
          apiKey: secret,
          secret,
          appsScriptSecret: secret,
          type: "email",
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      })
      if (relayRes.ok || relayRes.status === 302 || relayRes.status === 200) {
        console.log(`[email] Email sent successfully via Apps Script to ${message.to}`)
        return true
      }
    } catch (err) {
      console.error("[email] Apps Script email dispatch error:", err)
    }
  }

  console.warn("[email:console-fallback] Apps Script dispatch failed. Falling back to console logging.")
  console.log("[email:console-fallback] ---- would-be email ----")
  console.log(`To: ${message.to}`)
  console.log(`Subject: ${message.subject}`)
  console.log("------------------------")
  return false
}
