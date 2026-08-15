"use client"

import * as React from "react"
import type { ThemeModule } from "../types"
import type { EventId } from "@/content/spectrum"
import { site, events, schedule, highlights, sponsors, contact } from "@/content/spectrum"
import { useCountdown, pad2 } from "../_shared/use-countdown"
import { useReducedMotion } from "../_shared/use-reduced-motion"
import { useRegistration, useRegistrationForm } from "../_shared/registration-context"
import { Section } from "../_shared/section"
import { termMono } from "./fonts"
import { BLACK, GREEN, GREEN_DIM, AMBER, WHITE, RED } from "./palette"
import { asciiBanner } from "./ascii"
import { useTypewriter, useRevealTypewriter } from "./hooks"
import { TerminalStyles, Cursor, PromptRow, SectionHeading, TermPanel, TermButton, DifficultyBar, TermField } from "./TermUI"
import Background from "./Background"

function goRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function RegisterCTA({
  eventId,
  children = "[ register ]",
  className = "",
  variant = "primary",
}: {
  eventId?: EventId
  children?: React.ReactNode
  className?: string
  variant?: "primary" | "secondary"
}) {
  const { openRegistration } = useRegistration()
  return (
    <TermButton
      variant={variant}
      onClick={() => {
        openRegistration(eventId)
        goRegister()
      }}
      className={className}
    >
      {children}
    </TermButton>
  )
}

// ---------------------------------------------------------------------------
// Dock — persistent bottom bar: plain tap-menu (secondary) + Register (primary)
// ---------------------------------------------------------------------------
const Dock: ThemeModule["Dock"] = () => {
  const tabs = [
    { label: "events", href: "#events" },
    { label: "schedule", href: "#schedule" },
    { label: "sponsors", href: "#sponsors" },
    { label: "contact", href: "#contact" },
  ]
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch gap-2 border-t px-3 pt-2"
      style={{
        background: BLACK,
        borderColor: GREEN_DIM,
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.6)",
      }}
    >
      <nav className={`${termMono.className} flex flex-1 items-center justify-around gap-1 overflow-x-auto text-[10px] uppercase tracking-wide`}>
        {tabs.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 px-1.5 active:opacity-70"
            style={{ color: `${GREEN}cc` }}
          >
            <span aria-hidden style={{ color: AMBER }}>
              ~/
            </span>
            {t.label}
          </a>
        ))}
      </nav>
      <RegisterCTA className="my-1.5 flex min-h-[56px] shrink-0 items-center justify-center px-5 text-xs tracking-wide">
        [ register ]
      </RegisterCTA>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero — ssh connect + boot sequence (skippable, never blocks Dock), ASCII
// banner, Register CTA above the fold, countdown, command-palette nav.
// ---------------------------------------------------------------------------
const BOOT_LINES = ["ssh spectrum@sbmp.edu", "connection established", "[ok] events  [ok] schedule  [ok] register"]

function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const { openRegistration } = useRegistration()
  const links = [
    { label: "events", href: "#events" },
    { label: "schedule", href: "#schedule" },
    { label: "sponsors", href: "#sponsors" },
  ]
  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="text-left">
        <PromptRow>
          help{open ? "_" : ""}
          {!open && <Cursor className="ml-1 text-xs" />}
        </PromptRow>
      </button>
      {open && (
        <div className="term-fade-in mt-2 flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`${termMono.className} min-h-11 border px-3 py-2 text-[11px] uppercase tracking-wide leading-7`}
              style={{ borderColor: GREEN_DIM, color: GREEN }}
            >
              {l.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              openRegistration()
              goRegister()
            }}
            className={`${termMono.className} min-h-11 border px-3 py-2 text-[11px] uppercase tracking-wide`}
            style={{ borderColor: AMBER, color: AMBER }}
          >
            register
          </button>
        </div>
      )}
    </div>
  )
}

const Hero: ThemeModule["Hero"] = () => {
  const cd = useCountdown()
  const reduced = useReducedMotion()
  const bootText = React.useMemo(() => BOOT_LINES.join("\n"), [])
  const boot = useTypewriter(bootText, { cps: 70 })
  const [showNote, setShowNote] = React.useState(false)
  const banner = React.useMemo(() => asciiBanner(site.shortName), [])
  const urgent = !cd.isPast && cd.days === 0

  React.useEffect(() => {
    if (!boot.done) return
    const t = setTimeout(() => setShowNote(true), 450)
    return () => clearTimeout(t)
  }, [boot.done])

  return (
    <Section id="home" className="flex flex-col gap-5 px-5 pb-40 pt-14">
      <button type="button" onClick={boot.skip} className="text-left" aria-label="Skip connection sequence">
        <TermPanel label="tty0" className="px-3 py-2.5">
          <pre className={`${termMono.className} whitespace-pre-wrap break-words text-[11px] leading-relaxed`} style={{ color: GREEN }}>
            {boot.output}
            {!boot.done && <Cursor className="text-xs" />}
          </pre>
          {!boot.done && (
            <p className={`${termMono.className} mt-1 text-[9px] uppercase tracking-wide opacity-50`} style={{ color: GREEN }}>
              tap to skip
            </p>
          )}
        </TermPanel>
      </button>

      {showNote && (
        <p aria-hidden className={`${termMono.className} term-fade-in text-[10px] leading-relaxed opacity-60`} style={{ color: AMBER }}>
          stderr: no real systems were harmed — 100% themed vibes
        </p>
      )}

      <div className="overflow-x-auto">
        <pre
          aria-label={`${site.shortName} ${site.version}`}
          className={termMono.className}
          style={{
            color: GREEN,
            fontSize: "clamp(11px, 4.2vw, 17px)",
            lineHeight: 1.15,
            textShadow: `0 0 10px ${GREEN}55`,
          }}
        >
          {banner.join("\n")}
        </pre>
        <p className={`${termMono.className} mt-1.5 text-sm font-bold tracking-[0.25em]`} style={{ color: AMBER }}>
          v{site.version} // ROOT ACCESS
        </p>
      </div>

      <p className={`${termMono.className} max-w-xs text-sm leading-relaxed`} style={{ color: GREEN }}>
        {site.tagline} <span style={{ color: WHITE }}>{site.subTagline}</span>
      </p>

      <RegisterCTA className="w-full py-4 text-sm">./register --start</RegisterCTA>

      <p className={`${termMono.className} text-xs leading-relaxed`} style={{ color: GREEN }}>
        <span style={{ color: AMBER }}>date</span> {site.date} <span className="opacity-50">·</span>{" "}
        <span style={{ color: AMBER }}>venue</span> {site.venue}
      </p>

      <TermPanel label="countdown.sh" tone={urgent ? RED : GREEN} className="p-4">
        <PromptRow color={urgent ? RED : GREEN}>./countdown --to=spectrum</PromptRow>
        {cd.isPast ? (
          <p className={`${termMono.className} mt-3 text-sm font-bold`} style={{ color: AMBER }}>
            [ LIVE ] the battle has begun
          </p>
        ) : (
          <>
            <div className="mb-3 mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                ["days", cd.days],
                ["hrs", cd.hours],
                ["min", cd.minutes],
                ["sec", cd.seconds],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className={`${termMono.className} text-xl font-bold tabular-nums`} style={{ color: urgent ? RED : GREEN }}>
                    {pad2(value as number)}
                  </div>
                  <div className={`${termMono.className} text-[9px] uppercase opacity-60`} style={{ color: urgent ? RED : GREEN }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-1.5 w-full overflow-hidden" style={{ background: `${GREEN}1a` }}>
              <div
                className={reduced ? "" : "transition-[width] duration-1000 ease-linear"}
                style={{ width: `${(cd.seconds / 60) * 100}%`, height: "100%", background: urgent ? RED : GREEN }}
              />
            </div>
            <p className={`${termMono.className} mt-2 text-[10px] uppercase tracking-wide opacity-50`} style={{ color: urgent ? RED : GREEN }}>
              {urgent ? "// final countdown — go go go" : "time until doors open"}
            </p>
          </>
        )}
      </TermPanel>

      <CommandPalette />
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Events — `ls /events` listing, accordion detail, per-event Register
// ---------------------------------------------------------------------------
const Events: ThemeModule["Events"] = () => {
  const [openId, setOpenId] = React.useState<string | null>(null)
  return (
    <Section id="events" className="flex flex-col gap-5 px-5 py-20">
      <SectionHeading command="ls /events" />
      <p className={`${termMono.className} -mt-2 text-xs opacity-60`} style={{ color: GREEN }}>
        {events.length} entries — tap a file to inspect
      </p>
      <div className="flex flex-col gap-3">
        {events.map((ev) => {
          const open = openId === ev.id
          return (
            <TermPanel key={ev.id} tone={open ? AMBER : GREEN} className="p-0">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : ev.id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left"
                aria-expanded={open}
              >
                <div className="min-w-0">
                  <p className={`${termMono.className} truncate text-[10px] uppercase tracking-wide opacity-60`} style={{ color: AMBER }}>
                    {ev.index}_{ev.id}.evt
                  </p>
                  <p className={`${termMono.className} truncate text-sm font-bold`} style={{ color: GREEN }}>
                    {ev.name}
                  </p>
                  <p className={`${termMono.className} truncate text-xs opacity-70`} style={{ color: GREEN }}>
                    {ev.tag}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`${termMono.className} text-[11px] font-bold`} style={{ color: AMBER }}>
                    {ev.fee}
                  </p>
                  <DifficultyBar level={ev.difficulty} />
                </div>
              </button>

              {open && (
                <div className="term-fade-in space-y-3 border-t px-4 py-4 text-xs" style={{ borderColor: GREEN_DIM, color: GREEN }}>
                  <p className="leading-relaxed opacity-90">{ev.description}</p>
                  <p className="opacity-60">
                    format: {ev.format} · team: {ev.teamSize}
                  </p>
                  <p className="opacity-60">registration closes {ev.registrationEnds}</p>
                  <div>
                    <p className="mb-1" style={{ color: AMBER }}>
                      rules:
                    </p>
                    <ul className="space-y-1 pl-1">
                      {ev.rules.map((r) => (
                        <li key={r} className="flex gap-2">
                          <span style={{ color: AMBER }}>{">"}</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1" style={{ color: AMBER }}>
                      prizes:
                    </p>
                    <ul className="space-y-1 pl-1">
                      {ev.prizes.map((p) => (
                        <li key={p.place} className="flex justify-between gap-2">
                          <span>{p.place}</span>
                          <span className="opacity-80">{p.reward}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="px-4 pb-4 pt-3">
                <RegisterCTA eventId={ev.id} variant={open ? "primary" : "secondary"} className="w-full py-3 text-xs">
                  ./register --event={ev.id}
                </RegisterCTA>
              </div>
            </TermPanel>
          )
        })}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Schedule — `cat schedule.txt`
// ---------------------------------------------------------------------------
const Schedule: ThemeModule["Schedule"] = () => (
  <Section id="schedule" className="flex flex-col gap-5 px-5 py-20">
    <SectionHeading command="cat schedule.txt" />
    <TermPanel label="schedule.txt" className="p-0">
      {schedule.map((item, i) => (
        <div
          key={item.title}
          className="flex gap-4 px-4 py-3.5"
          style={{ borderTop: i === 0 ? "none" : `1px dashed ${GREEN_DIM}` }}
        >
          <span className={`${termMono.className} w-[4.5rem] shrink-0 text-[11px] font-bold`} style={{ color: AMBER }}>
            {item.time}
          </span>
          <div>
            <p className={`${termMono.className} text-sm font-bold`} style={{ color: GREEN }}>
              {item.title}
            </p>
            <p className={`${termMono.className} text-xs opacity-70`} style={{ color: GREEN }}>
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </TermPanel>
    <TermPanel label="venue" className="px-4 py-3.5">
      <p className={`${termMono.className} text-xs leading-relaxed`} style={{ color: GREEN }}>
        {site.venue}
      </p>
    </TermPanel>
  </Section>
)

// ---------------------------------------------------------------------------
// About — `cat about.md` (reveal-on-scroll typewriter) + highlights + prize bar
// ---------------------------------------------------------------------------
function PrizePoolBar() {
  const reduced = useReducedMotion()
  return (
    <TermPanel label="prize_pool.sh" className="px-4 py-3.5">
      <PromptRow>./prize_pool.sh --total</PromptRow>
      <div className="mt-2.5 h-2 w-full overflow-hidden" style={{ background: `${GREEN}1a` }}>
        <div className={reduced ? "" : "term-bar-fill"} style={{ width: "100%", height: "100%", background: AMBER }} />
      </div>
      <p className={`${termMono.className} mt-2 text-sm font-bold`} style={{ color: AMBER }}>
        {site.prizePool} total payout
      </p>
    </TermPanel>
  )
}

const About: ThemeModule["About"] = () => {
  const reveal = useRevealTypewriter<HTMLPreElement>(site.about, 90)
  return (
    <Section id="about" className="flex flex-col gap-5 px-5 py-20">
      <SectionHeading command="cat about.md" />
      <TermPanel label="about.md" className="px-4 py-3.5">
        <pre ref={reveal.ref} className={`${termMono.className} whitespace-pre-wrap text-xs leading-relaxed`} style={{ color: GREEN }}>
          {reveal.output}
          {!reveal.done && <Cursor className="text-xs" />}
        </pre>
      </TermPanel>

      <div className="grid grid-cols-2 gap-3">
        {highlights.map((h) => (
          <TermPanel key={h.title} className="px-3 py-3">
            <p className={`${termMono.className} text-xs font-bold`} style={{ color: AMBER }}>
              {h.title}
            </p>
            <p className={`${termMono.className} mt-1 text-[11px] leading-relaxed opacity-70`} style={{ color: GREEN }}>
              {h.description}
            </p>
          </TermPanel>
        ))}
      </div>

      <PrizePoolBar />
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Sponsors — `ls -la /sponsors`
// ---------------------------------------------------------------------------
const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className="flex flex-col gap-5 px-5 py-20">
    <SectionHeading command="ls -la /sponsors" />
    <TermPanel label="sponsors" className="p-0">
      {sponsors.map((s, i) => (
        <div key={s.name} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i === 0 ? "none" : `1px dashed ${GREEN_DIM}` }}>
          <span className={`${termMono.className} text-[10px] opacity-50`} style={{ color: GREEN }}>
            drwxr-xr-x
          </span>
          <span className={`${termMono.className} text-sm font-bold`} style={{ color: GREEN }}>
            {s.name}
          </span>
        </div>
      ))}
    </TermPanel>
  </Section>
)

// ---------------------------------------------------------------------------
// Register — `./register --event=<id>`, config-file-styled form (5 fields)
// ---------------------------------------------------------------------------
const Register: ThemeModule["Register"] = () => {
  const { preselectedEvent, submitted, submitting, submit, reset } = useRegistration()
  const { values, setField, isValid } = useRegistrationForm(preselectedEvent)

  const inputStyle: React.CSSProperties = {
    background: "transparent",
    color: WHITE,
    border: "none",
    outline: "none",
    width: "100%",
  }

  if (submitted) {
    return (
      <Section id="register" className="flex flex-col items-center justify-center gap-4 px-5 py-20 text-center">
        <TermPanel label="register.log" className="w-full max-w-sm px-5 py-6 text-left">
          <PromptRow>./register --event={values.eventId || "?"}</PromptRow>
          <p className={`${termMono.className} mt-2 text-xs`} style={{ color: GREEN }}>
            submitting...
          </p>
          <p className={`${termMono.className} mt-1 text-sm font-bold`} style={{ color: AMBER }}>
            [ OK ] registration confirmed
          </p>
          <p className={`${termMono.className} mt-1 text-xs leading-relaxed opacity-70`} style={{ color: GREEN }}>
            ticket saved — check your email for details.
          </p>
        </TermPanel>
        <button type="button" onClick={reset} className={`${termMono.className} text-xs underline opacity-60`} style={{ color: GREEN }}>
          $ ./register --reset
        </button>
      </Section>
    )
  }

  return (
    <Section id="register" className="flex flex-col gap-5 px-5 py-20">
      <SectionHeading command={`./register --event=${values.eventId || "<select>"}`} />
      <TermPanel label="register.conf" className="px-4 py-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (isValid) submit(values)
          }}
        >
          <TermField label="name">
            <input
              required
              placeholder="jane_doe"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              className={`${termMono.className} text-sm`}
              style={inputStyle}
            />
          </TermField>
          <TermField label="email">
            <input
              required
              type="email"
              placeholder="jane@college.edu"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              className={`${termMono.className} text-sm`}
              style={inputStyle}
            />
          </TermField>
          <TermField label="phone">
            <input
              required
              type="tel"
              placeholder="98765 43210"
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className={`${termMono.className} text-sm`}
              style={inputStyle}
            />
          </TermField>
          <TermField label="college">
            <input
              required
              placeholder="your college"
              value={values.college}
              onChange={(e) => setField("college", e.target.value)}
              className={`${termMono.className} text-sm`}
              style={inputStyle}
            />
          </TermField>
          <TermField label="event">
            <select
              required
              value={values.eventId}
              onChange={(e) => setField("eventId", e.target.value as EventId)}
              className={`${termMono.className} text-sm`}
              style={inputStyle}
            >
              <option value="">choose --event</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </TermField>

          <TermButton type="submit" disabled={!isValid || submitting} className="mt-1 w-full py-3.5 text-sm">
            {submitting ? "submitting..." : "[ execute ./register ]"}
          </TermButton>
        </form>
      </TermPanel>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Contact — `cat contact.txt`
// ---------------------------------------------------------------------------
const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="flex flex-col gap-5 px-5 py-20 pb-36">
    <SectionHeading command="cat contact.txt" />
    <TermPanel label="contact.txt" className="px-4 py-3.5">
      <div className={`${termMono.className} space-y-2 text-xs leading-relaxed`} style={{ color: GREEN }}>
        <p>
          <span style={{ color: AMBER }}>email</span>&nbsp;&nbsp;&nbsp; : {contact.email}
        </p>
        <p>
          <span style={{ color: AMBER }}>phone</span>&nbsp;&nbsp;&nbsp; : {contact.phone}
        </p>
        <p>
          <span style={{ color: AMBER }}>location</span> : {contact.location}
        </p>
      </div>
    </TermPanel>
  </Section>
)

// ---------------------------------------------------------------------------
// Preview — LIVE animated miniature, self-contained (own styles)
// ---------------------------------------------------------------------------
const Preview: ThemeModule["Preview"] = () => (
  <div className="relative flex h-full w-full flex-col justify-center gap-2 overflow-hidden px-4 py-4" style={{ background: BLACK }}>
    <TerminalStyles />
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)",
        mixBlendMode: "multiply",
      }}
    />
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.6) 100%)" }}
    />
    <div className={termMono.className} style={{ color: GREEN, fontSize: "11px", lineHeight: 1.6 }}>
      <p>$ whoami</p>
      <p>root@spectrum</p>
      <p>
        $ ./run --world=terminal
        <Cursor className="ml-0.5" />
      </p>
    </div>
    <p className={`${termMono.className} mt-2 text-[11px] font-bold uppercase tracking-widest`} style={{ color: AMBER }}>
      Root Access
    </p>
    <p className={`${termMono.className} text-[10px] opacity-60`} style={{ color: GREEN }}>
      Hacker terminal session
    </p>
  </div>
)

const meta: ThemeModule["meta"] = {
  slug: "terminal",
  name: "Root Access",
  tagline: "Hacker terminal session",
  swatch: ["#050705", "#4AF626", "#FFB000", "#FFFFFF"],
  fontDisplay: "--font-terminal-display",
  vibe: ["terminal", "mono", "boot"],
}

const terminalTheme: ThemeModule = {
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

export default terminalTheme
