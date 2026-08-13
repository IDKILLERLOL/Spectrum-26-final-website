import "server-only"
import { getDb } from "@/lib/firebase/admin"

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Sends email via the Gmail API using either a provided tokenOverride or the
 * system-stored OAuth access token from Firestore ('systemConfig/gmail').
 */
export async function sendEmail(message: EmailMessage, tokenOverride?: string | null): Promise<boolean> {
  const db = getDb()

  let token = tokenOverride || null
  if (!token) {
    try {
      // 1. Try environment variables for OAuth auto-refresh
      const clientId = process.env.GMAIL_CLIENT_ID
      const clientSecret = process.env.GMAIL_CLIENT_SECRET
      const refreshToken = process.env.GMAIL_REFRESH_TOKEN

      if (clientId && clientSecret && refreshToken) {
        const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
          }),
        })
        const refreshData = await refreshRes.json()
        if (refreshRes.ok && refreshData.access_token) {
          token = refreshData.access_token
        }
      }

      // 2. Fall back to Firestore document 'systemConfig/gmail'
      if (!token) {
        const doc = await db.collection("systemConfig").doc("gmail").get()
        if (doc.exists) {
          const docData = doc.data()
          token = docData?.token || null
          // If stored doc has refresh_token credentials, exchange for access_token
          if (!token && docData?.refreshToken && docData?.clientId && docData?.clientSecret) {
            const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id: docData.clientId,
                client_secret: docData.clientSecret,
                refresh_token: docData.refreshToken,
                grant_type: "refresh_token",
              }),
            })
            const refreshData = await refreshRes.json()
            if (refreshRes.ok && refreshData.access_token) {
              token = refreshData.access_token
            }
          }
        }
      }
    } catch (err) {
      console.error("[email] Failed to resolve Gmail access token:", err)
    }
  }

  if (!token) {
    console.warn("[email:console-fallback] No Gmail token configured. Falling back to console logging.")
    console.log("[email:console-fallback] ---- would-be email ----")
    console.log(`[email:console-fallback] To: ${message.to}`)
    console.log(`[email:console-fallback] Subject: ${message.subject}`)
    console.log(`[email:console-fallback] Body:\n${message.text}`)
    console.log("[email:console-fallback] -------------------------")
    return true
  }

  // Construct MIME email RFC 822 format
  const senderEmail = process.env.VITE_SENDER_EMAIL || "i.doshi30@gmail.com"
  const festName = "SPECTRUM 26"

  const rawMessage = [
    `From: ${festName} <${senderEmail}>`,
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    message.html,
  ].join("\r\n")

  // Base64URL encoding
  const encoded = Buffer.from(rawMessage, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

  try {
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.warn("[email] Gmail API send failed:", err)
      if (res.status === 401) {
        console.warn("[email] Gmail API access token expired. Clearing token from Firestore.")
        await db.collection("systemConfig").doc("gmail").delete()
      }
      return false
    }

    console.log(`[email] Email sent successfully to ${message.to}`)
    return true
  } catch (err) {
    console.warn("[email] Failed to send via Gmail API:", err)
    return false
  }
}
