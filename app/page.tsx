import { getEvents } from "@/lib/server/firestore-events"
import { HomePageClient } from "./(flagship)/HomePageClient"

export default async function HomePage() {
  const events = await getEvents()
  return <HomePageClient events={events} />
}
