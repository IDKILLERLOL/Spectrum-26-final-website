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
  phone?: string
  collegeName?: string
  teamName?: string
  teamMembers?: any[]
}

function buildTeamDetailsHtml(
  leaderName: string,
  leaderEmail: string,
  leaderPhone?: string,
  leaderCollege?: string,
  teamName?: string,
  teamMembers?: any[]
) {
  let html = `
  <div style="margin-top: 20px; border: 2px solid #000; padding: 15px; background-color: #FFFDF6; font-family: sans-serif;">
    <h3 style="margin-top: 0; margin-bottom: 10px; text-transform: uppercase; color: #1E3A8A; border-bottom: 2px solid #000; padding-bottom: 5px;">Registered Team Details</h3>
  `
  if (teamName) {
    html += `<p style="margin: 5px 0;"><strong>Team Name:</strong> ${teamName}</p>`
  }
  html += `
    <p style="margin: 5px 0;"><strong>Leader / Player 1:</strong> ${leaderName} (${leaderEmail}${leaderPhone ? `, Phone: ${leaderPhone}` : ""}${leaderCollege ? `, College: ${leaderCollege}` : ""})</p>
  `
  if (teamMembers && teamMembers.length > 0) {
    html += `<h4 style="margin: 15px 0 5px 0; text-transform: uppercase; color: #1E3A8A; font-size: 0.9em;">Team Members:</h4><ul style="margin: 0; padding-left: 20px;">`
    teamMembers.forEach((m, idx) => {
      const mPhone = m.phone ? `, Phone: ${m.phone}` : ""
      const mCollege = m.college || m.collegeName ? `, College: ${m.college || m.collegeName}` : ""
      const mEmail = m.email ? ` (${m.email}${mPhone}${mCollege})` : ""
      html += `<li style="margin-bottom: 4px;"><strong>Player ${idx + 2}:</strong> ${m.name}${mEmail}</li>`
    })
    html += `</ul>`
  }
  html += `</div>`
  return html
}

function buildTeamDetailsText(
  leaderName: string,
  leaderEmail: string,
  leaderPhone?: string,
  leaderCollege?: string,
  teamName?: string,
  teamMembers?: any[]
) {
  let text = `\n--- REGISTERED TEAM DETAILS ---\n`
  if (teamName) {
    text += `Team Name: ${teamName}\n`
  }
  text += `Leader / Player 1: ${leaderName} (${leaderEmail}${leaderPhone ? `, Phone: ${leaderPhone}` : ""}${leaderCollege ? `, College: ${leaderCollege}` : ""})\n`
  if (teamMembers && teamMembers.length > 0) {
    text += `Team Members:\n`
    teamMembers.forEach((m, idx) => {
      const mPhone = m.phone ? `, Phone: ${m.phone}` : ""
      const mCollege = m.college || m.collegeName ? `, College: ${m.college || m.collegeName}` : ""
      const mEmail = m.email ? ` (${m.email}${mPhone}${mCollege})` : ""
      text += `- Player ${idx + 2}: ${m.name}${mEmail}\n`
    })
  }
  return text
}

export function registrationReceivedEmail(input: RegistrationReceivedInput): EmailMessage {
  const teamHtml = buildTeamDetailsHtml(
    input.fullName,
    input.to,
    input.phone,
    input.collegeName,
    input.teamName,
    input.teamMembers
  )
  const teamText = buildTeamDetailsText(
    input.fullName,
    input.to,
    input.phone,
    input.collegeName,
    input.teamName,
    input.teamMembers
  )

  const text = `Hi ${input.fullName},

Your payment is under review. Please find your registered team details below:
${teamText}

We've received your registration for ${input.eventName} at ${site.name}.

Team size: ${input.teamSize}
Amount paid: ₹${input.amountPaid}
Payment reference: ${input.paymentRefId}

${site.venue} - ${site.date}

Team ${site.name}`

  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2>Payment Under Review</h2>
  <p>Hi ${input.fullName},</p>
  <p>Your payment for <strong>${input.eventName}</strong> is currently under review. We will verify it shortly.</p>
  
  ${teamHtml}

  <ul>
    <li>Team size: ${input.teamSize}</li>
    <li>Amount paid: ₹${input.amountPaid}</li>
    <li>Payment reference: ${input.paymentRefId}</li>
  </ul>
  <p>${site.venue} - ${site.date}</p>
  <p>Team ${site.name}</p>
</div>`

  return { to: input.to, subject: `Payment Under Review - ${input.eventName}`, html, text }
}

interface PaymentStatusInput {
  to: string
  fullName: string
  eventName: string
  status: "APPROVED" | "REJECTED"
  phone?: string
  collegeName?: string
  teamName?: string
  teamMembers?: any[]
}

export function paymentStatusEmail(input: PaymentStatusInput): EmailMessage {
  const approved = input.status === "APPROVED"
  const headline = approved ? "Your registration is confirmed!" : "Payment verification failed"
  const body = approved
    ? `Your registration is confirmed. Your payment was received.`
    : `We couldn't verify your payment for ${input.eventName}. Please reach out to the organizing team to resolve this.`

  const teamHtml = approved
    ? buildTeamDetailsHtml(
        input.fullName,
        input.to,
        input.phone,
        input.collegeName,
        input.teamName,
        input.teamMembers
      )
    : ""
  const teamText = approved
    ? buildTeamDetailsText(
        input.fullName,
        input.to,
        input.phone,
        input.collegeName,
        input.teamName,
        input.teamMembers
      )
    : ""

  const text = `Hi ${input.fullName},

${headline}

${body}
${teamText}

${site.venue} - ${site.date}

Team ${site.name}`

  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2>${headline}</h2>
  <p>Hi ${input.fullName},</p>
  <p>${body}</p>
  
  ${teamHtml}

  <p>${site.venue} - ${site.date}</p>
  <p>Team ${site.name}</p>
</div>`

  return { to: input.to, subject: `${headline} - ${input.eventName}`, html, text }
}
