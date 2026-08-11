"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Gamepad2, CalendarDays, MoreHorizontal } from "lucide-react"
import { INK, VERMILION, MUSTARD, AGED_PAPER } from "./tokens"
import { questDisplay, questBody } from "./fonts"

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Gamepad2 },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/more", label: "More", icon: MoreHorizontal },
] as const

/** Hoarding-signboard styled top nav, desktop only (md+). Bottom tab bar stays for mobile. */
export function DesktopNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
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
  )
}
