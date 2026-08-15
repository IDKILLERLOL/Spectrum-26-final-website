import Link from "next/link"
import {
  Info,
  Heart,
  Image as ImageIcon,
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

const tiles: Tile[] = [
  { label: "About Us", href: "/more/about", icon: Info },
  { label: "Our Sponsors", href: "/more/sponsors", icon: Heart },
  { label: "Gallery", href: "/more/gallery", icon: ImageIcon },
  { label: "Contact", href: "/more/contact", icon: Mail },
]

export default function MorePage() {
  return (
    <>
      <PageHeader title="More" back={false} />
      <PageContainer width="wide" className="px-5 py-6 md:py-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {tiles.map((tile) => (
            <Link key={tile.href} href={tile.href}>
              <Card className="flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <tile.icon size={18} color={PINK} />
                <span className={`${questBody.className} flex-1 text-sm font-bold`} style={{ color: NAVY }}>
                  {tile.label}
                </span>
                <ChevronRight size={16} color={NAVY} className="opacity-40" />
              </Card>
            </Link>
          ))}
        </div>
      </PageContainer>
    </>
  )
}
