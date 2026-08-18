import "server-only"
import { getDb } from "@/lib/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"
import { isAdminConfigured } from "@/lib/firebase/admin"

const COLLECTION = "sponsors"

export interface FirestoreSponsor {
  id: string
  name: string
  fields: Record<string, string>
  tags: string[]
  createdAt: any
  updatedAt: any
}

export async function listSponsors(): Promise<FirestoreSponsor[]> {
  if (!isAdminConfigured()) {
    return []
  }
  try {
    const snap = await getDb().collection(COLLECTION).orderBy("createdAt", "desc").get()
    return snap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        fields: data.fields || {},
        tags: data.tags || [],
        createdAt: data.createdAt ? (typeof data.createdAt.toDate === "function" ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
        updatedAt: data.updatedAt ? (typeof data.updatedAt.toDate === "function" ? data.updatedAt.toDate().toISOString() : data.updatedAt) : new Date().toISOString(),
      }
    })
  } catch (err) {
    console.error("[listSponsors] Error:", err)
    return []
  }
}

export async function saveSponsor(id: string | null, name: string, fields: Record<string, string>, tags: string[] = []): Promise<void> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const db = getDb()
  const now = Timestamp.now()
  if (id) {
    await db.collection(COLLECTION).doc(id).set({
      name,
      fields,
      tags,
      updatedAt: now,
    }, { merge: true })
  } else {
    await db.collection(COLLECTION).add({
      name,
      fields,
      tags,
      createdAt: now,
      updatedAt: now,
    })
  }
}

export async function deleteSponsor(id: string): Promise<void> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  await getDb().collection(COLLECTION).doc(id).delete()
}
