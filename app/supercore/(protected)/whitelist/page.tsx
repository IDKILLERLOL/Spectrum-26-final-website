import { listWhitelist } from "@/lib/server/firestore-admin-whitelist"
import { WhitelistAdminClient } from "./WhitelistAdminClient"

function serializeTimestamps(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj.toDate === "function") {
    return obj.toDate().toISOString()
  }
  if (typeof obj === "object" && "_seconds" in obj && "_nanoseconds" in obj) {
    return new Date(obj._seconds * 1000).toISOString()
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeTimestamps)
  }
  if (typeof obj === "object") {
    const serialized: any = {}
    for (const key of Object.keys(obj)) {
      serialized[key] = serializeTimestamps(obj[key])
    }
    return serialized
  }
  return obj
}

export default async function AdminWhitelistPage() {
  const rawWhitelist = await listWhitelist()
  const whitelist = rawWhitelist.map((entry) => {
    const serialized = serializeTimestamps(entry)
    return {
      ...serialized,
      addedAt: serialized.addedAt || new Date().toISOString(),
    }
  })
  return <WhitelistAdminClient whitelist={whitelist} />
}
