import { getEvents } from "@/lib/server/firestore-events"
import { getCurrentEditionWinners } from "@/lib/server/firestore-winners"
import { WinnersPageClient } from "./WinnersPageClient"

export default async function WinnersPage() {
  const [events, currentEditionWinners] = await Promise.all([getEvents(), getCurrentEditionWinners()])
  return <WinnersPageClient events={events} currentEditionWinners={currentEditionWinners} />
}
