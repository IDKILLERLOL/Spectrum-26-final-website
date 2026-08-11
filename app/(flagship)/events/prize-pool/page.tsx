import { getEvents } from "@/lib/server/firestore-events"
import { PrizePoolPageClient } from "./PrizePoolPageClient"

export default async function PrizePoolPage() {
  const events = await getEvents()
  return <PrizePoolPageClient events={events} />
}
