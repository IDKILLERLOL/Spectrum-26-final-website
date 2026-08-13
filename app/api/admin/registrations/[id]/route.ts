import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { deleteRegistration, getRegistration } from "@/lib/server/firestore-registrations"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const existing = await getRegistration(id)
  if (!existing) return NextResponse.json({ error: "Registration not found." }, { status: 404 })

  await deleteRegistration(id)

  return NextResponse.json({ ok: true })
}
