import Link from "next/link"
import { requireAdminSession } from "@/lib/auth/require-admin"

const NAV = [
  { href: "/supercore/dashboard", label: "Dashboard" },
  { href: "/supercore/registrations", label: "Registrations" },
  { href: "/supercore/events", label: "Events" },
  { href: "/supercore/schedule", label: "Schedule" },
  { href: "/supercore/winners", label: "Winners" },
  { href: "/supercore/users", label: "Users" },
  { href: "/supercore/whitelist", label: "Whitelist" },
  { href: "/supercore/audit-logs", label: "Audit Logs" },
  { href: "/supercore/settings", label: "Settings" },
]

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession()

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <span className="font-mono text-sm font-bold tracking-wide text-amber-400">SUPERCORE</span>
          <span className="text-xs text-neutral-400">{session.email}</span>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2 text-xs">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded px-3 py-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  )
}
