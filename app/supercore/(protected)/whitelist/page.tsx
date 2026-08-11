import { listWhitelist } from "@/lib/server/firestore-admin-whitelist"
import { WhitelistAdminClient } from "./WhitelistAdminClient"

export default async function AdminWhitelistPage() {
  const rawWhitelist = await listWhitelist()
  // Firestore Timestamps are class instances and can't cross the Server -> Client
  // Component boundary as props; convert to a plain ISO string first.
  const whitelist = rawWhitelist.map((entry) => ({ ...entry, addedAt: entry.addedAt.toDate().toISOString() }))
  return <WhitelistAdminClient whitelist={whitelist} />
}
