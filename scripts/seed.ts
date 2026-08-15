/**
 * One-time seed: pushes the static content/spectrum.ts data (events, schedule,
 * currentEditionWinners) into Firestore, plus a default settings/global doc.
 * Run with: pnpm seed
 *
 * Safe to re-run — uses `set` (not `create`), so it overwrites rather than
 * duplicating. Requires FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY in .env.local.
 */
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(__dirname, "../.env.local") })

import { cert, initializeApp } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"
import { events, schedule, currentEditionWinners, site } from "../content/spectrum"

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local.\n" +
        "Generate a service account at Firebase Console > Project Settings > Service Accounts > " +
        "Generate new private key, then fill in .env.local (see .env.example)."
    )
    process.exit(1)
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  const db = getFirestore()
  const now = Timestamp.now()

  console.log(`Seeding Firestore project "${projectId}"...`)

  // events
  const eventsBatch = db.batch()
  for (const ev of events) {
    const ref = db.collection("events").doc(ev.id)
    eventsBatch.set(ref, {
      id: ev.id,
      order: ev.order,
      index: ev.index,
      category: ev.category,
      name: ev.name,
      shortName: ev.shortName,
      tag: ev.tag,
      format: ev.format,
      fee: ev.fee,
      feeNumeric: ev.feeNumeric,
      capacity: ev.capacity,
      teamSize: ev.teamSize,
      difficulty: ev.difficulty,
      color: ev.color,
      duration: ev.duration,
      description: ev.description,
      rules: ev.rules,
      prizes: ev.prizes,
      registrationOpen: ev.registrationOpen,
      registrationEndsAt: Timestamp.fromDate(new Date(ev.registrationEndsAt)),
      imageUrl: ev.imageUrl,
      createdAt: now,
      updatedAt: now,
    })
  }
  await eventsBatch.commit()
  console.log(`  events: ${events.length} docs`)

  // schedule
  const scheduleBatch = db.batch()
  for (const item of schedule) {
    const ref = db.collection("schedule").doc(`${item.date}-${item.order}`)
    scheduleBatch.set(ref, { ...item, createdAt: now, updatedAt: now })
  }
  await scheduleBatch.commit()
  console.log(`  schedule: ${schedule.length} docs`)

  // winners (flatten EventWinners[] -> one doc per place)
  const winnersBatch = db.batch()
  let winnerCount = 0
  for (const eventWinners of currentEditionWinners) {
    for (const w of eventWinners.winners) {
      const event = events.find((e) => e.id === eventWinners.eventId)
      const ref = db.collection("winners").doc(`${eventWinners.eventId}-${w.place}-${site.name}`.replace(/\s+/g, "-"))
      winnersBatch.set(ref, {
        eventId: eventWinners.eventId,
        eventName: event?.name ?? eventWinners.eventId,
        place: w.place,
        teamName: w.teamName,
        members: [],
        edition: site.name,
        createdBy: "seed-script",
        createdAt: now,
        updatedAt: now,
      })
      winnerCount++
    }
  }
  await winnersBatch.commit()
  console.log(`  winners: ${winnerCount} docs`)

  // settings/global (only create if it doesn't already exist, don't clobber admin edits)
  const settingsRef = db.collection("settings").doc("global")
  const settingsSnap = await settingsRef.get()
  if (!settingsSnap.exists) {
    await settingsRef.set({
      upiVpa: process.env.UPI_VPA ?? "",
      sheetId: "",
      registrationOpen: true,
      updatedAt: now,
      updatedBy: "seed-script",
    })
    console.log("  settings/global: created")
  } else {
    console.log("  settings/global: already exists, left untouched")
  }

  console.log("Seed complete.")
}

main().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
