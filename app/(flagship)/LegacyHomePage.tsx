import { getEvents } from "@/lib/server/firestore-events"
import { HomePageClient } from "./HomePageClient"

export async function LegacyHomePage() {
  const events = await getEvents()
  return <HomePageClient events={events} />
}
