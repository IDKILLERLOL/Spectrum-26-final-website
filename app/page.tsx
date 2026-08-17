import { getEvents } from "@/lib/server/firestore-events"
import { HomePageClient } from "./(flagship)/HomePageClient"
import { Shell } from "@/components/flagship/Shell"
import { QuestProvider } from "@/components/flagship/quest-context"
import { questBody } from "@/components/flagship/fonts"
import { TruckScrollbar } from "@/components/flagship/TruckScrollbar"

export default async function HomePage() {
  const events = await getEvents()
  return (
    <div className={questBody.className}>
      <QuestProvider>
        <Shell>
          <HomePageClient events={events} />
        </Shell>
        <TruckScrollbar />
      </QuestProvider>
    </div>
  )
}
