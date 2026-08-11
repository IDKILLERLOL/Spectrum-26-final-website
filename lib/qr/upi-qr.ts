import "server-only"
import QRCode from "qrcode"

/**
 * Server-generates a scannable UPI deep-link QR as a data URL. Amount/VPA baked
 * in per-call so it's always correct for the specific event's fee — no manual
 * re-export when the VPA or a fee changes.
 */
export async function generateUpiQr(vpa: string, amount: number, payeeName: string, note: string): Promise<string> {
  const upiUrl = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  return QRCode.toDataURL(upiUrl, { margin: 1, width: 320, color: { dark: "#1A1A1A", light: "#F4EBD9" } })
}
