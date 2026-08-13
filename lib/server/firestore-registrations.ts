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
  const db = getDb()
  const doc = await db.collection(COLLECTION).doc(id).get()
  if (!doc.exists) return null

  const regData = doc.data()!

  // Resolve leader user info
  let fullName = ""
  let phone = ""
  let collegeName = ""
  if (regData.leaderId) {
    const userDoc = await db.collection("users").doc(regData.leaderId).get()
    if (userDoc.exists) {
      fullName = userDoc.data()?.name || ""
      phone = userDoc.data()?.phone || ""
      collegeName = userDoc.data()?.college || ""
    }
  }

  // Resolve event details
  let eventName = regData.eventId || ""
  let eventFee = 0
  if (regData.eventId) {
    const eventDoc = await db.collection("events").doc(regData.eventId).get()
    if (eventDoc.exists) {
      eventName = eventDoc.data()?.name || regData.eventId
      eventFee = eventDoc.data()?.price || 0
    }
  }

  // Resolve team members
  const membersSnap = await db.collection("teamMembers")
    .where("registrationId", "==", doc.id)
    .where("status", "==", "ACTIVE")
    .get()

  const teamMembers: { name: string }[] = []
  membersSnap.forEach((mDoc) => {
    teamMembers.push({ name: mDoc.data().name || "" })
  })

  return {
    id: doc.id,
    userEmail: regData.userEmail || regData.leaderId || "",
    fullName: fullName || regData.fullName || "",
    phone: phone || regData.phone || "",
    collegeName: collegeName || regData.collegeName || "",
    year: regData.year || "FY",
    eventId: regData.eventId || "",
    eventName: eventName,
    teamMembers: teamMembers,
    teamSize: regData.teamSize || (teamMembers.length || 1),
    paymentRefId: regData.upiTransactionRef || regData.paymentRefId || "",
    amountPaid: regData.amountPaid || eventFee,
    paymentStatus: regData.feeStatus === "PAID" ? "APPROVED" : (regData.paymentStatus || "PENDING"),
    checkedIn: regData.checkedIn || false,
    paymentVerifiedBy: regData.paymentVerifiedBy || regData.lastEditedBy || null,
    paymentVerifiedAt: regData.paymentVerifiedAt || regData.lastEditedAt || null,
    sheetsSyncStatus: regData.sheetsSyncStatus || "PENDING",
    emailSentAt: regData.emailSentAt || null,
    createdAt: regData.createdAt || null,
    updatedAt: regData.updatedAt || regData.lastEditedAt || null,
  }
}

export async function listRegistrations(filters?: {
  eventId?: string
  paymentStatus?: PaymentStatus
}): Promise<(FirestoreRegistration & { id: string })[]> {
  const db = getDb()
  const registrationsSnap = await db.collection(COLLECTION).get()
  
  const results: (FirestoreRegistration & { id: string })[] = []

  for (const regDoc of registrationsSnap.docs) {
    const regData = regDoc.data()
    
    // Resolve leader user info
    let fullName = ""
    let phone = ""
    let collegeName = ""
    let fetchedEmail = ""
    
    const userIdToLookup = regData.leaderId || (typeof regData.userEmail === "string" && regData.userEmail.startsWith("guest_") ? regData.userEmail : null)
    
    if (userIdToLookup) {
      const userDoc = await db.collection("users").doc(userIdToLookup).get()
      if (userDoc.exists) {
        const uData = userDoc.data()
        fullName = uData?.name || ""
        phone = uData?.phone || ""
        collegeName = uData?.college || ""
        fetchedEmail = uData?.email || ""
      }
    }

    // Resolve event details
    let eventName = regData.eventId || ""
    let eventFee = 0
    if (regData.eventId) {
      const eventDoc = await db.collection("events").doc(regData.eventId).get()
      if (eventDoc.exists) {
        eventName = eventDoc.data()?.name || regData.eventId
        eventFee = eventDoc.data()?.price || 0
      }
    }

    // Resolve team members
    const membersSnap = await db.collection("teamMembers")
      .where("registrationId", "==", regDoc.id)
      .where("status", "==", "ACTIVE")
      .get()
    
    const teamMembers: { name: string }[] = []
    membersSnap.forEach((mDoc) => {
      teamMembers.push({ name: mDoc.data().name || "" })
    })

    if (teamMembers.length === 0 && Array.isArray(regData.teamMembers)) {
      regData.teamMembers.forEach((m: any) => {
        const memberName = typeof m === "string" ? m : (m?.name || "")
        if (memberName) teamMembers.push({ name: memberName })
      })
    } else if (teamMembers.length === 0 && Array.isArray(regData.members)) {
      regData.members.forEach((m: any) => {
        const memberName = typeof m === "string" ? m : (m?.name || "")
        if (memberName) teamMembers.push({ name: memberName })
      })
    }

    const rawEmail = regData.userEmail || regData.email || regData.leaderEmail || ""
    const userEmail = fetchedEmail || (!rawEmail.startsWith("guest_") ? rawEmail : "") || regData.leaderId || ""

    // Construct unified new schema item dynamically
    const doc: FirestoreRegistration & { id: string } = {
      id: regDoc.id,
      userEmail: userEmail,
      fullName: fullName || regData.fullName || regData.name || "",
      phone: phone || regData.phone || "",
      collegeName: collegeName || regData.collegeName || regData.college || "",
      year: regData.year || "FY",
      eventId: regData.eventId || "",
      eventName: eventName,
      teamMembers: teamMembers,
      teamSize: teamMembers.length || 1,
      paymentRefId: regData.upiTransactionRef || "",
      amountPaid: regData.amountPaid || eventFee,
      paymentStatus: regData.feeStatus === "PAID" ? "APPROVED" : (regData.paymentStatus || "PENDING"),
      pictureUrl: regData.pictureUrl || regData.photoUrl || "",
      checkedIn: regData.checkedIn || false,
      paymentVerifiedBy: regData.paymentVerifiedBy || regData.lastEditedBy || null,
      paymentVerifiedAt: regData.paymentVerifiedAt || regData.lastEditedAt || null,
      sheetsSyncStatus: regData.sheetsSyncStatus || "PENDING",
      emailSentAt: regData.emailSentAt || null,
      createdAt: regData.createdAt || null,
      updatedAt: regData.updatedAt || regData.lastEditedAt || null,
    }

    // Filter by options if supplied
    if (filters?.eventId && doc.eventId !== filters.eventId) continue
    if (filters?.paymentStatus && doc.paymentStatus !== filters.paymentStatus) continue

    results.push(doc)
  }

  // Sort descending by creation date
  results.sort((a, b) => {
    const aTime = a.createdAt ? (typeof a.createdAt.toDate === "function" ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0
    const bTime = b.createdAt ? (typeof b.createdAt.toDate === "function" ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0
    return bTime - aTime
  })

  return results
}

export async function setPaymentStatus(
  id: string,
  status: PaymentStatus,
  verifiedBy: string
): Promise<FirestoreRegistration & { id: string }> {
  const db = getDb()
  const ref = db.collection(COLLECTION).doc(id)
  const now = Timestamp.now()

  const updateData: any = {
    paymentStatus: status,
    feeStatus: status === "APPROVED" ? "PAID" : "PENDING",
    updatedAt: now,
  }

  if (status === "PENDING") {
    updateData.paymentVerifiedBy = null
    updateData.paymentVerifiedAt = null
  } else {
    updateData.paymentVerifiedBy = verifiedBy
    updateData.paymentVerifiedAt = now
  }

  await ref.update(updateData)

  const updated = await ref.get()
  return { id: updated.id, ...(updated.data() as FirestoreRegistration) }
}

export async function toggleCheckIn(id: string, checkedIn: boolean): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).update({
    checkedIn,
    updatedAt: Timestamp.now(),
  })
}

export async function setSheetsSyncStatus(id: string, status: FirestoreRegistration["sheetsSyncStatus"]): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).update({ sheetsSyncStatus: status, updatedAt: Timestamp.now() })
}

export async function setEmailSent(id: string): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).update({ emailSentAt: Timestamp.now(), updatedAt: Timestamp.now() })
}
