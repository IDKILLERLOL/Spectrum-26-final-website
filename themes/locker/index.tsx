"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import type { ThemeModule } from "../types"
import type { EventId, SpectrumEvent } from "@/content/spectrum"
import {
  site,
  events,
  schedule,
  highlights,
  sponsors,
  contact,
} from "@/content/spectrum"
import { useCountdown, pad2 } from "../_shared/use-countdown"
import { useReducedMotion } from "../_shared/use-reduced-motion"
import {
  useRegistration,
  useRegistrationForm,
} from "../_shared/registration-context"
import { Section } from "../_shared/section"
import { lockerDisplay, lockerStat, lockerBody } from "./fonts"

// ---- Palette ----
const PURPLE = "#4A2472"
const YELLOW = "#F2B705"
const GUNMETAL = "#2A2D34"
const CREAM = "#F5F0E1"
const SPRAY_BLACK = "#1A1A1A"
const DARK_PURPLE = "#2E1550"

// ---- Shadows — offset, soft, physically lit ----
const physicalShadow = "4px 5px 12px rgba(0,0,0,0.45)"
const tapeShadow = "2px 2px 6px rgba(0,0,0,0.25)"
const metalShadow = "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)"

// ---- Card rotations — fixed per event, slightly "messy" ----
const NOTE_ROTATIONS = [-2.5, 1.8, -1.2, 3.1] as const

function goRegister() {
  document
    .getElementById("register")
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}

// ---- Masking tape corner ----
function TapeCorner({
  position,
  color = "rgba(255,255,255,0.45)",
}: {
  position: "tl" | "tr" | "bl" | "br"
  color?: string
}) {
  const pos: React.CSSProperties =
    position === "tl"
      ? { top: -6, left: -6, transform: "rotate(-8deg)" }
      : position === "tr"
        ? { top: -6, right: -6, transform: "rotate(12deg)" }
        : position === "bl"
          ? { bottom: -6, left: -6, transform: "rotate(6deg)" }
          : { bottom: -6, right: -6, transform: "rotate(-10deg)" }

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute z-10"
      style={{
        ...pos,
        width: 32,
        height: 14,
        background: color,
        borderRadius: 1,
        boxShadow: tapeShadow,
        opacity: 0.75,
      }}
    />
  )
}

// ---- "Notebook paper" wrapper — ruled lines + torn edge ----
function NotebookPaper({
  children,
  className = "",
  style,
  rotation = 0,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  rotation?: number
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: CREAM,
        transform: `rotate(${rotation}deg)`,
        boxShadow: physicalShadow,
        backgroundImage:
          "repeating-linear-gradient(transparent 0px, transparent 27px, rgba(180,180,220,0.35) 27px, rgba(180,180,220,0.35) 28px)",
        backgroundSize: "100% 28px",
        backgroundPosition: "0 12px",
        ...style,
      }}
    >
      {/* Red margin line */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[28px] w-[1px]"
        style={{ background: "rgba(220,80,80,0.3)" }}
      />
      {children}
    </div>
  )
}

// ---- Spray paint splatter decoration ----
function SpraySplatter({
  color = YELLOW,
  size = 60,
  style,
}: {
  color?: string
  size?: number
  style?: React.CSSProperties
}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute opacity-40"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(ellipse at 40% 35%, ${color} 0%, ${color}88 30%, transparent 65%)`,
        filter: "blur(2px)",
        ...style,
      }}
    />
  )
}

// ---- Spray-paint text reveal (heading) ----
function SprayHeading({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.h2
      className={`${lockerDisplay.className} ${className}`}
      style={{
        color: YELLOW,
        fontSize: "1.6rem",
        lineHeight: 1.3,
        textShadow: `2px 2px 8px ${PURPLE}`,
      }}
      initial={reduced ? undefined : { clipPath: "inset(0 100% 0 0)" }}
      whileInView={reduced ? undefined : { clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.h2>
  )
}

// ---- Register button (locker-themed) ----
function LockerRegisterButton({
  eventId,
  className = "",
  children,
  variant = "primary",
}: {
  eventId?: EventId
  className?: string
  children: React.ReactNode
  variant?: "primary" | "secondary"
}) {
  const { openRegistration } = useRegistration()
  return (
    <button
      type="button"
      onClick={() => {
        openRegistration(eventId)
        goRegister()
      }}
      className={`${lockerDisplay.className} relative border-2 font-bold uppercase tracking-wider transition-all active:scale-95 ${className}`}
      style={{
        borderColor: variant === "primary" ? YELLOW : PURPLE,
        background: variant === "primary" ? YELLOW : "transparent",
        color: variant === "primary" ? SPRAY_BLACK : YELLOW,
        boxShadow:
          variant === "primary"
            ? `0 0 20px ${YELLOW}66, ${physicalShadow}`
            : tapeShadow,
        minHeight: 44,
      }}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Background — brushed metal with scratches, spray splatters
// ---------------------------------------------------------------------------
const Background: ThemeModule["Background"] = () => {
  const reduced = useReducedMotion()
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: `linear-gradient(175deg, ${GUNMETAL} 0%, ${SPRAY_BLACK} 40%, ${DARK_PURPLE} 100%)`,
      }}
    >
      {/* Brushed metal grain */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)",
        }}
      />
      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%)",
          backgroundSize: "4px 4px",
        }}
      />
      {/* Spray splatters */}
      <SpraySplatter
        color={PURPLE}
        size={200}
        style={{ top: "5%", right: "-40px" }}
      />
      <SpraySplatter
        color={YELLOW}
        size={120}
        style={{ top: "25%", left: "-20px" }}
      />
      <SpraySplatter
        color={PURPLE}
        size={160}
        style={{ bottom: "15%", right: "10%" }}
      />
      <SpraySplatter
        color={YELLOW}
        size={90}
        style={{ bottom: "40%", left: "30%" }}
      />
      {/* Scratch marks */}
      {!reduced &&
        Array.from({ length: 6 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute"
            style={{
              width: 1,
              height: 40 + i * 15,
              background: `rgba(255,255,255,0.04)`,
              left: `${15 + i * 16}%`,
              top: `${10 + i * 12}%`,
              transform: `rotate(${-30 + i * 10}deg)`,
            }}
            animate={{ opacity: [0.02, 0.06, 0.02] }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dock — locker vent nav (secondary) + Register (primary)
// ---------------------------------------------------------------------------
const Dock: ThemeModule["Dock"] = () => {
  const [ventOpen, setVentOpen] = React.useState(false)
  const tabs = ["Home", "Events", "Schedule", "Sponsors"]

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col"
      style={{
        background: GUNMETAL,
        borderTop: `3px solid ${PURPLE}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Expanded vent menu */}
      <AnimatePresence>
        {ventOpen && (
          <motion.nav
            className={`${lockerBody.className} flex items-center justify-around border-b border-white/10 px-2`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 48, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {tabs.map((t) => (
              <a
                key={t}
                href={`#${t.toLowerCase()}`}
                onClick={() => setVentOpen(false)}
                className="flex items-center gap-1.5 py-2 text-sm font-bold transition-colors"
                style={{ color: "rgba(255,255,255,0.65)", minHeight: 44 }}
              >
                {t}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
      {/* Main dock row */}
      <div className="flex items-stretch gap-2 px-3 py-1.5">
        {/* Vent toggle (secondary) */}
        <button
          type="button"
          onClick={() => setVentOpen(!ventOpen)}
          className="flex flex-1 flex-col items-center justify-center gap-[3px] py-1"
          style={{ minHeight: 56 }}
          aria-label="Toggle navigation"
        >
          {/* Vent slats */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block rounded-sm"
              style={{
                width: 28,
                height: 3,
                background: ventOpen
                  ? YELLOW
                  : "rgba(255,255,255,0.35)",
                transformOrigin: "center",
              }}
              animate={
                ventOpen
                  ? i === 0
                    ? { rotate: 45, y: 6 }
                    : i === 1
                      ? { opacity: 0 }
                      : { rotate: -45, y: -6 }
                  : { rotate: 0, y: 0, opacity: 1 }
              }
              transition={{ duration: 0.2 }}
            />
          ))}
          <span
            className={`${lockerBody.className} mt-0.5 text-[10px] font-bold`}
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            MENU
          </span>
        </button>
        {/* Primary Register CTA */}
        <LockerRegisterButton className="my-0.5 flex h-14 min-w-[140px] shrink-0 items-center justify-center px-5 text-sm">
          Register Now
        </LockerRegisterButton>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero — locker door that "swings open"
// ---------------------------------------------------------------------------
const Hero: ThemeModule["Hero"] = () => {
  const cd = useCountdown()
  const reduced = useReducedMotion()
  const [doorOpen, setDoorOpen] = React.useState(false)

  React.useEffect(() => {
    if (reduced) {
      setDoorOpen(true)
      return
    }
    const timer = setTimeout(() => setDoorOpen(true), 800)
    return () => clearTimeout(timer)
  }, [reduced])

  return (
    <Section
      id="home"
      className="relative flex flex-col items-center justify-center gap-4 overflow-hidden px-5 pb-36 pt-16 text-center"
    >
      {/* Locker door swing-open overlay */}
      <AnimatePresence>
        {!doorOpen && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{
              background: GUNMETAL,
              transformOrigin: "left center",
              perspective: "1200px",
            }}
            initial={{ rotateY: 0 }}
            exit={{ rotateY: -95, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.7, ease: "easeInOut" }}
          >
            {/* Locker surface detail */}
            <div className="flex flex-col items-center gap-3">
              {/* Vent slats */}
              <div className="flex flex-col gap-1.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-sm"
                    style={{
                      width: 80,
                      height: 4,
                      background: "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>
              <p
                className={`${lockerDisplay.className} text-lg`}
                style={{ color: YELLOW }}
              >
                {site.shortName}
              </p>
              {/* Skip button */}
              <button
                type="button"
                onClick={() => setDoorOpen(true)}
                className={`${lockerBody.className} text-sm underline`}
                style={{ color: "rgba(255,255,255,0.5)", minHeight: 44 }}
              >
                Tap to open →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eyebrow */}
      <p
        className={`${lockerBody.className} text-base font-bold uppercase tracking-[0.2em]`}
        style={{ color: `${YELLOW}aa` }}
      >
        {site.eyebrow}
      </p>

      {/* Title — spray-painted */}
      <h1
        className={lockerDisplay.className}
        style={{
          color: YELLOW,
          fontSize: "2.6rem",
          lineHeight: 1.15,
          textShadow: `3px 3px 15px ${PURPLE}`,
          transform: "rotate(-1.5deg)",
        }}
      >
        {site.shortName}
        <br />
        <span style={{ color: CREAM, fontSize: "2rem" }}>{site.version}</span>
      </h1>

      {/* Tagline on torn paper */}
      <NotebookPaper
        rotation={1.2}
        className="mx-auto max-w-xs px-10 py-3"
      >
        <TapeCorner position="tl" />
        <TapeCorner position="tr" />
        <p
          className={`${lockerBody.className} text-center text-base font-bold`}
          style={{ color: SPRAY_BLACK }}
        >
          {site.tagline}
          <br />
          {site.subTagline}
        </p>
      </NotebookPaper>

      {/* Register above the fold */}
      <LockerRegisterButton className="mt-1 px-10 py-4 text-base">
        🔓 Open Your Locker
      </LockerRegisterButton>

      {/* Countdown — Bebas Neue stat numbers */}
      <div
        className="mt-1 grid w-full max-w-xs grid-cols-4 gap-2 rounded-sm border-2 p-4"
        style={{
          borderColor: PURPLE,
          background: `${SPRAY_BLACK}dd`,
          boxShadow: physicalShadow,
        }}
      >
        <p
          className={`${lockerBody.className} col-span-4 mb-1 text-center text-xs font-bold uppercase tracking-widest`}
          style={{ color: `${YELLOW}99` }}
        >
          Doors Open In
        </p>
        {(
          [
            ["Days", cd.days],
            ["Hrs", cd.hours],
            ["Min", cd.minutes],
            ["Sec", cd.seconds],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="text-center">
            <div
              className={lockerStat.className}
              style={{ color: YELLOW, fontSize: "1.8rem", lineHeight: 1 }}
            >
              {pad2(value)}
            </div>
            <div
              className={`${lockerBody.className} mt-1 text-xs uppercase`}
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Date & venue */}
      <p
        className={`${lockerBody.className} text-sm font-bold`}
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        {site.date} · {site.venue}
      </p>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Events — torn paper notes taped to locker, with peel effect
// ---------------------------------------------------------------------------
const EventNoteCard = ({
  ev,
  rotation,
  isOpen,
  onToggle,
}: {
  ev: SpectrumEvent
  rotation: number
  isOpen: boolean
  onToggle: () => void
}) => {
  const reduced = useReducedMotion()

  return (
    <motion.div
      layout={!reduced}
      className="relative"
      style={{
        transform: isOpen ? "rotate(0deg)" : `rotate(${rotation}deg)`,
        transition: "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
        zIndex: isOpen ? 10 : 1,
      }}
    >
      <NotebookPaper
        rotation={0}
        className="relative overflow-hidden border border-gray-300/30 p-5"
        style={{
          clipPath: isOpen
            ? "none"
            : "polygon(2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 3% 99%, 0% 96%, 1% 2%)",
        }}
      >
        <TapeCorner position="tl" color="rgba(242,183,5,0.5)" />
        <TapeCorner position="tr" color="rgba(242,183,5,0.5)" />

        {/* Header tap area */}
        <button
          type="button"
          className="flex w-full items-start justify-between text-left"
          onClick={onToggle}
          style={{ minHeight: 44 }}
        >
          <div className="flex gap-3">
            <span
              className={`${lockerStat.className} flex size-10 shrink-0 items-center justify-center rounded-sm text-lg text-white`}
              style={{ background: ev.color, boxShadow: tapeShadow }}
            >
              {ev.index}
            </span>
            <div>
              <h3
                className={`${lockerDisplay.className} text-base`}
                style={{ color: SPRAY_BLACK }}
              >
                {ev.name}
              </h3>
              <p
                className={`${lockerBody.className} text-sm`}
                style={{ color: "rgba(0,0,0,0.55)" }}
              >
                {ev.tag}
              </p>
            </div>
          </div>
          <div
            className={`${lockerBody.className} shrink-0 text-right text-sm font-bold`}
            style={{ color: SPRAY_BLACK }}
          >
            <div style={{ opacity: 0.5, fontSize: "0.75rem" }}>
              {ev.format}
            </div>
            <div>{ev.fee}</div>
          </div>
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className={`${lockerBody.className} mt-4 space-y-2 border-t pt-3 text-sm`}
                style={{
                  borderColor: "rgba(0,0,0,0.12)",
                  color: SPRAY_BLACK,
                }}
              >
                <p className="font-bold">{ev.description}</p>
                <div
                  className="flex gap-4 text-xs"
                  style={{ color: "rgba(0,0,0,0.5)" }}
                >
                  <span>👥 {ev.teamSize}</span>
                  <span>
                    📊 Difficulty:{" "}
                    {"●".repeat(ev.difficulty) +
                      "○".repeat(5 - ev.difficulty)}
                  </span>
                </div>
                <p
                  className="text-xs font-bold"
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  Registration ends: {ev.registrationEnds}
                </p>
                <ul className="list-disc space-y-1 pl-5 text-xs opacity-70">
                  {ev.rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <ul className="space-y-1 text-xs font-bold">
                  {ev.prizes.map((p) => (
                    <li key={p.place}>
                      🏆 {p.place}: {p.reward}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Per-event register button */}
        <LockerRegisterButton
          eventId={ev.id}
          variant="secondary"
          className="mt-4 w-full py-2.5 text-xs"
        >
          Register — {ev.shortName}
        </LockerRegisterButton>
      </NotebookPaper>
    </motion.div>
  )
}

const Events: ThemeModule["Events"] = () => {
  const [openId, setOpenId] = React.useState<string | null>(null)

  return (
    <Section id="events" className="flex flex-col gap-6 px-5 py-16">
      <SprayHeading>What&apos;s Inside</SprayHeading>
      <p
        className={`${lockerBody.className} -mt-4 text-base font-bold`}
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        Torn notes taped to the door. Pick your battle.
      </p>
      <div className="flex flex-col gap-5">
        {events.map((ev, i) => (
          <EventNoteCard
            key={ev.id}
            ev={ev}
            rotation={NOTE_ROTATIONS[i]}
            isOpen={openId === ev.id}
            onToggle={() =>
              setOpenId(openId === ev.id ? null : ev.id)
            }
          />
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Schedule — timeline on notebook paper
// ---------------------------------------------------------------------------
const Schedule: ThemeModule["Schedule"] = () => (
  <Section id="schedule" className="flex flex-col gap-5 px-5 py-16">
    <SprayHeading>Game Day Schedule</SprayHeading>
    <NotebookPaper rotation={-0.8} className="relative p-5 pl-10">
      <TapeCorner position="tl" />
      <TapeCorner position="br" />
      <ol className="space-y-5">
        {schedule.map((item, i) => (
          <li key={item.title} className="relative pl-5">
            {/* timeline dot */}
            <span
              className="absolute -left-1 top-1.5 size-3 rounded-full"
              style={{
                background: YELLOW,
                boxShadow: `0 0 6px ${YELLOW}88`,
              }}
            />
            {/* connecting line */}
            {i < schedule.length - 1 && (
              <span
                className="absolute -left-[1px] top-4 w-[2px]"
                style={{ height: 36, background: `${YELLOW}33` }}
              />
            )}
            <p
              className={`${lockerStat.className} text-sm`}
              style={{ color: PURPLE }}
            >
              {item.time}
            </p>
            <p
              className={`${lockerDisplay.className} text-sm`}
              style={{ color: SPRAY_BLACK }}
            >
              {item.title}
            </p>
            <p
              className={`${lockerBody.className} text-sm`}
              style={{ color: "rgba(0,0,0,0.5)" }}
            >
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </NotebookPaper>
    {/* Venue */}
    <div
      className="rounded-sm border-2 p-4"
      style={{
        borderColor: PURPLE,
        background: `${SPRAY_BLACK}cc`,
        boxShadow: metalShadow,
      }}
    >
      <p
        className={`${lockerBody.className} text-sm font-bold`}
        style={{ color: CREAM }}
      >
        📍 {site.venue}
      </p>
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------
const About: ThemeModule["About"] = () => (
  <Section id="about" className="flex flex-col gap-5 px-5 py-16">
    <SprayHeading>About {site.name}</SprayHeading>
    <NotebookPaper rotation={0.6} className="p-5 pl-10">
      <TapeCorner position="tl" />
      <TapeCorner position="tr" />
      <p
        className={`${lockerBody.className} text-base font-bold leading-relaxed`}
        style={{ color: SPRAY_BLACK }}
      >
        {site.about}
      </p>
    </NotebookPaper>
    <div className="grid grid-cols-2 gap-3">
      {highlights.map((h, i) => (
        <div
          key={h.title}
          className="relative rounded-sm border-2 p-3"
          style={{
            borderColor: PURPLE,
            background: `${SPRAY_BLACK}cc`,
            boxShadow: physicalShadow,
            transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
          }}
        >
          <p
            className={`${lockerDisplay.className} text-xs`}
            style={{ color: YELLOW }}
          >
            {h.title}
          </p>
          <p
            className={`${lockerBody.className} mt-1 text-sm`}
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {h.description}
          </p>
        </div>
      ))}
    </div>
    <div
      className="mt-2 rounded-sm border-2 p-4 text-center"
      style={{
        borderColor: YELLOW,
        background: `${PURPLE}33`,
      }}
    >
      <p
        className={`${lockerStat.className} text-2xl`}
        style={{ color: YELLOW }}
      >
        {site.prizePool}
      </p>
      <p
        className={`${lockerBody.className} text-sm font-bold`}
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        Total Prize Pool
      </p>
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// Sponsors
// ---------------------------------------------------------------------------
const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className="flex flex-col gap-5 px-5 py-16">
    <SprayHeading>Our Sponsors</SprayHeading>
    <div className="flex flex-col gap-3">
      {sponsors.map((s, i) => (
        <div
          key={s.name}
          className="relative overflow-hidden rounded-sm border-2 p-4"
          style={{
            borderColor: `${PURPLE}88`,
            background: `${SPRAY_BLACK}cc`,
            boxShadow: metalShadow,
            transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)`,
          }}
        >
          <p
            className={`${lockerDisplay.className} text-sm`}
            style={{ color: CREAM }}
          >
            {s.name}
          </p>
          {/* Decorative tape strip */}
          <span
            aria-hidden
            className="absolute -right-2 top-1 h-3 w-10 opacity-40"
            style={{
              background: YELLOW,
              transform: "rotate(12deg)",
            }}
          />
        </div>
      ))}
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// Register — "Opening the Lock" with combination dial gesture
// ---------------------------------------------------------------------------
const CombinationDial = ({ onUnlock }: { onUnlock: () => void }) => {
  const reduced = useReducedMotion()
  const [rotation, setRotation] = React.useState(0)
  const [unlocked, setUnlocked] = React.useState(false)
  const dialRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)
  const lastAngle = React.useRef(0)

  // Auto-unlock on reduced motion
  React.useEffect(() => {
    if (reduced) {
      setUnlocked(true)
      onUnlock()
    }
  }, [reduced, onUnlock])

  const getAngle = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = dialRef.current
      if (!el) return 0
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI)
    },
    []
  )

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (unlocked) return
      dragging.current = true
      lastAngle.current = getAngle(e.clientX, e.clientY)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [getAngle, unlocked]
  )

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || unlocked) return
      const angle = getAngle(e.clientX, e.clientY)
      let delta = angle - lastAngle.current
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      lastAngle.current = angle

      setRotation((prev) => {
        const next = prev + delta
        if (Math.abs(next) >= 270 && !unlocked) {
          setUnlocked(true)
          onUnlock()
        }
        return next
      })
    },
    [getAngle, onUnlock, unlocked]
  )

  const onPointerUp = React.useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      {!unlocked && (
        <>
          <p
            className={`${lockerBody.className} text-center text-sm font-bold`}
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Spin the lock to reveal prizes inside...
          </p>
          <div className="relative flex items-center justify-center">
            {/* Dial background */}
            <div
              className="flex size-36 items-center justify-center rounded-full border-4"
              style={{
                borderColor: PURPLE,
                background: `radial-gradient(circle, ${GUNMETAL} 0%, ${SPRAY_BLACK} 100%)`,
                boxShadow: `0 0 30px ${PURPLE}44, inset 0 2px 8px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Rotating dial */}
              <div
                ref={dialRef}
                className="flex size-28 cursor-grab items-center justify-center rounded-full border-2 active:cursor-grabbing"
                style={{
                  borderColor: `${YELLOW}66`,
                  background: `conic-gradient(from 0deg, ${GUNMETAL}, ${PURPLE}66, ${GUNMETAL}, ${PURPLE}44, ${GUNMETAL})`,
                  transform: `rotate(${rotation}deg)`,
                  transition: dragging.current
                    ? "none"
                    : "transform 0.2s ease-out",
                  touchAction: "none",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                role="slider"
                aria-label="Combination dial"
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={Math.abs(rotation) % 360}
              >
                {/* Tick mark */}
                <span
                  className="absolute top-2 h-4 w-1 rounded-full"
                  style={{ background: YELLOW }}
                />
                {/* Center cap */}
                <span
                  className="size-6 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${YELLOW} 0%, ${YELLOW}88 100%)`,
                    boxShadow: `0 0 8px ${YELLOW}66`,
                  }}
                />
              </div>
            </div>
            {/* Top indicator */}
            <span
              className="absolute -top-1"
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `10px solid ${YELLOW}`,
              }}
            />
          </div>
          {/* Tap fallback */}
          <button
            type="button"
            onClick={() => {
              setUnlocked(true)
              onUnlock()
            }}
            className={`${lockerBody.className} text-sm font-bold underline`}
            style={{ color: `${YELLOW}88`, minHeight: 44 }}
          >
            or tap here to unlock →
          </button>
        </>
      )}
      {unlocked && (
        <motion.div
          initial={reduced ? undefined : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <span style={{ fontSize: "1.5rem" }}>🔓</span>
          <p
            className={`${lockerDisplay.className} text-base`}
            style={{ color: YELLOW }}
          >
            Unlocked!
          </p>
        </motion.div>
      )}
    </div>
  )
}

const Register: ThemeModule["Register"] = () => {
  const { preselectedEvent, submitted, submitting, submit, reset } =
    useRegistration()
  const { values, setField, isValid } =
    useRegistrationForm(preselectedEvent)
  const [formRevealed, setFormRevealed] = React.useState(false)
  const reduced = useReducedMotion()

  const handleUnlock = React.useCallback(() => {
    setFormRevealed(true)
  }, [])

  const inputCls =
    "w-full rounded-sm border-2 px-4 py-3 text-sm outline-none transition-colors focus:border-[#4A2472]"
  const inputStyle: React.CSSProperties = {
    borderColor: "rgba(0,0,0,0.15)",
    color: SPRAY_BLACK,
    background: CREAM,
    fontFamily: "inherit",
  }

  if (submitted) {
    return (
      <Section
        id="register"
        className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center"
      >
        <motion.div
          initial={reduced ? undefined : { scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <span style={{ fontSize: "3rem" }}>🏆</span>
          <h2
            className={lockerDisplay.className}
            style={{ color: YELLOW, fontSize: "1.4rem" }}
          >
            Locker Claimed!
          </h2>
          <p
            className={`${lockerBody.className} text-base font-bold`}
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            You&apos;re in. Check your email for the game plan.
          </p>
          <button
            type="button"
            onClick={reset}
            className={`${lockerBody.className} mt-2 text-sm font-bold underline`}
            style={{ color: `${YELLOW}88` }}
          >
            Register another
          </button>
        </motion.div>
      </Section>
    )
  }

  return (
    <Section id="register" className="flex flex-col gap-5 px-5 py-16">
      <SprayHeading>Open Your Locker</SprayHeading>
      <p
        className={`${lockerBody.className} -mt-3 text-base font-bold`}
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        Spin the dial to unlock prizes inside.
      </p>

      {!formRevealed && <CombinationDial onUnlock={handleUnlock} />}

      {formRevealed && (
        <motion.div
          initial={reduced ? undefined : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <NotebookPaper rotation={0.4} className="relative p-5 pl-10">
            <TapeCorner position="tl" color="rgba(242,183,5,0.6)" />
            <TapeCorner position="br" color="rgba(242,183,5,0.6)" />
            <form
              className={`${lockerBody.className} flex flex-col gap-3 text-base font-bold`}
              onSubmit={(e) => {
                e.preventDefault()
                if (isValid) submit(values)
              }}
            >
              <input
                required
                placeholder="Full Name"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
              <input
                required
                type="tel"
                placeholder="Phone Number"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
              <input
                required
                placeholder="College Name"
                value={values.college}
                onChange={(e) =>
                  setField("college", e.target.value)
                }
                className={inputCls}
                style={inputStyle}
              />
              <select
                required
                value={values.eventId}
                onChange={(e) =>
                  setField("eventId", e.target.value as EventId)
                }
                className={inputCls}
                style={inputStyle}
              >
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
                className={`${lockerDisplay.className} mt-2 rounded-sm border-2 py-3.5 text-sm uppercase tracking-wider transition-all disabled:opacity-40`}
                style={{
                  borderColor: YELLOW,
                  background: YELLOW,
                  color: SPRAY_BLACK,
                  boxShadow: `0 0 20px ${YELLOW}44`,
                }}
              >
                {submitting ? "Submitting…" : "🔓 Claim Your Spot"}
              </button>
            </form>
          </NotebookPaper>
        </motion.div>
      )}
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="flex flex-col gap-4 px-5 py-16 pb-36">
    <SprayHeading>Hit Us Up</SprayHeading>
    <NotebookPaper rotation={-0.5} className="p-5 pl-10">
      <TapeCorner position="tl" />
      <TapeCorner position="br" />
      <div
        className={`${lockerBody.className} space-y-2 text-base font-bold`}
        style={{ color: SPRAY_BLACK }}
      >
        <p>✉️ {contact.email}</p>
        <p>📞 {contact.phone}</p>
        <p>📍 {contact.location}</p>
      </div>
    </NotebookPaper>
    <p
      className={`${lockerBody.className} text-center text-sm font-bold`}
      style={{ color: "rgba(255,255,255,0.35)" }}
    >
      Made with 🎨 for {site.name}
    </p>
  </Section>
)

// ---------------------------------------------------------------------------
// Preview — live World Select miniature (~340x220)
// ---------------------------------------------------------------------------
const Preview: ThemeModule["Preview"] = () => (
  <div
    className="relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden"
    style={{
      background: `linear-gradient(175deg, ${GUNMETAL} 0%, ${SPRAY_BLACK} 60%, ${DARK_PURPLE} 100%)`,
    }}
  >
    {/* Mini spray splatter */}
    <span
      aria-hidden
      className="absolute right-3 top-3 size-10 rounded-full opacity-30"
      style={{
        background: `radial-gradient(circle, ${YELLOW} 0%, transparent 70%)`,
      }}
    />
    {/* Mini vent lines */}
    <div className="mb-1 flex flex-col gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block rounded-sm"
          style={{
            width: 20,
            height: 2,
            background: "rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </div>
    <p
      className={lockerDisplay.className}
      style={{ color: YELLOW, fontSize: "0.8rem" }}
    >
      Locker Room
    </p>
    <p
      className={`${lockerBody.className} text-[11px] font-bold`}
      style={{ color: "rgba(255,255,255,0.55)" }}
    >
      Spray-paint &amp; torn notes
    </p>
    {/* Swatch */}
    <div className="mt-1 flex gap-1">
      {[PURPLE, YELLOW, SPRAY_BLACK, CREAM].map((c) => (
        <span
          key={c}
          className="size-3 rounded-sm border"
          style={{
            background: c,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </div>
    {/* Mini torn paper note */}
    <motion.div
      className="absolute bottom-3 right-4 rounded-sm px-2 py-1"
      style={{
        background: CREAM,
        transform: "rotate(3deg)",
        boxShadow: "1px 2px 4px rgba(0,0,0,0.3)",
        fontSize: "7px",
        color: SPRAY_BLACK,
      }}
      animate={{ rotate: [3, 5, 3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className={lockerBody.className}>note!</span>
    </motion.div>
  </div>
)

// ---------------------------------------------------------------------------
// Meta & export
// ---------------------------------------------------------------------------
const meta: ThemeModule["meta"] = {
  slug: "locker",
  name: "Locker Room",
  tagline: "Spray-paint & torn notes",
  swatch: [PURPLE, YELLOW, SPRAY_BLACK, CREAM],
  fontDisplay: "--font-locker-display",
  vibe: ["gritty", "physical", "school"],
}

const lockerTheme: ThemeModule = {
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

export default lockerTheme
