import { listRegistrations } from "@/lib/server/firestore-registrations"
import { RegistrationsTable, type SerializedRegistration } from "./RegistrationsTable"

function serializeTimestamps(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (obj && typeof obj.toDate === "function") {
    return obj.toDate().toISOString()
  }
  if (obj && typeof obj === "object" && "_seconds" in obj && "_nanoseconds" in obj) {
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
  const registrations = await listRegistrations()

  // Firestore Timestamp instances aren't serializable across the Server->Client
  // boundary — convert to plain ISO strings before passing down as props.
  const serialized: SerializedRegistration[] = registrations.map((r) => {
    const clean = serializeTimestamps(r)
    return {
      ...clean,
      createdAt: clean.createdAt || new Date().toISOString(),
      updatedAt: clean.updatedAt || null,
      paymentVerifiedAt: clean.paymentVerifiedAt || null,
      emailSentAt: clean.emailSentAt || null,
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Registrations</h1>
      <p className="text-sm text-neutral-400">
        Verify each 12-digit UPI reference against your bank statement, then approve or reject.
      </p>
      <RegistrationsTable initialRegistrations={serialized} />
    </div>
  )
}
