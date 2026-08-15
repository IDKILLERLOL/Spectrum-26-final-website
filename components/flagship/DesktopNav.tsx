"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Gamepad2, CalendarDays, MoreHorizontal, X } from "lucide-react"
import { INK, VERMILION, MUSTARD, AGED_PAPER } from "./tokens"
import { questDisplay, questBody } from "./fonts"

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Gamepad2 },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/more", label: "More", icon: MoreHorizontal },
] as const

export function DesktopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar on path change
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(false), 0)
    return () => clearTimeout(timer)
  }, [pathname])

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

          <nav className={`${questBody.className} flex items-center gap-1 text-sm font-bold uppercase tracking-wide`}>
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
          </nav>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className={`${questDisplay.className} border-2 px-5 py-2 text-sm transition-transform hover:-translate-y-0.5`}
            style={{ borderColor: INK, background: VERMILION, color: AGED_PAPER, boxShadow: `3px 3px 0px ${INK}` }}
          >
            Register
          </button>
        </div>
      </header>

      {/* ─── MOBILE HEADER (md:hidden) ─── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b-4 px-6 py-4 md:hidden"
        style={{ borderColor: INK, background: MUSTARD }}
      >
        <Link href="/" className={questDisplay.className} style={{ color: INK, fontSize: "1.25rem" }}>
          Spectrum <span style={{ color: VERMILION }}>5.0</span>
        </Link>

        {/* Animated Hamburger Icon */}
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
      </header>

      {/* ─── MOBILE SIDEBAR & BACKDROP ─── */}
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 border-l-4 transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between p-8`}
        style={{
          borderColor: INK,
          background: MUSTARD,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 flex items-center justify-center p-2 border-2 hover:bg-neutral-200 transition-colors"
          style={{ borderColor: INK, background: AGED_PAPER }}
          aria-label="Close menu"
        >
          <X size={18} color={INK} />
        </button>

        <div className="flex flex-col gap-8 mt-12">
          <Link
            href="/"
            className={`${questDisplay.className} border-b-2 pb-4 mb-4`}
            style={{ color: INK, fontSize: "1.5rem", borderColor: INK }}
          >
            Spectrum <span style={{ color: VERMILION }}>5.0</span>
          </Link>

          <nav className={`${questBody.className} flex flex-col gap-3 text-lg font-bold uppercase tracking-wide`}>
            {TABS.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-4 border-2 px-4 py-3 transition-transform"
                  style={{
                    borderColor: INK,
                    background: active ? INK : AGED_PAPER,
                    color: active ? MUSTARD : INK,
                    boxShadow: active ? "none" : `3px 3px 0px ${INK}`,
                  }}
                >
                  <Icon size={20} />
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
          className={`${questDisplay.className} w-full border-2 py-4 text-center text-lg transition-transform hover:-translate-y-0.5 mt-8`}
          style={{ borderColor: INK, background: VERMILION, color: AGED_PAPER, boxShadow: `4px 4px 0px ${INK}` }}
        >
          Register Now
        </button>
      </aside>
    </>
  )
}
