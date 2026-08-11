"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  site,
  highlights,
  valueProps,
  quickLinks,
  socialLinks,
} from "@/content/spectrum"
import type { SpectrumEvent } from "@/content/spectrum"
import { useCountdown, pad2 } from "@/hooks/use-countdown"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { AppButton } from "@/components/flagship/AppButton"
import { Card } from "@/components/flagship/Card"
import { resolveIcon } from "@/components/flagship/icon-map"
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
import { ChevronRight, Star } from "lucide-react"

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
    <div className="absolute top-0 left-0 right-0 h-8 flex overflow-hidden opacity-90 z-10 pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-8 h-8 rounded-full border-2 -ml-2 first:ml-0 shadow-sm"
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
      className="w-[calc(100%+3rem)] -mx-6 overflow-hidden border-y-4 py-1"
      style={{ borderColor: INK, background: MUSTARD, color: INK }}
    >
      <motion.div
        className={`${questBody.className} flex whitespace-nowrap text-xs font-bold uppercase tracking-widest`}
        animate={reduced ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <span className="px-4">
          HORN PLEASE 📯 {site.date} 📯 {site.venue} 📯{" "}
        </span>
        <span className="px-4">
          HORN PLEASE 📯 {site.date} 📯 {site.venue} 📯{" "}
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
    <section className="relative flex flex-col items-center gap-5 px-6 pb-10 pt-14 text-center overflow-hidden">
      <HeroBackground />
      <MarigoldGarland />
      <DdLoader />

      <motion.div
        className="relative border-4 bg-white p-6 w-full max-w-xs z-10"
        style={{ borderColor: INK, boxShadow: hoardingShadow }}
        animate={reduced ? undefined : { rotate: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-1 left-1 w-4 h-4 border-t-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute top-1 right-1 w-4 h-4 border-t-4 border-r-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-4 border-r-4" style={{ borderColor: VERMILION }} />

        <p className={`${questBody.className} text-xs uppercase tracking-[0.25em]`} style={{ color: NAVY }}>
          {site.eyebrow}
        </p>
        <h1
          className={questDisplay.className}
          style={{ color: NAVY, fontSize: "2.1rem", lineHeight: 1.3, textShadow: `2px 2px 0px ${MUSTARD}, 4px 4px 0px ${INK}` }}
        >
          {site.shortName}
          <br />
          <span style={{ color: PINK }}>{site.version}</span>
        </h1>
        <p className={`${questBody.className} max-w-xs text-sm mx-auto mt-2`} style={{ color: NAVY }}>
          {site.tagline} {site.subTagline}
        </p>

        <Card className="mt-4 grid w-full grid-cols-4 gap-2 p-4 text-center" style={{ boxShadow: questShadowLg }}>
          <p className={`${questBody.className} col-span-4 mb-1 text-[10px] uppercase`} style={{ color: NAVY }}>
            The Battle Begins In
          </p>
          {[
            ["Days", cd.days],
            ["Hrs", cd.hours],
            ["Min", cd.minutes],
            ["Sec", cd.seconds],
          ].map(([label, value]) => (
            <div key={label as string}>
              <div className={questDisplay.className} style={{ color: NAVY, fontSize: "1rem" }}>
                {pad2(value as number)}
              </div>
              <div className={`${questBody.className} text-[9px] uppercase opacity-60`} style={{ color: NAVY }}>
                {label}
              </div>
            </div>
          ))}
        </Card>
      </motion.div>

      <Marquee />

      <div className="flex w-full max-w-xs gap-3">
        <AppButton href="/events" className="flex-1 px-4 py-3.5 text-xs">
          Explore Events
        </AppButton>
        <AppButton href="/schedule" variant="outline" className="flex-1 px-4 py-3.5 text-xs">
          View Schedule
        </AppButton>
      </div>

      <Card className="flex w-full max-w-xs flex-col gap-2 p-4 text-left">
        <Link href="/more/gallery" className="flex items-center justify-between">
          <span className={`${questBody.className} text-xs font-bold`} style={{ color: NAVY }}>
            Epic Rewards Await
          </span>
          <span className={`${questBody.className} text-[10px] underline`} style={{ color: PINK }}>
            View Prizes
          </span>
        </Link>
        <p className={`${questBody.className} text-[11px] opacity-70`} style={{ color: NAVY }}>
          {site.date} · {site.venue}
        </p>
        <p className={`${questBody.className} flex items-center gap-1.5 text-[11px]`} style={{ color: NAVY }}>
          <Star size={12} fill={PINK} color={PINK} /> Unforgettable Memories
        </p>
      </Card>
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
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-10 md:px-10">
      <h2 className={`${questDisplay.className} text-xl md:text-3xl`} style={{ color: NAVY }}>
        Featured Events
      </h2>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pt-3 pb-1 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0">
        {events.map((ev) => (
          <Card key={ev.id} className="relative mt-3 w-44 shrink-0 overflow-visible p-4 md:w-auto">
            <EventAwning color={ev.color} />
            <span
              className={`${questDisplay.className} mb-2 inline-flex size-7 items-center justify-center text-[9px] text-white`}
              style={{ background: ev.color }}
            >
              {ev.index}
            </span>
            <h3 className={`${questBody.className} text-sm font-bold`} style={{ color: NAVY }}>
              {ev.name}
            </h3>
            <p className={`${questBody.className} mt-1 text-[11px] opacity-70`} style={{ color: NAVY }}>
              {ev.tag}
            </p>
            <p className={`${questBody.className} mt-2 text-[10px] opacity-60`} style={{ color: NAVY }}>
              {ev.format}
            </p>
            <p className={`${questBody.className} text-xs font-bold`} style={{ color: PINK }}>
              {ev.fee}
            </p>
          </Card>
        ))}
      </div>
      <AppButton href="/events" className="w-full py-3 text-xs md:w-auto md:self-center md:px-10">
        View All Events
      </AppButton>
    </section>
  )
}

function Highlights() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 py-10 md:px-10">
      <h2 className={`${questDisplay.className} text-xl md:text-3xl`} style={{ color: NAVY }}>
        Highlights
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {highlights.map((h) => (
          <Card key={h.title} className="p-4">
            <p className={`${questBody.className} text-sm font-bold`} style={{ color: NAVY }}>
              {h.title}
            </p>
            <p className={`${questBody.className} text-xs opacity-70`} style={{ color: NAVY }}>
              {h.description}
            </p>
          </Card>
        ))}
      </div>
      <Card className="p-4" style={{ background: NAVY }}>
        <p className={`${questBody.className} text-xs font-bold text-white`}>{site.date}</p>
        <p className={`${questBody.className} text-[11px] opacity-70 text-white`}>{site.venue}</p>
      </Card>
    </section>
  )
}

function WhySpectrum() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 py-10 md:px-10">
      <h2 className={`${questDisplay.className} text-xl md:text-3xl`} style={{ color: NAVY }}>
        Why Spectrum?
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {valueProps.map((v) => (
          <Card key={v.title} className="flex items-center gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center" style={{ background: PINK }}>
              <span className={questDisplay.className} style={{ color: CREAM, fontSize: "0.7rem" }}>
                {v.title[0]}
              </span>
            </span>
            <div>
              <p className={`${questBody.className} text-sm font-bold`} style={{ color: NAVY }}>
                {v.title}
              </p>
              <p className={`${questBody.className} text-xs opacity-70`} style={{ color: NAVY }}>
                {v.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

function QuickLinks() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 py-10 md:px-10">
      <h2 className={`${questDisplay.className} text-xl md:text-3xl`} style={{ color: NAVY }}>
        Quick Links
      </h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {quickLinks.map((link) => {
          const Icon = resolveIcon(link.icon)
          return (
            <Link key={link.label} href={link.href}>
              <Card className="flex items-center gap-3 p-4">
                <Icon size={18} color={PINK} />
                <div className="flex-1">
                  <p className={`${questBody.className} text-sm font-bold`} style={{ color: NAVY }}>
                    {link.label}
                  </p>
                  <p className={`${questBody.className} text-[11px] opacity-70`} style={{ color: NAVY }}>
                    {link.description}
                  </p>
                </div>
                <ChevronRight size={16} color={NAVY} className="opacity-40" />
              </Card>
            </Link>
          )
        })}
      </div>

      <p className={`${questBody.className} mt-2 text-center text-[10px] uppercase tracking-wide opacity-60`} style={{ color: NAVY }}>
        Follow Us
      </p>
      <div className="flex justify-center gap-3">
        {socialLinks.map((s) => {
          const Icon = resolveIcon(s.icon)
          return (
            <a
              key={s.platform}
              href={s.href}
              aria-label={s.platform}
              className="flex size-10 items-center justify-center border-[3px]"
              style={{ borderColor: NAVY, background: CREAM }}
            >
              <Icon size={16} color={NAVY} />
            </a>
          )
        })}
      </div>
    </section>
  )
}

export function HomePageClient({ events }: { events: SpectrumEvent[] }) {
  return (
    <>
      <Hero />
      <FeaturedEvents events={events} />
      <Highlights />
      <WhySpectrum />
      <QuickLinks />
    </>
  )
}
