import { getSettings } from "@/lib/server/firestore-settings"
import { SettingsAdminClient } from "./SettingsAdminClient"

export default async function AdminSettingsPage() {
  const raw = await getSettings()
  // Firestore Timestamps are class instances and can't cross the Server -> Client
  // Component boundary as props; convert to a plain ISO string first.
  const settings = { ...raw, updatedAt: raw.updatedAt.toDate().toISOString() }
  return <SettingsAdminClient settings={settings} />
}
