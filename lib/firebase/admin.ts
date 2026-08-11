import "server-only"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { getAuth, type Auth } from "firebase-admin/auth"

/**
 * firebase-admin singleton, safe across Next.js dev hot-reloads (which would
 * otherwise throw "app already exists" on every edit). Server-only — importing
 * this from a client component is a build error by design (`server-only`).
 */
function getAdminApp(): App {
  const existing = getApps()
  if (existing.length > 0) return existing[0]

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })
  }

  // Fallback to Application Default Credentials (ADC) or local setup
  try {
    return initializeApp()
  } catch (err) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and " +
        "FIREBASE_PRIVATE_KEY in .env — generate a service account at Firebase Console > " +
        "Project Settings > Service Accounts > Generate new private key. See .env.example."
    )
  }
}

let _db: Firestore | null = null
let _auth: Auth | null = null

export function getDb(): Firestore {
  if (!_db) _db = getFirestore(getAdminApp())
  return _db
}

export function getAdminAuth(): Auth {
  if (!_auth) _auth = getAuth(getAdminApp())
  return _auth
}
