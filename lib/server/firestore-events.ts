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

function toSpectrumEvent(id: string, doc: FirestoreEvent): SpectrumEvent {
  const endsAt = doc.registrationEndsAt.toDate()
  return {
    id,
    index: doc.index,
    order: doc.order,
    category: doc.category,
    name: doc.name,
    shortName: doc.shortName,
    tag: doc.tag,
    format: doc.format,
    fee: doc.fee,
    feeNumeric: doc.feeNumeric,
    capacity: doc.capacity,
    teamSize: doc.teamSize,
    difficulty: doc.difficulty,
    color: doc.color,
    duration: doc.duration,
    description: doc.description,
    rules: doc.rules,
    prizes: doc.prizes,
    registrationEnds: endsAt.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    registrationEndsAt: endsAt.toISOString(),
    registrationOpen: doc.registrationOpen,
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
  if (!isAdminConfigured()) return staticEvents

  try {
    const snap = await getDb().collection(COLLECTION).orderBy("order", "asc").get()
    if (snap.empty) return staticEvents
    return snap.docs.map((d) => toSpectrumEvent(d.id, d.data() as FirestoreEvent))
  } catch (err) {
    console.error("[firestore-events] getEvents failed, falling back to static data:", err)
    return staticEvents
  }
}

export async function getEvent(id: string): Promise<SpectrumEvent | null> {
  if (!isAdminConfigured()) return staticEvents.find((e) => e.id === id) ?? null

  try {
    const doc = await getDb().collection(COLLECTION).doc(id).get()
    if (!doc.exists) return staticEvents.find((e) => e.id === id) ?? null
    return toSpectrumEvent(doc.id, doc.data() as FirestoreEvent)
  } catch (err) {
    console.error("[firestore-events] getEvent failed, falling back to static data:", err)
    return staticEvents.find((e) => e.id === id) ?? null
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
    registrationEndsAt: Timestamp.fromDate(new Date(input.registrationEndsAt ?? Date.now())),
    imageUrl: input.imageUrl ?? null,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection(COLLECTION).doc(id).set(doc)
  return id
}

export async function updateEvent(id: string, patch: Partial<Omit<CreateEventInput, "id">>): Promise<void> {
  const { registrationEndsAt, ...rest } = patch
  const update: Record<string, unknown> = { ...rest, updatedAt: Timestamp.now() }
  if (registrationEndsAt) update.registrationEndsAt = Timestamp.fromDate(new Date(registrationEndsAt))
  for (const key of Object.keys(update)) if (update[key] === undefined) delete update[key]

  await getDb().collection(COLLECTION).doc(id).update(update)
}

export async function deleteEvent(id: string): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).delete()
}
