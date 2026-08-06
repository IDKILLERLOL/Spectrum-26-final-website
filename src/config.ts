// ─── Spectrum 26 — Configurable Constants ────────────────────────────────────
// All values that might need changing are here or in .env (VITE_ prefix).
// Never import from here AND hardcode the same value elsewhere.

/** Target event date. Change this when the exact date is confirmed. */
export const EVENT_DATE = new Date('2026-09-30T09:00:00+05:30');

/** UPI handle for payment instructions shown to participants. */
export const UPI_ID: string = import.meta.env.VITE_UPI_ID ?? '9021095204';

/** Email address for the "Need help?" mailto button on event detail pages. */
export const HELP_EMAIL: string =
  import.meta.env.VITE_HELP_EMAIL ?? 'spectrum26help@example.com';

/**
 * Gmail address used as the "From" sender for all outgoing emails.
 * Must match the Google account whose OAuth token is used when sending.
 */
export const SENDER_EMAIL: string =
  import.meta.env.VITE_SENDER_EMAIL ?? 'i.doshi30@gmail.com';

/**
 * Shared admin gate password (STEP 1 of admin auth).
 * Set in .env as VITE_ADMIN_GATE_PASSWORD.
 * Change this value in .env — never hardcode it in source.
 */
export const ADMIN_GATE_PASSWORD: string =
  import.meta.env.VITE_ADMIN_GATE_PASSWORD ?? 'spectrum2026';

export const BOOTSTRAP_ADMIN_EMAIL: string =
  import.meta.env.VITE_BOOTSTRAP_ADMIN_EMAIL ?? 'i.doshi30@gmail.com';

/** Festival name — used in email subjects and display text. */
export const FEST_NAME = 'SPECTRUM 26';
