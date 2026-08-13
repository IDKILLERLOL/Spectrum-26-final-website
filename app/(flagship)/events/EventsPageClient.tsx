"use client"

import * as React from "react"
import Link from "next/link"
import type { SpectrumEvent } from "@/content/spectrum"
import { site } from "@/content/spectrum"
import { Trophy } from "lucide-react"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, INK, PINK, MUSTARD, hoardingShadow, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { trackEventCardView, trackEventCardClick } from "@/lib/analytics/track"

/** Scalloped canvas awning strip — alternating the event's own accent colour with white. */
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
      <PageHeader title="Events & Prizes" subtitle="Choose your battleground and win big." back={false} />
      <PageContainer width="wide">
        <div className="flex flex-col gap-8 px-5 py-6">
          
          {/* Merged Prize Pool Hero Section */}
          <div className="mx-auto w-full max-w-2xl flex flex-col sm:flex-row items-center gap-6 border-4 bg-white p-6 rounded-lg"
               style={{ borderColor: INK, boxShadow: hoardingShadow }}>
            <span
              className="flex size-16 shrink-0 items-center justify-center border-4"
              style={{ background: PINK, borderColor: INK, boxShadow: softHoardingShadow }}
            >
              <Trophy size={28} color="#fff" />
            </span>
            <div className="flex-1 text-center sm:text-left">
              <p className={`${questBody.className} text-xs uppercase tracking-wide opacity-70`} style={{ color: NAVY }}>
                Total Prize Pool
              </p>
              <h2
                className={questDisplay.className}
                style={{ color: PINK, fontSize: "2rem", textShadow: `1.5px 1.5px 0px ${MUSTARD}, 3px 3px 0px ${INK}` }}
              >
                {site.prizePool}
              </h2>
              <p className={`${questBody.className} mt-2 text-xs opacity-80`} style={{ color: NAVY }}>
                Trophies, goodie bags, and certificates await the champions across all arena events.
              </p>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
            {events.map((ev) => (
              <Link key={ev.id} href={`/events/${ev.id}`} onClick={() => trackEventCardClick(ev.id, ev.name)}>
                <Card className="relative flex h-40 flex-col justify-between p-4 pt-7 transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: ev.color }}>
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
                    {ev.prizePool && (
                      <p className={`${questBody.className} mt-1 text-xs font-bold`} style={{ color: PINK }}>
                        Prize Pool: {ev.prizePool}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

        </div>
      </PageContainer>
    </>
  )
}
