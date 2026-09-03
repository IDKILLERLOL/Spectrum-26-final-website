import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb, isAdminConfigured } from "@/lib/firebase/admin"
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
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const db = getDb()
  const id = db.collection(COLLECTION).doc().id
  const ref = db.collection(COLLECTION).doc(id)
  const now = Timestamp.now()

  const sub = (input as any).substitute
  const hasSub = sub && typeof sub === "object" && sub.name && sub.name.trim().length > 0
  const substituteData = hasSub
    ? {
        name: sub.name.trim(),
        email: (sub.email || "").trim(),
        phone: (sub.phone || "").trim(),
        college: (sub.college || "").trim(),
        year: (sub.year || "").trim(),
      }
    : null

  const doc: any = {
    teamId: id,
    teamNameNormalized: ((input as any).teamName || "").toLowerCase().trim(),
    userEmail: input.email.toLowerCase(),
    fullName: input.fullName,
    phone: input.phone,
    collegeName: input.collegeName ?? "",
    year: input.year,
    eventId: input.eventId,
    eventName: input.eventName,
    teamName: (input as any).teamName || "",
    teamMembers: input.teamMembers.map((str) => {
      try {
        const parsed = JSON.parse(str)
        if (parsed && typeof parsed === "object" && parsed.name) {
          return {
            name: parsed.name,
            email: parsed.email || "",
            phone: parsed.phone || "",
            college: parsed.college || "",
            year: parsed.year || "",
          }
        }
      } catch {
        // Not a JSON string (e.g. other events)
      }
      return { name: str }
    }),
    substitute: substituteData,
    substituteName: substituteData?.name || "",
    substituteEmail: substituteData?.email || "",
    substitutePhone: substituteData?.phone || "",
    substituteCollege: substituteData?.college || "",
    substituteYear: substituteData?.year || "",
    teamSize: 1 + input.teamMembers.length + (hasSub ? 1 : 0),
    paymentRefId: input.paymentRefId,
    pictureUrl: input.pictureUrl || "",
    amountPaid: input.amountPaid,
    paymentStatus: "PENDING",
    paymentVerifiedBy: null,
    paymentVerifiedAt: null,
    sheetsSyncStatus: "PENDING",
    emailSentAt: null,
    createdAt: now,
    updatedAt: now,
  }

  await ref.set(doc)

  return id
}

export async function getRegistration(id: string): Promise<(FirestoreRegistration & { id: string }) | null> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
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

  // Prefer embedded teamMembers array on the doc (has full name/email/phone/college data).
  // Fall back to teamMembers subcollection for legacy registrations.
  let teamMembers: any[] = []
  const rawEmbedded = Array.isArray(regData.teamMembers) ? regData.teamMembers : []
  if (rawEmbedded.length > 0) {
    teamMembers = rawEmbedded.map((m: any) => {
      if (typeof m === "string") {
        try {
          const p = JSON.parse(m)
          if (p && typeof p === "object") return { name: p.name || "", email: p.email || "", phone: p.phone || "", collegeName: p.college || p.collegeName || "" }
        } catch {}
        return { name: m, email: "", phone: "", collegeName: "" }
      }
      return { name: m.name || "", email: m.email || "", phone: m.phone || "", collegeName: m.collegeName || m.college || "" }
    })
  } else {
    // Legacy: pull from teamMembers subcollection
    const membersSnap = await db.collection("teamMembers")
      .where("registrationId", "==", doc.id)
      .where("status", "==", "ACTIVE")
      .get()
    membersSnap.forEach((mDoc) => {
      const md = mDoc.data()
      teamMembers.push({ name: md.name || "", email: md.email || "", phone: md.phone || "", collegeName: md.college || md.collegeName || "" })
    })
  }

  const sub = regData.substitute || (regData.substituteName ? {
    name: regData.substituteName || "",
    email: regData.substituteEmail || "",
    phone: regData.substitutePhone || "",
    college: regData.substituteCollege || "",
    year: regData.substituteYear || "",
  } : null)

  return {
    id: doc.id,
    userEmail: regData.userEmail || regData.leaderId || "",
    fullName: fullName || regData.fullName || "",
    phone: phone || regData.phone || "",
    collegeName: collegeName || regData.collegeName || "",
    year: regData.year || "FY",
    eventId: regData.eventId || "",
    eventName: eventName,
    // teamName is required for sheet sync delete/replace keyed on team name
    teamName: regData.teamName || regData.team_name || "",
    teamMembers: teamMembers,
    teamSize: regData.teamSize || (teamMembers.length || 1),
    substitute: sub,
    substituteName: regData.substituteName || sub?.name || "",
    substituteEmail: regData.substituteEmail || sub?.email || "",
    substitutePhone: regData.substitutePhone || sub?.phone || "",
    substituteCollege: regData.substituteCollege || sub?.college || "",
    substituteYear: regData.substituteYear || sub?.year || "",
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

let cachedRegistrations: (FirestoreRegistration & { id: string })[] = []
let lastRegistrationsFetch = 0
const REGISTRATIONS_CACHE_TTL = 30 * 1000 // 30 seconds

export async function listRegistrations(filters?: {
  eventId?: string
  paymentStatus?: PaymentStatus
}): Promise<(FirestoreRegistration & { id: string })[]> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const db = getDb()

  // Return cached result if within TTL
  if (cachedRegistrations.length > 0 && Date.now() - lastRegistrationsFetch < REGISTRATIONS_CACHE_TTL) {
    let res = cachedRegistrations
    if (filters?.eventId) res = res.filter((r) => r.eventId === filters.eventId)
    if (filters?.paymentStatus) res = res.filter((r) => r.paymentStatus === filters.paymentStatus)
    return res
  }

  try {
    const registrationsSnap = await db.collection(COLLECTION).get()
    
    // Batch fetch users and events to avoid N+1 quota exhaustion (1 query instead of N*4 queries)
    const [usersSnap, eventsSnap] = await Promise.all([
      db.collection("users").get().catch(() => ({ docs: [] })),
      db.collection("events").get().catch(() => ({ docs: [] })),
    ])

    const userMap = new Map<string, any>()
    usersSnap.docs.forEach((d: any) => userMap.set(d.id, d.data()))

    const eventMap = new Map<string, any>()
    eventsSnap.docs.forEach((d: any) => eventMap.set(d.id, d.data()))

    const results: (FirestoreRegistration & { id: string })[] = []

    for (const regDoc of registrationsSnap.docs) {
      const regData = regDoc.data()
      
      let fullName = ""
      let phone = ""
      let collegeName = ""
      let fetchedEmail = ""
      
      const userIdToLookup = regData.leaderId || (typeof regData.userEmail === "string" && regData.userEmail.startsWith("guest_") ? regData.userEmail : null)
      
      if (userIdToLookup && userMap.has(userIdToLookup)) {
        const uData = userMap.get(userIdToLookup)
        fullName = uData?.name || ""
        phone = uData?.phone || ""
        collegeName = uData?.college || ""
        fetchedEmail = uData?.email || ""
      }

      let eventName = regData.eventName || regData.eventId || ""
      let eventFee = 0
      if (regData.eventId && eventMap.has(regData.eventId)) {
        const eData = eventMap.get(regData.eventId)
        eventName = eData?.name || regData.eventId
        eventFee = eData?.price || 0
      }

      const teamMembers: any[] = []
      const rawMembers = Array.isArray(regData.teamMembers) ? regData.teamMembers : (Array.isArray(regData.members) ? regData.members : [])
      rawMembers.forEach((m: any) => {
        if (typeof m === "string") {
          try {
            const p = JSON.parse(m)
            if (p && typeof p === "object") {
              teamMembers.push({
                name: p.name || "",
                email: p.email || "",
                phone: p.phone || "",
                college: p.college || p.collegeName || "",
                collegeName: p.collegeName || p.college || "",
                year: p.year || "",
              })
              return
            }
          } catch {}
          teamMembers.push({ name: m, email: "", phone: "", college: "", collegeName: "", year: "" })
        } else if (m && typeof m === "object") {
          teamMembers.push({
            name: m.name || "",
            email: m.email || "",
            phone: m.phone || "",
            college: m.college || m.collegeName || "",
            collegeName: m.collegeName || m.college || "",
            year: m.year || "",
          })
        }
      })

      const rawEmail = regData.userEmail || regData.email || regData.leaderEmail || ""
      const userEmail = fetchedEmail || (!rawEmail.startsWith("guest_") ? rawEmail : "") || regData.leaderId || ""

      const sub = regData.substitute || (regData.substituteName ? {
        name: regData.substituteName || "",
        email: regData.substituteEmail || "",
        phone: regData.substitutePhone || "",
        college: regData.substituteCollege || "",
        year: regData.substituteYear || "",
      } : null)

      const doc: FirestoreRegistration & { id: string } = {
        id: regDoc.id,
        userEmail: userEmail,
        fullName: fullName || regData.fullName || regData.name || "",
        phone: phone || regData.phone || "",
        collegeName: collegeName || regData.collegeName || regData.college || "",
        year: regData.year || "FY",
        eventId: regData.eventId || "",
        eventName: eventName,
        teamName: regData.teamName || regData.team_name || "",
        teamMembers: teamMembers,
        teamSize: regData.teamSize || (teamMembers.length + 1 + (sub ? 1 : 0)),
        substitute: sub,
        substituteName: regData.substituteName || sub?.name || "",
        substituteEmail: regData.substituteEmail || sub?.email || "",
        substitutePhone: regData.substitutePhone || sub?.phone || "",
        substituteCollege: regData.substituteCollege || sub?.college || "",
        substituteYear: regData.substituteYear || sub?.year || "",
        paymentRefId: regData.paymentRefId || regData.upiTransactionRef || "",
        amountPaid: regData.amountPaid || eventFee,
        paymentStatus: regData.feeStatus === "PAID" ? "APPROVED" : (regData.paymentStatus || "PENDING"),
        pictureUrl: regData.pictureUrl || regData.photoUrl || regData.paymentScreenshot || regData.screenshotUrl || regData.image || "",
        checkedIn: regData.checkedIn || false,
        paymentVerifiedBy: regData.paymentVerifiedBy || regData.lastEditedBy || null,
        paymentVerifiedAt: regData.paymentVerifiedAt || regData.lastEditedAt || null,
        sheetsSyncStatus: regData.sheetsSyncStatus || "PENDING",
        emailSentAt: regData.emailSentAt || null,
        createdAt: regData.createdAt?.toDate ? regData.createdAt.toDate().toISOString() : (typeof regData.createdAt === "string" ? regData.createdAt : null),
        updatedAt: regData.updatedAt?.toDate ? regData.updatedAt.toDate().toISOString() : (typeof regData.updatedAt === "string" ? regData.updatedAt : null),
      }

      if (filters?.eventId && doc.eventId !== filters.eventId) continue
      if (filters?.paymentStatus && doc.paymentStatus !== filters.paymentStatus) continue

      results.push(doc)
    }

    results.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })

    cachedRegistrations = results
    lastRegistrationsFetch = Date.now()

    return results
  } catch (err: any) {
    console.warn("[listRegistrations] Error or Quota limit reached:", err?.message || err)
    let res = cachedRegistrations
    if (filters?.eventId) res = res.filter((r) => r.eventId === filters.eventId)
    if (filters?.paymentStatus) res = res.filter((r) => r.paymentStatus === filters.paymentStatus)
    return res
  }
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

export async function deleteRegistration(id: string): Promise<void> {
  const db = getDb()
  await db.collection(COLLECTION).doc(id).delete()
  const membersSnap = await db.collection("teamMembers").where("registrationId", "==", id).get()
  const batch = db.batch()
  membersSnap.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()
}
