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
import { blueprintDisplay, blueprintBody, blueprintMono } from "./fonts"

// ---- Palette ----
const BG_TOP = "#0B3D6B"
const BG_BOT = "#082C4E"
const WHITE = "#FFFFFF"
const CYAN = "#5BE1FF"
const AMBER = "#FFB347"

// ---- Helpers ----
function goRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function DimensionLine({ width, label }: { width: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2" style={{ width }}>
      <div className="flex-1 relative flex items-center">
        <div className="absolute left-0 w-[1px] h-3 bg-[#5BE1FF]" />
        <div className="flex-1 h-[1px] bg-[#5BE1FF] opacity-60" />
        <div className="absolute right-0 w-[1px] h-3 bg-[#5BE1FF]" />
      </div>
      <span className={`${blueprintMono.className} text-[10px] text-[#5BE1FF] whitespace-nowrap uppercase`}>{label}</span>
    </div>
  )
}

function BlueprintButton({
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
      className={`relative border flex items-center justify-center font-bold tracking-widest uppercase transition-all duration-200 active:scale-95 ${blueprintDisplay.className} ${className}`}
      style={{
        borderColor: variant === "primary" ? CYAN : "rgba(255,255,255,0.5)",
        backgroundColor: variant === "primary" ? "rgba(91,225,255,0.15)" : "transparent",
        color: variant === "primary" ? CYAN : WHITE,
        textShadow: variant === "primary" ? `0 0 8px ${CYAN}80` : "none",
      }}
    >
      <div className="absolute inset-0.5 border border-dashed opacity-30" style={{ borderColor: variant === "primary" ? CYAN : WHITE }} />
      <span className="relative z-10">{children}</span>
    </button>
  )
}

function Sheet({
  children,
  sheetId,
  scale = "1:1",
  rev = "A",
  className = "",
}: {
  children: React.ReactNode
  sheetId: string
  scale?: string
  rev?: string
  className?: string
}) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, clipPath: "inset(100% 0 0 0)" }}
      whileInView={reduced ? undefined : { opacity: 1, clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative border border-white/30 bg-[#0A3359]/60 backdrop-blur-sm m-4 p-5 ${className}`}
    >
      {/* Drafting tape corners */}
      <div className="absolute -top-2 -left-2 w-8 h-3 bg-white/40 rotate-[-45deg] shadow-sm backdrop-blur-md" />
      <div className="absolute -bottom-2 -right-2 w-8 h-3 bg-white/40 rotate-[-45deg] shadow-sm backdrop-blur-md" />

      {/* Title Block */}
      <div className="absolute bottom-0 right-0 border-t border-l border-white/30 flex divide-x divide-white/30 bg-[#0B3D6B]/80 text-white/70">
        <div className={`${blueprintMono.className} text-[8px] p-1 px-2 uppercase`}>SHEET {sheetId}</div>
        <div className={`${blueprintMono.className} text-[8px] p-1 px-2 uppercase hidden sm:block`}>SCALE {scale}</div>
        <div className={`${blueprintMono.className} text-[8px] p-1 px-2 uppercase`}>REV {rev}</div>
      </div>

      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
const Background: ThemeModule["Background"] = () => {
  const reduced = useReducedMotion()
  const [mousePos, setMousePos] = React.useState({ x: -100, y: -100 })
  
  React.useEffect(() => {
    // Only bind if we can hover, to avoid layout thrashing on touch scroll
    const isTouch = window.matchMedia("(hover: none)").matches
    if (reduced || isTouch) return
    
    let frame: number
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY })
      })
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${BG_TOP}, ${BG_BOT})` }}>
      {/* Graph Paper Grid - Fine */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${WHITE} 1px, transparent 1px),
            linear-gradient(to bottom, ${WHITE} 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      {/* Graph Paper Grid - Coarse */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${WHITE} 1px, transparent 1px),
            linear-gradient(to bottom, ${WHITE} 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
      />

      {/* Coffee Stain (subtle warm touch) */}
      <div className="absolute top-20 right-10 w-48 h-48 opacity-[0.06] pointer-events-none rounded-full border-[3px] border-[#3b2818] blur-[1px]" style={{ transform: "scale(1.2) rotate(15deg)" }} />
      <div className="absolute top-16 right-12 w-48 h-48 opacity-[0.04] pointer-events-none rounded-full border-[6px] border-[#3b2818] blur-[2px]" style={{ transform: "scale(1.1) rotate(-15deg)" }} />

      {/* Crosshair Cursor */}
      {!reduced && (
        <div
          className="fixed pointer-events-none z-50 mix-blend-screen hidden sm:block"
          style={{ transform: `translate(${mousePos.x - 16}px, ${mousePos.y - 16}px)` }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={CYAN} strokeWidth="1.5">
            <path d="M16 0V12 M16 20V32 M0 16H12 M20 16H32" />
            <circle cx="16" cy="16" r="2" fill={CYAN} opacity="0.8" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dock
// ---------------------------------------------------------------------------
const Dock: ThemeModule["Dock"] = () => {
  const tabs = [
    { label: "HOME", href: "#home", id: "01" },
    { label: "EVENTS", href: "#events", id: "02" },
    { label: "SCHED", href: "#schedule", id: "03" },
    { label: "SPONS", href: "#sponsors", id: "04" },
  ]
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-white/30 backdrop-blur-md bg-[#082C4E]/90 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex flex-1 items-end divide-x divide-white/20">
        {tabs.map((t) => (
          <a
            key={t.id}
            href={t.href}
            className={`flex-1 pb-2 pt-3 flex flex-col items-center justify-center gap-0.5 transition-colors text-white/50 hover:text-[#5BE1FF] hover:bg-white/5 active:bg-white/10 ${blueprintMono.className}`}
          >
            <span className="text-[9px] opacity-60 leading-none">{t.id}</span>
            <span className="text-[10px] leading-none uppercase tracking-wider">{t.label}</span>
          </a>
        ))}
      </nav>
      <BlueprintButton className="m-1 min-h-[56px] min-w-[120px] text-sm" variant="primary">
        REGISTER
      </BlueprintButton>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
const Hero: ThemeModule["Hero"] = () => {
  const cd = useCountdown()
  const reduced = useReducedMotion()

  return (
    <Section id="home" className="pt-12 pb-24 px-0 flex flex-col items-center justify-center min-h-[100dvh]">
      <Sheet sheetId="01/07" className="w-full max-w-lg mx-auto flex flex-col items-center text-center pb-12 pt-8">
        <motion.div
          initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
          animate={reduced ? undefined : { pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
        >
          <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
             <line x1="10%" y1="0" x2="10%" y2="100%" stroke={WHITE} strokeWidth="1" strokeDasharray="4 4" />
             <line x1="90%" y1="0" x2="90%" y2="100%" stroke={WHITE} strokeWidth="1" strokeDasharray="4 4" />
             <line x1="0" y1="30%" x2="100%" y2="30%" stroke={WHITE} strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </motion.div>

        <p className={`${blueprintMono.className} text-[10px] text-[#5BE1FF] uppercase tracking-[0.2em] mb-4 z-10`}>
          {site.eyebrow}
        </p>

        <h1 className={`${blueprintDisplay.className} text-[2.5rem] leading-[1.1] mb-2 text-white relative inline-block z-10`}>
          {site.shortName}
          <div className="absolute -right-8 -top-2">
             <div className={`${blueprintMono.className} text-[9px] text-[#5BE1FF] border border-[#5BE1FF]/50 px-1 py-0.5 transform rotate-[15deg] bg-[#0A3359]`}>
               v{site.version}
             </div>
          </div>
        </h1>
        
        <p className={`${blueprintBody.className} text-white/80 text-sm max-w-[280px] mt-2 mb-8 leading-relaxed z-10`}>
          {site.tagline} <br/> {site.subTagline}
        </p>

        <BlueprintButton className="px-8 py-4 mb-8 text-base min-h-[56px] w-full max-w-[240px] z-10">
          REGISTER_NOW
        </BlueprintButton>

        <div className="grid grid-cols-4 w-full max-w-[300px] border border-white/30 divide-x divide-white/30 bg-[#0A3359]/50 z-10">
          <div className="col-span-4 border-b border-white/30 p-1.5 flex justify-between items-center bg-white/5">
            <span className={`${blueprintMono.className} text-[9px] text-white/60 uppercase`}>T-MINUS LAUNCH</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
          </div>
          {[
            ["DD", cd.days],
            ["HH", cd.hours],
            ["MM", cd.minutes],
            ["SS", cd.seconds],
          ].map(([label, value]) => (
            <div key={label as string} className="flex flex-col items-center py-2 relative">
              <div className={`${blueprintMono.className} text-[#5BE1FF] text-xl font-light tracking-widest`}>
                {pad2(value as number)}
              </div>
              <div className={`${blueprintMono.className} text-[9px] text-[#5BE1FF]/70`}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-1 z-10">
          <DimensionLine width="180px" label="LOC / TIME" />
          <p className={`${blueprintMono.className} text-xs text-white/90 mt-2`}>
            {site.dateShort}
          </p>
          <p className={`${blueprintBody.className} text-[11px] text-white/60 max-w-[200px] text-center`}>
            {site.venue}
          </p>
        </div>
      </Sheet>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
const Events: ThemeModule["Events"] = () => {
  const [openId, setOpenId] = React.useState<string | null>(null)
  
  return (
    <Section id="events" className="px-0 py-8">
      <Sheet sheetId="02/07" rev="B" className="pb-10 max-w-lg mx-auto">
        <h2 className={`${blueprintDisplay.className} text-2xl text-white mb-1`}>ASSEMBLY_EVENTS</h2>
        <p className={`${blueprintMono.className} text-xs text-[#5BE1FF] mb-6 uppercase`}>CHOOSE YOUR SCHEMATIC</p>
        
        <div className="flex flex-col gap-8">
          {events.map((ev) => (
            <div key={ev.id} className="relative group">
              <button 
                type="button"
                onClick={() => setOpenId(openId === ev.id ? null : ev.id)}
                className="w-full text-left relative z-10 block"
              >
                {/* Exploded Isometric Base Layer */}
                <div className={`absolute inset-0 bg-[#0B3D6B] border border-white/20 transition-transform duration-300 ${openId === ev.id ? 'translate-x-2 translate-y-2' : 'translate-x-0 translate-y-0'}`} />
                
                {/* Content Layer */}
                <div className={`relative border border-white/40 bg-[#092B4B]/90 p-4 transition-all duration-300 ${openId === ev.id ? '-translate-x-1 -translate-y-1 shadow-[4px_4px_0_rgba(91,225,255,0.15)]' : ''}`}>
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-start pt-1">
                      <span className={`${blueprintDisplay.className} text-2xl text-white/30`}>{ev.index}</span>
                      <div className="w-[1px] h-full bg-white/20 mt-2" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`${blueprintBody.className} text-lg font-bold text-white uppercase tracking-wide`} style={{ color: ev.color }}>
                        {ev.name}
                      </h3>
                      <p className={`${blueprintMono.className} text-[10px] text-white/70 mb-2 mt-1 uppercase`}>
                        {ev.tag}
                      </p>
                      
                      <div className="flex justify-between items-end border-t border-white/20 pt-2 mt-2">
                        <div className={`${blueprintMono.className} text-[9px] text-white/50 flex flex-col gap-1`}>
                          <span>FMT: {ev.format}</span>
                          <span>FEE: {ev.fee}</span>
                        </div>
                        <div className={`${blueprintMono.className} text-[9px] text-[#5BE1FF] border border-[#5BE1FF]/30 px-2 py-0.5 bg-[#5BE1FF]/10`}>
                          {openId === ev.id ? 'COLLAPSE' : 'EXPAND'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${openId === ev.id ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                    <div className="pt-4 border-t border-dashed border-white/30 relative">
                       {/* Revision Cloud highlighting deadline area */}
                       <svg className="absolute -right-2 top-2 w-24 h-12 pointer-events-none opacity-40" viewBox="0 0 100 50">
                         <path d="M10,25 Q15,5 30,10 Q45,-5 60,10 Q75,0 90,15 Q105,25 90,35 Q75,50 60,40 Q45,55 30,40 Q15,50 10,25 Z" fill="none" stroke={AMBER} strokeWidth="1.5" strokeLinejoin="round"/>
                       </svg>

                       <p className={`${blueprintBody.className} text-[13px] text-white/80 leading-relaxed mb-4`}>
                         {ev.description}
                       </p>
                       
                       <div className="grid grid-cols-1 gap-4 mb-4">
                         <div>
                           <div className={`${blueprintMono.className} text-[10px] text-[#5BE1FF] mb-1.5 flex items-center gap-2`}>
                             <span className="w-2 h-[1px] bg-[#5BE1FF]" /> RULES_
                           </div>
                           <ul className="list-none space-y-1.5 pl-3 border-l border-white/20">
                             {ev.rules.map((r, ri) => (
                               <li key={ri} className={`${blueprintMono.className} text-[10px] text-white/70 relative leading-snug`}>
                                 <span className="absolute -left-3 top-[0.45em] w-1.5 h-[1px] bg-white/40" />
                                 {r}
                               </li>
                             ))}
                           </ul>
                         </div>
                         <div>
                           <div className={`${blueprintMono.className} text-[10px] text-[#5BE1FF] mb-1.5 flex items-center gap-2`}>
                             <span className="w-2 h-[1px] bg-[#5BE1FF]" /> PRIZES_
                           </div>
                           <div className="space-y-1.5 pl-3 border-l border-white/20">
                             {ev.prizes.map((p, pi) => (
                               <div key={pi} className={`${blueprintMono.className} text-[10px] flex justify-between border-b border-white/10 pb-1`}>
                                 <span className="text-white/60">{p.place}</span>
                                 <span className="text-[#FFB347]">{p.reward}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                       
                       <p className={`${blueprintMono.className} text-[9px] text-[#FFB347] mb-4 text-right pr-2`}>
                         D-LINE: {ev.registrationEnds}
                       </p>

                       <BlueprintButton eventId={ev.id} className="w-full py-3.5 text-sm">
                         REGISTER ({ev.shortName})
                       </BlueprintButton>
                    </div>
                  </div>

                </div>
              </button>
            </div>
          ))}
        </div>
      </Sheet>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------
const Schedule: ThemeModule["Schedule"] = () => (
  <Section id="schedule" className="px-0 py-8">
    <Sheet sheetId="03/07" rev="A" className="pb-8 max-w-lg mx-auto">
      <h2 className={`${blueprintDisplay.className} text-2xl text-white mb-1`}>TIMELINE_GANTT</h2>
      <p className={`${blueprintMono.className} text-xs text-[#5BE1FF] mb-6 uppercase`}>OPERATIONAL FLOW</p>
      
      <div className="relative border-l border-white/30 ml-4 pb-2 mt-4">
        {schedule.map((item, i) => (
          <div key={i} className="mb-6 relative">
            {/* Connection line */}
            <div className="absolute top-2.5 -left-4 w-4 h-[1px] bg-white/50" />
            <div className="absolute top-1.5 -left-5 w-2 h-2 rounded-full border border-[#5BE1FF] bg-[#0B3D6B]" />
            
            <div className="pl-3">
              <div className={`${blueprintMono.className} text-[10px] text-[#5BE1FF] mb-0.5 tracking-wider`}>
                {item.time}
              </div>
              <div className={`${blueprintBody.className} text-[15px] font-bold text-white uppercase`}>
                {item.title}
              </div>
              <div className={`${blueprintMono.className} text-[10px] text-white/60 mt-1`}>
                {item.description}
              </div>
              
              {/* Gantt Bar abstract */}
              <div className="mt-2 h-1.5 w-full max-w-[200px] bg-white/5 border border-white/20 relative">
                <div 
                  className="absolute inset-y-0 left-0 bg-[#5BE1FF]/30 border-r border-[#5BE1FF]" 
                  style={{ width: `${(i + 1) * (100 / schedule.length)}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Floor Plan abstract */}
      <div className="mt-8 border border-white/20 p-4 bg-white/5 relative">
         <DimensionLine width="100%" label="VENUE SCHEMATIC" />
         <div className="mt-4 border border-dashed border-[#5BE1FF]/50 h-24 flex items-center justify-center relative bg-[#092B4B]/50">
            <div className="absolute top-2 left-2 w-6 h-6 border border-white/30" />
            <div className="absolute bottom-2 right-2 w-10 h-5 border border-white/30" />
            <span className={`${blueprintDisplay.className} text-white/40 tracking-widest text-sm text-center px-4 uppercase`}>
              {site.venue}
            </span>
         </div>
      </div>
    </Sheet>
  </Section>
)

// ---------------------------------------------------------------------------
// About & Sponsors
// ---------------------------------------------------------------------------
const About: ThemeModule["About"] = () => (
  <Section id="about" className="px-0 py-8">
    <Sheet sheetId="04/07" className="max-w-lg mx-auto">
      <h2 className={`${blueprintDisplay.className} text-2xl text-white mb-4`}>PROJECT_SPEC</h2>
      <p className={`${blueprintBody.className} text-sm text-white/80 leading-relaxed mb-6 border-l-2 border-[#5BE1FF] pl-3`}>
        {site.about}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {highlights.map((h, i) => (
          <div key={i} className="border border-white/20 p-3 bg-white/5 relative">
            <div className="absolute top-0 right-0 p-1 bg-white/10">
              <span className={`${blueprintMono.className} text-[8px] text-white/60`}>FIG {i+1}</span>
            </div>
            <h3 className={`${blueprintMono.className} text-[11px] text-[#5BE1FF] font-bold mb-1 uppercase tracking-wide`}>
              {h.title}
            </h3>
            <p className={`${blueprintMono.className} text-[9px] text-white/60 leading-relaxed`}>
              {h.description}
            </p>
          </div>
        ))}
      </div>
    </Sheet>
  </Section>
)

const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className="px-0 py-8">
    <Sheet sheetId="05/07" className="max-w-lg mx-auto">
      <h2 className={`${blueprintDisplay.className} text-2xl text-white mb-6`}>PARTNERS</h2>
      <div className="flex flex-wrap gap-3">
        {sponsors.map((s, i) => (
          <div key={i} className="flex-1 min-w-[120px] border border-white/30 p-4 text-center bg-white/5 backdrop-blur-sm">
             <span className={`${blueprintDisplay.className} text-white/90 text-sm tracking-wider uppercase`}>{s.name}</span>
          </div>
        ))}
      </div>
    </Sheet>
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
      <Section id="register" className="px-0 py-8">
        <Sheet sheetId="06/07" className="text-center py-12 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#5BE1FF] text-[#5BE1FF] mb-4 shadow-[0_0_15px_rgba(91,225,255,0.3)]">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <polyline points="20 6 9 17 4 12" />
             </svg>
          </div>
          <h2 className={`${blueprintDisplay.className} text-2xl text-white mb-2`}>TRANSMISSION LOGGED</h2>
          <p className={`${blueprintMono.className} text-xs text-white/70 mb-8`}>
            Awaiting further instructions via secure channel (email).
          </p>
          <button type="button" onClick={reset} className={`${blueprintMono.className} text-[10px] text-[#5BE1FF] underline underline-offset-4 opacity-80 hover:opacity-100 uppercase tracking-widest`}>
            [ INITIATE NEW ENTRY ]
          </button>
        </Sheet>
      </Section>
    )
  }

  return (
    <Section id="register" className="px-0 py-8">
      <Sheet sheetId="06/07" className="pb-10 max-w-lg mx-auto">
        <h2 className={`${blueprintDisplay.className} text-2xl text-white mb-1`}>REGISTRATION_REQ</h2>
        <p className={`${blueprintMono.className} text-xs text-[#FFB347] mb-6 uppercase flex items-center gap-2`}>
          <span className="w-1.5 h-1.5 bg-[#FFB347] rounded-full animate-pulse" />
          AUTHORIZATION REQUIRED
        </p>

        <form
          className="flex flex-col gap-5 mt-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (isValid) submit(values)
          }}
        >
          <div className="relative">
            <label className={`${blueprintMono.className} absolute -top-2 left-3 bg-[#092D50] px-1 text-[9px] text-[#5BE1FF] z-10`}>FULL_NAME</label>
            <input required placeholder="Enter Name" value={values.name} onChange={(e) => setField("name", e.target.value)} className={`${blueprintMono.className} w-full border border-white/30 bg-white/5 p-3.5 text-sm text-white placeholder-white/30 focus:border-[#5BE1FF] outline-none transition-colors rounded-none`} />
          </div>
          <div className="relative">
            <label className={`${blueprintMono.className} absolute -top-2 left-3 bg-[#092D50] px-1 text-[9px] text-[#5BE1FF] z-10`}>EMAIL_ADDR</label>
            <input required type="email" placeholder="Enter Email" value={values.email} onChange={(e) => setField("email", e.target.value)} className={`${blueprintMono.className} w-full border border-white/30 bg-white/5 p-3.5 text-sm text-white placeholder-white/30 focus:border-[#5BE1FF] outline-none transition-colors rounded-none`} />
          </div>
          <div className="relative">
            <label className={`${blueprintMono.className} absolute -top-2 left-3 bg-[#092D50] px-1 text-[9px] text-[#5BE1FF] z-10`}>COMMLINK</label>
            <input required type="tel" placeholder="Enter Phone" value={values.phone} onChange={(e) => setField("phone", e.target.value)} className={`${blueprintMono.className} w-full border border-white/30 bg-white/5 p-3.5 text-sm text-white placeholder-white/30 focus:border-[#5BE1FF] outline-none transition-colors rounded-none`} />
          </div>
          <div className="relative">
            <label className={`${blueprintMono.className} absolute -top-2 left-3 bg-[#092D50] px-1 text-[9px] text-[#5BE1FF] z-10`}>INSTITUTION</label>
            <input required placeholder="Enter College" value={values.college} onChange={(e) => setField("college", e.target.value)} className={`${blueprintMono.className} w-full border border-white/30 bg-white/5 p-3.5 text-sm text-white placeholder-white/30 focus:border-[#5BE1FF] outline-none transition-colors rounded-none`} />
          </div>
          <div className="relative">
            <label className={`${blueprintMono.className} absolute -top-2 left-3 bg-[#092D50] px-1 text-[9px] text-[#5BE1FF] z-10`}>TARGET_EVENT</label>
            <select required value={values.eventId} onChange={(e) => setField("eventId", e.target.value as EventId)} className={`${blueprintMono.className} w-full border border-white/30 bg-[#0A3359] p-3.5 text-sm text-white focus:border-[#5BE1FF] outline-none transition-colors appearance-none rounded-none`}>
              <option value="" disabled>Select Objective</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5BE1FF] text-[10px]">
               ▼
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!isValid || submitting}
            className={`mt-4 w-full py-4 relative border border-[#5BE1FF] bg-[#5BE1FF]/15 text-[#5BE1FF] font-bold tracking-widest uppercase transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:border-white/30 disabled:text-white/50 disabled:bg-transparent shadow-[0_0_10px_rgba(91,225,255,0.2)] disabled:shadow-none ${blueprintDisplay.className}`}
          >
            {submitting ? "TRANSMITTING..." : "COMMIT_ENTRY"}
          </button>
        </form>
      </Sheet>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="px-0 py-8 pb-32">
    <Sheet sheetId="07/07" className="max-w-lg mx-auto">
      <h2 className={`${blueprintDisplay.className} text-2xl text-white mb-4`}>COMMS_HUB</h2>
      <div className={`${blueprintMono.className} flex flex-col gap-3 text-xs text-white/80`}>
        <div className="flex items-center border-b border-white/20 pb-2">
          <span className="w-16 text-[#5BE1FF]">MAIL:</span>
          <span>{contact.email}</span>
        </div>
        <div className="flex items-center border-b border-white/20 pb-2">
          <span className="w-16 text-[#5BE1FF]">FREQ:</span>
          <span>{contact.phone}</span>
        </div>
        <div className="flex pt-1">
          <span className="w-16 text-[#5BE1FF]">LOC:</span>
          <span className="flex-1 leading-relaxed">{contact.location}</span>
        </div>
      </div>
    </Sheet>
  </Section>
)

// ---------------------------------------------------------------------------
// Preview (World Select Miniature)
// ---------------------------------------------------------------------------
const Preview: ThemeModule["Preview"] = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center p-4 bg-[#0B3D6B] overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.25]"
      style={{
        backgroundImage: `
          linear-gradient(to right, ${WHITE} 1px, transparent 1px),
          linear-gradient(to bottom, ${WHITE} 1px, transparent 1px)
        `,
        backgroundSize: "12px 12px",
      }}
    />
    
    <div className="relative border border-white/40 bg-[#092B4B]/80 p-3 w-full backdrop-blur-sm shadow-lg">
       <div className="absolute -top-1 -left-1 w-3 h-1 bg-white/70 rotate-[-45deg]" />
       <div className="absolute -bottom-1 -right-1 w-3 h-1 bg-white/70 rotate-[-45deg]" />
       <h3 className={`${blueprintDisplay.className} text-white text-sm mb-1`}>BLUEPRINT LAB</h3>
       <div className="flex items-center gap-2 border-t border-white/20 pt-2">
          <div className="flex-1 h-[1px] bg-[#5BE1FF] relative">
             <div className="absolute -top-1 left-0 w-[1px] h-2 bg-[#5BE1FF]" />
             <div className="absolute -top-1 right-0 w-[1px] h-2 bg-[#5BE1FF]" />
          </div>
          <span className={`${blueprintMono.className} text-[8px] text-[#5BE1FF] uppercase`}>SCHEMATIC</span>
       </div>
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// Meta & Export
// ---------------------------------------------------------------------------
const meta: ThemeModule["meta"] = {
  slug: "blueprint",
  name: "Blueprint Lab",
  tagline: "Cyanotype technical drawing",
  swatch: ["#0B3D6B", "#FFFFFF", "#5BE1FF", "#FFB347"],
  fontDisplay: "--font-blueprint-display",
  vibe: ["technical", "precise", "nerdy"],
}

const blueprintTheme: ThemeModule = {
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

export default blueprintTheme
