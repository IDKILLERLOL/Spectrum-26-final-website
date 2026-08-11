import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import { hashRegistrationKey } from "./hash-email"
import type { FirestoreRegistration, PaymentStatus } from "@/types/firestore"
import type { RegistrationInput } from "@/lib/validation/registration"

const COLLECTION = "registrations"

export class DuplicateRegistrationError extends Error {
  constructor() {
    super("A registration already exists for this email and event.")
    this.name = "DuplicateRegistrationError"
  }
}

interface CreateRegistrationInput extends RegistrationInput {
  eventName: string
  amountPaid: number
}

/**
 * The actual duplicate-prevention mechanism: a deterministic doc ID
 * (hash of eventId+email) combined with Firestore's `create()` (not `set()`),
 * which throws ALREADY_EXISTS if the doc is already there. No read-then-write
 * race condition — this is atomic at the Firestore level.
 */
export async function createRegistration(input: CreateRegistrationInput): Promise<string> {
  const db = getDb()
  const id = hashRegistrationKey(input.eventId, input.email)
  const ref = db.collection(COLLECTION).doc(id)
  const now = Timestamp.now()

  const doc: FirestoreRegistration = {
    userEmail: input.email.toLowerCase(),
    fullName: input.fullName,
    phone: input.phone,
    collegeName: input.collegeName ?? "",
    year: input.year,
    eventId: input.eventId,
    eventName: input.eventName,
    teamMembers: input.teamMembers.map((name) => ({ name })),
    teamSize: 1 + input.teamMembers.length,
    paymentRefId: input.paymentRefId,
    amountPaid: input.amountPaid,
    paymentStatus: "PENDING",
    paymentVerifiedBy: null,
    paymentVerifiedAt: null,
    sheetsSyncStatus: "PENDING",
    emailSentAt: null,
    createdAt: now,
    updatedAt: now,
  }

  try {
    await ref.create(doc)
  } catch (err) {
    const code = (err as { code?: number })?.code
    // Firestore Admin SDK gRPC status 6 = ALREADY_EXISTS
    if (code === 6) throw new DuplicateRegistrationError()
    throw err
  }

  return id
}

export async function getRegistration(id: string): Promise<(FirestoreRegistration & { id: string }) | null> {
  const doc = await getDb().collection(COLLECTION).doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...(doc.data() as FirestoreRegistration) }
}

export async function listRegistrations(filters?: {
  eventId?: string
  paymentStatus?: PaymentStatus
}): Promise<(FirestoreRegistration & { id: string })[]> {
  let query: FirebaseFirestore.Query = getDb().collection(COLLECTION)
  if (filters?.eventId) query = query.where("eventId", "==", filters.eventId)
  if (filters?.paymentStatus) query = query.where("paymentStatus", "==", filters.paymentStatus)
  query = query.orderBy("createdAt", "desc")

  const snap = await query.get()
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreRegistration) }))
}

export async function setPaymentStatus(
  id: string,
  status: Exclude<PaymentStatus, "PENDING">,
  verifiedBy: string
): Promise<FirestoreRegistration & { id: string }> {
  const db = getDb()
  const ref = db.collection(COLLECTION).doc(id)
  const now = Timestamp.now()

  await ref.update({
    paymentStatus: status,
    paymentVerifiedBy: verifiedBy,
    paymentVerifiedAt: now,
    updatedAt: now,
  })

  const updated = await ref.get()
  return { id: updated.id, ...(updated.data() as FirestoreRegistration) }
}

export async function setSheetsSyncStatus(id: string, status: FirestoreRegistration["sheetsSyncStatus"]): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).update({ sheetsSyncStatus: status, updatedAt: Timestamp.now() })
}

export async function setEmailSent(id: string): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).update({ emailSentAt: Timestamp.now(), updatedAt: Timestamp.now() })
}
