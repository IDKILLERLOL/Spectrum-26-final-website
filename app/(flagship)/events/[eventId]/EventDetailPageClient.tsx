"use client"

import * as React from "react"
import { Star, Trophy } from "lucide-react"
import type { SpectrumEvent } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { SegmentedTabs } from "@/components/flagship/SegmentedTabs"
import { useQuest } from "@/components/flagship/quest-context"
import { NAVY, PINK, INK, softHoardingShadow } from "@/components/flagship/tokens"
import { questBody, questDisplay } from "@/components/flagship/fonts"

type TabId = "details" | "rules" | "prizes"

/** Scalloped canvas awning strip — mela/fair stall roofline, alternating the
 *  event's own accent colour with white. Sits astride the panel's top edge. */
function StallAwning({ color }: { color: string }) {
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
          style={{ backgroundColor: i % 2 === 0 ? color : "#fff", borderColor: INK }}
        />
      ))}
    </div>
  )
}

export function EventDetailPageClient({ event }: { event: SpectrumEvent }) {
  const { openQuest } = useQuest()
  const [tab, setTab] = React.useState<TabId>("details")

  return (
    <>
      <PageHeader title={event.name} subtitle={event.tag} />
      <PageContainer width="narrow">
        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Mela stall hero panel — event's colour as the stall awning */}
          <Card className="relative flex items-center gap-3 p-4 pt-7 md:p-5 md:pt-8" style={{ borderColor: event.color }}>
            <StallAwning color={event.color} />
            <span
              className={`${questDisplay.className} flex size-10 shrink-0 items-center justify-center border-2 text-xs text-white md:size-12 md:text-sm`}
              style={{ background: event.color, borderColor: INK, boxShadow: softHoardingShadow }}
            >
              {event.index}
            </span>
            <div>
              <p className={`${questBody.className} text-xs font-bold md:text-base`} style={{ color: NAVY }}>
                {event.format}
              </p>
              <p className={`${questBody.className} text-[11px] opacity-60 md:text-sm`} style={{ color: NAVY }}>
                {event.duration}
              </p>
            </div>
          </Card>

          <SegmentedTabs<TabId>
            tabs={[
              { id: "details", label: "Details" },
              { id: "rules", label: "Rules" },
              { id: "prizes", label: "Prizes" },
            ]}
            active={tab}
            onChange={setTab}
          />

          {tab === "details" && (
            <Card className="flex flex-col gap-3 p-4 md:p-5">
              <Row label="Team Size" value={event.teamSize} />
              <Row label="Duration" value={event.duration} />
              <div className="flex items-center justify-between">
                <span className={`${questBody.className} text-xs opacity-70 md:text-base`} style={{ color: NAVY }}>
                  Difficulty
                </span>
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill={i < event.difficulty ? PINK : "none"} color={PINK} />
                  ))}
                </span>
              </div>
              <Row label="Registration Fee" value={event.fee} />
              {event.prizePool && <Row label="Prize Pool" value={event.prizePool} />}
              <Row label="Registration Ends" value={event.registrationEnds} />
              <div className="border-t-[2px] pt-3" style={{ borderColor: `${NAVY}22` }}>
                <p className={`${questBody.className} text-[10px] uppercase opacity-60 md:text-xs`} style={{ color: NAVY }}>
                  About
                </p>
                <p className={`${questBody.className} text-xs md:text-base whitespace-pre-line`} style={{ color: NAVY }}>
                  {(event.description || "").replace(/\\n/g, "\n")}
                </p>
              </div>
            </Card>
          )}

          {tab === "rules" && (
            <Card className="p-4 md:p-5">
              <ol className="flex flex-col gap-2">
                {event.rules.map((rule, i) => (
                  <li key={rule} className={`${questBody.className} flex gap-2 text-xs md:text-base`} style={{ color: NAVY }}>
                    <span className="font-bold" style={{ color: PINK }}>
                      {i + 1}.
                    </span>
                    {rule}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {tab === "prizes" && (
            <Card className="p-4 md:p-5">
              <ul
                className="space-y-1 p-3 border-2"
                style={{ borderColor: INK, borderStyle: "dashed", background: "#FFFDF0" }}
              >
                {event.prizes.map((p) => (
                  <li key={p.place} className="flex items-center gap-3 py-1">
                    <Trophy size={18} color={PINK} />
                    <div>
                      <p className={`${questBody.className} text-xs font-bold md:text-base`} style={{ color: NAVY }}>
                        {p.place}
                      </p>
                      <p className={`${questBody.className} text-[11px] opacity-70 md:text-sm`} style={{ color: NAVY }}>
                        {p.reward}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <AppButton onClick={() => openQuest(event.id)} className="w-full py-3.5 text-sm md:text-base">
            Register Now
          </AppButton>
        </div>
      </PageContainer>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${questBody.className} text-xs opacity-70 md:text-base`} style={{ color: NAVY }}>
        {label}
      </span>
      <span className={`${questBody.className} text-xs font-bold md:text-base`} style={{ color: NAVY }}>
        {value}
      </span>
    </div>
  )
}
