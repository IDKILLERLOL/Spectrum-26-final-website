"use client"

import * as React from "react"
import { motion } from "motion/react"
import type { ThemeModule } from "../types"
import type { EventId } from "@/content/spectrum"
import { site, events, schedule, highlights, sponsors, contact } from "@/content/spectrum"
import { useCountdown, pad2 } from "../_shared/use-countdown"
import { useReducedMotion } from "../_shared/use-reduced-motion"
import { useRegistration, useRegistrationForm } from "../_shared/registration-context"
import { Section } from "../_shared/section"
import { pixelDisplay, pixelBody } from "./fonts"

// ---- Palette ----
const CREAM = "#F5EFE1"
const NAVY = "#242150"
const PINK = "#EC4B8C"
const GREEN = "#6FBF5B"
const SKY = "#8FD3F4"

const pixelShadow = "3px 3px 0 " + NAVY
const pixelShadowLg = "5px 5px 0 " + NAVY

function goRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function PixelButton({
  eventId,
  className = "",
  children,
  variant = "solid",
}: {
  eventId?: EventId
  className?: string
  children: React.ReactNode
  variant?: "solid" | "outline"
}) {
  const { openRegistration } = useRegistration()
  const [pressed, setPressed] = React.useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        openRegistration(eventId)
        goRegister()
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={`${pixelBody.className} relative border-[3px] font-bold uppercase tracking-wide transition-transform ${className}`}
      style={{
        borderColor: NAVY,
        background: variant === "solid" ? PINK : CREAM,
        color: variant === "solid" ? CREAM : NAVY,
        boxShadow: pressed ? "1px 1px 0 " + NAVY : pixelShadow,
        transform: pressed ? "translate(2px, 2px)" : "translate(0,0)",
      }}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Background — parallax floating-island sky, pixelated, honours reduced motion
// ---------------------------------------------------------------------------
const Background: ThemeModule["Background"] = () => {
  const reduced = useReducedMotion()
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden" style={{ background: SKY }}>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 6px, rgba(255,255,255,.35) 6px 7px)",
          imageRendering: "pixelated",
        }}
      />
      {/* stars / twinkle dots */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute size-[3px] bg-white"
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 29) % 40}%`, imageRendering: "pixelated" }}
          animate={reduced ? undefined : { opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      {/* floating islands, 3 depths */}
      <motion.div
        className="absolute -left-10 top-16 h-24 w-40"
        style={{ background: GREEN, clipPath: "polygon(10% 0,90% 10%,100% 60%,70% 100%,0 80%)" }}
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-20px] top-40 h-16 w-28 opacity-90"
        style={{ background: "#5AA548", clipPath: "polygon(15% 0,100% 15%,85% 100%,0 70%)" }}
        animate={reduced ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: `linear-gradient(180deg, transparent, ${CREAM})` }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dock — persistent bottom bar: pixel tab nav (secondary) + Register (primary)
// ---------------------------------------------------------------------------
const Dock: ThemeModule["Dock"] = () => {
  const tabs = ["Home", "Events", "Schedule", "Sponsors"]
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch gap-2 border-t-[3px] px-2 pt-2"
      style={{
        background: NAVY,
        borderColor: NAVY,
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <nav className={`${pixelBody.className} flex flex-1 items-center justify-around text-[10px] uppercase text-white/70`}>
        {tabs.map((t) => (
          <a key={t} href={`#${t.toLowerCase()}`} className="flex flex-col items-center gap-1 py-1 transition-colors active:text-white">
            <span className="size-2" style={{ background: PINK }} />
            {t}
          </a>
        ))}
      </nav>
      <PixelButton className="my-1 flex h-14 min-w-[124px] shrink-0 items-center justify-center rounded-none px-4 text-sm">
        Register
      </PixelButton>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
const Hero: ThemeModule["Hero"] = () => {
  const cd = useCountdown()
  return (
    <Section id="home" className="flex flex-col items-center justify-center gap-5 px-6 pb-32 pt-20 text-center">
      <p className={`${pixelBody.className} text-xs uppercase tracking-[0.25em]`} style={{ color: NAVY }}>
        {site.eyebrow}
      </p>
      <h1 className={pixelDisplay.className} style={{ color: NAVY, fontSize: "2.1rem", lineHeight: 1.3 }}>
        {site.shortName}
        <br />
        <span style={{ color: PINK }}>{site.version}</span>
      </h1>
      <p className={`${pixelBody.className} max-w-xs text-sm`} style={{ color: NAVY }}>
        {site.tagline} {site.subTagline}
      </p>

      <PixelButton className="mt-2 px-8 py-4 text-sm">Explore Events</PixelButton>

      <div
        className="mt-2 grid w-full max-w-xs grid-cols-4 gap-2 border-[3px] p-4"
        style={{ borderColor: NAVY, background: CREAM, boxShadow: pixelShadowLg }}
      >
        <p className={`${pixelBody.className} col-span-4 mb-1 text-[10px] uppercase`} style={{ color: NAVY }}>
          The Battle Begins In
        </p>
        {[
          ["Days", cd.days],
          ["Hrs", cd.hours],
          ["Min", cd.minutes],
          ["Sec", cd.seconds],
        ].map(([label, value]) => (
          <div key={label as string}>
            <div className={pixelDisplay.className} style={{ color: NAVY, fontSize: "1rem" }}>
              {pad2(value as number)}
            </div>
            <div className={`${pixelBody.className} text-[9px] uppercase opacity-60`} style={{ color: NAVY }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <p className={`${pixelBody.className} text-xs`} style={{ color: NAVY }}>
        {site.date} · {site.venue}
      </p>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Events — numbered quest cards
// ---------------------------------------------------------------------------
const Events: ThemeModule["Events"] = () => {
  const [openId, setOpenId] = React.useState<string | null>(null)
  return (
    <Section id="events" className="flex flex-col gap-5 px-5 py-16">
      <h2 className={pixelDisplay.className} style={{ color: NAVY, fontSize: "1.4rem" }}>
        Events Arena
      </h2>
      <p className={`${pixelBody.className} -mt-3 text-sm`} style={{ color: NAVY }}>
        Choose your battleground.
      </p>
      {events.map((ev) => (
        <div
          key={ev.id}
          className="border-[3px] p-4"
          style={{ borderColor: NAVY, background: CREAM, boxShadow: pixelShadow }}
        >
          <button type="button" className="flex w-full items-start justify-between text-left" onClick={() => setOpenId(openId === ev.id ? null : ev.id)}>
            <div className="flex gap-3">
              <span
                className={`${pixelDisplay.className} flex size-8 shrink-0 items-center justify-center text-[10px] text-white`}
                style={{ background: ev.color }}
              >
                {ev.index}
              </span>
              <div>
                <h3 className={`${pixelBody.className} text-base font-bold`} style={{ color: NAVY }}>
                  {ev.name}
                </h3>
                <p className={`${pixelBody.className} text-xs opacity-70`} style={{ color: NAVY }}>
                  {ev.tag}
                </p>
              </div>
            </div>
            <div className={`${pixelBody.className} shrink-0 text-right text-[11px]`} style={{ color: NAVY }}>
              <div className="opacity-60">{ev.format}</div>
              <div className="font-bold">{ev.fee}</div>
            </div>
          </button>
          {openId === ev.id && (
            <div className={`${pixelBody.className} mt-3 space-y-2 border-t-[3px] pt-3 text-xs`} style={{ borderColor: NAVY, color: NAVY }}>
              <p>{ev.description}</p>
              <ul className="list-disc space-y-1 pl-4 opacity-80">
                {ev.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <ul className="space-y-1 opacity-80">
                {ev.prizes.map((p) => (
                  <li key={p.place}>
                    {p.place}: {p.reward}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <PixelButton eventId={ev.id} className="mt-3 w-full py-2.5 text-xs">
            Register — {ev.shortName}
          </PixelButton>
        </div>
      ))}
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------
const Schedule: ThemeModule["Schedule"] = () => (
  <Section id="schedule" className="flex flex-col gap-5 px-5 py-16">
    <h2 className={pixelDisplay.className} style={{ color: NAVY, fontSize: "1.4rem" }}>
      Event Timeline
    </h2>
    <ol className="space-y-5 border-l-[3px] pl-4" style={{ borderColor: PINK }}>
      {schedule.map((item) => (
        <li key={item.title} className="relative">
          <span className="absolute -left-[22px] top-1 size-3" style={{ background: PINK }} />
          <p className={`${pixelBody.className} text-xs font-bold`} style={{ color: PINK }}>
            {item.time}
          </p>
          <p className={`${pixelBody.className} text-sm font-bold`} style={{ color: NAVY }}>
            {item.title}
          </p>
          <p className={`${pixelBody.className} text-xs opacity-70`} style={{ color: NAVY }}>
            {item.description}
          </p>
        </li>
      ))}
    </ol>
    <div className="border-[3px] p-4" style={{ borderColor: NAVY, background: CREAM, boxShadow: pixelShadow }}>
      <p className={`${pixelBody.className} text-xs font-bold`} style={{ color: NAVY }}>
        {site.venue}
      </p>
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------
const About: ThemeModule["About"] = () => (
  <Section id="about" className="flex flex-col gap-5 px-5 py-16">
    <h2 className={pixelDisplay.className} style={{ color: NAVY, fontSize: "1.4rem" }}>
      About {site.name}
    </h2>
    <p className={`${pixelBody.className} text-sm`} style={{ color: NAVY }}>
      {site.about}
    </p>
    <div className="grid grid-cols-2 gap-3">
      {highlights.map((h) => (
        <div key={h.title} className="border-[3px] p-3" style={{ borderColor: NAVY, background: CREAM, boxShadow: pixelShadow }}>
          <p className={`${pixelBody.className} text-sm font-bold`} style={{ color: NAVY }}>
            {h.title}
          </p>
          <p className={`${pixelBody.className} text-xs opacity-70`} style={{ color: NAVY }}>
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
  <Section id="sponsors" className="flex flex-col gap-5 px-5 py-16">
    <h2 className={pixelDisplay.className} style={{ color: NAVY, fontSize: "1.4rem" }}>
      Our Sponsors
    </h2>
    <div className="flex flex-col gap-2">
      {sponsors.map((s) => (
        <div key={s.name} className={`${pixelBody.className} border-[3px] px-4 py-3 text-sm font-bold`} style={{ borderColor: NAVY, background: CREAM, color: NAVY, boxShadow: pixelShadow }}>
          {s.name}
        </div>
      ))}
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// Register — Quest Board
// ---------------------------------------------------------------------------
const Register: ThemeModule["Register"] = () => {
  const { preselectedEvent, submitted, submitting, submit, reset } = useRegistration()
  const { values, setField, isValid } = useRegistrationForm(preselectedEvent)
  const inputStyle: React.CSSProperties = { borderColor: NAVY, color: NAVY, background: CREAM }

  if (submitted) {
    return (
      <Section id="register" className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
        <h2 className={pixelDisplay.className} style={{ color: NAVY, fontSize: "1.2rem" }}>
          Quest Accepted!
        </h2>
        <p className={`${pixelBody.className} text-sm`} style={{ color: NAVY }}>
          You&apos;re set for the battle. Check your email for details.
        </p>
        <button type="button" onClick={reset} className={`${pixelBody.className} mt-2 text-xs underline opacity-60`} style={{ color: NAVY }}>
          Register another
        </button>
      </Section>
    )
  }

  return (
    <Section id="register" className="flex flex-col gap-4 px-5 py-16">
      <h2 className={pixelDisplay.className} style={{ color: NAVY, fontSize: "1.4rem" }}>
        Quest Board
      </h2>
      <p className={`${pixelBody.className} -mt-2 text-sm`} style={{ color: NAVY }}>
        Join the ultimate battle and become a legend.
      </p>
      <form
        className={`${pixelBody.className} flex flex-col gap-3`}
        onSubmit={(e) => {
          e.preventDefault()
          if (isValid) submit(values)
        }}
      >
        <input required placeholder="Full Name" value={values.name} onChange={(e) => setField("name", e.target.value)} className="border-[3px] px-4 py-3 text-sm outline-none" style={inputStyle} />
        <input required type="email" placeholder="Email Address" value={values.email} onChange={(e) => setField("email", e.target.value)} className="border-[3px] px-4 py-3 text-sm outline-none" style={inputStyle} />
        <input required type="tel" placeholder="Phone Number" value={values.phone} onChange={(e) => setField("phone", e.target.value)} className="border-[3px] px-4 py-3 text-sm outline-none" style={inputStyle} />
        <input required placeholder="College Name" value={values.college} onChange={(e) => setField("college", e.target.value)} className="border-[3px] px-4 py-3 text-sm outline-none" style={inputStyle} />
        <select required value={values.eventId} onChange={(e) => setField("eventId", e.target.value as EventId)} className="border-[3px] px-4 py-3 text-sm outline-none" style={inputStyle}>
          <option value="">Select Event</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="mt-2 border-[3px] py-3.5 text-sm font-bold uppercase disabled:opacity-40"
          style={{ borderColor: NAVY, background: PINK, color: CREAM, boxShadow: pixelShadow }}
        >
          {submitting ? "Submitting…" : "Accept Quest"}
        </button>
      </form>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="flex flex-col gap-3 px-5 py-16 pb-32">
    <h2 className={pixelDisplay.className} style={{ color: NAVY, fontSize: "1.4rem" }}>
      Get In Touch
    </h2>
    <div className={`${pixelBody.className} space-y-1 text-sm`} style={{ color: NAVY }}>
      <p>{contact.email}</p>
      <p>{contact.phone}</p>
      <p>{contact.location}</p>
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// Preview — live World Select miniature
// ---------------------------------------------------------------------------
const Preview: ThemeModule["Preview"] = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden" style={{ background: SKY }}>
    <motion.div
      className="absolute left-4 top-6 h-8 w-16"
      style={{ background: GREEN, clipPath: "polygon(10% 0,90% 10%,100% 60%,70% 100%,0 80%)" }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    <p className={pixelDisplay.className} style={{ color: NAVY, fontSize: "0.85rem" }}>
      Pixel Quest
    </p>
    <p className={`${pixelBody.className} text-xs`} style={{ color: NAVY }}>
      16-bit floating-castle RPG
    </p>
    <div className="mt-1 flex gap-1">
      {[CREAM, NAVY, PINK, GREEN].map((c) => (
        <span key={c} className="size-3 border" style={{ background: c, borderColor: NAVY }} />
      ))}
    </div>
  </div>
)

const meta: ThemeModule["meta"] = {
  slug: "pixel-quest",
  name: "Pixel Quest",
  tagline: "16-bit floating-castle RPG",
  swatch: [CREAM, NAVY, PINK, GREEN],
  fontDisplay: "--font-pixel-quest-display",
  vibe: ["16-bit", "quest", "cozy"],
}

const pixelQuestTheme: ThemeModule = {
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

export default pixelQuestTheme
