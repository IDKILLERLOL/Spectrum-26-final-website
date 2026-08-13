"use client"

import * as React from "react"
import { MapPin, Bell } from "lucide-react"
import {
  notifications,
  site,
  venueMapsUrl,
  EVENT_DATE_ISO,
} from "@/content/spectrum"
import type { ScheduleItem } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { SegmentedTabs } from "@/components/flagship/SegmentedTabs"
import {
  NAVY,
  PINK,
  CREAM,
  MARIGOLD,
  VERMILION,
} from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

type TabId = "schedule" | "timeline" | "venue" | "notifications"

/** Hand-chalked timetable on a wooden-framed blackboard — desi-retro schoolroom motif
 *  shared by the Schedule and Timeline panels. */
function Chalkboard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative border-[12px] p-5 shadow-xl ${className}`}
      style={{
        borderColor: "#4A3525",
        background: "#2A3B2A",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
      }}
    >
      <div
        className="absolute -top-3 left-1/2 h-2 w-16 -translate-x-1/2 opacity-80"
        style={{ background: "#3A2515" }}
      />
      {children}
    </div>
  )
}

const chalkGlow = { textShadow: "0 0 2px rgba(255,255,255,0.5)" }

export function SchedulePageClient({ schedule }: { schedule: ScheduleItem[] }) {
  const [tab, setTab] = React.useState<TabId>("schedule")

  return (
    <>
      <PageHeader title="Schedule & Venue" back={false} />
      <PageContainer width="narrow">
        <div className="flex flex-col gap-4 px-5 py-4 md:gap-6 md:py-8">
          <SegmentedTabs<TabId>
            tabs={[
              { id: "schedule", label: "Schedule" },
              { id: "timeline", label: "Timeline" },
              { id: "venue", label: "Venue" },
              { id: "notifications", label: "Alerts" },
            ]}
            active={tab}
            onChange={setTab}
          />

          {tab === "schedule" && (
            <Chalkboard className="md:p-8">
              <p
                className={`${questDisplay.className} mb-3 text-sm tracking-wide text-white/95`}
                style={chalkGlow}
              >
                {site.date}
              </p>
              <div className="flex flex-col gap-3">
                {schedule.map((item, i) => (
                  <div
                    key={item.title}
                    className={`flex items-baseline justify-between gap-3 ${i !== schedule.length - 1 ? "border-b border-dashed border-white/15 pb-3" : ""}`}
                  >
                    <span
                      className={`${questBody.className} shrink-0 text-[11px] font-bold text-white/90`}
                      style={chalkGlow}
                    >
                      {item.time}
                    </span>
                    <div className="flex-1 text-right">
                      <p
                        className={`${questDisplay.className} text-xs text-white/95`}
                        style={chalkGlow}
                      >
                        {item.title}
                      </p>
                      <p
                        className={`${questBody.className} text-[10px] italic text-white/70`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Chalkboard>
          )}

          {tab === "timeline" && (
            <Chalkboard className="md:p-8">
              <ol
                className="flex flex-col gap-5 border-l-[3px] pl-4"
                style={{ borderColor: MARIGOLD }}
              >
                {schedule.map((item) => (
                  <li key={item.title} className="relative">
                    <span
                      className="absolute -left-[22px] top-1 size-3 rounded-full"
                      style={{ background: VERMILION }}
                    />
                    <p
                      className={`${questBody.className} text-xs font-bold`}
                      style={{ color: MARIGOLD }}
                    >
                      {item.time}
                    </p>
                    <p
                      className={`${questDisplay.className} text-sm text-white/95`}
                      style={chalkGlow}
                    >
                      {item.title}
                    </p>
                    <p
                      className={`${questBody.className} text-xs italic text-white/70`}
                    >
                      {item.description}
                    </p>
                  </li>
                ))}
              </ol>
            </Chalkboard>
          )}

          {tab === "venue" && (
            <div className="flex flex-col gap-3 md:gap-4">
              <Card
                className="flex h-40 items-center justify-center"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, #E8E0CC 0 10px, #F5EFE1 10px 20px)",
                }}
              >
                <MapPin size={32} color={PINK} />
              </Card>
              <div
                className="relative border-2 border-dashed p-4"
                style={{ borderColor: VERMILION, color: NAVY }}
              >
                <span
                  className={`${questDisplay.className} absolute -top-3 left-3 px-2 text-[10px] uppercase tracking-widest`}
                  style={{ background: CREAM, color: VERMILION }}
                >
                  Venue Stamp
                </span>
                <p
                  className={`${questDisplay.className} text-sm`}
                  style={{ color: NAVY }}
                >
                  {site.host}
                </p>
                <p
                  className={`${questBody.className} mt-1 text-xs opacity-70`}
                  style={{ color: NAVY }}
                >
                  {site.venue}
                </p>
              </div>
              <AppButton href={venueMapsUrl} className="w-full py-3 text-xs">
                Get Directions
              </AppButton>
            </div>
          )}



          {tab === "notifications" && (
            <div className="flex flex-col gap-3 md:gap-4">
              {notifications.map((n) => (
                <Card
                  key={n.title}
                  className="relative flex items-start gap-3 p-4 pt-5"
                >
                  <span
                    className="absolute -top-2 -left-2 flex size-6 shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      background: MARIGOLD,
                      borderColor: NAVY,
                      boxShadow: `1px 1px 0px ${NAVY}`,
                    }}
                  >
                    <Bell size={12} color={NAVY} fill={NAVY} />
                  </span>
                  <div>
                    <p
                      className={`${questDisplay.className} text-xs`}
                      style={{ color: NAVY }}
                    >
                      {n.title}
                    </p>
                    <p
                      className={`${questBody.className} text-[11px] opacity-70`}
                      style={{ color: NAVY }}
                    >
                      {n.body}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </>
  )
}
