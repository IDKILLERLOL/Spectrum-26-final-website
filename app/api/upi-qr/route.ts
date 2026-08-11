import { NextResponse } from "next/server"
import { generateUpiQr } from "@/lib/qr/upi-qr"
import { getSettings } from "@/lib/server/firestore-settings"
import { site } from "@/content/spectrum"

/** GET /api/upi-qr?amount=150 — generates a QR sized to the exact event fee. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const amount = Number(searchParams.get("amount"))

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "VALIDATION", message: "Invalid amount." }, { status: 400 })
  }

  const settings = await getSettings()
  if (!settings.upiVpa) {
    return NextResponse.json({ error: "VALIDATION", message: "UPI VPA not configured." }, { status: 500 })
  }

  const qrDataUrl = await generateUpiQr(settings.upiVpa, amount, site.shortName, "Spectrum 5.0 Registration")
  return NextResponse.json({ qrDataUrl })
}
