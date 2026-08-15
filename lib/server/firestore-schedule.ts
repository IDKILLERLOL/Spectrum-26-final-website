import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import type { FirestoreScheduleItem } from "@/types/firestore"
import type { ScheduleItem } from "@/content/spectrum"
import { schedule as staticSchedule } from "@/content/spectrum"

const COLLECTION = "schedule"

function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
  )
}

function toScheduleItem(doc: FirestoreScheduleItem): ScheduleItem {
  return { date: doc.date, order: doc.order, time: doc.time, title: doc.title, description: doc.description }
}

/** Falls back to static content/spectrum.ts data if the Admin SDK isn't configured or the read fails. */
export async function getSchedule(): Promise<ScheduleItem[]> {
  if (!isAdminConfigured()) return staticSchedule

  try {
    const snap = await getDb().collection(COLLECTION).get()
    
    const dbScheduleMap = new Map<string, any>()
    snap.docs.forEach((d) => {
      dbScheduleMap.set(d.id, d.data())
    })

    const mergedSchedule: ScheduleItem[] = []
    
    // 1. Merge static defaults
    for (const staticItem of staticSchedule) {
      const staticId = `${staticItem.date}-${staticItem.order}`
      if (dbScheduleMap.has(staticId)) {
        const dbDoc = dbScheduleMap.get(staticId)
        if (!dbDoc.deleted) {
          mergedSchedule.push(toScheduleItem(dbDoc as FirestoreScheduleItem))
        }
        dbScheduleMap.delete(staticId)
      } else {
        mergedSchedule.push(staticItem)
      }
    }

    // 2. Add remaining custom schedule items
    for (const dbDoc of dbScheduleMap.values()) {
      if (!dbDoc.deleted) {
        mergedSchedule.push(toScheduleItem(dbDoc as FirestoreScheduleItem))
      }
    }

    // 3. Sort by order
    return mergedSchedule.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (err) {
    console.error("[firestore-schedule] getSchedule failed, falling back to static data:", err)
    return staticSchedule
  }
}

export interface CreateScheduleItemInput {
  date: string
  order: number
  time: string
  title: string
  description?: string
}

/** Admin write: doc ID is `${date}-${order}`, matching scripts/seed.ts's convention. */
export async function createScheduleItem(input: CreateScheduleItemInput): Promise<string> {
  const db = getDb()
  const id = `${input.date}-${input.order}`
  const now = Timestamp.now()

  const doc: FirestoreScheduleItem = {
    date: input.date,
    order: input.order,
    time: input.time,
    title: input.title,
    description: input.description ?? "",
    createdAt: now,
    updatedAt: now,
  }

  await db.collection(COLLECTION).doc(id).set(doc)
  return id
}

export async function updateScheduleItem(id: string, patch: Partial<CreateScheduleItemInput>): Promise<void> {
  const update: Record<string, unknown> = { ...patch, updatedAt: Timestamp.now() }
  delete (update as any).id
  for (const key of Object.keys(update)) if (update[key] === undefined) delete update[key]

  await getDb().collection(COLLECTION).doc(id).set(update, { merge: true })
}

export async function deleteScheduleItem(id: string): Promise<void> {
  const isStatic = staticSchedule.some((item) => `${item.date}-${item.order}` === id)
  if (isStatic) {
    await getDb().collection(COLLECTION).doc(id).set({ deleted: true, updatedAt: Timestamp.now() })
  } else {
    await getDb().collection(COLLECTION).doc(id).delete()
  }
}
