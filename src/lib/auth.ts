// ─── Firebase Auth ────────────────────────────────────────────────────────────
// Handles both participant auth (Google) and admin auth (two-step gate).
//
// IMPORTANT: No Gmail scopes are added to either provider.
// Sending email via Gmail API requires a separately managed OAuth flow once
// the admin is signed in. For now email is best-effort / console-only.

import {
  initializeApp,
  getApps,
} from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
  Unsubscribe,
} from 'firebase/auth';
import { saveSystemGmailToken, getSystemGmailToken } from './firestore';
import fallbackConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackConfig.measurementId || "",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || fallbackConfig.firestoreDatabaseId || "(default)"
};

// ─── Init ─────────────────────────────────────────────────────────────────────

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ─── Google providers (Request Gmail scopes so email sending works from client) ───

const participantProvider = new GoogleAuthProvider();
participantProvider.addScope('https://www.googleapis.com/auth/gmail.send');
// Force account picker so multi-account users can choose which account to use
participantProvider.setCustomParameters({ prompt: 'select_account' });

const adminProvider = new GoogleAuthProvider();
adminProvider.addScope('https://www.googleapis.com/auth/gmail.send');
adminProvider.setCustomParameters({ prompt: 'select_account' });

// ─── Gmail token cache (set only when admin/user explicitly re-authenticates) ───
// Cleared on every page load — expected. Falls back to system stored Firestore token.

let cachedGmailToken: string | null = null;

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedGmailToken) return cachedGmailToken;
  const dbToken = await getSystemGmailToken();
  if (dbToken) {
    cachedGmailToken = dbToken;
  }
  return cachedGmailToken;
};
export const setCachedGmailToken = (token: string | null): void => { cachedGmailToken = token; };

// ─── Auth state listener ──────────────────────────────────────────────────────
// Simple: always resolves loading immediately when Firebase Auth state is known.
// Does NOT block on Gmail token — those are separate concerns.

export const initAuth = (callback: (user: User | null) => void): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};

// ─── Participant Google Sign-In ───────────────────────────────────────────────

export const googleSignIn = async (): Promise<User> => {
  const result = await signInWithPopup(auth, participantProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential?.accessToken) {
    cachedGmailToken = credential.accessToken;
  }
  return result.user;
};

// ─── Admin Google Sign-In (Step 2 of admin gate) ─────────────────────────────

export const adminGoogleSignIn = async (): Promise<{ user: User; accessToken: string | null }> => {
  const result = await signInWithPopup(auth, adminProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  cachedGmailToken = credential?.accessToken ?? null;
  if (cachedGmailToken) {
    await saveSystemGmailToken(cachedGmailToken);
  }
  return { user: result.user, accessToken: cachedGmailToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedGmailToken = null;
};
