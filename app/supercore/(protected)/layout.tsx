import Link from "next/link"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { AutoLogoutOnUnload } from "./AutoLogoutOnUnload"

const NAV = [
  { href: "/supercore/registrations", label: "Registrations" },
  { href: "/supercore/events", label: "Events" },
  { href: "/supercore/team", label: "Team" },
  { href: "/supercore/sponsors", label: "Sponsors" },
  { href: "/supercore/schedule", label: "Schedule" },
  { href: "/supercore/whitelist", label: "Whitelist" },
  { href: "/supercore/settings", label: "Settings" },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession()

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <AutoLogoutOnUnload />
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur py-3">
        <nav className="mx-auto flex max-w-[96rem] gap-1 overflow-x-auto px-5 text-xs">
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
      <main className="mx-auto max-w-[96rem] px-5 py-8">{children}</main>
    </div>
  )
}