import "server-only"
import { createHash } from "crypto"

/**
 * Deterministic, non-reversible doc ID for an email — used for `users`,
 * `adminWhitelist`, and as half of the `registrations` composite key. Keeps raw
 * emails (PII) out of document IDs, which show up more casually in logs/rules
 * than a field would, while still giving O(1) existence checks and natural
 * dedup via create-only writes.
 */
export function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 24)
}

export function hashRegistrationKey(eventId: string, email: string): string {
  return createHash("sha256")
    .update(`${eventId}:${email.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 24)
}
