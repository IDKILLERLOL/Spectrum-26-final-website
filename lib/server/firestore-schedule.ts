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
    const snap = await getDb().collection(COLLECTION).orderBy("order", "asc").get()
    if (snap.empty) return staticSchedule
    return snap.docs.map((d) => toScheduleItem(d.data() as FirestoreScheduleItem))
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
  for (const key of Object.keys(update)) if (update[key] === undefined) delete update[key]

  await getDb().collection(COLLECTION).doc(id).update(update)
}

export async function deleteScheduleItem(id: string): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).delete()
}
