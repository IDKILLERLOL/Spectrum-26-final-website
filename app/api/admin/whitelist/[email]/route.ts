import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listWhitelist, removeFromWhitelist } from "@/lib/server/firestore-admin-whitelist"

export async function DELETE(_request: Request, { params }: { params: Promise<{ email: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { email } = await params
  const target = decodeURIComponent(email).trim().toLowerCase()

  try {
    // Prevent locking everyone out by removing the only remaining whitelisted admin.
    const current = await listWhitelist()
    if (current.length === 1 && current[0].email.toLowerCase() === target) {
      return NextResponse.json(
        { error: "Can't remove the last remaining admin — that would lock everyone out." },
        { status: 400 }
      )
    }

    await removeFromWhitelist(target)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[DELETE /api/admin/whitelist/[email]] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
