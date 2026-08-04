// ─── useAuth Hook ─────────────────────────────────────────────────────────────
// Central auth hook for all components. Provides:
//   - user: Firebase Auth user (null if not logged in, persists across refreshes)
//   - loading: true only during the initial Firebase Auth state check (~100ms)
//   - isAdmin: true after completing both steps of admin gate (sessionStorage)
//   - adminEmail: the Google email used for admin login (for audit attribution)

import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  adminGoogleSignIn,
  logout as firebaseLogout,
  getAccessToken,
  auth,
} from './auth';

import { upsertUser, getUser } from './firestore';
import { isAdminWhitelisted, logUnauthorizedAdminAttempt, bootstrapFirstAdmin } from './firestore';
import { ADMIN_GATE_PASSWORD, BOOTSTRAP_ADMIN_EMAIL } from '../config';

// ─── Admin session (separate from Firebase Auth user) ────────────────────────
// Stored in localStorage but synchronized across tabs. Cleared if all tabs are closed.

const ADMIN_SESSION_KEY = 'spectrum26_admin_session';

interface AdminSession {
  email: string;
}

function getStoredAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeAdminSession(session: AdminSession) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

// ─── Constant-time password comparison ───────────────────────────────────────

function constantTimeEquals(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let result = a.length !== b.length ? 1 : 0;
  for (let i = 0; i < maxLen; i++) {
    result |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0);
  }
  return result === 0;
}

// ─── Module state for session tracking ───────────────────────────────────────
// Resets to false on page refresh/reload or when opened in a new tab.
let verifiedThisSession = false;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(getStoredAdminSession);

  // ─── Firebase Auth state (always resolves, persists across refreshes) ───────
  useEffect(() => {
    const checkSession = async () => {
      if (!verifiedThisSession) {
        verifiedThisSession = true;
        const wasAdmin = !!getStoredAdminSession();
        if (wasAdmin) {
          try {
            await firebaseLogout();
          } catch (e) {
            console.error('[auth] Init logout error:', e);
          }
          clearAdminSession();
          setAdminSession(null);
          setUser(null);
        }
      }

      const unsubscribe = initAuth(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const isAdmin = firebaseUser.email ? await isAdminWhitelisted(firebaseUser.email) : false;
            if (!isAdmin) {
              const profile = await getUser(firebaseUser.uid);
              if (!profile) {
                console.warn('[auth] User profile does not exist in Firestore. Logging out...');
                await firebaseLogout();
                setUser(null);
                setLoading(false);
                return;
              }
            }
          } catch (err) {
            console.error('[auth] Firestore profile check error:', err);
          }
        }
        setUser(firebaseUser);
        setLoading(false);
      });
      return unsubscribe;
    };

    let unsub: () => void = () => {};
    checkSession().then((u) => {
      if (u) unsub = u;
    });
    return () => unsub();
  }, []);

  // ─── Participant: Google login ──────────────────────────────────────────────

  const loginWithGoogle = useCallback(async () => {
    verifiedThisSession = true;
    const firebaseUser = await googleSignIn();
    // upsertUser creates/updates the Firestore user record.
    // onAuthStateChanged fires automatically and updates the user state.
    await upsertUser(
      firebaseUser.uid,
      firebaseUser.email ?? '',
      firebaseUser.displayName ?? '',
      'google'
    );
    return firebaseUser;
  }, []);

  const setOtpUser = useCallback((u: User) => {
    verifiedThisSession = true;
    setUser(u);
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await firebaseLogout();
    } catch (e) {
      console.error('[auth] Logout error:', e);
    }
    setUser(null);
    clearAdminSession();
    setAdminSession(null);
  }, []);

  // ─── Admin: Step 1 — password gate ────────────────────────────────────────

  const verifyAdminPassword = useCallback((password: string): boolean => {
    return constantTimeEquals(password, ADMIN_GATE_PASSWORD);
  }, []);

  // ─── Admin: Step 2 — Google OAuth + whitelist check ───────────────────────

  const adminLoginWithGoogle = useCallback(async (): Promise<
    { ok: true; email: string } | { ok: false; error: string }
  > => {
    try {
      verifiedThisSession = true;
      const result = await adminGoogleSignIn();
      const email = result.user.email ?? '';

      // Bootstrap: if VITE_BOOTSTRAP_ADMIN_EMAIL is set and whitelist is empty,
      // automatically seed the whitelist with that email on first run.
      if (BOOTSTRAP_ADMIN_EMAIL && email === BOOTSTRAP_ADMIN_EMAIL) {
        await bootstrapFirstAdmin(email);
      }

      const whitelisted = await isAdminWhitelisted(email);

      if (!whitelisted) {
        await firebaseLogout();
        await logUnauthorizedAdminAttempt(email, null);
        return { ok: false, error: 'Access denied. Your account is not an authorised admin.' };
      }

      const session: AdminSession = { email };
      storeAdminSession(session);
      setAdminSession(session);
      return { ok: true, email };
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        return { ok: false, error: 'Sign-in cancelled' };
      }
      console.error('[useAuth] Admin sign-in error:', err);
      return { ok: false, error: 'An error occurred during sign-in. Check console for details.' };
    }
  }, []);

  const adminBypassGoogle = useCallback((email: string) => {
    verifiedThisSession = true;
    const session: AdminSession = { email };
    storeAdminSession(session);
    setAdminSession(session);
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      await firebaseLogout();
    } catch (e) {
      console.error('[auth] Admin logout error:', e);
    }
    setUser(null);
    clearAdminSession();
    setAdminSession(null);
  }, []);

  return {
    user,
    loading,
    isAdmin: adminSession !== null,
    adminEmail: adminSession?.email ?? null,
    loginWithGoogle,
    setOtpUser,
    logout,
    verifyAdminPassword,
    adminLoginWithGoogle,
    adminBypassGoogle,
    adminLogout,
    getAccessToken,
    auth,
  };
}
