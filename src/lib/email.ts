// ─── Email Module ─────────────────────────────────────────────────────────────
// Sends email via Gmail API using the logged-in user's OAuth token.
// Sender address: VITE_SENDER_EMAIL (defaults to i.doshi30@gmail.com).
// Change VITE_SENDER_EMAIL in .env to use a different sender.

import { getAccessToken } from './auth';
import { SENDER_EMAIL, FEST_NAME } from '../config';

/** Core send function — uses the Gmail API with the cached OAuth token. */
export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    console.warn('[email] No OAuth token available — email not sent to:', to);
    return;
  }

  const message = [
    `From: ${FEST_NAME} <${SENDER_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    htmlBody,
  ].join('\r\n');

  const encoded = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[email] Gmail API send failed:', err);
    }
  } catch (err) {
    console.warn('[email] Failed to fetch or send via Gmail API:', err);
  }
}

// ─── Notification templates (Section 5 scoping rules) ────────────────────────

/** Generic "team details changed" notification to all active members. */
export async function notifyTeamEdited(
  recipients: string[],
  eventName: string,
  actorName: string
): Promise<void> {
  await Promise.allSettled(
    recipients.map((to) =>
      sendEmail(
        to,
        `${FEST_NAME} - Your team details were updated`,
        `<p>${actorName} updated your team's details for <strong>${eventName}</strong>.</p>
         <p>If this wasn't expected, contact the event organizers.</p>`
      )
    )
  );
}

/** Dedicated removal notice to the removed member only. */
export async function notifyMemberRemoved(
  removedEmail: string,
  eventName: string
): Promise<void> {
  await sendEmail(
    removedEmail,
    `${FEST_NAME} - You were removed from a team`,
    `<p>You have been removed from a team registered for <strong>${eventName}</strong>.</p>
     <p>If you believe this is an error, contact the event organizers.</p>`
  );
}

/** Dedicated invite notice to the newly added member only. */
export async function notifyMemberAdded(
  newMemberEmail: string,
  eventName: string,
  teamLeaderName: string
): Promise<void> {
  await sendEmail(
    newMemberEmail,
    `${FEST_NAME} - You've been added to a team`,
    `<p>${teamLeaderName} has added you to their team for <strong>${eventName}</strong>.</p>
     <p>Log in to ${FEST_NAME} to view and edit your team details.</p>`
  );
}

/** Leadership transfer notice to all active members. */
export async function notifyLeadershipTransferred(
  recipients: string[],
  eventName: string,
  newLeaderName: string
): Promise<void> {
  await Promise.allSettled(
    recipients.map((to) =>
      sendEmail(
        to,
        `${FEST_NAME} - Team leadership changed`,
        `<p>Leadership of your <strong>${eventName}</strong> team has been transferred to <strong>${newLeaderName}</strong>.</p>`
      )
    )
  );
}

/** Fee PAID notice with QR link (sent to all active members). */
export async function notifyFeeStatusPaid(
  recipients: string[],
  eventName: string,
  registrationId: string
): Promise<void> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
  const qrData = isLocal ? registrationId : `${origin}/pass/${registrationId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
  await Promise.allSettled(
    recipients.map((to) =>
      sendEmail(
        to,
        `${FEST_NAME} - Payment confirmed! Here's your entry pass`,
        `<p>Your payment for <strong>${eventName}</strong> has been confirmed.</p>
         <p>Present the QR code below at the venue entrance:</p>
         <img src="${qrUrl}" alt="Entry QR Code" style="display:block;margin:24px auto" />
         <p style="font-family:monospace;font-size:12px;color:#666">Registration ID: ${registrationId}</p>`
      )
    )
  );
}

/** Old + new email change notices. */
export async function notifyEmailChanged(
  oldEmail: string,
  newEmail: string
): Promise<void> {
  await sendEmail(
    oldEmail,
    `${FEST_NAME} - Your email address was changed`,
    `<p>The email address on your ${FEST_NAME} account has been changed to <strong>${newEmail}</strong>.</p>
     <p>If you did not make this change, contact the organizers immediately.</p>`
  );
  await sendEmail(
    newEmail,
    `${FEST_NAME} - New email address confirmed`,
    `<p>Your ${FEST_NAME} account email has been updated to this address.</p>`
  );
}

/** Welcome email sent on first successful login. */
export async function sendWelcomeEmail(toEmail: string, name: string): Promise<void> {
  await sendEmail(
    toEmail,
    `Welcome to ${FEST_NAME}!`,
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="letter-spacing:0.1em;text-transform:uppercase;color:#111">${FEST_NAME}</h2>
      <p>Hello ${name || 'Participant'},</p>
      <p>Your account on <strong>${FEST_NAME}</strong> has been successfully created.</p>
      <p>Log in to view your dashboard, sign up for events, and manage your team clearances.</p>
      <p style="color:#666;font-size:13px;margin-top:24px">If you have any questions, contact us at ${SENDER_EMAIL}.</p>
    </div>`
  );
}
