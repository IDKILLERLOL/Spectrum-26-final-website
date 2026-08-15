import { getEvents } from "@/lib/server/firestore-events"
import { RegisterEventStepClient } from "./event/RegisterEventStepClient"

export default async function QuestBoardPage() {
  const events = await getEvents()
  return <RegisterEventStepClient events={events} />
}
