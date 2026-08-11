import { getEvents } from "@/lib/server/firestore-events"
import { HomePageClient } from "./(flagship)/HomePageClient"
import { Shell } from "@/components/flagship/Shell"
import { QuestProvider } from "@/components/flagship/quest-context"
import { questBody } from "@/components/flagship/fonts"

export default async function HomePage() {
  const events = await getEvents()
  return (
    <div className={questBody.className}>
      <QuestProvider>
        <Shell>
          <HomePageClient events={events} />
        </Shell>
      </QuestProvider>
    </div>
  )
}
