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
import { useTilt } from "../_shared/use-tilt"
import {
  useRegistration,
  useRegistrationForm,
} from "../_shared/registration-context"
import { Section } from "../_shared/section"
import { holoDisplay, holoBody, holoMono } from "./fonts"

// ── Palette ──────────────────────────────────────────────────────────────
const VOID = "#0B1026"
const VOID_LIGHT = "#111838"
const GOLD = "#C9A227"
const SILVER = "#C0C0C0"
const WHITE = "#F0F0F5"
const FOIL_GRADIENT =
  "conic-gradient(from var(--foil-angle, 0deg) at 50% 50%, #ff6ec7, #ffb347, #ffd700, #7fffd4, #87ceeb, #da70d6, #ff6ec7)"

// rarity colors mapped to event difficulty
function rarityColor(difficulty: number): string {
  if (difficulty <= 2) return "#7EC8E3" // Common — icy blue
  if (difficulty === 3) return GOLD // Rare — gold
  return "#DA70D6" // Legendary — orchid/holo-purple
}
function rarityLabel(difficulty: number): string {
  if (difficulty <= 2) return "Common"
  if (difficulty === 3) return "Rare"
  return "Legendary"
}

// ── Shared helpers ───────────────────────────────────────────────────────
function goRegister() {
  document
    .getElementById("register")
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}

/** Primary CTA button – holographic sheen border + high contrast. */
function HoloRegisterButton({
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
  return (
    <button
      type="button"
      onClick={() => {
        openRegistration(eventId)
        goRegister()
      }}
      className={`${holoBody.className} relative font-bold uppercase tracking-wider transition-transform active:scale-95 ${className}`}
      style={{
        minHeight: large ? 56 : 44,
        background: `linear-gradient(135deg, ${GOLD}, #FFD700)`,
        color: VOID,
        border: "none",
        borderRadius: 8,
        padding: large ? "0 28px" : "0 20px",
        fontSize: large ? 15 : 13,
        letterSpacing: "0.08em",
        boxShadow: `0 0 18px ${GOLD}44, 0 2px 8px rgba(0,0,0,0.4)`,
      }}
    >
      {children}
    </button>
  )
}

// ── Sparkle overlay (lightweight CSS only) ───────────────────────────────
function SparkleOverlay({ reduced }: { reduced: boolean }) {
  if (reduced) return null
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6) 0%, transparent 100%), " +
          "radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.4) 0%, transparent 100%), " +
          "radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,0.5) 0%, transparent 100%), " +
          "radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.3) 0%, transparent 100%)",
        backgroundSize: "40px 40px, 60px 60px, 35px 35px, 55px 55px",
        animation: "holo-sparkle 4s linear infinite",
      }}
    />
  )
}

// ── Foil Sheen layer driven by tilt ──────────────────────────────────────
function FoilSheen({
  tiltX,
  tiltY,
  reduced,
  className = "",
}: {
  tiltX: number
  tiltY: number
  reduced: boolean
  className?: string
}) {
  const angle = reduced ? 45 : 180 + tiltX * 90 + tiltY * 45
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background: `conic-gradient(from ${angle}deg at 50% 50%, #ff6ec755, #ffb34755, #ffd70055, #7fffd455, #87ceeb55, #da70d655, #ff6ec755)`,
        mixBlendMode: "screen",
        opacity: reduced ? 0.15 : 0.3,
        transition: reduced ? "none" : "background 0.1s linear",
        borderRadius: "inherit",
      }}
    />
  )
}

// ── Event Card ───────────────────────────────────────────────────────────
function EventCard({
  ev,
  tiltX,
  tiltY,
  reduced,
  index,
}: {
  ev: SpectrumEvent
  tiltX: number
  tiltY: number
  reduced: boolean
  index: number
}) {
  const [flipped, setFlipped] = React.useState(false)
  const rColor = rarityColor(ev.difficulty)
  const rLabel = rarityLabel(ev.difficulty)
  const foilAngle = reduced ? 45 : 180 + tiltX * 90 + tiltY * 45

  // Difficulty dots
  const difficultyDots = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: i < ev.difficulty ? ev.color : `${WHITE}22`,
        marginRight: 3,
      }}
    />
  ))

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative w-full"
      style={{ perspective: 900 }}
    >
      <div
        onClick={() => setFlipped(!flipped)}
        className="relative w-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transition: reduced
            ? "none"
            : "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── Front ── */}
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{
            backfaceVisibility: "hidden",
            background: `linear-gradient(145deg, ${VOID_LIGHT}, ${VOID})`,
            border: `2px solid ${ev.color}44`,
            boxShadow: `0 0 20px ${ev.color}22, 0 4px 20px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Foil overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: `conic-gradient(from ${foilAngle}deg at 50% 50%, ${ev.color}33, #ffd70033, #7fffd433, #87ceeb33, #da70d633, ${ev.color}33)`,
              mixBlendMode: "screen",
              opacity: reduced ? 0.1 : 0.25,
              borderRadius: "inherit",
            }}
          />
          <SparkleOverlay reduced={reduced} />

          {/* Art Panel — gradient artwork area */}
          <div
            className="relative flex h-36 items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${ev.color}22, ${VOID} 60%, ${ev.color}15)`,
              borderBottom: `1px solid ${ev.color}33`,
            }}
          >
            {/* Decorative geometric shape */}
            <div
              style={{
                width: 80,
                height: 80,
                background: `conic-gradient(from ${foilAngle}deg, ${ev.color}, ${GOLD}, ${ev.color})`,
                clipPath:
                  "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                opacity: 0.6,
              }}
            />
            {/* Event number badge */}
            <span
              className={`${holoMono.className} absolute right-3 top-3 text-xs font-bold`}
              style={{ color: `${ev.color}88` }}
            >
              #{ev.index}
            </span>
            {/* Rarity gem */}
            <span
              className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{
                background: `${rColor}22`,
                color: rColor,
                border: `1px solid ${rColor}44`,
              }}
            >
              {rLabel}
            </span>
          </div>

          {/* Card body */}
          <div className="relative z-20 p-4">
            <h3
              className={`${holoDisplay.className} text-lg`}
              style={{ color: WHITE }}
            >
              {ev.name}
            </h3>
            <p
              className={`${holoBody.className} mt-1 text-xs italic`}
              style={{ color: `${WHITE}99` }}
            >
              &ldquo;{ev.description}&rdquo;
            </p>

            {/* Stat block */}
            <div
              className={`${holoMono.className} mt-3 grid grid-cols-3 gap-2 rounded-lg p-3 text-[11px]`}
              style={{
                background: `${VOID}cc`,
                border: `1px solid ${WHITE}11`,
              }}
            >
              <div>
                <div style={{ color: `${WHITE}55` }}>PLAYERS</div>
                <div style={{ color: WHITE }}>{ev.teamSize}</div>
              </div>
              <div>
                <div style={{ color: `${WHITE}55` }}>FORMAT</div>
                <div style={{ color: WHITE }}>{ev.format}</div>
              </div>
              <div>
                <div style={{ color: `${WHITE}55` }}>DIFFICULTY</div>
                <div className="mt-0.5">{difficultyDots}</div>
              </div>
            </div>

            {/* Cost */}
            <div
              className={`${holoMono.className} mt-3 flex items-center justify-between text-sm`}
            >
              <span style={{ color: `${WHITE}77` }}>Entry Fee</span>
              <span className="font-bold" style={{ color: GOLD }}>
                {ev.fee}
              </span>
            </div>

            {/* Register CTA */}
            <HoloRegisterButton
              eventId={ev.id}
              className="mt-3 w-full"
            >
              Register — {ev.shortName}
            </HoloRegisterButton>

            <p
              className={`${holoBody.className} mt-2 text-center text-[10px]`}
              style={{ color: `${WHITE}44` }}
            >
              Tap card to flip for rules
            </p>
          </div>
        </div>

        {/* ── Back (rules / prizes) ── */}
        <div
          className="absolute inset-0 w-full overflow-auto rounded-xl p-5"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(145deg, ${VOID_LIGHT}, ${VOID})`,
            border: `2px solid ${ev.color}44`,
            boxShadow: `0 0 20px ${ev.color}22, 0 4px 20px rgba(0,0,0,0.5)`,
          }}
        >
          <h4
            className={`${holoDisplay.className} text-base`}
            style={{ color: ev.color }}
          >
            {ev.name} — Rules
          </h4>
          <ul
            className={`${holoBody.className} mt-3 space-y-2 text-xs`}
            style={{ color: `${WHITE}cc` }}
          >
            {ev.rules.map((r) => (
              <li key={r} className="flex gap-2">
                <span style={{ color: ev.color }}>◆</span>
                {r}
              </li>
            ))}
          </ul>

          <h4
            className={`${holoDisplay.className} mt-5 text-sm`}
            style={{ color: GOLD }}
          >
            Loot Rewards
          </h4>
          <ul
            className={`${holoBody.className} mt-2 space-y-1.5 text-xs`}
            style={{ color: `${WHITE}cc` }}
          >
            {ev.prizes.map((p) => (
              <li key={p.place} className="flex items-center gap-2">
                <span
                  className="inline-block size-3 rounded-sm"
                  style={{
                    background:
                      p.place === "1st Place"
                        ? GOLD
                        : p.place === "2nd Place"
                        ? SILVER
                        : "#CD7F32",
                  }}
                />
                <span className="font-bold" style={{ color: WHITE }}>
                  {p.place}:
                </span>{" "}
                {p.reward}
              </li>
            ))}
          </ul>

          <p
            className={`${holoBody.className} mt-4 text-[10px]`}
            style={{ color: `${WHITE}44` }}
          >
            Registration ends: {ev.registrationEnds}
          </p>
          <p
            className={`${holoBody.className} mt-3 text-center text-[10px]`}
            style={{ color: `${WHITE}55` }}
          >
            Tap to flip back
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Global CSS injection (scoped via <style>) ───────────────────────────
function HoloStyles() {
  return (
    <style>{`
      @keyframes holo-sparkle {
        0% { background-position: 0 0, 0 0, 0 0, 0 0; }
        100% { background-position: 40px 40px, -60px 60px, 35px -35px, -55px -55px; }
      }
      @keyframes holo-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes holo-pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
      @keyframes holo-sweep {
        0% { transform: translateX(-100%) rotate(15deg); }
        100% { transform: translateX(200%) rotate(15deg); }
      }
    `}</style>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════
const Background: ThemeModule["Background"] = () => {
  const reduced = useReducedMotion()
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: VOID }}
    >
      <HoloStyles />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${WHITE}22 1px, transparent 1px), linear-gradient(90deg, ${WHITE}22 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Floating particles */}
      {!reduced &&
        Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 41 + 7) % 100}%`,
              top: `${(i * 37 + 13) % 100}%`,
              background: i % 3 === 0 ? GOLD : i % 3 === 1 ? "#DA70D6" : "#7FFFD4",
              animation: `holo-pulse ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.3,
            }}
          />
        ))}
      {/* Radial glow center */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${GOLD}08 0%, transparent 60%)`,
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCK — persistent bottom bar with Register CTA + "hand of cards" nav
// ═══════════════════════════════════════════════════════════════════════════
const Dock: ThemeModule["Dock"] = () => {
  const sections = [
    { label: "Home", id: "home", emoji: "🏠" },
    { label: "Events", id: "events", emoji: "🃏" },
    { label: "Schedule", id: "schedule", emoji: "⏱" },
    { label: "Sponsors", id: "sponsors", emoji: "⭐" },
  ]
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-stretch gap-2 border-t px-2 pt-2"
      style={{
        background: `linear-gradient(180deg, ${VOID_LIGHT}f8, ${VOID}fa)`,
        borderColor: `${GOLD}33`,
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
        backdropFilter: "blur(12px)",
        minHeight: 56,
      }}
    >
      {/* Secondary nav — hand of mini cards */}
      <nav
        className={`${holoBody.className} flex flex-1 items-center justify-around`}
      >
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] transition-colors active:bg-white/5"
            style={{ color: `${WHITE}77`, minWidth: 44, minHeight: 44, justifyContent: "center" }}
          >
            <span className="text-sm">{s.emoji}</span>
            <span>{s.label}</span>
          </a>
        ))}
      </nav>
      {/* Primary Register action */}
      <HoloRegisterButton large className="my-1 shrink-0">
        Register
      </HoloRegisterButton>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO — "Card pack" with event reveal
// ═══════════════════════════════════════════════════════════════════════════
const Hero: ThemeModule["Hero"] = () => {
  const cd = useCountdown()
  const reduced = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const tilt = useTilt(ref)
  const [revealed, setRevealed] = React.useState(false)

  // Auto-reveal after 1.2s or on tap (skippable)
  React.useEffect(() => {
    if (reduced) {
      setRevealed(true)
      return
    }
    const t = setTimeout(() => setRevealed(true), 1200)
    return () => clearTimeout(t)
  }, [reduced])

  const foilAngle = reduced ? 45 : 180 + tilt.x * 90 + tilt.y * 45

  return (
    <Section
      id="home"
      className="relative flex flex-col items-center justify-center gap-5 px-6 pb-32 pt-16 text-center"
    >
      <div ref={ref as React.RefObject<HTMLDivElement>} className="relative flex w-full max-w-sm flex-col items-center gap-5">
        {/* Eyebrow */}
        <p
          className={`${holoBody.className} text-[11px] font-semibold uppercase tracking-[0.3em]`}
          style={{ color: `${WHITE}77` }}
        >
          {site.eyebrow}
        </p>

        {/* Title as a "pack" card */}
        <motion.div
          className="relative w-full max-w-xs overflow-hidden rounded-2xl p-6"
          style={{
            background: `linear-gradient(145deg, ${VOID_LIGHT}, ${VOID})`,
            border: `2px solid ${GOLD}33`,
            boxShadow: `0 0 40px ${GOLD}11, 0 8px 32px rgba(0,0,0,0.5)`,
          }}
          initial={reduced ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          onClick={() => !revealed && setRevealed(true)}
        >
          <FoilSheen
            tiltX={tilt.x}
            tiltY={tilt.y}
            reduced={reduced}
            className="rounded-2xl"
          />
          <SparkleOverlay reduced={reduced} />

          {/* Pack burst effect */}
          <AnimatePresence>
            {!revealed && !reduced && (
              <motion.div
                className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}cc, ${VOID})`,
                }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                <p
                  className={`${holoDisplay.className} text-sm`}
                  style={{ color: WHITE }}
                >
                  Tap to Open
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-20 flex flex-col items-center gap-3">
            <h1
              className={holoDisplay.className}
              style={{
                color: WHITE,
                fontSize: "2rem",
                lineHeight: 1.2,
              }}
            >
              {site.shortName}
              <br />
              <span
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, #FFD700)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {site.version}
              </span>
            </h1>
            <p
              className={`${holoBody.className} max-w-xs text-sm`}
              style={{ color: `${WHITE}bb` }}
            >
              {site.tagline}
            </p>

            {/* Register CTA above the fold */}
            <HoloRegisterButton className="mt-1" large>
              Register Now
            </HoloRegisterButton>
          </div>
        </motion.div>

        {/* Countdown */}
        <div
          className={`${holoMono.className} grid w-full max-w-xs grid-cols-4 gap-2 rounded-xl p-4`}
          style={{
            background: `${VOID_LIGHT}cc`,
            border: `1px solid ${WHITE}11`,
          }}
        >
          <p
            className={`${holoBody.className} col-span-4 mb-1 text-center text-[10px] font-semibold uppercase tracking-wider`}
            style={{ color: `${WHITE}55` }}
          >
            Pack Opens In
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
                className="text-xl font-bold"
                style={{
                  color: GOLD,
                }}
              >
                {pad2(value)}
              </div>
              <div
                className="text-[9px] uppercase"
                style={{ color: `${WHITE}55` }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Date & Venue */}
        <p
          className={`${holoBody.className} text-xs`}
          style={{ color: `${WHITE}66` }}
        >
          {site.date} · {site.venue}
        </p>

        {/* Fan of 4 mini card previews */}
        {revealed && (
          <motion.div
            className="flex gap-2"
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {events.map((ev, i) => (
              <motion.div
                key={ev.id}
                className="rounded-lg"
                style={{
                  width: 56,
                  height: 76,
                  background: `linear-gradient(145deg, ${VOID_LIGHT}, ${ev.color}33)`,
                  border: `1px solid ${ev.color}44`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
                initial={
                  reduced ? {} : { rotate: -10 + i * 7, y: 30, opacity: 0 }
                }
                animate={{ rotate: 0, y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <span
                  className={`${holoMono.className} text-[8px]`}
                  style={{ color: ev.color }}
                >
                  #{ev.index}
                </span>
                <span
                  className={`${holoBody.className} text-center text-[8px] font-bold leading-tight`}
                  style={{ color: WHITE }}
                >
                  {ev.shortName}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS — foil trading cards
// ═══════════════════════════════════════════════════════════════════════════
const Events: ThemeModule["Events"] = () => {
  const reduced = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const tilt = useTilt(ref)

  return (
    <Section
      id="events"
      className="flex flex-col gap-6 px-5 py-16"
    >
      <div ref={ref as React.RefObject<HTMLDivElement>}>
        <h2
          className={`${holoDisplay.className} text-xl`}
          style={{ color: WHITE }}
        >
          Card Collection
        </h2>
        <p
          className={`${holoBody.className} -mt-1 text-sm`}
          style={{ color: `${WHITE}77` }}
        >
          {site.legacyLine}
        </p>
      </div>
      <div className="flex flex-col gap-5">
        {events.map((ev, i) => (
          <EventCard
            key={ev.id}
            ev={ev}
            tiltX={tilt.x}
            tiltY={tilt.y}
            reduced={reduced}
            index={i}
          />
        ))}
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULE — "Turn Order" track
// ═══════════════════════════════════════════════════════════════════════════
const Schedule: ThemeModule["Schedule"] = () => {
  const reduced = useReducedMotion()
  return (
    <Section id="schedule" className="flex flex-col gap-5 px-5 py-16">
      <h2
        className={`${holoDisplay.className} text-xl`}
        style={{ color: WHITE }}
      >
        Turn Order
      </h2>
      <p
        className={`${holoBody.className} -mt-3 text-sm`}
        style={{ color: `${WHITE}77` }}
      >
        {site.date} — Battle Timeline
      </p>
      <ol className="relative space-y-0">
        {schedule.map((item, i) => (
          <motion.li
            key={item.title}
            className="relative flex gap-4 pb-6"
            initial={reduced ? {} : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            {/* Connector line */}
            {i < schedule.length - 1 && (
              <div
                className="absolute left-[15px] top-8 h-full w-px"
                style={{ background: `${GOLD}33` }}
              />
            )}
            {/* Turn number badge */}
            <div
              className={`${holoMono.className} relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold`}
              style={{
                background: `${GOLD}22`,
                border: `1px solid ${GOLD}55`,
                color: GOLD,
              }}
            >
              {i + 1}
            </div>
            <div className="flex-1 pt-0.5">
              <p
                className={`${holoMono.className} text-xs font-bold`}
                style={{ color: GOLD }}
              >
                {item.time}
              </p>
              <p
                className={`${holoBody.className} text-sm font-bold`}
                style={{ color: WHITE }}
              >
                {item.title}
              </p>
              <p
                className={`${holoBody.className} text-xs`}
                style={{ color: `${WHITE}77` }}
              >
                {item.description}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
      {/* Venue card */}
      <div
        className={`${holoBody.className} rounded-xl p-4 text-sm`}
        style={{
          background: `${VOID_LIGHT}cc`,
          border: `1px solid ${WHITE}11`,
          color: `${WHITE}cc`,
        }}
      >
        📍 {site.venue}
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ABOUT
// ═══════════════════════════════════════════════════════════════════════════
const About: ThemeModule["About"] = () => (
  <Section id="about" className="flex flex-col gap-5 px-5 py-16">
    <h2
      className={`${holoDisplay.className} text-xl`}
      style={{ color: WHITE }}
    >
      About {site.name}
    </h2>
    <p
      className={`${holoBody.className} text-sm leading-relaxed`}
      style={{ color: `${WHITE}cc` }}
    >
      {site.about}
    </p>
    <div className="grid grid-cols-2 gap-3">
      {highlights.map((h) => (
        <div
          key={h.title}
          className="rounded-xl p-4"
          style={{
            background: `${VOID_LIGHT}cc`,
            border: `1px solid ${WHITE}11`,
          }}
        >
          <p
            className={`${holoBody.className} text-sm font-bold`}
            style={{ color: WHITE }}
          >
            {h.title}
          </p>
          <p
            className={`${holoBody.className} mt-1 text-xs`}
            style={{ color: `${WHITE}77` }}
          >
            {h.description}
          </p>
        </div>
      ))}
    </div>
    {/* Prize pool highlight */}
    <div
      className="flex items-center justify-center gap-3 rounded-xl p-5"
      style={{
        background: `linear-gradient(135deg, ${GOLD}11, ${VOID_LIGHT})`,
        border: `1px solid ${GOLD}33`,
      }}
    >
      <span className="text-3xl">🏆</span>
      <div>
        <p
          className={`${holoDisplay.className} text-lg`}
          style={{
            background: `linear-gradient(135deg, ${GOLD}, #FFD700)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {site.prizePool}
        </p>
        <p
          className={`${holoBody.className} text-xs`}
          style={{ color: `${WHITE}77` }}
        >
          Total Prize Pool
        </p>
      </div>
    </div>
  </Section>
)

// ═══════════════════════════════════════════════════════════════════════════
// SPONSORS — card rarity style
// ═══════════════════════════════════════════════════════════════════════════
const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className="flex flex-col gap-5 px-5 py-16">
    <h2
      className={`${holoDisplay.className} text-xl`}
      style={{ color: WHITE }}
    >
      Legendary Allies
    </h2>
    <div className="flex flex-col gap-3">
      {sponsors.map((s, i) => (
        <div
          key={s.name}
          className={`${holoBody.className} relative overflow-hidden rounded-xl px-5 py-4 text-sm font-bold`}
          style={{
            background: `${VOID_LIGHT}cc`,
            border: `1px solid ${GOLD}22`,
            color: WHITE,
          }}
        >
          {/* Sweep highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent 30%, ${GOLD}11 50%, transparent 70%)`,
              animation: "holo-sweep 4s ease-in-out infinite",
              animationDelay: `${i * 0.6}s`,
            }}
          />
          <span className="relative z-10 flex items-center gap-3">
            <span
              className="inline-block size-3 rounded-sm"
              style={{ background: GOLD }}
            />
            {s.name}
          </span>
        </div>
      ))}
    </div>
  </Section>
)

// ═══════════════════════════════════════════════════════════════════════════
// REGISTER — the 5-field form
// ═══════════════════════════════════════════════════════════════════════════
const Register: ThemeModule["Register"] = () => {
  const { preselectedEvent, submitted, submitting, submit, reset } =
    useRegistration()
  const { values, setField, isValid } = useRegistrationForm(preselectedEvent)
  const inputStyle: React.CSSProperties = {
    background: `${VOID_LIGHT}`,
    border: `1px solid ${WHITE}22`,
    color: WHITE,
    borderRadius: 10,
  }

  if (submitted) {
    return (
      <Section
        id="register"
        className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center"
      >
        <div
          className="flex size-16 items-center justify-center rounded-full text-3xl"
          style={{
            background: `${GOLD}22`,
            border: `2px solid ${GOLD}55`,
          }}
        >
          ✨
        </div>
        <h2
          className={`${holoDisplay.className} text-lg`}
          style={{ color: WHITE }}
        >
          Card Registered!
        </h2>
        <p
          className={`${holoBody.className} text-sm`}
          style={{ color: `${WHITE}bb` }}
        >
          You&apos;re in the deck. Check your email for details.
        </p>
        <button
          type="button"
          onClick={reset}
          className={`${holoBody.className} mt-2 text-xs underline`}
          style={{ color: `${WHITE}66` }}
        >
          Register another
        </button>
      </Section>
    )
  }

  return (
    <Section id="register" className="flex flex-col gap-5 px-5 py-16">
      <h2
        className={`${holoDisplay.className} text-xl`}
        style={{ color: WHITE }}
      >
        Join the Deck
      </h2>
      <p
        className={`${holoBody.className} -mt-3 text-sm`}
        style={{ color: `${WHITE}77` }}
      >
        Add your card to {site.name}.
      </p>
      <form
        className={`${holoBody.className} flex flex-col gap-3`}
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
          className="px-4 py-3 text-sm outline-none placeholder:text-white/30"
          style={inputStyle}
        />
        <input
          required
          type="email"
          placeholder="Email Address"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          className="px-4 py-3 text-sm outline-none placeholder:text-white/30"
          style={inputStyle}
        />
        <input
          required
          type="tel"
          placeholder="Phone Number"
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
          className="px-4 py-3 text-sm outline-none placeholder:text-white/30"
          style={inputStyle}
        />
        <input
          required
          placeholder="College Name"
          value={values.college}
          onChange={(e) => setField("college", e.target.value)}
          className="px-4 py-3 text-sm outline-none placeholder:text-white/30"
          style={inputStyle}
        />
        <select
          required
          value={values.eventId}
          onChange={(e) => setField("eventId", e.target.value as EventId)}
          className="px-4 py-3 text-sm outline-none"
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
          className="mt-2 rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-transform active:scale-95 disabled:opacity-40"
          style={{
            background: `linear-gradient(135deg, ${GOLD}, #FFD700)`,
            color: VOID,
            border: "none",
            boxShadow: `0 0 18px ${GOLD}44`,
          }}
        >
          {submitting ? "Shuffling…" : "Add to Collection"}
        </button>
      </form>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════════════════════════════════════════
const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="flex flex-col gap-4 px-5 py-16 pb-32">
    <h2
      className={`${holoDisplay.className} text-xl`}
      style={{ color: WHITE }}
    >
      Get In Touch
    </h2>
    <div
      className={`${holoBody.className} space-y-2 rounded-xl p-5 text-sm`}
      style={{
        background: `${VOID_LIGHT}cc`,
        border: `1px solid ${WHITE}11`,
        color: `${WHITE}cc`,
      }}
    >
      <p className="flex items-center gap-3">
        <span>✉️</span> {contact.email}
      </p>
      <p className="flex items-center gap-3">
        <span>📞</span> {contact.phone}
      </p>
      <p className="flex items-center gap-3">
        <span>📍</span> {contact.location}
      </p>
    </div>
    <p
      className={`${holoBody.className} text-center text-xs`}
      style={{ color: `${WHITE}44` }}
    >
      {site.host}
    </p>
  </Section>
)

// ═══════════════════════════════════════════════════════════════════════════
// PREVIEW — Live miniature for World Select (renders at ~340×220)
// ═══════════════════════════════════════════════════════════════════════════
const Preview: ThemeModule["Preview"] = () => (
  <div
    className="relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden"
    style={{ background: VOID }}
  >
    {/* Mini foil sheen */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "conic-gradient(from 135deg at 50% 50%, #ff6ec733, #ffb34733, #ffd70033, #7fffd433, #87ceeb33, #da70d633, #ff6ec733)",
        mixBlendMode: "screen",
        animation: "holo-pulse 3s ease-in-out infinite",
      }}
    />
    {/* Mini sparkle dots */}
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          width: 2,
          height: 2,
          left: `${(i * 41 + 10) % 100}%`,
          top: `${(i * 37 + 15) % 100}%`,
          background: i % 2 === 0 ? GOLD : "#DA70D6",
          animation: `holo-pulse ${2 + (i % 3)}s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`,
        }}
      />
    ))}
    {/* Mini card stack */}
    <div className="relative flex gap-1">
      {events.map((ev, i) => (
        <div
          key={ev.id}
          className="rounded"
          style={{
            width: 28,
            height: 38,
            background: `linear-gradient(145deg, ${VOID_LIGHT}, ${ev.color}33)`,
            border: `1px solid ${ev.color}55`,
            transform: `rotate(${-6 + i * 4}deg)`,
          }}
        />
      ))}
    </div>
    <p
      className={`${holoDisplay.className} relative text-xs`}
      style={{ color: WHITE }}
    >
      Holo Deck
    </p>
    <p
      className={`${holoBody.className} relative text-[9px]`}
      style={{ color: `${WHITE}88` }}
    >
      Holographic TCG cards
    </p>
    {/* Swatch */}
    <div className="relative mt-1 flex gap-1">
      {[VOID, GOLD, "#6FBF5B", "#EC4B8C"].map((c) => (
        <span
          key={c}
          className="size-2.5 rounded-sm border"
          style={{ background: c, borderColor: `${WHITE}22` }}
        />
      ))}
    </div>
    <style>{`
      @keyframes holo-pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
    `}</style>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════
// META & EXPORT
// ═══════════════════════════════════════════════════════════════════════════
const meta: ThemeModule["meta"] = {
  slug: "holo-deck",
  name: "Holo Deck",
  tagline: "Holographic TCG cards",
  swatch: [VOID, GOLD, "#6FBF5B", "#EC4B8C"],
  fontDisplay: "--font-holo-deck-display",
  vibe: ["foil", "cards", "gyro"],
}

const holoDeckTheme: ThemeModule = {
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

export default holoDeckTheme
