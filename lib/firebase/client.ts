"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

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
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getAuth(app)
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })
