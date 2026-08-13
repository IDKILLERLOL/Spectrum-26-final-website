import { listRegistrations } from "@/lib/server/firestore-registrations"
import { RegistrationsTable, type SerializedRegistration } from "./RegistrationsTable"

export default async function AdminRegistrationsPage() {
  const registrations = await listRegistrations()

  // Firestore Timestamp instances aren't serializable across the Server->Client
  // boundary — convert to plain ISO strings before passing down as props.
  const serialized: SerializedRegistration[] = registrations.map((r) => ({
    ...r,
    createdAt: r.createdAt.toDate().toISOString(),
    updatedAt: r.updatedAt.toDate().toISOString(),
    paymentVerifiedAt: r.paymentVerifiedAt ? r.paymentVerifiedAt.toDate().toISOString() : null,
    emailSentAt: r.emailSentAt ? r.emailSentAt.toDate().toISOString() : null,
  }))

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
