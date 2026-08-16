"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Gamepad2, CalendarDays, MoreHorizontal, X, Trophy, Users, Image, Info, Phone, Instagram } from "lucide-react"
import { INK, VERMILION, MUSTARD, AGED_PAPER } from "./tokens"
import { questDisplay, questBody } from "./fonts"

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Gamepad2 },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
] as const

const MOBILE_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Gamepad2 },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/more/sponsors", label: "Sponsors", icon: Trophy },
  { href: "/more/team", label: "Team", icon: Users },
  { href: "/more/gallery", label: "Gallery", icon: Image },
  { href: "/more/about", label: "About", icon: Info },
  { href: "/more/contact", label: "Contact", icon: Phone },
]

export function DesktopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [instagramTarget, setInstagramTarget] = useState("_blank")

  // Close sidebar and dropdown on path change
  useEffect(() => {
    setIsOpen(false)
    setMoreOpen(false)
  }, [pathname])

  // Detect restricted iframe or webview environment
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isIframe = window.self !== window.top
      const isWebView = /FBAN|FBAV|Instagram|LinkedIn/i.test(navigator.userAgent)
      if (isIframe || isWebView) {
        setInstagramTarget("_self")
      }
    }
  }, [])

  return (
    <>
      {/* ─── DESKTOP HEADER (md+) ─── */}
      <header
        className="sticky top-0 z-30 hidden border-b-4 md:block"
        style={{ borderColor: INK, background: MUSTARD }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-8 py-3">
          <Link href="/" className={questDisplay.className} style={{ color: INK, fontSize: "1.25rem" }}>
            Spectrum <span style={{ color: VERMILION }}>5.0</span>
          </Link>

          <nav className={`${questBody.className} flex items-center gap-2 text-sm font-bold uppercase tracking-wide`}>
            {TABS.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 border-2 px-4 py-2 transition-transform"
                  style={{
                    borderColor: INK,
                    background: active ? INK : "transparent",
                    color: active ? MUSTARD : INK,
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}

            {/* Dropdown tab for More */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className="flex items-center gap-2 border-2 px-4 py-2 transition-transform cursor-pointer focus:outline-none"
                style={{
                  borderColor: INK,
                  background: moreOpen ? INK : "transparent",
                  color: moreOpen ? MUSTARD : INK,
                }}
              >
                <MoreHorizontal size={16} />
                More
              </button>
              {moreOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div
                    className="absolute right-0 mt-2 w-48 border-4 z-50 flex flex-col p-2 shadow-lg"
                    style={{ borderColor: INK, background: AGED_PAPER }}
                  >
                    {[
                      { href: "/more/sponsors", label: "Sponsors", icon: Trophy },
                      { href: "/more/team", label: "Team", icon: Users },
                      { href: "/more/gallery", label: "Gallery", icon: Image },
                      { href: "/more/about", label: "About", icon: Info },
                      { href: "/more/contact", label: "Contact", icon: Phone },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="px-4 py-2.5 text-xs font-bold uppercase hover:bg-neutral-200 transition-colors flex items-center gap-2"
                        style={{ color: INK }}
                      >
                        <item.icon size={14} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/register")}
              className={`${questDisplay.className} border-2 px-5 py-2 text-sm transition-transform hover:-translate-y-0.5`}
              style={{ borderColor: INK, background: VERMILION, color: AGED_PAPER, boxShadow: `3px 3px 0px ${INK}` }}
            >
              Register
            </button>
            <a
              href="https://www.instagram.com/spectrum.sbmp?igsh=MWJ4dTA5ajAzZG5zaQ=="
              target={instagramTarget}
              rel="noopener noreferrer"
              className="flex size-9 items-center justify-center border-2 transition-transform hover:-translate-y-0.5"
              style={{ background: VERMILION, borderColor: INK, color: AGED_PAPER, boxShadow: `3px 3px 0px ${INK}` }}
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </header>

      {/* ─── MOBILE HEADER (md:hidden) ─── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b-4 px-6 py-4 md:hidden"
        style={{ borderColor: INK, background: MUSTARD }}
      >
        {/* Animated Hamburger Icon on the Left */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-6 w-6 flex flex-col justify-center items-center z-55 focus:outline-none animate-none"
          type="button"
          aria-label="Toggle Menu"
        >
          <span
            className={`absolute h-0.5 w-6 transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-0" : "-translate-y-2"
            }`}
            style={{ background: INK }}
          />
          <span
            className={`absolute h-0.5 w-6 transition-all duration-300 ${
              isOpen ? "opacity-0 scale-x-0" : ""
            }`}
            style={{ background: INK }}
          />
          <span
            className={`absolute h-0.5 w-6 transition-all duration-300 ${
              isOpen ? "-rotate-45 translate-y-0" : "translate-y-2"
            }`}
            style={{ background: INK }}
          />
        </button>

        <Link href="/" className={questDisplay.className} style={{ color: INK, fontSize: "1.25rem" }}>
          Spectrum <span style={{ color: VERMILION }}>5.0</span>
        </Link>

        <a
          href="https://www.instagram.com/spectrum.sbmp?igsh=MWJ4dTA5ajAzZG5zaQ=="
          target={instagramTarget}
          rel="noopener noreferrer"
          className="flex size-8 items-center justify-center border-2 transition-transform active:scale-95"
          style={{ background: VERMILION, borderColor: INK, color: AGED_PAPER, boxShadow: `2px 2px 0px ${INK}` }}
        >
          <Instagram size={16} />
        </a>
      </header>

      {/* ─── MOBILE SIDEBAR & BACKDROP ─── */}
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar Panel - Slides in from the LEFT */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-72 border-r-4 transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between p-8"
        style={{
          borderColor: INK,
          background: MUSTARD,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-between border-b-2 pb-4 mb-4 shrink-0" style={{ borderColor: INK }}>
          <Link
            href="/"
            className={questDisplay.className}
            style={{ color: INK, fontSize: "1.5rem" }}
          >
            Spectrum <span style={{ color: VERMILION }}>5.0</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center p-2 border-2 hover:bg-neutral-200 transition-colors animate-none"
            style={{ borderColor: INK, background: AGED_PAPER }}
            aria-label="Close menu"
          >
            <X size={18} color={INK} />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto max-h-[65dvh] pr-1 flex-1">

          <nav className={`${questBody.className} flex flex-col gap-2.5 text-base font-bold uppercase tracking-wide`}>
            {MOBILE_LINKS.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-4 border-2 px-4 py-2.5 transition-transform"
                  style={{
                    borderColor: INK,
                    background: active ? INK : AGED_PAPER,
                    color: active ? MUSTARD : INK,
                    boxShadow: active ? "none" : `3px 3px 0px ${INK}`,
                  }}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            router.push("/register")
          }}
          className={`${questDisplay.className} w-full border-2 py-3.5 text-center text-base transition-transform hover:-translate-y-0.5 mt-6`}
          style={{ borderColor: INK, background: VERMILION, color: AGED_PAPER, boxShadow: `4px 4px 0px ${INK}` }}
        >
          Register Now
        </button>
      </aside>
    </>
  )
}
