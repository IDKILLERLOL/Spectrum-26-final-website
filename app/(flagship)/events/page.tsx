import { getEvents } from "@/lib/server/firestore-events"
import { EventsPageClient } from "./EventsPageClient"

export const dynamic = "force-dynamic"

export default async function EventsPage() {
  const events = await getEvents()
  return <EventsPageClient events={events} />
}
