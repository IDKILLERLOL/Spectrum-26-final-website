"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, browserSessionPersistence, setPersistence } from "firebase/auth"

/**
 * Narrow, deliberate exception to "no Firebase client SDK" — used ONLY by the
 * /supercore/login Google sign-in button. Firebase's own web config values are
 * meant to be public (security comes from Firestore/Auth rules, not from hiding
 * this config), but nothing else in the app should import from this file.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/**
 * Lazily initialized: importing this module must never throw. Next.js still
 * evaluates "use client" modules during SSR/prerendering (e.g. building the
 * /supercore/login page), and Firebase Auth validates apiKey eagerly at
 * getAuth() time — if NEXT_PUBLIC_FIREBASE_* isn't configured in the build
 * environment, an eager call here would fail the entire site build. Deferring
 * to call-time means it only ever runs from the browser click handler.
 */
export function getClientAuth() {
  // Check if all required config values are present
  const missing = []
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY')
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET')
  if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID')
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID')

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase client environment variables: ${missing.join(', ')}. ` +
      `Please fill them in .env.local (see .env.example).`
    )
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  const auth = getAuth(app)
  // Ensure persistence avoids visibilitychange IndexedDB drop during popup
  setPersistence(auth, browserSessionPersistence).catch(() => {})
  return auth
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("https://www.googleapis.com/auth/gmail.send")
googleProvider.setCustomParameters({ prompt: "consent select_account" })