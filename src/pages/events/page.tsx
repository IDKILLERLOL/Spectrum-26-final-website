import { getEvents } from "@/lib/server/firestore-events"
import { EventsPageClient } from "./EventsPageClient"

export default async function EventsPage() {
  const events = await getEvents()
  return <EventsPageClient events={events} />
}
