import "server-only"
import { getDb, isAdminConfigured } from "@/lib/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"

const COLLECTION = "team"

export interface FirestoreTeamMember {
  id: string
  name: string
  role: string
  imageUrl: string
  order?: number
  createdAt?: string | null
  updatedAt?: string | null
}

export async function listTeamMembers(): Promise<FirestoreTeamMember[]> {
  if (!isAdminConfigured()) {
    console.warn("[listTeamMembers] Firebase Admin SDK not configured. Returning empty array.")
    return []
  }
  try {
    const snap = await getDb().collection(COLLECTION).orderBy("createdAt", "asc").get()
    if (snap.empty) return []
    return snap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        role: data.role || "",
        imageUrl: data.imageUrl || "",
        order: data.order ?? 0,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (typeof data.createdAt === "string" ? data.createdAt : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (typeof data.updatedAt === "string" ? data.updatedAt : null),
      }
    })
  } catch (err) {
    console.warn("[listTeamMembers] Firestore error or quota limit reached:", err)
    return []
  }
}

export async function createTeamMember(input: {
  name: string
  role: string
  imageUrl?: string
  order?: number
}): Promise<string> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const db = getDb()
  const now = Timestamp.now()
  const ref = await db.collection(COLLECTION).add({
    name: input.name.trim(),
    role: input.role.trim(),
    imageUrl: input.imageUrl?.trim() || "",
    order: input.order ?? 0,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateTeamMember(
  id: string,
  input: Partial<{ name: string; role: string; imageUrl: string; order: number }>
): Promise<void> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const db = getDb()
  const updateData: Record<string, any> = { updatedAt: Timestamp.now() }
  if (input.name !== undefined) updateData.name = input.name.trim()
  if (input.role !== undefined) updateData.role = input.role.trim()
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl.trim()
  if (input.order !== undefined) updateData.order = input.order
  await db.collection(COLLECTION).doc(id).update(updateData)
}

export async function deleteTeamMember(id: string): Promise<void> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  await getDb().collection(COLLECTION).doc(id).delete()
}
