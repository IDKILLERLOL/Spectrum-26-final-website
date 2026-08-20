import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import type { FirestoreEvent } from "@/types/firestore"
import type { SpectrumEvent } from "@/content/spectrum"
import { events as staticEvents } from "@/content/spectrum"

const COLLECTION = "events"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
  )
}

function toSpectrumEvent(id: string, doc: any): SpectrumEvent {
  const staticEv = staticEvents.find((e) => e.id === id)
  let endsAt = new Date()
  if (doc.registrationEndsAt) {
    if (typeof (doc.registrationEndsAt as any).toDate === "function") {
      endsAt = (doc.registrationEndsAt as any).toDate()
    } else if (doc.registrationEndsAt instanceof Date) {
      endsAt = doc.registrationEndsAt
    } else {
      endsAt = new Date(doc.registrationEndsAt as any)
    }
  }
  return {
    id,
    index: doc.index ?? "00",
    order: doc.order ?? 0,
    category: doc.category ?? "",
    name: doc.name,
    shortName: doc.shortName ?? doc.name,
    tag: doc.tag ?? "",
    format: doc.format ?? "",
    fee: doc.fee ?? `₹${doc.feeNumeric}`,
    feeNumeric: doc.feeNumeric ?? 0,
    capacity: doc.capacity ?? 0,
    teamSize: doc.teamSize ?? String(doc.capacity ?? 0),
    difficulty: doc.difficulty ?? 1,
    color: doc.color ?? "#f59e0b",
    duration: doc.duration ?? "",
    description: doc.description || staticEv?.description || "",
    rules: (() => {
      const base = (Array.isArray(doc.rules) && doc.rules.length > 0)
        ? doc.rules
        : (staticEv?.rules ?? [])
      return base.filter((r: string) => r !== "Only College Students Allowed")
    })(),
    prizes: (Array.isArray(doc.prizes) && doc.prizes.length > 0) ? doc.prizes : (staticEv?.prizes ?? []),
    rounds: doc.rounds ?? staticEv?.rounds ?? [],
    registrationEnds: endsAt.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    registrationEndsAt: endsAt.toISOString(),
    registrationOpen: doc.registrationOpen ?? true,
    prizePool: doc.prizePool,
    imageUrl: doc.imageUrl,
  }
}

/**
 * Reads events from Firestore, sorted by `order`. Falls back to the static
 * content/spectrum.ts array if the Admin SDK isn't configured yet (e.g. before
 * FIREBASE_CLIENT_EMAIL/PRIVATE_KEY are filled in) or the read otherwise fails —
 * this keeps the public site working throughout backend setup instead of 500ing.
 */
export async function getEvents(): Promise<SpectrumEvent[]> {
  if (!isAdminConfigured()) {
    console.warn("[getEvents] Firebase Admin SDK not configured. Returning static fallback.")
    return staticEvents
  }

  try {
    const snap = await getDb().collection(COLLECTION).get()
    
    // Create a map of database documents
    const dbEventsMap = new Map<string, any>()
    snap.docs.forEach((d) => {
      dbEventsMap.set(d.id, d.data())
    })

    const mergedEvents: SpectrumEvent[] = []
    
    // 1. Merge static default events (overwritten by DB changes if they exist, unless soft-deleted)
    for (const staticEv of staticEvents) {
      if (dbEventsMap.has(staticEv.id)) {
        const dbDoc = dbEventsMap.get(staticEv.id)
        if (!dbDoc.deleted) {
          mergedEvents.push(toSpectrumEvent(staticEv.id, dbDoc as FirestoreEvent))
        }
        dbEventsMap.delete(staticEv.id) // Remove to avoid duplicate processing
      } else {
        mergedEvents.push(staticEv)
      }
    }

    // 2. Add remaining custom events created via the database
    for (const [docId, dbDoc] of dbEventsMap.entries()) {
      if (!dbDoc.deleted) {
        mergedEvents.push(toSpectrumEvent(docId, dbDoc as FirestoreEvent))
      }
    }

    // 3. Sort by order ascending
    return mergedEvents.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (err) {
    console.error("[firestore-events] getEvents failed, returning static fallback:", err)
    return staticEvents
  }
}

export async function getEvent(id: string): Promise<SpectrumEvent | null> {
  const staticEv = staticEvents.find((e) => e.id === id)

  if (!isAdminConfigured()) {
    console.warn(`[getEvent] Firebase Admin SDK not configured for id ${id}. Returning static fallback if it exists.`)
    return staticEv || null
  }

  try {
    const doc = await getDb().collection(COLLECTION).doc(id).get()
    if (!doc.exists) {
      return staticEv || null
    }
    const data = doc.data()
    if (data?.deleted) {
      return null
    }
    return toSpectrumEvent(doc.id, data as FirestoreEvent)
  } catch (err) {
    console.error(`[firestore-events] getEvent failed for id ${id}:`, err)
    return staticEv || null
  }
}

export interface CreateEventInput {
  id?: string
  order?: number
  index?: string
  category?: string
  name: string
  shortName?: string
  tag?: string
  format?: string
  fee?: string
  feeNumeric: number
  capacity: number
  teamSize?: string
  difficulty?: 1 | 2 | 3 | 4 | 5
  color?: string
  duration?: string
  description?: string
  rules?: string[]
  prizes?: { place: string; reward: string }[]
  prizePool?: string
  registrationOpen?: boolean
  registrationEndsAt?: string // ISO
  imageUrl?: string | null
}

/** Admin write: doc ID is either an explicit `id`, or a slug derived from `name`. */
export async function createEvent(input: CreateEventInput): Promise<string> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const db = getDb()
  const id = input.id?.trim() || slugify(input.name)
  const now = Timestamp.now()

  const doc: FirestoreEvent & { prizePool?: string } = {
    id,
    order: input.order ?? 0,
    index: input.index ?? "00",
    category: input.category ?? "",
    name: input.name,
    shortName: input.shortName ?? input.name,
    tag: input.tag ?? "",
    format: input.format ?? "",
    fee: input.fee ?? `₹${input.feeNumeric}`,
    feeNumeric: input.feeNumeric,
    capacity: input.capacity,
    teamSize: input.teamSize ?? String(input.capacity),
    difficulty: input.difficulty ?? 1,
    color: input.color ?? "#f59e0b",
    duration: input.duration ?? "",
    description: input.description ?? "",
    rules: input.rules ?? [],
    prizes: input.prizes ?? [],
    prizePool: input.prizePool,
    registrationOpen: input.registrationOpen ?? true,
    registrationEndsAt: (() => {
      if (input.registrationEndsAt) {
        const d = new Date(input.registrationEndsAt)
        if (!isNaN(d.getTime())) return Timestamp.fromDate(d)
      }
      return Timestamp.fromDate(new Date())
    })(),
    imageUrl: input.imageUrl ?? null,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection(COLLECTION).doc(id).set(doc)
  return id
}

export async function updateEvent(id: string, patch: Partial<Omit<CreateEventInput, "id">>): Promise<void> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const { registrationEndsAt, ...rest } = patch
  const update: Record<string, unknown> = { ...rest, updatedAt: Timestamp.now() }
  delete update.id // Ensure we do not write document id as a normal field during updates
  if (registrationEndsAt) {
    const d = new Date(registrationEndsAt)
    if (!isNaN(d.getTime())) {
      update.registrationEndsAt = Timestamp.fromDate(d)
    }
  }
  for (const key of Object.keys(update)) if (update[key] === undefined) delete update[key]

  await getDb().collection(COLLECTION).doc(id).set(update, { merge: true })
}

export async function deleteEvent(id: string): Promise<void> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const isStatic = staticEvents.some((e) => e.id === id)
  if (isStatic) {
    // Write soft delete / tombstone document to Firestore so it does not fall back to static
    await getDb().collection(COLLECTION).doc(id).set({ id, deleted: true, updatedAt: Timestamp.now() })
  } else {
    // Custom events can be deleted completely
    await getDb().collection(COLLECTION).doc(id).delete()
  }
}
