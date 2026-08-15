import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { deleteSponsor } from "@/lib/server/firestore-sponsors"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    await deleteSponsor(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[DELETE /api/admin/sponsors/[id]]", err)
    return NextResponse.json({ error: "Failed to delete sponsor" }, { status: 500 })
  }
}
