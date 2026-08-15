import "server-only"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

/**
 * firebase-admin singleton, safe across Next.js dev hot-reloads and Vercel serverless.
 */
function getAdminApp(): App | null {
  const existing = getApps()
  if (existing.length > 0) return existing[0]

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })
    } catch (err) {
      console.warn("[Firebase Admin] Failed to initialize with cert:", err)
    }
  }

  // Fallback to Application Default Credentials (ADC) or local setup
  try {
    return initializeApp(projectId ? { projectId } : undefined)
  } catch (err) {
    console.warn("[Firebase Admin] Failed to initialize fallback app:", err)
    return null
  }
}

let _db: Firestore | null = null

export function getDb(): Firestore {
  if (!_db) {
    const app = getAdminApp()
    if (!app) {
      throw new Error("Firebase Admin SDK is not configured. Missing valid FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY.")
    }
    _db = getFirestore(app)
  }
  return _db
}
