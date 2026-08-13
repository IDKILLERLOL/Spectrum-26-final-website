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
    createdAt: w.createdAt.toDate().toISOString(),
    updatedAt: w.updatedAt.toDate().toISOString(),
  }))
  return <WinnersAdminClient winners={winners} events={events} defaultEdition={site.name} />
}
