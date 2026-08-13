import "server-only"
import { getDb } from "@/lib/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"

const COLLECTION = "sponsors"

export interface FirestoreSponsor {
  id: string
  name: string
  fields: Record<string, string>
  createdAt: any
  updatedAt: any
}

export async function listSponsors(): Promise<FirestoreSponsor[]> {
  try {
    const snap = await getDb().collection(COLLECTION).orderBy("createdAt", "desc").get()
    const items = snap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        fields: data.fields || {},
        createdAt: data.createdAt ? (typeof data.createdAt.toDate === "function" ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
        updatedAt: data.updatedAt ? (typeof data.updatedAt.toDate === "function" ? data.updatedAt.toDate().toISOString() : data.updatedAt) : new Date().toISOString(),
      }
    })

    if (items.length > 0) return items
  } catch (err: any) {
    console.warn("[listSponsors] Error or Quota limit reached:", err?.message || err)
  }

  // Fallback to static sponsors
  return [
    { id: "sp_1", name: "Tech Byte", fields: { tier: "Gold Sponsor" }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "sp_2", name: "Devfolio", fields: { tier: "Gold Sponsor" }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "sp_3", name: "Pixel Labs", fields: { tier: "Silver Sponsor" }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "sp_4", name: "Code Crafters", fields: { tier: "Silver Sponsor" }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "sp_5", name: "Geek Gear", fields: { tier: "Merch Partner" }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]
}

import { syncToSheet, buildSponsorRow } from "@/lib/google/apps-script"

export async function saveSponsor(id: string | null, name: string, fields: Record<string, string>): Promise<void> {
  const targetId = id || `sp_${Date.now()}`
  try {
    const db = getDb()
    const now = Timestamp.now()
    if (id) {
      await db.collection(COLLECTION).doc(id).update({
        name,
        fields,
        updatedAt: now,
      })
    } else {
      await db.collection(COLLECTION).doc(targetId).set({
        name,
        fields,
        createdAt: now,
        updatedAt: now,
      })
    }
  } catch (err) {
    console.warn("[saveSponsor] Firestore fallback warning:", err)
  }

  // Sync to Google Sheets Sponsors tab
  await syncToSheet(buildSponsorRow(targetId, name, fields, "SAVE"))
}

export async function deleteSponsor(id: string): Promise<void> {
  try {
    await getDb().collection(COLLECTION).doc(id).delete()
  } catch (err) {
    console.warn("[deleteSponsor] Firestore fallback warning:", err)
  }

  // Sync to Google Sheets Sponsors tab
  await syncToSheet(buildSponsorRow(id, "deleted", {}, "DELETE"))
}
