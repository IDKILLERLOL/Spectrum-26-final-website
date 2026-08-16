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
    
    // Create a map keyed by `${eventId}-${place}`
    const dbWinnersMap = new Map<string, string>() // maps eventId-place to teamName
    snap.docs.forEach((doc) => {
      const data = doc.data()
      if (!data.deleted) {
        dbWinnersMap.set(`${data.eventId}-${data.place}`, data.teamName)
      } else {
        dbWinnersMap.set(`${data.eventId}-${data.place}`, "__DELETED__")
      }
    })

    const mergedWinnersMap = new Map<string, EventWinners>()

    // 1. Merge static default winners
    for (const staticEventWins of staticWinners) {
      const eventId = staticEventWins.eventId
      const winnersList: WinnerEntry[] = []
      
      for (const w of staticEventWins.winners) {
        const key = `${eventId}-${w.place}`
        if (dbWinnersMap.has(key)) {
          const dbTeamName = dbWinnersMap.get(key)!
          if (dbTeamName !== "__DELETED__") {
            winnersList.push({ place: w.place, teamName: dbTeamName })
          }
          dbWinnersMap.delete(key) // Handled
        } else {
          winnersList.push(w)
        }
      }
      
      if (winnersList.length > 0) {
        mergedWinnersMap.set(eventId, { eventId, winners: winnersList })
      }
    }

    // 2. Add remaining custom winners from DB
    for (const [key, teamName] of dbWinnersMap.entries()) {
      if (teamName === "__DELETED__") continue
      const [eventId, place] = key.split("-")
      const entry = mergedWinnersMap.get(eventId) ?? { eventId, winners: [] }
      entry.winners.push({ place: place as any, teamName })
      mergedWinnersMap.set(eventId, entry)
    }

    // 3. Sort winners inside each event
    for (const entry of mergedWinnersMap.values()) {
      entry.winners.sort((a, b) => (PLACE_ORDER[a.place] ?? 9) - (PLACE_ORDER[b.place] ?? 9))
    }

    return Array.from(mergedWinnersMap.values())
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
  delete (update as any).id
  for (const key of Object.keys(update)) if (update[key] === undefined) delete update[key]

  await getDb().collection(COLLECTION).doc(id).set(update, { merge: true })
}

export async function deleteWinner(id: string): Promise<void> {
  // If it's a static winner (contains a hyphen in generated ID format), we can write a tombstone
  const snap = await getDb().collection(COLLECTION).doc(id).get()
  if (snap.exists) {
    const data = snap.data()
    if (data) {
      const isStatic = staticWinners.some((sw) => sw.eventId === data.eventId && sw.winners.some((w) => w.place === data.place))
      if (isStatic) {
        await getDb().collection(COLLECTION).doc(id).set({ ...data, deleted: true, updatedAt: Timestamp.now() })
        return
      }
    }
  }
  await getDb().collection(COLLECTION).doc(id).delete()
}
