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
import { useTilt } from "../_shared/use-tilt"
import { outrunDisplay, outrunBody } from "./fonts"

const PALETTE = {
  black: "#08050F",
  pink: "#FF3D81",
  orange: "#FF8A3D",
  violet: "#7B2FF7",
  cyan: "#22D3EE",
}

function goRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" })
}

const NeonText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span
    className={`${outrunDisplay.className} italic tracking-wider ${className}`}
    style={{
      background: `linear-gradient(to bottom, ${PALETTE.pink}, ${PALETTE.orange})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: `drop-shadow(3px 3px 0px ${PALETTE.violet})`,
    }}
  >
    {children}
  </span>
)

const ChromeDigits = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span
    className={`${outrunDisplay.className} italic tracking-widest ${className}`}
    style={{
      background: `linear-gradient(to bottom, #ffffff 0%, #aaaaaa 48%, #222222 50%, ${PALETTE.pink} 55%, ${PALETTE.orange} 100%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: `drop-shadow(2px 2px 0px ${PALETTE.cyan}) drop-shadow(-1px -1px 0px ${PALETTE.violet})`,
    }}
  >
    {children}
  </span>
)

function OutrunButton({
  eventId,
  className = "",
  children,
  onClick,
  type = "button"
}: {
  eventId?: EventId
  className?: string
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
}) {
  const { openRegistration } = useRegistration()
  return (
    <button
      type={type}
      onClick={(e) => {
        if (onClick) {
          onClick();
        } else if (type === "button") {
          openRegistration(eventId)
          goRegister()
        }
      }}
      className={`${outrunDisplay.className} group relative flex items-center justify-center overflow-hidden italic uppercase transition-all active:scale-95 ${className}`}
      style={{
        background: `linear-gradient(to right, ${PALETTE.pink}, ${PALETTE.orange})`,
        border: "2px solid #ffffff",
        boxShadow: `0 0 10px ${PALETTE.pink}, inset 0 0 10px ${PALETTE.orange}`,
        color: "#ffffff",
        textShadow: "1px 1px 2px black",
      }}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transition-transform duration-500 group-hover:translate-x-full" />
    </button>
  )
}

const Background: ThemeModule["Background"] = () => {
  const reduced = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { x, y } = useTilt(ref)
  const [scrollY, setScrollY] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div ref={ref} aria-hidden className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: PALETTE.black }}>
      <motion.div
        className="absolute inset-0"
        animate={reduced ? undefined : { x: x * -15, y: y * -15 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Sunset */}
        <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 size-64 rounded-full md:size-96"
          style={{
            background: `linear-gradient(to bottom, ${PALETTE.pink}, ${PALETTE.orange})`,
            boxShadow: `0 0 60px ${PALETTE.pink}, 0 0 100px ${PALETTE.orange}`,
            WebkitMaskImage: "repeating-linear-gradient(to bottom, black 0%, black 90%, transparent 90%, transparent 100%)",
            WebkitMaskSize: "100% 12px"
          }}
        />
        
        {/* Palm trees silhouettes */}
        <svg viewBox="0 0 100 100" className="absolute bottom-[35%] left-[5%] w-32 opacity-90 md:w-48" fill={PALETTE.black} style={{ filter: `drop-shadow(0 0 10px ${PALETTE.violet})` }}>
          <path d="M48,100 C45,70 50,50 52,40 C52,40 40,45 20,60 C35,45 50,45 50,45 C50,45 25,30 10,20 C30,25 50,40 50,40 C50,40 40,15 35,0 C45,15 50,38 50,38 C50,38 60,15 65,0 C55,15 52,38 52,38 C52,38 75,30 90,20 C70,25 52,40 52,40 C52,40 70,45 80,60 C65,45 52,45 52,45 C52,45 60,50 55,70 C53,100 50,100 48,100 Z" />
        </svg>
        <svg viewBox="0 0 100 100" className="absolute bottom-[35%] right-[5%] w-24 opacity-90 md:w-32" fill={PALETTE.black} style={{ filter: `drop-shadow(0 0 10px ${PALETTE.violet})`, transform: 'scaleX(-1)' }}>
          <path d="M48,100 C45,70 50,50 52,40 C52,40 40,45 20,60 C35,45 50,45 50,45 C50,45 25,30 10,20 C30,25 50,40 50,40 C50,40 40,15 35,0 C45,15 50,38 50,38 C50,38 60,15 65,0 C55,15 52,38 52,38 C52,38 75,30 90,20 C70,25 52,40 52,40 C52,40 70,45 80,60 C65,45 52,45 52,45 C52,45 60,50 55,70 C53,100 50,100 48,100 Z" />
        </svg>
      </motion.div>

      {/* Grid Horizon */}
      <div className="absolute inset-x-[-100%] bottom-0 h-[65vh]"
        style={{
          transform: "perspective(300px) rotateX(80deg)",
          transformOrigin: "top",
          background: `linear-gradient(to bottom, ${PALETTE.pink}44, transparent 60%)`,
        }}
      >
        <motion.div className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(to right, ${PALETTE.cyan} 0, ${PALETTE.cyan} 2px, transparent 2px, transparent 50px),
              repeating-linear-gradient(to bottom, ${PALETTE.cyan} 0, ${PALETTE.cyan} 2px, transparent 2px, transparent 50px)
            `,
            backgroundSize: "50px 50px",
          }}
          animate={reduced ? undefined : { backgroundPosition: ["0px 0px", "0px 50px"] }}
          transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#22D3EE88] to-transparent" />
      </div>

      {/* VHS overlay */}
      {!reduced && (
        <div 
          className="pointer-events-none absolute inset-0 mix-blend-screen opacity-20"
          style={{
            background: "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.8) 3px, rgba(0,0,0,0.8) 3px)",
            transform: `translateY(${(scrollY * 0.1) % 4}px)`,
          }}
        />
      )}
    </div>
  )
}

const Dock: ThemeModule["Dock"] = () => {
  const tabs = ["Home", "Events", "Schedule", "Sponsors"]
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t px-2 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-3"
      style={{
        background: "rgba(8, 5, 15, 0.8)",
        backdropFilter: "blur(10px)",
        borderTop: `2px solid ${PALETTE.cyan}`,
        boxShadow: `0 -5px 20px rgba(34, 211, 238, 0.3)`,
      }}
    >
      <nav className={`${outrunBody.className} flex flex-1 items-center justify-around text-[10px] uppercase tracking-widest text-[#22D3EE] md:text-xs`}>
        {tabs.map((t) => (
          <a key={t} href={`#${t.toLowerCase()}`} className="flex flex-col items-center gap-1 transition-colors hover:text-[#FF3D81]">
            <span className="h-0.5 w-4 bg-[#7B2FF7] opacity-80" />
            {t}
          </a>
        ))}
      </nav>
      <OutrunButton className="min-h-[56px] min-w-[130px] text-sm md:text-base">
        Register
      </OutrunButton>
    </div>
  )
}

const WarpIntro = () => {
  const reduced = useReducedMotion()
  const [done, setDone] = React.useState(reduced)
  
  if (done) return null
  
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-[#08050F]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      onAnimationComplete={() => setDone(true)}
    >
      <motion.div
        className="absolute inset-[-50%] h-[200%] w-[200%]"
        style={{
          background: `repeating-conic-gradient(from 0deg, ${PALETTE.cyan} 0deg 5deg, transparent 5deg 15deg)`,
        }}
        initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
        animate={{ scale: 3, opacity: 0.3, rotate: 45 }}
        transition={{ duration: 1.2, ease: "easeIn" }}
      />
    </motion.div>
  )
}

const Hero: ThemeModule["Hero"] = () => {
  const cd = useCountdown()
  const reduced = useReducedMotion()
  return (
    <Section id="home" className="flex flex-col items-center justify-center gap-6 px-6 pb-24 pt-32 text-center">
      <WarpIntro />
      <motion.p 
        initial={reduced ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className={`${outrunBody.className} text-sm uppercase tracking-[0.4em] text-[#22D3EE]`}
      >
        {site.eyebrow}
      </motion.p>
      
      <motion.h1 
        initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4 }}
        className="flex flex-col items-center"
      >
        <NeonText className="text-5xl md:text-6xl">{site.shortName}</NeonText>
        <ChromeDigits className="mt-2 text-7xl md:text-8xl">{site.version}</ChromeDigits>
      </motion.h1>
      
      <motion.p 
        initial={reduced ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className={`${outrunBody.className} max-w-xs text-base uppercase tracking-widest text-white/90 md:max-w-md`}
      >
        {site.tagline} {site.subTagline}
      </motion.p>

      <motion.div initial={reduced ? undefined : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
        <OutrunButton className="mt-4 px-10 py-4 text-base">
          Enter the Grid
        </OutrunButton>
      </motion.div>

      <motion.div 
        initial={reduced ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="mt-8 flex w-full max-w-sm justify-between rounded bg-[#08050F]/60 p-4 shadow-[0_0_20px_rgba(123,47,247,0.4)] backdrop-blur-md"
      >
        {[
          ["Days", cd.days],
          ["Hrs", cd.hours],
          ["Min", cd.minutes],
          ["Sec", cd.seconds],
        ].map(([label, value]) => (
          <div key={label as string} className="flex flex-col items-center">
            <ChromeDigits className="text-3xl md:text-4xl">{pad2(value as number)}</ChromeDigits>
            <div className={`${outrunBody.className} mt-1 text-[10px] uppercase tracking-widest text-[#22D3EE]`}>
              {label}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.p 
        initial={reduced ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className={`${outrunBody.className} mt-4 text-sm uppercase tracking-widest text-[#FF8A3D]`}
      >
        {site.date} <span className="mx-2 text-[#7B2FF7]">///</span> {site.venue}
      </motion.p>
    </Section>
  )
}

const Events: ThemeModule["Events"] = () => {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const reduced = useReducedMotion()
  return (
    <Section id="events" className="flex flex-col gap-10 px-5 py-16">
      <div className="text-center">
        <NeonText className="text-3xl md:text-4xl">Arcade</NeonText>
        <p className={`${outrunBody.className} mt-2 uppercase tracking-widest text-[#22D3EE]`}>
          Select Your Level
        </p>
      </div>
      
      {events.map((ev) => (
        <div key={ev.id} className="relative mt-8">
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0.5 }}
            whileInView={reduced ? undefined : { opacity: [0.5, 1, 0.7, 1] }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 border border-t-2 bg-[#08050F]/80 p-5 backdrop-blur-sm"
            style={{ 
              borderColor: ev.color,
              borderTopColor: "#fff",
              boxShadow: `0 0 15px ${ev.color}, inset 0 0 20px ${ev.color}40`,
            }}
          >
            <button type="button" className="flex w-full items-start justify-between text-left" onClick={() => setOpenId(openId === ev.id ? null : ev.id)}>
              <div className="flex gap-4">
                <span
                  className={`${outrunDisplay.className} text-xl italic`}
                  style={{ color: ev.color, textShadow: `0 0 10px ${ev.color}` }}
                >
                  {ev.index}
                </span>
                <div>
                  <h3 className={`${outrunBody.className} text-xl font-bold uppercase tracking-wider text-white`}>
                    {ev.name}
                  </h3>
                  <p className={`${outrunBody.className} text-xs uppercase tracking-widest`} style={{ color: ev.color }}>
                    {ev.tag}
                  </p>
                </div>
              </div>
              <div className={`${outrunBody.className} shrink-0 text-right text-sm uppercase text-white`}>
                <div className="opacity-70">{ev.format}</div>
                <div className="font-bold text-[#FF8A3D]">{ev.fee}</div>
              </div>
            </button>
            {openId === ev.id && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className={`${outrunBody.className} mt-4 space-y-3 border-t border-white/20 pt-4 text-sm text-white/90 overflow-hidden`}
              >
                <p className="leading-relaxed">{ev.description}</p>
                <ul className="list-disc space-y-1 pl-4 text-[#22D3EE]">
                  {ev.rules.map((r) => (
                    <li key={r}><span className="text-white/80">{r}</span></li>
                  ))}
                </ul>
                <ul className="space-y-1 text-[#FF3D81]">
                  {ev.prizes.map((p) => (
                    <li key={p.place}>
                      <span className="font-bold">{p.place}</span> <span className="text-white/80">— {p.reward}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            <OutrunButton eventId={ev.id} className="mt-5 w-full py-3 text-xs md:text-sm">
              Insert Coin to Join {ev.shortName}
            </OutrunButton>
          </motion.div>
          
          <div
            className="absolute left-0 top-full -z-10 h-full w-full scale-y-[-1] border p-5 opacity-40 blur-[2px]"
            style={{
              borderColor: ev.color,
              maskImage: "linear-gradient(to top, black, transparent 40%)",
              WebkitMaskImage: "linear-gradient(to top, black, transparent 40%)",
              boxShadow: `0 0 15px ${ev.color}`,
            }}
          />
        </div>
      ))}
    </Section>
  )
}

const Schedule: ThemeModule["Schedule"] = () => (
  <Section id="schedule" className="flex flex-col gap-8 px-5 py-16">
    <NeonText className="text-3xl text-center md:text-4xl">Timeline</NeonText>
    
    <div className="relative border-l-2 border-[#22D3EE] pl-6 ml-2 md:mx-auto md:w-full md:max-w-md">
      {schedule.map((item) => (
        <div key={item.title} className="mb-8 relative">
          <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-[#FF3D81] shadow-[0_0_10px_#FF3D81]" />
          <p className={`${outrunDisplay.className} text-sm text-[#FF8A3D]`}>
            {item.time}
          </p>
          <p className={`${outrunBody.className} text-xl font-bold uppercase tracking-wider text-white mt-1`}>
            {item.title}
          </p>
          <p className={`${outrunBody.className} text-sm text-white/70 tracking-wide mt-1`}>
            {item.description}
          </p>
        </div>
      ))}
    </div>
    
    <div className="mt-4 border border-[#7B2FF7] bg-[#7B2FF7]/10 p-4 text-center shadow-[0_0_15px_rgba(123,47,247,0.3)] mx-auto w-full max-w-md">
      <p className={`${outrunBody.className} text-sm uppercase tracking-widest text-[#22D3EE]`}>
        {site.venue}
      </p>
    </div>
  </Section>
)

const About: ThemeModule["About"] = () => (
  <Section id="about" className="flex flex-col gap-6 px-5 py-16">
    <NeonText className="text-3xl text-center md:text-4xl">About</NeonText>
    <p className={`${outrunBody.className} text-base text-center text-white/90 uppercase tracking-widest leading-relaxed md:mx-auto md:max-w-2xl`}>
      {site.about}
    </p>
    <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 md:mx-auto md:max-w-2xl">
      {highlights.map((h) => (
        <div key={h.title} className="border border-[#22D3EE]/50 bg-[#08050F]/80 p-4 backdrop-blur shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]">
          <p className={`${outrunDisplay.className} text-sm text-[#FF3D81] mb-2`}>
            {h.title}
          </p>
          <p className={`${outrunBody.className} text-xs text-white/70 tracking-widest`}>
            {h.description}
          </p>
        </div>
      ))}
    </div>
  </Section>
)

const Sponsors: ThemeModule["Sponsors"] = () => (
  <Section id="sponsors" className="flex flex-col gap-6 px-5 py-16">
    <NeonText className="text-3xl text-center md:text-4xl">Megacorps</NeonText>
    <div className="flex flex-col gap-4 md:mx-auto md:w-full md:max-w-md">
      {sponsors.map((s) => (
        <div key={s.name} className={`${outrunDisplay.className} text-center border-y border-[#7B2FF7]/50 py-4 text-lg text-[#22D3EE] shadow-[0_0_10px_rgba(123,47,247,0.2)] bg-gradient-to-r from-transparent via-[#7B2FF7]/10 to-transparent`}>
          {s.name}
        </div>
      ))}
    </div>
  </Section>
)

const Register: ThemeModule["Register"] = () => {
  const { preselectedEvent, submitted, submitting, submit, reset } = useRegistration()
  const { values, setField, isValid } = useRegistrationForm(preselectedEvent)

  if (submitted) {
    return (
      <Section id="register" className="flex flex-col items-center justify-center gap-4 px-5 py-24 text-center">
        <NeonText className="text-3xl md:text-4xl">Access Granted</NeonText>
        <p className={`${outrunBody.className} text-base uppercase tracking-widest text-[#22D3EE]`}>
          You are jacked in. Check your inbox.
        </p>
        <button type="button" onClick={reset} className={`${outrunBody.className} mt-4 text-sm tracking-widest text-[#FF3D81] underline hover:text-white`}>
          Register Another
        </button>
      </Section>
    )
  }

  const inputClass = `${outrunBody.className} w-full border-b-2 border-[#22D3EE] bg-[#22D3EE]/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-[#FF3D81] focus:bg-[#FF3D81]/10 placeholder:text-white/40 uppercase tracking-widest`

  return (
    <Section id="register" className="flex flex-col gap-6 px-5 py-16 pb-24 md:mx-auto md:w-full md:max-w-md">
      <div className="text-center">
        <NeonText className="text-3xl md:text-4xl">Join The Grid</NeonText>
        <p className={`${outrunBody.className} mt-2 text-sm uppercase tracking-widest text-[#FF8A3D]`}>
          Secure Your Access Code
        </p>
      </div>
      
      <form
        className="flex flex-col gap-5 mt-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (isValid) submit(values)
        }}
      >
        <input required placeholder="Alias (Name)" value={values.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
        <input required type="email" placeholder="Commlink (Email)" value={values.email} onChange={(e) => setField("email", e.target.value)} className={inputClass} />
        <input required type="tel" placeholder="Signal (Phone)" value={values.phone} onChange={(e) => setField("phone", e.target.value)} className={inputClass} />
        <input required placeholder="Sector (College)" value={values.college} onChange={(e) => setField("college", e.target.value)} className={inputClass} />
        
        <select required value={values.eventId} onChange={(e) => setField("eventId", e.target.value as EventId)} className={inputClass} style={{ appearance: "none" }}>
          <option value="" className="text-black">Select Program</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id} className="text-black">
              {ev.name}
            </option>
          ))}
        </select>
        
        <OutrunButton type="submit" className="mt-6 py-4 text-lg">
          {submitting ? "Processing..." : "Initialize"}
        </OutrunButton>
      </form>
    </Section>
  )
}

const Contact: ThemeModule["Contact"] = () => (
  <Section id="contact" className="flex flex-col gap-4 px-5 py-16 pb-32 text-center md:pb-40">
    <NeonText className="text-2xl md:text-3xl">Comms</NeonText>
    <div className={`${outrunBody.className} mt-4 space-y-2 text-base uppercase tracking-widest text-[#22D3EE]`}>
      <p>{contact.email}</p>
      <p>{contact.phone}</p>
      <p className="text-sm mt-4 text-[#FF8A3D]">{contact.location}</p>
    </div>
  </Section>
)

const Preview: ThemeModule["Preview"] = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#08050F]">
    <div className="absolute inset-x-0 bottom-0 h-1/2 border-t border-[#FF3D81] bg-gradient-to-t from-[#FF3D81]/20 to-transparent">
      <motion.div 
        className="absolute inset-0"
        animate={{ backgroundPosition: ["0px 0px", "0px 20px"] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #FF3D81 0, #FF3D81 1px, transparent 1px, transparent 20px), repeating-linear-gradient(0deg, #FF3D81 0, #FF3D81 1px, transparent 1px, transparent 20px)",
          backgroundSize: "20px 20px",
          transform: "perspective(100px) rotateX(60deg)",
          transformOrigin: "top"
        }} 
      />
    </div>
    <div className="absolute top-6 size-20 rounded-full bg-gradient-to-b from-[#FF3D81] to-[#FF8A3D] shadow-[0_0_20px_#FF3D81]" style={{
      WebkitMaskImage: "repeating-linear-gradient(to bottom, black 0%, black 90%, transparent 90%, transparent 100%)",
      WebkitMaskSize: "100% 4px"
    }} />
    
    <p className={`${outrunDisplay.className} relative z-10 text-2xl italic text-white`} style={{ textShadow: `2px 2px 0px ${PALETTE.cyan}` }}>
      Outrun
    </p>
    <p className={`${outrunBody.className} relative z-10 text-xs uppercase tracking-widest text-[#22D3EE] mt-1`}>
      1984's 2026
    </p>
  </div>
)

const meta: ThemeModule["meta"] = {
  slug: "outrun",
  name: "Outrun Synthwave",
  tagline: "1984's idea of 2026",
  swatch: [PALETTE.black, PALETTE.pink, PALETTE.cyan, PALETTE.orange],
  fontDisplay: "--font-outrun-display",
  vibe: ["synthwave", "retro", "neon", "cyber"],
}

const outrunTheme: ThemeModule = {
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

export default outrunTheme
