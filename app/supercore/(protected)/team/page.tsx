import { listTeamMembers } from "@/lib/server/firestore-team"
import { TeamAdminClient } from "./TeamAdminClient"

export const dynamic = "force-dynamic"

export default async function TeamAdminPage() {
  const members = await listTeamMembers()
  return <TeamAdminClient initialMembers={members} />
}
