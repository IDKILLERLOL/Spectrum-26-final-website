import { getSettings } from "@/lib/server/firestore-settings"
import { SettingsAdminClient } from "./SettingsAdminClient"

export default async function AdminSettingsPage() {
  const raw = await getSettings()
  // Firestore Timestamps are class instances and can't cross the Server -> Client
  // Component boundary as props; convert to a plain ISO string first.
  const settings = {
    ...raw,
    updatedAt: raw.updatedAt ? (typeof raw.updatedAt.toDate === "function" ? raw.updatedAt.toDate().toISOString() : new Date(raw.updatedAt).toISOString()) : new Date().toISOString()
  }
  return <SettingsAdminClient settings={settings} />
}
