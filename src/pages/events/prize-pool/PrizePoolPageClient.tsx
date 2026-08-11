"use client"

import { Trophy } from "lucide-react"
import { site } from "@/content/spectrum"
import type { SpectrumEvent } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { NAVY, PINK, INK, MUSTARD, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

/** Scalloped canvas awning strip — mela/fair stall roofline, cycling through every
 *  event's accent colour so the summary panel reads as the whole fairground. */
function StallAwning({ events }: { events: SpectrumEvent[] }) {
  const colors = events.map((ev) => ev.color)
  return (
    <div
      className="absolute -top-3 left-0 right-0 flex h-3 overflow-hidden"
      style={{ borderTop: `2px solid ${INK}` }}
      aria-hidden="true"
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-b-sm border-b-2 border-r-2"
          style={{ backgroundColor: colors[i % colors.length], borderColor: INK }}
        />
      ))}
    </div>
  )
}

export function PrizePoolPageClient({ events }: { events: SpectrumEvent[] }) {
  return (
    <>
      <PageHeader title="Prize Pool" />
      <PageContainer width="narrow">
        <div className="flex flex-col items-center gap-5 px-5 py-10 text-center">
          <span
            className="flex size-16 items-center justify-center border-4"
            style={{ background: PINK, borderColor: INK, boxShadow: hoardingShadow }}
          >
            <Trophy size={28} color="#fff" />
          </span>
          <p className={`${questBody.className} text-xs uppercase tracking-wide opacity-70`} style={{ color: NAVY }}>
            Total Prize Pool
          </p>
          <h1
            className={questDisplay.className}
            style={{ color: PINK, fontSize: "2.5rem", textShadow: `2px 2px 0px ${MUSTARD}, 4px 4px 0px ${INK}` }}
          >
            {site.prizePool}
          </h1>
          <Card className="relative p-4 pt-7 text-left">
            <StallAwning events={events} />
            <p className={`${questBody.className} text-xs`} style={{ color: NAVY }}>
              Trophies, goodie bags, certificates and more await every champion across all four events.
            </p>
          </Card>
          <AppButton href="/events" className="w-full py-3.5 text-sm">
            Explore All Events →
          </AppButton>
        </div>
      </PageContainer>
    </>
  )
}
