import { listAllWinners } from "@/lib/server/firestore-winners"
import { getEvents } from "@/lib/server/firestore-events"
import { site } from "@/content/spectrum"
import { WinnersAdminClient } from "./WinnersAdminClient"

export default async function AdminWinnersPage() {
  const [rawWinners, events] = await Promise.all([listAllWinners(), getEvents()])
  // Firestore Timestamps are class instances and can't cross the Server -> Client
  // Component boundary as props; convert to plain ISO strings first.
  const winners = rawWinners.map((w) => ({
    ...w,
    createdAt: w.createdAt ? (typeof w.createdAt.toDate === "function" ? w.createdAt.toDate().toISOString() : new Date(w.createdAt).toISOString()) : new Date().toISOString(),
    updatedAt: w.updatedAt ? (typeof w.updatedAt.toDate === "function" ? w.updatedAt.toDate().toISOString() : new Date(w.updatedAt).toISOString()) : null,
  }))
  return <WinnersAdminClient winners={winners} events={events} defaultEdition={site.name} />
}
