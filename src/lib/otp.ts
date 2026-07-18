// ─── OTP Auth Module ──────────────────────────────────────────────────────────
// Stores OTP codes in Firestore with TTL, rate limiting, and wrong-attempt tracking.
// Email delivery: currently logs to console (see TODO below for production).

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firestore';
import { sendEmail } from './email';


const OTP_TTL_MS = 10 * 60 * 1000;        // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;      // 60 seconds
const MAX_OTP_PER_HOUR = 5;
const MAX_WRONG_ATTEMPTS = 5;

interface OtpRecord {
  codeHash: string;             // simple hash (not bcrypt — JS env)
  createdAt: Date;
  expiresAt: Date;
  requestCount: number;         // total requests in current hour window
  hourWindowStart: Date;
  wrongAttempts: number;
  invalidated: boolean;         // true after 5 wrong attempts
  lastSentAt: Date;
}

/** Simple deterministic hash — not cryptographic, but sufficient for 6-digit OTP. */
function hashCode(code: string, email: string): string {
  const str = `${email}::${code}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash; // 32-bit
  }
  return (hash >>> 0).toString(16);
}

function generate6DigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export type OtpRequestResult =
  | { ok: true; cooldownEnds: Date; devCode?: string }
  | { ok: false; error: 'rate_limited'; retryAfter: number }
  | { ok: false; error: 'cooldown'; retryAfter: number };

/**
 * Requests an OTP for `email`. Enforces:
 * - 60-second resend cooldown
 * - Max 5 requests per hour
 *
 * Returns the generated code so the calling UI can display it in dev.
 * In production, replace the console.log with actual email delivery.
 */
export async function requestOtp(email: string): Promise<OtpRequestResult> {
  const ref = doc(db, 'otpStore', btoa(email));
  const snap = await getDoc(ref);
  const now = Date.now();

  if (snap.exists()) {
    const data = snap.data() as Omit<OtpRecord, 'createdAt' | 'expiresAt' | 'hourWindowStart' | 'lastSentAt'> & {
      createdAt: Timestamp;
      expiresAt: Timestamp;
      hourWindowStart: Timestamp;
      lastSentAt: Timestamp;
    };

    // Resend cooldown check
    const lastSentMs = data.lastSentAt.toMillis();
    if (now - lastSentMs < RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        error: 'cooldown',
        retryAfter: Math.ceil((RESEND_COOLDOWN_MS - (now - lastSentMs)) / 1000),
      };
    }

    // Rate limit check (reset window if > 1 hour since window start)
    const hourStart = data.hourWindowStart.toMillis();
    const inSameWindow = now - hourStart < 60 * 60 * 1000;
    const count = inSameWindow ? data.requestCount : 0;

    if (inSameWindow && count >= MAX_OTP_PER_HOUR) {
      return {
        ok: false,
        error: 'rate_limited',
        retryAfter: Math.ceil((60 * 60 * 1000 - (now - hourStart)) / 1000),
      };
    }

    const code = generate6DigitCode();
    const expiresAt = new Date(now + OTP_TTL_MS);

    await updateDoc(ref, {
      codeHash: hashCode(code, email),
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      requestCount: inSameWindow ? count + 1 : 1,
      hourWindowStart: inSameWindow ? data.hourWindowStart : Timestamp.fromDate(new Date(now)),
      wrongAttempts: 0,
      invalidated: false,
      lastSentAt: serverTimestamp(),
    });

    // TODO(production): Replace console.log with real email delivery.
    // Options: Firebase Cloud Function, SendGrid API, or EmailJS.
    deliverOtpEmail(email, code); // best-effort, non-blocking

    return { ok: true, cooldownEnds: new Date(now + RESEND_COOLDOWN_MS), devCode: code };
  }

  // First OTP request
  const code = generate6DigitCode();
  const expiresAt = new Date(now + OTP_TTL_MS);

  await setDoc(ref, {
    codeHash: hashCode(code, email),
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    requestCount: 1,
    hourWindowStart: serverTimestamp(),
    wrongAttempts: 0,
    invalidated: false,
    lastSentAt: serverTimestamp(),
  });

  deliverOtpEmail(email, code);

  return { ok: true, cooldownEnds: new Date(now + RESEND_COOLDOWN_MS), devCode: code };
}

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; error: 'expired' | 'invalid' | 'invalidated' | 'not_found' };

/**
 * Verifies an OTP code. Wrong codes increment wrongAttempts; at 5,
 * the code is invalidated (user must request a new one).
 * Wrong attempts do NOT count toward the hourly rate limit.
 */
export async function verifyOtp(email: string, code: string): Promise<OtpVerifyResult> {
  const ref = doc(db, 'otpStore', btoa(email));
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ok: false, error: 'not_found' };

  const data = snap.data() as Omit<OtpRecord, 'createdAt' | 'expiresAt' | 'hourWindowStart' | 'lastSentAt'> & {
    expiresAt: Timestamp;
  };

  if (data.invalidated) return { ok: false, error: 'invalidated' };
  if (Date.now() > data.expiresAt.toMillis()) return { ok: false, error: 'expired' };

  if (data.codeHash !== hashCode(code, email)) {
    const newWrong = data.wrongAttempts + 1;
    await updateDoc(ref, {
      wrongAttempts: newWrong,
      invalidated: newWrong >= MAX_WRONG_ATTEMPTS,
    });
    return { ok: false, error: 'invalid' };
  }

  // Correct — delete the OTP doc to completely reset cooldown and request count
  await deleteDoc(ref);
  return { ok: true };
}

// ─── Email delivery (best-effort, non-blocking) ───────────────────────────────

/**
 * Attempts to deliver OTP via Gmail API using a stored admin token.
 * This only works if an admin is currently logged in (i.e. has a cached token).
 * For participant OTP flows before login, falls back to console only.
 * TODO(production): replace with a backend endpoint that can send without OAuth.
 */
async function deliverOtpEmail(toEmail: string, code: string): Promise<void> {
  // Always log to console for development ease
  console.log(`[OTP Dev Log] Code for ${toEmail}: ${code}`);
  try {
    await sendEmail(

      toEmail,
      `Your Spectrum 26 OTP Code`,
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="letter-spacing:0.1em;text-transform:uppercase">SPECTRUM 26</h2>
        <p>Your one-time login code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:0.3em;padding:24px;background:#f5f5f5;text-align:center">${code}</div>
        <p style="color:#666;font-size:13px">Expires in 10 minutes. Do not share this code.</p>
      </div>`
    );
  } catch {
    // Silently fail — console already has the code for dev
  }
}
