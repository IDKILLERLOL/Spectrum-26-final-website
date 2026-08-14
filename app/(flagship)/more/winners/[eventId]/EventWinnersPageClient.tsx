"use client"

import { Trophy } from "lucide-react"
import type { SpectrumEvent, EventWinners } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, PINK, INK, MARIGOLD, AGED_PAPER, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

const PLACE_COLORS: Record<string, string> = {
  "1st": MARIGOLD,
  "2nd": PINK,
  "3rd": "#B08D57",
}

export function EventWinnersPageClient({ event, entry }: { event: SpectrumEvent; entry: EventWinners }) {
  return (
    <>
      <PageHeader title={event.name} subtitle="Current Edition Winners" />
      <PageContainer width="narrow">
      <div className="flex flex-col gap-3 px-5 py-4">
        {entry.winners.map((w, i) => (
          <Card key={w.place} className="relative flex items-center gap-3 p-4">
            {i === 0 && (
              <div
                className="absolute -top-2 -left-2 size-4 rounded-full border-2"
                style={{ background: MARIGOLD, borderColor: INK }}
              />
            )}
            <span
              className="flex size-10 shrink-0 items-center justify-center border-2"
              style={{ background: PLACE_COLORS[w.place] ?? MARIGOLD, borderColor: INK, boxShadow: softHoardingShadow }}
            >
              <Trophy size={18} color={AGED_PAPER} />
            </span>
            <div>
              <p className={`${questBody.className} text-xs font-bold uppercase tracking-wide opacity-70`} style={{ color: NAVY }}>
                {w.place} Place
              </p>
              <p className={`${questDisplay.className} text-sm`} style={{ color: NAVY }}>
                {w.teamName}
              </p>
            </div>
          </Card>
        ))}
      </div>
      </PageContainer>
    </>
  )
}
