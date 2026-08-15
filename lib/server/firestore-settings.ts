import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import type { SettingsDoc } from "@/types/firestore"

const DOC_PATH = ["settings", "global"] as const

function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
  )
}

const fallbackSettings: SettingsDoc = {
  upiVpa: process.env.UPI_VPA ?? "",
  sheetId: "",
  registrationOpen: true,
  updatedAt: Timestamp.now(),
  updatedBy: "env-fallback",
}

/** Falls back to process.env.UPI_VPA if Firestore isn't configured or the doc doesn't exist yet. */
export async function getSettings(): Promise<SettingsDoc> {
  if (!isAdminConfigured()) return fallbackSettings

  try {
    const doc = await getDb().collection(DOC_PATH[0]).doc(DOC_PATH[1]).get()
    if (!doc.exists) return fallbackSettings
    return doc.data() as SettingsDoc
  } catch (err) {
    console.error("[firestore-settings] getSettings failed, falling back to env:", err)
    return fallbackSettings
  }
}

export async function updateSettings(patch: Partial<SettingsDoc>, updatedBy: string): Promise<void> {
  await getDb()
    .collection(DOC_PATH[0])
    .doc(DOC_PATH[1])
    .set({ ...patch, updatedAt: Timestamp.now(), updatedBy }, { merge: true })
}
