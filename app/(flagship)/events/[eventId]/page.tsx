import { notFound } from "next/navigation"
import { getEvent } from "@/lib/server/firestore-events"
import { EventDetailPageClient } from "./EventDetailPageClient"

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const event = await getEvent(eventId)
  if (!event) return notFound()

  return <EventDetailPageClient event={event} />
}
