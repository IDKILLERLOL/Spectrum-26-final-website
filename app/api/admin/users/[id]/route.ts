import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { updateUser, deleteUser } from "@/lib/server/firestore-users"
import type { FirestoreUser } from "@/types/firestore"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  try {
    await updateUser(id, body as Partial<FirestoreUser>)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[PATCH /api/admin/users/[id]] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    await deleteUser(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[DELETE /api/admin/users/[id]] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
