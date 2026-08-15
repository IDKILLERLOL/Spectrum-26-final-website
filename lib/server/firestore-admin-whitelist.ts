import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import { hashEmail } from "./hash-email"
import type { AdminWhitelistEntry } from "@/types/firestore"

const COLLECTION = "adminWhitelist"

/** Always-authorized admin accounts — no Firestore or env var needed. */
const STATIC_ADMIN_EMAILS = new Set([
  "i.doshi30@gmail.com",
  "theperfectgamer1812@gmail.com",
  "galamann939@gmail.com",
  "prathampoladia12@gmail.com",
  "saraiyamahir009@gmail.com",
])

const whitelistCache = new Map<string, { result: boolean; timestamp: number }>()
const CACHE_TTL_MS = 60 * 1000 // 1 minute in-memory cache

export async function isWhitelisted(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim()

  // Static list always wins — no DB or env needed
  if (STATIC_ADMIN_EMAILS.has(normalizedEmail)) return true

  const cached = whitelistCache.get(normalizedEmail)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result
  }

  try {
    const doc = await getDb().collection(COLLECTION).doc(hashEmail(normalizedEmail)).get()
    const result = doc.exists
    whitelistCache.set(normalizedEmail, { result, timestamp: Date.now() })
    return result
  } catch (err: any) {
    console.warn("[firestore-admin-whitelist] isWhitelisted error/quota fallback:", err?.message || err)
    if (cached) return cached.result
    return false
  }
}

export async function isWhitelistEmpty(): Promise<boolean> {
  try {
    const snap = await getDb().collection(COLLECTION).limit(1).get()
    return snap.empty
  } catch (err: any) {
    console.warn("[firestore-admin-whitelist] isWhitelistEmpty error/quota fallback:", err?.message || err)
    return false
  }
}

export async function addToWhitelist(email: string, addedBy: string): Promise<void> {
  const normalized = email.toLowerCase().trim()
  whitelistCache.set(normalized, { result: true, timestamp: Date.now() })
  try {
    await getDb()
      .collection(COLLECTION)
      .doc(hashEmail(normalized))
      .set({ email: normalized, addedAt: Timestamp.now(), addedBy })
  } catch (err) {
    console.warn("[addToWhitelist] Firestore warning:", err)
  }
}

export async function removeFromWhitelist(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim()
  whitelistCache.delete(normalized)
  try {
    await getDb().collection(COLLECTION).doc(hashEmail(normalized)).delete()
  } catch (err) {
    console.warn("[removeFromWhitelist] Firestore warning:", err)
  }
}

export async function listWhitelist(): Promise<(AdminWhitelistEntry & { id: string })[]> {
  try {
    const snap = await getDb().collection(COLLECTION).get()
    return snap.docs.map((d) => {
      const data = d.data() || {}
      return {
        id: d.id,
        email: data.email || "",
        addedBy: data.addedBy || "unknown",
        addedAt: data.addedAt || null,
      } as any
    })
  } catch (err) {
    console.warn("[listWhitelist] Error or Quota limit reached:", err)
    return Array.from(STATIC_ADMIN_EMAILS).map((email, idx) => ({
      id: `static_${idx}`,
      email,
      addedBy: "system",
      addedAt: new Date().toISOString(),
    })) as any
  }
}

/**
 * "First successful sign-in when the whitelist is empty becomes the first
 * admin" — generic bootstrap logic, not a hardcoded email check. Returns true
 * if this call performed the bootstrap (i.e. the whitelist was empty).
 */
export async function bootstrapIfEmpty(email: string): Promise<boolean> {
  const empty = await isWhitelistEmpty()
  if (empty) {
    await addToWhitelist(email, "bootstrap")
    return true
  }
  return false
}
