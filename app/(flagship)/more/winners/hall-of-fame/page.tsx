import { Crown } from "lucide-react"
import { hallOfFame } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, PINK, CREAM, INK, MARIGOLD, softHoardingShadow, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function HallOfFamePage() {
  return (
    <>
      <PageHeader title="Hall of Fame" subtitle="Honoring the champions who made history." />
      <PageContainer width="narrow">
      <div className="flex flex-col items-center gap-4 px-5 py-6">
        <span
          className="relative flex size-16 items-center justify-center border-2"
          style={{ background: PINK, borderColor: INK, boxShadow: hoardingShadow }}
        >
          <Crown size={28} color={CREAM} />
          <div
            className="absolute -top-2 -right-2 size-4 rounded-full border-2"
            style={{ background: MARIGOLD, borderColor: INK }}
          />
        </span>
        <div className="flex w-full flex-col gap-3 md:grid md:grid-cols-2">
          {hallOfFame.map((h) => (
            <Card key={h.edition + h.eventName} className="flex items-center justify-between p-4">
              <div className="flex flex-col gap-1">
                <p className={`${questBody.className} text-[10px] uppercase tracking-wide opacity-60`} style={{ color: NAVY }}>
                  {h.eventName}
                </p>
                <p className={`${questDisplay.className} text-sm`} style={{ color: NAVY }}>
                  {h.championTeam}
                </p>
              </div>
              <span
                className={`${questBody.className} border-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wide`}
                style={{ borderColor: INK, background: MARIGOLD, color: INK, boxShadow: softHoardingShadow }}
              >
                {h.edition}
              </span>
            </Card>
          ))}
        </div>
      </div>
      </PageContainer>
    </>
  )
}
