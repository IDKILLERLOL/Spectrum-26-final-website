"use client"

import * as React from "react"
import Link from "next/link"
import type { SpectrumEvent } from "@/content/spectrum"
import { site } from "@/content/spectrum"
import { Trophy, ArrowRight, X } from "lucide-react"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { useQuest } from "@/components/flagship/quest-context"
import { NAVY, INK, PINK, MUSTARD, VERMILION, hoardingShadow, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { trackEventCardView, trackEventCardClick } from "@/lib/analytics/track"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@radix-ui/react-dialog"

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
  const { openQuest } = useQuest()
  const [selectedEvent, setSelectedEvent] = React.useState<SpectrumEvent | null>(null)

  React.useEffect(() => {
    events.forEach((ev) => trackEventCardView(ev.id, ev.name))
  }, [events])

  const handleRegisterClick = (ev: SpectrumEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    openQuest(ev.id)
  }

  return (
    <>
      <PageHeader title="Events & Prizes" subtitle="Choose your battleground and register now." back={false} />
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <Card
                key={ev.id}
                className="relative flex flex-col justify-between p-5 pt-8 transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                style={{ borderColor: ev.color }}
                onClick={() => {
                  trackEventCardClick(ev.id, ev.name)
                  setSelectedEvent(ev)
                }}
              >
                <StallAwning color={ev.color} />
                <div className="flex items-center justify-between">
                  <span
                    className={`${questDisplay.className} flex size-8 items-center justify-center border-2 text-[10px] text-white`}
                    style={{ background: ev.color, borderColor: INK, boxShadow: softHoardingShadow }}
                  >
                    {ev.index}
                  </span>
                  <span className={`${questBody.className} text-[10px] font-bold uppercase px-2 py-0.5 text-white`} style={{ background: VERMILION }}>
                    Register
                  </span>
                </div>
                <div className="my-3 flex-grow">
                  <p className={`${questBody.className} text-lg font-bold`} style={{ color: NAVY }}>
                    {ev.name}
                  </p>
                  <p className={`${questBody.className} text-xs opacity-60`} style={{ color: NAVY }}>
                    {ev.format} • {ev.fee}
                  </p>
                  {ev.prizePool && (
                    <p className={`${questBody.className} mt-1 text-xs font-bold`} style={{ color: PINK }}>
                      Prize Pool: {ev.prizePool}
                    </p>
                  )}

                  {/* Round by Round details / Description */}
                  <p className={`${questBody.className} mt-4 text-xs leading-relaxed opacity-85`} style={{ color: NAVY }}>
                    {ev.description}
                  </p>

                  {/* Prizes Card inside the Event Card */}
                  {ev.prizes && ev.prizes.length > 0 && (
                    <div className="mt-4">
                      <p className={`${questDisplay.className} text-[10px] uppercase tracking-widest mb-1.5`} style={{ color: VERMILION }}>
                        Prizes
                      </p>
                      <div className="flex flex-col gap-1.5 border-2 border-dashed p-3 bg-[#FFFDF6]" style={{ borderColor: ev.color }}>
                        {ev.prizes.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] font-bold" style={{ color: NAVY }}>
                            <span className={questBody.className}>{p.place}</span>
                            <span className={questDisplay.className} style={{ color: PINK }}>{p.reward}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => handleRegisterClick(ev, e)}
                  className={`${questBody.className} mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-white border-2`}
                  style={{ background: ev.color, borderColor: INK }}
                >
                  Register Now <ArrowRight size={14} />
                </button>
              </Card>
            ))}
          </div>

        </div>
      </PageContainer>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
        <DialogTrigger asChild>
          <>
          </>
        </DialogTrigger>
        <DialogContent className="fixed inset-0 z-50 flex items-center justify-center" aria-hidden={!selectedEvent}>
          <div className="relative w-full max-w-lg sm:max-w-xl p-6 bg-white border-4 shadow-lg" style={{ borderColor: INK }}>
            <div className="mb-4 flex items-center justify-between">
              <DialogTitle className={`${questDisplay.className} text-lg md:text-xl`} style={{ color: NAVY }}>
                {selectedEvent?.name}
              </DialogTitle>
              <DialogClose className="btn-ghost p-1 hover:opacity-75" aria-label="Close">
                <X size={20} style={{ color: NAVY }} />
              </DialogClose>
            </div>
            <DialogDescription className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <span
                  className={`${questDisplay.className} flex size-10 items-center justify-center border-2 text-[12px] text-white`}
                  style={{ background: selectedEvent?.color, borderColor: INK }}
                >
                  {selectedEvent?.index}
                </span>
                <div>
                  <p className={`${questBody.className} text-sm font-bold`} style={{ color: NAVY }}>
                    {selectedEvent?.format} • {selectedEvent?.fee}
                  </p>
                  {selectedEvent?.prizePool && (
                    <p className={`${questBody.className} mt-0.5 text-xs font-bold`} style={{ color: PINK }}>
                      Prize Pool: {selectedEvent?.prizePool}
                    </p>
                  )}
                </div>
              </div>

              <p className={`${questBody.className} text-sm leading-relaxed opacity-90`} style={{ color: NAVY }}>
                {selectedEvent?.description}
              </p>

              {/* Round by Round details */}
              {selectedEvent?.rounds && selectedEvent.rounds.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className={`${questDisplay.className} text-xs uppercase tracking-widest mb-1`} style={{ color: VERMILION }}>
                    Round by Round Details
                  </p>
                  <div className="space-y-3">
                    {selectedEvent.rounds.map((round, idx) => (
                      <div key={idx} className="border border-neutral-300 p-3 bg-neutral-50/50 rounded" style={{ borderColor: INK }}>
                        <p className="font-bold text-xs" style={{ color: NAVY }}>{round.name}</p>
                        <div className="mt-1.5 space-y-1 text-[11px] leading-relaxed opacity-90" style={{ color: INK }}>
                          {round.format && <p><strong>Format:</strong> {round.format}</p>}
                          {round.totalTime && <p><strong>Time:</strong> {round.totalTime}</p>}
                          {round.problemSet && <p><strong>Problems:</strong> {round.problemSet}</p>}
                          {round.setup && <p><strong>Setup:</strong> {round.setup}</p>}
                          {round.gameplay && <p><strong>Gameplay:</strong> {round.gameplay}</p>}
                          {round.structure && round.structure.length > 0 && (
                            <div className="mt-1">
                              <strong>Structure:</strong>
                              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                {round.structure.map((step, sIdx) => (
                                  <li key={sIdx}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules & Rounds details */}
              {selectedEvent?.rules && selectedEvent.rules.length > 0 && (
                <div className="mt-4">
                  <p className={`${questDisplay.className} text-xs uppercase tracking-widest mb-2`} style={{ color: VERMILION }}>
                    Rules & Guidelines
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed" style={{ color: NAVY }}>
                    {selectedEvent.rules.map((rule, idx) => (
                      <li key={idx} className={questBody.className}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prize details split */}
              {selectedEvent?.prizes && selectedEvent.prizes.length > 0 && (
                <div className="mt-4">
                  <p className={`${questDisplay.className} text-xs uppercase tracking-widest mb-2`} style={{ color: VERMILION }}>
                    Prize Split
                  </p>
                  <div className="flex flex-col gap-1.5 border-2 p-3 bg-[#FFFDF6]" style={{ borderColor: INK }}>
                    {selectedEvent.prizes.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-bold" style={{ color: NAVY }}>
                        <span className={questBody.className}>{p.place}</span>
                        <span className={questDisplay.className} style={{ color: PINK }}>{p.reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogDescription>

            {/* Footer with actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t-2 pt-4" style={{ borderColor: INK }}>
              <DialogClose asChild>
                <button
                  type="button"
                  className={`${questBody.className} border-2 px-5 py-2.5 text-xs font-bold uppercase hover:bg-neutral-50`}
                  style={{ borderColor: INK, color: NAVY, background: "#FFFDF6" }}
                >
                  Back
                </button>
              </DialogClose>
              {selectedEvent && (
                <button
                  type="button"
                  onClick={(e) => {
                    setSelectedEvent(null)
                    handleRegisterClick(selectedEvent, e)
                  }}
                  className={`${questBody.className} border-2 px-5 py-2.5 text-xs font-bold uppercase text-white hover:opacity-90 flex items-center gap-1.5`}
                  style={{ background: selectedEvent.color, borderColor: INK }}
                >
                  Register Now <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
