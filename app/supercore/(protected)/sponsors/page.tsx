import { listSponsors } from "@/lib/server/firestore-sponsors"
import { SponsorsAdminClient } from "./SponsorsAdminClient"

export default async function AdminSponsorsPage() {
  const sponsors = await listSponsors()
  return <SponsorsAdminClient initialSponsors={sponsors} />
}
