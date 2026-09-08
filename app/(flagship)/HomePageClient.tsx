"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  site,
  EVENT_ROUNDS,
} from "@/content/spectrum"
import type { SpectrumEvent } from "@/content/spectrum"
import { useCountdown, pad2 } from "@/hooks/use-countdown"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { AppButton } from "@/components/flagship/AppButton"
import { Card } from "@/components/flagship/Card"
import {
  CREAM,
  NAVY,
  PINK,
  GREEN,
  SKY,
  questShadowLg,
  MUSTARD,
  VERMILION,
  INK,
  hoardingShadow,
  softHoardingShadow,
} from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogPortal, DialogOverlay } from "@radix-ui/react-dialog"
import { Trophy, ArrowRight, X, ChevronDown, Megaphone } from "lucide-react"
import { useQuest } from "@/components/flagship/quest-context"

function renderRuleText(rule: string) {
  if (!rule) return null
  if (rule.includes("**")) {
    const parts = rule.split(/(\*\*.*?\*\*)/g)
    return (
      <>
        {parts.map((part, idx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={idx} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            )
          }
          return part
        })}
      </>
    )
  }
  return rule
}

function HeroBackground() {
  const reduced = useReducedMotion()
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden" style={{ background: SKY }}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent 0 6px, rgba(255,255,255,.35) 6px 7px)",
        }}
      />
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute size-[3px] bg-white"
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 23) % 35}%` }}
          animate={reduced ? undefined : { opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      <motion.div
        className="absolute -left-8 top-14 h-20 w-36"
        style={{ background: GREEN, clipPath: "polygon(10% 0,90% 10%,100% 60%,70% 100%,0 80%)" }}
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-6 top-32 h-14 w-24 opacity-90"
        style={{ background: "#5AA548", clipPath: "polygon(15% 0,100% 15%,85% 100%,0 70%)" }}
        animate={reduced ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: `linear-gradient(180deg, transparent, ${CREAM})` }} />
    </div>
  )
}


/** "HORN PLEASE" style infinite ticker — truck-back nostalgia, carries the event date/venue. */
function Marquee() {
  const reduced = useReducedMotion()
  const content = (
    <>HORN PLEASE <Megaphone size={12} className="inline" /> {site.date} <Megaphone size={12} className="inline" /> {site.venue} <Megaphone size={12} className="inline" />{" "}</>
  )
  return (
    <div className="w-full mt-4 mb-0 flex flex-col items-center">
      {/* Top sawtooth border */}
      <div className="w-full h-2.5 flex overflow-hidden pointer-events-none" style={{ background: CREAM }}>
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-full flex-shrink-0"
            style={{
              background: i % 2 === 0 ? VERMILION : MUSTARD,
              clipPath: "polygon(50% 100%, 0 0, 100% 0)",
            }}
          />
        ))}
      </div>

      <div
        className="relative w-full overflow-hidden border-y-4 py-2.5 lg:py-3"
        style={{ borderColor: INK, background: MUSTARD, color: INK }}
      >
        <motion.div
          className={`${questBody.className} flex whitespace-nowrap text-xs font-bold uppercase tracking-widest lg:text-sm`}
          animate={reduced ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="px-8">
              {content}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom sawtooth border (inverted pointing up) */}
      <div className="w-full h-2.5 flex overflow-hidden pointer-events-none" style={{ background: CREAM }}>
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-full flex-shrink-0"
            style={{
              background: i % 2 === 0 ? VERMILION : MUSTARD,
              clipPath: "polygon(50% 0, 0 100%, 100% 100%)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

/** Doordarshan test-pattern colour-bar loader — brief full-bleed overlay on first Hero mount. */
function DdLoader() {
  const reduced = useReducedMotion()
  const [show, setShow] = React.useState(true)
  const [dimensions, setDimensions] = React.useState({ width: "100vw", height: "100vh" })

  React.useEffect(() => {
    const t = setTimeout(() => setShow(false), 1500)
    if (typeof window !== "undefined") {
      setDimensions({
        width: `${window.screen.availWidth}px`,
        height: `${window.screen.availHeight}px`
      })
    }
    return () => clearTimeout(t)
  }, [])

  if (reduced || !show) return null

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 z-[60] flex flex-col pointer-events-none"
      style={{ width: dimensions.width, height: dimensions.height }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 1.4, times: [0, 0.8, 1] }}
    >
      <div className="flex h-4/5 w-full">
        {["#FFFFFF", "#F2B705", "#8FD3F4", "#6FBF5B", "#8B6FD9", "#C7382F", "#242150"].map((c) => (
          <div key={c} className="flex-1 h-full" style={{ background: c }} />
        ))}
      </div>
      <div className="flex h-1/5 w-full">
        <div className="flex-1 bg-black" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-black" />
        <div className="flex-1 bg-white" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,.6) 0 1px, transparent 1px 2px), repeating-linear-gradient(90deg, rgba(0,0,0,.4) 0 1px, transparent 1px 3px)",
        }}
      />
    </motion.div>
  )
}

function Hero() {
  const cd = useCountdown()
  const reduced = useReducedMotion()
  return (
    <section className="relative overflow-hidden pb-6 pt-6 text-center sm:pb-8 sm:pt-10 lg:pb-10 flex flex-col justify-center items-center w-full">
      <HeroBackground />
      <DdLoader />

      <motion.div
        className="relative z-10 mx-auto w-[calc(100%-1.5rem)] max-w-[26rem] border-4 bg-white p-8 min-h-[540px] flex flex-col justify-center gap-7 sm:p-6 sm:min-h-0 sm:block lg:max-w-[46rem] lg:p-9"
        style={{ borderColor: INK, boxShadow: hoardingShadow }}
        animate={reduced ? undefined : { rotate: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-1 left-1 w-4 h-4 border-t-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute top-1 right-1 w-4 h-4 border-t-4 border-r-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-4 border-r-4" style={{ borderColor: VERMILION }} />

        <div>
          <p className={`${questBody.className} text-xs uppercase tracking-[0.25em] sm:text-xs lg:text-sm`} style={{ color: NAVY }}>
            {site.eyebrow}
          </p>
          <h1
            className={`${questDisplay.className} text-5xl sm:text-4xl md:text-5xl lg:text-7xl mt-3 sm:mt-1`}
            style={{ color: NAVY, lineHeight: 1.08, textShadow: `2px 2px 0px ${MUSTARD}, 4px 4px 0px ${INK}` }}
          >
            {site.shortName}
            <br />
            <span style={{ color: PINK }}>{site.version}</span>
          </h1>
          <p className={`${questBody.className} mx-auto mt-4 sm:mt-3 max-w-md text-base leading-relaxed sm:text-sm lg:text-lg`} style={{ color: NAVY }}>
            {site.tagline} {site.subTagline}
          </p>
        </div>

        <Card className="mt-7 sm:mt-5 grid w-full grid-cols-4 gap-1 p-2.5 sm:gap-2 sm:p-4 text-center lg:mt-7 lg:p-6" style={{ boxShadow: questShadowLg }}>
          <p className={`${questBody.className} col-span-4 mb-2 text-xs font-bold uppercase tracking-widest sm:text-[10px] lg:text-sm`} style={{ color: NAVY }}>
            The Battle Begins In
          </p>
          {[
            ["Days", cd.days],
            ["Hrs", cd.hours],
            ["Min", cd.minutes],
            ["Sec", cd.seconds],
          ].map(([label, value]) => (
            <div key={label as string} className="flex flex-col items-center justify-center">
              <div className={questDisplay.className} style={{ color: NAVY, fontSize: "clamp(2rem, 3.5vw, 2.75rem)", lineHeight: 1.1 }}>
                {pad2(value as number)}
              </div>
              <div className={`${questBody.className} mt-1 text-[10px] font-bold uppercase tracking-wider sm:text-[8px] lg:text-xs opacity-75`} style={{ color: NAVY }}>
                {label}
              </div>
            </div>
          ))}
        </Card>

        {/* Buttons now moved inside the Hero card */}
        <div className="mt-8 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-3 w-full">
          <AppButton href="/events" className="flex-1 w-full py-4 text-base sm:py-3 sm:text-[10px] xs:sm:text-xs lg:py-4 lg:text-sm">
            Explore Events
          </AppButton>
          <AppButton href="/schedule" variant="outline" className="flex-1 w-full py-4 text-base sm:py-3 sm:text-[10px] xs:sm:text-xs lg:py-4 lg:text-sm">
            View Schedule
          </AppButton>
        </div>
      </motion.div>
    </section>
  )
}

/** Mela-stall awning strip that pokes above the top edge of a Featured Event card. */
function EventAwning({ color }: { color: string }) {
  return (
    <div
      className="absolute top-0 left-0 right-0 flex h-3 overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-b-sm border-b-2 border-r-2 last:border-r-0"
          style={{ backgroundColor: i % 2 === 0 ? color : "#fff", borderColor: INK }}
        />
      ))}
    </div>
  )
}

function FeaturedEvents({
  events,
  onEventClick,
  onRegisterClick,
}: {
  events: SpectrumEvent[]
  onEventClick: (ev: SpectrumEvent) => void
  onRegisterClick: (ev: SpectrumEvent, e: React.MouseEvent) => void
}) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-12 sm:px-5 md:px-10 lg:gap-7 lg:py-16">
      <h2 className={`${questDisplay.className} text-xl md:text-3xl lg:text-4xl`} style={{ color: NAVY }}>
        Featured Events
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:gap-5">
        {events.map((ev) => (
          <div key={ev.id} onClick={() => onEventClick(ev)} className="block">
            <Card
              className="relative flex flex-col justify-between p-5 pt-8 min-h-[260px] sm:p-4 sm:pt-7 sm:min-h-0 transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer h-full border-t-0"
              style={{ borderColor: ev.color }}
            >
              <EventAwning color={ev.color} />
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
              <div className="my-3">
                <p className={`${questBody.className} text-base font-bold`} style={{ color: NAVY }}>
                  {ev.name}
                </p>
                <p className={`${questBody.className} text-xs opacity-70`} style={{ color: NAVY }}>
                  {ev.tag}
                </p>
                <p className={`${questBody.className} mt-1 text-xs opacity-60`} style={{ color: NAVY }}>
                  {ev.format} • {ev.fee}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => onRegisterClick(ev, e)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFDF6"
                  e.currentTarget.style.color = ev.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = ev.color
                  e.currentTarget.style.color = "#FFFFFF"
                }}
                className={`${questBody.className} flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold text-white border-2 transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] cursor-pointer`}
                style={{ background: ev.color, borderColor: INK, boxShadow: `2px 2px 0px ${INK}` }}
              >
                Register Now →
              </button>
            </Card>
          </div>
        ))}
      </div>
      <AppButton href="/events" className="w-full py-3 text-xs md:w-auto md:self-center md:px-10 lg:py-4 lg:text-sm">
        View All Events
      </AppButton>
    </section>
  )
}

export function HomePageClient({ events }: { events: SpectrumEvent[] }) {
  const { openQuest } = useQuest()
  const [selectedEvent, setSelectedEvent] = React.useState<SpectrumEvent | null>(null)
  const [openAccordion, setOpenAccordion] = React.useState<string | null>(null)

  const handleRegisterClick = (ev: SpectrumEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    openQuest(ev.id)
  }

  return (
    <>
      <Marquee />
      <Hero />
      <FeaturedEvents events={events} onEventClick={setSelectedEvent} onRegisterClick={handleRegisterClick} />

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
            {/* Event Details Modal Card */}
            <div
              className="relative w-full max-w-lg sm:max-w-xl p-6 bg-white border-4 max-h-[85vh] flex flex-col cursor-default"
              style={{ borderColor: INK, boxShadow: `8px 8px 0px ${INK}` }}
              onClick={(e) => e.stopPropagation()}
            >
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
                        <li key={idx} className={questBody.className}>{renderRuleText(rule)}</li>
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
