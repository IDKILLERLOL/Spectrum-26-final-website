"use client"

import * as React from "react"
import type { ThemeModule } from "../types"
import type { EventId } from "@/content/spectrum"
import { site, events, schedule, highlights, sponsors, contact, nav } from "@/content/spectrum"
import { useCountdown, pad2 } from "../_shared/use-countdown"
import { useReducedMotion } from "../_shared/use-reduced-motion"
import { useRegistration, useRegistrationForm } from "../_shared/registration-context"
import { Section } from "../_shared/section"
import { nesFont } from "./fonts"

const SKY = "#5C94FC"
const BRICK = "#C84C0C"
const GROUND = "#E4A672"
const PIPE = "#00A800"
const COIN = "#FCBC3C"
const BLACK = "#000000"
const WHITE = "#FFFFFF"

const meta: ThemeModule["meta"] = {
  slug: "side-scroll",
  name: "World 1-1",
  tagline: "True 8-bit NES side-scroller",
  swatch: [SKY, BRICK, COIN, PIPE],
  fontDisplay: "--font-side-scroll-display",
  vibe: ["8-bit", "NES", "side-scroll"],
}

const sectionLinks = [
  { id: "home", label: nav[0].label },
  { id: "events", label: nav[1].label },
  { id: "schedule", label: nav[2].label },
  { id: "about", label: "Info" },
  { id: "sponsors", label: nav[3].label },
  { id: "register", label: "Join" },
  { id: "contact", label: "Comms" },
]

function scoreValue() {
  return site.prizePoolNumeric.toString().padStart(6, "0")
}

function worldValue() {
  return site.version.replace(".", "-")
}

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
}

function goRegister() {
  goTo("register")
}

function NesButton({
  eventId,
  children,
  className = "",
  small = false,
}: {
  eventId?: EventId
  children: React.ReactNode
  className?: string
  small?: boolean
}) {
  const { openRegistration } = useRegistration()
  const [down, setDown] = React.useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        openRegistration(eventId)
        goRegister()
      }}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      className={`nes-action ${small ? "nes-action--small" : ""} ${className}`}
      style={{ transform: down ? "translate(4px, 4px)" : "translate(0, 0)" }}
    >
      {children}
    </button>
  )
}

function SideScrollStyles() {
  return (
    <style jsx global>{`
      [data-theme="side-scroll"] {
        --nes-sky: ${SKY};
        --nes-brick: ${BRICK};
        --nes-ground: ${GROUND};
        --nes-pipe: ${PIPE};
        --nes-coin: ${COIN};
        --nes-black: ${BLACK};
        --nes-white: ${WHITE};
        background: var(--nes-sky);
        color: var(--nes-black);
        font-family: var(--font-side-scroll-display), monospace;
        image-rendering: pixelated;
        -webkit-font-smoothing: none;
        font-smooth: never;
      }

      [data-theme="side-scroll"] main {
        display: flex;
        height: 100dvh;
        min-height: 100dvh;
        overflow-x: auto;
        overflow-y: hidden;
        padding-bottom: 0;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
      }

      [data-theme="side-scroll"] main::-webkit-scrollbar {
        display: none;
      }

      [data-theme="side-scroll"] main > section {
        position: relative;
        flex: 0 0 100%;
        width: 100%;
        min-width: 100%;
        min-height: 100dvh;
        scroll-snap-align: start;
        scroll-snap-stop: always;
        overflow: hidden auto;
        padding-top: 88px;
        padding-bottom: 128px;
      }

      [data-theme="side-scroll"] button,
      [data-theme="side-scroll"] input,
      [data-theme="side-scroll"] select,
      [data-theme="side-scroll"] a {
        font-family: var(--font-side-scroll-display), monospace;
        letter-spacing: 0;
      }

      .nes-page {
        font-size: 8px;
        line-height: 1.6;
      }

      .nes-title {
        font-size: 24px;
        line-height: 1.4;
        text-shadow: 4px 4px 0 var(--nes-black);
      }

      .nes-subtitle {
        font-size: 16px;
        line-height: 1.6;
      }

      .nes-copy {
        font-size: 8px;
        line-height: 2;
      }

      .nes-panel {
        border: 4px solid var(--nes-black);
        background: var(--nes-ground);
        box-shadow: 8px 8px 0 var(--nes-black);
      }

      .nes-action {
        min-height: 56px;
        border: 4px solid var(--nes-black);
        background: var(--nes-coin);
        color: var(--nes-black);
        box-shadow: 8px 8px 0 var(--nes-black);
        padding: 12px 16px;
        text-transform: uppercase;
        font-size: 8px;
        line-height: 1.5;
        transition: transform 80ms steps(1, end), box-shadow 80ms steps(1, end);
        touch-action: manipulation;
      }

      .nes-action--small {
        min-height: 44px;
        box-shadow: 4px 4px 0 var(--nes-black);
        padding: 8px 12px;
      }

      .nes-hud {
        position: fixed;
        top: 0;
        left: 50%;
        z-index: 40;
        width: 100%;
        max-width: 480px;
        min-height: 56px;
        transform: translateX(-50%);
        border-bottom: 4px solid var(--nes-black);
        background: var(--nes-black);
        color: var(--nes-white);
        padding: 8px;
      }

      .nes-dock {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 40;
        display: flex;
        min-height: 56px;
        align-items: stretch;
        gap: 8px;
        border-top: 4px solid var(--nes-black);
        background: var(--nes-black);
        padding: 8px;
        padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
      }

      @media (min-width: 768px) {
        .nes-dock {
          left: 50%;
          width: 480px;
          transform: translateX(-50%);
        }
      }

      .nes-dock-nav {
        display: grid;
        flex: 1;
        grid-template-columns: repeat(4, minmax(44px, 1fr));
        gap: 4px;
      }

      .nes-nav-pipe {
        min-height: 48px;
        border: 4px solid var(--nes-black);
        background: var(--nes-pipe);
        color: var(--nes-white);
        font-size: 8px;
        line-height: 1;
        text-shadow: 2px 2px 0 var(--nes-black);
        touch-action: manipulation;
      }

      .nes-ground {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 0;
        display: grid;
        grid-template-columns: repeat(24, 16px);
        grid-auto-rows: 16px;
        justify-content: center;
        border-top: 4px solid var(--nes-black);
        background: var(--nes-ground);
      }

      .nes-tile {
        width: 16px;
        height: 16px;
        border-right: 2px solid var(--nes-black);
        border-bottom: 2px solid var(--nes-black);
        background: var(--nes-ground);
      }

      .nes-tile:nth-child(4n + 1),
      .nes-tile:nth-child(4n + 4) {
        background: var(--nes-brick);
      }

      .nes-cloud,
      .nes-bush {
        position: absolute;
        z-index: 0;
        width: 80px;
        height: 40px;
        color: var(--nes-white);
      }

      .nes-bush {
        color: var(--nes-pipe);
      }

      .nes-pipe-big {
        position: absolute;
        z-index: 1;
        width: 72px;
        height: 104px;
        border: 4px solid var(--nes-black);
        background: var(--nes-pipe);
      }

      .nes-pipe-big::before {
        position: absolute;
        top: -20px;
        left: -12px;
        width: 96px;
        height: 28px;
        border: 4px solid var(--nes-black);
        background: var(--nes-pipe);
        content: "";
      }

      .nes-block {
        position: relative;
        display: flex;
        width: 56px;
        height: 56px;
        align-items: center;
        justify-content: center;
        border: 4px solid var(--nes-black);
        background: var(--nes-coin);
        color: var(--nes-white);
        font-size: 24px;
        line-height: 1;
        text-shadow: 4px 4px 0 var(--nes-black);
        box-shadow: inset -8px -8px 0 #c84c0c;
        transition: transform 120ms steps(2, end);
        touch-action: manipulation;
      }

      .nes-block.is-hit {
        transform: translateY(-16px);
      }

      .nes-coin {
        position: absolute;
        top: -32px;
        left: 16px;
        width: 16px;
        height: 24px;
        border: 4px solid var(--nes-black);
        background: var(--nes-coin);
        opacity: 0;
        transform: translateY(16px);
      }

      .nes-coin.is-live {
        animation: coin-pop 480ms steps(4, end);
      }

      .nes-runner {
        position: fixed;
        bottom: calc(82px + env(safe-area-inset-bottom, 0px));
        left: 50%;
        z-index: 32;
        width: 32px;
        height: 40px;
        transform: translateX(calc(-220px + var(--runner-x, 56) * 1px));
        pointer-events: none;
      }

      @media (max-width: 767px) {
        .nes-runner {
          left: 0;
          transform: translateX(calc(var(--runner-x, 56) * 1px));
        }
      }

      .nes-avatar {
        position: relative;
        width: 32px;
        height: 40px;
      }

      .nes-avatar span {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--nes-brick);
        box-shadow:
          8px 0 0 var(--nes-brick),
          16px 0 0 var(--nes-brick),
          0 8px 0 var(--nes-ground),
          8px 8px 0 var(--nes-ground),
          16px 8px 0 var(--nes-ground),
          24px 8px 0 var(--nes-black),
          0 16px 0 var(--nes-brick),
          8px 16px 0 var(--nes-brick),
          16px 16px 0 var(--nes-brick),
          8px 24px 0 var(--nes-pipe),
          16px 24px 0 var(--nes-pipe),
          0 32px 0 var(--nes-black),
          24px 32px 0 var(--nes-black);
      }

      .nes-avatar.is-walking span {
        animation: walk-step 333ms steps(4, end) infinite;
      }

      .nes-flicker {
        animation: sprite-flicker 333ms steps(2, end) infinite;
      }

      .nes-intro {
        pointer-events: none;
        animation: intro-hide 1480ms steps(4, end) forwards;
      }

      .nes-intro-stage {
        animation: intro-card 1480ms steps(4, end) forwards;
      }

      .nes-skip {
        pointer-events: auto;
      }

      @keyframes walk-step {
        0%,
        100% {
          transform: translateY(0);
        }
        25% {
          transform: translateY(-4px);
        }
        50% {
          transform: translateY(0);
        }
        75% {
          transform: translateY(-4px);
        }
      }

      @keyframes sprite-flicker {
        0%,
        50% {
          opacity: 1;
        }
        51%,
        100% {
          opacity: 0.55;
        }
      }

      @keyframes coin-pop {
        0% {
          opacity: 1;
          transform: translateY(16px) scaleX(1);
        }
        25% {
          opacity: 1;
          transform: translateY(-8px) scaleX(0.5);
        }
        50% {
          opacity: 1;
          transform: translateY(-24px) scaleX(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-40px) scaleX(0.25);
        }
      }

      @keyframes intro-hide {
        0%,
        92% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }

      @keyframes intro-card {
        0%,
        20% {
          opacity: 1;
          transform: translateY(0);
        }
        40%,
        65% {
          opacity: 1;
          transform: translateY(-8px);
        }
        100% {
          opacity: 0;
          transform: translateY(-16px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .nes-avatar.is-walking,
        .nes-flicker,
        .nes-coin.is-live,
        .nes-intro,
        .nes-intro-stage {
          animation: none;
        }
      }
    `}</style>
  )
}

function Ground() {
  return (
    <div className="nes-ground" aria-hidden>
      {Array.from({ length: 48 }).map((_, i) => (
        <span key={i} className="nes-tile" />
      ))}
    </div>
  )
}

function SpriteBlob({ kind, className = "" }: { kind: "cloud" | "bush"; className?: string }) {
  const cn = kind === "cloud" ? "nes-cloud" : "nes-bush"
  return (
    <div className={`${cn} ${className}`} aria-hidden>
      <span
        className="absolute left-0 top-4 size-4 border-4 border-black"
        style={{ background: "currentColor" }}
      />
      <span
        className="absolute left-4 top-0 h-8 w-8 border-4 border-black"
        style={{ background: "currentColor" }}
      />
      <span
        className="absolute left-12 top-4 size-4 border-4 border-black"
        style={{ background: "currentColor" }}
      />
      <span
        className="absolute left-2 top-6 h-4 w-16 border-4 border-black"
        style={{ background: "currentColor" }}
      />
    </div>
  )
}

function PipeGate({ target, label, className = "" }: { target: string; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => goTo(target)}
      className={`nes-pipe-big ${className}`}
      aria-label={label}
    >
      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black px-2 py-1 text-[8px] text-white">
        {label}
      </span>
    </button>
  )
}

function Runner({ reduced }: { reduced: boolean }) {
  return (
    <div className="nes-runner" aria-hidden>
      <div className={`nes-avatar ${reduced ? "" : "is-walking"}`}>
        <span />
      </div>
    </div>
  )
}

function BrickBurst({ live }: { live: boolean }) {
  if (!live) return null
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2" aria-hidden>
      {[
        ["-24px", "-24px"],
        ["24px", "-24px"],
        ["-32px", "20px"],
        ["32px", "20px"],
      ].map(([x, y], i) => (
        <span
          key={`${x}${y}`}
          className="absolute left-6 top-6 size-3 border-2 border-black"
          style={{
            background: BRICK,
            opacity: 0,
            transform: `translate(${x}, ${y})`,
            animation: `coin-pop 420ms steps(4, end) ${i * 40}ms`,
          }}
        />
      ))}
    </div>
  )
}

// Fixed sky, tile field, and scoped global CSS for the side-scroller world.
const Background: ThemeModule["Background"] = () => (
  <>
    <SideScrollStyles />
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: SKY }} aria-hidden>
      {Array.from({ length: 180 }).map((_, i) => (
        <span
          key={i}
          className="absolute size-2"
          style={{
            left: `${(i * 8) % 100}%`,
            top: `${Math.floor(i / 14) * 8}px`,
            borderRight: `1px solid ${BLACK}`,
            borderBottom: `1px solid ${BLACK}`,
            opacity: 0.12,
          }}
        />
      ))}
      <SpriteBlob kind="cloud" className="left-8 top-24" />
      <SpriteBlob kind="cloud" className="right-10 top-40" />
      <SpriteBlob kind="bush" className="bottom-28 left-12" />
      <SpriteBlob kind="bush" className="bottom-28 right-16" />
    </div>
  </>
)

const Dock: ThemeModule["Dock"] = () => {
  const [paused, setPaused] = React.useState(false)
  const [runnerX, setRunnerX] = React.useState(56)
  const countdown = useCountdown()
  const reduced = useReducedMotion()
  const time = `${pad2(Math.min(countdown.days, 99))}*${pad2(countdown.hours)}`

  React.useEffect(() => {
    const main = document.querySelector('[data-theme="side-scroll"] main')
    if (!main) return

    const update = () => {
      const max = Math.max(1, main.scrollWidth - main.clientWidth)
      const width = Math.min(480, window.innerWidth)
      const min = 40
      const maxX = Math.max(min, width - 76)
      setRunnerX(Math.round(min + (main.scrollLeft / max) * (maxX - min)))
    }

    update()
    main.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      main.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <>
      <div className={`${nesFont.className} nes-hud`}>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[8px] leading-4">
            <span>
              {site.shortName.toUpperCase()} x{events.length}
            </span>
            <span>SCORE {scoreValue()}</span>
            <span>WORLD {worldValue()}</span>
            <span>TIME {time}</span>
          </div>
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            className="min-h-11 border-4 border-white bg-black px-3 text-[8px] text-white"
            aria-expanded={paused}
          >
            START
          </button>
        </div>
      </div>

      {paused && (
        <div className={`${nesFont.className} fixed left-1/2 top-16 z-50 w-[min(448px,calc(100vw-32px))] -translate-x-1/2 border-4 border-black bg-[#E4A672] p-3 shadow-[8px_8px_0_#000]`}>
          <div className="grid grid-cols-2 gap-2">
            {sectionLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPaused(false)
                  goTo(item.id)
                }}
                className="min-h-11 border-4 border-black bg-[#00A800] px-2 text-[8px] text-white"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Runner reduced={reduced} />

      <div className={`${nesFont.className} nes-dock`}>
        <nav className="nes-dock-nav" aria-label="Pipe navigation">
          {sectionLinks.slice(0, 4).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              className="nes-nav-pipe"
              aria-label={item.label}
            >
              {item.label.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </nav>
        <NesButton className="min-w-[128px] shrink-0">Register</NesButton>
      </div>
    </>
  )
}

const Hero: ThemeModule["Hero"] = () => {
  const countdown = useCountdown()
  const reduced = useReducedMotion()
  const [intro, setIntro] = React.useState(() => !reduced)

  React.useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setIntro(false), 1500)
    return () => window.clearTimeout(id)
  }, [reduced])

  return (
    <Section id="home" className={`${nesFont.className} ${nesFont.variable} nes-page px-6 text-center`}>
      {intro && (
        <div className="nes-intro fixed inset-0 z-30 bg-black text-white">
          <button
            type="button"
            onClick={() => setIntro(false)}
            className="nes-skip absolute right-4 top-20 min-h-11 border-4 border-white bg-black px-3 text-[8px] text-white"
          >
            START
          </button>
          <div className="nes-intro-stage flex h-full flex-col items-center justify-center gap-5">
            <p className="text-[16px]">WORLD {worldValue()}</p>
            <div className="nes-avatar">
              <span />
            </div>
            <p className="text-[24px]">x{events.length}</p>
          </div>
        </div>
      )}

      <SpriteBlob kind="cloud" className="left-8 top-28" />
      <PipeGate target="events" label={nav[1].label} className="bottom-24 right-10" />
      <Ground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-216px)] max-w-sm flex-col items-center justify-center gap-4">
        <p className="nes-copy bg-black px-2 py-1 text-white">{site.eyebrow}</p>
        <h1 className="nes-title text-white">
          {site.shortName}
          <br />
          {site.version}
        </h1>
        <p className="nes-subtitle bg-[#E4A672] p-2 text-black">{site.tagline}</p>
        <div className="nes-panel w-full p-3">
          <p className="nes-copy">{site.date}</p>
          <p className="nes-copy">{site.venue}</p>
        </div>
        <NesButton>Register</NesButton>
        <div className="grid w-full grid-cols-4 gap-2">
          {[
            ["D", countdown.days],
            ["H", countdown.hours],
            ["M", countdown.minutes],
            ["S", countdown.seconds],
          ].map(([label, value]) => (
            <div key={label as string} className="border-4 border-black bg-white p-2">
              <p className="text-[16px]">{pad2(value as number)}</p>
              <p className="text-[8px]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

const Events: ThemeModule["Events"] = () => {
  const [openId, setOpenId] = React.useState<EventId>(events[0]?.id ?? "dual-debug")
  const [hitId, setHitId] = React.useState<EventId | null>(null)

  function hitBlock(id: EventId) {
    setOpenId(id)
    setHitId(id)
    window.setTimeout(() => setHitId((current) => (current === id ? null : current)), 520)
  }

  return (
    <Section id="events" className={`${nesFont.className} nes-page px-5`}>
      <SpriteBlob kind="cloud" className="right-6 top-28" />
      <PipeGate target="schedule" label={nav[2].label} className="bottom-24 right-6" />
      <Ground />

      <div className="relative z-10 mx-auto flex max-w-sm flex-col gap-4 pt-4">
        <h2 className="nes-subtitle bg-black px-2 py-2 text-white">{nav[1].label}</h2>
        <div className="grid grid-cols-4 gap-4 py-5">
          {events.map((event, index) => (
            <button
              key={event.id}
              type="button"
              onClick={() => hitBlock(event.id)}
              className={`nes-block ${hitId === event.id ? "is-hit" : ""} ${index > 2 ? "nes-flicker" : ""}`}
              aria-label={event.name}
            >
              ?
              <span className={`nes-coin ${hitId === event.id ? "is-live" : ""}`} />
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {events.map((event) => {
            const open = openId === event.id
            return (
              <article key={event.id} className="nes-panel relative p-4 text-left">
                <BrickBurst live={hitId === event.id} />
                <button type="button" onClick={() => hitBlock(event.id)} className="mb-3 flex w-full min-h-11 items-start justify-between gap-3 text-left">
                  <div>
                    <p className="nes-copy">#{event.index}</p>
                    <h3 className="text-[16px] leading-7">{event.name}</h3>
                  </div>
                  <div className="border-4 border-black bg-[#FCBC3C] px-2 py-1 text-right text-[8px]">
                    <p>{event.format}</p>
                    <p>{event.fee}</p>
                  </div>
                </button>
                <p className="nes-copy">{event.tag}</p>
                {open && (
                  <>
                    <p className="nes-copy mt-2">{event.description}</p>
                    <div className="mt-3 grid gap-3">
                      <div className="border-4 border-black bg-white p-3">
                        <p className="mb-2 text-[8px]">RULES</p>
                        <ul className="space-y-2">
                          {event.rules.map((rule) => (
                            <li key={rule} className="nes-copy">
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-4 border-black bg-white p-3">
                        <p className="mb-2 text-[8px]">PRIZES</p>
                        {event.prizes.map((prize) => (
                          <p key={prize.place} className="nes-copy">
                            {prize.place}: {prize.reward}
                          </p>
                        ))}
                      </div>
                    </div>
                    <p className="nes-copy mt-3">{event.teamSize}</p>
                    <p className="nes-copy">{event.registrationEnds}</p>
                  </>
                )}
                <NesButton eventId={event.id} className="mt-4 w-full" small>
                  Register {event.shortName}
                </NesButton>
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

const Schedule: ThemeModule["Schedule"] = () => (
  <Section id="schedule" className={`${nesFont.className} nes-page px-5`}>
    <SpriteBlob kind="bush" className="bottom-28 left-8" />
    <PipeGate target="about" label="Info" className="bottom-24 right-8" />
    <Ground />

    <div className="relative z-10 mx-auto flex max-w-sm flex-col gap-4 pt-4">
      <h2 className="nes-subtitle bg-black px-2 py-2 text-white">{nav[2].label}</h2>
      <div className="nes-panel p-4">
        <p className="nes-copy mb-3">{site.venue}</p>
        <ol className="grid gap-4">
          {schedule.map((item, index) => (
            <li key={item.title} className="grid grid-cols-[40px_1fr] gap-3">
              <div className="relative h-20">
                <span className="absolute bottom-0 left-4 h-16 w-2 bg-black" />
                <span
                  className="absolute left-5 top-0 h-8 w-8 border-4 border-black"
                  style={{ background: index % 2 === 0 ? COIN : PIPE }}
                />
              </div>
              <div className="border-4 border-black bg-white p-3">
                <p className="nes-copy">{item.time}</p>
                <p className="text-[8px] leading-5">{item.title}</p>
                <p className="nes-copy">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </Section>
)

const About: ThemeModule["About"] = () => (
  <Section id="about" className={`${nesFont.className} nes-page px-5`}>
    <SpriteBlob kind="cloud" className="left-6 top-32" />
    <PipeGate target="sponsors" label={nav[3].label} className="bottom-24 right-8" />
    <Ground />

    <div className="relative z-10 mx-auto flex max-w-sm flex-col gap-4 pt-4">
      <h2 className="nes-subtitle bg-black px-2 py-2 text-white">
        {site.shortName} {site.version}
      </h2>
      <div className="nes-panel p-4">
        <p className="nes-copy">{site.about}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {highlights.map((item, index) => (
          <div key={item.title} className={`border-4 border-black p-3 ${index > 2 ? "nes-flicker" : ""}`} style={{ background: index % 2 === 0 ? COIN : GROUND }}>
            <p className="text-[8px] leading-5">{item.title}</p>
            <p className="nes-copy">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </Section>
)

const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className={`${nesFont.className} nes-page px-5`}>
    <SpriteBlob kind="bush" className="bottom-28 right-8" />
    <PipeGate target="register" label="Join" className="bottom-24 right-8" />
    <Ground />

    <div className="relative z-10 mx-auto flex max-w-sm flex-col gap-4 pt-4">
      <h2 className="nes-subtitle bg-black px-2 py-2 text-white">{nav[3].label}</h2>
      <div className="grid gap-3">
        {sponsors.map((sponsor, index) => (
          <div
            key={sponsor.name}
            className={`flex min-h-14 items-center border-4 border-black px-4 text-[8px] ${index > 2 ? "nes-flicker" : ""}`}
            style={{ background: index % 2 === 0 ? GROUND : COIN }}
          >
            {sponsor.name}
          </div>
        ))}
      </div>
    </div>
  </Section>
)

const Register: ThemeModule["Register"] = () => {
  const { preselectedEvent, submitted, submitting, submit, reset } = useRegistration()
  const { values, setField, isValid } = useRegistrationForm(preselectedEvent)
  const inputClass = "min-h-12 border-4 border-black bg-white px-3 py-3 text-[8px] leading-5 text-black outline-none"

  if (submitted) {
    return (
      <Section id="register" className={`${nesFont.className} nes-page px-5 text-center`}>
        <PipeGate target="contact" label="Comms" className="bottom-24 right-8" />
        <Ground />
        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-216px)] max-w-sm flex-col items-center justify-center gap-4">
          <div className="nes-panel w-full p-4">
            <h2 className="nes-subtitle">FLAG UP</h2>
            <p className="nes-copy mt-3">You&apos;re set for {site.name}.</p>
            <button type="button" onClick={reset} className="mt-4 min-h-11 border-4 border-black bg-white px-3 text-[8px] underline">
              Register another
            </button>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section id="register" className={`${nesFont.className} nes-page px-5`}>
      <PipeGate target="contact" label="Comms" className="bottom-24 right-8" />
      <Ground />
      <div className="relative z-10 mx-auto flex max-w-sm flex-col gap-4 pt-4">
        <h2 className="nes-subtitle bg-black px-2 py-2 text-white">FLAGPOLE</h2>
        <div className="nes-panel p-4">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="nes-copy">{site.date}</p>
              <p className="nes-copy">{site.venue}</p>
            </div>
            <div className="h-24 w-3 bg-black">
              <span className="block h-10 w-10 border-4 border-black bg-[#FCBC3C]" />
            </div>
          </div>
          <form
            className="grid gap-3"
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
              className={inputClass}
            />
            <input
              required
              type="email"
              placeholder="Email Address"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              className={inputClass}
            />
            <input
              required
              type="tel"
              placeholder="Phone Number"
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className={inputClass}
            />
            <input
              required
              placeholder="College Name"
              value={values.college}
              onChange={(e) => setField("college", e.target.value)}
              className={inputClass}
            />
            <select
              required
              value={values.eventId}
              onChange={(e) => setField("eventId", e.target.value as EventId)}
              className={inputClass}
            >
              <option value="">Select Event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="nes-action mt-1 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </Section>
  )
}

const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className={`${nesFont.className} nes-page px-5`}>
    <SpriteBlob kind="cloud" className="right-6 top-32" />
    <Ground />
    <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-216px)] max-w-sm flex-col justify-center gap-4">
      <h2 className="nes-subtitle bg-black px-2 py-2 text-white">{nav[4].label}</h2>
      <div className="nes-panel p-4">
        <p className="nes-copy">{contact.email}</p>
        <p className="nes-copy">{contact.phone}</p>
        <p className="nes-copy">{contact.location}</p>
      </div>
      <button type="button" onClick={() => goTo("home")} className="nes-nav-pipe min-h-12">
        WORLD {worldValue()}
      </button>
    </div>
  </Section>
)

const Preview: ThemeModule["Preview"] = () => (
  <div className={`${nesFont.variable} relative h-full w-full overflow-hidden bg-[#5C94FC] font-[var(--font-side-scroll-display)] text-black`}>
    <div className="absolute left-0 right-0 top-0 flex justify-between bg-black px-3 py-2 text-[8px] text-white">
      <span>{site.shortName.toUpperCase()} x{events.length}</span>
      <span>WORLD {worldValue()}</span>
    </div>
    <SpriteBlob kind="cloud" className="left-8 top-14 scale-75" />
    <div className="absolute left-12 top-24 flex gap-3">
      {events.map((event, index) => (
        <span
          key={event.id}
          className={`nes-block scale-75 ${index > 2 ? "nes-flicker" : ""}`}
          style={{ transformOrigin: "top left" }}
        >
          ?
        </span>
      ))}
    </div>
    <div className="nes-avatar absolute bottom-12 left-16 scale-75">
      <span />
    </div>
    <div className="nes-pipe-big absolute bottom-10 right-10 scale-75" />
    <div className="nes-ground h-10" />
  </div>
)

const sideScrollTheme: ThemeModule = {
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

export default sideScrollTheme
