import { listUsers } from "@/lib/server/firestore-users"
import { UsersAdminClient } from "./UsersAdminClient"

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

export default async function AdminUsersPage() {
  const rawUsers = await listUsers()
  
  const users = rawUsers.map((u) => {
    const serialized = serializeTimestamps(u)
    return {
      ...serialized,
      createdAt: serialized.createdAt || new Date().toISOString(),
      updatedAt: serialized.updatedAt || null,
    }
  })

  return <UsersAdminClient users={users} />
}
