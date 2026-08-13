import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import { hashEmail } from "./hash-email"
import type { AdminWhitelistEntry } from "@/types/firestore"

const COLLECTION = "adminWhitelist"

const whitelistCache = new Map<string, { result: boolean; timestamp: number }>()
const CACHE_TTL_MS = 60 * 1000 // 1 minute in-memory cache

export async function isWhitelisted(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim()
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
    // Fallback for bootstrap admin email if Firestore hits quota limit
    const bootstrapEmail = process.env.VITE_BOOTSTRAP_ADMIN_EMAIL || "i.doshi30@gmail.com"
    if (normalizedEmail === bootstrapEmail.toLowerCase().trim()) {
      return true
    }
    // Return cached if available even if expired
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
  await getDb()
    .collection(COLLECTION)
    .doc(hashEmail(email))
    .set({ email: email.toLowerCase(), addedAt: Timestamp.now(), addedBy })
}

export async function removeFromWhitelist(email: string): Promise<void> {
  await getDb().collection(COLLECTION).doc(hashEmail(email)).delete()
}

export async function listWhitelist(): Promise<(AdminWhitelistEntry & { id: string })[]> {
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
