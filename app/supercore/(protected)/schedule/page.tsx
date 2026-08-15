import { getSchedule } from "@/lib/server/firestore-schedule"
import { ScheduleAdminClient } from "./ScheduleAdminClient"

export default async function AdminSchedulePage() {
  const schedule = await getSchedule()
  return <ScheduleAdminClient schedule={schedule} />
}
