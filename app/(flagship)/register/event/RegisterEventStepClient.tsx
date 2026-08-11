"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { SpectrumEvent } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { StepProgress } from "@/components/flagship/StepProgress"
import { AppButton } from "@/components/flagship/AppButton"
import { useQuest } from "@/components/flagship/quest-context"
import { INK, TEAL, VERMILION, AGED_PAPER, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { trackFunnelStep } from "@/lib/analytics/track"

const ticketStyle = { background: AGED_PAPER, borderColor: INK, borderWidth: "4px", boxShadow: hoardingShadow }

export function RegisterEventStepClient({ events }: { events: SpectrumEvent[] }) {
  const router = useRouter()
  const { values, selectedEvent, setSelectedEvent } = useQuest()

  React.useEffect(() => {
    trackFunnelStep("event")
  }, [])

  // If arriving pre-selected (openQuest(eventId) skipped straight to Step 1),
  // sync selectedEvent once the event list is available.
  React.useEffect(() => {
    if (values.eventId && !selectedEvent) {
      const match = events.find((e) => e.id === values.eventId)
      if (match) {
        setSelectedEvent({
          id: match.id,
          name: match.name,
          capacity: match.capacity,
          feeNumeric: match.feeNumeric,
          fee: match.fee,
          color: match.color,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.eventId, selectedEvent, events])

  function pick(ev: SpectrumEvent) {
    setSelectedEvent({
      id: ev.id,
      name: ev.name,
      capacity: ev.capacity,
      feeNumeric: ev.feeNumeric,
      fee: ev.fee,
      color: ev.color,
    })
  }

  return (
    <>
      <PageHeader title="Register" />
      <PageContainer width="narrow">
        <StepProgress step={2} />
        <div className="px-5 py-6 md:px-0 md:py-10">
          <div className="p-6 md:p-8" style={ticketStyle}>
            <div className="border-b-4 pb-4 mb-5 flex justify-between items-end md:mb-6" style={{ borderColor: INK }}>
              <div>
                <p className={`${questBody.className} text-[10px] font-bold uppercase tracking-widest md:text-xs`} style={{ color: VERMILION }}>
                  Registration Form
                </p>
                <h2 className={`${questDisplay.className} text-[1.6rem] md:text-2xl`} style={{ color: INK }}>
                  Official Ticket
                </h2>
              </div>
              <div className="text-2xl opacity-30 md:text-3xl" style={{ color: INK }}>No. 50</div>
            </div>

            <p className={`${questBody.className} text-[10px] font-bold uppercase tracking-widest mb-3 md:text-xs`} style={{ color: TEAL }}>
              -- Choose Battle --
            </p>
            <div className="flex flex-col gap-3 md:gap-4">
              {events.map((ev) => {
                const selected = selectedEvent?.id === ev.id
                return (
                  <button key={ev.id} type="button" onClick={() => pick(ev)} className="text-left">
                    <Card
                      className="flex items-center gap-3 p-4 md:gap-4 md:p-5"
                      style={{ borderColor: selected ? ev.color : INK, background: selected ? `${ev.color}1a` : undefined }}
                    >
                      <span
                        className="flex size-6 shrink-0 items-center justify-center border-[2px]"
                        style={{ borderColor: ev.color, background: selected ? ev.color : "transparent" }}
                      />
                      <div>
                        <p className={`${questBody.className} text-sm font-bold md:text-base`} style={{ color: INK }}>
                          {ev.name}
                        </p>
                        <p className={`${questBody.className} text-[11px] opacity-60 md:text-xs`} style={{ color: INK }}>
                          {ev.format} · {ev.fee}
                        </p>
                      </div>
                    </Card>
                  </button>
                )
              })}
            </div>

            <AppButton
              onClick={() => router.push("/register/team")}
              disabled={!selectedEvent}
              className="mt-5 w-full py-3.5 text-sm md:py-4 md:text-base"
            >
              Next
            </AppButton>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
