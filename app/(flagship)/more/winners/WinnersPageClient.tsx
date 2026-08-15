"use client"

import Link from "next/link"
import { Trophy, ChevronRight } from "lucide-react"
import type { SpectrumEvent, EventWinners } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { NAVY, PINK, CREAM, INK, MARIGOLD, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

const PODIUM_COLORS = [MARIGOLD, PINK, "#B08D57"]

export function WinnersPageClient({
  events,
  currentEditionWinners,
}: {
  events: SpectrumEvent[]
  currentEditionWinners: EventWinners[]
}) {
  const overall = currentEditionWinners[0]
  const overallEvent = events.find((e) => e.id === overall.eventId)

  return (
    <>
      <PageHeader title="Winners" back={false} />
      <PageContainer width="narrow">
      <div className="flex flex-col gap-4 px-5 py-4">
        <Card className="relative flex flex-col items-center gap-3 p-5">
          <div
            className="absolute -top-2 -left-2 size-4 rounded-full border-2"
            style={{ background: MARIGOLD, borderColor: INK }}
          />
          <p className={`${questBody.className} text-[10px] uppercase tracking-wide opacity-60`} style={{ color: NAVY }}>
            {overallEvent?.name}
          </p>
          <div className="flex items-end gap-3">
            {overall.winners.map((w, i) => (
              <div key={w.place} className="flex flex-col items-center gap-1">
                <span
                  className={`${questDisplay.className} flex items-center justify-center border-2 text-[10px] text-white`}
                  style={{
                    background: PODIUM_COLORS[i],
                    borderColor: INK,
                    boxShadow: softHoardingShadow,
                    width: i === 0 ? 56 : 44,
                    height: i === 0 ? 56 : 44,
                  }}
                >
                  {i + 1}
                </span>
                <p className={`${questDisplay.className} max-w-[70px] text-center text-[10px]`} style={{ color: NAVY }}>
                  {w.teamName}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <p className={`${questBody.className} text-[10px] uppercase tracking-wide opacity-60`} style={{ color: NAVY }}>
          By Event
        </p>
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
          {events.map((ev) => (
            <Link key={ev.id} href={`/more/winners/${ev.id}`}>
              <Card className="flex items-center gap-3 p-4">
                <Trophy size={16} color={ev.color} />
                <span className={`${questBody.className} flex-1 text-sm font-bold`} style={{ color: NAVY }}>
                  {ev.name}
                </span>
                <ChevronRight size={16} color={NAVY} className="opacity-40" />
              </Card>
            </Link>
          ))}
        </div>

        <AppButton href="/more/winners/hall-of-fame" variant="outline" className="w-full py-3 text-xs">
          View Hall of Fame
        </AppButton>
      </div>
      </PageContainer>
    </>
  )
}
