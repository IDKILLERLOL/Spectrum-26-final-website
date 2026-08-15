import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { listUsers } from "@/lib/server/firestore-users"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const users = await listUsers()
  return NextResponse.json({ users })
}
