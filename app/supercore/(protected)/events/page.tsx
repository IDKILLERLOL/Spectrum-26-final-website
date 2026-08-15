import { getEvents } from "@/lib/server/firestore-events"
import { EventsAdminClient } from "./EventsAdminClient"

export default async function AdminEventsPage() {
  const events = await getEvents()
  return <EventsAdminClient events={events} />
}
