import { listAllWinners } from "@/lib/server/firestore-winners"
import { getEvents } from "@/lib/server/firestore-events"
import { site } from "@/content/spectrum"
import { WinnersAdminClient } from "./WinnersAdminClient"

function serializeTimestamps(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj.toDate === "function") {
    return obj.toDate().toISOString()
  }
  if (typeof obj === "object" && "_seconds" in obj && "_nanoseconds" in obj) {
    return new Date(obj._seconds * 1000).toISOString()
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeTimestamps)
  }
  if (typeof obj === "object") {
    const serialized: any = {}
    for (const key of Object.keys(obj)) {
      serialized[key] = serializeTimestamps(obj[key])
    }
    return serialized
  }
  return obj
}

export default async function AdminWinnersPage() {
  const [rawWinners, events] = await Promise.all([listAllWinners(), getEvents()])
  const winners = rawWinners.map((w) => {
    const serialized = serializeTimestamps(w)
    return {
      ...serialized,
      createdAt: serialized.createdAt || new Date().toISOString(),
      updatedAt: serialized.updatedAt || null,
    }
  })
  return <WinnersAdminClient winners={winners} events={events} defaultEdition={site.name} />
}
