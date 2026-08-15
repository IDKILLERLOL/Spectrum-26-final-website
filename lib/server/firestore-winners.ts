import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import type { FirestoreWinner } from "@/types/firestore"
import type { EventWinners, WinnerEntry } from "@/content/spectrum"
import { currentEditionWinners as staticWinners, site } from "@/content/spectrum"

const COLLECTION = "winners"

function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
  )
}

const PLACE_ORDER: Record<WinnerEntry["place"], number> = { "1st": 0, "2nd": 1, "3rd": 2 }

/**
 * Winners are stored as flat per-place docs in Firestore; grouped here by eventId
 * to match the existing EventWinners[] shape the public pages already render.
 * Falls back to static content/spectrum.ts data if unconfigured or the read fails.
 */
export async function getCurrentEditionWinners(): Promise<EventWinners[]> {
  if (!isAdminConfigured()) return staticWinners

  try {
    const snap = await getDb().collection(COLLECTION).where("edition", "==", site.name).get()
    if (snap.empty) return staticWinners

    const byEvent = new Map<string, EventWinners>()
    for (const doc of snap.docs) {
      const w = doc.data() as FirestoreWinner
      const entry = byEvent.get(w.eventId) ?? { eventId: w.eventId, winners: [] as any[] }
      entry.winners.push({ place: w.place, teamName: w.teamName })
      byEvent.set(w.eventId, entry)
    }
    for (const entry of byEvent.values()) {
      entry.winners.sort((a, b) => PLACE_ORDER[a.place] - PLACE_ORDER[b.place])
    }
    return Array.from(byEvent.values())
  } catch (err) {
    console.error("[firestore-winners] getCurrentEditionWinners failed, falling back to static data:", err)
    return staticWinners
  }
}

/** Ungrouped, for the admin table — every winner doc with its real Firestore doc ID attached. */
export async function listAllWinners(): Promise<(FirestoreWinner & { id: string })[]> {
  try {
    const snap = await getDb().collection(COLLECTION).orderBy("createdAt", "desc").get()
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreWinner) }))
  } catch (err) {
    console.warn("[listAllWinners] Error or Quota limit reached:", err)
    return []
  }
}

export interface CreateWinnerInput {
  eventId: string
  eventName: string
  place: "1st" | "2nd" | "3rd"
  teamName: string
  members?: string[]
  edition: string
  createdBy: string
}

export async function createWinner(input: CreateWinnerInput): Promise<string> {
  const db = getDb()
  const now = Timestamp.now()

  const doc: FirestoreWinner = {
    eventId: input.eventId,
    eventName: input.eventName,
    place: input.place,
    teamName: input.teamName,
    members: input.members ?? [],
    edition: input.edition,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  }

  const ref = await db.collection(COLLECTION).add(doc)
  return ref.id
}

export async function updateWinner(id: string, patch: Partial<Omit<CreateWinnerInput, "createdBy">>): Promise<void> {
  const update: Record<string, unknown> = { ...patch, updatedAt: Timestamp.now() }
  for (const key of Object.keys(update)) if (update[key] === undefined) delete update[key]

  await getDb().collection(COLLECTION).doc(id).update(update)
}

export async function deleteWinner(id: string): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).delete()
}
