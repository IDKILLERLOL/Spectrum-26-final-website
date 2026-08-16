import { NextResponse } from "next/server"
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session"
import { isWhitelisted } from "@/lib/server/firestore-admin-whitelist"
import { getDb } from "@/lib/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"

const STATIC_ADMIN_EMAILS = new Set([
  "sbmpspectrum@gmail.com",
  "i.doshi30@gmail.com",
  "theperfectgamer1812@gmail.com",
  "galamann939@gmail.com",
  "prathampoladia12@gmail.com",
  "saraiyamahir009@gmail.com",
])

/**
 * Called after client-side Firebase Google sign-in. Verifies the ID token,
 * checks the adminWhitelist, and — only if allowed — sets the session cookie.
 */
export async function POST(request: Request) {
  try {
    console.log('[Admin Session] POST request received')
    let body: { idToken?: string; accessToken?: string | null; email?: string | null }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }

    if (!body.idToken) {
      return NextResponse.json({ error: "Missing idToken." }, { status: 400 })
    }

    let cookie: string
    let email: string
    try {
      const result = await createSessionCookie(body.idToken, body.email)
      cookie = result.cookie
      email = result.email
      console.log('[Admin Session] Session cookie created for email:', email)
    } catch (err: any) {
      console.error("[POST /api/admin/session] token verification failed:", err?.message || err)
      return NextResponse.json(
        { error: "Could not verify Google sign-in: " + (err?.message || "Invalid token") },
        { status: 401 }
      )
    }

    // Check whitelist — static emails always pass, Firestore errors fall back safely
    const normalizedEmail = email.toLowerCase().trim()
    if (STATIC_ADMIN_EMAILS.has(normalizedEmail)) {
      // Immediate pass for static admin accounts
    } else {
      try {
        const allowed = await isWhitelisted(normalizedEmail)
        if (!allowed) {
          console.log(`[Admin Session] Rejected unauthorized email: ${normalizedEmail}`)
          return NextResponse.json(
            { error: "This Google account (" + normalizedEmail + ") is not authorized for admin access." },
            { status: 403 }
          )
        }
      } catch (err: any) {
        console.warn("[Admin Session] Whitelist check error:", err?.message || err)
        if (!STATIC_ADMIN_EMAILS.has(normalizedEmail)) {
          return NextResponse.json(
            { error: "This Google account is not authorized for admin access." },
            { status: 403 }
          )
        }
      }
    }

    const res = NextResponse.json({ ok: true, email: normalizedEmail })
    res.cookies.set(SESSION_COOKIE_NAME, cookie, SESSION_COOKIE_OPTIONS)

    if (body.accessToken) {
      try {
        const db = getDb()
        if (db) {
          await db.collection("systemConfig").doc("gmail").set({
            token: body.accessToken,
            updatedAt: Timestamp.now(),
          })
        }
      } catch (err) {
        console.warn("[POST /api/admin/session] Failed to save gmail token to Firestore (non-fatal):", err)
      }
    }

    return res
  } catch (globalErr: any) {
    console.error("[POST /api/admin/session] Fatal unhandled error:", globalErr)
    // Provide a more helpful message if it's a Firebase admin config issue
    const errMsg = globalErr?.message || String(globalErr)
    let userError = "Session creation error: " + errMsg
    if (errMsg.includes("Firebase Admin SDK is not configured") ||
        errMsg.includes("Missing valid FIREBASE_PROJECT_ID")) {
      userError = "Server misconfiguration: Firebase Admin SDK not initialized. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
    }
    return NextResponse.json(
      { error: userError },
      { status: 500 }
    )
  }
}
