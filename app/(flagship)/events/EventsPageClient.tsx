"use client"

import * as React from "react"
import Link from "next/link"
import type { SpectrumEvent } from "@/content/spectrum"
import { site } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { NAVY, INK, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { trackEventCardView, trackEventCardClick } from "@/lib/analytics/track"

/** Scalloped canvas awning strip — mela/fair stall roofline, alternating the
 *  event's own accent colour with white. Sits astride the card's top edge. */
function StallAwning({ color }: { color: string }) {
  return (
    <div
      className="absolute -top-3 left-0 right-0 flex h-3 overflow-hidden"
      style={{ borderTop: `2px solid ${INK}` }}
      aria-hidden="true"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-b-sm border-b-2 border-r-2"
          style={{ backgroundColor: i % 2 === 0 ? color : "#fff", borderColor: INK }}
        />
      ))}
    </div>
  )
}

export function EventsPageClient({ events }: { events: SpectrumEvent[] }) {
  React.useEffect(() => {
    events.forEach((ev) => trackEventCardView(ev.id, ev.name))
  }, [events])

  return (
    <>
      <PageHeader title="Events Arena" subtitle="Choose your battleground." back={false} />
      <PageContainer width="wide">
        <div className="flex flex-col gap-4 px-5 py-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
            {events.map((ev) => (
              <Link key={ev.id} href={`/events/${ev.id}`} onClick={() => trackEventCardClick(ev.id, ev.name)}>
                <Card className="relative flex h-40 flex-col justify-between p-4 pt-7" style={{ borderColor: ev.color }}>
                  <StallAwning color={ev.color} />
                  <span
                    className={`${questDisplay.className} flex size-8 items-center justify-center border-2 text-[10px] text-white`}
                    style={{ background: ev.color, borderColor: INK, boxShadow: softHoardingShadow }}
                  >
                    {ev.index}
                  </span>
                  <div>
                    <p className={`${questBody.className} text-sm font-bold`} style={{ color: NAVY }}>
                      {ev.name}
                    </p>
                    <p className={`${questBody.className} text-[10px] opacity-60`} style={{ color: NAVY }}>
                      {ev.format}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <Link href="/events/prize-pool">
            <Card className="flex items-center justify-between p-4 md:mx-auto md:max-w-xl">
              <div>
                <p className={`${questBody.className} text-xs font-bold`} style={{ color: NAVY }}>
                  Total Prize Pool
                </p>
                <p className={questDisplay.className} style={{ color: NAVY, fontSize: "1rem" }}>
                  {site.prizePool}
                </p>
              </div>
              <span className={`${questBody.className} text-[11px] underline`} style={{ color: NAVY }}>
                Explore All →
              </span>
            </Card>
          </Link>
        </div>
      </PageContainer>
    </>
  )
}
