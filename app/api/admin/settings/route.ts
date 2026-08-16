import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/require-admin"
import { getSettings, updateSettings } from "@/lib/server/firestore-settings"
import type { SettingsDoc } from "@/types/firestore"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const settings = await getSettings()
  return NextResponse.json({ settings })
}

export async function PATCH(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const patch: Partial<Pick<SettingsDoc, "upiVpa" | "sheetId" | "registrationOpen" | "activeGmailSender">> = {}
  if (typeof body.upiVpa === "string") patch.upiVpa = body.upiVpa
  if (typeof body.sheetId === "string") patch.sheetId = body.sheetId
  if (typeof body.registrationOpen === "boolean") patch.registrationOpen = body.registrationOpen
  if (typeof body.activeGmailSender === "string") patch.activeGmailSender = body.activeGmailSender

  try {
    await updateSettings(patch, session.email)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[PATCH /api/admin/settings] unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
