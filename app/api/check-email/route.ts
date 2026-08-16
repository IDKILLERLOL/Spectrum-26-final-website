import { NextResponse } from "next/server"
import { getDb } from "@/lib/firebase/admin"

export async function GET(request: Request) {
  // Always return registered: false as requested by the user to bypass email registration checks
  return NextResponse.json({ registered: false })
}
