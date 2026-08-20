"use client"

import * as React from "react"
import Link from "next/link"
import type { SpectrumEvent } from "@/content/spectrum"
import { site, EVENT_ROUNDS } from "@/content/spectrum"
import { Trophy, ArrowRight, X } from "lucide-react"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { useQuest } from "@/components/flagship/quest-context"
import { NAVY, INK, PINK, MUSTARD, VERMILION, hoardingShadow, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogPortal, DialogOverlay } from "@radix-ui/react-dialog"

/** Scalloped canvas awning strip — alternating the event's own accent colour with white. */
function StallAwning({ color }: { color: string }) {
  return (
    <div
      className="absolute top-0 left-0 right-0 flex h-3 overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-b-sm border-b-2 border-r-2 last:border-r-0"
          style={{ backgroundColor: i % 2 === 0 ? color : "#fff", borderColor: INK }}
        />
      ))}
    </div>
  )
}

const eventNumbers: Record<string, string> = {
  "dual-debug": "1",
  "tech-duo-1": "1",
  "singularity-strike": "2",
  "tech-solo-1": "2",
  "fifa": "3",
  "non-tech-1": "3",
  "bgmi": "4",
  "non-tech-3": "4",
}

export function EventsPageClient({ events }: { events: SpectrumEvent[] }) {
  const { openQuest } = useQuest()
  const [selectedEvent, setSelectedEvent] = React.useState<SpectrumEvent | null>(null)
  const [openAccordion, setOpenAccordion] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (selectedEvent) {
      setOpenAccordion(null)
    }
  }, [selectedEvent])

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:gap-5">
            {events.map((ev) => {
              const displayNum = eventNumbers[ev.id] || ev.index || "1"
              return (
                <Card
                  key={ev.id}
                  className="relative flex flex-col justify-between p-4 pt-7 transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer border-t-0"
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
                      {displayNum}
                    </span>
                    <span className={`${questBody.className} text-[10px] font-bold uppercase px-2 py-0.5 text-white`} style={{ background: VERMILION }}>
                      Register
                    </span>
                  </div>
                  <div className="my-2 flex-grow">
                    <p className={`${questBody.className} text-base font-bold`} style={{ color: NAVY }}>
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
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRegisterClick(ev, e)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FFFDF6"
                      e.currentTarget.style.color = ev.color
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = ev.color
                      e.currentTarget.style.color = "#FFFFFF"
                    }}
                    className={`${questBody.className} mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-white border-2 transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000]`}
                    style={{ background: ev.color, borderColor: INK, boxShadow: `2px 2px 0px ${INK}` }}
                  >
                    Register Now <ArrowRight size={14} />
                  </button>
                </Card>
              )
            })}
          </div>

        </div>
      </PageContainer>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogPortal>
          {/* Backdrop with liquid blur effect */}
          <DialogOverlay
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedEvent(null)}
          />
          {/* Modal Container: clicking outside card closes modal */}
          <DialogContent
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 outline-none focus:outline-none bg-transparent cursor-pointer"
            aria-hidden={!selectedEvent}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={() => setSelectedEvent(null)}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedEvent(null)
              }
            }}
          >
            {/* Modal Card with Liquid Glass Effect */}
            <div
              className="relative w-full max-w-lg sm:max-w-xl p-6 border-4 max-h-[85vh] flex flex-col cursor-default overflow-hidden backdrop-blur-xl shadow-2xl"
              style={{
                borderColor: INK,
                boxShadow: `8px 8px 0px ${INK}, inset 0 1px 2px rgba(255, 255, 255, 0.9)`,
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.82) 50%, rgba(255, 255, 255, 0.90) 100%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Liquid glass specular highlight */}
              <div
                className="pointer-events-none absolute -top-20 -left-20 h-44 w-80 rotate-12 rounded-full bg-gradient-to-r from-white/50 via-white/20 to-transparent blur-xl"
                aria-hidden="true"
              />
            <div className="mb-4 flex items-center justify-between shrink-0">
              <DialogTitle className={`${questDisplay.className} text-lg md:text-xl`} style={{ color: NAVY }}>
                {selectedEvent?.name}
              </DialogTitle>
              <DialogClose
                className="group flex size-8 items-center justify-center border-2 border-transparent transition-all duration-200 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = INK
                  e.currentTarget.style.boxShadow = `2px 2px 0px ${INK}`
                  if (selectedEvent?.color) e.currentTarget.style.backgroundColor = selectedEvent.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "transparent"
                  e.currentTarget.style.boxShadow = "none"
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
                aria-label="Close"
              >
                <X size={18} className="transition-colors duration-200 group-hover:text-white" style={{ color: NAVY }} />
              </DialogClose>
            </div>
            <DialogDescription className="space-y-4 text-left overflow-y-auto pr-1 flex-1">
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

              <p className={`${questBody.className} text-sm leading-relaxed opacity-90 whitespace-pre-line`} style={{ color: NAVY }}>
                {(() => {
                  const rawDesc = selectedEvent?.description || ""
                  const desc = rawDesc.replace(/\\n/g, "\n")
                  const roundOneIdx = desc.search(/round\s*1/i)
                  if (roundOneIdx !== -1) {
                    return desc.slice(0, roundOneIdx).trim()
                  }
                  return desc
                })()}
              </p>

              {/* Accordion for Rounds & Prizes */}
              <div className="mt-4 space-y-2">
                {(() => {
                  if (!selectedEvent) return null
                  const normalizedId = selectedEvent.id === "tech-duo-1" ? "dual-debug" : (selectedEvent.id === "tech-solo-1" ? "singularity-strike" : selectedEvent.id)
                  const rounds = (selectedEvent as any).rounds && (selectedEvent as any).rounds.length > 0
                    ? (selectedEvent as any).rounds
                    : (EVENT_ROUNDS[normalizedId] || [])
                  return rounds.map((round: { title: string; content: string }, idx: number) => {
                    const isOpen = openAccordion === `round-${idx}`
                    const cleanTitle = (round.title || "").replace(/\\n/g, " ")
                    const cleanContent = (round.content || "").replace(/\\n/g, "\n").trim()
                    return (
                      <div key={idx} className="border-2 bg-white" style={{ borderColor: INK }}>
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(isOpen ? null : `round-${idx}`)}
                          className={`${questDisplay.className} w-full flex items-center justify-between p-3 text-xs uppercase tracking-widest text-left font-bold transition-colors hover:bg-neutral-50`}
                          style={{ color: NAVY }}
                        >
                          <span>{cleanTitle}</span>
                          <span className="text-[10px]">{isOpen ? "▲" : "▼"}</span>
                        </button>
                        {isOpen && (
                          <div className={`${questBody.className} border-t-2 p-3 text-xs leading-relaxed opacity-95 whitespace-pre-line`} style={{ borderColor: INK, color: INK }}>
                            {cleanContent}
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}

                {/* Prizes as the last dropdown */}
                {selectedEvent?.prizes && selectedEvent.prizes.length > 0 && (
                  <div className="border-2 bg-white" style={{ borderColor: INK }}>
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === "prizes" ? null : "prizes")}
                      className={`${questDisplay.className} w-full flex items-center justify-between p-3 text-xs uppercase tracking-widest text-left font-bold transition-colors hover:bg-neutral-50`}
                      style={{ color: NAVY }}
                    >
                      <span>Prizes</span>
                      <span className="text-[10px]">{openAccordion === "prizes" ? "▲" : "▼"}</span>
                    </button>
                    {openAccordion === "prizes" && (
                      <div className={`${questBody.className} border-t-2 p-3 text-xs leading-relaxed opacity-95`} style={{ borderColor: INK, color: INK }}>
                        <div className="flex flex-col gap-1.5 border-2 p-3 bg-[#FFFDF6]" style={{ borderColor: INK }}>
                          {selectedEvent.prizes.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-bold" style={{ color: NAVY }}>
                              <span>{p.place}</span>
                              <span className={questDisplay.className} style={{ color: PINK }}>{p.reward}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Rules & Guidelines */}
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
            </DialogDescription>

            {/* Footer with actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t-2 pt-4 shrink-0" style={{ borderColor: INK }}>
              <DialogClose asChild>
                <button
                  type="button"
                  className={`${questBody.className} border-2 px-5 py-2.5 text-xs font-bold uppercase transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:!bg-[#0A192F] hover:!text-[#FFFDF6] hover:shadow-[4px_4px_0px_#000]`}
                  style={{ borderColor: INK, color: NAVY, background: "#FFFDF6", boxShadow: `2px 2px 0px ${INK}` }}
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
                  onMouseEnter={(e) => {
                    if (selectedEvent?.color) {
                      e.currentTarget.style.backgroundColor = "#FFFDF6"
                      e.currentTarget.style.color = selectedEvent.color
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEvent?.color) {
                      e.currentTarget.style.backgroundColor = selectedEvent.color
                      e.currentTarget.style.color = "#FFFFFF"
                    }
                  }}
                  className={`${questBody.className} border-2 px-5 py-2.5 text-xs font-bold uppercase text-white flex items-center gap-1.5 transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000]`}
                  style={{ background: selectedEvent.color, borderColor: INK, boxShadow: `2px 2px 0px ${INK}` }}
                >
                  Register Now <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
    </>
  )
}
