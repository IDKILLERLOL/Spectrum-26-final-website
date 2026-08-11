import Link from "next/link"
import {
  Info,
  Users,
  Shield,
  Heart,
  Handshake,
  Trophy,
  Image as ImageIcon,
  HelpCircle,
  Mail,
  ChevronRight,
} from "lucide-react"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, PINK, TEAL } from "@/components/flagship/tokens"
import { questBody } from "@/components/flagship/fonts"

interface Tile {
  label: string
  href: string
  icon: typeof Info
}

const groups: { title: string; tiles: Tile[] }[] = [
  {
    title: "About Spectrum",
    tiles: [
      { label: "About Us", href: "/more/about", icon: Info },
      { label: "Our Team", href: "/more/team", icon: Users },
      { label: "Organizers", href: "/more/organizers", icon: Shield },
    ],
  },
  {
    title: "Community",
    tiles: [
      { label: "Our Sponsors", href: "/more/sponsors", icon: Heart },
      { label: "Our Partners", href: "/more/partners", icon: Handshake },
    ],
  },
  {
    title: "Legacy",
    tiles: [
      { label: "Winners & Hall of Fame", href: "/more/winners", icon: Trophy },
      { label: "Gallery", href: "/more/gallery", icon: ImageIcon },
    ],
  },
  {
    title: "Support",
    tiles: [
      { label: "FAQs", href: "/faqs", icon: HelpCircle },
      { label: "Contact", href: "/more/contact", icon: Mail },
    ],
  },
]

export default function MorePage() {
  return (
    <>
      <PageHeader title="More" back={false} />
      <PageContainer width="wide" className="px-5 py-4 md:py-8">
        <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start md:gap-6 lg:grid-cols-4">
          {groups.map((group, i) => (
            <div key={group.title} className="flex flex-col gap-2">
              {i > 0 && (
                <div
                  aria-hidden="true"
                  className="mb-1 h-0 border-t-2 border-dashed opacity-35 md:hidden"
                  style={{ borderColor: TEAL }}
                />
              )}
              <p className={`${questBody.className} text-[10px] uppercase tracking-wide opacity-60`} style={{ color: NAVY }}>
                {group.title}
              </p>
              <div className="flex flex-col gap-2">
                {group.tiles.map((tile) => (
                  <Link key={tile.href} href={tile.href}>
                    <Card className="flex items-center gap-3 p-4">
                      <tile.icon size={18} color={PINK} />
                      <span className={`${questBody.className} flex-1 text-sm font-bold`} style={{ color: NAVY }}>
                        {tile.label}
                      </span>
                      <ChevronRight size={16} color={NAVY} className="opacity-40" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </>
  )
}
