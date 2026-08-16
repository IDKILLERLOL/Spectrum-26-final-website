import "server-only"
import { site } from "@/content/spectrum"
import type { EmailMessage } from "./send"

interface RegistrationReceivedInput {
  to: string
  fullName: string
  eventName: string
  teamSize: number
  amountPaid: number
  paymentRefId: string
}

export function registrationReceivedEmail(input: RegistrationReceivedInput): EmailMessage {
  const text = `Hi ${input.fullName},

We've received your registration for ${input.eventName} at ${site.name}.

Team size: ${input.teamSize}
Amount paid: ₹${input.amountPaid}
Payment reference: ${input.paymentRefId}

Your registration is confirmed.

${site.venue} - ${site.date}

See you there!
Team ${site.name}`

  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2>Registration confirmed!</h2>
  <p>Hi ${input.fullName},</p>
  <p>Your registration for <strong>${input.eventName}</strong> at ${site.name} has been verified and confirmed.</p>
  <ul>
    <li>Team size: ${input.teamSize}</li>
    <li>Amount paid: ₹${input.amountPaid}</li>
    <li>Payment reference: ${input.paymentRefId}</li>
  </ul>
  <p>Your registration is confirmed. We look forward to seeing you at the event!</p>
  <p>${site.venue} - ${site.date}</p>
  <p>See you there!<br/>Team ${site.name}</p>
</div>`

  return { to: input.to, subject: `Registration confirmed - ${input.eventName}`, html, text }
}

interface PaymentStatusInput {
  to: string
  fullName: string
  eventName: string
  status: "APPROVED" | "REJECTED"
}

export function paymentStatusEmail(input: PaymentStatusInput): EmailMessage {
  const approved = input.status === "APPROVED"
  const headline = approved ? "Your registration is confirmed!" : "Payment verification failed"
  const body = approved
    ? `Your payment for ${input.eventName} has been verified. Your spot at ${site.name} is confirmed.`
    : `We couldn't verify your payment for ${input.eventName}. Please reach out to the organizing team to resolve this.`

  const text = `Hi ${input.fullName},

${headline}

${body}

${site.venue} - ${site.date}

Team ${site.name}`

  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2>${headline}</h2>
  <p>Hi ${input.fullName},</p>
  <p>${body}</p>
  <p>${site.venue} - ${site.date}</p>
  <p>Team ${site.name}</p>
</div>`

  return { to: input.to, subject: `${headline} - ${input.eventName}`, html, text }
}
