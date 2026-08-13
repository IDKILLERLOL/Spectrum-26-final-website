import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import { hashEmail } from "./hash-email"
import type { AdminWhitelistEntry } from "@/types/firestore"

const COLLECTION = "adminWhitelist"

export async function isWhitelisted(email: string): Promise<boolean> {
  const doc = await getDb().collection(COLLECTION).doc(hashEmail(email)).get()
  return doc.exists
}

export async function isWhitelistEmpty(): Promise<boolean> {
  const snap = await getDb().collection(COLLECTION).limit(1).get()
  return snap.empty
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
