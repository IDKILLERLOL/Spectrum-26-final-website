import { getAdminSession } from "@/lib/auth/require-admin"
import { listRegistrations } from "@/lib/server/firestore-registrations"
import RegistrationsAdminClient from "./RegistrationsAdminClient"

export const dynamic = "force-dynamic"

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

export default async function AdminRegistrationsPage() {
  const session = await getAdminSession()
  
  // Fetch all registrations with events and team members already populated
  const rawRegistrations = await listRegistrations()
  const registrations = serializeTimestamps(rawRegistrations)

  return (
    <RegistrationsAdminClient 
      registrations={registrations}
      adminEmail={session?.email ?? ""}
    />
  )
}
