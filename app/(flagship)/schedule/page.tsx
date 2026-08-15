import { getSchedule } from "@/lib/server/firestore-schedule"
import { SchedulePageClient } from "./SchedulePageClient"

export default async function SchedulePage() {
  const schedule = await getSchedule()
  return <SchedulePageClient schedule={schedule} />
}
