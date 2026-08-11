import { getEvents } from "@/lib/server/firestore-events"
import { RegisterEventStepClient } from "./RegisterEventStepClient"

export default async function RegisterEventStep() {
  const events = await getEvents()
  return <RegisterEventStepClient events={events} />
}
