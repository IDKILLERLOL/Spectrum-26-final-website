"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  site,
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
} from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { Megaphone } from "lucide-react"

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

/** Strung row of marigold-orange circles along the top edge of the Hero — mela/wedding garland motif. */
function MarigoldGarland() {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex h-10 overflow-hidden opacity-90 pointer-events-none lg:h-12">
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          className="h-8 w-8 flex-shrink-0 rounded-full border-2 -ml-2 first:ml-0 shadow-sm lg:h-10 lg:w-10"
          style={{ background: `radial-gradient(circle, #F4A300 40%, #D97700 80%)`, borderColor: "#A54A00" }}
        />
      ))}
    </div>
  )
}

/** "HORN PLEASE" style infinite ticker — truck-back nostalgia, carries the event date/venue. */
function Marquee() {
  const reduced = useReducedMotion()
  return (
    <div
      className="relative w-full overflow-hidden border-y-4 py-2.5 my-6 lg:py-3"
      style={{ borderColor: INK, background: MUSTARD, color: INK }}
    >
      <motion.div
        className={`${questBody.className} flex whitespace-nowrap text-xs font-bold uppercase tracking-widest lg:text-sm`}
        animate={reduced ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <span className="px-4">
          <>HORN PLEASE <Megaphone size={12} className="inline" /> {site.date} <Megaphone size={12} className="inline" /> {site.venue} <Megaphone size={12} className="inline" />{" "}</>
        </span>
        <span className="px-4">
          <>HORN PLEASE <Megaphone size={12} className="inline" /> {site.date} <Megaphone size={12} className="inline" /> {site.venue} <Megaphone size={12} className="inline" />{" "}</>
        </span>
      </motion.div>
    </div>
  )
}

/** Doordarshan test-pattern colour-bar loader — brief full-bleed overlay on first Hero mount. */
function DdLoader() {
  const reduced = useReducedMotion()
  const [show, setShow] = React.useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => setShow(false), 1500)
    return () => clearTimeout(t)
  }, [])

  if (reduced || !show) return null

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 z-50 flex flex-col pointer-events-none"
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
    <section className="relative overflow-hidden pb-12 pt-16 text-center sm:pt-20 lg:pb-16 min-h-[calc(100dvh-4rem)] flex flex-col justify-center items-center w-full">
      <HeroBackground />
      <MarigoldGarland />
      <DdLoader />

      <motion.div
        className="relative z-10 mx-auto w-[calc(100%-2rem)] max-w-[24rem] border-4 bg-white p-4 sm:p-6 lg:max-w-[46rem] lg:p-9"
        style={{ borderColor: INK, boxShadow: hoardingShadow }}
        animate={reduced ? undefined : { rotate: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-1 left-1 w-4 h-4 border-t-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute top-1 right-1 w-4 h-4 border-t-4 border-r-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-4 border-r-4" style={{ borderColor: VERMILION }} />

        <p className={`${questBody.className} text-[9px] uppercase tracking-[0.25em] sm:text-xs lg:text-sm`} style={{ color: NAVY }}>
          {site.eyebrow}
        </p>
        <h1
          className={`${questDisplay.className} text-3xl sm:text-4xl md:text-5xl lg:text-7xl`}
          style={{ color: NAVY, lineHeight: 1.08, textShadow: `2px 2px 0px ${MUSTARD}, 4px 4px 0px ${INK}` }}
        >
          {site.shortName}
          <br />
          <span style={{ color: PINK }}>{site.version}</span>
        </h1>
        <p className={`${questBody.className} mx-auto mt-3 max-w-md text-xs leading-relaxed sm:text-sm lg:text-lg`} style={{ color: NAVY }}>
          {site.tagline} {site.subTagline}
        </p>

        <Card className="mt-5 grid w-full grid-cols-4 gap-1 p-2.5 sm:gap-2 sm:p-4 text-center lg:mt-7 lg:p-6" style={{ boxShadow: questShadowLg }}>
          <p className={`${questBody.className} col-span-4 mb-2 text-[10px] font-bold uppercase tracking-widest sm:text-xs lg:text-sm`} style={{ color: NAVY }}>
            The Battle Begins In
          </p>
          {[
            ["Days", cd.days],
            ["Hrs", cd.hours],
            ["Min", cd.minutes],
            ["Sec", cd.seconds],
          ].map(([label, value]) => (
            <div key={label as string} className="flex flex-col items-center justify-center">
              <div className={questDisplay.className} style={{ color: NAVY, fontSize: "clamp(1.4rem, 3.5vw, 2.75rem)", lineHeight: 1.1 }}>
                {pad2(value as number)}
              </div>
              <div className={`${questBody.className} mt-1 text-[8px] font-bold uppercase tracking-wider lg:text-xs opacity-75`} style={{ color: NAVY }}>
                {label}
              </div>
            </div>
          ))}
        </Card>
      </motion.div>

      <Marquee />

      <div className="mx-auto mt-6 flex flex-row w-[calc(100%-2rem)] max-w-[24rem] gap-2 sm:gap-3 lg:max-w-[46rem] lg:gap-4">
        <AppButton href="/events" className="flex-1 px-2.5 py-3 text-[10px] xs:text-xs sm:text-sm lg:py-4 lg:text-sm">
          Explore Events
        </AppButton>
        <AppButton href="/schedule" variant="outline" className="flex-1 px-2.5 py-3 text-[10px] xs:text-xs sm:text-sm lg:py-4 lg:text-sm">
          View Schedule
        </AppButton>
      </div>
    </section>
  )
}

/** Mela-stall awning strip that pokes above the top edge of a Featured Event card. */
function EventAwning({ color }: { color: string }) {
  return (
    <div className="absolute -top-3 left-0 right-0 flex h-3" style={{ borderTop: `2px solid ${INK}` }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 border-r-2 border-b-2 rounded-b-sm"
          style={{ backgroundColor: i % 2 === 0 ? color : "#fff", borderColor: INK }}
        />
      ))}
    </div>
  )
}

function FeaturedEvents({ events }: { events: SpectrumEvent[] }) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-12 sm:px-5 md:px-10 lg:gap-7 lg:py-16">
      <h2 className={`${questDisplay.className} text-xl md:text-3xl lg:text-4xl`} style={{ color: NAVY }}>
        Featured Events
      </h2>
      <div className="grid justify-center gap-5 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
        {events.map((ev) => (
          <Link key={ev.id} href={`/register/info?event=${ev.id}`}>
            <Card className="relative w-full max-w-[19rem] overflow-visible p-4 transition-transform hover:-translate-y-1 sm:min-h-[12rem] lg:max-w-[21rem] lg:p-6 xl:min-h-[14rem] cursor-pointer">
              <EventAwning color={ev.color} />
              <div className="flex items-center justify-between">
                <span
                  className={`${questDisplay.className} mb-2 inline-flex size-7 items-center justify-center text-[9px] text-white lg:size-9 lg:text-xs`}
                  style={{ background: ev.color }}
                >
                  {ev.index}
                </span>
                <span className={`${questBody.className} text-[9px] font-bold uppercase px-2 py-0.5 text-white`} style={{ background: VERMILION }}>
                  Register ↗
                </span>
              </div>
              <h3 className={`${questBody.className} text-sm font-bold lg:text-lg`} style={{ color: NAVY }}>
                {ev.name}
              </h3>
              <p className={`${questBody.className} mt-1 text-[11px] opacity-70 lg:text-sm`} style={{ color: NAVY }}>
                {ev.tag}
              </p>
              <p className={`${questBody.className} mt-2 text-[10px] opacity-60 lg:text-xs`} style={{ color: NAVY }}>
                {ev.format}
              </p>
              <p className={`${questBody.className} text-xs font-bold lg:text-sm`} style={{ color: PINK }}>
                {ev.fee}
              </p>
            </Card>
          </Link>
        ))}
      </div>
      <AppButton href="/events" className="w-full py-3 text-xs md:w-auto md:self-center md:px-10 lg:py-4 lg:text-sm">
        View All Events
      </AppButton>
    </section>
  )
}

export function HomePageClient({ events }: { events: SpectrumEvent[] }) {
  return (
    <>
      <Hero />
      <FeaturedEvents events={events} />
    </>
  )
}
