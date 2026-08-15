import "server-only"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import { hashEmail } from "./hash-email"
import type { FirestoreUser } from "@/types/firestore"

const COLLECTION = "users"

interface UpsertUserInput {
  email: string
  fullName: string
  phone: string
  collegeName: string
  year: string
}

/** Creates or updates the profile record for an email, incrementing totalRegistrations. */
export async function upsertUser(input: UpsertUserInput): Promise<void> {
  const db = getDb()
  const ref = db.collection(COLLECTION).doc(hashEmail(input.email))
  const now = Timestamp.now()

  await ref.set(
    {
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      phone: input.phone,
      collegeName: input.collegeName,
      year: input.year,
      totalRegistrations: FieldValue.increment(1),
      updatedAt: now,
      createdAt: now, // ignored by merge if the doc already has one; set covers first-write case
    },
    { merge: true }
  )
}

export async function listUsers(): Promise<(FirestoreUser & { id: string })[]> {
  const snap = await getDb().collection(COLLECTION).orderBy("updatedAt", "desc").get()
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreUser) }))
}

export async function deleteUser(id: string): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).delete()
}

export async function updateUser(id: string, patch: Partial<FirestoreUser>): Promise<void> {
  await getDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ ...patch, updatedAt: Timestamp.now() })
}
