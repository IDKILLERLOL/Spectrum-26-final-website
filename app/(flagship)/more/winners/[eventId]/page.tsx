import { notFound } from "next/navigation"
import { getEvent } from "@/lib/server/firestore-events"
import { getCurrentEditionWinners } from "@/lib/server/firestore-winners"
import { EventWinnersPageClient } from "./EventWinnersPageClient"

export default async function EventWinnersPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const [event, currentEditionWinners] = await Promise.all([getEvent(eventId), getCurrentEditionWinners()])
  const entry = currentEditionWinners.find((w) => w.eventId === eventId)
  if (!event || !entry) return notFound()

  return <EventWinnersPageClient event={event} entry={entry} />
}
