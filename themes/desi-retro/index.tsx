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
import { desiDisplay, desiBody } from "./fonts"

// Palette
const MUSTARD = "#E8A13A"
const JUTE = "#D9C9A3"
const TEAL = "#12595B"
const VERMILION = "#C7382F"
const MARIGOLD = "#F4A300"
const INK = "#1A1A1A"

const hoardingShadow = `4px 4px 0px ${INK}`
const softHoardingShadow = `2px 2px 0px ${INK}`

function goRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function DesiButton({
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
  const [pressed, setPressed] = React.useState(false)
  const bg = variant === "primary" ? VERMILION : MUSTARD
  const fg = variant === "primary" ? JUTE : INK
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
      className={`${desiDisplay.className} relative border-2 uppercase tracking-widest transition-transform ${className}`}
      style={{
        borderColor: INK,
        background: bg,
        color: fg,
        boxShadow: pressed ? "0px 0px 0 " + INK : hoardingShadow,
        transform: pressed ? "translate(4px, 4px)" : "translate(0,0)",
      }}
    >
      {children}
    </button>
  )
}

function DdLoader() {
  const [show, setShow] = React.useState(true)
  const [dimensions, setDimensions] = React.useState({ width: "100vw", height: "100vh" })

  React.useEffect(() => {
    const t = setTimeout(() => setShow(false), 1500)
    if (typeof window !== "undefined") {
      setDimensions({
        width: `${window.screen.availWidth}px`,
        height: `${window.screen.availHeight}px`
      })
    }
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  return (
    <motion.div
      className="fixed top-0 left-0 z-[60] flex flex-col pointer-events-none"
      style={{ width: dimensions.width, height: dimensions.height }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 1.4, times: [0, 0.8, 1] }}
    >
      {/* Color Bars */}
      <div className="flex h-4/5 w-full">
        {["#FFFFFF", "#F2B705", "#8FD3F4", "#6FBF5B", "#8B6FD9", "#C7382F", "#242150"].map(c => (
          <div key={c} className="flex-1 h-full" style={{ background: c }} />
        ))}
      </div>
      {/* Black & White boxes */}
      <div className="flex h-1/5 w-full">
         <div className="flex-1 bg-black" />
         <div className="flex-1 bg-white" />
         <div className="flex-1 bg-black" />
         <div className="flex-1 bg-white" />
      </div>
      {/* TV static noise overlay */}
      <div 
        className="absolute inset-0 mix-blend-overlay opacity-30" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
    </motion.div>
  )
}

const Background: ThemeModule["Background"] = () => {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden" style={{ background: JUTE }}>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05)),
            linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05))
          `,
          backgroundSize: "4px 4px",
          backgroundPosition: "0 0, 2px 2px",
        }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.15) 100%)" }} />
    </div>
  )
}

const Dock: ThemeModule["Dock"] = () => {
  const tabs = ["Home", "Events", "Schedule", "Sponsors"]
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none">
      <div className="flex h-3 w-full opacity-90" style={{ background: `linear-gradient(135deg, ${MUSTARD} 25%, transparent 25%) -6px 0, linear-gradient(225deg, ${MUSTARD} 25%, transparent 25%) -6px 0, linear-gradient(315deg, ${MUSTARD} 25%, transparent 25%), linear-gradient(45deg, ${MUSTARD} 25%, transparent 25%)`, backgroundSize: '12px 12px' }} />
      <div
        className="flex items-stretch px-2 pt-1 border-t-0 pointer-events-auto shadow-2xl"
        style={{
          background: MUSTARD,
          borderTop: `4px solid ${INK}`,
          paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <nav className={`${desiBody.className} flex flex-1 items-center justify-around text-xs font-bold uppercase`} style={{ color: INK }}>
          {tabs.map((t) => (
            <a key={t} href={`#${t.toLowerCase()}`} className="flex flex-col items-center gap-1 py-1 px-1 opacity-80 active:opacity-100">
              {t}
            </a>
          ))}
        </nav>
        <DesiButton variant="primary" className="my-1 flex h-14 min-w-[130px] shrink-0 items-center justify-center rounded-sm px-4 text-sm">
          Register
        </DesiButton>
      </div>
    </div>
  )
}

const MarigoldGarland = () => (
  <div className="absolute top-0 left-0 right-0 h-8 flex overflow-hidden opacity-90 z-10 pointer-events-none">
    {Array.from({ length: 30 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-8 h-8 rounded-full border-2 -ml-2 first:ml-0 shadow-sm" style={{ background: `radial-gradient(circle, ${MARIGOLD} 40%, #D97700 80%)`, borderColor: "#A54A00" }} />
    ))}
  </div>
)

const Marquee = () => {
  const reduced = useReducedMotion()
  return (
    <div className="w-full overflow-hidden border-y-4 py-1" style={{ borderColor: INK, background: MUSTARD, color: INK }}>
      <motion.div
        className={`${desiBody.className} flex whitespace-nowrap text-xs font-bold uppercase tracking-widest`}
        animate={reduced ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <span className="px-4">HORN PLEASE 📯 {site.date} 📯 {site.venue} 📯 </span>
        <span className="px-4">HORN PLEASE 📯 {site.date} 📯 {site.venue} 📯 </span>
        <span className="px-4">HORN PLEASE 📯 {site.date} 📯 {site.venue} 📯 </span>
        <span className="px-4">HORN PLEASE 📯 {site.date} 📯 {site.venue} 📯 </span>
      </motion.div>
    </div>
  )
}

const Hero: ThemeModule["Hero"] = () => {
  const cd = useCountdown()
  const reduced = useReducedMotion()

  return (
    <Section id="home" className="relative flex flex-col items-center justify-center gap-6 px-4 pb-32 pt-16 text-center overflow-hidden">
      <MarigoldGarland />
      {!reduced && <DdLoader />}
      
      <motion.div 
        className="relative border-4 bg-white p-6 mt-8 max-w-sm w-full z-10"
        style={{ borderColor: INK, boxShadow: hoardingShadow }}
        animate={reduced ? undefined : { rotate: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-1 left-1 w-4 h-4 border-t-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute top-1 right-1 w-4 h-4 border-t-4 border-r-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-4 border-l-4" style={{ borderColor: VERMILION }} />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-4 border-r-4" style={{ borderColor: VERMILION }} />
        
        <p className={`${desiBody.className} text-xs font-bold uppercase tracking-[0.25em] mb-2`} style={{ color: TEAL }}>
          {site.eyebrow}
        </p>
        <h1 className={desiDisplay.className} style={{ color: VERMILION, fontSize: "2.8rem", lineHeight: 1.1, textShadow: `2px 2px 0px ${MUSTARD}, 4px 4px 0px ${INK}` }}>
          {site.shortName}
          <br />
          <span style={{ color: TEAL }}>{site.version}</span>
        </h1>
        <p className={`${desiBody.className} mt-3 text-sm font-bold`} style={{ color: INK }}>
          {site.tagline}
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2 border-2 p-3 bg-yellow-50" style={{ borderColor: INK }}>
           <p className={`${desiBody.className} col-span-4 text-xs font-bold uppercase tracking-widest text-center border-b-2 mb-2 pb-1`} style={{ borderColor: TEAL, color: TEAL }}>Starts In</p>
           {[
            ["Days", cd.days],
            ["Hrs", cd.hours],
            ["Min", cd.minutes],
            ["Sec", cd.seconds],
          ].map(([label, value]) => (
            <div key={label as string} className="text-center">
              <div className={desiDisplay.className} style={{ color: VERMILION, fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)", lineHeight: 1.1 }}>
                {pad2(value as number)}
              </div>
              <div className={`${desiBody.className} text-[10px] font-bold uppercase tracking-wider mt-1`} style={{ color: INK }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <Marquee />

      <DesiButton className="mt-2 px-8 py-4 text-sm z-10" variant="primary">Accept The Quest</DesiButton>
    </Section>
  )
}

const Events: ThemeModule["Events"] = () => {
  const [openId, setOpenId] = React.useState<string | null>(null)
  return (
    <Section id="events" className="flex flex-col gap-8 px-4 py-16 bg-opacity-50" style={{ background: `linear-gradient(to bottom, transparent, rgba(244, 163, 0, 0.15))` }}>
      <div className="text-center">
        <h2 className={desiDisplay.className} style={{ color: VERMILION, fontSize: "2rem", textShadow: `1px 1px 0 ${INK}` }}>
          Mela Arena
        </h2>
        <p className={`${desiBody.className} text-sm font-bold uppercase tracking-widest`} style={{ color: TEAL }}>
          Choose your stall
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {events.map((ev) => (
          <div key={ev.id} className="relative border-4 bg-white" style={{ borderColor: INK, boxShadow: hoardingShadow }}>
            {/* Awning */}
            <div className="absolute -top-3 left-0 right-0 flex h-3" style={{ borderTop: `2px solid ${INK}` }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 border-r-2 border-b-2 rounded-b-sm" style={{ backgroundColor: i % 2 === 0 ? ev.color : '#fff', borderColor: INK }} />
              ))}
            </div>
            
            <button type="button" className="flex w-full items-start justify-between text-left p-4 pt-6" onClick={() => setOpenId(openId === ev.id ? null : ev.id)}>
              <div className="flex gap-3 items-center">
                <span
                  className={`${desiDisplay.className} flex size-10 shrink-0 items-center justify-center text-lg border-2`}
                  style={{ background: ev.color, color: INK, borderColor: INK, boxShadow: softHoardingShadow }}
                >
                  {ev.index}
                </span>
                <div>
                  <h3 className={`${desiDisplay.className} text-xl`} style={{ color: INK }}>
                    {ev.name}
                  </h3>
                  <p className={`${desiBody.className} text-xs font-bold uppercase`} style={{ color: TEAL }}>
                    {ev.tag}
                  </p>
                </div>
              </div>
              <div className={`${desiBody.className} shrink-0 text-right text-xs font-bold`} style={{ color: VERMILION }}>
                <div className="opacity-80">{ev.format}</div>
                <div className="text-sm">{ev.fee}</div>
              </div>
            </button>
            {openId === ev.id && (
              <div className={`${desiBody.className} px-4 pb-4 space-y-2 text-sm border-t-2 pt-3`} style={{ borderColor: `${INK}33`, color: INK }}>
                <p className="font-bold text-base mb-3">{ev.description}</p>
                <ul className="list-disc space-y-1 pl-4 mb-3">
                  {ev.rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <ul className="space-y-1 p-3 border-2 bg-yellow-50" style={{ borderColor: INK, borderStyle: 'dashed' }}>
                  {ev.prizes.map((p) => (
                    <li key={p.place} className="font-bold">
                      <span style={{ color: VERMILION }}>{p.place}:</span> {p.reward}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="px-4 pb-4 mt-2">
              <DesiButton eventId={ev.id} className="w-full py-3 text-sm" variant="secondary">
                Register — {ev.shortName}
              </DesiButton>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

const Schedule: ThemeModule["Schedule"] = () => (
  <Section id="schedule" className="flex flex-col gap-6 px-4 py-16">
    <div className="text-center">
      <h2 className={desiDisplay.className} style={{ color: VERMILION, fontSize: "2rem", textShadow: `1px 1px 0 ${INK}` }}>
        Timetable
      </h2>
    </div>
    
    <div 
      className="p-5 border-[12px] shadow-xl rounded-md relative"
      style={{ 
        borderColor: "#4A3525", // Wooden frame
        background: "#2A3B2A", // Chalkboard green
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
      }}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-2 opacity-80" style={{ background: "#3A2515" }} />
      
      <ol className="space-y-6 relative z-10">
        {schedule.map((item) => (
          <li key={item.title} className="flex gap-4 border-b border-white/20 pb-4 last:border-0 last:pb-0">
            <div className={`${desiDisplay.className} text-white/90 text-right w-20 shrink-0 text-sm mt-1`} style={{ textShadow: "0 0 2px rgba(255,255,255,0.5)" }}>
              {item.time}
            </div>
            <div>
              <p className={`${desiDisplay.className} text-white/95 text-lg`} style={{ textShadow: "0 0 2px rgba(255,255,255,0.5)" }}>
                {item.title}
              </p>
              <p className={`${desiBody.className} text-white/70 text-xs italic`}>
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 pt-4 border-t-2 border-white/30 text-center text-white/80 font-mono text-xs uppercase tracking-widest">
        Venue: {site.venue}
      </div>
    </div>
  </Section>
)

const About: ThemeModule["About"] = () => (
  <Section id="about" className="flex flex-col gap-6 px-4 py-16">
    <div className="border-4 p-6 bg-[#FFF9E6]" style={{ borderColor: INK, boxShadow: hoardingShadow }}>
      <h2 className={desiDisplay.className} style={{ color: TEAL, fontSize: "1.8rem" }}>
        About {site.name}
      </h2>
      <p className={`${desiBody.className} mt-2 text-sm font-bold`} style={{ color: INK }}>
        {site.about}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {highlights.map((h) => (
          <div key={h.title} className="relative p-3 border-2 bg-white" style={{ borderColor: INK }}>
             <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 border-2 rounded-full" style={{ borderColor: INK }} />
            <p className={`${desiDisplay.className} text-sm`} style={{ color: VERMILION }}>
              {h.title}
            </p>
            <p className={`${desiBody.className} text-xs leading-snug font-medium opacity-80`} style={{ color: INK }}>
              {h.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </Section>
)

const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className="flex flex-col gap-4 px-4 py-16">
    <h2 className={desiDisplay.className} style={{ color: VERMILION, fontSize: "1.8rem", textAlign: "center" }}>
      Proud Sponsors
    </h2>
    <div className="flex flex-col gap-3">
      {sponsors.map((s) => (
        <div key={s.name} className={`${desiDisplay.className} border-4 px-5 py-3 text-lg bg-white text-center`} style={{ borderColor: INK, color: TEAL, boxShadow: softHoardingShadow }}>
          {s.name}
        </div>
      ))}
    </div>
  </Section>
)

const Register: ThemeModule["Register"] = () => {
  const { preselectedEvent, submitted, submitting, submit, reset } = useRegistration()
  const { values, setField, isValid } = useRegistrationForm(preselectedEvent)
  
  const ticketStyle = {
    background: "#F4EBD9", // aged paper
    borderColor: INK,
    borderWidth: "4px",
    boxShadow: hoardingShadow,
  }

  if (submitted) {
    return (
      <Section id="register" className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <div className="relative p-8 w-full max-w-sm" style={ticketStyle}>
          {/* Rubber stamp */}
          <motion.div 
            className="absolute -top-6 -right-4 size-28 rounded-full border-4 flex items-center justify-center bg-transparent z-10"
            style={{ borderColor: VERMILION, color: VERMILION }}
            initial={{ scale: 2, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: -15 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
             <div className="border-2 w-[85%] h-[85%] rounded-full flex flex-col items-center justify-center border-dashed" style={{ borderColor: VERMILION }}>
                <span className={`${desiDisplay.className} text-xl uppercase leading-none mt-2`}>Approved</span>
                <span className={`${desiBody.className} text-[8px] font-bold mt-1 tracking-widest`}>{site.dateShort}</span>
             </div>
          </motion.div>

          <h2 className={desiDisplay.className} style={{ color: TEAL, fontSize: "1.6rem" }}>
            Ticket Confirmed!
          </h2>
          <p className={`${desiBody.className} text-sm mt-2 font-bold`} style={{ color: INK }}>
            Your seat is reserved. See you at {site.shortName}.
          </p>
          <button type="button" onClick={reset} className={`${desiBody.className} mt-6 text-xs uppercase font-bold tracking-widest underline decoration-2`} style={{ color: VERMILION, textUnderlineOffset: "4px" }}>
            Book Another
          </button>
        </div>
      </Section>
    )
  }

  return (
    <Section id="register" className="flex flex-col gap-4 px-4 py-16">
      <div className="p-6" style={ticketStyle}>
        <div className="border-b-4 pb-4 mb-5 flex justify-between items-end" style={{ borderColor: INK }}>
          <div>
            <p className={`${desiBody.className} text-[10px] font-bold uppercase tracking-widest`} style={{ color: VERMILION }}>Registration Form</p>
            <h2 className={desiDisplay.className} style={{ color: INK, fontSize: "1.8rem", lineHeight: 1.1 }}>
              Official Ticket
            </h2>
          </div>
          <div className={`${desiDisplay.className} text-2xl opacity-30`} style={{ color: INK }}>
            No. 50
          </div>
        </div>

        <form
          className={`${desiBody.className} flex flex-col gap-4`}
          onSubmit={(e) => {
            e.preventDefault()
            if (isValid) submit(values)
          }}
        >
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>Name</label>
             <input required placeholder="Enter Full Name" value={values.name} onChange={(e) => setField("name", e.target.value)} className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>Email</label>
             <input required type="email" placeholder="email@college.edu" value={values.email} onChange={(e) => setField("email", e.target.value)} className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>Phone</label>
             <input required type="tel" placeholder="+91" value={values.phone} onChange={(e) => setField("phone", e.target.value)} className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>College / Institute</label>
             <input required placeholder="College Name" value={values.college} onChange={(e) => setField("college", e.target.value)} className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50" style={{ borderColor: INK, color: INK }} />
          </div>
          <div className="flex flex-col gap-1 mt-2">
             <label className="text-[10px] font-bold uppercase" style={{ color: TEAL }}>Select Event</label>
             <select required value={values.eventId} onChange={(e) => setField("eventId", e.target.value as EventId)} className="border-2 p-2 text-sm outline-none font-bold bg-white" style={{ borderColor: INK, color: INK, boxShadow: softHoardingShadow }}>
               <option value="">-- Choose Battle --</option>
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
            className={`${desiDisplay.className} mt-6 border-4 py-3 text-lg uppercase transition-transform disabled:opacity-40 disabled:transform-none`}
            style={{ 
              borderColor: INK, 
              background: MUSTARD, 
              color: INK, 
              boxShadow: isValid && !submitting ? hoardingShadow : 'none',
              transform: isValid && !submitting ? 'translate(-2px, -2px)' : 'none'
            }}
          >
            {submitting ? "Stamping..." : "Confirm Ticket"}
          </button>
        </form>
      </div>
    </Section>
  )
}

const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="flex flex-col gap-4 px-4 py-16 pb-32">
    <div className="border-4 border-dashed p-6 text-center bg-white" style={{ borderColor: TEAL }}>
      <h2 className={desiDisplay.className} style={{ color: TEAL, fontSize: "1.6rem" }}>
        Enquiries
      </h2>
      <div className={`${desiBody.className} mt-3 space-y-2 text-sm font-bold`} style={{ color: INK }}>
        <p>{contact.email}</p>
        <p>{contact.phone}</p>
        <p className="mt-4 pt-4 border-t-2 border-dotted text-xs" style={{ borderColor: TEAL }}>{contact.location}</p>
      </div>
    </div>
  </Section>
)

const Preview: ThemeModule["Preview"] = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden" style={{ background: JUTE }}>
    <div className="absolute top-0 left-0 right-0 h-2 flex overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-2 h-2 rounded-full border -ml-1 first:ml-0" style={{ background: MARIGOLD, borderColor: "#A54A00" }} />
      ))}
    </div>
    
    <div className="border-2 p-2 bg-white" style={{ borderColor: INK, boxShadow: `2px 2px 0 ${INK}` }}>
      <p className={desiDisplay.className} style={{ color: VERMILION, fontSize: "1rem", lineHeight: 1 }}>
        Desi Retro
      </p>
      <p className={`${desiBody.className} text-[9px] font-bold text-center uppercase tracking-widest`} style={{ color: TEAL }}>
        '90s Truck Art
      </p>
    </div>
    <div className="mt-1 flex gap-1">
      {[MUSTARD, TEAL, VERMILION, JUTE].map((c) => (
        <span key={c} className="size-3 border-2" style={{ background: c, borderColor: INK }} />
      ))}
    </div>
  </div>
)

const meta: ThemeModule["meta"] = {
  slug: "desi-retro",
  name: "Desi Retro '90s",
  tagline: "Truck art & cinema hoarding",
  swatch: ["#E8A13A", "#12595B", "#C7382F", "#D9C9A3"],
  fontDisplay: "--font-desi-retro-display",
  vibe: ["truck-art", "hoarding", "doordarshan"],
}

const desiRetroTheme: ThemeModule = {
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

export default desiRetroTheme
