"use client"

import * as React from "react"
import { motion } from "motion/react"
import type { ThemeModule } from "../types"
import type { EventId } from "@/content/spectrum"
import { site, events, schedule, highlights, sponsors, contact } from "@/content/spectrum"
import { useReducedMotion } from "../_shared/use-reduced-motion"
import { useRegistration, useRegistrationForm } from "../_shared/registration-context"
import { Section } from "../_shared/section"
import { pad2 } from "../_shared/use-countdown"
import { risoDisplay, risoBody, risoMono } from "./fonts"

// ---- Palette ----
const PAPER = "#FAF7F2"
const INK = "#111111"
const PINK = "#FF48B0"
const BLUE = "#0050FF"

function goRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" })
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
const Background: ThemeModule["Background"] = () => (
  <div aria-hidden className="fixed inset-0 -z-10 bg-[#FAF7F2]">
    <svg className="absolute inset-0 h-full w-full opacity-40 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
)

// ---------------------------------------------------------------------------
// Intro Transition (Tear effect)
// ---------------------------------------------------------------------------
const TearTransition = () => {
  const reduced = useReducedMotion()
  const [visible, setVisible] = React.useState(true)

  if (!visible || reduced) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col cursor-pointer"
      onClick={() => setVisible(false)}
    >
      <motion.div
        className="w-full h-1/2 flex items-end justify-center overflow-hidden bg-[#111111]"
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setVisible(false)}
      >
        <div className="w-[120%] h-[20px] mb-[-10px] rotate-2 bg-[#FAF7F2]" />
      </motion.div>
      <motion.div
        className="w-full h-1/2 flex items-start justify-center overflow-hidden bg-[#111111]"
        initial={{ y: 0 }}
        animate={{ y: "100%" }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-[120%] h-[20px] mt-[-10px] -rotate-2 bg-[#FAF7F2]" />
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Riso Headline (Color offset)
// ---------------------------------------------------------------------------
function RisoHeadline({ text, className = "" }: { text: string; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <div className={`relative ${className}`}>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 whitespace-nowrap text-[#FF48B0] mix-blend-multiply"
        style={{ WebkitTextStroke: `2px ${PINK}` }}
        initial={{ x: 10, y: -5 }}
        whileInView={reduced ? { x: 3, y: -2 } : { x: 3, y: -2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {text}
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 whitespace-nowrap text-[#0050FF] mix-blend-multiply"
        style={{ WebkitTextStroke: `2px ${BLUE}` }}
        initial={{ x: -10, y: 5 }}
        whileInView={reduced ? { x: -3, y: 2 } : { x: -3, y: 2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {text}
      </motion.div>
      <div className="relative whitespace-nowrap text-[#111111] mix-blend-multiply">{text}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Marquee
// ---------------------------------------------------------------------------
function Marquee() {
  const reduced = useReducedMotion()
  const content = `${site.date} ++ ${site.venue} ++ PRIZE POOL ${site.prizePool} ++ `
  return (
    <div className="absolute top-0 left-0 z-10 flex w-full overflow-hidden whitespace-nowrap border-b-4 border-[#111111] bg-[#FFE600] py-2 mix-blend-multiply">
      <motion.div
        className={`${risoMono.className} text-sm font-bold uppercase text-[#111111]`}
        animate={reduced ? undefined : { x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 15, repeat: Infinity }}
      >
        {content}
        {content}
        {content}
        {content}
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dock
// ---------------------------------------------------------------------------
const Dock: ThemeModule["Dock"] = () => {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Events", href: "#events" },
    { label: "Schedule", href: "#schedule" },
    { label: "Sponsors", href: "#sponsors" },
    { label: "Register", href: "#register" },
  ]
  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-[150] flex flex-col justify-center bg-[#FF48B0] px-8 text-[#111111]">
          <h2 className={`${risoDisplay.className} mb-12 text-6xl`}>INDEX</h2>
          <nav className="flex flex-col gap-6 text-4xl font-bold uppercase">
            {navItems.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`${risoDisplay.className} flex items-center gap-4 transition-colors hover:text-white`}
              >
                <span className={`${risoMono.className} text-sm opacity-50`}>{pad2(i + 1)}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <div
        className="fixed inset-x-0 bottom-0 z-[200] flex items-stretch border-t-4 border-[#111111] bg-[#FAF7F2]"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px))" }}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`${risoBody.className} flex w-20 shrink-0 items-center justify-center border-r-4 border-[#111111] bg-[#FFE600] text-xs font-black uppercase text-[#111111]`}
        >
          {menuOpen ? "CLOSE" : "MENU"}
        </button>
        <div className="hidden flex-1 items-center gap-6 overflow-x-auto border-r-4 border-[#111111] px-4 sm:flex">
          {navItems
            .filter((i) => i.label !== "Register")
            .map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`${risoMono.className} text-[11px] font-bold uppercase text-[#111111] hover:opacity-50`}
              >
                {item.label}
              </a>
            ))}
        </div>
        <div className="flex-1 sm:hidden"></div>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false)
            goRegister()
          }}
          className={`${risoDisplay.className} flex min-h-[56px] min-w-[140px] shrink-0 items-center justify-center bg-[#111111] px-6 text-2xl uppercase text-[#FAF7F2]`}
        >
          Register
        </button>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
const Hero: ThemeModule["Hero"] = () => {
  return (
    <>
      <TearTransition />
      <Section id="home" className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden pb-32 pt-24">
        <Marquee />
        <div className="relative z-10 flex flex-col px-4">
          <p className={`${risoMono.className} mb-4 text-xs font-bold uppercase tracking-widest text-[#111111]`}>
            {site.eyebrow}
          </p>
          <RisoHeadline
            text={site.shortName}
            className={`${risoDisplay.className} -ml-[1vw] text-[22vw] uppercase leading-[0.8]`}
          />
          <RisoHeadline
            text={site.version}
            className={`${risoDisplay.className} -ml-[1vw] text-[22vw] uppercase leading-[0.8]`}
          />

          <div className="mt-8 flex w-2/3 flex-col items-start gap-6">
            <p className={`${risoBody.className} text-sm font-bold uppercase tracking-tight text-[#111111]`}>
              {site.tagline} {site.subTagline}
            </p>
            <button
              onClick={goRegister}
              className={`${risoBody.className} border-2 border-[#111111] bg-[#111111] px-6 py-4 text-sm font-black uppercase tracking-widest text-[#FAF7F2] transition-transform hover:scale-105`}
            >
              Accept the challenge
            </button>
          </div>

          <div className="absolute right-2 top-1/2 hidden origin-bottom-right rotate-90 transform sm:block">
            <span className={`${risoMono.className} text-[10px] font-bold uppercase text-[#111111]`}>
              {site.date} /// {site.hostShort}
            </span>
          </div>
        </div>
        {/* Decorative staple */}
        <div className="absolute right-8 top-32 h-6 w-2 rounded-l-sm border-2 border-r-0 border-[#111111] opacity-50" />
      </Section>
    </>
  )
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
const Events: ThemeModule["Events"] = () => {
  const { openRegistration } = useRegistration()
  const [hoverId, setHoverId] = React.useState<string | null>(null)

  return (
    <Section id="events" className="flex flex-col border-t-4 border-[#111111]">
      <div className="border-b-4 border-[#111111] bg-[#FFE600] px-4 py-12">
        <h2 className={`${risoDisplay.className} text-[15vw] uppercase leading-[0.8] text-[#111111]`}>Events</h2>
      </div>
      {events.map((ev) => (
        <div
          key={ev.id}
          className="relative flex flex-col gap-6 overflow-hidden border-b-4 border-[#111111] p-6"
        >
          {/* Large number in background */}
          <div
            className={`${risoDisplay.className} pointer-events-none absolute -right-4 -top-8 text-[40vw] leading-none mix-blend-multiply opacity-20`}
            style={{ color: ev.color }}
          >
            {ev.index}
          </div>

          <div className="relative z-10 flex items-end justify-between">
            <h3 className={`${risoDisplay.className} w-2/3 text-6xl uppercase leading-[0.85] text-[#111111]`}>
              {ev.name}
            </h3>
            <span className={`${risoMono.className} text-xs font-bold text-[#111111]`}>{ev.index}/04</span>
          </div>

          <p className={`${risoBody.className} relative z-10 self-start bg-[#111111] px-2 py-1 text-sm font-black uppercase tracking-widest text-[#FAF7F2]`}>
            {ev.tag}
          </p>
          <p className={`${risoBody.className} relative z-10 w-4/5 text-sm text-[#111111]`}>{ev.description}</p>

          <div className="relative z-10 grid grid-cols-2 gap-4 border-y-2 border-dashed border-[#111111] py-4 text-xs font-bold uppercase text-[#111111]">
            <div>
              <div className="opacity-50">Format</div>
              <div className={`${risoMono.className} mt-1 text-sm`}>{ev.format}</div>
            </div>
            <div>
              <div className="opacity-50">Fee</div>
              <div className={`${risoMono.className} mt-1 text-sm`}>{ev.fee}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              openRegistration(ev.id)
              goRegister()
            }}
            onMouseEnter={() => setHoverId(ev.id)}
            onMouseLeave={() => setHoverId(null)}
            className={`${risoBody.className} mt-2 w-full border-4 border-[#111111] py-4 text-sm font-black uppercase transition-colors`}
            style={{
              background: hoverId === ev.id ? ev.color : PAPER,
              color: INK,
            }}
          >
            Register — {ev.shortName}
          </button>
        </div>
      ))}
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------
const Schedule: ThemeModule["Schedule"] = () => (
  <Section id="schedule" className="flex flex-col gap-12 bg-[#111111] px-4 py-16 text-[#FAF7F2]">
    <h2 className={`${risoDisplay.className} text-[13vw] uppercase leading-[0.8]`}>Timeline</h2>
    <div className={`${risoMono.className} flex flex-col border-t-2 border-[#FAF7F2] text-sm`}>
      {schedule.map((item) => (
        <div key={item.title} className="flex flex-col gap-2 border-b-2 border-[#FAF7F2] py-6">
          <div className="flex justify-between text-xs font-bold text-[#FF48B0]">
            <span className="text-xl">{item.time}</span>
            <span className="uppercase opacity-80">GAT-{pad2(schedule.indexOf(item) + 1)}</span>
          </div>
          <div className={`${risoBody.className} text-3xl font-black uppercase tracking-tight text-[#FAF7F2]`}>
            {item.title}
          </div>
          <div className="w-3/4 text-xs uppercase opacity-70">{item.description}</div>
        </div>
      ))}
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------
const About: ThemeModule["About"] = () => (
  <Section id="about" className="flex flex-col gap-8 border-b-4 border-[#111111] px-4 py-16">
    <h2 className={`${risoDisplay.className} text-[13vw] uppercase leading-[0.8] text-[#111111]`}>
      System<br />Info
    </h2>
    <p className={`${risoBody.className} text-base font-bold text-[#111111]`}>{site.about}</p>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {highlights.map((h, i) => (
        <div
          key={h.title}
          className="flex flex-col gap-2 border-2 border-[#111111] p-4"
          style={{ background: i % 2 === 0 ? PINK : BLUE }}
        >
          <p className={`${risoBody.className} mix-blend-multiply text-sm font-black uppercase text-[#111111]`}>
            {h.title}
          </p>
          <p className={`${risoMono.className} mix-blend-multiply text-xs font-bold text-[#111111] opacity-80`}>
            {h.description}
          </p>
        </div>
      ))}
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// Sponsors
// ---------------------------------------------------------------------------
const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className="flex flex-col gap-8 border-b-4 border-[#111111] bg-[#FAF7F2] px-4 py-16">
    <h2 className={`${risoDisplay.className} text-[13vw] uppercase leading-[0.8] text-[#111111]`}>Backers</h2>
    <div className="flex flex-wrap gap-3">
      {sponsors.map((s) => (
        <div
          key={s.name}
          className={`${risoMono.className} border-2 border-[#111111] bg-[#FFE600] px-4 py-2 text-xs font-bold uppercase text-[#111111]`}
        >
          {s.name}
        </div>
      ))}
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
const Register: ThemeModule["Register"] = () => {
  const { preselectedEvent, submitted, submitting, submit, reset } = useRegistration()
  const { values, setField, isValid } = useRegistrationForm(preselectedEvent)

  if (submitted) {
    return (
      <Section id="register" className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <h2 className={`${risoDisplay.className} text-[12vw] uppercase leading-none text-[#111111]`}>
          Confirmed
        </h2>
        <p className={`${risoBody.className} text-sm font-bold uppercase text-[#111111]`}>
          You&apos;re locked in. Check comms.
        </p>
        <button type="button" onClick={reset} className={`${risoMono.className} mt-4 text-xs font-bold underline text-[#0050FF]`}>
          Register another
        </button>
      </Section>
    )
  }

  return (
    <Section id="register" className="flex flex-col gap-8 px-4 py-16">
      <div className="flex flex-col gap-2">
        <h2 className={`${risoDisplay.className} text-[13vw] uppercase leading-[0.8] text-[#111111]`}>
          Register
        </h2>
        <p className={`${risoMono.className} self-start bg-[#111111] px-2 py-1 text-xs font-bold uppercase text-[#FAF7F2]`}>
          Awaiting Input
        </p>
      </div>

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (isValid) submit(values)
        }}
      >
        <div className="flex flex-col gap-1">
          <label className={`${risoMono.className} text-[10px] font-bold uppercase text-[#111111]`}>01 / Name</label>
          <input
            required
            placeholder="Enter Name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            className={`${risoBody.className} w-full border-b-4 border-[#111111] bg-transparent py-2 text-xl font-black uppercase text-[#111111] outline-none placeholder:text-[#111111]/20 focus:border-[#FF48B0]`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={`${risoMono.className} text-[10px] font-bold uppercase text-[#111111]`}>02 / Email</label>
          <input
            required
            type="email"
            placeholder="Enter Email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            className={`${risoBody.className} w-full border-b-4 border-[#111111] bg-transparent py-2 text-xl font-black uppercase text-[#111111] outline-none placeholder:text-[#111111]/20 focus:border-[#0050FF]`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={`${risoMono.className} text-[10px] font-bold uppercase text-[#111111]`}>03 / Comms</label>
          <input
            required
            type="tel"
            placeholder="Phone Number"
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className={`${risoBody.className} w-full border-b-4 border-[#111111] bg-transparent py-2 text-xl font-black uppercase text-[#111111] outline-none placeholder:text-[#111111]/20 focus:border-[#FF48B0]`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={`${risoMono.className} text-[10px] font-bold uppercase text-[#111111]`}>04 / Affiliation</label>
          <input
            required
            placeholder="College Name"
            value={values.college}
            onChange={(e) => setField("college", e.target.value)}
            className={`${risoBody.className} w-full border-b-4 border-[#111111] bg-transparent py-2 text-xl font-black uppercase text-[#111111] outline-none placeholder:text-[#111111]/20 focus:border-[#0050FF]`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={`${risoMono.className} text-[10px] font-bold uppercase text-[#111111]`}>05 / Directive</label>
          <select
            required
            value={values.eventId}
            onChange={(e) => setField("eventId", e.target.value as EventId)}
            className={`${risoBody.className} w-full appearance-none rounded-none border-b-4 border-[#111111] bg-transparent py-2 text-xl font-black uppercase text-[#111111] outline-none focus:border-[#FF48B0]`}
          >
            <option value="" disabled>Select Target</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className={`${risoDisplay.className} mt-8 border-4 border-[#111111] bg-[#FF48B0] py-6 text-4xl uppercase text-[#111111] transition-transform active:scale-95 disabled:opacity-50`}
        >
          {submitting ? "Processing…" : "Submit"}
        </button>
      </form>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="flex flex-col gap-6 bg-[#FFE600] px-4 py-16 pb-32 text-[#111111]">
    <h2 className={`${risoDisplay.className} text-[13vw] uppercase leading-[0.8]`}>Comms</h2>
    <div className={`${risoMono.className} flex flex-col gap-4 text-xs font-bold uppercase`}>
      <div className="flex flex-col border-b-2 border-[#111111] pb-2">
        <span className="text-[10px] opacity-50">Email</span>
        <span className="mt-1 text-sm">{contact.email}</span>
      </div>
      <div className="flex flex-col border-b-2 border-[#111111] pb-2">
        <span className="text-[10px] opacity-50">Phone</span>
        <span className="mt-1 text-sm">{contact.phone}</span>
      </div>
      <div className="flex flex-col border-b-2 border-[#111111] pb-2">
        <span className="text-[10px] opacity-50">HQ</span>
        <span className="mt-1 text-sm">{contact.location}</span>
      </div>
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------
const Preview: ThemeModule["Preview"] = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border-4 border-[#111111] bg-[#FAF7F2]">
    <div className={`${risoDisplay.className} text-5xl uppercase tracking-tighter text-[#111111] mix-blend-multiply`}>
      RISO
    </div>
    <div className="absolute left-4 top-1/2 h-12 w-12 rounded-full bg-[#FF48B0] opacity-80 mix-blend-multiply" />
    <div className="absolute right-4 top-1/2 h-12 w-12 rounded-full bg-[#0050FF] opacity-80 mix-blend-multiply" />
    <div className={`${risoMono.className} mt-2 text-[10px] font-bold uppercase tracking-widest text-[#111111]`}>
      Art School Drop
    </div>
  </div>
)

const meta: ThemeModule["meta"] = {
  slug: "riso-zine",
  name: "Riso Zine",
  tagline: "Art-school streetwear drop",
  swatch: [PAPER, INK, PINK, BLUE],
  fontDisplay: "--font-riso-display",
  vibe: ["brutalist", "editorial", "loud"],
}

const risoZineTheme: ThemeModule = {
  meta,
  Background,
  Dock,
  Hero,
  Events,
  Schedule,
  About,
  Sponsors,
  Register,
  Contact,
  Preview,
}

export default risoZineTheme
