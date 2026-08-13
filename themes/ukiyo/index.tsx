"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import type { ThemeModule } from "../types"
import type { EventId } from "@/content/spectrum"
import { site, events, schedule, highlights, sponsors, contact } from "@/content/spectrum"
import { useCountdown, pad2 } from "../_shared/use-countdown"
import { useReducedMotion } from "../_shared/use-reduced-motion"
import { useRegistration, useRegistrationForm } from "../_shared/registration-context"
import { Section } from "../_shared/section"
import { shippori, zenKaku, mono } from "./fonts"

// ---- Palette ----
const WASHI = "#F2EDE4"
const SUMI = "#1C1A17"
const SHU = "#D8443C"
const AI = "#2A4B7C"
const KIN = "#C9A227"

function goRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function UkiyoButton({
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
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        openRegistration(eventId)
        goRegister()
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={`${shippori.className} relative border transition-colors ${className}`}
      style={{
        borderColor: variant === "solid" ? SHU : SUMI,
        background: variant === "solid" ? SHU : "transparent",
        color: variant === "solid" ? WASHI : SUMI,
        boxShadow: hovered && variant === "solid" ? `0 4px 12px ${SHU}60` : "none"
      }}
    >
      {children}
    </button>
  )
}

const Hanko = ({ text, className = "" }: { text: string; className?: string }) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-[2px] border-[2px] border-solid p-1 text-center leading-none ${shippori.className} ${className}`}
    style={{ borderColor: SHU, color: SHU, opacity: 0.85, transform: "rotate(-4deg)" }}
  >
    <span style={{ writingMode: "vertical-rl" }}>{text}</span>
  </div>
)

const BrushUnderline = ({ color = SHU, width = 60, vertical = false, className = "" }) => (
  <motion.svg
    width={vertical ? "12" : width}
    height={vertical ? width : "12"}
    viewBox={vertical ? `0 0 12 ${width}` : `0 0 ${width} 12`}
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    initial={{ pathLength: 0, opacity: 0 }}
    whileInView={{ pathLength: 1, opacity: 1 }}
    viewport={{ once: true, margin: "-10%" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    <motion.path
      d={vertical ? `M6,2 Q4,${Number(width) / 4} 7,${Number(width) / 2} T6,${Number(width) - 2}` : `M2,6 Q${Number(width) / 4},8 ${Number(width) / 2},5 T${Number(width) - 2},6`}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </motion.svg>
)

const VerticalHeading = ({ text, en, color = SUMI }: { text: string; en?: string; color?: string }) => {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={reduced ? undefined : { filter: "blur(8px)", opacity: 0, scale: 0.95 }}
      whileInView={reduced ? undefined : { filter: "blur(0px)", opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {en && <span className={`${zenKaku.className} text-[10px] uppercase tracking-widest opacity-60`} style={{ color }}>{en}</span>}
      <h2
        className={`${shippori.className} text-3xl tracking-widest`}
        style={{ color, writingMode: "vertical-rl" }}
      >
        {text}
      </h2>
      <BrushUnderline color={SHU} width={60} vertical={false} />
    </motion.div>
  )
}

const WaveDivider = () => (
  <div className="w-full overflow-hidden opacity-10">
    <svg width="100%" height="20" preserveAspectRatio="none">
      <pattern id="waves" width="40" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 20 Q 10 0 20 20 T 40 20" fill="none" stroke={SUMI} strokeWidth="1" />
        <path d="M0 10 Q 10 -10 20 10 T 40 10" fill="none" stroke={SUMI} strokeWidth="1" />
      </pattern>
      <rect width="100%" height="20" fill="url(#waves)" />
    </svg>
  </div>
)

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
const Background: ThemeModule["Background"] = () => {
  const reduced = useReducedMotion()
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden" style={{ background: WASHI }}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" style={{ mixBlendMode: 'multiply' }}>
        <filter id="washiNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#washiNoise)" />
      </svg>
      {/* Drifting sumi blobs */}
      <motion.div
        className="absolute -top-[20%] left-[-10%] h-[50vh] w-[70vw] rounded-full blur-[80px] opacity-10"
        style={{ background: SUMI }}
        animate={reduced ? undefined : { x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] h-[60vh] w-[60vw] rounded-full blur-[100px] opacity-[0.05]"
        style={{ background: AI }}
        animate={reduced ? undefined : { x: [0, -30, 0], y: [0, -15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dock
// ---------------------------------------------------------------------------
const Dock: ThemeModule["Dock"] = () => {
  const tabs = [
    { id: "home", en: "Home", jp: "案内" },
    { id: "events", en: "Events", jp: "演目" },
    { id: "schedule", en: "Schedule", jp: "行程" },
    { id: "sponsors", en: "Sponsors", jp: "協賛" },
  ]
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch gap-3 border-t px-3 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style={{
        background: "#FDFBF7",
        borderColor: "rgba(28, 26, 23, 0.1)",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <nav className={`${zenKaku.className} flex flex-1 items-center justify-around text-[10px]`}>
        {tabs.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="flex flex-col items-center gap-1 py-1 text-black/60 transition-colors active:text-black">
            <span className={`${shippori.className} text-[12px] font-medium`} style={{ color: SUMI }}>{t.jp}</span>
            <span className="uppercase opacity-70 scale-90">{t.en}</span>
          </a>
        ))}
      </nav>
      <UkiyoButton className="my-1 flex h-14 min-w-[130px] items-center justify-center text-sm font-bold tracking-widest shadow-sm">
        Register
      </UkiyoButton>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Intro Transition & Sakura
// ---------------------------------------------------------------------------
const IntroTransition = () => {
  const [done, setDone] = React.useState(false)
  const reduced = useReducedMotion()
  if (done || reduced) return null

  return (
    <motion.div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: SUMI }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      onAnimationComplete={() => setDone(true)}
      onClick={() => setDone(true)}
    >
      <motion.div
        className="rounded-full"
        style={{ background: WASHI }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 0.05, 50] }}
        transition={{ duration: 1.2, ease: "circIn", times: [0, 0.4, 1] }}
      />
    </motion.div>
  )
}

const Sakura = () => {
  const reduced = useReducedMotion()
  const petals = React.useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: `${((i * 37 + 13) % 100)}%`,
        duration: 8 + ((i * 17) % 7),
        delay: (i * 1.3) % 5,
      })),
    []
  )

  if (reduced) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute -top-4 size-3 rounded-tl-full rounded-br-full opacity-60"
          style={{ background: '#FFB7C5', left: p.left }}
          animate={{
            y: ["-5vh", "105vh"],
            x: ["-2vw", "3vw", "-1vw", "2vw"],
            rotate: [0, 180, 360],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
            x: { duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay },
            rotate: { duration: p.duration * 0.8, repeat: Infinity, ease: "linear", delay: p.delay },
          }}
        />
      ))}
    </div>
  )
}

const TopNoren = () => (
  <div className="absolute top-0 inset-x-0 flex h-14 divide-x shadow-sm pointer-events-none" style={{ borderColor: WASHI, zIndex: 10 }}>
    {['祭','空','夢','宴'].map((kanji, i) => (
      <motion.div
        key={kanji}
        className="flex-1 rounded-b-md"
        style={{ background: AI, borderBottom: `2px solid ${SUMI}` }}
        initial={{ originY: 0 }}
        animate={{ rotateX: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
      >
        <div className="flex h-full w-full items-end justify-center pb-2 opacity-40">
          <span className={`${shippori.className} text-[12px] text-white`} style={{ writingMode: "vertical-rl" }}>
            {kanji}
          </span>
        </div>
      </motion.div>
    ))}
  </div>
)

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
const Hero: ThemeModule["Hero"] = () => {
  const cd = useCountdown()
  return (
    <Section id="home" className="relative flex min-h-[95vh] flex-col items-center justify-center px-6 pb-32 pt-20">
      <IntroTransition />
      <Sakura />
      <TopNoren />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
        <span className={shippori.className} style={{ fontSize: "45vw", writingMode: "vertical-rl", color: SUMI }}>
          スペクトラム
        </span>
      </div>

      <div className="z-10 flex flex-col items-center text-center mt-8">
        <Hanko text="五" className="mb-6 size-12 text-lg" />
        <p className={`${zenKaku.className} mb-4 text-[10px] uppercase tracking-[0.3em]`} style={{ color: AI }}>
          {site.eyebrow}
        </p>
        <h1 className={`${shippori.className} mb-3 text-5xl tracking-widest`} style={{ color: SUMI }}>
          {site.shortName}
        </h1>
        <p className={`${zenKaku.className} mb-8 max-w-[240px] text-xs leading-loose tracking-widest opacity-80`} style={{ color: SUMI }}>
          {site.tagline}
        </p>

        <UkiyoButton className="mb-12 px-10 py-4 text-sm tracking-widest">
          Register Now
        </UkiyoButton>

        <div className="mb-10 flex gap-6">
          {[
            ["Days", cd.days],
            ["Hrs", cd.hours],
            ["Min", cd.minutes],
            ["Sec", cd.seconds],
          ].map(([label, val]) => (
            <div key={label as string} className="flex flex-col items-center gap-1">
              <span className={`${mono.className} text-2xl`} style={{ color: SUMI }}>{pad2(val as number)}</span>
              <span className={`${zenKaku.className} text-[9px] uppercase tracking-wider opacity-50`} style={{ color: SUMI }}>{label}</span>
            </div>
          ))}
        </div>

        <div className={`${zenKaku.className} flex flex-col items-center gap-1.5 text-[11px] opacity-80`} style={{ color: SUMI }}>
          <p>{site.date}</p>
          <p>{site.venue}</p>
        </div>
      </div>
      <WaveDivider />
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Events — Kakemono Scrolls
// ---------------------------------------------------------------------------
const KakemonoScroll = ({ event, isOpen, onToggle }: { event: typeof events[0]; isOpen: boolean; onToggle: () => void }) => {
  return (
    <div className="relative mb-8 flex w-full flex-col items-center px-1">
      {/* Top cord string */}
      <div className="absolute top-[-12px] h-[24px] w-[60px] rounded-t-full border-t-2 border-x-2" style={{ borderColor: SUMI, opacity: 0.3 }} />
      {/* Top rod */}
      <div className="z-10 h-3 w-[102%] rounded-full shadow-sm" style={{ background: SUMI }} />
      
      {/* Scroll paper */}
      <motion.div
        className="w-[96%] overflow-hidden border-x border-b bg-[#FDFBF7] shadow-sm relative"
        style={{ borderColor: "rgba(28, 26, 23, 0.15)" }}
        animate={{ height: isOpen ? "auto" : "120px" }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <svg className="absolute inset-0 h-full w-full opacity-20 pointer-events-none" style={{ mixBlendMode: 'multiply' }}>
           <rect width="100%" height="100%" filter="url(#washiNoise)" />
        </svg>

        <button
          type="button"
          className="flex h-[120px] w-full items-center justify-between p-5 text-left relative z-10"
          onClick={onToggle}
        >
          <div className="flex items-center gap-5">
            <Hanko text={event.index} className="size-10 text-sm" />
            <div>
              <h3 className={`${shippori.className} text-xl`} style={{ color: SUMI }}>{event.name}</h3>
              <p className={`${zenKaku.className} mt-1 text-xs opacity-70`} style={{ color: SUMI }}>{event.tag}</p>
            </div>
          </div>
          <div className={`${mono.className} text-right text-[10px]`} style={{ color: SUMI }}>
             <p className="opacity-60">{event.format}</p>
             <p className="mt-0.5">{event.fee}</p>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${zenKaku.className} p-5 pt-0 text-sm relative z-10`}
              style={{ color: SUMI }}
            >
              <div className="mb-5 h-px w-full" style={{ background: "rgba(28, 26, 23, 0.1)" }} />
              <p className="mb-4 leading-relaxed">{event.description}</p>
              <div className="mb-4 space-y-1.5 text-xs opacity-80">
                {event.rules.map(r => <p key={r}>• {r}</p>)}
              </div>
              <div className="mb-6 space-y-1.5 text-xs font-medium">
                {event.prizes.map(p => <p key={p.place}><span style={{color: SHU}}>{p.place}:</span> {p.reward}</p>)}
              </div>
              <UkiyoButton eventId={event.id} className="w-full py-3 justify-center text-xs tracking-widest">
                Register — {event.shortName}
              </UkiyoButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Bottom rod */}
      <div className="z-10 h-4 w-[104%] rounded-full shadow-md" style={{ background: SUMI }} />
    </div>
  )
}

const ToriiGate = () => {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className="absolute inset-x-0 top-32 pointer-events-none -z-10 flex justify-center opacity-[0.04]"
      initial={reduced ? undefined : { y: 100 }}
      whileInView={reduced ? undefined : { y: -50 }}
      viewport={{ margin: "200px" }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <svg width="240" height="240" viewBox="0 0 100 100" fill={SUMI}>
         <rect x="5" y="20" width="90" height="6" rx="2" />
         <rect x="0" y="10" width="100" height="8" rx="3" />
         <rect x="20" y="26" width="10" height="70" />
         <rect x="70" y="26" width="10" height="70" />
         <rect x="20" y="42" width="60" height="5" />
      </svg>
    </motion.div>
  )
}

const Events: ThemeModule["Events"] = () => {
  const [openId, setOpenId] = React.useState<string | null>(null)
  return (
    <Section id="events" className="relative flex flex-col items-center px-4 py-24">
      <ToriiGate />
      <VerticalHeading text="演目" en="Events" />
      <p className={`${zenKaku.className} mt-6 mb-12 text-center text-sm opacity-80`} style={{ color: SUMI }}>
        Choose your battleground.
      </p>
      <div className="w-full max-w-sm flex flex-col gap-2">
        {events.map((ev) => (
          <KakemonoScroll
            key={ev.id}
            event={ev}
            isOpen={openId === ev.id}
            onToggle={() => setOpenId(openId === ev.id ? null : ev.id)}
          />
        ))}
      </div>
      <div className="mt-12"><WaveDivider /></div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------
const Schedule: ThemeModule["Schedule"] = () => (
  <Section id="schedule" className="flex flex-col items-center px-6 py-24">
    <VerticalHeading text="行程" en="Schedule" />
    <div className="mt-16 w-full max-w-sm">
      {schedule.map((item, i) => (
        <div key={item.title} className="relative flex gap-6 pb-12">
          <div className="flex flex-col items-center mt-1">
             <div className="z-10 size-3 rounded-full border-[2px]" style={{ borderColor: SHU, background: WASHI }} />
             {i !== schedule.length - 1 && (
               <div className="w-px h-full mt-2" style={{ background: "rgba(28, 26, 23, 0.15)" }} />
             )}
          </div>
          <div className="-mt-1 flex flex-col">
             <span className={`${mono.className} text-[11px] font-bold`} style={{ color: SHU }}>{item.time}</span>
             <h4 className={`${shippori.className} text-xl mt-1.5`} style={{ color: SUMI }}>{item.title}</h4>
             <p className={`${zenKaku.className} text-xs mt-2 opacity-70 leading-relaxed`} style={{ color: SUMI }}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------
const About: ThemeModule["About"] = () => (
  <Section id="about" className="flex flex-col items-center px-6 py-24 text-center">
    <VerticalHeading text="概要" en="About" />
    <p className={`${zenKaku.className} mt-12 text-sm leading-loose max-w-sm opacity-90`} style={{ color: SUMI }}>
      {site.about}
    </p>
    <div className="mt-16 grid w-full max-w-sm grid-cols-2 gap-4">
      {highlights.map((h, i) => (
        <div key={h.title} className="flex flex-col items-center border p-5 transition-colors hover:bg-white/20" style={{ borderColor: "rgba(28, 26, 23, 0.1)" }}>
          <Hanko text={`0${i + 1}`} className="mb-4 size-8 text-[10px]" />
          <h4 className={`${shippori.className} text-sm mb-2`} style={{ color: SUMI }}>{h.title}</h4>
          <p className={`${zenKaku.className} text-[10px] opacity-70 leading-relaxed`} style={{ color: SUMI }}>{h.description}</p>
        </div>
      ))}
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// Sponsors
// ---------------------------------------------------------------------------
const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className="flex flex-col items-center px-6 py-24">
    <VerticalHeading text="協賛" en="Sponsors" />
    <div className="mt-16 flex w-full max-w-sm flex-wrap justify-center gap-4">
      {sponsors.map((s) => (
        <div
          key={s.name}
          className={`${shippori.className} flex h-16 w-[46%] items-center justify-center border text-sm tracking-wide`}
          style={{ borderColor: "rgba(28, 26, 23, 0.15)", color: SUMI }}
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
      <Section id="register" className="flex flex-col items-center px-6 py-32 text-center">
         <Hanko text="完" className="mb-8 size-16 text-2xl" />
         <h2 className={`${shippori.className} mb-4 text-3xl`} style={{ color: SUMI }}>Quest Accepted</h2>
         <p className={`${zenKaku.className} mb-10 text-sm opacity-80`} style={{ color: SUMI }}>
           Your spot in the battle is secured.<br />Check your email for details.
         </p>
         <button onClick={reset} className={`${zenKaku.className} text-xs tracking-widest underline opacity-60 transition-opacity hover:opacity-100`} style={{ color: SUMI }}>
           Register another
         </button>
      </Section>
    )
  }

  const inputStyle = {
    borderColor: "rgba(28, 26, 23, 0.2)",
    background: "transparent",
    color: SUMI
  }

  return (
    <Section id="register" className="flex flex-col items-center px-6 py-24 pb-32">
      <VerticalHeading text="登録" en="Register" />
      <p className={`${zenKaku.className} mb-12 mt-8 text-center text-sm opacity-80`} style={{ color: SUMI }}>
        Step into the arena.<br />Submit your details below.
      </p>

      <form
        className={`${zenKaku.className} flex w-full max-w-sm flex-col gap-6`}
        onSubmit={(e) => {
          e.preventDefault()
          if (isValid) submit(values)
        }}
      >
        <input required placeholder="Full Name" value={values.name} onChange={(e) => setField("name", e.target.value)} className="border-b px-2 py-2 text-sm outline-none transition-colors focus:border-black" style={inputStyle} />
        <input required type="email" placeholder="Email Address" value={values.email} onChange={(e) => setField("email", e.target.value)} className="border-b px-2 py-2 text-sm outline-none transition-colors focus:border-black" style={inputStyle} />
        <input required type="tel" placeholder="Phone Number" value={values.phone} onChange={(e) => setField("phone", e.target.value)} className="border-b px-2 py-2 text-sm outline-none transition-colors focus:border-black" style={inputStyle} />
        <input required placeholder="College Name" value={values.college} onChange={(e) => setField("college", e.target.value)} className="border-b px-2 py-2 text-sm outline-none transition-colors focus:border-black" style={inputStyle} />
        
        <select required value={values.eventId} onChange={(e) => setField("eventId", e.target.value as EventId)} className="border-b px-2 py-2 text-sm outline-none" style={{ ...inputStyle, WebkitAppearance: "none", appearance: "none" }}>
           <option value="">Select Event</option>
           {events.map((ev) => (
             <option key={ev.id} value={ev.id}>{ev.name}</option>
           ))}
        </select>

        <UkiyoButton variant="solid" className="mt-8 w-full py-4 text-sm font-bold tracking-widest disabled:opacity-50">
           {submitting ? "Submitting..." : "Accept Challenge"}
        </UkiyoButton>
      </form>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="flex flex-col items-center px-6 pb-40 pt-16 text-center">
    <VerticalHeading text="連絡" en="Contact" />
    <div className={`${mono.className} mt-12 flex flex-col gap-5 text-xs opacity-80`} style={{ color: SUMI }}>
      <p>{contact.email}</p>
      <p>{contact.phone}</p>
      <p className="px-4 leading-relaxed opacity-80">{contact.location}</p>
    </div>
  </Section>
)

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------
const Preview: ThemeModule["Preview"] = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-4 text-center" style={{ background: WASHI }}>
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" style={{ mixBlendMode: 'multiply' }}>
      <filter id="washiNoisePrev">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#washiNoisePrev)" />
    </svg>
    <Hanko text="五" className="mb-3 size-8 text-[10px]" />
    <h3 className={shippori.className} style={{ color: SUMI, fontSize: "1.4rem" }}>Ukiyo</h3>
    <p className={`${zenKaku.className} mt-1 text-[9px] tracking-wide opacity-70`} style={{ color: SUMI }}>Edo meets Shibuya.</p>
    <div className="mt-4 flex gap-1.5">
       {[WASHI, SHU, SUMI, AI, KIN].map((c) => (
         <span key={c} className="size-2.5 rounded-full border border-black/10 shadow-sm" style={{ background: c }} />
       ))}
    </div>
  </div>
)

const meta: ThemeModule["meta"] = {
  slug: "ukiyo",
  name: "Ukiyo",
  tagline: "Edo woodblock print meets Shibuya night.",
  swatch: [WASHI, SHU, SUMI, AI],
  fontDisplay: "--font-ukiyo-display",
  vibe: ["washi", "shibuya", "minimal"],
}

const ukiyoTheme: ThemeModule = {
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

export default ukiyoTheme
