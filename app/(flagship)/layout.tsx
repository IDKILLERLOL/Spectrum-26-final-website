import { Shell } from "@/components/flagship/Shell"
import { QuestProvider } from "@/components/flagship/quest-context"
import { questBody } from "@/components/flagship/fonts"
import { TruckScrollbar } from "@/components/flagship/TruckScrollbar"

export default function FlagshipLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={questBody.className}>
      <QuestProvider>
        <Shell>{children}</Shell>
        <TruckScrollbar />
      </QuestProvider>
    </div>
  )
}
