import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listRegistrations } from "@/lib/server/firestore-registrations"
import type { PaymentStatus } from "@/types/firestore"

export async function GET(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get("eventId") ?? undefined
  const paymentStatusParam = searchParams.get("paymentStatus")
  const paymentStatus =
    paymentStatusParam && ["PENDING", "APPROVED", "REJECTED"].includes(paymentStatusParam)
      ? (paymentStatusParam as PaymentStatus)
      : undefined

  const registrations = await listRegistrations({ eventId, paymentStatus })
  return NextResponse.json({ registrations })
}
