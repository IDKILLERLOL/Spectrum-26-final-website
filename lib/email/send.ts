import "server-only"

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Real provider wiring is deferred (see plan §2.3) — with no provider configured,
 * this logs the full would-be email to the server console instead of sending,
 * so every trigger point stays testable locally. Swap the body of the `else`
 * branch for a real provider call once one is provisioned via the Vercel
 * Marketplace (`vercel integration discover --category messaging`).
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER

  if (!provider) {
    console.log("[email:console-fallback] ---- would-be email ----")
    console.log(`[email:console-fallback] To: ${message.to}`)
    console.log(`[email:console-fallback] Subject: ${message.subject}`)
    console.log(`[email:console-fallback] Body:\n${message.text}`)
    console.log("[email:console-fallback] -------------------------")
    return true
  }

  console.error(`[email] EMAIL_PROVIDER=${provider} is set but no provider integration is wired up yet.`)
  return false
}
