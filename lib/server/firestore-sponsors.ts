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
  const snap = await getDb().collection(COLLECTION).orderBy("createdAt", "desc").get()
  return snap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name || "",
      fields: data.fields || {},
      createdAt: data.createdAt ? (typeof data.createdAt.toDate === "function" ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
      updatedAt: data.updatedAt ? (typeof data.updatedAt.toDate === "function" ? data.updatedAt.toDate().toISOString() : data.updatedAt) : new Date().toISOString(),
    }
  })
}

export async function saveSponsor(id: string | null, name: string, fields: Record<string, string>): Promise<void> {
  const db = getDb()
  const now = Timestamp.now()
  if (id) {
    await db.collection(COLLECTION).doc(id).update({
      name,
      fields,
      updatedAt: now,
    })
  } else {
    await db.collection(COLLECTION).add({
      name,
      fields,
      createdAt: now,
      updatedAt: now,
    })
  }
}

export async function deleteSponsor(id: string): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).delete()
}
