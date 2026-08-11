"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Gamepad2, CalendarDays, MoreHorizontal } from "lucide-react"
import { NAVY, PINK } from "./tokens"
import { questBody } from "./fonts"

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Gamepad2 },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/more", label: "More", icon: MoreHorizontal },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t-[3px] md:hidden"
      style={{ background: NAVY, borderColor: NAVY, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`${questBody.className} flex min-h-16 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] uppercase transition-colors`}
            style={{ color: active ? PINK : "rgba(255,255,255,0.6)" }}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
