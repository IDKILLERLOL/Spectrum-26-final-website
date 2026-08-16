"use client"

import * as React from "react"
import { MapPin, Navigation } from "lucide-react"
import {
  site,
  venueMapsUrl,
} from "@/content/spectrum"
import type { ScheduleItem } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { SegmentedTabs } from "@/components/flagship/SegmentedTabs"
import {
  NAVY,
  CREAM,
  MARIGOLD,
  VERMILION,
  INK,
  hoardingShadow,
} from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

type TabId = "schedule" | "timeline" | "venue"

const MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.0076211786676!2d72.83446057596001!3d19.106263950325414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9c676018b43%3A0x75f39a04a6217435!2sShri%20Bhagubhai%20Mafatlal%20Polytechnic!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"

/** Hand-chalked timetable on a wooden-framed blackboard */
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
              { id: "venue", label: "Venue & Map" },
            ]}
            active={tab}
            onChange={setTab}
          />

          {tab === "schedule" && (
            <Chalkboard className="md:p-8 flex flex-col items-center justify-center py-16 md:py-24 text-center">
              <h2
                className={`${questDisplay.className} text-4xl md:text-5xl text-white/95 tracking-wide`}
                style={chalkGlow}
              >
                30th September
              </h2>
              <p
                className={`${questBody.className} mt-3 text-sm italic tracking-widest text-white/70 uppercase`}
                style={chalkGlow}
              >
                to be announced soon
              </p>
            </Chalkboard>
          )}

          {tab === "timeline" && (
            <Chalkboard className="md:p-8 flex flex-col items-center justify-center py-16 md:py-24 text-center">
              <h2
                className={`${questDisplay.className} text-4xl md:text-5xl text-white/95 tracking-wide`}
                style={chalkGlow}
              >
                Timeline
              </h2>
              <p
                className={`${questBody.className} mt-3 text-sm italic tracking-widest text-white/70 uppercase`}
                style={chalkGlow}
              >
                to be announced soon
              </p>
            </Chalkboard>
          )}

          {tab === "venue" && (
            <div className="flex flex-col gap-4">
              <div
                className="relative border-4 border-dashed p-4 md:p-5"
                style={{ borderColor: VERMILION, color: NAVY, background: "#FFFDF6", boxShadow: hoardingShadow }}
              >
                <span
                  className={`${questDisplay.className} absolute -top-3 left-3 px-2 text-[10px] uppercase tracking-widest`}
                  style={{ background: CREAM, color: VERMILION }}
                >
                  Official Venue
                </span>
                <p className={`${questDisplay.className} text-base md:text-lg`} style={{ color: NAVY }}>
                  {site.host}
                </p>
                <p className={`${questBody.className} mt-1 text-xs md:text-sm font-bold opacity-80`} style={{ color: NAVY }}>
                  {site.venue}
                </p>
              </div>

              {/* Embedded Google Map */}
              <Card className="flex flex-col p-2 gap-2 overflow-hidden" style={{ borderColor: INK, boxShadow: hoardingShadow }}>
                <div className="flex items-center justify-between px-2 py-1">
                  <span className={`${questDisplay.className} text-xs uppercase tracking-wider flex items-center gap-1.5`} style={{ color: NAVY }}>
                    <MapPin size={14} color={VERMILION} /> Shri Bhagubhai Mafatlal Polytechnic
                  </span>
                  <a
                    href={venueMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${questBody.className} text-[11px] font-bold underline hover:opacity-80 flex items-center gap-1`}
                    style={{ color: VERMILION }}
                  >
                    Open Map <Navigation size={12} />
                  </a>
                </div>
                <div className="relative w-full h-[320px] md:h-[400px] border-2 border-neutral-900 overflow-hidden">
                  <iframe
                    title="Shri Bhagubhai Mafatlal Polytechnic Google Map"
                    src={MAP_EMBED_URL}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </Card>

              <AppButton href={venueMapsUrl} className="w-full py-3.5 text-xs md:text-sm">
                Get Directions on Google Maps ↗
              </AppButton>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  )
}
