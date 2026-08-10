"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import type { ThemeModule } from "../types"
import type { EventId } from "@/content/spectrum"
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
import { arcadeDisplay, arcadeBody } from "./fonts"

/* ───────────────────────────────────────────── Palette ─── */
const BLACK = "#0A0A0F"
const MAGENTA = "#FF2E88"
const CYAN = "#25E5E5"
const AMBER = "#FFB000"
const PHOSPHOR = "#39FF14"
const DARK_GRAY = "#16161D"
const MID_GRAY = "#1E1E2A"

/* ───────────────────────── Shared Styles / Utils ─── */

const crtShadow = `0 0 8px ${MAGENTA}80, 0 0 20px ${MAGENTA}30`
const cyanGlow = `0 0 8px ${CYAN}80, 0 0 20px ${CYAN}30`
const amberGlow = `0 0 8px ${AMBER}80, 0 0 20px ${AMBER}30`

function goRegister() {
  document
    .getElementById("register")
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}

/* ── useStepTimer: ~12fps blink ── */
function useStepTimer(intervalMs = 83) {
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return tick
}

/* ── Blinking text at ~12fps ── */
function Blink({
  children,
  rate = 500,
  className = "",
  style,
}: {
  children: React.ReactNode
  rate?: number
  className?: string
  style?: React.CSSProperties
}) {
  const tick = useStepTimer(rate)
  return (
    <span className={className} style={{ ...style, opacity: tick % 2 === 0 ? 1 : 0 }}>
      {children}
    </span>
  )
}

/* ── Chroma-split heading ── */
function ChromaText({
  children,
  as: Tag = "h2",
  className = "",
  style,
}: {
  children: React.ReactNode
  as?: "h1" | "h2" | "h3" | "p" | "span"
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <Tag
      className={`${arcadeDisplay.className} ${className}`}
      style={{
        color: CYAN,
        textTransform: "uppercase" as const,
        letterSpacing: "0.12em",
        textShadow: `2px 0 ${MAGENTA}, -2px 0 ${CYAN}, 0 2px ${MAGENTA}40`,
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}

/* ── CoinButton: primary Register CTA with coin-drop micro-animation ── */
function CoinButton({
  eventId,
  className = "",
  children,
  large = false,
}: {
  eventId?: EventId
  className?: string
  children: React.ReactNode
  large?: boolean
}) {
  const { openRegistration } = useRegistration()
  const [coinDrop, setCoinDrop] = React.useState(false)
  const reduced = useReducedMotion()

  const handleClick = () => {
    if (!reduced) {
      setCoinDrop(true)
      try { navigator?.vibrate?.(30) } catch { /* optional haptic */ }
      setTimeout(() => setCoinDrop(false), 400)
    }
    openRegistration(eventId)
    goRegister()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${arcadeDisplay.className} relative overflow-hidden border-2 font-bold uppercase tracking-wider transition-transform active:scale-95 ${className}`}
      style={{
        minHeight: large ? 56 : 44,
        borderColor: AMBER,
        background: `linear-gradient(180deg, ${AMBER}, #E09800)`,
        color: BLACK,
        boxShadow: `0 4px 0 #8B6500, ${amberGlow}`,
        textShadow: "1px 1px 0 #FFF8",
        fontSize: large ? "0.75rem" : "0.65rem",
        lineHeight: 1,
      }}
    >
      {/* Coin drop animation overlay */}
      <AnimatePresence>
        {coinDrop && !reduced && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center text-lg"
            initial={{ y: -30, opacity: 1 }}
            animate={{ y: 0, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ pointerEvents: "none" }}
          >
            🪙
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </button>
  )
}

/* ── Difficulty stars ── */
function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`Difficulty ${level} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < level ? AMBER : `${AMBER}30`,
            fontSize: "0.7rem",
            textShadow: i < level ? `0 0 4px ${AMBER}` : "none",
          }}
        >
          ★
        </span>
      ))}
    </span>
  )
}

/* ── Life counter hearts (HUD) ── */
function LifeHearts() {
  const tick = useStepTimer(2000)
  return (
    <div className="flex items-center gap-1" aria-label="Lives remaining">
      <span className={`${arcadeBody.className} text-xs uppercase`} style={{ color: MAGENTA }}>
        HP
      </span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            color: MAGENTA,
            fontSize: "0.85rem",
            textShadow: `0 0 6px ${MAGENTA}`,
            opacity: tick % 8 === i ? 0.5 : 1,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   CRT POWER-ON INTRO
   White horizontal line → bloom → reveal. Skippable, <1.5s
   ═══════════════════════════════════════════════════════ */
function CRTIntro({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = React.useState<"line" | "bloom" | "done">("line")
  const reduced = useReducedMotion()

  React.useEffect(() => {
    if (reduced) {
      setPhase("done")
      return
    }
    const t1 = setTimeout(() => setPhase("bloom"), 400)
    const t2 = setTimeout(() => setPhase("done"), 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [reduced])

  if (phase === "done") return <>{children}</>

  return (
    <>
      {/* Content always rendered underneath for Dock accessibility */}
      <div style={{ visibility: "hidden", position: "fixed" }}>{children}</div>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: BLACK }}
        onClick={() => setPhase("done")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Escape" || e.key === " ") setPhase("done") }}
        aria-label="Skip intro"
      >
        {phase === "line" && (
          <motion.div
            className="absolute"
            style={{ background: "#fff", height: 2, width: "60%" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.35 }}
          />
        )}
        {phase === "bloom" && (
          <motion.div
            className="absolute inset-0"
            style={{ background: "#fff" }}
            initial={{ opacity: 0.7, scaleY: 0.01 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════
   BACKGROUND — CRT scanlines, barrel vignette, phosphor bloom
   ═══════════════════════════════════════════════════════ */
const Background: ThemeModule["Background"] = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: BLACK }}>
      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)",
          imageRendering: "pixelated",
        }}
      />
      {/* Phosphor grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,46,136,0.3) 0px, transparent 1px, rgba(37,229,229,0.3) 2px, transparent 3px)",
        }}
      />
      {/* Barrel distortion vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.95) 100%)",
        }}
      />
      {/* Top/bottom CRT bezel glow */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${MAGENTA}40, ${CYAN}40, ${MAGENTA}40)` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1"
        style={{ background: `linear-gradient(90deg, ${CYAN}40, ${MAGENTA}40, ${CYAN}40)` }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   DOCK — D-pad nav cluster + INSERT COIN register button
   ═══════════════════════════════════════════════════════ */
const Dock: ThemeModule["Dock"] = () => {
  const navItems = [
    { label: "HOME", href: "#home", icon: "▲" },
    { label: "EVENTS", href: "#events", icon: "►" },
    { label: "SCHEDULE", href: "#schedule", icon: "▼" },
    { label: "SPONSORS", href: "#sponsors", icon: "◄" },
  ]

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t-2"
      style={{
        background: `linear-gradient(180deg, ${DARK_GRAY}, ${BLACK})`,
        borderColor: `${MAGENTA}60`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        minHeight: 56,
      }}
    >
      {/* D-Pad Nav (secondary) */}
      <nav
        className={`${arcadeBody.className} flex flex-1 items-center justify-around px-1`}
        aria-label="D-pad navigation"
      >
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 transition-colors"
            style={{ color: `${CYAN}90`, fontSize: "0.7rem" }}
            onClick={() => {
              try { navigator?.vibrate?.(15) } catch { /* optional haptic */ }
            }}
          >
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.1em" }}>{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Primary Register CTA — highest contrast in dock */}
      <CoinButton large className="m-1.5 flex min-w-[130px] shrink-0 items-center justify-center px-4">
        INSERT COIN
      </CoinButton>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   HERO — "ATTRACT MODE" screen
   ═══════════════════════════════════════════════════════ */
const Hero: ThemeModule["Hero"] = () => {
  const cd = useCountdown()
  const reduced = useReducedMotion()
  const tick = useStepTimer(600)

  // Past Spectrum "high scores"
  const highScores = [
    { rank: "1ST", name: "SPECTRUM 4.0", score: "99999" },
    { rank: "2ND", name: "SPECTRUM 3.0", score: "88888" },
    { rank: "3RD", name: "SPECTRUM 2.0", score: "77777" },
    { rank: "4TH", name: "SPECTRUM 1.0", score: "66666" },
  ]

  return (
    <CRTIntro>
      <Section
        id="home"
        className="relative flex flex-col items-center justify-center gap-4 px-5 pb-32 pt-16 text-center"
      >
        {/* HUD top bar */}
        <div className="flex w-full max-w-sm items-center justify-between">
          <LifeHearts />
          <div
            className={`${arcadeBody.className} text-xs uppercase`}
            style={{ color: AMBER, textShadow: `0 0 4px ${AMBER}` }}
          >
            {site.prizePool} PRIZE POOL
          </div>
        </div>

        {/* Marquee / Title */}
        <div
          className="w-full max-w-sm border-2 p-5"
          style={{
            borderColor: MAGENTA,
            background: `${BLACK}E0`,
            boxShadow: crtShadow,
          }}
        >
          <p
            className={`${arcadeBody.className} mb-2 text-sm uppercase tracking-[0.3em]`}
            style={{ color: AMBER }}
          >
            {site.eyebrow}
          </p>
          <ChromaText as="h1" style={{ fontSize: "1.6rem", lineHeight: 1.4 }}>
            {site.shortName}
            <br />
            <span style={{ color: MAGENTA }}>{site.version}</span>
          </ChromaText>
          <p
            className={`${arcadeBody.className} mt-2 text-lg`}
            style={{ color: PHOSPHOR, textShadow: `0 0 6px ${PHOSPHOR}` }}
          >
            {site.tagline}
          </p>
        </div>

        {/* INSERT COIN blinking + Register CTA above fold */}
        <div className="flex flex-col items-center gap-3">
          <Blink
            rate={600}
            className={arcadeDisplay.className}
            style={{
              color: AMBER,
              fontSize: "0.7rem",
              textShadow: `0 0 8px ${AMBER}`,
              letterSpacing: "0.2em",
            }}
          >
            INSERT COIN — PRESS START
          </Blink>

          <CoinButton large className="px-8 py-4">
            REGISTER NOW
          </CoinButton>
        </div>

        {/* Date & Venue */}
        <p
          className={`${arcadeBody.className} text-sm uppercase tracking-wider`}
          style={{ color: CYAN, textShadow: `0 0 4px ${CYAN}40` }}
        >
          {site.date} · {site.venue}
        </p>

        {/* Countdown timer */}
        <div
          className="w-full max-w-sm border-2 p-4"
          style={{
            borderColor: CYAN,
            background: `${BLACK}D0`,
            boxShadow: cyanGlow,
          }}
        >
          <p
            className={`${arcadeBody.className} mb-2 text-xs uppercase tracking-[0.25em]`}
            style={{ color: `${CYAN}A0` }}
          >
            TIME UNTIL BATTLE
          </p>
          <div className="grid grid-cols-4 gap-3">
            {(
              [
                ["DAYS", cd.days],
                ["HRS", cd.hours],
                ["MIN", cd.minutes],
                ["SEC", cd.seconds],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex flex-col items-center">
                <span
                  className={arcadeDisplay.className}
                  style={{
                    color: CYAN,
                    fontSize: "1.1rem",
                    textShadow: `0 0 8px ${CYAN}`,
                  }}
                >
                  {pad2(value)}
                </span>
                <span
                  className={`${arcadeBody.className} text-xs`}
                  style={{ color: `${CYAN}80` }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* High Score Table */}
        <div
          className="w-full max-w-sm border-2 p-3"
          style={{
            borderColor: `${PHOSPHOR}60`,
            background: `${BLACK}C0`,
          }}
        >
          <p
            className={`${arcadeDisplay.className} mb-2 text-center`}
            style={{ color: PHOSPHOR, fontSize: "0.55rem", letterSpacing: "0.2em" }}
          >
            HIGH SCORES
          </p>
          {highScores.map((hs, i) => (
            <div
              key={hs.name}
              className={`${arcadeBody.className} flex justify-between text-sm`}
              style={{
                color: i === 0 ? AMBER : `${PHOSPHOR}B0`,
                opacity: !reduced && tick % 12 === i ? 0.5 : 1,
              }}
            >
              <span>
                {hs.rank} {hs.name}
              </span>
              <span>{hs.score}</span>
            </div>
          ))}
        </div>
      </Section>
    </CRTIntro>
  )
}

/* ═══════════════════════════════════════════════════════
   EVENTS — "CHARACTER SELECT" grid
   ═══════════════════════════════════════════════════════ */
const Events: ThemeModule["Events"] = () => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const reduced = useReducedMotion()
  const selectedEvent = events.find((e) => e.id === selectedId)

  return (
    <Section id="events" className="flex flex-col gap-5 px-5 py-16">
      <ChromaText style={{ fontSize: "1rem" }}>SELECT YOUR FIGHTER</ChromaText>
      <p
        className={`${arcadeBody.className} -mt-3 text-lg uppercase tracking-wider`}
        style={{ color: `${CYAN}A0` }}
      >
        Choose your battleground. 4 arenas await.
      </p>

      {/* Character Select Grid — 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {events.map((ev) => {
          const isSelected = selectedId === ev.id
          return (
            <button
              key={ev.id}
              type="button"
              onClick={() => setSelectedId(isSelected ? null : ev.id)}
              className="relative flex min-h-[120px] flex-col items-center justify-center gap-2 border-2 p-3 text-center transition-transform active:scale-95"
              style={{
                borderColor: isSelected ? ev.color : `${CYAN}40`,
                background: isSelected ? `${ev.color}15` : `${BLACK}E0`,
                boxShadow: isSelected ? `0 0 16px ${ev.color}60, inset 0 0 20px ${ev.color}10` : "none",
              }}
            >
              {/* Fighter number */}
              <span
                className={arcadeDisplay.className}
                style={{
                  fontSize: "1.6rem",
                  color: ev.color,
                  textShadow: `0 0 10px ${ev.color}80`,
                }}
              >
                P{ev.index}
              </span>
              <span
                className={`${arcadeDisplay.className} text-center`}
                style={{
                  fontSize: "0.5rem",
                  color: isSelected ? "#fff" : `${CYAN}C0`,
                  lineHeight: 1.4,
                  letterSpacing: "0.05em",
                }}
              >
                {ev.shortName.toUpperCase()}
              </span>
              <span
                className={`${arcadeBody.className} text-xs`}
                style={{ color: `${AMBER}A0` }}
              >
                {ev.tag}
              </span>
              {/* Selection indicator */}
              {isSelected && !reduced && (
                <motion.div
                  className="absolute inset-0 border-2"
                  style={{ borderColor: ev.color, pointerEvents: "none" }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Stats panel slides in for selected event */}
      <AnimatePresence mode="wait">
        {selectedEvent && (
          <motion.div
            key={selectedEvent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="border-2 p-4"
            style={{
              borderColor: selectedEvent.color,
              background: `${BLACK}F0`,
              boxShadow: `0 0 20px ${selectedEvent.color}30`,
            }}
          >
            {/* Stats Header */}
            <div className="mb-3 flex items-center justify-between">
              <ChromaText as="h3" style={{ fontSize: "0.6rem", color: selectedEvent.color }}>
                {selectedEvent.name}
              </ChromaText>
              <DifficultyStars level={selectedEvent.difficulty} />
            </div>

            {/* Stats Grid */}
            <div className={`${arcadeBody.className} grid grid-cols-2 gap-2 text-sm`}>
              <div>
                <span style={{ color: `${CYAN}80` }}>TEAM SIZE</span>
                <p style={{ color: "#fff" }}>{selectedEvent.teamSize}</p>
              </div>
              <div>
                <span style={{ color: `${CYAN}80` }}>FORMAT</span>
                <p style={{ color: "#fff" }}>{selectedEvent.format}</p>
              </div>
              <div>
                <span style={{ color: `${CYAN}80` }}>ENTRY FEE</span>
                <p style={{ color: AMBER, textShadow: `0 0 4px ${AMBER}40` }}>
                  {selectedEvent.fee}
                </p>
              </div>
              <div>
                <span style={{ color: `${CYAN}80` }}>DIFFICULTY</span>
                <p style={{ color: MAGENTA }}>{selectedEvent.difficulty}/5</p>
              </div>
            </div>

            {/* Description */}
            <p
              className={`${arcadeBody.className} mt-3 text-sm`}
              style={{ color: `${PHOSPHOR}C0` }}
            >
              {selectedEvent.description}
            </p>

            {/* Rules */}
            <div className="mt-3 border-t border-dashed pt-3" style={{ borderColor: `${CYAN}30` }}>
              <p
                className={`${arcadeDisplay.className} mb-1`}
                style={{ fontSize: "0.45rem", color: AMBER, letterSpacing: "0.15em" }}
              >
                RULES
              </p>
              <ul className={`${arcadeBody.className} space-y-1 text-sm`} style={{ color: `${CYAN}B0` }}>
                {selectedEvent.rules.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span style={{ color: MAGENTA }}>▸</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prizes */}
            <div className="mt-3 border-t border-dashed pt-3" style={{ borderColor: `${CYAN}30` }}>
              <p
                className={`${arcadeDisplay.className} mb-1`}
                style={{ fontSize: "0.45rem", color: AMBER, letterSpacing: "0.15em" }}
              >
                PRIZES
              </p>
              <ul className={`${arcadeBody.className} space-y-1 text-sm`}>
                {selectedEvent.prizes.map((p) => (
                  <li
                    key={p.place}
                    className="flex justify-between"
                    style={{ color: `${PHOSPHOR}C0` }}
                  >
                    <span style={{ color: AMBER }}>{p.place}</span>
                    <span>{p.reward}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Per-event register */}
            <CoinButton
              eventId={selectedEvent.id}
              className="mt-4 w-full py-3"
            >
              REGISTER — {selectedEvent.shortName.toUpperCase()}
            </CoinButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always show register buttons per event (even when detail not open) */}
      {!selectedEvent && (
        <div className="flex flex-col gap-2">
          {events.map((ev) => (
            <CoinButton key={ev.id} eventId={ev.id} className="w-full py-2.5">
              REGISTER — {ev.shortName.toUpperCase()}
            </CoinButton>
          ))}
        </div>
      )}
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════
   SCHEDULE — "LEVEL MAP" timeline
   ═══════════════════════════════════════════════════════ */
const Schedule: ThemeModule["Schedule"] = () => {
  return (
    <Section id="schedule" className="flex flex-col gap-5 px-5 py-16">
      <ChromaText style={{ fontSize: "1rem" }}>LEVEL MAP</ChromaText>
      <p
        className={`${arcadeBody.className} -mt-3 text-lg uppercase`}
        style={{ color: `${CYAN}A0` }}
      >
        Your quest path through the day.
      </p>

      <div className="relative flex flex-col gap-0">
        {/* Vertical connector line */}
        <div
          className="absolute bottom-4 left-5 top-4 w-0.5"
          style={{ background: `linear-gradient(180deg, ${MAGENTA}, ${CYAN}, ${PHOSPHOR})` }}
        />

        {schedule.map((item, i) => (
          <div key={item.title} className="relative flex items-start gap-4 py-3">
            {/* Level node */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`${arcadeDisplay.className} flex size-10 shrink-0 items-center justify-center border-2 text-xs`}
                style={{
                  borderColor: i === schedule.length - 1 ? AMBER : MAGENTA,
                  background: `${BLACK}F0`,
                  color: i === schedule.length - 1 ? AMBER : CYAN,
                  boxShadow: `0 0 8px ${i === schedule.length - 1 ? AMBER : MAGENTA}50`,
                }}
              >
                {i + 1}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <p
                className={`${arcadeDisplay.className}`}
                style={{
                  fontSize: "0.5rem",
                  color: MAGENTA,
                  letterSpacing: "0.15em",
                  textShadow: `0 0 4px ${MAGENTA}60`,
                }}
              >
                {item.time}
              </p>
              <p
                className={`${arcadeBody.className} text-lg font-bold uppercase`}
                style={{ color: "#fff" }}
              >
                {item.title}
              </p>
              <p className={`${arcadeBody.className} text-sm`} style={{ color: `${CYAN}90` }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Venue info */}
      <div
        className="border-2 p-4"
        style={{
          borderColor: `${PHOSPHOR}60`,
          background: `${BLACK}E0`,
          boxShadow: `0 0 12px ${PHOSPHOR}20`,
        }}
      >
        <p
          className={`${arcadeDisplay.className} mb-1`}
          style={{ fontSize: "0.45rem", color: PHOSPHOR, letterSpacing: "0.15em" }}
        >
          ARENA LOCATION
        </p>
        <p className={`${arcadeBody.className} text-lg`} style={{ color: "#fff" }}>
          {site.venue}
        </p>
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════
   ABOUT
   ═══════════════════════════════════════════════════════ */
const About: ThemeModule["About"] = () => (
  <Section id="about" className="flex flex-col gap-5 px-5 py-16">
    <ChromaText style={{ fontSize: "1rem" }}>
      ABOUT {site.shortName.toUpperCase()}
    </ChromaText>
    <p className={`${arcadeBody.className} text-lg leading-relaxed`} style={{ color: `${CYAN}D0` }}>
      {site.about}
    </p>
    <div className="grid grid-cols-2 gap-3">
      {highlights.map((h, i) => (
        <div
          key={h.title}
          className="border-2 p-3"
          style={{
            borderColor: i % 2 === 0 ? `${MAGENTA}60` : `${CYAN}60`,
            background: `${BLACK}E0`,
          }}
        >
          <p
            className={`${arcadeDisplay.className}`}
            style={{
              fontSize: "0.45rem",
              color: i % 2 === 0 ? MAGENTA : CYAN,
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            {h.title.toUpperCase()}
          </p>
          <p className={`${arcadeBody.className} text-sm`} style={{ color: `${CYAN}B0` }}>
            {h.description}
          </p>
        </div>
      ))}
    </div>
  </Section>
)

/* ═══════════════════════════════════════════════════════
   SPONSORS — "POWERED BY" arcade marquee style
   ═══════════════════════════════════════════════════════ */
const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className="flex flex-col gap-5 px-5 py-16">
    <ChromaText style={{ fontSize: "1rem" }}>POWERED BY</ChromaText>
    <div className="flex flex-col gap-2">
      {sponsors.map((s, i) => (
        <div
          key={s.name}
          className={`${arcadeBody.className} flex items-center gap-3 border-2 px-4 py-3 text-lg uppercase tracking-wider`}
          style={{
            borderColor: [MAGENTA, CYAN, AMBER, PHOSPHOR, MAGENTA][i % 5] + "60",
            background: `${BLACK}E0`,
            color: [MAGENTA, CYAN, AMBER, PHOSPHOR, MAGENTA][i % 5],
          }}
        >
          <span
            style={{
              fontSize: "1.2rem",
              textShadow: `0 0 8px ${[MAGENTA, CYAN, AMBER, PHOSPHOR, MAGENTA][i % 5]}`,
            }}
          >
            ◆
          </span>
          {s.name}
        </div>
      ))}
    </div>
  </Section>
)

/* ═══════════════════════════════════════════════════════
   REGISTER — "ENTER YOUR INITIALS"
   ═══════════════════════════════════════════════════════ */
const Register: ThemeModule["Register"] = () => {
  const { preselectedEvent, submitted, submitting, submit, reset } =
    useRegistration()
  const { values, setField, isValid } = useRegistrationForm(preselectedEvent)

  const inputStyle: React.CSSProperties = {
    borderColor: `${CYAN}60`,
    color: PHOSPHOR,
    background: `${BLACK}F0`,
    caretColor: PHOSPHOR,
  }

  if (submitted) {
    return (
      <Section
        id="register"
        className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center"
      >
        <ChromaText style={{ fontSize: "0.8rem", color: PHOSPHOR }}>
          PLAYER REGISTERED!
        </ChromaText>
        <div
          className="border-2 p-6"
          style={{ borderColor: PHOSPHOR, background: `${BLACK}E0`, boxShadow: `0 0 20px ${PHOSPHOR}30` }}
        >
          <p
            className={`${arcadeDisplay.className} mb-3`}
            style={{ fontSize: "1.2rem", color: AMBER, textShadow: `0 0 8px ${AMBER}` }}
          >
            ★ NEW HIGH SCORE ★
          </p>
          <p className={`${arcadeBody.className} text-lg`} style={{ color: CYAN }}>
            You&apos;re set for the battle. Check your email for details.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className={`${arcadeBody.className} mt-2 text-sm underline`}
          style={{ color: `${CYAN}80` }}
        >
          Register another
        </button>
      </Section>
    )
  }

  return (
    <Section id="register" className="flex flex-col gap-4 px-5 py-16">
      <ChromaText style={{ fontSize: "0.85rem" }}>ENTER YOUR INITIALS</ChromaText>
      <p
        className={`${arcadeBody.className} -mt-2 text-lg uppercase`}
        style={{ color: `${CYAN}A0` }}
      >
        Join the ultimate battle and etch your name in the leaderboard.
      </p>

      <form
        className={`${arcadeBody.className} flex flex-col gap-3`}
        onSubmit={(e) => {
          e.preventDefault()
          if (isValid) submit(values)
        }}
      >
        <input
          required
          placeholder="FULL NAME"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          className="border-2 px-4 py-3 text-lg uppercase tracking-wider outline-none placeholder:opacity-40"
          style={inputStyle}
        />
        <input
          required
          type="email"
          placeholder="EMAIL ADDRESS"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          className="border-2 px-4 py-3 text-lg uppercase tracking-wider outline-none placeholder:opacity-40"
          style={inputStyle}
        />
        <input
          required
          type="tel"
          placeholder="PHONE NUMBER"
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
          className="border-2 px-4 py-3 text-lg uppercase tracking-wider outline-none placeholder:opacity-40"
          style={inputStyle}
        />
        <input
          required
          placeholder="COLLEGE NAME"
          value={values.college}
          onChange={(e) => setField("college", e.target.value)}
          className="border-2 px-4 py-3 text-lg uppercase tracking-wider outline-none placeholder:opacity-40"
          style={inputStyle}
        />
        <select
          required
          value={values.eventId}
          onChange={(e) => setField("eventId", e.target.value as EventId)}
          className="border-2 px-4 py-3 text-lg uppercase tracking-wider outline-none"
          style={inputStyle}
        >
          <option value="">SELECT EVENT</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className={`${arcadeDisplay.className} mt-2 border-2 py-4 uppercase tracking-wider disabled:opacity-30`}
          style={{
            fontSize: "0.65rem",
            borderColor: AMBER,
            background: `linear-gradient(180deg, ${AMBER}, #E09800)`,
            color: BLACK,
            boxShadow: `0 4px 0 #8B6500, ${amberGlow}`,
          }}
        >
          {submitting ? "INSERTING COIN..." : "START GAME"}
        </button>
      </form>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════
   CONTACT — "GAME OVER / CREDITS"
   ═══════════════════════════════════════════════════════ */
const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="flex flex-col gap-4 px-5 py-16 pb-32">
    <ChromaText style={{ fontSize: "1rem" }}>CREDITS</ChromaText>

    <div
      className="border-2 p-4"
      style={{ borderColor: `${MAGENTA}60`, background: `${BLACK}E0` }}
    >
      <p
        className={`${arcadeDisplay.className} mb-3`}
        style={{ fontSize: "0.45rem", color: MAGENTA, letterSpacing: "0.15em" }}
      >
        GET IN TOUCH
      </p>
      <div className={`${arcadeBody.className} space-y-2 text-lg uppercase tracking-wider`}>
        <p style={{ color: CYAN }}>
          <span style={{ color: `${CYAN}60` }}>EMAIL: </span>
          {contact.email}
        </p>
        <p style={{ color: AMBER }}>
          <span style={{ color: `${AMBER}60` }}>PHONE: </span>
          {contact.phone}
        </p>
        <p style={{ color: PHOSPHOR }}>
          <span style={{ color: `${PHOSPHOR}60` }}>VENUE: </span>
          {contact.location}
        </p>
      </div>
    </div>

    <div
      className="border-2 p-4 text-center"
      style={{ borderColor: `${CYAN}30`, background: `${BLACK}E0` }}
    >
      <p className={`${arcadeBody.className} text-sm uppercase`} style={{ color: `${CYAN}60` }}>
        HOSTED BY
      </p>
      <p className={`${arcadeBody.className} text-lg`} style={{ color: `${CYAN}C0` }}>
        {site.host}
      </p>
    </div>

    <p
      className={`${arcadeBody.className} text-center text-sm uppercase tracking-widest`}
      style={{ color: `${MAGENTA}60` }}
    >
      © {site.name} — {site.motto}
    </p>
  </Section>
)

/* ═══════════════════════════════════════════════════════
   PREVIEW — World Select miniature
   ═══════════════════════════════════════════════════════ */
const Preview: ThemeModule["Preview"] = () => (
  <div
    className="relative flex h-full w-full flex-col items-center justify-center gap-1.5 overflow-hidden"
    style={{ background: BLACK }}
  >
    {/* Scanlines overlay */}
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)",
      }}
    />
    {/* Vignette */}
    <div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
      }}
    />

    <p
      className={arcadeDisplay.className}
      style={{
        color: CYAN,
        fontSize: "0.65rem",
        textShadow: `2px 0 ${MAGENTA}, -1px 0 ${CYAN}`,
        letterSpacing: "0.1em",
      }}
    >
      ARCADE &apos;92
    </p>
    <p className={`${arcadeBody.className} text-xs uppercase tracking-wider`} style={{ color: AMBER }}>
      Coin-op CRT Cabinet
    </p>
    <motion.p
      className={`${arcadeBody.className} text-[10px] uppercase`}
      style={{ color: MAGENTA }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      INSERT COIN
    </motion.p>
    <div className="mt-1 flex gap-1">
      {[BLACK, MAGENTA, CYAN, AMBER].map((c) => (
        <span
          key={c}
          className="size-3 border"
          style={{
            background: c,
            borderColor: `${CYAN}60`,
            boxShadow: `0 0 4px ${c}60`,
          }}
        />
      ))}
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════
   META + MODULE EXPORT
   ═══════════════════════════════════════════════════════ */
const meta: ThemeModule["meta"] = {
  slug: "arcade-92",
  name: "Arcade Cabinet '92",
  tagline: "Coin-op CRT cabinet",
  swatch: [BLACK, MAGENTA, CYAN, AMBER],
  fontDisplay: "--font-arcade-92-display",
  vibe: ["CRT", "neon", "coin-op"],
}

const arcade92Theme: ThemeModule = {
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

export default arcade92Theme
