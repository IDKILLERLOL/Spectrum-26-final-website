import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listWhitelist, removeFromWhitelist } from "@/lib/server/firestore-admin-whitelist"

export async function DELETE(_request: Request, { params }: { params: Promise<{ email: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { email: identifier } = await params
  const decoded = decodeURIComponent(identifier).trim().toLowerCase()

  try {
    const current = await listWhitelist()
    if (current.length === 1) {
      return NextResponse.json(
        { error: "Can't remove the last remaining admin — that would lock everyone out." },
        { status: 400 }
      )
    }

    const db = (await import("@/lib/firebase/admin")).getDb()
    
    // 1. Try deleting directly by document ID
    const docById = await db.collection("adminWhitelist").doc(identifier).get()
    if (docById.exists) {
      await docById.ref.delete()
      return NextResponse.json({ ok: true })
    }

    // 2. Try deleting by hashed email
    if (decoded) {
      await removeFromWhitelist(decoded)
      return NextResponse.json({ ok: true })
    }

    // 3. Fallback: search collection for matching email or ID
    const snap = await db.collection("adminWhitelist").get()
    for (const doc of snap.docs) {
      const data = doc.data()
      if (doc.id === identifier || data.email === decoded || !data.email) {
        await doc.ref.delete()
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[DELETE /api/admin/whitelist/[email]] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
